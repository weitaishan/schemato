import type { ConvertFn, ConvertResult } from "./index";
import { collectNamedTypes, inferShape, parseJsonSafe, type Shape } from "./json-shape";

function pyType(shape: Shape): string {
  switch (shape.kind) {
    case "string":
      return "str";
    case "integer":
      return "int";
    case "number":
      return "float";
    case "boolean":
      return "bool";
    case "null":
      return "None";
    case "any":
      return "Any";
    case "array":
      return `list[${pyType(shape.items ?? { kind: "any" })}]`;
    case "union": {
      const parts = (shape.variants ?? []).map(pyType);
      return parts.length ? parts.join(" | ") : "Any";
    }
    case "object":
      return shape.typeName ?? "dict";
  }
}

export const jsonToPydantic: ConvertFn = (input, opts): ConvertResult => {
  const parsed = parseJsonSafe(input);
  if (!parsed.ok) return { ok: false, code: "", error: `Invalid JSON: ${parsed.error}` };

  const rootName = opts?.rootName ?? "Root";
  const root = inferShape(parsed.value, rootName);

  if (root.kind !== "object" && root.kind !== "array") {
    return {
      ok: true,
      code: `from pydantic import RootModel\n\n${rootName} = RootModel[${pyType(root)}]`,
    };
  }

  const target = root.kind === "array" ? root.items ?? { kind: "any" } : root;
  const types = collectNamedTypes(target, root.kind === "array" ? rootName + "Item" : rootName);

  const lines: string[] = [
    "from __future__ import annotations",
    "",
    "from typing import Any, Optional",
    "from pydantic import BaseModel",
    "",
  ];

  for (const t of types) {
    lines.push(`class ${t.name}(BaseModel):`);
    const entries = Object.entries(t.shape.fields ?? {});
    if (entries.length === 0) {
      lines.push("    pass");
    } else {
      for (const [k, f] of entries) {
        const t2 = pyType(f.shape);
        const annotated = f.optional ? `Optional[${t2}] = None` : t2;
        // 字段名不合法时改写
        const safe = /^[A-Za-z_][A-Za-z0-9_]*$/.test(k) ? k : k.replace(/[^A-Za-z0-9_]/g, "_");
        lines.push(`    ${safe}: ${annotated}`);
      }
    }
    lines.push("");
  }

  if (root.kind === "array") {
    const itemName = types[types.length - 1]?.name ?? "Item";
    lines.push("from pydantic import RootModel");
    lines.push(`${rootName} = RootModel[list[${itemName}]]`);
  }

  return { ok: true, code: lines.join("\n") };
};
