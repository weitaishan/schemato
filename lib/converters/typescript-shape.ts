// 极简 TypeScript interface / type → 内部 Shape
// 仅支持 interface { ... } 和 type X = { ... } 的对象类型。
// 不支持：泛型、条件类型、模板字面量、keyof、infer 等高级特性。

import type { Shape } from "./json-shape";

interface TsField {
  name: string;
  type: string;
  optional: boolean;
}
interface TsType {
  name: string;
  fields: TsField[];
}

const SCALAR_MAP: Record<string, Shape["kind"]> = {
  string: "string",
  number: "number",
  boolean: "boolean",
  null: "null",
  undefined: "null",
  any: "any",
  unknown: "any",
  void: "any",
  bigint: "integer",
  Date: "string",
};

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

function parseFieldType(rawType: string): { core: string; isArray: boolean; isUnionWithNull: boolean } {
  let s = rawType.trim();
  // 去掉行尾分号
  if (s.endsWith(";")) s = s.slice(0, -1).trim();
  let isUnionWithNull = false;
  // 拆 "X | null" / "X | undefined"
  const parts = s.split("|").map((p) => p.trim());
  const nonNull = parts.filter((p) => p !== "null" && p !== "undefined");
  if (nonNull.length !== parts.length) isUnionWithNull = true;
  if (nonNull.length === 0) return { core: "null", isArray: false, isUnionWithNull };
  if (nonNull.length === 1) {
    s = nonNull[0];
  } else {
    // 多类型 union 简化：取第一个
    s = nonNull[0];
  }
  let isArray = false;
  // T[] 或 Array<T>
  if (s.endsWith("[]")) {
    isArray = true;
    s = s.slice(0, -2).trim();
  } else {
    const am = s.match(/^Array<(.+)>$/);
    if (am) {
      isArray = true;
      s = am[1].trim();
    }
  }
  return { core: s, isArray, isUnionWithNull };
}

function parseSource(input: string): TsType[] {
  // 去注释
  const cleaned = input
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");

  const types: TsType[] = [];
  // interface Foo { ... }
  const ifaceRe = /\binterface\s+(\w+)(?:\s+extends\s+[^{]+)?\s*\{([^}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = ifaceRe.exec(cleaned)) !== null) {
    types.push({ name: m[1], fields: parseBody(m[2]) });
  }
  // type Foo = { ... }
  const typeRe = /\btype\s+(\w+)\s*=\s*\{([^}]*)\}\s*;?/g;
  while ((m = typeRe.exec(cleaned)) !== null) {
    types.push({ name: m[1], fields: parseBody(m[2]) });
  }
  return types;
}

function parseBody(body: string): TsField[] {
  const fields: TsField[] = [];
  // 按 ;/换行 分隔
  for (const part of body.split(/[;\n]/)) {
    const t = part.trim();
    if (!t) continue;
    // name?: type   或者  name: type   或者  "key": type
    const fm = t.match(/^(["']?)([\w$]+)\1\s*(\?)?\s*:\s*(.+)$/);
    if (!fm) continue;
    const fname = fm[2];
    const optional = fm[3] === "?";
    const ftype = fm[4].trim().replace(/,$/, "");
    fields.push({ name: fname, type: ftype, optional });
  }
  return fields;
}

function lookupShape(typeName: string, byName: Map<string, TsType>, visiting: Set<string>): Shape {
  const scalar = SCALAR_MAP[typeName];
  if (scalar) return { kind: scalar };
  const t = byName.get(typeName);
  if (!t) return { kind: "any" };
  if (visiting.has(typeName)) return { kind: "object", typeName };
  visiting.add(typeName);
  const fields: Record<string, { shape: Shape; optional: boolean }> = {};
  for (const f of t.fields) {
    const parsed = parseFieldType(f.type);
    let inner: Shape;
    if (parsed.core === "null") inner = { kind: "null" };
    else inner = lookupShape(parsed.core, byName, visiting);
    if (parsed.isArray) inner = { kind: "array", items: inner };
    fields[f.name] = {
      shape: inner,
      optional: f.optional || parsed.isUnionWithNull,
    };
  }
  visiting.delete(typeName);
  return { kind: "object", fields, typeName: pascalCase(typeName) };
}

export function typescriptToShape(
  input: string,
  rootName = "Root",
): { ok: true; shape: Shape } | { ok: false; error: string } {
  try {
    const types = parseSource(input);
    if (types.length === 0) return { ok: false, error: "No interface or type alias found." };
    const byName = new Map<string, TsType>();
    for (const t of types) byName.set(t.name, t);
    const shape = lookupShape(types[0].name, byName, new Set());
    void rootName;
    return { ok: true, shape };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
