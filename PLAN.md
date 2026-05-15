# Schemato 运营执行计划

域名：https://www.schemato.top  
GitHub：https://github.com/weitaishan/schemato  
部署：Vercel（push 即自动部署）  
更新时间：2026-05-15

> ⚠️ 这个文档是"未来计划 + 平台规则"。  
> 已经做过的事情请看同目录的 `EXECUTION_LOG.md`。  
> 每完成一项，就把它从这里搬到 `EXECUTION_LOG.md`。

---

## 总目标

按"程序化 SEO 站群 + 开发者工具"的打法跑这个站，**90 天内**判断是否值得继续投入。

90 天判断标准（满足任一条即继续）：

- GSC 总 impressions ≥ 10,000
- 至少 3 个关键词进入 Google 前 30
- 月 UV ≥ 1,000
- Carbon Ads 已通过审核或有第一笔联盟收入

一条都不满足 → 停掉，复用代码骨架做下一个。

---

## 当前可执行的待办（按优先级）

### 🔴 P0 — 今天/明天必须做完

- [ ] **决定 GitHub 仓库是否改 public**
  - 改 public 的好处：能发 r/typescript / r/golang / r/rust（这些 sub 要求开源）
  - 改 public 的坏处：基本没有，工具站本身就是公开服务
  - **建议改 public**

- [ ] **提交 sitemap 到 Google Search Console**
  - 打开 GSC → 左侧"Sitemaps"
  - 输入：`sitemap.xml`（GSC 会自动拼前缀）
  - 提交后等几分钟查看 sitemap 状态

- [ ] **手动触发 GSC 索引**（针对核心页面）
  - GSC → 左上"网址检查" → 输入 `https://www.schemato.top/`
  - 点击"请求编入索引"
  - 重复对：`/json-to-zod`、`/json-to-typescript`、`/json-to-go-struct`

### 🟠 P1 — 本周内做

- [ ] 推广发帖（按下面的"平台规则一览"挑能发的）
- [ ] 加 3 个 `json-schema → X` adapter（typescript / zod / pydantic）
- [ ] 加 1 个 `graphql → typescript` adapter
- [ ] 每天 5 分钟检查 GSC 数据（impressions / 索引页数）

### 🟡 P2 — 第二周开始

- [ ] 加 sql → 多语言 adapter
- [ ] 加 prisma → typescript / zod adapter
- [ ] 写 1~2 篇技术博客（"How we built a 150-page SEO site with Next.js" 这种）
- [ ] 申请 Carbon Ads（要 traffic 数据，等 GSC 出 impressions 后）

---

## 推广平台规则一览（已踩过的坑）

### Reddit

| Sub | 规则要点 | 状态 | 怎么发 |
|---|---|---|---|
| r/webdev | Rule 5：仅周六（Showoff Saturday） | ❌ 工作日发会被删 | **周六**发；或日常用"问题/讨论"形式发，不直接贴链接 |
| r/typescript | Rule 2：必须开源 + 贴 GitHub | ❌ private 仓库发会被拦 | 先把仓库改 public，帖子里贴 GitHub 链接 + 强调技术贡献 |
| r/SideProject | 无明显限制，专门展示项目 | ✅ 可发 | 直接发产品介绍 + 技术栈 + 链接 |
| r/golang | 一般要求开源，不能纯推广 | ⏳ 仓库改 public 后可发 | 强调 json→go-struct 这一格，贴 GitHub |
| r/rust | 类似 r/golang | ⏳ 同上 | 强调 serde 友好的输出 + 开源 |
| r/Python | 可发但要贴 PyPI / GitHub | ⏳ 同上 | 强调 json→pydantic / dataclass |
| r/programming | 要求开源 + 高质量内容 | ⚠️ 慎发 | 等有真实 user feedback 后再发 |

### Hacker News（Show HN）

- 必须是你自己做的产品
- 标题：`Show HN: <产品名> – <一句话价值>`
- **最佳时间**：美东时间周二~周四 上午 9~10 点（北京时间晚 9~10 点）
- 周末效果反而差（与之前 PLAN 写法相反，周末上 HN 首页门槛更高）
- 仓库必须 public，否则可信度低

### ProductHunt

- 周二/周三 launch 效果最好
- 必须有 product video / GIF
- 需要至少几个 follower 才能 launch
- 一个域名只能 launch 一次，**不要太早**——等产品稳定再上

### X（Twitter）

- Build in Public 标签 #buildinpublic
- 第一周：每天发一条进度
- 关注独立开发者（idoubi、levelsio、Marc Lou 等）然后回他们的帖子

### 即刻 App

- 「独立开发者」「AI 探索站」圈子
- 中文区 indie 最活跃的地方
- 适合发：进度更新、求反馈、找合伙人

---

## 推广帖模板（针对不同平台已经改过）

### r/SideProject（无需改 public 也能发）

标题：
```
Schemato — convert JSON to TypeScript, Zod, Go, Rust, Swift and 10 more languages (browser-only, free)
```

正文：
```
I built a tool that turns a JSON sample into typed code for 14 languages.

Live: https://www.schemato.top

Why I made it: I work across TypeScript, Go and Python and got tired of writing types by hand for every API response. Most existing tools (quicktype, etc.) are great but only cover a few output languages, and many require installing something. I wanted one place that runs entirely in the browser.

Tech: Next.js static export, deployed on Vercel. ~150 statically generated pages (10 input formats × 15 output formats). All conversion happens client-side. No API costs, no signup.

Currently working on JSON Schema, GraphQL, SQL DDL, and Protobuf as inputs.

Feedback / feature requests welcome — what would make this useful for your workflow?
```

### r/typescript（先改 public）

标题：
```
[Open source] JSON to TypeScript / Zod converter — handles nested types, optional fields, arrays
```

正文：
```
I open-sourced a small converter that infers TypeScript interfaces and Zod schemas from raw JSON payloads.

GitHub: https://github.com/weitaishan/schemato
Live: https://www.schemato.top/json-to-zod

Built without quicktype — uses a custom JSON shape inferrer (~150 LOC). Each language adapter is ~40-80 LOC, easy to extend.

Relevant code:
- Shape inferrer: lib/converters/json-shape.ts
- TS adapter: lib/converters/json-to-typescript.ts
- Zod adapter: lib/converters/json-to-zod.ts

Would appreciate feedback on:
- Union type handling (currently outputs `unknown` for mixed arrays — should it produce a discriminated union?)
- Number inference (integer vs number — currently widens to `number` if any sample is float)
```

### r/webdev（仅周六发）

标题：
```
[Showoff Saturday] I built a 150-page schema converter with zero API cost (programmatic SEO + Next.js static export)
```

正文：
```
After getting tired of writing types by hand, I built Schemato — a browser-only converter from JSON / OpenAPI / GraphQL etc. into 15 typed languages.

Live: https://www.schemato.top
Repo: https://github.com/weitaishan/schemato

What's interesting from a webdev angle:
- 10 inputs × 15 outputs = ~150 pages, all statically generated via generateStaticParams
- Conversion runs 100% in the browser — paste JSON, get TS / Zod / Go / Rust etc.
- No backend, no API costs, deploys to Vercel free tier
- Each page has its own SEO copy generated structurally (no LLM API at build time)

Currently 14 of 149 conversions are "live"; the rest show a preview of typical output. I add new adapters every few days.

Feedback on the UX, output quality, or what formats you'd want next would be amazing.
```

### Hacker News（Show HN）

标题：
```
Show HN: Schemato – Convert JSON/OpenAPI/GraphQL to 14 typed languages (browser-only)
```

URL：`https://www.schemato.top`

补一条评论：
```
Author here. Built this because I work across TS / Go / Python and got tired of writing types by hand. The interesting bits:

- ~150 statically generated pages (Next.js generateStaticParams + output: export)
- Conversion happens fully client-side, no backend / API cost
- Custom JSON shape inferrer instead of quicktype (smaller, easier to extend per-language)

Currently 14 outputs are wired up for JSON inputs. Working on JSON Schema / GraphQL / SQL / Protobuf next.

Open source: https://github.com/weitaishan/schemato
Happy to answer questions about the SEO + build pipeline.
```

---

## 第一周节奏（写实版）

### 本周

| 日子 | 任务 | 备注 |
|---|---|---|
| 周五（今天） | 改 GitHub 仓库 public + 提交 sitemap + 索引核心页面 | 不要急着发推广 |
| 周六 | 发 r/SideProject + r/webdev（Showoff Saturday） + 即刻 | 一天最多发 2 个 sub |
| 周日 | 加 3 个 adapter（json-schema → ts / zod / pydantic） | 推送后 Vercel 自动部署 |
| 周一 | 发 r/typescript（仓库已 public） + r/golang | 回复每条评论 |
| 周二 | 发 Show HN + 加 graphql → typescript adapter | HN 美东上午发 |
| 周三 | 加 sql → typescript / go-struct adapter | 看 GSC 是否开始有 impressions |
| 周四 | 发 r/rust + r/Python + 整理本周数据 | 写复盘 |

---

## 每天 10 分钟例行检查

### Google Search Console

- 编制索引 → 网页：索引数量是否在涨
- 效果 → 查询：是否出现新关键词
- 效果 → 网页：哪些页面有展示

### Vercel Analytics

- 今日 UV
- 流量来源（Google / Reddit / Direct）
- 热门页面

### 反馈收集

- Reddit 帖子的评论
- GitHub Issues / Stars
- 任何"能不能加 X"的需求都记下来 → 优先做

---

## Adapter 开发优先级

| 优先级 | 输入格式 | 状态 | 备注 |
|---|---|---|---|
| ✅ 完成 | json | 14/15 个输出 Live | 唯一缺 typescript→typescript（不需要） |
| 🔴 下一步 | json-schema | 0/15 | 企业开发者高频，竞争小 |
| 🔴 下一步 | graphql | 0/15 | 前端开发者刚需 |
| 🟠 第二周 | sql DDL | 0/15 | 后端开发者刚需 |
| 🟠 第二周 | prisma | 0/15 | Prisma 社区活跃 |
| 🟡 第三周 | protobuf | 0/15 | gRPC 场景 |
| 🟡 第三周 | openapi | 0/15 | 实现复杂但搜索量大 |
| 🟢 后置 | avro / mongoose / typescript（反向） | 0/15 | 长尾 |

---

## 加一个新 adapter 的标准步骤

1. 创建 `lib/converters/<from-slug>-to-<to-slug>.ts`，导出一个 `ConvertFn`
2. 在 `lib/converters/index.ts` 顶部 `import` 进来
3. 在 `index.ts` 底部 `register("<from>", "<to>", fn)`
4. 跑 `npm run build`，确认 `output` 看到 155 静态页面 + 没有报错
5. `git add . && git commit -m "feat: add <from>→<to> adapter" && git push`
6. Vercel 自动部署完后，对应页面从 Preview 变成 Live

---

## 变现路径

```
Month 1     纯流量积累，不做任何变现尝试
Month 2     有 GSC impressions 后申请 Carbon Ads
Month 3     有真实 UV 后接联盟链接（Vercel / Supabase / Sentry referral）
Month 4+    根据数据决定要不要做付费功能（VS Code 插件、批量 API、CLI）
```

---

## 决策记录

记录关键决策（避免反复推翻）：

- **2026-05-15** 选定方向：开发者 schema 转换站（替代之前的 ecommerce 文案站）  
  原因：竞争更小、付费意愿更强、个人技术栈更匹配

- **2026-05-15** 域名选 `.top`  
  代价：开发者圈对 `.top` 信任度略低、SEO 起步多一点阻力  
  接受：内容质量是主要因素，TLD 是次要因素

- **2026-05-15** 选 Next.js + output: export 静态导出  
  原因：零运行成本，全部托管 Vercel 免费层，构建期生成所有页面对 SEO 友好

- **待决** GitHub 仓库 public/private：影响推广路径，建议改 public

---

## 风险记录

- **r/webdev / r/typescript 等 sub 的反推广规则**：必须包装成"开源 + 技术分享"，不能裸推链接
- **`.top` TLD 在 Carbon Ads / Google Trust 上略受影响**：长期来看靠内容质量补偿
- **Google AI 内容反作弊**：我们的页面不是 AI 生成水文，是真实工具 + 结构化文案，但仍需密切观察 GSC "已索引但未编入索引"的状态
- **Next.js 升级风险**：升级时 sitemap/robots 可能需要 `force-static`（已踩过）

---

## 文件结构提醒

```
schemato/
├── PLAN.md              ← 这份文档（未来计划）
├── EXECUTION_LOG.md     ← 已经做过的事情（每完成一项就搬过去）
├── README.md            ← 给开源贡献者看
├── app/                 ← Next.js App Router
├── components/
├── lib/
│   ├── formats.ts       ← 24 种格式注册表
│   ├── seo-copy.ts      ← 每页 SEO 文案生成器
│   └── converters/      ← 所有 adapter
└── ...
```
