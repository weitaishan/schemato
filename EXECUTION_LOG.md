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

### 实现的 Adapter（119 个 Live · 占 ~80%）

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
| Avro | 0/15 | 待加 |
| Mongoose | 0/15 | 待加 |

### UI 升级

- ✅ 首页加搜索框：可按格式名搜索（"json zod"、"go struct" 都能匹配）
- ✅ 加 All / Live 切换 tab，便于用户找真实可用的转换
- ✅ 实时显示匹配数量
- ✅ Hero 文案更新：列出全部 8 个输入格式

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
