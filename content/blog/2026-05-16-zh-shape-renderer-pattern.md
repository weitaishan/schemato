---
平台: 掘金 / 即刻 / V2EX (创意工作者节点)
标题: 写一个能生成 149 个工具页的 Next.js 站，关键是这个抽象
副标题: parser × renderer 矩阵架构的一次小型实战
---

> 文末有项目链接，正文先讲架构和取舍。

## 起因

每周我都要做这种事：

1. 从浏览器 Network 里复制一段 JSON 响应
2. 手写 TypeScript interface
3. 同样的形状再写一遍 Zod schema
4. 后端是 Python 的话再写一遍 Pydantic
5. 总有一个地方 optional 写错，跑起来才发现

quicktype 解决了一部分，但我想试一个更轻的形态：每一个 "X 转 Y" 都是一个独立网页，比如 "JSON to Zod"、"OpenAPI to Pydantic"。用户不用装 CLI，也不用配置项目，只要贴一段输入，就能拿到一个可以继续手改的起点。

这类站很容易滑向"换变量生成页面"。所以我一开始就给自己定了一个约束：页面首先必须是工具，其次才谈搜索流量。

几个判断：

- 薄内容页面不值得做，页面必须真的能完成转换
- 静态导出 + CDN 足够支撑 150 页规模，不需要后端
- LLM 可以帮忙写样例和重复代码，但核心抽象还是要自己设计

下面是我最后落地的架构。**整个项目大概 3000 行，部署在 Vercel 免费层，构建 10 秒，149 个独立静态页面。**

## 矩阵

整个站围绕一个 10×15 的矩阵：

```
输入格式（行）              输出语言（列）
JSON                        TypeScript
JSON Schema                 Zod
OpenAPI 3.x                 Yup
GraphQL SDL                 Joi
SQL DDL                     Pydantic
Protobuf                    Python dataclass
Prisma schema               Go struct
TypeScript（反向）          Rust struct
Mongoose                    Swift Codable
Avro                        Kotlin data class
                            Java record
                            C# record
                            Dart class
                            PHP class
                            Ruby class
```

每个格子一个 URL：`/<input>-to-<output>`。一共 149 个独立页面（跳过 typescript→typescript 自身）。

设计上最关键的约束是：**绝对不能写 149 个 adapter**。否则项目永远写不完。

## 抽象：Parser × Renderer

核心思路两步：

```
input string ──► parser ──► 内部 Shape ──► renderer ──► output code
                  ↑                          ↑
            一个格式一个               一个语言一个
```

不写 149 个函数，而是 10 个 parser × 15 个 renderer = 25 个小模块。

中间的 `Shape` 是关键合约：

```ts
type ShapeKind =
  | "string" | "integer" | "number" | "boolean" | "null" | "any"
  | "object" | "array" | "union";

interface Shape {
  kind: ShapeKind;
  fields?: Record<string, { shape: Shape; optional: boolean }>;
  items?: Shape;
  variants?: Shape[];
  typeName?: string;
}
```

每个 parser 输出 `Shape`，每个 renderer 消费 `Shape`。**parser 不知道 TypeScript 是什么，renderer 也不知道 JSON 是什么。**

加新输入格式 = 写一个 `xxxToShape(input)`，立刻获得 15 个新输出页面。  
加新输出语言 = 写一个 `renderXxx(shape)`，立刻让所有输入格式多一个目标。

这是这个项目能做出来的根本原因。

## 页面和搜索上的几个取舍

### 1. 不要用 SoftwareApplication 这个 schema 类型

SoftwareApplication 和 WebApplication 都可能牵涉到 `aggregateRating`（评分）这类字段。不填会有提示，但为了过提示去伪造评分就很危险。

我最后用的是 `HowTo`。每个工具页本来就是"如何把 X 转成 Y"，语义更贴近，也不用为了结构化数据去编不存在的评分。

### 2. 不能让 150 页内容长一个样

如果 150 页只是同一个模板替换变量，用户也看得出来。我做的是：先手写最重要的 30 个 pair 的 intro，把场景具体到框架名和工作流（FastAPI、sqlx、Codable 等）。剩下的页面再用保守模板兜底。

举例对比：

模板话：
> "This tool converts JSON to TypeScript types. Paste your JSON and get types..."

场景化：
> "Most front-end engineers reach for this conversion when integrating a third-party API and the docs don't ship type definitions. Paste a real response and you get an interface that exactly matches the data on the wire — no Postman copy-paste, no manual typing, no drift."

### 3. sitemap.xml 的 priority 要诚实

Live 页面（工具真实可用）priority 0.8，preview 页面（如果有占位）priority 0.4。不要把所有 URL 都标成 1.0，站点自己也应该知道哪些页面更重要。

### 4. 每页 3~5 个真实业务样例

不是只有一个 default sample。每种输入都准备 User profile / E-commerce order / Stripe charge / GitHub issue / OpenAPI YAML / 多表 SQL DDL 等场景。用户可以切换样例，也更容易判断这个工具是否适合自己的数据。

## Next.js 的部分

App Router 的 `generateStaticParams` 一次性生成所有页面：

```ts
// app/[slug]/page.tsx
export async function generateStaticParams() {
  return allConversions().map((c) => ({
    slug: `${FORMATS[c.from].slug}-to-${FORMATS[c.to].slug}`,
  }));
}
export const dynamicParams = false;
```

`next.config.ts` 里 `output: "export"`，build 后 `out/` 里就是 149 个独立 HTML。`vercel deploy` 一行部署，全部静态托管。

需要避开的坑：`opengraph-image.tsx` 在 `output: export` 模式下不能用——必须用静态 SVG。这点我吃过亏。

## 数据

- 149 个独立静态页面
- 10 个 parser + 15 个 renderer，~3000 行 TS 总量
- 构建 ~10s
- Vercel 免费层托管，无 serverless 函数
- bundle 共享 100kB，每页 ~1kB
- 月成本 $0（除域名）

## 项目

部署在 https://www.schemato.top  
开源在 https://github.com/weitaishan/schemato

如果你也在做开发者工具、代码生成器，或者类似的矩阵型产品，欢迎交流。这个项目目前还很早期，我更想观察的是：这种"页面就是产品功能"的形态，在 30 / 60 / 90 天会发生什么。
