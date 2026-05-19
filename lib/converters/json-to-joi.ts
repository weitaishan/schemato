import type { ConvertFn, ConvertResult } from "./index";
import { collectNamedTypes, inferShape, parseJsonSafe, type Shape } from "./json-shape";

function joiExpr(shape: Shape, refMap: Map<string, string>): string {
  switch (shape.kind) {
    case "string": return "Joi.string()";
    case "integer": return "Joi.number().integer()";
    case "number": return "Joi.number()";
    case "boolean": return "Joi.boolean()";
    case "null": return "Joi.any().allow(null)";
    case "any": return "Joi.any()";
    case "array": return `Joi.array().items(${joiExpr(shape.items ?? { kind: "any" }, refMap)})`;
    case "union": return "Joi.alternatives()";
    case "object": return refMap.get(shape.typeName ?? "") ?? "Joi.object()";
  }
}

export const jsonToJoi: ConvertFn = (input, opts): ConvertResult => {
  const parsed = parseJsonSafe(input);
  if (!parsed.ok) return { ok: false, code: "", error: `Invalid JSON: ${parsed.error}` };

  const rootName = opts?.rootName ?? "Root";
  const root = inferShape(parsed.value, rootName);

  if (root.kind !== "object" && root.kind !== "array") {
    return { ok: true, code: `const Joi = require("joi");\n\nconst ${rootName} = ${joiExpr(root, new Map())};` };
  }

  const target = root.kind === "array" ? root.items ?? { kind: "any" } : root;
  const types = collectNamedTypes(target, root.kind === "array" ? rootName + "Item" : rootName);
  const refMap = new Map<string, string>();
  for (const t of types) refMap.set(t.name, `${t.name}Schema`);

  const blocks: string[] = [`const Joi = require("joi");`, ""];
  for (const t of types) {
    const fieldLines = Object.entries(t.shape.fields ?? {}).map(([k, f]) => {
      let expr = joiExpr(f.shape, refMap);
      if (!f.optional) expr += ".required()";
      return `  ${k}: ${expr},`;
    });
    blocks.push(`const ${t.name}Schema = Joi.object({\n${fieldLines.join("\n")}\n});`);
  }

  if (root.kind === "array") {
    const itemName = types[types.length - 1]?.name ?? "Item";
    blocks.push(`const ${rootName}Schema = Joi.array().items(${itemName}Schema);`);
  }

  return { ok: true, code: blocks.join("\n\n") };
};
