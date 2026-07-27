# 百应开发者文档首页 设计规格

- 日期：2026-07-27
- 目标产物：单页落地页（Landing Page），作为 byclaw（联想百应智能体）开发者文档与生态入口
- 参考站：`https://dawei.lenovo.com/?source=bygw1`（其 Hero 区为深色玻璃拟态 + 树形 LOGO）
- 仓库目录：`d:/workspace/new-doc-page/`（当前为空目录、非 git 仓库）

---

## 1. 目标与成功标准

### 1.1 目标
- 一个**单页**文档首页：Hero 视频背景 + 标题 + 双入口；底部两个超链接（开发者文档 / 开发者生态）。
- **双语**：默认中文，支持英文切换并记忆。
- **移动端兼容**：375px 起可用。
- 点击「开发者生态」→ 弹出 **Token 登录框**，仅输入 GitLab Token，校验通过后跳转 `https://dawei.lenovo.com/partner`。
- 视觉**炫酷、美观大方**，基调与参考站一致（深色玻璃拟态）。
- **无后端**：GitLab API 已开 CORS（`Access-Control-Allow-Origin: *`），纯前端校验。

### 1.2 成功标准
- 首页打开后 Hero 视频**自动静音循环播放**；点「观看完整版」弹窗播放完整视频（控件 + 声音）。
- Token 登录框：用测试 token（`qiuyl4@lenovo.com`）提交 → 校验通过 → 跳转 partner；输入无效 token → 显示明确错误。
- 中/EN 切换生效并持久化（localStorage）。
- 375 / 768 / 1440 三档断点下布局正常。
- 视觉与参考站一致：深色底 + 白字 + 毛玻璃按钮 + 树形 LOGO。
- 尊重 `prefers-reduced-motion`（降级为海报/静态）。

---

## 2. 技术栈

| 项 | 选型 | 说明 |
|---|---|---|
| 框架 | Vue 3 + Vite + TypeScript | 单页、组件化、HMR |
| 国际化 | vue-i18n（v9+） | zh 默认 + en |
| 样式 | 原生 CSS + CSS 变量 | 参考站即原生 CSS，无 Tailwind 依赖，可控性最高 |
| 视频 | ffmpeg-static（devDependency） | 把 273MB 原片产出两份 web 视频 |
| 后端 | 无 | 纯前端调 GitLab API |

不引入：Tailwind、UI 组件库、后端服务、SSR。

---

## 3. 设计语言（精确对齐参考站）

### 3.1 配色（CSS 变量）
```css
:root {
  --bg:            #02020F;                                  /* rgb(2,2,15) 页面底 */
  --bg-gradient:   linear-gradient(133deg, #020202, #020216);/* 参考站 .website-page */
  --text:          #FFFFFF;
  --text-muted:    rgba(255,255,255,0.60);
  --glass:         rgba(255,255,255,0.10);   /* 按钮/卡片底 */
  --glass-hover:   rgba(255,255,255,0.18);
  --glass-border:  rgba(255,255,255,0.18);
  --radius-pill:   40px;                     /* 参考站按钮圆角 */
  --radius-card:   16px;
  --nav-btn:       #474747;                   /* 参考站轮播按钮 */
  --danger:        #E60012;                   /* 仅错误态/聚焦环，非主色 */
  --scrim:         linear-gradient(180deg, rgba(2,2,15,.45), rgba(2,2,15,.82));
}
body.is-dark { background: var(--bg); }
```
- 主色**无红**，贴合参考站；`--danger` 仅用于 Token 校验失败提示与无障碍聚焦环。

### 3.2 字体
```css
font-family: "PingFang SC", "Source Han Sans SC", system-ui, -apple-system, "Microsoft YaHei", sans-serif;
```

### 3.3 LOGO
- 直接复用下载的参考站 `home_tree_logo.png`（2316×1224，RGBA，树形标识），置于 `public/images/logo.png`。
- 顶部用 `<img>` 渲染，高度 ~28px，等比缩放。深色底上原样显示。

### 3.4 毛玻璃按钮
```css
.btn-glass {
  background: var(--glass);
  color: #fff;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-pill);
  padding: 10px 22px;
  backdrop-filter: blur(8px);
  transition: background .2s, transform .2s;
}
.btn-glass:hover { background: var(--glass-hover); transform: translateY(-1px); }
```
- 主 CTA「开发者文档」：玻璃底 + 轻微白光晕（`box-shadow: 0 0 24px rgba(255,255,255,.12)`）。
- 次 CTA「开发者生态」：标准玻璃。

---

## 4. 页面结构

```
App.vue
├── AppHeader        # LOGO + 中/EN 切换 + 「开发者生态」入口（玻璃按钮）
├── HeroSection      # 视频背景(自动循环) + 暗色蒙版 + 标题 + 双 CTA + 「▶ 观看完整版」
├── VideoModal       # 完整视频弹窗（控件+声音，点击空白/ESC 关闭）
├── TokenLoginModal  # Token 登录弹窗
└── AppFooter        # 底部：开发者文档(TBD) + 开发者生态(→弹Token框)
```
- 单页，无路由。Hero 即首屏全部内容；下方仅 Footer。
- 内容文案（中文）：
  - 标题：**百应开发者**
  - 副标题：**智能体平台 · 构建、部署与协作的 AI Agent 工作台**
  - CTA：`开发者文档` / `开发者生态` / `▶ 观看完整版`
  - Footer：`开发者文档`（TBD） · `开发者生态` · 版权 `© Lenovo Baiying`

---

## 5. Hero 与视频行为

### 5.1 视频资源（由 `scripts/prepare-video.mjs` 生成）
输入：`raw/lxbyznt_home_video.mp4`（用户已下载的原片，273MB，gitignored）。
产出（写入 `public/videos/`）：
- `hero-loop.mp4` — 裁剪原片最具视觉冲击的 ~6s 片段，H.264/yuv420p，1280×720，`-movflags +faststart`，目标 ~1–2MB，**静音自动循环**。
- `hero-full.mp4` — 完整视频压缩，H.264/yuv420p，1280×720，`+faststart`，目标 ~5–8MB，供点播。
- `poster.png` — 取视频首帧或参考站海报，作移动/降级背景。

ffmpeg 命令示例（脚本内）：
```bash
# loop
ffmpeg -ss 0 -t 6 -i raw/lxbyznt_home_video.mp4 \
  -vf "scale=1280:-2" -an -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -crf 24 -movflags +faststart public/videos/hero-loop.mp4
# full（保留音频，浏览器兼容）
ffmpeg -i raw/lxbyznt_home_video.mp4 \
  -vf "scale=1280:-2" -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -c:a aac -b:a 128k -crf 26 -movflags +faststart public/videos/hero-full.mp4
# poster
ffmpeg -ss 0.5 -i raw/lxbyznt_home_video.mp4 -vframes 1 -q:v 3 public/images/poster.png
```

### 5.2 播放逻辑
- Hero 背景 `<video autoplay muted loop playsinline preload="auto" poster>`，`object-fit:cover`，绝对定位铺满，z-index 最低。
- 其上叠 `--scrim` 蒙版 + Hero 文案层。
- 「▶ 观看完整版」点击 → 打开 `VideoModal`，播放 `hero-full.mp4`（`controls`、非静音），`currentTime=0` 后 `play()`。ESC / 点击空白暂停并关闭。
- 降级：`hero-loop` `onerror` 或 `prefers-reduced-motion: reduce` 或 `navigator.connection?.saveData` → 隐藏 video，显示 `poster.png`。（极光 Canvas 为可选增强，非 MVP。）

---

## 6. Token 登录弹窗（TokenLoginModal）

### 6.1 UI（最佳实践）
- 居中玻璃卡片（`--glass` 底 + `--glass-border` + `--radius-card` + `backdrop-filter:blur(16px)`），移动端全屏。
- 标题：`登录开发者生态`
- 输入框：`type="password"`，`placeholder="请输入 GitLab Personal Access Token"`，可粘贴，含「粘贴/清空」便捷按钮。
- 主按钮：`校验并进入`（玻璃主样式）。
- 错误提示区（`--danger` 文字）。
- 可折叠「如何获取 Token？」帮助区（见 6.3）。
- 关闭：右上角 ✕ / ESC / 点击遮罩。

### 6.2 校验流程（`src/lib/gitlab.ts`）
```
validateToken(token):
  GET {VITE_GITLAB_URL}/api/v4/user
  headers: { 'PRIVATE-TOKEN': token }
  - 200 且 body.state === 'active'  → 成功，返回 {id,username,name,avatar_url,email}
  - 401                            → 'Token 无效或已过期'
  - 403                            → 'Token 权限不足，请确认已勾选 read_api'
  - 网络异常(fail)                  → '无法连接 GitLab，请检查网络或 VPN'
```
- 成功后：`localStorage` 存 `byclaw_auth = {token, ...user, ts}`，然后 `window.location.href = VITE_PARTNER_URL`。
- 校验期间按钮 loading 态、禁用重复提交。
- 安全：token 仅存 localStorage（内部工具场景可接受）；控制台不打 token；测试 token 仅在 gitignored `.env.local` 的 `VITE_TEST_TOKEN`，供开发期「填充测试 Token」按钮使用。

### 6.3 获取 Token 帮助文案
> 1. 登录内部 GitLab（`gitlab.lenovohuishang.com`）
> 2. 头像 → **Preferences** → **Access Tokens**
> 3. 新建 Token，名称随意，勾选 **read_api** 作用域，设过期时间
> 4. 创建后立即复制（只显示一次），粘贴到上方输入框

---

## 7. 双语（i18n）

- `vue-i18n`，messages：`zh.ts`（默认）、`en.ts`。
- 初始语言：`localStorage.byclaw_lang` || (`navigator.language` 以 `zh` 开头 ? `zh` : `en`)。
- 切换：`AppHeader` 右上「中 / EN」切换，写入 `localStorage.byclaw_lang`，即时切换。
- 文案键覆盖：标题、副标题、各 CTA、弹窗全部文案、Footer、错误信息、帮助文案。

---

## 8. 响应式与无障碍

- 断点：`≥1024` 桌面 / `768–1023` 平板 / `<768` 移动。
- Hero 视频移动端仍静音自动播（浏览器允许）；`saveData` 时降级海报。
- 弹窗 `<768` 全屏，输入框撑满。
- Footer 链接 `<768` 纵向堆叠。
- 无障碍：弹窗 `role="dialog" aria-modal="true"`、焦点陷阱、ESC 关闭、初始聚焦输入框；视频无声音自动播符合自动播放策略；`prefers-reduced-motion` 降级；聚焦环用 `--danger` 高亮。

---

## 9. 特效（动效）

- Hero 入场：标题/副标题/CTA `fade-up` + 错峰（`@media (prefers-reduced-motion: no-preference)`）。
- 视频循环为主动效；视频降级时显示 `poster.png`。极光 Canvas（品牌色径向渐变 + 粒子流）为可选增强，非 MVP。
- 滚动到底部 Footer 微淡入。
- 所有动效在 `prefers-reduced-motion: reduce` 下关闭/简化。

---

## 10. 配置与环境

`.env.example`：
```
VITE_GITLAB_URL=https://gitlab.lenovohuishang.com
VITE_PARTNER_URL=https://dawei.lenovo.com/partner
VITE_DOCS_URL=                   # TBD；空时按钮显示「即将上线」并禁用
```
`.env.local`（gitignored，开发用）：
```
VITE_TEST_TOKEN=HmypUXeJokPNUxcPozgZ   # 测试 token，仅本地
```

---

## 11. 文件结构

```
new-doc-page/
├── public/
│   ├── videos/{hero-loop.mp4, hero-full.mp4}   # 生成产物
│   └── images/{logo.png, poster.png}
├── raw/lxbyznt_home_video.mp4                  # 源片（gitignored，用户提供）
├── src/
│   ├── components/
│   │   ├── AppHeader.vue
│   │   ├── HeroSection.vue
│   │   ├── VideoModal.vue
│   │   ├── TokenLoginModal.vue
│   │   └── AppFooter.vue
│   ├── i18n/{index.ts,zh.ts,en.ts}
│   ├── lib/gitlab.ts
│   ├── composables/useAuth.ts
│   ├── styles/{base.css,theme.css}
│   ├── App.vue
│   ├── main.ts
│   └── env.d.ts
├── scripts/prepare-video.mjs
├── .env.example / .env.local / .gitignore
├── index.html
├── vite.config.ts / tsconfig.json / package.json
└── docs/superpowers/specs/2026-07-27-byclaw-doc-homepage-design.md
```

---

## 12. 范围外（Out of Scope）

- 后端服务（无需）。
- 开发者文档正文内容（`VITE_DOCS_URL` 待定，按钮先做占位/禁用）。
- partner 页面本身（外部，不在此实现）。
- 多页路由（单页即可）。
- LOGO 再设计（直接复用参考站资产）。

---

## 13. 已知约束 / TBD

- 开发者文档链接（`VITE_DOCS_URL`）待定：先以「即将上线」禁用按钮承载。
- 视频原片 273MB，需在构建前用 `scripts/prepare-video.mjs`（依赖 ffmpeg-static）生成 web 资源；ffmpeg 当前本地未安装，实现阶段引入。
- Token 存 localStorage：内部工具场景可接受；若后续要求更高安全，可改为后端代理 + httpOnly cookie（CORS 已开故暂不需要）。
