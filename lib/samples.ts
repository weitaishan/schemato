// 每个输入格式的"3~5 个真实业务样例"
// 用户在工具页面可以一键切换，看不同场景的转换结果。

import type { FormatId } from "./formats";

export interface Sample {
  id: string;
  /** 给用户显示的名字 */
  label: string;
  /** 一句话描述这个样例代表的真实场景 */
  blurb: string;
  /** 实际的输入代码 */
  code: string;
}

const JSON_SAMPLES: Sample[] = [
  {
    id: "user",
    label: "User profile",
    blurb: "Typical user object from a /me API response",
    code: `{
  "id": 1,
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "isAdmin": false,
  "tags": ["math", "engine"]
}`,
  },
  {
    id: "order",
    label: "E-commerce order",
    blurb: "An order with line items and shipping address",
    code: `{
  "id": "ord_12345",
  "customerId": 42,
  "status": "paid",
  "totalCents": 8990,
  "currency": "USD",
  "items": [
    { "sku": "TSHIRT-RED-M", "quantity": 1, "priceCents": 2990 },
    { "sku": "MUG-LOGO", "quantity": 2, "priceCents": 3000 }
  ],
  "shipping": {
    "name": "Ada Lovelace",
    "line1": "1 Engine Way",
    "city": "London",
    "country": "GB",
    "postalCode": "SW1A 1AA"
  }
}`,
  },
  {
    id: "product",
    label: "Product catalog item",
    blurb: "A storefront product with optional discount and variants",
    code: `{
  "id": "prod_abc",
  "title": "Linen Shirt",
  "priceCents": 4500,
  "discountCents": null,
  "inStock": true,
  "variants": [
    { "size": "S", "color": "white", "stock": 12 },
    { "size": "M", "color": "white", "stock": 4 }
  ]
}`,
  },
  {
    id: "github-issue",
    label: "GitHub issue",
    blurb: "Trimmed shape of GET /repos/{owner}/{repo}/issues/{number}",
    code: `{
  "id": 1,
  "number": 1347,
  "title": "Found a bug",
  "user": { "login": "octocat", "id": 1 },
  "labels": [{ "id": 208, "name": "bug" }],
  "state": "open",
  "comments": 0,
  "created_at": "2011-04-22T13:33:48Z",
  "closed_at": null
}`,
  },
  {
    id: "stripe-charge",
    label: "Stripe-like charge",
    blurb: "Payment object similar to Stripe's API response",
    code: `{
  "id": "ch_3MqK",
  "amount": 2000,
  "currency": "usd",
  "status": "succeeded",
  "paid": true,
  "refunded": false,
  "metadata": {
    "order_id": "ord_12345"
  }
}`,
  },
];

const JSONSCHEMA_SAMPLES: Sample[] = [
  {
    id: "user",
    label: "User profile",
    blurb: "Draft 2020-12 schema with required fields",
    code: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "User",
  "type": "object",
  "required": ["id", "name"],
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string" },
    "email": { "type": "string", "format": "email" },
    "isAdmin": { "type": "boolean" }
  }
}`,
  },
  {
    id: "address",
    label: "Address with $ref",
    blurb: "Schema using $defs for reusable address shape",
    code: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Customer",
  "type": "object",
  "required": ["id", "address"],
  "properties": {
    "id": { "type": "string" },
    "address": { "$ref": "#/$defs/Address" }
  },
  "$defs": {
    "Address": {
      "type": "object",
      "required": ["line1", "country"],
      "properties": {
        "line1": { "type": "string" },
        "city": { "type": "string" },
        "country": { "type": "string" },
        "postalCode": { "type": "string" }
      }
    }
  }
}`,
  },
  {
    id: "enum",
    label: "Enum and oneOf",
    blurb: "Schema with status enum and discriminated payment method",
    code: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Order",
  "type": "object",
  "required": ["id", "status"],
  "properties": {
    "id": { "type": "string" },
    "status": { "type": "string", "enum": ["pending", "paid", "shipped"] },
    "payment": {
      "oneOf": [
        { "type": "object", "properties": { "kind": { "const": "card" }, "last4": { "type": "string" } } },
        { "type": "object", "properties": { "kind": { "const": "wallet" }, "provider": { "type": "string" } } }
      ]
    }
  }
}`,
  },
];

const OPENAPI_SAMPLES: Sample[] = [
  {
    id: "user",
    label: "User schema (YAML)",
    blurb: "components.schemas.User in YAML form",
    code: `openapi: 3.0.3
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
        email: { type: string, format: email }
        isAdmin: { type: boolean }`,
  },
  {
    id: "order-json",
    label: "Order with $ref (JSON)",
    blurb: "JSON OpenAPI doc with two related schemas",
    code: `{
  "openapi": "3.0.3",
  "info": { "title": "Sample", "version": "1.0.0" },
  "paths": {},
  "components": {
    "schemas": {
      "Order": {
        "type": "object",
        "required": ["id", "items"],
        "properties": {
          "id": { "type": "string" },
          "totalCents": { "type": "integer" },
          "items": { "type": "array", "items": { "$ref": "#/components/schemas/LineItem" } }
        }
      },
      "LineItem": {
        "type": "object",
        "required": ["sku", "quantity"],
        "properties": {
          "sku": { "type": "string" },
          "quantity": { "type": "integer" },
          "priceCents": { "type": "integer" }
        }
      }
    }
  }
}`,
  },
  {
    id: "product",
    label: "Product (YAML)",
    blurb: "Catalog item with nullable discount and nested variants",
    code: `openapi: 3.0.3
info:
  title: Sample
  version: 1.0.0
paths: {}
components:
  schemas:
    Product:
      type: object
      required: [id, title, priceCents]
      properties:
        id: { type: string }
        title: { type: string }
        priceCents: { type: integer }
        discountCents:
          type: integer
          nullable: true
        variants:
          type: array
          items:
            type: object
            properties:
              size: { type: string }
              color: { type: string }
              stock: { type: integer }`,
  },
];

const GRAPHQL_SAMPLES: Sample[] = [
  {
    id: "user",
    label: "User type",
    blurb: "Simple SDL with non-null and optional fields",
    code: `type User {
  id: ID!
  name: String!
  email: String
  isAdmin: Boolean!
}`,
  },
  {
    id: "post",
    label: "Post + Author (relations)",
    blurb: "SDL with nested type relations",
    code: `type Author {
  id: ID!
  name: String!
}

type Post {
  id: ID!
  title: String!
  body: String!
  author: Author!
  tags: [String!]!
  publishedAt: String
}`,
  },
  {
    id: "input",
    label: "Mutation input type",
    blurb: "Using `input` for write operations",
    code: `input CreateProductInput {
  title: String!
  priceCents: Int!
  description: String
  tags: [String!]
}

type Product {
  id: ID!
  title: String!
  priceCents: Int!
}`,
  },
];

const SQL_SAMPLES: Sample[] = [
  {
    id: "users",
    label: "users table",
    blurb: "Postgres table with NOT NULL and DEFAULT",
    code: `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`,
  },
  {
    id: "orders",
    label: "orders + line_items",
    blurb: "Two related tables with foreign keys",
    code: `CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  status VARCHAR(32) NOT NULL,
  total_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE line_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id),
  sku TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price_cents INTEGER NOT NULL
);`,
  },
  {
    id: "mysql",
    label: "MySQL products table",
    blurb: "MySQL DDL with VARCHAR, DECIMAL and TINYINT",
    code: `CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  in_stock TINYINT(1) NOT NULL DEFAULT 1,
  description TEXT
);`,
  },
];

const PROTOBUF_SAMPLES: Sample[] = [
  {
    id: "user",
    label: "User message",
    blurb: "proto3 message with primitive fields",
    code: `syntax = "proto3";

message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
  bool is_admin = 4;
}`,
  },
  {
    id: "order",
    label: "Order with repeated items",
    blurb: "Nested messages and repeated fields",
    code: `syntax = "proto3";

message LineItem {
  string sku = 1;
  int32 quantity = 2;
  int64 price_cents = 3;
}

message Order {
  string id = 1;
  int64 customer_id = 2;
  string status = 3;
  int64 total_cents = 4;
  repeated LineItem items = 5;
}`,
  },
  {
    id: "optional",
    label: "Optional fields (proto3)",
    blurb: "proto3 with explicit `optional` keyword",
    code: `syntax = "proto3";

message Product {
  string id = 1;
  string title = 2;
  int64 price_cents = 3;
  optional int64 discount_cents = 4;
  repeated string tags = 5;
}`,
  },
];

const PRISMA_SAMPLES: Sample[] = [
  {
    id: "user",
    label: "User model",
    blurb: "Standard Prisma model with @id, @unique, @default",
    code: `model User {
  id      Int     @id @default(autoincrement())
  name    String
  email   String? @unique
  isAdmin Boolean @default(false)
}`,
  },
  {
    id: "post",
    label: "User + Post relation",
    blurb: "One-to-many relation between two models",
    code: `model User {
  id    Int    @id @default(autoincrement())
  name  String
  posts Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  body      String
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
  publishedAt DateTime?
}`,
  },
  {
    id: "ecommerce",
    label: "E-commerce schema",
    blurb: "Order with embedded JSON metadata",
    code: `model Order {
  id          Int      @id @default(autoincrement())
  customerId  Int
  status      String
  totalCents  Int
  metadata    Json?
  createdAt   DateTime @default(now())
  items       LineItem[]
}

model LineItem {
  id         Int    @id @default(autoincrement())
  orderId    Int
  order      Order  @relation(fields: [orderId], references: [id])
  sku        String
  quantity   Int
  priceCents Int
}`,
  },
];

const TYPESCRIPT_SAMPLES: Sample[] = [
  {
    id: "user",
    label: "User interface",
    blurb: "Plain interface with optional fields",
    code: `export interface User {
  id: number;
  name: string;
  email?: string;
  isAdmin: boolean;
}`,
  },
  {
    id: "post",
    label: "Post + Author types",
    blurb: "Two related interfaces",
    code: `export interface Author {
  id: string;
  name: string;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  author: Author;
  tags: string[];
  publishedAt: string | null;
}`,
  },
  {
    id: "type-alias",
    label: "type alias with array",
    blurb: "Using `type` instead of `interface`",
    code: `export type Product = {
  id: string;
  title: string;
  priceCents: number;
  discountCents: number | null;
  variants: { size: string; color: string; stock: number }[];
};`,
  },
];

const MONGOOSE_SAMPLES: Sample[] = [
  {
    id: "user",
    label: "User schema",
    blurb: "Standard Mongoose schema with required fields",
    code: `const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  isAdmin: { type: Boolean, default: false }
});`,
  },
  {
    id: "post",
    label: "Post schema with array",
    blurb: "Schema with array of strings and ObjectId reference",
    code: `const postSchema = new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tags: [String],
  publishedAt: Date
});`,
  },
  {
    id: "product",
    label: "Product with nested schema",
    blurb: "Schema mixing required, optional, and arrays",
    code: `const productSchema = new Schema({
  title: { type: String, required: true },
  priceCents: { type: Number, required: true },
  description: String,
  tags: [String],
  inStock: { type: Boolean, default: true }
});`,
  },
];

const AVRO_SAMPLES: Sample[] = [
  {
    id: "user",
    label: "User record",
    blurb: "Avro record with nullable email",
    code: `{
  "type": "record",
  "name": "User",
  "fields": [
    { "name": "id", "type": "int" },
    { "name": "name", "type": "string" },
    { "name": "email", "type": ["null", "string"], "default": null },
    { "name": "isAdmin", "type": "boolean", "default": false }
  ]
}`,
  },
  {
    id: "event",
    label: "Event with enum",
    blurb: "Record using an Avro enum and array",
    code: `{
  "type": "record",
  "name": "ClickEvent",
  "fields": [
    { "name": "id", "type": "string" },
    { "name": "userId", "type": "long" },
    { "name": "page", "type": "string" },
    { "name": "kind", "type": { "type": "enum", "name": "Kind", "symbols": ["click", "scroll", "submit"] } },
    { "name": "tags", "type": { "type": "array", "items": "string" }, "default": [] }
  ]
}`,
  },
  {
    id: "nested",
    label: "Order + Address (nested record)",
    blurb: "One record containing another record",
    code: `{
  "type": "record",
  "name": "Order",
  "fields": [
    { "name": "id", "type": "string" },
    { "name": "totalCents", "type": "long" },
    {
      "name": "shipping",
      "type": {
        "type": "record",
        "name": "Address",
        "fields": [
          { "name": "line1", "type": "string" },
          { "name": "city", "type": "string" },
          { "name": "country", "type": "string" }
        ]
      }
    }
  ]
}`,
  },
];

export const SAMPLES: Partial<Record<FormatId, Sample[]>> = {
  json: JSON_SAMPLES,
  "json-schema": JSONSCHEMA_SAMPLES,
  openapi: OPENAPI_SAMPLES,
  graphql: GRAPHQL_SAMPLES,
  sql: SQL_SAMPLES,
  protobuf: PROTOBUF_SAMPLES,
  prisma: PRISMA_SAMPLES,
  typescript: TYPESCRIPT_SAMPLES,
  mongoose: MONGOOSE_SAMPLES,
  avro: AVRO_SAMPLES,
};

/** 取格式的样例集，没有则 fallback 到 formats.ts 里的默认 sample */
export function samplesFor(id: FormatId, fallback: string): Sample[] {
  const list = SAMPLES[id];
  if (list && list.length > 0) return list;
  return [{ id: "default", label: "Default sample", blurb: "Built-in sample", code: fallback }];
}
