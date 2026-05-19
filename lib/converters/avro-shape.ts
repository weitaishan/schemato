// Avro schema (.avsc) → 内部 Shape
// 支持 record / enum / array / map / union (含 null) / 基本类型 / 命名引用
// 不支持 fixed、logical types 的全部细节（fallback 为 string）

import type { Shape } from "./json-shape";
import { parseJsonSafe } from "./json-shape";

type AvroSchema =
  | string
  | AvroRecord
  | AvroArray
  | AvroMap
  | AvroEnum
  | AvroUnion
  | AvroFixed;

interface AvroRecord {
  type: "record";
  name: string;
  namespace?: string;
  fields: Array<{ name: string; type: AvroSchema; default?: unknown }>;
}
interface AvroArray { type: "array"; items: AvroSchema }
interface AvroMap { type: "map"; values: AvroSchema }
interface AvroEnum { type: "enum"; name: string; symbols: string[] }
interface AvroFixed { type: "fixed"; name: string; size: number }
type AvroUnion = AvroSchema[];

const PRIMITIVE: Record<string, Shape["kind"]> = {
  null: "null",
  boolean: "boolean",
  int: "integer",
  long: "integer",
  float: "number",
  double: "number",
  bytes: "string",
  string: "string",
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

function avroToShape(
  schema: AvroSchema,
  named: Map<string, AvroRecord>,
  visiting: Set<string>,
): { shape: Shape; nullable: boolean } {
  // string => primitive 或命名引用
  if (typeof schema === "string") {
    if (schema in PRIMITIVE) return { shape: { kind: PRIMITIVE[schema] }, nullable: schema === "null" };
    const ref = named.get(schema);
    if (ref) {
      if (visiting.has(schema)) return { shape: { kind: "object", typeName: pascalCase(schema) }, nullable: false };
      return avroToShape(ref, named, visiting);
    }
    return { shape: { kind: "any" }, nullable: false };
  }

  // 联合
  if (Array.isArray(schema)) {
    const nonNull = schema.filter((s) => s !== "null");
    const nullable = nonNull.length !== schema.length;
    if (nonNull.length === 0) return { shape: { kind: "null" }, nullable: true };
    if (nonNull.length === 1) {
      const r = avroToShape(nonNull[0], named, visiting);
      return { shape: r.shape, nullable: nullable || r.nullable };
    }
    const variants = nonNull.map((s) => avroToShape(s, named, visiting).shape);
    return { shape: { kind: "union", variants }, nullable };
  }

  // 对象
  switch (schema.type) {
    case "record": {
      const name = schema.name;
      if (visiting.has(name)) {
        return { shape: { kind: "object", typeName: pascalCase(name) }, nullable: false };
      }
      visiting.add(name);
      const fields: Record<string, { shape: Shape; optional: boolean }> = {};
      for (const f of schema.fields) {
        const child = avroToShape(f.type, named, visiting);
        fields[f.name] = {
          shape: child.shape,
          optional: child.nullable || "default" in f,
        };
      }
      visiting.delete(name);
      return {
        shape: { kind: "object", fields, typeName: pascalCase(name) },
        nullable: false,
      };
    }
    case "array": {
      const itemRes = avroToShape(schema.items, named, visiting);
      return { shape: { kind: "array", items: itemRes.shape }, nullable: false };
    }
    case "map": {
      const valRes = avroToShape(schema.values, named, visiting);
      return { shape: { kind: "array", items: valRes.shape }, nullable: false };
    }
    case "enum":
      return { shape: { kind: "string" }, nullable: false };
    case "fixed":
      return { shape: { kind: "string" }, nullable: false };
    default:
      return { shape: { kind: "any" }, nullable: false };
  }
}

function collectNamedRecords(
  schema: AvroSchema,
  out: Map<string, AvroRecord>,
): void {
  if (typeof schema === "string") return;
  if (Array.isArray(schema)) {
    for (const s of schema) collectNamedRecords(s, out);
    return;
  }
  if (schema.type === "record") {
    if (!out.has(schema.name)) out.set(schema.name, schema);
    for (const f of schema.fields) collectNamedRecords(f.type, out);
  } else if (schema.type === "array") {
    collectNamedRecords(schema.items, out);
  } else if (schema.type === "map") {
    collectNamedRecords(schema.values, out);
  }
}

export function avroToShapeEntry(
  input: string,
  rootName = "Root",
): { ok: true; shape: Shape } | { ok: false; error: string } {
  const j = parseJsonSafe(input);
  if (!j.ok) return { ok: false, error: `Invalid Avro (not JSON): ${j.error}` };
  const root = j.value as AvroSchema;
  const named = new Map<string, AvroRecord>();
  collectNamedRecords(root, named);
  const r = avroToShape(root, named, new Set());
  void rootName;
  return { ok: true, shape: r.shape };
}
