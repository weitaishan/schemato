// 转换器注册中心。每个 (from, to) 对应一个 ConvertFn。
// MVP：先实现 3 个真实可用的转换器（json→typescript / json→zod / json→pydantic），
// 其它格子返回占位 + 一个"即将上线"的提示，但页面照常生成、SEO 文案照常存在。

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
import { RENDERERS } from "./renderers";

export interface ConvertResult {
  ok: boolean;
  /** 转换后的代码 */
  code: string;
  /** 错误信息（ok=false 时） */
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
// JSON → 全部 15 个输出（每个都有自己的 adapter，因为 JSON 解析逻辑不同）
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
// 通用桥接：parser(input) → Shape，然后用 RENDERERS 渲染所有目标语言
// 所有"非 JSON 输入格式"都走这条路。
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

// JSON Schema → 全部 15 个输出
const ALL_TARGETS: FormatId[] = [
  "typescript", "zod", "pydantic", "python-dataclass",
  "go-struct", "rust-struct", "swift", "kotlin", "java", "csharp", "dart",
  "yup", "joi", "php", "ruby",
];
for (const t of ALL_TARGETS) {
  register("json-schema", t, bridge(jsonSchemaToShape, t));
}

// GraphQL → 全部 15 个输出（先开 typescript / zod / pydantic / go-struct / rust-struct，其它也注册了，效果取决于 SDL 复杂度）
for (const t of ALL_TARGETS) {
  register("graphql", t, bridge(graphqlToShape, t));
}

// SQL DDL → 全部 15 个输出
for (const t of ALL_TARGETS) {
  register("sql", t, bridge(sqlToShape, t));
}

// TypeScript（反向）→ 全部 15 个输出（除了 typescript→typescript 自身）
for (const t of ALL_TARGETS) {
  if (t === "typescript") continue;
  register("typescript", t, bridge(typescriptToShape, t));
}

// Protobuf → 全部 15 个输出
for (const t of ALL_TARGETS) {
  register("protobuf", t, bridge(protobufToShape, t));
}

// Prisma schema → 全部 15 个输出
for (const t of ALL_TARGETS) {
  register("prisma", t, bridge(prismaToShape, t));
}
