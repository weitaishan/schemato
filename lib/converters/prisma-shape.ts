// 极简 Prisma schema → 内部 Shape
// 只解析 model 块；忽略 enum、generator、datasource、@@ block 属性。

import type { Shape } from "./json-shape";

interface PrismaField {
  name: string;
  type: string;
  optional: boolean;
  isList: boolean;
}
interface PrismaModel {
  name: string;
  fields: PrismaField[];
}

const SCALAR_MAP: Record<string, Shape["kind"]> = {
  String: "string",
  Boolean: "boolean",
  Int: "integer",
  BigInt: "integer",
  Float: "number",
  Decimal: "number",
  DateTime: "string",
  Json: "any",
  Bytes: "string",
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

function parseModel(name: string, body: string): PrismaModel {
  const fields: PrismaField[] = [];
  for (const line of body.split("\n")) {
    const stripped = line.replace(/\/\/.*$/, "").trim();
    if (!stripped) continue;
    if (stripped.startsWith("@@")) continue;
    // 字段：fieldName Type[?|[]]  attrs?
    const m = stripped.match(/^(\w+)\s+([A-Za-z][\w]*)(\?|\[\])?/);
    if (!m) continue;
    const [, fname, ftype, modifier] = m;
    const optional = modifier === "?";
    const isList = modifier === "[]";
    fields.push({ name: fname, type: ftype, optional, isList });
  }
  return { name, fields };
}

function parseSchema(input: string): PrismaModel[] {
  const models: PrismaModel[] = [];
  const re = /\bmodel\s+(\w+)\s*\{([^}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input)) !== null) {
    models.push(parseModel(m[1], m[2]));
  }
  return models;
}

function lookupShape(typeName: string, byName: Map<string, PrismaModel>, visiting: Set<string>): Shape {
  const scalar = SCALAR_MAP[typeName];
  if (scalar) return { kind: scalar };
  const m = byName.get(typeName);
  if (!m) return { kind: "any" }; // 未识别 enum 等
  if (visiting.has(typeName)) return { kind: "object", typeName };
  visiting.add(typeName);
  const fields: Record<string, { shape: Shape; optional: boolean }> = {};
  for (const f of m.fields) {
    let inner = lookupShape(f.type, byName, visiting);
    if (f.isList) inner = { kind: "array", items: inner };
    fields[f.name] = { shape: inner, optional: f.optional };
  }
  visiting.delete(typeName);
  return { kind: "object", fields, typeName: pascalCase(typeName) };
}

export function prismaToShape(
  input: string,
  rootName = "Root",
): { ok: true; shape: Shape } | { ok: false; error: string } {
  try {
    const models = parseSchema(input);
    if (models.length === 0) return { ok: false, error: "No model declarations found." };
    const byName = new Map<string, PrismaModel>();
    for (const m of models) byName.set(m.name, m);
    const shape = lookupShape(models[0].name, byName, new Set());
    void rootName;
    return { ok: true, shape };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
