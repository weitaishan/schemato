import type { ConvertFn, ConvertResult } from "./index";
import { collectNamedTypes, inferShape, parseJsonSafe, type Shape } from "./json-shape";

function zodExpr(shape: Shape, refMap: Map<string, string>): string {
  switch (shape.kind) {
    case "string":
      return "z.string()";
    case "integer":
      return "z.number().int()";
    case "number":
      return "z.number()";
    case "boolean":
      return "z.boolean()";
    case "null":
      return "z.null()";
    case "any":
      return "z.unknown()";
    case "array":
      return `z.array(${zodExpr(shape.items ?? { kind: "any" }, refMap)})`;
    case "union": {
      const parts = (shape.variants ?? []).map((v) => zodExpr(v, refMap));
      return parts.length >= 2 ? `z.union([${parts.join(", ")}])` : (parts[0] ?? "z.unknown()");
    }
    case "object":
      return refMap.get(shape.typeName ?? "") ?? "z.record(z.unknown())";
  }
}

export const jsonToZod: ConvertFn = (input, opts): ConvertResult => {
  const parsed = parseJsonSafe(input);
  if (!parsed.ok) return { ok: false, code: "", error: `Invalid JSON: ${parsed.error}` };

  const rootName = opts?.rootName ?? "Root";
  const root = inferShape(parsed.value, rootName);

  // 非对象 / 非数组：单一 schema
  if (root.kind !== "object" && root.kind !== "array") {
    return {
      ok: true,
      code: `import { z } from "zod";\n\nexport const ${rootName} = ${zodExpr(root, new Map())};`,
    };
  }

  const target = root.kind === "array" ? root.items ?? { kind: "any" } : root;
  const types = collectNamedTypes(target, root.kind === "array" ? rootName + "Item" : rootName);
  const refMap = new Map<string, string>();
  for (const t of types) refMap.set(t.name, t.name);

  const blocks: string[] = [`import { z } from "zod";`, ""];
  for (const t of types) {
    const fieldLines = Object.entries(t.shape.fields ?? {}).map(([k, f]) => {
      let expr = zodExpr(f.shape, refMap);
      if (f.optional) expr = `${expr}.optional()`;
      return `  ${JSON.stringify(k)}: ${expr},`;
    });
    blocks.push(`export const ${t.name} = z.object({\n${fieldLines.join("\n")}\n});`);
  }
  if (root.kind === "array") {
    const itemName = types[types.length - 1]?.name ?? "Item";
    blocks.push(`export const ${rootName} = z.array(${itemName});`);
  }

  return { ok: true, code: blocks.join("\n\n") };
};
