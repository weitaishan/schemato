import type { ConvertFn, ConvertResult } from "./index";
import { collectNamedTypes, inferShape, parseJsonSafe, type Shape } from "./json-shape";

function swiftType(shape: Shape): string {
  switch (shape.kind) {
    case "string": return "String";
    case "integer": return "Int";
    case "number": return "Double";
    case "boolean": return "Bool";
    case "null": return "Any?";
    case "any": return "Any";
    case "array": return `[${swiftType(shape.items ?? { kind: "any" })}]`;
    case "union": return "Any";
    case "object": return shape.typeName ?? "[String: Any]";
  }
}

export const jsonToSwift: ConvertFn = (input, opts): ConvertResult => {
  const parsed = parseJsonSafe(input);
  if (!parsed.ok) return { ok: false, code: "", error: `Invalid JSON: ${parsed.error}` };

  const rootName = opts?.rootName ?? "Root";
  const root = inferShape(parsed.value, rootName);

  if (root.kind !== "object" && root.kind !== "array") {
    return { ok: true, code: `typealias ${rootName} = ${swiftType(root)}` };
  }

  const target = root.kind === "array" ? root.items ?? { kind: "any" } : root;
  const types = collectNamedTypes(target, root.kind === "array" ? rootName + "Item" : rootName);

  const blocks: string[] = ["import Foundation", ""];
  for (const t of types) {
    const lines: string[] = [`struct ${t.name}: Codable {`];
    for (const [k, f] of Object.entries(t.shape.fields ?? {})) {
      let typ = swiftType(f.shape);
      if (f.optional) typ += "?";
      lines.push(`    let ${k}: ${typ}`);
    }
    lines.push("}");
    blocks.push(lines.join("\n"));
  }

  if (root.kind === "array") {
    const itemName = types[types.length - 1]?.name ?? "Item";
    blocks.push(`typealias ${rootName} = [${itemName}]`);
  }

  return { ok: true, code: blocks.join("\n\n") };
};
