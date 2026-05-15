import type { ConvertFn, ConvertResult } from "./index";
import { collectNamedTypes, inferShape, parseJsonSafe, type Shape } from "./json-shape";

function phpType(shape: Shape): string {
  switch (shape.kind) {
    case "string": return "string";
    case "integer": return "int";
    case "number": return "float";
    case "boolean": return "bool";
    case "null": return "mixed";
    case "any": return "mixed";
    case "array": return "array";
    case "union": return "mixed";
    case "object": return shape.typeName ?? "array";
  }
}

export const jsonToPhp: ConvertFn = (input, opts): ConvertResult => {
  const parsed = parseJsonSafe(input);
  if (!parsed.ok) return { ok: false, code: "", error: `Invalid JSON: ${parsed.error}` };

  const rootName = opts?.rootName ?? "Root";
  const root = inferShape(parsed.value, rootName);

  if (root.kind !== "object" && root.kind !== "array") {
    return { ok: true, code: `<?php\n// ${rootName} = ${phpType(root)}` };
  }

  const target = root.kind === "array" ? root.items ?? { kind: "any" } : root;
  const types = collectNamedTypes(target, root.kind === "array" ? rootName + "Item" : rootName);

  const blocks: string[] = ["<?php", ""];
  for (const t of types) {
    const lines: string[] = [`class ${t.name} {`];
    lines.push("    public function __construct(");
    const fields = Object.entries(t.shape.fields ?? {});
    const params = fields.map(([k, f], i) => {
      let typ = phpType(f.shape);
      if (f.optional) typ = `?${typ}`;
      const comma = i < fields.length - 1 ? "," : "";
      return `        public ${typ} $${k}${f.optional ? " = null" : ""}${comma}`;
    });
    lines.push(params.join("\n"));
    lines.push("    ) {}");
    lines.push("}");
    blocks.push(lines.join("\n"));
  }

  return { ok: true, code: blocks.join("\n\n") };
};
