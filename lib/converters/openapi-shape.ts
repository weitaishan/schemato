// OpenAPI 3.x → 内部 Shape
// 支持 JSON 或 YAML（轻量 YAML 解析，不依赖外部包）
// 找 components.schemas，把第一个非空 schema 作为 root，其它作为 named refs

import type { Shape } from "./json-shape";
import { parseJsonSafe } from "./json-shape";

// ---- 极简 YAML → JS 对象解析 ----
// 只支持 OpenAPI 常见子集：嵌套对象、数组（- 项）、标量；
// 不支持 anchor、别名、多文档、复杂折叠字符串。

interface YamlContext {
  lines: string[];
  i: number;
}

function leadingSpaces(line: string): number {
  let n = 0;
  while (n < line.length && line[n] === " ") n++;
  return n;
}

function parseScalar(raw: string): unknown {
  const s = raw.trim();
  if (s === "" || s === "null" || s === "~") return null;
  if (s === "true") return true;
  if (s === "false") return false;
  // 数字
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s);
  // 引号字符串
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function parseYamlBlock(ctx: YamlContext, indent: number): unknown {
  // 决定是 mapping 还是 sequence
  // 找到第一行非空、缩进 >= indent
  while (ctx.i < ctx.lines.length) {
    const ln = ctx.lines[ctx.i];
    const t = ln.trim();
    if (t === "" || t.startsWith("#")) {
      ctx.i++;
      continue;
    }
    const ind = leadingSpaces(ln);
    if (ind < indent) return null;
    if (t.startsWith("- ") || t === "-") {
      return parseYamlSequence(ctx, ind);
    }
    return parseYamlMapping(ctx, ind);
  }
  return null;
}

function parseYamlMapping(ctx: YamlContext, indent: number): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  while (ctx.i < ctx.lines.length) {
    const ln = ctx.lines[ctx.i];
    const t = ln.trim();
    if (t === "" || t.startsWith("#")) {
      ctx.i++;
      continue;
    }
    const ind = leadingSpaces(ln);
    if (ind < indent) break;
    if (ind > indent) break; // shouldn't happen if called correctly
    if (t.startsWith("- ")) break;

    // key: value | key:
    const m = t.match(/^([\w$\-./]+|"[^"]+"|'[^']+')\s*:\s*(.*)$/);
    if (!m) {
      ctx.i++;
      continue;
    }
    let key = m[1];
    if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
      key = key.slice(1, -1);
    }
    const rest = m[2];
    ctx.i++;
    if (rest === "" || rest === "|" || rest === ">") {
      // 子块
      const child = parseYamlBlock(ctx, indent + 1);
      obj[key] = child;
    } else if (rest.startsWith("[") || rest.startsWith("{")) {
      // flow style: 直接当 JSON 试一下
      try {
        // 替换裸的标识符为字符串可能不可靠，但常见 [a, b] / [1,2] 多数能解析
        obj[key] = JSON.parse(rest.replace(/'/g, '"'));
      } catch {
        obj[key] = rest;
      }
    } else {
      obj[key] = parseScalar(rest);
    }
  }
  return obj;
}

function parseYamlSequence(ctx: YamlContext, indent: number): unknown[] {
  const arr: unknown[] = [];
  while (ctx.i < ctx.lines.length) {
    const ln = ctx.lines[ctx.i];
    const t = ln.trim();
    if (t === "" || t.startsWith("#")) {
      ctx.i++;
      continue;
    }
    const ind = leadingSpaces(ln);
    if (ind < indent) break;
    if (!t.startsWith("- ") && t !== "-") break;
    const rest = t === "-" ? "" : t.slice(2);
    ctx.i++;
    if (rest === "") {
      arr.push(parseYamlBlock(ctx, indent + 1));
    } else if (rest.includes(":")) {
      // 行内 mapping 起始项："- key: value"
      // 把这一行重新组合后递归 parse 一个 mapping
      // 简化：把当前行还原成一个虚拟行块去 parse
      const virtualLines = [`${" ".repeat(indent + 2)}${rest}`];
      // 把后续比 indent + 2 缩进更深的行也算进去
      const subCtx: YamlContext = { lines: virtualLines, i: 0 };
      const map = parseYamlMapping(subCtx, indent + 2) as Record<string, unknown>;
      // 继续吃后续行（属于本 sequence item）
      while (ctx.i < ctx.lines.length) {
        const ln2 = ctx.lines[ctx.i];
        const t2 = ln2.trim();
        if (t2 === "" || t2.startsWith("#")) {
          ctx.i++;
          continue;
        }
        const ind2 = leadingSpaces(ln2);
        if (ind2 <= indent) break;
        if (t2.startsWith("- ") && ind2 === indent) break;
        // 顶层 key
        if (ind2 === indent + 2) {
          const innerMap = parseYamlMapping(ctx, indent + 2) as Record<string, unknown>;
          Object.assign(map, innerMap);
        } else {
          ctx.i++;
        }
      }
      arr.push(map);
    } else {
      arr.push(parseScalar(rest));
    }
  }
  return arr;
}

function parseYaml(text: string): unknown {
  const lines = text.split("\n");
  const ctx: YamlContext = { lines, i: 0 };
  return parseYamlBlock(ctx, 0);
}

// ---- OpenAPI → JSON-Schema-like → Shape ----

interface SchemaLike {
  type?: string | string[];
  properties?: Record<string, SchemaLike>;
  required?: string[];
  items?: SchemaLike;
  enum?: unknown[];
  oneOf?: SchemaLike[];
  anyOf?: SchemaLike[];
  allOf?: SchemaLike[];
  $ref?: string;
  title?: string;
  format?: string;
  nullable?: boolean;
}

function pascalCase(s: string): string {
  return (
    s
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("") || "Type"
  );
}

function refLastSegment(ref: string): string {
  const m = ref.match(/[#/]([^/]+)$/);
  return m ? m[1] : "Ref";
}

function nodeToShape(
  node: SchemaLike,
  hint: string,
  defs: Record<string, SchemaLike>,
  visiting: Set<string>,
): Shape {
  if (!node) return { kind: "any" };

  if (node.$ref) {
    const name = refLastSegment(node.$ref);
    if (visiting.has(name)) return { kind: "object", typeName: pascalCase(name) };
    const target = defs[name];
    if (target) {
      visiting.add(name);
      const s = nodeToShape(target, name, defs, visiting);
      visiting.delete(name);
      if (s.kind === "object") s.typeName = pascalCase(name);
      return s;
    }
    return { kind: "object", typeName: pascalCase(name) };
  }

  if (node.enum && node.enum.length > 0) {
    const first = node.enum[0];
    if (typeof first === "string") return { kind: "string" };
    if (typeof first === "number") return { kind: Number.isInteger(first) ? "integer" : "number" };
    if (typeof first === "boolean") return { kind: "boolean" };
    return { kind: "any" };
  }

  const variantsList = node.oneOf ?? node.anyOf;
  if (variantsList && variantsList.length > 0) {
    return {
      kind: "union",
      variants: variantsList.map((v, i) => nodeToShape(v, hint + "Variant" + i, defs, visiting)),
    };
  }

  if (node.allOf && node.allOf.length > 0) {
    const merged: SchemaLike = {};
    for (const part of node.allOf) {
      Object.assign(merged, part);
      if (part.properties) merged.properties = { ...(merged.properties ?? {}), ...part.properties };
      if (part.required) merged.required = [...(merged.required ?? []), ...part.required];
    }
    return nodeToShape(merged, hint, defs, visiting);
  }

  let typ = node.type;
  if (Array.isArray(typ)) {
    const nonNull = typ.filter((t) => t !== "null");
    if (nonNull.length === 1) typ = nonNull[0];
    else if (nonNull.length === 0) return { kind: "null" };
    else
      return {
        kind: "union",
        variants: typ.map((t) => nodeToShape({ ...node, type: t }, hint, defs, visiting)),
      };
  }

  switch (typ) {
    case "string":
      return { kind: "string" };
    case "integer":
      return { kind: "integer" };
    case "number":
      return { kind: "number" };
    case "boolean":
      return { kind: "boolean" };
    case "null":
      return { kind: "null" };
    case "array":
      return {
        kind: "array",
        items: node.items ? nodeToShape(node.items, hint + "Item", defs, visiting) : { kind: "any" },
      };
    case "object": {
      const required = new Set(node.required ?? []);
      const fields: Record<string, { shape: Shape; optional: boolean }> = {};
      for (const [k, v] of Object.entries(node.properties ?? {})) {
        fields[k] = {
          shape: nodeToShape(v, k, defs, visiting),
          optional: !required.has(k),
        };
      }
      return { kind: "object", fields, typeName: pascalCase(node.title ?? hint) };
    }
    default:
      if (node.properties) return nodeToShape({ ...node, type: "object" }, hint, defs, visiting);
      return { kind: "any" };
  }
}

export function openapiToShape(
  input: string,
  rootName = "Root",
): { ok: true; shape: Shape } | { ok: false; error: string } {
  // 先尝试 JSON，再尝试 YAML
  let doc: unknown;
  const j = parseJsonSafe(input);
  if (j.ok) {
    doc = j.value;
  } else {
    try {
      doc = parseYaml(input);
    } catch (e) {
      return { ok: false, error: `Failed to parse OpenAPI (neither JSON nor YAML): ${(e as Error).message}` };
    }
  }
  if (!doc || typeof doc !== "object") return { ok: false, error: "Empty or invalid OpenAPI document." };

  const root = doc as { components?: { schemas?: Record<string, SchemaLike> }; definitions?: Record<string, SchemaLike> };
  const schemas: Record<string, SchemaLike> = {
    ...(root.components?.schemas ?? {}),
    ...(root.definitions ?? {}),
  };

  const names = Object.keys(schemas);
  if (names.length === 0) {
    return { ok: false, error: "No schemas found under components.schemas" };
  }

  // 选第一个 schema 作为 root；其它作为 ref 表
  const rootSchemaName = names[0];
  const rootSchema = schemas[rootSchemaName];
  void rootName;
  const shape = nodeToShape(rootSchema, rootSchemaName, schemas, new Set());
  if (shape.kind === "object") shape.typeName = pascalCase(rootSchemaName);
  return { ok: true, shape };
}
