// 极简 GraphQL SDL → 内部 Shape
// 只处理 type / input / interface 的对象类型；不解析 union / enum / 自定义 scalar。
// 不依赖外部 graphql 包，正则解析（足够覆盖 80% 的 SDL）。

import type { Shape } from "./json-shape";

interface RawType {
  name: string;
  fields: Array<{ name: string; type: string; required: boolean; isList: boolean }>;
}

const SCALAR_MAP: Record<string, Shape["kind"]> = {
  String: "string",
  ID: "string",
  Int: "integer",
  Float: "number",
  Boolean: "boolean",
  Date: "string",
  DateTime: "string",
  Time: "string",
  JSON: "any",
};

function parseFieldType(raw: string): { type: string; required: boolean; isList: boolean } {
  let s = raw.trim();
  let required = false;
  let isList = false;
  if (s.endsWith("!")) {
    required = true;
    s = s.slice(0, -1).trim();
  }
  if (s.startsWith("[") && s.endsWith("]")) {
    isList = true;
    s = s.slice(1, -1).trim();
    if (s.endsWith("!")) s = s.slice(0, -1).trim();
  }
  return { type: s, required, isList };
}

function parseSDL(sdl: string): RawType[] {
  // 去注释
  const cleaned = sdl
    .split("\n")
    .map((line) => line.replace(/#.*$/, ""))
    .join("\n");

  const types: RawType[] = [];
  const re = /\b(?:type|input|interface)\s+(\w+)(?:\s+implements[^\{]+)?\s*\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(cleaned)) !== null) {
    const name = m[1];
    const body = m[2];
    const fields: RawType["fields"] = [];
    for (const line of body.split("\n")) {
      const fm = line.match(/^\s*(\w+)\s*(?:\([^)]*\))?\s*:\s*(.+?)\s*$/);
      if (!fm) continue;
      const fieldName = fm[1];
      const ft = parseFieldType(fm[2]);
      fields.push({ name: fieldName, type: ft.type, required: ft.required, isList: ft.isList });
    }
    types.push({ name, fields });
  }
  return types;
}

function lookupShape(typeName: string, byName: Map<string, RawType>, visiting: Set<string>): Shape {
  const scalar = SCALAR_MAP[typeName];
  if (scalar) return { kind: scalar };
  const t = byName.get(typeName);
  if (!t) return { kind: "any" }; // 未识别的 enum / 自定义 scalar
  if (visiting.has(typeName)) {
    return { kind: "object", typeName };
  }
  visiting.add(typeName);
  const fields: Record<string, { shape: Shape; optional: boolean }> = {};
  for (const f of t.fields) {
    let inner: Shape = lookupShape(f.type, byName, visiting);
    if (f.isList) inner = { kind: "array", items: inner };
    fields[f.name] = { shape: inner, optional: !f.required };
  }
  visiting.delete(typeName);
  return { kind: "object", fields, typeName };
}

export function graphqlToShape(
  input: string,
  rootName = "Root",
): { ok: true; shape: Shape } | { ok: false; error: string } {
  try {
    const types = parseSDL(input);
    if (types.length === 0) {
      return { ok: false, error: "No type/input/interface declarations found." };
    }
    const byName = new Map<string, RawType>();
    for (const t of types) byName.set(t.name, t);
    // 选第一个非 Query/Mutation/Subscription 的 type 作为 root；如果都是这些，就选第一个
    const rootType =
      types.find((t) => !["Query", "Mutation", "Subscription"].includes(t.name)) ?? types[0];
    const shape = lookupShape(rootType.name, byName, new Set());
    if (shape.kind === "object") shape.typeName = rootType.name;
    void rootName; // rootName 仅作 fallback，实际用 SDL 的类型名
    return { ok: true, shape };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
