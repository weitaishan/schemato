import type { ConvertFn, ConvertResult } from "./index";
import { collectNamedTypes, inferShapeFromJsonInput, type Shape } from "./json-shape";

function tsType(shape: Shape): string {
  switch (shape.kind) {
    case "string":
      return "string";
    case "integer":
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "null":
      return "null";
    case "any":
      return "unknown";
    case "array":
      return `${tsType(shape.items ?? { kind: "any" })}[]`;
    case "union":
      return (shape.variants ?? []).map(tsType).join(" | ") || "unknown";
    case "object":
      return shape.typeName ?? "Record<string, unknown>";
  }
}

export const jsonToTypeScript: ConvertFn = (input, opts): ConvertResult => {
  const rootName = opts?.rootName ?? "Root";
  const inferred = inferShapeFromJsonInput(input, rootName);
  if (inferred.ok === false) return { ok: false, code: "", error: `Invalid JSON: ${inferred.error}` };

  const root = inferred.shape;
  if (root.kind !== "object" && root.kind !== "array") {
    return {
      ok: true,
      code: `export type ${rootName} = ${tsType(root)};`,
    };
  }

  // 数组根：根类型 = ItemType[]，并把 item 当作主类型
  if (root.kind === "array") {
    const itemRoot = root.items ?? { kind: "any" };
    const types = collectNamedTypes(itemRoot, rootName + "Item");
    const lines = types.map((t) => {
      const fieldLines = Object.entries(t.shape.fields ?? {}).map(([k, f]) => {
        const opt = f.optional ? "?" : "";
        return `  ${JSON.stringify(k)}${opt}: ${tsType(f.shape)};`;
      });
      return `export interface ${t.name} {\n${fieldLines.join("\n")}\n}`;
    });
    const itemTypeName = (types[types.length - 1]?.name) ?? "Item";
    lines.push(`export type ${rootName} = ${itemTypeName}[];`);
    return { ok: true, code: lines.join("\n\n") };
  }

  const types = collectNamedTypes(root, rootName);
  const blocks = types.map((t) => {
    const fieldLines = Object.entries(t.shape.fields ?? {}).map(([k, f]) => {
      const opt = f.optional ? "?" : "";
      return `  ${JSON.stringify(k)}${opt}: ${tsType(f.shape)};`;
    });
    return `export interface ${t.name} {\n${fieldLines.join("\n")}\n}`;
  });

  return { ok: true, code: blocks.join("\n\n") };
};
