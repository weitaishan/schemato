// 所有支持的输入/输出格式（这是站点的"骨架"，新增格式只改这里 + adapter）

export type FormatId =
  // 输入侧
  | "json"
  | "json-schema"
  | "openapi"
  | "graphql"
  | "sql"
  | "protobuf"
  | "avro"
  | "typescript"
  | "mongoose"
  | "prisma"
  // 输出侧（同时也可作为输入）
  | "zod"
  | "yup"
  | "joi"
  | "pydantic"
  | "python-dataclass"
  | "go-struct"
  | "rust-struct"
  | "kotlin"
  | "swift"
  | "dart"
  | "java"
  | "csharp"
  | "php"
  | "ruby";

export interface FormatMeta {
  id: FormatId;
  /** 用于 URL 的 slug */
  slug: string;
  /** 显示名 */
  name: string;
  /** 一句话描述（出现在工具页副标题/SEO 描述里） */
  blurb: string;
  /** 代码块 highlight 用的语言 id */
  lang: string;
  /** 默认示例代码（一会儿在工具页用作占位/示例） */
  sample: string;
}

export const FORMATS: Record<FormatId, FormatMeta> = {
  json: {
    id: "json",
    slug: "json",
    name: "JSON",
    blurb: "Plain JSON document or sample payload.",
    lang: "json",
    sample: `{
  "id": 1,
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "isAdmin": false,
  "tags": ["math", "engine"]
}`,
  },
  "json-schema": {
    id: "json-schema",
    slug: "json-schema",
    name: "JSON Schema",
    blurb: "Draft-07/2020-12 JSON Schema describing a data shape.",
    lang: "json",
    sample: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "User",
  "type": "object",
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string" },
    "email": { "type": "string", "format": "email" }
  },
  "required": ["id", "name"]
}`,
  },
  openapi: {
    id: "openapi",
    slug: "openapi",
    name: "OpenAPI",
    blurb: "OpenAPI 3.x spec defining endpoints and component schemas.",
    lang: "yaml",
    sample: `openapi: 3.0.3
info:
  title: Sample
  version: 1.0.0
paths: {}
components:
  schemas:
    User:
      type: object
      required: [id, name]
      properties:
        id: { type: integer }
        name: { type: string }
        email: { type: string, format: email }`,
  },
  graphql: {
    id: "graphql",
    slug: "graphql",
    name: "GraphQL",
    blurb: "GraphQL Schema Definition Language (SDL).",
    lang: "graphql",
    sample: `type User {
  id: ID!
  name: String!
  email: String
  isAdmin: Boolean!
}`,
  },
  sql: {
    id: "sql",
    slug: "sql",
    name: "SQL DDL",
    blurb: "CREATE TABLE statements (Postgres / MySQL / SQLite).",
    lang: "sql",
    sample: `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  is_admin BOOLEAN NOT NULL DEFAULT false
);`,
  },
  protobuf: {
    id: "protobuf",
    slug: "protobuf",
    name: "Protocol Buffers",
    blurb: "Protobuf .proto message definitions.",
    lang: "proto",
    sample: `syntax = "proto3";

message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
  bool is_admin = 4;
}`,
  },
  avro: {
    id: "avro",
    slug: "avro",
    name: "Avro",
    blurb: "Apache Avro schema (.avsc) records.",
    lang: "json",
    sample: `{
  "type": "record",
  "name": "User",
  "fields": [
    { "name": "id", "type": "int" },
    { "name": "name", "type": "string" },
    { "name": "email", "type": ["null", "string"], "default": null }
  ]
}`,
  },
  typescript: {
    id: "typescript",
    slug: "typescript",
    name: "TypeScript",
    blurb: "TypeScript interface or type alias.",
    lang: "typescript",
    sample: `export interface User {
  id: number;
  name: string;
  email?: string;
  isAdmin: boolean;
}`,
  },
  mongoose: {
    id: "mongoose",
    slug: "mongoose",
    name: "Mongoose Schema",
    blurb: "Mongoose model schema definition.",
    lang: "javascript",
    sample: `const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  isAdmin: { type: Boolean, default: false }
});`,
  },
  prisma: {
    id: "prisma",
    slug: "prisma",
    name: "Prisma Schema",
    blurb: "Prisma ORM schema model definition.",
    lang: "prisma",
    sample: `model User {
  id      Int     @id @default(autoincrement())
  name    String
  email   String? @unique
  isAdmin Boolean @default(false)
}`,
  },
  zod: {
    id: "zod",
    slug: "zod",
    name: "Zod",
    blurb: "Zod runtime validation schema (TypeScript).",
    lang: "typescript",
    sample: `import { z } from "zod";
export const User = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string().email().optional(),
  isAdmin: z.boolean(),
});`,
  },
  yup: {
    id: "yup",
    slug: "yup",
    name: "Yup",
    blurb: "Yup object schema validation.",
    lang: "typescript",
    sample: `import * as yup from "yup";
export const userSchema = yup.object({
  id: yup.number().integer().required(),
  name: yup.string().required(),
});`,
  },
  joi: {
    id: "joi",
    slug: "joi",
    name: "Joi",
    blurb: "Joi (Hapi) JavaScript validation schema.",
    lang: "javascript",
    sample: `const Joi = require("joi");
const userSchema = Joi.object({
  id: Joi.number().integer().required(),
  name: Joi.string().required(),
});`,
  },
  pydantic: {
    id: "pydantic",
    slug: "pydantic",
    name: "Pydantic",
    blurb: "Pydantic v2 BaseModel for Python.",
    lang: "python",
    sample: `from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str
    email: str | None = None
    is_admin: bool`,
  },
  "python-dataclass": {
    id: "python-dataclass",
    slug: "python-dataclass",
    name: "Python dataclass",
    blurb: "Standard library dataclass for Python.",
    lang: "python",
    sample: `from dataclasses import dataclass
from typing import Optional

@dataclass
class User:
    id: int
    name: str
    email: Optional[str] = None
    is_admin: bool = False`,
  },
  "go-struct": {
    id: "go-struct",
    slug: "go-struct",
    name: "Go struct",
    blurb: "Go struct with JSON tags.",
    lang: "go",
    sample: `type User struct {
    ID      int    \`json:"id"\`
    Name    string \`json:"name"\`
    Email   string \`json:"email,omitempty"\`
    IsAdmin bool   \`json:"isAdmin"\`
}`,
  },
  "rust-struct": {
    id: "rust-struct",
    slug: "rust-struct",
    name: "Rust struct",
    blurb: "Rust struct with serde derive.",
    lang: "rust",
    sample: `#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: i32,
    pub name: String,
    pub email: Option<String>,
    pub is_admin: bool,
}`,
  },
  kotlin: {
    id: "kotlin",
    slug: "kotlin",
    name: "Kotlin data class",
    blurb: "Kotlin data class.",
    lang: "kotlin",
    sample: `data class User(
    val id: Int,
    val name: String,
    val email: String? = null,
    val isAdmin: Boolean
)`,
  },
  swift: {
    id: "swift",
    slug: "swift",
    name: "Swift struct",
    blurb: "Swift Codable struct.",
    lang: "swift",
    sample: `struct User: Codable {
    let id: Int
    let name: String
    let email: String?
    let isAdmin: Bool
}`,
  },
  dart: {
    id: "dart",
    slug: "dart",
    name: "Dart class",
    blurb: "Dart class with named constructor.",
    lang: "dart",
    sample: `class User {
  final int id;
  final String name;
  final String? email;
  final bool isAdmin;
  User({required this.id, required this.name, this.email, required this.isAdmin});
}`,
  },
  java: {
    id: "java",
    slug: "java",
    name: "Java POJO",
    blurb: "Java POJO / record.",
    lang: "java",
    sample: `public record User(int id, String name, String email, boolean isAdmin) {}`,
  },
  csharp: {
    id: "csharp",
    slug: "csharp",
    name: "C# record",
    blurb: "C# record type.",
    lang: "csharp",
    sample: `public record User(int Id, string Name, string? Email, bool IsAdmin);`,
  },
  php: {
    id: "php",
    slug: "php",
    name: "PHP class",
    blurb: "Typed PHP 8 class with promoted properties.",
    lang: "php",
    sample: `<?php
class User {
    public function __construct(
        public int $id,
        public string $name,
        public ?string $email,
        public bool $isAdmin,
    ) {}
}`,
  },
  ruby: {
    id: "ruby",
    slug: "ruby",
    name: "Ruby class",
    blurb: "Ruby class with attr_accessor.",
    lang: "ruby",
    sample: `class User
  attr_accessor :id, :name, :email, :is_admin
  def initialize(id:, name:, email: nil, is_admin: false)
    @id, @name, @email, @is_admin = id, name, email, is_admin
  end
end`,
  },
};

// 这两个数组定义"矩阵"——10 输入 × 15 输出 = 150 页面
export const INPUT_FORMATS: FormatId[] = [
  "json",
  "json-schema",
  "openapi",
  "graphql",
  "sql",
  "protobuf",
  "avro",
  "typescript",
  "mongoose",
  "prisma",
];

export const OUTPUT_FORMATS: FormatId[] = [
  "typescript",
  "zod",
  "yup",
  "joi",
  "pydantic",
  "python-dataclass",
  "go-struct",
  "rust-struct",
  "kotlin",
  "swift",
  "dart",
  "java",
  "csharp",
  "php",
  "ruby",
];

/** 生成所有合法 (from, to) 对 —— 不允许 from === to */
export function allConversions(): Array<{ from: FormatId; to: FormatId }> {
  const out: Array<{ from: FormatId; to: FormatId }> = [];
  for (const f of INPUT_FORMATS) {
    for (const t of OUTPUT_FORMATS) {
      if (f === t) continue;
      out.push({ from: f, to: t });
    }
  }
  return out;
}

export function format(id: FormatId): FormatMeta {
  return FORMATS[id];
}

export function findFormatBySlug(slug: string): FormatMeta | null {
  for (const f of Object.values(FORMATS)) {
    if (f.slug === slug) return f;
  }
  return null;
}
