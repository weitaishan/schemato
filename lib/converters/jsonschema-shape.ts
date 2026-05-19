// JSON Schema (Draft-07 / 2020-12 子集) → 内部 Shape
// 复用 json-shape.ts 里定义的 Shape 类型，让所有 json-to-* adapter 都能直接复用。
// 不依赖外部库；不实现 $ref 跨文件解析；只解析常用关键字。

import { parseJsonSafe, type Shape } from "./json-shape";

interface JsonSchemaNode {
  type?: string | string[];
  properties?: Record<string, JsonSchemaNode>;
  required?: string[];
  items?: JsonSchemaNode;
  enum?: unknown[];
  oneOf?: JsonSchemaNode[];
  anyOf?: JsonSchemaNode[];
  allOf?: JsonSchemaNode[];
  $ref?: string;
  title?: string;
  format?: string;
  nullable?: boolean;
  additionalProperties?: boolean | JsonSchemaNode;
  definitions?: Record<string, JsonSchemaNode>;
  $defs?: Record<string, JsonSchemaNode>;
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
  node: JsonSchemaNode,
  hint: string,
  defs: Record<string, JsonSchemaNode>,
  visiting: Set<string>,
): Shape {
  if (!node) return { kind: "any" };

  // $ref
  if (node.$ref) {
    const name = refLastSegment(node.$ref);
    if (visiting.has(name)) {
      // 循环引用：返回一个 object 占位，typeName 指向已定义的 type
      return { kind: "object", typeName: pascalCase(name) };
    }
    const target = defs[name];
    if (target) {
      visiting.add(name);
      const s = nodeToShape(target, name, defs, visiting);
      visiting.delete(name);
      // 把 typeName 标到 object 上以便后续 collect 时复用名字
      if (s.kind === "object") s.typeName = pascalCase(name);
      return s;
    }
    return { kind: "object", typeName: pascalCase(name) };
  }

  // enum：取首元素的类型作为简化（避免引入 enum kind）
  if (node.enum && node.enum.length > 0) {
    const first = node.enum[0];
    if (typeof first === "string") return { kind: "string" };
    if (typeof first === "number")
      return { kind: Number.isInteger(first) ? "integer" : "number" };
    if (typeof first === "boolean") return { kind: "boolean" };
    return { kind: "any" };
  }

  // oneOf / anyOf：union
  const variantsList = node.oneOf ?? node.anyOf;
  if (variantsList && variantsList.length > 0) {
    const variants = variantsList.map((v, i) => nodeToShape(v, hint + "Variant" + i, defs, visiting));
    return { kind: "union", variants };
  }

  // allOf：合并第一个对象（简化处理，不做严格合并）
  if (node.allOf && node.allOf.length > 0) {
    const merged: JsonSchemaNode = {};
    for (const part of node.allOf) {
      Object.assign(merged, part);
      if (part.properties) {
        merged.properties = { ...(merged.properties ?? {}), ...part.properties };
      }
      if (part.required) {
        merged.required = [...(merged.required ?? []), ...part.required];
      }
    }
    return nodeToShape(merged, hint, defs, visiting);
  }

  // type 数组（如 ["string", "null"]）→ 标记为可空 + 主类型
  let typ = node.type;
  if (Array.isArray(typ)) {
    const nonNull = typ.filter((t) => t !== "null");
    if (nonNull.length === 1) {
      typ = nonNull[0];
    } else if (nonNull.length === 0) {
      return { kind: "null" };
    } else {
      const variants = typ.map((t) => nodeToShape({ ...node, type: t }, hint, defs, visiting));
      return { kind: "union", variants };
    }
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
    default: {
      // 没写 type 但有 properties → 当 object 处理
      if (node.properties) {
        return nodeToShape({ ...node, type: "object" }, hint, defs, visiting);
      }
      return { kind: "any" };
    }
  }
}

/**
 * 把 JSON Schema 字符串解析成内部 Shape。
 * 默认从 root 开始，definitions / $defs 作为命名类型表参与解析。
 */
export function jsonSchemaToShape(
  input: string,
  rootName = "Root",
): { ok: true; shape: Shape } | { ok: false; error: string } {
  const parsed = parseJsonSafe(input);
  if (!parsed.ok) return { ok: false, error: `Invalid JSON Schema (not JSON): ${parsed.error}` };

  const root = parsed.value as JsonSchemaNode;
  const defs: Record<string, JsonSchemaNode> = {
    ...(root.definitions ?? {}),
    ...(root.$defs ?? {}),
  };
  const shape = nodeToShape(root, rootName, defs, new Set());
  return { ok: true, shape };
}
