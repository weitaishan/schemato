import type { ConvertFn, ConvertResult } from "./index";
import { collectNamedTypes, inferShape, parseJsonSafe, type Shape } from "./json-shape";

function csType(shape: Shape): string {
  switch (shape.kind) {
    case "string": return "string";
    case "integer": return "int";
    case "number": return "double";
    case "boolean": return "bool";
    case "null": return "object";
    case "any": return "object";
    case "array": return `List<${csType(shape.items ?? { kind: "any" })}>`;
    case "union": return "object";
    case "object": return shape.typeName ?? "Dictionary<string, object>";
  }
}

function pascal(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const jsonToCsharp: ConvertFn = (input, opts): ConvertResult => {
  const parsed = parseJsonSafe(input);
  if (!parsed.ok) return { ok: false, code: "", error: `Invalid JSON: ${parsed.error}` };

  const rootName = opts?.rootName ?? "Root";
  const root = inferShape(parsed.value, rootName);

  if (root.kind !== "object" && root.kind !== "array") {
    return { ok: true, code: `// ${rootName} = ${csType(root)}` };
  }

  const target = root.kind === "array" ? root.items ?? { kind: "any" } : root;
  const types = collectNamedTypes(target, root.kind === "array" ? rootName + "Item" : rootName);

  const blocks: string[] = ["using System.Text.Json.Serialization;", ""];
  for (const t of types) {
    const fields = Object.entries(t.shape.fields ?? {});
    const params = fields.map(([k, f]) => {
      let typ = csType(f.shape);
      if (f.optional) typ += "?";
      return `    ${typ} ${pascal(k)}`;
    });
    blocks.push(`public record ${t.name}(\n${params.join(",\n")}\n);`);
  }

  if (root.kind === "array") {
    const itemName = types[types.length - 1]?.name ?? "Item";
    blocks.push(`// ${rootName} = List<${itemName}>`);
  }

  return { ok: true, code: blocks.join("\n\n") };
};
