import type { ConvertFn, ConvertResult } from "./index";
import { collectNamedTypes, inferShape, parseJsonSafe, type Shape } from "./json-shape";

function yupExpr(shape: Shape, refMap: Map<string, string>): string {
  switch (shape.kind) {
    case "string": return "yup.string()";
    case "integer": return "yup.number().integer()";
    case "number": return "yup.number()";
    case "boolean": return "yup.boolean()";
    case "null": return "yup.mixed().nullable()";
    case "any": return "yup.mixed()";
    case "array": return `yup.array().of(${yupExpr(shape.items ?? { kind: "any" }, refMap)})`;
    case "union": return "yup.mixed()";
    case "object": return refMap.get(shape.typeName ?? "") ?? "yup.object()";
  }
}

export const jsonToYup: ConvertFn = (input, opts): ConvertResult => {
  const parsed = parseJsonSafe(input);
  if (!parsed.ok) return { ok: false, code: "", error: `Invalid JSON: ${parsed.error}` };

  const rootName = opts?.rootName ?? "Root";
  const root = inferShape(parsed.value, rootName);

  if (root.kind !== "object" && root.kind !== "array") {
    return { ok: true, code: `import * as yup from "yup";\n\nexport const ${rootName} = ${yupExpr(root, new Map())};` };
  }

  const target = root.kind === "array" ? root.items ?? { kind: "any" } : root;
  const types = collectNamedTypes(target, root.kind === "array" ? rootName + "Item" : rootName);
  const refMap = new Map<string, string>();
  for (const t of types) refMap.set(t.name, `${t.name}Schema`);

  const blocks: string[] = [`import * as yup from "yup";`, ""];
  for (const t of types) {
    const fieldLines = Object.entries(t.shape.fields ?? {}).map(([k, f]) => {
      let expr = yupExpr(f.shape, refMap);
      if (!f.optional) expr += ".required()";
      return `  ${k}: ${expr},`;
    });
    blocks.push(`export const ${t.name}Schema = yup.object({\n${fieldLines.join("\n")}\n});`);
  }

  if (root.kind === "array") {
    const itemName = types[types.length - 1]?.name ?? "Item";
    blocks.push(`export const ${rootName}Schema = yup.array().of(${itemName}Schema);`);
  }

  return { ok: true, code: blocks.join("\n\n") };
};
