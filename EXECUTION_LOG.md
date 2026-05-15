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

### 实现的 Adapter（14 个 json→X）

全部真实可用，浏览器端运行：

```
json → typescript           ✅ Live
json → zod                  ✅ Live
json → pydantic             ✅ Live
json → go-struct            ✅ Live
json → rust-struct          ✅ Live
json → swift                ✅ Live
json → kotlin               ✅ Live
json → java                 ✅ Live
json → csharp               ✅ Live
json → dart                 ✅ Live
json → yup                  ✅ Live
json → joi                  ✅ Live
json → python-dataclass     ✅ Live
json → php                  ✅ Live
json → ruby                 ✅ Live
```

### 部署

- ✅ 域名购买：`schemato.top`
- ✅ GitHub 仓库：https://github.com/weitaishan/money-project-2
- ✅ git 邮箱修正为 `450785730@qq.com`（与 GitHub 账号匹配）
- ✅ Vercel 项目接入 GitHub，自动部署
- ✅ DNS 配置：A 记录 `@` → `216.198.79.1`，CNAME `www` → `da5a22488ef26c38.vercel-dns-017.com`
- ✅ 网站可访问：https://www.schemato.top
- ✅ 升级 Next.js 到最新版（修复 Vercel 安全警告）

### Google 收录

- ✅ Google Search Console 添加资源：`https://www.schemato.top`
- ✅ HTML meta 标签验证通过：`google-site-verification: E5Y2XW51q7GwmHWk7XP_P9Z3pTFrZ7sNmG_N1kL000M`
- ⏳ Sitemap 待提交：`https://www.schemato.top/sitemap.xml`

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
