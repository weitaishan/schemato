---
平台: 掘金 / 即刻 / V2EX (创意工作者节点)
标题: 写一个能跑出 150 个页面的程序化 SEO 站，最关键的是这个抽象
副标题: 一次完整的 parser × renderer 矩阵架构实战
---

> 文末有项目链接，先讲做法。

## 起因

每周我都要做这种事：

1. 从浏览器 Network 里复制一段 JSON 响应
2. 手写 TypeScript interface
3. 同样的形状再写一遍 Zod schema
4. 后端是 Python 的话再写一遍 Pydantic
5. 总有一个地方 optional 写错，跑起来才发现

quicktype 解决了一部分，但只覆盖几种输出语言，并且要装东西。我想要的是：每一个 "X 转 Y" 都有一个独立的网页，标题就是 "JSON to Zod"、"OpenAPI to Pydantic"，方便 Google 把搜索这些词的人送过来。

这就是程序化 SEO 站。但 2026 年再做这种站，比 2022 年要小心：

- AI 灌水内容现在被 Google 主动打压，不是被忽略
- 静态导出 + 边缘 CDN，让 150 页规模的站托管成本几乎为零
- LLM 让"写每页的真实业务逻辑"变得便宜了，所以应该把人力都花在内容深度上

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

## SEO 上的几个非显然的细节

### 1. 不要用 SoftwareApplication 这个 schema 类型

SoftwareApplication 和 WebApplication 都要求 `aggregateRating`（评分），不填会被 Google Search Console 提示。但**伪造评分会触发手动惩罚**。

正确做法：用 `HowTo`。每个工具页本来就是"如何把 X 转成 Y"，语义匹配，且不要求评分。

### 2. 不能让 150 页内容长一个样

Google 的反 spam 系统就是为了识别"同模板、不同变量"。我做的是：手写 30 个搜索量最高的 pair 的 intro，把它们的应用场景具体到框架名（FastAPI、sqlx、Codable 等）。剩下 120 页用 fallback 模板，无所谓——Google 排名是 per-page 的，30 个有差异的页面足够拉动整站权重。

举例对比：

模板话：
> "This tool converts JSON to TypeScript types. Paste your JSON and get types..."

场景化：
> "Most front-end engineers reach for this conversion when integrating a third-party API and the docs don't ship type definitions. Paste a real response and you get an interface that exactly matches the data on the wire — no Postman copy-paste, no manual typing, no drift."

### 3. sitemap.xml 的 priority 要反映真实情况

Live 页面（工具真实可用）priority 0.8，preview 页面（占位）priority 0.4。这告诉 Google 把抓取预算花在真正有用的页面上。

### 4. 每页 3~5 个真实业务样例

不是只有一个 default sample。每种输入都准备：User profile / E-commerce order / Stripe charge / GitHub issue / OpenAPI YAML / 多表 SQL DDL 等场景。用户能切换，Google 抓到的是真实结构化数据，停留时长也会涨。

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

## 站点

部署在 https://www.schemato.top  
开源在 https://github.com/weitaishan/schemato

如果你也在做程序化 SEO 站，特别是开发者向工具类的，欢迎交流——30/60/90 天的关键节点判断，不同细分赛道差别很大，多看几份样本数据有帮助。
