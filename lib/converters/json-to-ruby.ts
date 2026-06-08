import type { ConvertFn, ConvertResult } from "./index";
import { collectNamedTypes, inferShapeFromJsonInput, type Shape } from "./json-shape";

function snakeCase(s: string): string {
  return s.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
}

export const jsonToRuby: ConvertFn = (input, opts): ConvertResult => {
  const rootName = opts?.rootName ?? "Root";
  const inferred = inferShapeFromJsonInput(input, rootName);
  if (inferred.ok === false) return { ok: false, code: "", error: `Invalid JSON: ${inferred.error}` };

  const root = inferred.shape;

  if (root.kind !== "object" && root.kind !== "array") {
    return { ok: true, code: `# ${rootName} is a simple ${root.kind}` };
  }

  const target = root.kind === "array" ? root.items ?? { kind: "any" } : root;
  const types = collectNamedTypes(target, root.kind === "array" ? rootName + "Item" : rootName);

  const blocks: string[] = [];
  for (const t of types) {
    const fields = Object.entries(t.shape.fields ?? {});
    const attrs = fields.map(([k]) => `:${snakeCase(k)}`).join(", ");
    const params = fields.map(([k, f]) => `${snakeCase(k)}:${f.optional ? " nil" : ""}`).join(", ");
    const assigns = fields.map(([k]) => `    @${snakeCase(k)} = ${snakeCase(k)}`).join("\n");
    blocks.push(
      `class ${t.name}\n  attr_accessor ${attrs}\n\n  def initialize(${params})\n${assigns}\n  end\nend`
    );
  }

  if (root.kind === "array") {
    const itemName = types[types.length - 1]?.name ?? "Item";
    blocks.push(`# ${rootName} = Array of ${itemName}`);
  }

  return { ok: true, code: blocks.join("\n\n") };
};
