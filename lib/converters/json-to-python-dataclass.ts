import type { ConvertFn, ConvertResult } from "./index";
import { collectNamedTypes, inferShape, parseJsonSafe, type Shape } from "./json-shape";

function pyType(shape: Shape): string {
  switch (shape.kind) {
    case "string": return "str";
    case "integer": return "int";
    case "number": return "float";
    case "boolean": return "bool";
    case "null": return "None";
    case "any": return "Any";
    case "array": return `list[${pyType(shape.items ?? { kind: "any" })}]`;
    case "union": {
      const parts = (shape.variants ?? []).map(pyType);
      return parts.length ? parts.join(" | ") : "Any";
    }
    case "object": return shape.typeName ?? "dict";
  }
}

export const jsonToPythonDataclass: ConvertFn = (input, opts): ConvertResult => {
  const parsed = parseJsonSafe(input);
  if (!parsed.ok) return { ok: false, code: "", error: `Invalid JSON: ${parsed.error}` };

  const rootName = opts?.rootName ?? "Root";
  const root = inferShape(parsed.value, rootName);

  if (root.kind !== "object" && root.kind !== "array") {
    return { ok: true, code: `# ${rootName} = ${pyType(root)}` };
  }

  const target = root.kind === "array" ? root.items ?? { kind: "any" } : root;
  const types = collectNamedTypes(target, root.kind === "array" ? rootName + "Item" : rootName);

  const lines: string[] = [
    "from __future__ import annotations",
    "",
    "from dataclasses import dataclass, field",
    "from typing import Any, Optional",
    "",
  ];

  for (const t of types) {
    lines.push("@dataclass");
    lines.push(`class ${t.name}:`);
    const entries = Object.entries(t.shape.fields ?? {});
    if (entries.length === 0) {
      lines.push("    pass");
    } else {
      for (const [k, f] of entries) {
        const t2 = pyType(f.shape);
        const safe = /^[A-Za-z_][A-Za-z0-9_]*$/.test(k) ? k : k.replace(/[^A-Za-z0-9_]/g, "_");
        if (f.optional) {
          lines.push(`    ${safe}: Optional[${t2}] = None`);
        } else {
          lines.push(`    ${safe}: ${t2}`);
        }
      }
    }
    lines.push("");
  }

  if (root.kind === "array") {
    const itemName = types[types.length - 1]?.name ?? "Item";
    lines.push(`# ${rootName} = list[${itemName}]`);
  }

  return { ok: true, code: lines.join("\n") };
};
