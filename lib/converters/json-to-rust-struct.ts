import type { ConvertFn, ConvertResult } from "./index";
import { collectNamedTypes, inferShape, parseJsonSafe, type Shape } from "./json-shape";

function snakeCase(s: string): string {
  return s.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
}

function rustType(shape: Shape): string {
  switch (shape.kind) {
    case "string": return "String";
    case "integer": return "i64";
    case "number": return "f64";
    case "boolean": return "bool";
    case "null": return "serde_json::Value";
    case "any": return "serde_json::Value";
    case "array": return `Vec<${rustType(shape.items ?? { kind: "any" })}>`;
    case "union": return "serde_json::Value";
    case "object": return shape.typeName ?? "serde_json::Value";
  }
}

export const jsonToRustStruct: ConvertFn = (input, opts): ConvertResult => {
  const parsed = parseJsonSafe(input);
  if (!parsed.ok) return { ok: false, code: "", error: `Invalid JSON: ${parsed.error}` };

  const rootName = opts?.rootName ?? "Root";
  const root = inferShape(parsed.value, rootName);

  if (root.kind !== "object" && root.kind !== "array") {
    return { ok: true, code: `type ${rootName} = ${rustType(root)};` };
  }

  const target = root.kind === "array" ? root.items ?? { kind: "any" } : root;
  const types = collectNamedTypes(target, root.kind === "array" ? rootName + "Item" : rootName);

  const blocks: string[] = ["use serde::{Deserialize, Serialize};", ""];
  for (const t of types) {
    const lines: string[] = [
      "#[derive(Debug, Clone, Serialize, Deserialize)]",
      `pub struct ${t.name} {`,
    ];
    for (const [k, f] of Object.entries(t.shape.fields ?? {})) {
      const field = snakeCase(k);
      let typ = rustType(f.shape);
      if (f.optional) typ = `Option<${typ}>`;
      if (field !== k) {
        lines.push(`    #[serde(rename = "${k}")]`);
      }
      if (f.optional) {
        lines.push(`    #[serde(skip_serializing_if = "Option::is_none")]`);
      }
      lines.push(`    pub ${field}: ${typ},`);
    }
    lines.push("}");
    blocks.push(lines.join("\n"));
  }

  if (root.kind === "array") {
    const itemName = types[types.length - 1]?.name ?? "Item";
    blocks.push(`pub type ${rootName} = Vec<${itemName}>;`);
  }

  return { ok: true, code: blocks.join("\n\n") };
};
