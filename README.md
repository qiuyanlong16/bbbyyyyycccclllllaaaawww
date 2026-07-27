# 百应开发者文档首页 (byclaw doc homepage)

联想百应智能体（byclaw）开发者文档与生态入口落地页。Vue 3 + Vite 单页，深色玻璃拟态风格（对齐参考站 `dawei.lenovo.com`），双语（默认中文），移动端兼容，Hero 自动播放视频背景，点击「开发者生态」弹出 GitLab Token 登录框（纯前端校验）。

## 技术栈

- Vue 3 + Vite + TypeScript
- vue-i18n（zh 默认 / en，可切换并记忆）
- 原生 CSS + CSS 变量（无 Tailwind、无 UI 库）
- vitest + @vue/test-utils + jsdom
- **无后端**：GitLab API 已开 CORS（`Access-Control-Allow-Origin: *`），Token 校验为纯前端 `GET /api/v4/user`

## 快速开始

```bash
npm install
npm run dev          # http://127.0.0.1:5188
```

开发期可点弹窗里的「填入测试 Token」一键填充（仅 dev，见下）。

## 视频资源

Hero 自动循环播放 `public/videos/hero-loop.mp4`，「观看完整版」弹窗播放 `public/videos/hero-full.mp4`，海报 `public/images/poster.png`。

当前仓库内置的是**占位样本**（`by-claw-app` 的 splash 视频，10.8MB），用于本地预览。要换成参考站真实首页视频（`lxbyznt_home_video.mp4`）：

1. 安装 ffmpeg：`winget install Gyan.FFmpeg`（或 `choco install ffmpeg`）
2. 把原片放到 `raw/lxbyznt_home_video.mp4`（或设 `BYCLAW_VIDEO_SRC`）
3. 运行 `npm run prepare:video` → 生成 `hero-loop.mp4`（~6s 裁剪压缩）、`hero-full.mp4`（完整压缩）、`poster.png`

> 注意：本机网络曾拦截 `ffmpeg-static` 的二进制下载（ETIMEDOUT），故改用系统 ffmpeg；`scripts/prepare-video.mjs` 读 `FFMPEG_PATH` 或 PATH 中的 `ffmpeg`。

## 环境变量

- `.env`（提交）：`VITE_GITLAB_URL` / `VITE_PARTNER_URL` / `VITE_DOCS_URL`（TBD=空，按钮显示「即将上线」并禁用）
- `.env.development.local`（**仅 dev、gitignored**）：`VITE_TEST_TOKEN`（开发期填充用，**不会**进入生产构建——`TokenLoginModal` 用 `import.meta.env.DEV` 双重把关）

## Token 登录流程

点击「开发者生态」→ 弹出登录框 → 输入内部 GitLab Personal Access Token（需 `read_api` 作用域）→
前端 `GET {VITE_GITLAB_URL}/api/v4/user` + `PRIVATE-TOKEN` 头 → 200 且 `state==='active'` →
存 localStorage → 跳转 `{VITE_PARTNER_URL}`（`https://dawei.lenovo.com/partner`）。
401/403/网络错各有明确文案，弹窗附「如何获取 Token」帮助。

## 脚本

| 命令 | 说明 |
|---|---|
| `npm run dev` | 开发服务器 |
| `npm run build` | `vue-tsc --noEmit` 类型检查 + `vite build` → `dist/` |
| `npm run preview` | 预览生产构建 |
| `npm test` / `npm run test:run` | vitest（20 个用例） |
| `npm run prepare:video` | ffmpeg 裁剪压缩视频（需系统 ffmpeg） |

## 项目结构

```
src/
  components/  AppHeader HeroSection VideoModal TokenLoginModal AppFooter
  i18n/        index.ts zh.ts en.ts
  lib/         gitlab.ts (validateToken)
  composables/ useAuth.ts (localStorage)
  styles/      theme.css base.css
  App.vue main.ts env.d.ts
scripts/prepare-video.mjs
public/images/{logo.png,poster.png}  public/videos/{hero-loop,hero-full}.mp4
docs/superpowers/{specs,plans}/
```
