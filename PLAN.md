# Schemato 运营执行计划

域名：https://www.schemato.top  
GitHub：https://github.com/weitaishan/money-project-2  
部署：Vercel（自动部署，push 即生效）  
更新时间：2026-05-15

---

## 当前状态

已完成：

- [x] 域名 `schemato.top` 已购买并绑定 Vercel
- [x] 网站已上线，155 个静态页面
- [x] 14 个 json→X 转换器真实可用
- [x] sitemap.xml + robots.txt 自动生成
- [x] Google Search Console 已验证
- [x] sitemap 已提交
- [x] Google Analytics（Vercel Analytics 自带）
- [x] 每页独立 SEO 文案（title / description / intro / FAQ / 内链）

当前 Live 转换器（14 个）：

```
json → typescript
json → zod
json → pydantic
json → go-struct
json → rust-struct
json → swift
json → kotlin
json → java
json → csharp
json → dart
json → yup
json → joi
json → python-dataclass
json → php
json → ruby
```

---

## 第一周执行计划

### Day 1（已完成 ✅）

- [x] 买域名
- [x] 推 GitHub
- [x] 连 Vercel 部署
- [x] 绑域名 DNS
- [x] Google Search Console 验证
- [x] 提交 sitemap

### Day 2：推广（Reddit 第一波）

- [ ] 发帖 r/webdev
- [ ] 发帖 r/typescript
- [ ] 回复所有评论

### Day 3：推广（Reddit 第二波）

- [ ] 发帖 r/golang
- [ ] 发帖 r/rust
- [ ] 回复所有评论

### Day 4：开发

- [ ] 加 adapter：json-schema → typescript
- [ ] 加 adapter：json-schema → zod
- [ ] 加 adapter：json-schema → pydantic
- [ ] 构建 + 推送

### Day 5：开发

- [ ] 加 adapter：graphql → typescript
- [ ] 加 adapter：sql → typescript
- [ ] 加 adapter：sql → go-struct
- [ ] 构建 + 推送

### Day 6：推广 + 开发

- [ ] 发 Hacker News Show HN
- [ ] 加 adapter：prisma → typescript
- [ ] 加 adapter：prisma → zod

### Day 7：复盘

- [ ] 检查 GSC：是否有页面被索引
- [ ] 检查 GSC：是否有 impressions
- [ ] 检查 Reddit 帖子数据（upvotes / comments / 流量）
- [ ] 记录本周 UV
- [ ] 规划下周 adapter 优先级

---

## Reddit 推广帖（复制粘贴即用）

### r/webdev

标题：
```
I built a free browser-only schema converter — paste JSON, get TypeScript, Zod, Go, Rust, Pydantic (14 languages)
```

正文：
```
Hey everyone,

I made a small tool that converts JSON into typed code for 14 languages — TypeScript interfaces, Zod schemas, Pydantic models, Go structs, Rust structs, Kotlin data classes, Swift Codable, Java records, C#, Dart, PHP, Ruby, Yup, and Joi.

It runs 100% in the browser. Nothing is uploaded, no signup, no API calls.

I built it because I got tired of writing types by hand every time I got a new API response. Paste the JSON, copy the output, done.

https://www.schemato.top

It also has ~150 pages covering different input→output combinations (JSON Schema, OpenAPI, GraphQL, SQL, Protobuf as inputs are coming next).

Would love feedback — what formats or features would make this more useful for your workflow?
```

### r/typescript

标题：
```
Free tool: paste JSON, get TypeScript interfaces or Zod schemas (browser-only, no signup)
```

正文：
```
Built a quick converter that infers TypeScript interfaces and Zod schemas from raw JSON payloads. Handles nested objects, arrays, optional fields.

Runs entirely client-side, nothing leaves your browser.

https://www.schemato.top/json-to-zod
https://www.schemato.top/json-to-typescript

Also supports Yup, Joi, and 10 other output languages if you need them.

What edge cases should I handle better? Happy to take suggestions.
```

### r/golang

标题：
```
JSON to Go struct converter (free, browser-only, with json tags)
```

正文：
```
Made a small tool that converts a JSON sample into Go structs with proper json tags, pointer types for optional fields, and omitempty where appropriate.

https://www.schemato.top/json-to-go-struct

No signup, runs in the browser. Also supports 13 other output languages (TypeScript, Rust, Python, etc.) if you work across stacks.

Feedback welcome — anything you'd want it to handle differently?
```

### r/rust

标题：
```
JSON to Rust struct converter (with serde derives, free, browser-only)
```

正文：
```
Built a tool that takes a JSON sample and generates Rust structs with #[derive(Serialize, Deserialize)], Option<T> for nullable fields, and serde rename attributes when field names aren't valid Rust identifiers.

https://www.schemato.top/json-to-rust-struct

Runs entirely in the browser, no data uploaded. Also does 13 other languages.

Would appreciate feedback on the output quality — what would you change?
```

### Hacker News（周末发）

标题：
```
Show HN: Schemato – Convert JSON/OpenAPI/GraphQL to 14 typed languages (browser-only)
```

URL：`https://www.schemato.top`

发帖时间：周六上午 9-11 点（美国东部时间），对应北京时间周六晚 9-11 点。

---

## 发帖注意事项

1. 不要同一天全发——今天 r/webdev + r/typescript，明天 r/golang + r/rust
2. 先看每个 sub 的规则——有些要求 flair，有些不允许纯推广
3. 回复每一条评论——Reddit 算法因互动多而推高帖子
4. 如果有人说"quicktype 已经做了"——回复：quicktype 只覆盖 JSON→types，我在做更多输入格式（OpenAPI/GraphQL/SQL/Protobuf），且完全浏览器端不需要安装
5. 如果有人提需求（"能不能加 X"）——记下来，优先做，然后回复告诉他做好了

---

## 第 2~4 周计划

### Week 2

目标：覆盖 json-schema + graphql 输入格式

- [ ] json-schema → 全部 15 个输出
- [ ] graphql → 全部 15 个输出
- [ ] 总 Live 数达到 44+
- [ ] 发 r/python（json-to-pydantic）
- [ ] 发 r/swift（json-to-swift）

### Week 3

目标：覆盖 sql + protobuf 输入格式

- [ ] sql → 全部 15 个输出
- [ ] protobuf → 全部 15 个输出
- [ ] 总 Live 数达到 74+
- [ ] 发 ProductHunt
- [ ] 发 X/Twitter build in public

### Week 4

目标：变现准备

- [ ] 检查 GSC impressions 数据
- [ ] 申请 Carbon Ads（开发者向广告网络，RPM 高）
- [ ] 加联盟链接位（Vercel / Supabase / Sentry referral）
- [ ] 根据 GSC 数据优化排名靠前的页面

---

## Adapter 开发优先级

| 优先级 | 输入格式 | 原因 |
|---|---|---|
| P0 | json（已完成 ✅） | 搜索量最大 |
| P1 | json-schema | 企业开发者高频 |
| P1 | graphql | 前端开发者刚需 |
| P2 | sql | 后端开发者刚需 |
| P2 | prisma | Prisma 社区活跃 |
| P2 | protobuf | 微服务/gRPC 场景 |
| P3 | openapi | 搜索量大但实现复杂 |
| P3 | avro | 数据工程场景 |
| P3 | mongoose | Node.js 社区 |
| P3 | typescript（作为输入） | 反向转换需求 |

---

## 如何加一个新 adapter

1. 创建 `lib/converters/<from>-to-<to>.ts`，导出一个 `ConvertFn`
2. 在 `lib/converters/index.ts` 里 import 并 `register("<from>", "<to>", yourFn)`
3. 运行 `npm run build` 确认无报错
4. `git add . && git commit -m "feat: add <from>→<to> adapter" && git push`
5. Vercel 自动部署，页面从 "Preview" 变成 "Live"

---

## 变现路径

```
阶段 1（Month 1-2）：纯 SEO 流量积累
阶段 2（Month 2-3）：申请 Carbon Ads（开发者广告，RPM $2-$5）
阶段 3（Month 3-4）：加联盟链接（Vercel/Supabase/Sentry，单次 $50-$200）
阶段 4（Month 4+）：付费功能（批量转换、API 访问、VS Code 插件）
```

---

## 90 天判断标准

到第 90 天，满足以下任一条就继续投入：

- GSC 总 impressions ≥ 10,000
- 至少 3 个关键词进入 Google 前 30
- 月 UV ≥ 1,000
- Carbon Ads 已通过审核或有第一笔联盟收入

一条都不满足 → 停掉，换方向。但代码骨架和经验不会浪费。

---

## 每天固定检查（10 分钟）

Google Search Console：
- 效果 → 查询（有没有新关键词出现）
- 效果 → 网页（哪些页面有展示）
- 编制索引 → 网页（索引了多少）

Vercel Analytics：
- 今日 UV
- 来源（Reddit / Google / Direct）
- 热门页面

---

## 竞品参考

| 竞品 | 覆盖范围 | 我们的差异 |
|---|---|---|
| quicktype.io | JSON → 多语言 types | 我们覆盖更多输入格式 + Zod/Yup/Joi/Pydantic |
| transform.tools | 多种转换 | 我们专注 schema→code，SEO 更聚焦 |
| json2ts.com | JSON → TypeScript only | 我们 14 种输出 |
| app.quicktype.io | 需要安装 / 在线但功能有限 | 我们纯浏览器、零依赖 |

---

## 参考资源

- Carbon Ads 申请：https://www.carbonads.net/
- Vercel Referral：https://vercel.com/referral
- Supabase Partner：https://supabase.com/partners
- Reddit 发帖最佳时间：美东时间上午 8-10 点（北京时间晚 8-10 点）
- HN Show HN 最佳时间：美东时间周六上午
