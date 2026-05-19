import type { ConvertFn, ConvertResult } from "./index";
import { collectNamedTypes, inferShape, parseJsonSafe, type Shape } from "./json-shape";

function dartType(shape: Shape): string {
  switch (shape.kind) {
    case "string": return "String";
    case "integer": return "int";
    case "number": return "double";
    case "boolean": return "bool";
    case "null": return "dynamic";
    case "any": return "dynamic";
    case "array": return `List<${dartType(shape.items ?? { kind: "any" })}>`;
    case "union": return "dynamic";
    case "object": return shape.typeName ?? "Map<String, dynamic>";
  }
}

export const jsonToDart: ConvertFn = (input, opts): ConvertResult => {
  const parsed = parseJsonSafe(input);
  if (!parsed.ok) return { ok: false, code: "", error: `Invalid JSON: ${parsed.error}` };

  const rootName = opts?.rootName ?? "Root";
  const root = inferShape(parsed.value, rootName);

  if (root.kind !== "object" && root.kind !== "array") {
    return { ok: true, code: `typedef ${rootName} = ${dartType(root)};` };
  }

  const target = root.kind === "array" ? root.items ?? { kind: "any" } : root;
  const types = collectNamedTypes(target, root.kind === "array" ? rootName + "Item" : rootName);

  const blocks: string[] = [];
  for (const t of types) {
    const fields = Object.entries(t.shape.fields ?? {});
    const lines: string[] = [`class ${t.name} {`];
    // fields
    for (const [k, f] of fields) {
      let typ = dartType(f.shape);
      if (f.optional) typ += "?";
      lines.push(`  final ${typ} ${k};`);
    }
    lines.push("");
    // constructor
    const params = fields.map(([k, f]) => `${f.optional ? "" : "required "}this.${k}`).join(", ");
    lines.push(`  ${t.name}({${params}});`);
    lines.push("");
    // fromJson
    lines.push(`  factory ${t.name}.fromJson(Map<String, dynamic> json) {`);
    lines.push(`    return ${t.name}(`);
    for (const [k, f] of fields) {
      lines.push(`      ${k}: json['${k}']${f.optional ? "" : ""},`);
    }
    lines.push("    );");
    lines.push("  }");
    lines.push("}");
    blocks.push(lines.join("\n"));
  }

  if (root.kind === "array") {
    const itemName = types[types.length - 1]?.name ?? "Item";
    blocks.push(`typedef ${rootName} = List<${itemName}>;`);
  }

  return { ok: true, code: blocks.join("\n\n") };
};
