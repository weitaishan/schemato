// 转换器注册中心。每个 (from, to) 对应一个 ConvertFn。
// MVP：先实现 3 个真实可用的转换器（json→typescript / json→zod / json→pydantic），
// 其它格子返回占位 + 一个"即将上线"的提示，但页面照常生成、SEO 文案照常存在。

import type { FormatId } from "../formats";
import { jsonToTypeScript } from "./json-to-typescript";
import { jsonToZod } from "./json-to-zod";
import { jsonToPydantic } from "./json-to-pydantic";

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
