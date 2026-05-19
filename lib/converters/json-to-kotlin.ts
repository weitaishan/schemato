import type { ConvertFn, ConvertResult } from "./index";
import { collectNamedTypes, inferShape, parseJsonSafe, type Shape } from "./json-shape";

function ktType(shape: Shape): string {
  switch (shape.kind) {
    case "string": return "String";
    case "integer": return "Int";
    case "number": return "Double";
    case "boolean": return "Boolean";
    case "null": return "Any?";
    case "any": return "Any";
    case "array": return `List<${ktType(shape.items ?? { kind: "any" })}>`;
    case "union": return "Any";
    case "object": return shape.typeName ?? "Map<String, Any>";
  }
}

export const jsonToKotlin: ConvertFn = (input, opts): ConvertResult => {
  const parsed = parseJsonSafe(input);
  if (!parsed.ok) return { ok: false, code: "", error: `Invalid JSON: ${parsed.error}` };

  const rootName = opts?.rootName ?? "Root";
  const root = inferShape(parsed.value, rootName);

  if (root.kind !== "object" && root.kind !== "array") {
    return { ok: true, code: `typealias ${rootName} = ${ktType(root)}` };
  }

  const target = root.kind === "array" ? root.items ?? { kind: "any" } : root;
  const types = collectNamedTypes(target, root.kind === "array" ? rootName + "Item" : rootName);

  const blocks: string[] = [];
  for (const t of types) {
    const params = Object.entries(t.shape.fields ?? {}).map(([k, f]) => {
      let typ = ktType(f.shape);
      if (f.optional) typ += "?";
      const def = f.optional ? " = null" : "";
      return `    val ${k}: ${typ}${def}`;
    });
    blocks.push(`data class ${t.name}(\n${params.join(",\n")}\n)`);
  }

  if (root.kind === "array") {
    const itemName = types[types.length - 1]?.name ?? "Item";
    blocks.push(`typealias ${rootName} = List<${itemName}>`);
  }

  return { ok: true, code: blocks.join("\n\n") };
};
