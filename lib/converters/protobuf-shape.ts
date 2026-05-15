// 极简 Protobuf .proto → 内部 Shape
// 只解析 message 块；忽略 service / rpc / option / extend / oneof（粗略当 union 处理）。

import type { Shape } from "./json-shape";

interface PbField {
  name: string;
  type: string;
  repeated: boolean;
  optional: boolean;
}
interface PbMessage {
  name: string;
  fields: PbField[];
}

const SCALAR_MAP: Record<string, Shape["kind"]> = {
  string: "string",
  bool: "boolean",
  bytes: "string",
  // 数字
  int32: "integer",
  int64: "integer",
  uint32: "integer",
  uint64: "integer",
  sint32: "integer",
  sint64: "integer",
  fixed32: "integer",
  fixed64: "integer",
  sfixed32: "integer",
  sfixed64: "integer",
  float: "number",
  double: "number",
  // Google 常见 well-known
  Timestamp: "string",
  Duration: "string",
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

function parseMessages(input: string): PbMessage[] {
  // 去注释（//... 和 /* ... */）
  const cleaned = input.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  const messages: PbMessage[] = [];
  const re = /\bmessage\s+(\w+)\s*\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cleaned)) !== null) {
    const name = m[1];
    const body = m[2];
    const fields: PbField[] = [];
    for (const line of body.split(";")) {
      const t = line.trim();
      if (!t || t.startsWith("//") || t.startsWith("option") || t.startsWith("reserved")) continue;
      // [optional|required|repeated]? type name = number;
      const fm = t.match(
        /^(?:(optional|required|repeated)\s+)?([\w.]+)\s+(\w+)\s*=\s*\d+/,
      );
      if (!fm) continue;
      const [, modifier, type, fname] = fm;
      const cleanType = type.split(".").pop() ?? type;
      fields.push({
        name: fname,
        type: cleanType,
        repeated: modifier === "repeated",
        optional: modifier === "optional", // proto3 默认所有字段都是可选的；我们依赖显式 optional 关键字标识
      });
    }
    messages.push({ name, fields });
  }
  return messages;
}

function lookupShape(typeName: string, byName: Map<string, PbMessage>, visiting: Set<string>): Shape {
  const scalar = SCALAR_MAP[typeName];
  if (scalar) return { kind: scalar };
  const msg = byName.get(typeName);
  if (!msg) return { kind: "any" }; // 未识别 enum 或外部 import
  if (visiting.has(typeName)) return { kind: "object", typeName };
  visiting.add(typeName);
  const fields: Record<string, { shape: Shape; optional: boolean }> = {};
  for (const f of msg.fields) {
    let inner = lookupShape(f.type, byName, visiting);
    if (f.repeated) inner = { kind: "array", items: inner };
    // proto3 默认值意味着大部分字段实际可空，统一标记为 optional 让生成的代码更安全
    fields[f.name] = { shape: inner, optional: true };
  }
  visiting.delete(typeName);
  return { kind: "object", fields, typeName: pascalCase(typeName) };
}

export function protobufToShape(
  input: string,
  rootName = "Root",
): { ok: true; shape: Shape } | { ok: false; error: string } {
  try {
    const messages = parseMessages(input);
    if (messages.length === 0) return { ok: false, error: "No message declarations found." };
    const byName = new Map<string, PbMessage>();
    for (const m of messages) byName.set(m.name, m);
    const shape = lookupShape(messages[0].name, byName, new Set());
    void rootName;
    return { ok: true, shape };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
