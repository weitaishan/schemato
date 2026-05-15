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
import { jsonschemaToTypeScript } from "./jsonschema-to-typescript";
import { jsonschemaToZod } from "./jsonschema-to-zod";
import { jsonschemaToPydantic } from "./jsonschema-to-pydantic";

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

// ---- 注册 MVP 转换器 ----
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

// json-schema → X
register("json-schema", "typescript", jsonschemaToTypeScript);
register("json-schema", "zod", jsonschemaToZod);
register("json-schema", "pydantic", jsonschemaToPydantic);
