// Converter registry. Each (from, to) pair maps to one ConvertFn.
// All generated converter pages use this registry at runtime.

import type { FormatId } from "../formats";
import { jsonToTypeScript } from "./json-to-typescript";
import { jsonToZod } from "./json-to-zod";
import { jsonToPydantic } from "./json-to-pydantic";
import { jsonToGoStruct } from "./json-to-go-struct";
import { jsonToSwift } from "./json-to-swift";
import { jsonToKotlin } from "./json-to-kotlin";
import { jsonToRustStruct } from "./json-to-rust-struct";
import { jsonToJava } from "./json-to-java";
import { jsonToCsharp } from "./json-to-csharp";
import { jsonToDart } from "./json-to-dart";
import { jsonToYup } from "./json-to-yup";
import { jsonToJoi } from "./json-to-joi";
import { jsonToPythonDataclass } from "./json-to-python-dataclass";
import { jsonToPhp } from "./json-to-php";
import { jsonToRuby } from "./json-to-ruby";

import { jsonSchemaToShape } from "./jsonschema-shape";
import { graphqlToShape } from "./graphql-shape";
import { sqlToShape } from "./sql-shape";
import { typescriptToShape } from "./typescript-shape";
import { protobufToShape } from "./protobuf-shape";
import { prismaToShape } from "./prisma-shape";
import { openapiToShape } from "./openapi-shape";
import { mongooseToShape } from "./mongoose-shape";
import { avroToShapeEntry } from "./avro-shape";
import { RENDERERS } from "./renderers";

export interface ConvertResult {
  ok: boolean;
  /** Generated code */
  code: string;
  /** Error message when ok=false */
  error?: string;
}

export type ConvertFn = (input: string, opts?: { rootName?: string }) => ConvertResult;

const REGISTRY = new Map<string, ConvertFn>();

function key(from: FormatId, to: FormatId) {
  return `${from}->${to}`;
}

export function register(from: FormatId, to: FormatId, fn: ConvertFn) {
  REGISTRY.set(key(from, to), fn);
}

export function getConverter(from: FormatId, to: FormatId): ConvertFn | null {
  return REGISTRY.get(key(from, to)) ?? null;
}

export function hasConverter(from: FormatId, to: FormatId): boolean {
  return REGISTRY.has(key(from, to));
}

// -----------------------------------------------------------------
// JSON → all 15 outputs
// -----------------------------------------------------------------
register("json", "typescript", jsonToTypeScript);
register("json", "zod", jsonToZod);
register("json", "pydantic", jsonToPydantic);
register("json", "go-struct", jsonToGoStruct);
register("json", "swift", jsonToSwift);
register("json", "kotlin", jsonToKotlin);
register("json", "rust-struct", jsonToRustStruct);
register("json", "java", jsonToJava);
register("json", "csharp", jsonToCsharp);
register("json", "dart", jsonToDart);
register("json", "yup", jsonToYup);
register("json", "joi", jsonToJoi);
register("json", "python-dataclass", jsonToPythonDataclass);
register("json", "php", jsonToPhp);
register("json", "ruby", jsonToRuby);

// -----------------------------------------------------------------
// Generic bridge: parser(input) → Shape → target renderer.
// Non-JSON input formats share this path.
// -----------------------------------------------------------------
type Parser = (input: string, rootName: string) =>
  | { ok: true; shape: import("./json-shape").Shape }
  | { ok: false; error: string };

function bridge(parser: Parser, target: FormatId): ConvertFn {
  return (input, opts) => {
    const r = parser(input, opts?.rootName ?? "Root");
    if (!r.ok) return { ok: false, code: "", error: r.error };
    const renderer = RENDERERS[target];
    if (!renderer) return { ok: false, code: "", error: `No renderer registered for ${target}` };
    try {
      const code = renderer(r.shape, opts?.rootName ?? (r.shape.kind === "object" ? r.shape.typeName ?? "Root" : "Root"));
      return { ok: true, code };
    } catch (e) {
      return { ok: false, code: "", error: (e as Error).message };
    }
  };
}

// JSON Schema → all 15 outputs
const ALL_TARGETS: FormatId[] = [
  "typescript", "zod", "pydantic", "python-dataclass",
  "go-struct", "rust-struct", "swift", "kotlin", "java", "csharp", "dart",
  "yup", "joi", "php", "ruby",
];
for (const t of ALL_TARGETS) {
  register("json-schema", t, bridge(jsonSchemaToShape, t));
}

// GraphQL → all 15 outputs
for (const t of ALL_TARGETS) {
  register("graphql", t, bridge(graphqlToShape, t));
}

// SQL DDL → all 15 outputs
for (const t of ALL_TARGETS) {
  register("sql", t, bridge(sqlToShape, t));
}

// TypeScript input → all outputs except TypeScript itself
for (const t of ALL_TARGETS) {
  if (t === "typescript") continue;
  register("typescript", t, bridge(typescriptToShape, t));
}

// Protobuf → all 15 outputs
for (const t of ALL_TARGETS) {
  register("protobuf", t, bridge(protobufToShape, t));
}

// Prisma schema → all 15 outputs
for (const t of ALL_TARGETS) {
  register("prisma", t, bridge(prismaToShape, t));
}

// OpenAPI 3.x → all 15 outputs (JSON or YAML)
for (const t of ALL_TARGETS) {
  register("openapi", t, bridge(openapiToShape, t));
}

// Mongoose schema → all 15 outputs
for (const t of ALL_TARGETS) {
  register("mongoose", t, bridge(mongooseToShape, t));
}

// Avro (.avsc) → all 15 outputs
for (const t of ALL_TARGETS) {
  register("avro", t, bridge(avroToShapeEntry, t));
}
