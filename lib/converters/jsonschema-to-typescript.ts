import type { ConvertFn, ConvertResult } from "./index";
import { collectNamedTypes, type Shape } from "./json-shape";
import { jsonSchemaToShape } from "./jsonschema-shape";

function tsType(shape: Shape): string {
  switch (shape.kind) {
    case "string": return "string";
    case "integer":
    case "number": return "number";
    case "boolean": return "boolean";
    case "null": return "null";
    case "any": return "unknown";
    case "array": return `${tsType(shape.items ?? { kind: "any" })}[]`;
    case "union": return (shape.variants ?? []).map(tsType).join(" | ") || "unknown";
    case "object": return shape.typeName ?? "Record<string, unknown>";
  }
}

export const jsonschemaToTypeScript: ConvertFn = (input, opts): ConvertResult => {
  const r = jsonSchemaToShape(input, opts?.rootName ?? "Root");
  if (!r.ok) return { ok: false, code: "", error: r.error };

  const root = r.shape;
  if (root.kind !== "object" && root.kind !== "array") {
    return { ok: true, code: `export type ${opts?.rootName ?? "Root"} = ${tsType(root)};` };
  }

  if (root.kind === "array") {
    const itemRoot = root.items ?? { kind: "any" };
    const types = collectNamedTypes(itemRoot, (opts?.rootName ?? "Root") + "Item");
    const lines = types.map((t) => {
      const fieldLines = Object.entries(t.shape.fields ?? {}).map(([k, f]) => {
        const opt = f.optional ? "?" : "";
        return `  ${JSON.stringify(k)}${opt}: ${tsType(f.shape)};`;
      });
      return `export interface ${t.name} {\n${fieldLines.join("\n")}\n}`;
    });
    const itemTypeName = types[types.length - 1]?.name ?? "Item";
    lines.push(`export type ${opts?.rootName ?? "Root"} = ${itemTypeName}[];`);
    return { ok: true, code: lines.join("\n\n") };
  }

  const types = collectNamedTypes(root, opts?.rootName ?? "Root");
  const blocks = types.map((t) => {
    const fieldLines = Object.entries(t.shape.fields ?? {}).map(([k, f]) => {
      const opt = f.optional ? "?" : "";
      return `  ${JSON.stringify(k)}${opt}: ${tsType(f.shape)};`;
    });
    return `export interface ${t.name} {\n${fieldLines.join("\n")}\n}`;
  });
  return { ok: true, code: blocks.join("\n\n") };
};
