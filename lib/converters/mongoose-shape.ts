// Mongoose Schema → 内部 Shape
// 解析 `new Schema({ ... })` 或 `mongoose.Schema({ ... })` 或纯对象字面量。
// 简化处理：不解析嵌套 Schema 引用、不处理 ObjectId 关系，只看字段定义。

import type { Shape } from "./json-shape";

const TYPE_MAP: Record<string, Shape["kind"]> = {
  String: "string",
  Number: "number",
  Boolean: "boolean",
  Date: "string",
  Buffer: "string",
  ObjectId: "string",
  Mixed: "any",
  Map: "any",
  Decimal128: "number",
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

// 把字段值（可能是: type、{type, required, ...}、[type]、[{...}]）映射为 shape 描述
function valueToShape(raw: string): { shape: Shape; required: boolean } {
  const trimmed = raw.trim();

  // 数组形式 [X]
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const inner = trimmed.slice(1, -1).trim();
    const innerRes = valueToShape(inner);
    return { shape: { kind: "array", items: innerRes.shape }, required: false };
  }

  // 对象形式 { type: X, required: true, ... }
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    const body = trimmed.slice(1, -1);
    const tm = body.match(/\btype\s*:\s*([\w.]+|\[[^\]]*\])/);
    const typeStr = tm ? tm[1] : "Mixed";
    const required = /\brequired\s*:\s*true\b/.test(body);
    const inner = valueToShape(typeStr);
    return { shape: inner.shape, required };
  }

  // 简单类型名
  // 处理 mongoose.Schema.Types.ObjectId / Schema.Types.ObjectId
  const last = trimmed.split(".").pop() ?? trimmed;
  const kind = TYPE_MAP[last] ?? "any";
  return { shape: { kind }, required: false };
}

// 简单 brace 匹配 splitter：在顶层 { ... } 内按逗号切，忽略嵌套括号
function splitTopLevel(body: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let buf = "";
  for (const ch of body) {
    if (ch === "{" || ch === "[" || ch === "(") depth++;
    if (ch === "}" || ch === "]" || ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(buf.trim());
      buf = "";
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) parts.push(buf.trim());
  return parts;
}

function findSchemaBlock(input: string): string | null {
  // 尝试三种入口：
  // 1) new Schema({ ... })
  // 2) new mongoose.Schema({ ... })
  // 3) 顶层 { ... }（裸对象字面量）
  const cleaned = input
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");

  const m =
    cleaned.match(/new\s+(?:mongoose\.)?Schema\s*\(\s*\{([\s\S]*?)\}\s*[,)]/) ||
    cleaned.match(/Schema\s*\(\s*\{([\s\S]*?)\}\s*[,)]/);
  if (m) return m[1];

  // fallback：第一个 { 到匹配的 }
  const start = cleaned.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < cleaned.length; i++) {
    if (cleaned[i] === "{") depth++;
    else if (cleaned[i] === "}") {
      depth--;
      if (depth === 0) return cleaned.slice(start + 1, i);
    }
  }
  return null;
}

export function mongooseToShape(
  input: string,
  rootName = "Root",
): { ok: true; shape: Shape } | { ok: false; error: string } {
  try {
    const body = findSchemaBlock(input);
    if (!body) return { ok: false, error: "Could not locate a Mongoose Schema literal." };

    const parts = splitTopLevel(body);
    const fields: Record<string, { shape: Shape; optional: boolean }> = {};
    for (const part of parts) {
      // key: value
      const m = part.match(/^([`"']?)([\w$]+)\1\s*:\s*([\s\S]+)$/);
      if (!m) continue;
      const fname = m[2];
      const value = m[3].trim();
      const r = valueToShape(value);
      fields[fname] = { shape: r.shape, optional: !r.required };
    }
    if (Object.keys(fields).length === 0) {
      return { ok: false, error: "No fields parsed from Schema literal." };
    }
    return {
      ok: true,
      shape: { kind: "object", fields, typeName: pascalCase(rootName) },
    };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
