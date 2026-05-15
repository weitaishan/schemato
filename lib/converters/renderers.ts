// 集中所有"shape → 各语言代码"的渲染逻辑。
// 任何输入格式（JSON / JSON Schema / GraphQL / SQL / ...）只要先解析成内部 Shape，
// 就可以复用这里的 15 个 renderer，自动获得 15 个输出。

import { collectNamedTypes, type Shape } from "./json-shape";

export type Renderer = (root: Shape, rootName: string) => string;

// ----- 通用工具 -----
function snakeCase(s: string): string {
  return s.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
}
function pascal(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// =================================================================
// TypeScript
// =================================================================
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
export const renderTypeScript: Renderer = (root, rootName) => {
  if (root.kind !== "object" && root.kind !== "array") {
    return `export type ${rootName} = ${tsType(root)};`;
  }
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
    const itemTypeName = types[types.length - 1]?.name ?? "Item";
    lines.push(`export type ${rootName} = ${itemTypeName}[];`);
    return lines.join("\n\n");
  }
  const types = collectNamedTypes(root, rootName);
  return types
    .map((t) => {
      const fieldLines = Object.entries(t.shape.fields ?? {}).map(([k, f]) => {
        const opt = f.optional ? "?" : "";
        return `  ${JSON.stringify(k)}${opt}: ${tsType(f.shape)};`;
      });
      return `export interface ${t.name} {\n${fieldLines.join("\n")}\n}`;
    })
    .join("\n\n");
};

// =================================================================
// Zod
// =================================================================
function zodExpr(shape: Shape, refMap: Map<string, string>): string {
  switch (shape.kind) {
    case "string": return "z.string()";
    case "integer": return "z.number().int()";
    case "number": return "z.number()";
    case "boolean": return "z.boolean()";
    case "null": return "z.null()";
    case "any": return "z.unknown()";
    case "array": return `z.array(${zodExpr(shape.items ?? { kind: "any" }, refMap)})`;
    case "union": {
      const parts = (shape.variants ?? []).map((v) => zodExpr(v, refMap));
      return parts.length >= 2 ? `z.union([${parts.join(", ")}])` : (parts[0] ?? "z.unknown()");
    }
    case "object": return refMap.get(shape.typeName ?? "") ?? "z.record(z.unknown())";
  }
}
export const renderZod: Renderer = (root, rootName) => {
  if (root.kind !== "object" && root.kind !== "array") {
    return `import { z } from "zod";\n\nexport const ${rootName} = ${zodExpr(root, new Map())};`;
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
  return blocks.join("\n\n");
};

// =================================================================
// Pydantic
// =================================================================
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
export const renderPydantic: Renderer = (root, rootName) => {
  if (root.kind !== "object" && root.kind !== "array") {
    return `from pydantic import RootModel\n\n${rootName} = RootModel[${pyType(root)}]`;
  }
  const target = root.kind === "array" ? root.items ?? { kind: "any" } : root;
  const types = collectNamedTypes(target, root.kind === "array" ? rootName + "Item" : rootName);
  const lines = ["from __future__ import annotations", "", "from typing import Any, Optional", "from pydantic import BaseModel", ""];
  for (const t of types) {
    lines.push(`class ${t.name}(BaseModel):`);
    const entries = Object.entries(t.shape.fields ?? {});
    if (entries.length === 0) lines.push("    pass");
    else for (const [k, f] of entries) {
      const t2 = pyType(f.shape);
      const annotated = f.optional ? `Optional[${t2}] = None` : t2;
      const safe = /^[A-Za-z_][A-Za-z0-9_]*$/.test(k) ? k : k.replace(/[^A-Za-z0-9_]/g, "_");
      lines.push(`    ${safe}: ${annotated}`);
    }
    lines.push("");
  }
  if (root.kind === "array") {
    const itemName = types[types.length - 1]?.name ?? "Item";
    lines.push("from pydantic import RootModel");
    lines.push(`${rootName} = RootModel[list[${itemName}]]`);
  }
  return lines.join("\n");
};

// =================================================================
// Python dataclass
// =================================================================
export const renderPythonDataclass: Renderer = (root, rootName) => {
  if (root.kind !== "object" && root.kind !== "array") {
    return `# ${rootName} = ${pyType(root)}`;
  }
  const target = root.kind === "array" ? root.items ?? { kind: "any" } : root;
  const types = collectNamedTypes(target, root.kind === "array" ? rootName + "Item" : rootName);
  const lines = ["from __future__ import annotations", "", "from dataclasses import dataclass", "from typing import Any, Optional", ""];
  for (const t of types) {
    lines.push("@dataclass");
    lines.push(`class ${t.name}:`);
    const entries = Object.entries(t.shape.fields ?? {});
    if (entries.length === 0) lines.push("    pass");
    else for (const [k, f] of entries) {
      const t2 = pyType(f.shape);
      const safe = /^[A-Za-z_][A-Za-z0-9_]*$/.test(k) ? k : k.replace(/[^A-Za-z0-9_]/g, "_");
      lines.push(f.optional ? `    ${safe}: Optional[${t2}] = None` : `    ${safe}: ${t2}`);
    }
    lines.push("");
  }
  if (root.kind === "array") {
    const itemName = types[types.length - 1]?.name ?? "Item";
    lines.push(`# ${rootName} = list[${itemName}]`);
  }
  return lines.join("\n");
};

// =================================================================
// Go struct
// =================================================================
function goType(shape: Shape): string {
  switch (shape.kind) {
    case "string": return "string";
    case "integer": return "int";
    case "number": return "float64";
    case "boolean": return "bool";
    case "null":
    case "any":
    case "union": return "interface{}";
    case "array": return `[]${goType(shape.items ?? { kind: "any" })}`;
    case "object": return shape.typeName ? `*${shape.typeName}` : "map[string]interface{}";
  }
}
export const renderGoStruct: Renderer = (root, rootName) => {
  if (root.kind !== "object" && root.kind !== "array") return `type ${rootName} ${goType(root)}`;
  const target = root.kind === "array" ? root.items ?? { kind: "any" } : root;
  const types = collectNamedTypes(target, root.kind === "array" ? rootName + "Item" : rootName);
  const blocks: string[] = ["package main", ""];
  for (const t of types) {
    const lines: string[] = [`type ${t.name} struct {`];
    for (const [k, f] of Object.entries(t.shape.fields ?? {})) {
      let typ = goType(f.shape);
      if (f.optional && !typ.startsWith("*") && !typ.startsWith("[]") && typ !== "interface{}") typ = `*${typ}`;
      lines.push(`\t${pascal(k)} ${typ} \`json:"${k}${f.optional ? ",omitempty" : ""}"\``);
    }
    lines.push("}");
    blocks.push(lines.join("\n"));
  }
  if (root.kind === "array") blocks.push(`type ${rootName} []${types[types.length - 1]?.name ?? "Item"}`);
  return blocks.join("\n\n");
};

// =================================================================
// Rust struct (with serde)
// =================================================================
function rustType(shape: Shape): string {
  switch (shape.kind) {
    case "string": return "String";
    case "integer": return "i64";
    case "number": return "f64";
    case "boolean": return "bool";
    case "null":
    case "any":
    case "union": return "serde_json::Value";
    case "array": return `Vec<${rustType(shape.items ?? { kind: "any" })}>`;
    case "object": return shape.typeName ?? "serde_json::Value";
  }
}
export const renderRustStruct: Renderer = (root, rootName) => {
  if (root.kind !== "object" && root.kind !== "array") return `type ${rootName} = ${rustType(root)};`;
  const target = root.kind === "array" ? root.items ?? { kind: "any" } : root;
  const types = collectNamedTypes(target, root.kind === "array" ? rootName + "Item" : rootName);
  const blocks: string[] = ["use serde::{Deserialize, Serialize};", ""];
  for (const t of types) {
    const lines: string[] = ["#[derive(Debug, Clone, Serialize, Deserialize)]", `pub struct ${t.name} {`];
    for (const [k, f] of Object.entries(t.shape.fields ?? {})) {
      const field = snakeCase(k);
      let typ = rustType(f.shape);
      if (f.optional) typ = `Option<${typ}>`;
      if (field !== k) lines.push(`    #[serde(rename = "${k}")]`);
      if (f.optional) lines.push(`    #[serde(skip_serializing_if = "Option::is_none")]`);
      lines.push(`    pub ${field}: ${typ},`);
    }
    lines.push("}");
    blocks.push(lines.join("\n"));
  }
  if (root.kind === "array") blocks.push(`pub type ${rootName} = Vec<${types[types.length - 1]?.name ?? "Item"}>;`);
  return blocks.join("\n\n");
};

// =================================================================
// Swift Codable
// =================================================================
function swiftType(shape: Shape): string {
  switch (shape.kind) {
    case "string": return "String";
    case "integer": return "Int";
    case "number": return "Double";
    case "boolean": return "Bool";
    case "null":
    case "union": return "Any?";
    case "any": return "Any";
    case "array": return `[${swiftType(shape.items ?? { kind: "any" })}]`;
    case "object": return shape.typeName ?? "[String: Any]";
  }
}
export const renderSwift: Renderer = (root, rootName) => {
  if (root.kind !== "object" && root.kind !== "array") return `typealias ${rootName} = ${swiftType(root)}`;
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
  if (root.kind === "array") blocks.push(`typealias ${rootName} = [${types[types.length - 1]?.name ?? "Item"}]`);
  return blocks.join("\n\n");
};

// =================================================================
// Kotlin
// =================================================================
function ktType(shape: Shape): string {
  switch (shape.kind) {
    case "string": return "String";
    case "integer": return "Int";
    case "number": return "Double";
    case "boolean": return "Boolean";
    case "null": return "Any?";
    case "any":
    case "union": return "Any";
    case "array": return `List<${ktType(shape.items ?? { kind: "any" })}>`;
    case "object": return shape.typeName ?? "Map<String, Any>";
  }
}
export const renderKotlin: Renderer = (root, rootName) => {
  if (root.kind !== "object" && root.kind !== "array") return `typealias ${rootName} = ${ktType(root)}`;
  const target = root.kind === "array" ? root.items ?? { kind: "any" } : root;
  const types = collectNamedTypes(target, root.kind === "array" ? rootName + "Item" : rootName);
  const blocks: string[] = [];
  for (const t of types) {
    const params = Object.entries(t.shape.fields ?? {}).map(([k, f]) => {
      let typ = ktType(f.shape);
      if (f.optional) typ += "?";
      return `    val ${k}: ${typ}${f.optional ? " = null" : ""}`;
    });
    blocks.push(`data class ${t.name}(\n${params.join(",\n")}\n)`);
  }
  if (root.kind === "array") blocks.push(`typealias ${rootName} = List<${types[types.length - 1]?.name ?? "Item"}>`);
  return blocks.join("\n\n");
};

// =================================================================
// Java record
// =================================================================
function javaType(shape: Shape, boxed = false): string {
  switch (shape.kind) {
    case "string": return "String";
    case "integer": return boxed ? "Integer" : "int";
    case "number": return boxed ? "Double" : "double";
    case "boolean": return boxed ? "Boolean" : "boolean";
    case "null":
    case "any":
    case "union": return "Object";
    case "array": return `List<${javaType(shape.items ?? { kind: "any" }, true)}>`;
    case "object": return shape.typeName ?? "Map<String, Object>";
  }
}
export const renderJava: Renderer = (root, rootName) => {
  if (root.kind !== "object" && root.kind !== "array") return `// ${rootName} = ${javaType(root)}`;
  const target = root.kind === "array" ? root.items ?? { kind: "any" } : root;
  const types = collectNamedTypes(target, root.kind === "array" ? rootName + "Item" : rootName);
  const blocks: string[] = ["import java.util.List;", ""];
  for (const t of types) {
    const params = Object.entries(t.shape.fields ?? {}).map(([k, f]) => `    ${javaType(f.shape, f.optional)} ${k}`);
    blocks.push(`public record ${t.name}(\n${params.join(",\n")}\n) {}`);
  }
  if (root.kind === "array") blocks.push(`// ${rootName} = List<${types[types.length - 1]?.name ?? "Item"}>`);
  return blocks.join("\n\n");
};

// =================================================================
// C# record
// =================================================================
function csType(shape: Shape): string {
  switch (shape.kind) {
    case "string": return "string";
    case "integer": return "int";
    case "number": return "double";
    case "boolean": return "bool";
    case "null":
    case "any":
    case "union": return "object";
    case "array": return `List<${csType(shape.items ?? { kind: "any" })}>`;
    case "object": return shape.typeName ?? "Dictionary<string, object>";
  }
}
export const renderCsharp: Renderer = (root, rootName) => {
  if (root.kind !== "object" && root.kind !== "array") return `// ${rootName} = ${csType(root)}`;
  const target = root.kind === "array" ? root.items ?? { kind: "any" } : root;
  const types = collectNamedTypes(target, root.kind === "array" ? rootName + "Item" : rootName);
  const blocks: string[] = ["using System.Text.Json.Serialization;", ""];
  for (const t of types) {
    const params = Object.entries(t.shape.fields ?? {}).map(([k, f]) => {
      let typ = csType(f.shape);
      if (f.optional) typ += "?";
      return `    ${typ} ${pascal(k)}`;
    });
    blocks.push(`public record ${t.name}(\n${params.join(",\n")}\n);`);
  }
  if (root.kind === "array") blocks.push(`// ${rootName} = List<${types[types.length - 1]?.name ?? "Item"}>`);
  return blocks.join("\n\n");
};

// =================================================================
// Dart
// =================================================================
function dartType(shape: Shape): string {
  switch (shape.kind) {
    case "string": return "String";
    case "integer": return "int";
    case "number": return "double";
    case "boolean": return "bool";
    case "null":
    case "any":
    case "union": return "dynamic";
    case "array": return `List<${dartType(shape.items ?? { kind: "any" })}>`;
    case "object": return shape.typeName ?? "Map<String, dynamic>";
  }
}
export const renderDart: Renderer = (root, rootName) => {
  if (root.kind !== "object" && root.kind !== "array") return `typedef ${rootName} = ${dartType(root)};`;
  const target = root.kind === "array" ? root.items ?? { kind: "any" } : root;
  const types = collectNamedTypes(target, root.kind === "array" ? rootName + "Item" : rootName);
  const blocks: string[] = [];
  for (const t of types) {
    const fields = Object.entries(t.shape.fields ?? {});
    const lines: string[] = [`class ${t.name} {`];
    for (const [k, f] of fields) {
      let typ = dartType(f.shape);
      if (f.optional) typ += "?";
      lines.push(`  final ${typ} ${k};`);
    }
    lines.push("");
    const params = fields.map(([k, f]) => `${f.optional ? "" : "required "}this.${k}`).join(", ");
    lines.push(`  ${t.name}({${params}});`);
    lines.push("");
    lines.push(`  factory ${t.name}.fromJson(Map<String, dynamic> json) => ${t.name}(`);
    for (const [k] of fields) lines.push(`    ${k}: json['${k}'],`);
    lines.push("  );");
    lines.push("}");
    blocks.push(lines.join("\n"));
  }
  if (root.kind === "array") blocks.push(`typedef ${rootName} = List<${types[types.length - 1]?.name ?? "Item"}>;`);
  return blocks.join("\n\n");
};

// =================================================================
// Yup
// =================================================================
function yupExpr(shape: Shape, refMap: Map<string, string>): string {
  switch (shape.kind) {
    case "string": return "yup.string()";
    case "integer": return "yup.number().integer()";
    case "number": return "yup.number()";
    case "boolean": return "yup.boolean()";
    case "null": return "yup.mixed().nullable()";
    case "any":
    case "union": return "yup.mixed()";
    case "array": return `yup.array().of(${yupExpr(shape.items ?? { kind: "any" }, refMap)})`;
    case "object": return refMap.get(shape.typeName ?? "") ?? "yup.object()";
  }
}
export const renderYup: Renderer = (root, rootName) => {
  if (root.kind !== "object" && root.kind !== "array") return `import * as yup from "yup";\n\nexport const ${rootName} = ${yupExpr(root, new Map())};`;
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
  if (root.kind === "array") blocks.push(`export const ${rootName}Schema = yup.array().of(${types[types.length - 1]?.name ?? "Item"}Schema);`);
  return blocks.join("\n\n");
};

// =================================================================
// Joi
// =================================================================
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
export const renderJoi: Renderer = (root, rootName) => {
  if (root.kind !== "object" && root.kind !== "array") return `const Joi = require("joi");\n\nconst ${rootName} = ${joiExpr(root, new Map())};`;
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
  if (root.kind === "array") blocks.push(`const ${rootName}Schema = Joi.array().items(${types[types.length - 1]?.name ?? "Item"}Schema);`);
  return blocks.join("\n\n");
};

// =================================================================
// PHP
// =================================================================
function phpType(shape: Shape): string {
  switch (shape.kind) {
    case "string": return "string";
    case "integer": return "int";
    case "number": return "float";
    case "boolean": return "bool";
    case "null":
    case "any":
    case "union": return "mixed";
    case "array": return "array";
    case "object": return shape.typeName ?? "array";
  }
}
export const renderPhp: Renderer = (root, rootName) => {
  if (root.kind !== "object" && root.kind !== "array") return `<?php\n// ${rootName} = ${phpType(root)}`;
  const target = root.kind === "array" ? root.items ?? { kind: "any" } : root;
  const types = collectNamedTypes(target, root.kind === "array" ? rootName + "Item" : rootName);
  const blocks: string[] = ["<?php", ""];
  for (const t of types) {
    const fields = Object.entries(t.shape.fields ?? {});
    const lines: string[] = [`class ${t.name} {`, "    public function __construct("];
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
  return blocks.join("\n\n");
};

// =================================================================
// Ruby
// =================================================================
export const renderRuby: Renderer = (root, rootName) => {
  if (root.kind !== "object" && root.kind !== "array") return `# ${rootName} is a simple ${root.kind}`;
  const target = root.kind === "array" ? root.items ?? { kind: "any" } : root;
  const types = collectNamedTypes(target, root.kind === "array" ? rootName + "Item" : rootName);
  const blocks: string[] = [];
  for (const t of types) {
    const fields = Object.entries(t.shape.fields ?? {});
    const attrs = fields.map(([k]) => `:${snakeCase(k)}`).join(", ");
    const params = fields.map(([k, f]) => `${snakeCase(k)}:${f.optional ? " nil" : ""}`).join(", ");
    const assigns = fields.map(([k]) => `    @${snakeCase(k)} = ${snakeCase(k)}`).join("\n");
    blocks.push(`class ${t.name}\n  attr_accessor ${attrs}\n\n  def initialize(${params})\n${assigns}\n  end\nend`);
  }
  if (root.kind === "array") blocks.push(`# ${rootName} = Array of ${types[types.length - 1]?.name ?? "Item"}`);
  return blocks.join("\n\n");
};

// =================================================================
// 集中导出
// =================================================================
import type { FormatId } from "../formats";

export const RENDERERS: Partial<Record<FormatId, Renderer>> = {
  typescript: renderTypeScript,
  zod: renderZod,
  pydantic: renderPydantic,
  "python-dataclass": renderPythonDataclass,
  "go-struct": renderGoStruct,
  "rust-struct": renderRustStruct,
  swift: renderSwift,
  kotlin: renderKotlin,
  java: renderJava,
  csharp: renderCsharp,
  dart: renderDart,
  yup: renderYup,
  joi: renderJoi,
  php: renderPhp,
  ruby: renderRuby,
};
