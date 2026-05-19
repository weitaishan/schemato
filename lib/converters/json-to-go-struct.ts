import type { ConvertFn, ConvertResult } from "./index";
import { collectNamedTypes, inferShape, parseJsonSafe, type Shape } from "./json-shape";

function camelToGo(s: string): string {
  // 首字母大写 + 保留驼峰
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function goType(shape: Shape): string {
  switch (shape.kind) {
    case "string": return "string";
    case "integer": return "int";
    case "number": return "float64";
    case "boolean": return "bool";
    case "null": return "interface{}";
    case "any": return "interface{}";
    case "array": return `[]${goType(shape.items ?? { kind: "any" })}`;
    case "union": return "interface{}";
    case "object": return shape.typeName ? `*${shape.typeName}` : "map[string]interface{}";
  }
}

export const jsonToGoStruct: ConvertFn = (input, opts): ConvertResult => {
  const parsed = parseJsonSafe(input);
  if (!parsed.ok) return { ok: false, code: "", error: `Invalid JSON: ${parsed.error}` };

  const rootName = opts?.rootName ?? "Root";
  const root = inferShape(parsed.value, rootName);

  if (root.kind !== "object" && root.kind !== "array") {
    return { ok: true, code: `type ${rootName} ${goType(root)}` };
  }

  const target = root.kind === "array" ? root.items ?? { kind: "any" } : root;
  const types = collectNamedTypes(target, root.kind === "array" ? rootName + "Item" : rootName);

  const blocks: string[] = ["package main", ""];
  for (const t of types) {
    const lines: string[] = [`type ${t.name} struct {`];
    for (const [k, f] of Object.entries(t.shape.fields ?? {})) {
      const fieldName = camelToGo(k);
      let typ = goType(f.shape);
      if (f.optional && !typ.startsWith("*")) typ = `*${typ}`;
      lines.push(`\t${fieldName} ${typ} \`json:"${k}${f.optional ? ",omitempty" : ""}"\``);
    }
    lines.push("}");
    blocks.push(lines.join("\n"));
  }

  if (root.kind === "array") {
    const itemName = types[types.length - 1]?.name ?? "Item";
    blocks.push(`type ${rootName} []${itemName}`);
  }

  return { ok: true, code: blocks.join("\n\n") };
};
