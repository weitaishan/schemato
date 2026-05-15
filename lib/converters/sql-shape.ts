// 极简 SQL DDL → 内部 Shape
// 支持 CREATE TABLE 语句（Postgres / MySQL / SQLite 公共子集）。
// 不支持：CHECK constraint、视图、触发器、索引（忽略不报错）。

import type { Shape } from "./json-shape";

interface Column {
  name: string;
  type: string;
  notNull: boolean;
}
interface Table {
  name: string;
  columns: Column[];
}

const TYPE_MAP: Record<string, Shape["kind"]> = {
  // 整数
  int: "integer",
  integer: "integer",
  bigint: "integer",
  smallint: "integer",
  tinyint: "integer",
  serial: "integer",
  bigserial: "integer",
  smallserial: "integer",
  // 浮点
  decimal: "number",
  numeric: "number",
  float: "number",
  real: "number",
  double: "number",
  money: "number",
  // 字符串
  text: "string",
  varchar: "string",
  char: "string",
  character: "string",
  citext: "string",
  uuid: "string",
  json: "any",
  jsonb: "any",
  date: "string",
  time: "string",
  timestamp: "string",
  timestamptz: "string",
  datetime: "string",
  // 布尔
  bool: "boolean",
  boolean: "boolean",
  bit: "boolean",
};

function pascalCase(s: string): string {
  return (
    s
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("") || "Type"
  );
}

function singularize(name: string): string {
  // 简化：trailing s → 去掉，"ies" → "y"
  if (name.endsWith("ies")) return name.slice(0, -3) + "y";
  if (name.endsWith("s") && !name.endsWith("ss")) return name.slice(0, -1);
  return name;
}

function sqlTypeToKind(rawType: string): Shape["kind"] {
  const t = rawType.toLowerCase().split("(")[0].trim();
  return TYPE_MAP[t] ?? "any";
}

function unquote(s: string): string {
  return s.replace(/^[`"\[]|[`"\]]$/g, "");
}

function parseDDL(sql: string): Table[] {
  // 去单行注释、去多行注释
  const cleaned = sql
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");

  const tables: Table[] = [];
  const re = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"]?[\w.]+[`"]?)\s*\(([\s\S]*?)\)\s*(?:[A-Z][\w\s=]*?)?;/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cleaned)) !== null) {
    const tableName = unquote(m[1]).split(".").pop() ?? m[1];
    const body = m[2];
    // 拆分顶层逗号（忽略括号内的逗号，比如 DECIMAL(10,2)）
    const parts: string[] = [];
    let depth = 0;
    let buf = "";
    for (const ch of body) {
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (ch === "," && depth === 0) {
        parts.push(buf.trim());
        buf = "";
      } else {
        buf += ch;
      }
    }
    if (buf.trim()) parts.push(buf.trim());

    const columns: Column[] = [];
    for (const part of parts) {
      const upper = part.toUpperCase();
      // 跳过表级约束
      if (
        upper.startsWith("PRIMARY KEY") ||
        upper.startsWith("FOREIGN KEY") ||
        upper.startsWith("UNIQUE ") ||
        upper.startsWith("UNIQUE(") ||
        upper.startsWith("CONSTRAINT") ||
        upper.startsWith("CHECK") ||
        upper.startsWith("INDEX") ||
        upper.startsWith("KEY ")
      ) {
        continue;
      }
      const cm = part.match(/^([`"]?\w+[`"]?)\s+([A-Za-z][\w]*(?:\s*\([^)]*\))?)\s*(.*)$/);
      if (!cm) continue;
      const colName = unquote(cm[1]);
      const colType = cm[2];
      const rest = (cm[3] ?? "").toUpperCase();
      const notNull = rest.includes("NOT NULL") || rest.includes("PRIMARY KEY");
      columns.push({ name: colName, type: colType, notNull });
    }
    if (columns.length > 0) tables.push({ name: tableName, columns });
  }
  return tables;
}

export function sqlToShape(
  input: string,
  rootName = "Root",
): { ok: true; shape: Shape } | { ok: false; error: string } {
  try {
    let raw = input.trim();
    if (!raw.endsWith(";")) raw = raw + ";"; // 兼容用户没写分号
    const tables = parseDDL(raw);
    if (tables.length === 0) {
      return { ok: false, error: "No CREATE TABLE statements found." };
    }
    // 用第一张表作为 root
    const table = tables[0];
    const fields: Record<string, { shape: Shape; optional: boolean }> = {};
    for (const c of table.columns) {
      fields[c.name] = {
        shape: { kind: sqlTypeToKind(c.type) },
        optional: !c.notNull,
      };
    }
    void rootName;
    return {
      ok: true,
      shape: {
        kind: "object",
        fields,
        typeName: pascalCase(singularize(table.name)),
      },
    };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
