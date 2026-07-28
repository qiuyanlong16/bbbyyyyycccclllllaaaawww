# Cloudflare Pages 部署配置

## 前置条件

1. **Cloudflare 账号**
   - 已添加域名 `byclaw.help` 到 Cloudflare
   - 已创建 Pages 项目 `byclaw-docs`

2. **GitHub Secrets**（在仓库 Settings → Secrets 中添加）
   - `CLOUDFLARE_API_TOKEN` — Cloudflare API Token
   - `CLOUDFLARE_ACCOUNT_ID` — Cloudflare Account ID

## 获取 Cloudflare API Token

1. 登录 Cloudflare Dashboard
2. 右上角头像 → My Profile → API Tokens
3. Create Token → 使用 "Edit Cloudflare Workers" 模板
4. 权限：
   - Account → Cloudflare Pages → Edit
   - Account → Workers Scripts → Edit
   - Zone → DNS → Edit（可选，用于 DNS 管理）
5. 复制生成的 Token

## 获取 Account ID

Cloudflare Dashboard → 右侧栏 → Account ID

## GitHub Secrets 配置

1. 打开仓库：https://github.com/qiuyanlong16/bbbyyyyycccclllllaaaawww
2. Settings → Secrets and variables → Actions → New repository secret
3. 添加：
   - `CLOUDFLARE_API_TOKEN` = <你的 API Token>
   - `CLOUDFLARE_ACCOUNT_ID` = <你的 Account ID>

## 自动部署流程

```
推送到 main 分支
    ↓
GitHub Actions 触发
    ↓
npm install → npm test → npm build
    ↓
cloudflare/wrangler-action 部署 dist/
    ↓
部署到 https://byclaw-docs.pages.dev
    ↓
自定义域名：https://byclaw.help
```

## Cloudflare Pages 自定义域名

1. Cloudflare Dashboard → Workers & Pages → byclaw-docs
2. Custom domains → Set up a custom domain
3. 输入 `byclaw.help`
4. 自动创建 DNS 记录（CNAME）
5. 等待 SSL 证书颁发（约 1-2 分钟）

## 环境变量（可选）

如果后端 API 不在同一域名，可在 Cloudflare Pages 设置环境变量：
- Dashboard → byclaw-docs → Settings → Environment variables
- 添加：`VITE_API_BASE_URL` = `https://api.byclaw.help`

当前配置使用相对路径 `/api/auth/login`，部署后同源无需额外配置。

## 手动触发部署

```bash
# 推送触发
git push origin main

# 或在 GitHub Actions 页面手动运行
```

## 故障排查

**部署失败：API Token 权限不足**
- 检查 Token 是否有 Pages 编辑权限

**部署成功但访问 404**
- 检查 dist/ 目录结构是否正确
- 确认 index.html 在根目录

**API 调用失败**
- 确认后端 API 已部署
- 检查 Cloudflare Tunnel 配置
- 查看浏览器控制台错误
