import type { ConvertFn, ConvertResult } from "./index";
import { collectNamedTypes, inferShape, parseJsonSafe, type Shape } from "./json-shape";

function javaType(shape: Shape): string {
  switch (shape.kind) {
    case "string": return "String";
    case "integer": return "int";
    case "number": return "double";
    case "boolean": return "boolean";
    case "null": return "Object";
    case "any": return "Object";
    case "array": return `List<${javaBoxed(shape.items ?? { kind: "any" })}>`;
    case "union": return "Object";
    case "object": return shape.typeName ?? "Map<String, Object>";
  }
}

function javaBoxed(shape: Shape): string {
  const t = javaType(shape);
  switch (t) {
    case "int": return "Integer";
    case "double": return "Double";
    case "boolean": return "Boolean";
    default: return t;
  }
}

export const jsonToJava: ConvertFn = (input, opts): ConvertResult => {
  const parsed = parseJsonSafe(input);
  if (!parsed.ok) return { ok: false, code: "", error: `Invalid JSON: ${parsed.error}` };

  const rootName = opts?.rootName ?? "Root";
  const root = inferShape(parsed.value, rootName);

  if (root.kind !== "object" && root.kind !== "array") {
    return { ok: true, code: `// ${rootName} is a simple ${javaType(root)}` };
  }

  const target = root.kind === "array" ? root.items ?? { kind: "any" } : root;
  const types = collectNamedTypes(target, root.kind === "array" ? rootName + "Item" : rootName);

  const blocks: string[] = ["import java.util.List;", ""];
  for (const t of types) {
    const fields = Object.entries(t.shape.fields ?? {});
    const params = fields.map(([k, f]) => {
      let typ = javaType(f.shape);
      if (f.optional) typ = javaBoxed(f.shape);
      return `    ${typ} ${k}`;
    });
    blocks.push(`public record ${t.name}(\n${params.join(",\n")}\n) {}`);
  }

  if (root.kind === "array") {
    const itemName = types[types.length - 1]?.name ?? "Item";
    blocks.push(`// ${rootName} = List<${itemName}>`);
  }

  return { ok: true, code: blocks.join("\n\n") };
};
