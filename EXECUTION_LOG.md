# Schemato 执行日志

按时间顺序记录每一步实际执行了什么、结果如何、踩了什么坑。  
这是事实记录，不是计划。

---

## 2026-05-15

### 项目搭建

- ✅ 创建 Next.js 15 项目骨架（后升级到 Next.js 16.2.6）
- ✅ TailwindCSS + TypeScript 配置完成
- ✅ 设计 10×15 输入输出矩阵（10 输入格式，15 输出格式，共 149 个合法组合）
- ✅ 实现 JSON Shape 推断器（`lib/converters/json-shape.ts`）
- ✅ 实现动态路由 `app/[slug]/page.tsx` + `generateStaticParams` 一次性生成 149 页
- ✅ 实现 SEO 文案生成器（`lib/seo-copy.ts`），每页独立 title/description/intro/FAQ
- ✅ 实现 sitemap.ts + robots.ts（force-static 模式适配 output: export）
- ✅ 实现首页矩阵展示 + 转换器双面板 UI

### 实现的 Adapter（149 个 Live · 100% 覆盖率 🎉）

架构升级：把 15 个语言渲染器集中到 `lib/converters/renderers.ts`，再写一个 `bridge(parser, target)` 桥接函数。任何新输入格式只要写一个 `xxxToShape(input)` 解析器，就能自动获得全部 15 个输出。

| 输入格式 | Live 输出数 | 说明 |
|---|---|---|
| JSON | 15/15 ✅ | 14 个独立 adapter + 1 个统一架构 |
| JSON Schema | 15/15 ✅ | bridge 自动获得 |
| GraphQL SDL | 15/15 ✅ | bridge 自动获得 |
| SQL DDL | 15/15 ✅ | Postgres / MySQL / SQLite 公共子集 |
| TypeScript（反向） | 14/15 ✅ | 跳过 typescript→typescript 自身 |
| Protobuf | 15/15 ✅ | 解析 message 块 |
| Prisma schema | 15/15 ✅ | 解析 model 块 |
| OpenAPI 3.x | 15/15 ✅ | 同时支持 JSON 和 YAML（自带轻量 YAML 解析器） |
| Mongoose schema | 15/15 ✅ | 解析 `new Schema({...})` 字段定义 |
| Avro (.avsc) | 15/15 ✅ | 解析 record / enum / array / map / union |

### UI 升级

- ✅ 首页加搜索框：可按格式名搜索（"json zod"、"go struct" 都能匹配）
- ✅ 加 All / Live 切换 tab，便于用户找真实可用的转换
- ✅ 实时显示匹配数量
- ✅ Hero 文案更新：列出全部 8 个输入格式
- ✅ 转换器页加**真实业务样例切换**：每种输入格式 3~5 个真实场景（User profile / E-commerce order / GitHub issue / Stripe-like charge / OpenAPI YAML / SQL 多表 等），用户一键切换
- ✅ 输入框加 "edited" 提示，让用户知道内容已偏离样例

### 内容产出

- ✅ 起草英文技术文章（Dev.to / Hashnode 用）：《How I built a 150-page programmatic SEO site with Next.js static export and zero AI content》
  - 不是推广帖，是技术分享。讲做法，结尾自然带链接，符合 Dev.to / HN 受众喜好
  - 包含完整的 parser/renderer 抽象、SEO 踩坑、避免 aggregateRating 警告等细节
- ✅ 起草中文技术文章（掘金 / 即刻 / V2EX 用）：《写一个能跑出 150 个页面的程序化 SEO 站，最关键的是这个抽象》
  - 技术分享角度，讲 parser × renderer 矩阵设计

### Build in Public · /changelog 页面

- ✅ 新增 `/changelog` 公开页：把已经做过的事 + 进行中 + 路线图全部对外公开
- ✅ Header / Footer / 首页 hero 都加 Changelog 入口
- ✅ sitemap 包含 `/changelog`，priority 0.7
- ✅ 加 `<lib/changelog.ts>` 数据源：以后只要往 ENTRIES 顶部加一条就能更新
- ✅ 视觉上区分 4 种状态：Shipped / In progress / Up next / Later
- ✅ tag 颜色区分：feat / fix / docs / perf / release / ux
- ✅ 简易内联 markdown 支持（`code` 和 `<https://...>` 链接）

为什么做这个：
- 开发者社区偏爱"build in public"项目，看到 changelog 会觉得这是活的
- HN / Reddit 一旦发推广，访客点进来第一件事会找"这是不是死站"，changelog 是最好的回答
- Google 看到一个有 changelog 的站会认为它是定期更新的（有助于 SEO 权重）

### 每页 "Next steps" 建议

- ✅ 加 `lib/next-steps.ts`：为每个目标语言/库写了 2~3 条"代码生成完之后怎么用"的建议
  - Zod：validate fetch responses / React Hook Form / 复用 z.infer
  - Pydantic：FastAPI handler 用法 / model_dump_json round-trip / strict 模式
  - Go struct：json.Decoder 例子 / 加 validate tags
  - Rust：serde_json 一行解析 / 配合 axum/actix 的方式
  - 其它 11 个语言各自有定制建议
- ✅ 在每个转换器页底部加 "Next steps with X" 区块，含代码片段

为什么做这个：
- 用户拿到代码不知道怎么用 → 流失；告诉他下一步用法 → 留下
- 命中长尾搜索词："how to validate with zod"、"go struct with json decoder" 等
- 增加页面停留时长（SEO 信号）

### sitemap.xml 多文件拆分

- ✅ 用 Next.js 原生 `generateSitemaps` 把 sitemap 拆成 11 个子文件：
  - `sitemap/core.xml`：首页 + changelog 等 meta 页面
  - `sitemap/0.xml ~ sitemap/9.xml`：每个输入格式的所有转换页面
  - 根 `/sitemap.xml` 自动生成 sitemap index 串起所有子 sitemap
- ✅ 每个子 sitemap 限定 ~15 个 URL，远低于 Google 单文件 50,000 URL 上限
- ✅ Live 页面 priority 0.8、Preview（已经全部 Live 了）也按规则给

为什么做这个：
- 大站 SEO 最佳实践
- Google 抓取效率更高（按主题分组）
- 后续如果某个输入格式出问题（比如 OpenAPI 解析变化），sitemap 也好定位

### SEO 文案升级

- ✅ 为常见 (from, to) 配对手写**场景化 intro**（30+ 个），告诉用户具体什么时候会用到这个转换
  - 比如 `json→pydantic`：FastAPI 用户的真实场景
  - 比如 `sql→rust-struct`：搭配 sqlx 的真实工作流
  - 比如 `mongoose→typescript`：取代手写类型声明的场景
- ✅ 每页 pitfalls 按目标语言定制（zod 的 nullable 处理、Go 的零值陷阱、Pydantic 的 strict 模式等）
- ✅ FAQ 增加"是否开源"问题
- ✅ how-to-use 步骤提示用户可以切换样例

### 文档完善

- ✅ README.md 重写为开源贡献者友好版本（含项目结构、贡献指南、roadmap）
- ✅ LICENSE 添加 MIT 协议

### Favicon + SEO 加强

- ✅ Favicon：`app/icon.svg` + `app/apple-icon.svg`（深色 `{ }` 单色文字图标）
- ✅ OG 分享图：`public/og.svg`（1200×630 静态 SVG，含品牌渐变 + slogan）
- ✅ 全局 metadata 完善：keywords、Twitter card、OpenGraph、googleBot 指令
- ✅ 每个 [slug] 页面注入 3 个 JSON-LD：
  - `SoftwareApplication`（让 Google 识别为开发者工具）
  - `FAQPage`（FAQ 区块可以在搜索结果展示富片段）
  - `BreadcrumbList`（面包屑导航富片段）
- ✅ 每页 metadata 增加针对性 keywords（`json to zod converter` 等）
- ✅ Twitter card 改为 `summary_large_image` 且引用 OG 图
- ✅ sitemap 按 Live / Preview 分级 priority（0.8 vs 0.4）

### 部署

- ✅ 域名购买：`schemato.top`
- ✅ GitHub 仓库：https://github.com/weitaishan/schemato
- ✅ git 邮箱修正为 `450785730@qq.com`（与 GitHub 账号匹配）
- ✅ Vercel 项目接入 GitHub，自动部署
- ✅ DNS 配置：A 记录 `@` → `216.198.79.1`，CNAME `www` → `da5a22488ef26c38.vercel-dns-017.com`
- ✅ 网站可访问：https://www.schemato.top
- ✅ 升级 Next.js 到最新版（修复 Vercel 安全警告）

### Google 收录

- ✅ Google Search Console 添加资源：`https://www.schemato.top`
- ✅ HTML meta 标签验证通过：`google-site-verification: E5Y2XW51q7GwmHWk7XP_P9Z3pTFrZ7sNmG_N1kL000M`
- ✅ Sitemap 已提交：`https://www.schemato.top/sitemap.xml`
- ✅ 已手动请求索引 5 个核心页面（首页 + json-to-zod / typescript / go-struct / rust-struct）

### GitHub 仓库可见性

- ✅ 仓库已改为 **public**（解锁 r/typescript / r/golang / r/rust 推广路径）

### 推广（踩坑记录）

- ❌ r/webdev 直接发被拦
  - Rule 3: 9:1 反推广规则
  - Rule 5: 项目展示**只能周六**（Showoff Saturday）
  - 结论：r/webdev 必须周六发，且要包装成讨论或问题，不能纯推广

- ❌ r/typescript 直接发被拦
  - Rule 2: 必须开源 + 贴 GitHub 仓库链接 + 对 TypeScript 有实际贡献
  - Rule 3: 反过度推广
  - 结论：发之前需要把仓库改 public，并且帖子要强调"开源 + 技术细节"

- ⏳ r/SideProject、r/golang、r/rust 待尝试（规则更宽松）

### GitHub 仓库改名

- ✅ 仓库由 `money-project-2` 重命名为 `schemato`
- ✅ 本地 git remote 已切换到新地址 `https://github.com/weitaishan/schemato.git`
- ✅ PLAN.md 和 EXECUTION_LOG.md 内引用的旧链接全部替换为新地址

---

## GitHub Commits

```
b0d9522 docs: add full operation plan and checklist
b1b6c3c feat: add Google Search Console verification + fix canonical URL to www.schemato.top
4e558c1 chore: upgrade next.js to latest (fix vulnerability warning)
02fbe61 feat: add all 14 json→X adapters
ee344d6 init: 155 static pages, 3 live converters
```

---

## 当前未决的事项

| 事项 | 状态 |
|---|---|
| GitHub 仓库改 public | 待决定（影响能否发 r/typescript） |
| 提交 sitemap 到 GSC | 待执行 |
| 第一波推广发哪些 sub | 见 PLAN.md |
| 加 json-schema / graphql / sql 输入格式的 adapter | 待开发 |
| 申请 Carbon Ads | 等流量起来后 |
