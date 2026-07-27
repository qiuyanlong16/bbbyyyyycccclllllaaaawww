# 百应开发者文档首页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page, bilingual (zh/en), mobile-friendly byclaw developer landing page with an autoplaying cinematic hero video and a GitLab-token login modal that validates client-side and redirects to the partner ecosystem.

**Architecture:** Vue 3 + Vite + TypeScript SPA. No backend — GitLab API CORS is open (`*`), so token validation is a pure-frontend `GET /api/v4/user` with a `PRIVATE-TOKEN` header. Dark glassmorphism theme matching the reference site (`dawei.lenovo.com`): near-black gradient bg, white text, glass buttons, tree logo. Hero video: a trimmed ~6s muted loop autoplays as background; a "watch full version" button opens a lightbox playing the full compressed video. i18n via vue-i18n (zh default). Styles via plain CSS + variables.

**Tech Stack:** Vue 3, Vite, TypeScript, vue-i18n, vitest + @vue/test-utils + jsdom, ffmpeg-static (dev, one-off video prep), pnpm.

**Spec:** `docs/superpowers/specs/2026-07-27-byclaw-doc-homepage-design.md`

---

## File Structure Map

| File | Responsibility |
|---|---|
| `package.json` | deps + scripts |
| `vite.config.ts` | vite + vitest config, `@` alias |
| `tsconfig.json`, `tsconfig.node.json` | TS config |
| `index.html` | entry |
| `.gitignore`, `.env.example`, `.env.local` | env + ignore |
| `src/main.ts` | app bootstrap (i18n + mount) |
| `src/App.vue` | page composition + modal state |
| `src/env.d.ts` | ImportMeta env types |
| `src/styles/theme.css` | CSS variables (reference palette) |
| `src/styles/base.css` | reset + body + fonts |
| `src/i18n/index.ts` | i18n instance + locale detection |
| `src/i18n/zh.ts`, `src/i18n/en.ts` | messages |
| `src/lib/gitlab.ts` | `validateToken()` |
| `src/lib/gitlab.spec.ts` | gitlab tests |
| `src/composables/useAuth.ts` | localStorage auth store |
| `src/composables/useAuth.spec.ts` | useAuth tests |
| `src/components/AppHeader.vue` | logo + lang toggle + ecosystem CTA |
| `src/components/AppHeader.spec.ts` | lang toggle test |
| `src/components/HeroSection.vue` | video bg + scrim + title + CTAs + watch-full |
| `src/components/VideoModal.vue` | full-video lightbox |
| `src/components/VideoModal.spec.ts` | open/close + ESC test |
| `src/components/TokenLoginModal.vue` | token input + validation + help |
| `src/components/TokenLoginModal.spec.ts` | submit + error test |
| `src/components/AppFooter.vue` | docs + ecosystem links |
| `scripts/prepare-video.mjs` | ffmpeg trim+compress pipeline |
| `public/images/logo.png` | tree logo (copied from ref) |
| `public/images/poster.png` | video poster (generated) |
| `public/videos/hero-loop.mp4`, `public/videos/hero-full.mp4` | generated |
| `raw/lxbyznt_home_video.mp4` | source (gitignored) |

---

## Task 1: Scaffold project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.ts`, `src/App.vue`, `src/env.d.ts`, `.gitignore`, `.env.example`, `.env.local`

- [ ] **Step 1: `git init` and create `.gitignore`**

Run:
```bash
cd d:/workspace/new-doc-page
git init
```

Create `.gitignore`:
```gitignore
node_modules
dist
dist-ssr
*.local
.env.local
.env.*.local
.vite
.superpowers
raw/*.mp4
public/videos/*.mp4
public/images/poster.png
*.log
.DS_Store
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "byclaw-doc-homepage",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "prepare:video": "node scripts/prepare-video.mjs"
  },
  "dependencies": {
    "vue": "^3.5.13",
    "vue-i18n": "^9.14.2"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "@vitejs/plugin-vue": "^5.2.1",
    "@vue/test-utils": "^2.4.6",
    "ffmpeg-static": "^5.2.0",
    "jsdom": "^25.0.1",
    "typescript": "~5.6.3",
    "vite": "^6.0.5",
    "vitest": "^2.1.8",
    "vue-tsc": "^2.1.10"
  }
}
```

- [ ] **Step 3: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.ts'],
  },
});
```

- [ ] **Step 4: Create `tsconfig.json` and `tsconfig.node.json`**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "jsx": "preserve",
    "useDefineForClassFields": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

`tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "target": "ESNext",
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["vite.config.ts", "scripts/**/*.mjs"]
}
```

- [ ] **Step 5: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/images/logo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>百应开发者 · byclaw</title>
  </head>
  <body class="is-dark">
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `src/env.d.ts`**

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITLAB_URL: string;
  readonly VITE_PARTNER_URL: string;
  readonly VITE_DOCS_URL: string;
  readonly VITE_TEST_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 7: Create `.env.example` and `.env.local`**

`.env.example`:
```
VITE_GITLAB_URL=https://gitlab.lenovohuishang.com
VITE_PARTNER_URL=https://dawei.lenovo.com/partner
VITE_DOCS_URL=
```

`.env.local` (gitignored — contains the test token):
```
VITE_GITLAB_URL=https://gitlab.lenovohuishang.com
VITE_PARTNER_URL=https://dawei.lenovo.com/partner
VITE_DOCS_URL=
VITE_TEST_TOKEN=HmypUXeJokPNUxcPozgZ
```

- [ ] **Step 8: Create minimal `src/App.vue` and `src/main.ts`**

`src/App.vue`:
```vue
<script setup lang="ts"></script>

<template>
  <div class="app">scaffold ok</div>
</template>
```

`src/main.ts`:
```ts
import { createApp } from 'vue';
import App from './App.vue';
import './styles/base.css';
import './styles/theme.css';

createApp(App).mount('#app');
```

- [ ] **Step 9: Install deps and verify dev server boots**

Run:
```bash
pnpm install
pnpm dev -- --host 127.0.0.1 --port 5188
```
Expected: Vite prints `Local: http://127.0.0.1:5188/` and the page shows "scaffold ok" (no console errors). Stop the server with Ctrl-C after confirming.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold vue3+vite+ts project"
```

---

## Task 2: Theme + base styles (reference palette)

**Files:**
- Create: `src/styles/theme.css`, `src/styles/base.css`

- [ ] **Step 1: Create `src/styles/theme.css`**

```css
:root {
  --bg: #02020f;
  --bg-gradient: linear-gradient(133deg, #020202, #020216);
  --text: #ffffff;
  --text-muted: rgba(255, 255, 255, 0.6);
  --text-faint: rgba(255, 255, 255, 0.4);
  --glass: rgba(255, 255, 255, 0.1);
  --glass-hover: rgba(255, 255, 255, 0.18);
  --glass-border: rgba(255, 255, 255, 0.18);
  --glass-strong: rgba(255, 255, 255, 0.92);
  --nav-btn: #474747;
  --danger: #e60012;
  --radius-pill: 40px;
  --radius-card: 16px;
  --scrim: linear-gradient(180deg, rgba(2, 2, 15, 0.45), rgba(2, 2, 15, 0.82));
  --font: "PingFang SC", "Source Han Sans SC", system-ui, -apple-system,
    "Microsoft YaHei", sans-serif;
}
```

- [ ] **Step 2: Create `src/styles/base.css`**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  min-height: 100%;
}

body.is-dark {
  background-color: var(--bg);
  background-image: var(--bg-gradient);
  color: var(--text);
  font-family: var(--font);
  -webkit-font-smoothing: antialiased;
}

#app {
  min-height: 100vh;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: inherit;
}

:focus-visible {
  outline: 2px solid var(--danger);
  outline-offset: 2px;
}

.btn-glass {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--glass);
  color: var(--text);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-pill);
  padding: 10px 22px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: background 0.2s, transform 0.2s;
}
.btn-glass:hover {
  background: var(--glass-hover);
  transform: translateY(-1px);
}
.btn-glass:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.btn-primary {
  background: var(--glass-strong);
  color: #02020f;
  box-shadow: 0 0 24px rgba(255, 255, 255, 0.12);
}
.btn-primary:hover {
  background: #fff;
}
```

- [ ] **Step 3: Verify dev server shows dark bg**

Run: `pnpm dev` → page background is near-black with subtle gradient; "scaffold ok" text is white. Stop server.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add theme tokens and base styles"
```

---

## Task 3: i18n (zh default + en)

**Files:**
- Create: `src/i18n/zh.ts`, `src/i18n/en.ts`, `src/i18n/index.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Create `src/i18n/zh.ts`**

```ts
export default {
  brand: { tagline: '智能体平台' },
  hero: {
    title: '百应开发者',
    subtitle: '构建、部署与协作的 AI Agent 工作台',
    docs: '开发者文档',
    ecosystem: '开发者生态',
    watchFull: '观看完整版',
    docsSoon: '即将上线',
  },
  login: {
    title: '登录开发者生态',
    label: 'GitLab Personal Access Token',
    placeholder: '请输入 GitLab Personal Access Token',
    submit: '校验并进入',
    submitting: '校验中…',
    paste: '粘贴',
    clear: '清空',
    helpTitle: '如何获取 Token？',
    helpSteps: [
      '登录内部 GitLab（gitlab.lenovohuishang.com）',
      '头像 → Preferences → Access Tokens',
      '新建 Token，勾选 read_api 作用域，设过期时间',
      '创建后立即复制（仅显示一次），粘贴到上方输入框',
    ],
    fillTestToken: '填入测试 Token',
    errors: {
      invalid: 'Token 无效或已过期',
      forbidden: 'Token 权限不足，请确认已勾选 read_api',
      inactive: '该账号未激活',
      network: '无法连接 GitLab，请检查网络或 VPN',
      unknown: '校验失败，请稍后重试',
      empty: '请先输入 Token',
    },
  },
  footer: {
    docs: '开发者文档',
    ecosystem: '开发者生态',
    copyright: '© Lenovo Baiying',
  },
  lang: { zh: '中', en: 'EN' },
};
```

- [ ] **Step 2: Create `src/i18n/en.ts`**

```ts
export default {
  brand: { tagline: 'Agent Platform' },
  hero: {
    title: 'Baiying Developer',
    subtitle: 'Build, deploy and collaborate on AI Agents',
    docs: 'Developer Docs',
    ecosystem: 'Developer Ecosystem',
    watchFull: 'Watch Full Video',
    docsSoon: 'Coming Soon',
  },
  login: {
    title: 'Sign in to Developer Ecosystem',
    label: 'GitLab Personal Access Token',
    placeholder: 'Enter your GitLab Personal Access Token',
    submit: 'Verify & Continue',
    submitting: 'Verifying…',
    paste: 'Paste',
    clear: 'Clear',
    helpTitle: 'How to get a token?',
    helpSteps: [
      'Sign in to internal GitLab (gitlab.lenovohuishang.com)',
      'Avatar → Preferences → Access Tokens',
      'Create a token with the read_api scope and an expiry',
      'Copy it immediately (shown once) and paste above',
    ],
    fillTestToken: 'Fill test token',
    errors: {
      invalid: 'Token is invalid or expired',
      forbidden: 'Insufficient scope — please enable read_api',
      inactive: 'This account is not active',
      network: 'Cannot reach GitLab — check network or VPN',
      unknown: 'Verification failed, please retry',
      empty: 'Please enter a token first',
    },
  },
  footer: {
    docs: 'Developer Docs',
    ecosystem: 'Developer Ecosystem',
    copyright: '© Lenovo Baiying',
  },
  lang: { zh: '中', en: 'EN' },
};
```

- [ ] **Step 3: Create `src/i18n/index.ts`**

```ts
import { createI18n } from 'vue-i18n';
import zh from './zh';
import en from './en';

const STORAGE_KEY = 'byclaw_lang';

function detectLocale(): 'zh' | 'en' {
  const saved = localStorage.getItem(STORAGE_KEY) as 'zh' | 'en' | null;
  if (saved === 'zh' || saved === 'en') return saved;
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: { zh, en },
});

export function setLocale(locale: 'zh' | 'en') {
  i18n.global.locale.value = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
}

export function toggleLocale() {
  setLocale(i18n.global.locale.value === 'zh' ? 'en' : 'zh');
}

export default i18n;
```

- [ ] **Step 4: Wire i18n in `src/main.ts`**

Replace `src/main.ts`:
```ts
import { createApp } from 'vue';
import App from './App.vue';
import i18n from './i18n';
import './styles/base.css';
import './styles/theme.css';

createApp(App).use(i18n).mount('#app');
```

- [ ] **Step 5: Verify build typechecks**

Run: `pnpm exec vue-tsc --noEmit`
Expected: no errors. (If `vue-i18n` missing types, ensure `pnpm install` ran.)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add vue-i18n with zh default and en"
```

---

## Task 4: GitLab token validation lib (TDD)

**Files:**
- Create: `src/lib/gitlab.ts`, `src/lib/gitlab.spec.ts`

- [ ] **Step 1: Write the failing test `src/lib/gitlab.spec.ts`**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateToken } from './gitlab';

const URL_BASE = 'https://gitlab.example.com';

function mockFetch(response: { status: number; body?: unknown } | (() => never)) {
  const fn = typeof response === 'function'
    ? vi.fn(response)
    : vi.fn(async () => new Response(JSON.stringify(response.body), { status: response.status, headers: { 'Content-Type': 'application/json' } }));
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}

beforeEach(() => { vi.restoreAllMocks(); });

describe('validateToken', () => {
  it('returns ok with user on 200 + active', async () => {
    mockFetch({ status: 200, body: { id: 1, username: 'u', name: 'U', email: 'u@e.com', state: 'active', avatar_url: '', web_url: '' } });
    const r = await validateToken(URL_BASE, 'tok');
    expect(r.ok).toBe(true);
    expect(r.user?.username).toBe('u');
    expect(global.fetch).toHaveBeenCalledWith(`${URL_BASE}/api/v4/user`, { headers: { 'PRIVATE-TOKEN': 'tok' } });
  });

  it('returns invalid on 401', async () => {
    mockFetch({ status: 401, body: { message: '401' } });
    const r = await validateToken(URL_BASE, 'tok');
    expect(r).toEqual({ ok: false, error: 'invalid' });
  });

  it('returns forbidden on 403', async () => {
    mockFetch({ status: 403, body: { message: '403' } });
    const r = await validateToken(URL_BASE, 'tok');
    expect(r).toEqual({ ok: false, error: 'forbidden' });
  });

  it('returns inactive when state != active', async () => {
    mockFetch({ status: 200, body: { id: 1, username: 'u', name: 'U', email: '', state: 'blocked', avatar_url: '', web_url: '' } });
    const r = await validateToken(URL_BASE, 'tok');
    expect(r).toEqual({ ok: false, error: 'inactive' });
  });

  it('returns network on fetch throw', async () => {
    mockFetch(() => { throw new TypeError('Failed to fetch'); });
    const r = await validateToken(URL_BASE, 'tok');
    expect(r).toEqual({ ok: false, error: 'network' });
  });

  it('returns unknown on other non-ok', async () => {
    mockFetch({ status: 500, body: {} });
    const r = await validateToken(URL_BASE, 'tok');
    expect(r).toEqual({ ok: false, error: 'unknown' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:run src/lib/gitlab.spec.ts`
Expected: FAIL — `validateToken is not a function` / cannot find module.

- [ ] **Step 3: Implement `src/lib/gitlab.ts`**

```ts
export interface GitLabUser {
  id: number;
  username: string;
  name: string;
  email: string;
  state: string;
  avatar_url: string;
  web_url: string;
}

export type TokenError = 'invalid' | 'forbidden' | 'inactive' | 'network' | 'unknown';

export interface ValidateResult {
  ok: boolean;
  user?: GitLabUser;
  error?: TokenError;
}

export async function validateToken(
  gitlabUrl: string,
  token: string,
): Promise<ValidateResult> {
  try {
    const res = await fetch(`${gitlabUrl}/api/v4/user`, {
      headers: { 'PRIVATE-TOKEN': token },
    });
    if (res.status === 401) return { ok: false, error: 'invalid' };
    if (res.status === 403) return { ok: false, error: 'forbidden' };
    if (!res.ok) return { ok: false, error: 'unknown' };
    const user = (await res.json()) as GitLabUser;
    if (user.state !== 'active') return { ok: false, error: 'inactive' };
    return { ok: true, user };
  } catch {
    return { ok: false, error: 'network' };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:run src/lib/gitlab.spec.ts`
Expected: PASS — 6 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add gitlab token validation lib with tests"
```

---

## Task 5: useAuth composable (TDD)

**Files:**
- Create: `src/composables/useAuth.ts`, `src/composables/useAuth.spec.ts`

- [ ] **Step 1: Write the failing test `src/composables/useAuth.spec.ts`**

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { saveAuth, getAuth, clearAuth } from './useAuth';
import type { GitLabUser } from '../lib/gitlab';

const user: GitLabUser = { id: 1, username: 'u', name: 'U', email: 'e', state: 'active', avatar_url: '', web_url: '' };

beforeEach(() => localStorage.clear());

describe('useAuth', () => {
  it('saveAuth then getAuth returns the stored payload', () => {
    saveAuth('tok', user);
    const got = getAuth();
    expect(got?.token).toBe('tok');
    expect(got?.user.username).toBe('u');
    expect(got?.ts).toBeGreaterThan(0);
  });

  it('getAuth returns null when nothing stored', () => {
    expect(getAuth()).toBeNull();
  });

  it('clearAuth removes the payload', () => {
    saveAuth('tok', user);
    clearAuth();
    expect(getAuth()).toBeNull();
  });

  it('getAuth returns null on corrupt JSON', () => {
    localStorage.setItem('byclaw_auth', '{not json');
    expect(getAuth()).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:run src/composables/useAuth.spec.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/composables/useAuth.ts`**

```ts
import type { GitLabUser } from '../lib/gitlab';

const KEY = 'byclaw_auth';

export interface AuthState {
  token: string;
  user: GitLabUser;
  ts: number;
}

export function saveAuth(token: string, user: GitLabUser): void {
  const state: AuthState = { token, user, ts: Date.now() };
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(KEY);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:run src/composables/useAuth.spec.ts`
Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add useAuth localStorage composable with tests"
```

---

## Task 6: Assets + video pipeline

**Files:**
- Create: `scripts/prepare-video.mjs`
- Copy: reference logo → `public/images/logo.png`
- Create (via script): `public/videos/hero-loop.mp4`, `public/videos/hero-full.mp4`, `public/images/poster.png`
- Place source: `raw/lxbyznt_home_video.mp4` (gitignored)

- [ ] **Step 1: Copy the tree logo into the project**

Run:
```bash
mkdir -p public/images
cp "C:/Users/qiuyanlong/Downloads/ref-logo.png" "public/images/logo.png" 2>/dev/null || cp "d:/workspace/new-doc-page/ref-logo.png" "public/images/logo.png"
```
(Use the already-downloaded `ref-logo.png` in the project root, or re-fetch from `https://dawei.lenovo.com/assets/home_tree_logo-BC-QFxRO.png`.)

Verify: `public/images/logo.png` exists (~305KB).

- [ ] **Step 2: Place the source video**

Run:
```bash
mkdir -p raw
cp "C:/Users/qiuyanlong/Downloads/lxbyznt_home_video.mp4" "raw/lxbyznt_home_video.mp4"
ls -la raw/lxbyznt_home_video.mp4
```
Expected: 273162636 bytes.

- [ ] **Step 3: Create `scripts/prepare-video.mjs`**

```js
import ffmpegStatic from 'ffmpeg-static';
import { spawnSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const input = process.env.BYCLAW_VIDEO_SRC
  ? resolve(root, process.env.BYCLAW_VIDEO_SRC)
  : resolve(root, 'raw/lxbyznt_home_video.mp4');
const outDir = resolve(root, 'public/videos');
const imgDir = resolve(root, 'public/images');

if (!input || !existsSync(input)) {
  console.error(`[prepare-video] 源视频不存在: ${input}`);
  console.error('请把原片放到 raw/lxbyznt_home_video.mp4，或设 BYCLAW_VIDEO_SRC');
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
mkdirSync(imgDir, { recursive: true });

const ffmpeg = /** @type {string} */ (ffmpegStatic);

function run(args) {
  console.log(`[prepare-video] ffmpeg ${args.join(' ')}`);
  const r = spawnSync(ffmpeg, args, { stdio: 'inherit' });
  if (r.status !== 0) {
    console.error(`[prepare-video] 失败 (status=${r.status})`);
    process.exit(r.status ?? 1);
  }
}

// 1) hero loop: 6s, 720p, no audio, faststart
run([
  '-y', '-ss', '0', '-t', '6', '-i', input,
  '-vf', 'scale=1280:-2',
  '-an',
  '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
  '-crf', '24', '-movflags', '+faststart',
  resolve(outDir, 'hero-loop.mp4'),
]);

// 2) full: 720p, audio aac, faststart
run([
  '-y', '-i', input,
  '-vf', 'scale=1280:-2',
  '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '128k', '-crf', '26', '-movflags', '+faststart',
  resolve(outDir, 'hero-full.mp4'),
]);

// 3) poster frame
run([
  '-y', '-ss', '0.5', '-i', input,
  '-vframes', '1', '-q:v', '3',
  resolve(imgDir, 'poster.png'),
]);

console.log('[prepare-video] done.');
```

- [ ] **Step 4: Run the video pipeline**

Run:
```bash
pnpm prepare:video
ls -la public/videos public/images/poster.png
```
Expected: `hero-loop.mp4` (~1–2MB), `hero-full.mp4` (~5–8MB), `poster.png` created. (If `ffmpeg-static` binary download fails, rerun `pnpm install` then retry.)

- [ ] **Step 5: Commit (videos/poster are gitignored; only the script + logo are committed)**

```bash
git add scripts/prepare-video.mjs public/images/logo.png
git commit -m "feat: add video pipeline script and tree logo"
```

---

## Task 7: AppHeader (logo + lang toggle + ecosystem CTA, TDD)

**Files:**
- Create: `src/components/AppHeader.vue`, `src/components/AppHeader.spec.ts`

- [ ] **Step 1: Write the failing test `src/components/AppHeader.spec.ts`**

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AppHeader from './AppHeader.vue';
import i18n from '../i18n';
import { setLocale } from '../i18n';

beforeEach(() => { localStorage.clear(); setLocale('zh'); });

describe('AppHeader', () => {
  it('renders the logo image', () => {
    const w = mount(AppHeader, { global: { plugins: [i18n] } });
    expect(w.find('img.logo').attributes('src')).toBe('/images/logo.png');
  });

  it('clicking lang toggle switches zh -> en', async () => {
    const w = mount(AppHeader, { global: { plugins: [i18n] } });
    expect(w.find('.lang-zh').classes()).toContain('active');
    await w.find('button.lang-toggle').trigger('click');
    expect(w.find('.lang-en').classes()).toContain('active');
  });

  it('emits ecosystem event when ecosystem button clicked', async () => {
    const w = mount(AppHeader, { global: { plugins: [i18n] } });
    await w.find('.btn-ecosystem').trigger('click');
    expect(w.emitted('ecosystem')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:run src/components/AppHeader.spec.ts`
Expected: FAIL — cannot find component.

- [ ] **Step 3: Implement `src/components/AppHeader.vue`**

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { toggleLocale } from '../i18n';

const { t, locale } = useI18n();
const emit = defineEmits<{ (e: 'ecosystem'): void }>();

const isZh = computed(() => locale.value === 'zh');
const isEn = computed(() => locale.value === 'en');
</script>

<template>
  <header class="app-header">
    <img class="logo" src="/images/logo.png" alt="byclaw" />
    <div class="actions">
      <div class="lang-toggle">
        <button class="lang-zh" :class="{ active: isZh }" @click="locale !== 'zh' && toggleLocale()">
          {{ t('lang.zh') }}
        </button>
        <span class="sep">/</span>
        <button class="lang-en" :class="{ active: isEn }" @click="locale !== 'en' && toggleLocale()">
          {{ t('lang.en') }}
        </button>
      </div>
      <button class="btn-glass btn-ecosystem" @click="emit('ecosystem')">
        {{ t('hero.ecosystem') }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0; left: 0; right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 28px;
  z-index: 20;
}
.logo {
  height: 30px;
  width: auto;
  display: block;
}
.actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
.lang-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}
.lang-toggle button {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 8px;
}
.lang-toggle button.active {
  color: var(--text);
}
.sep {
  color: var(--text-faint);
}
@media (max-width: 480px) {
  .app-header { padding: 14px 16px; }
  .logo { height: 24px; }
}
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:run src/components/AppHeader.spec.ts`
Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add AppHeader with logo, lang toggle, ecosystem CTA"
```

---

## Task 8: HeroSection (video bg + scrim + title + CTAs)

**Files:**
- Create: `src/components/HeroSection.vue`

- [ ] **Step 1: Implement `src/components/HeroSection.vue`**

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineEmits<{ (e: 'watch-full'): void; (e: 'ecosystem'): void }>();

const docsUrl = import.meta.env.VITE_DOCS_URL || '';
const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const saveData =
  typeof navigator !== 'undefined' &&
  (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData;
const useVideo = !reducedMotion && !saveData;
</script>

<template>
  <section class="hero">
    <video
      v-if="useVideo"
      class="hero-video"
      src="/videos/hero-loop.mp4"
      poster="/images/poster.png"
      autoplay
      muted
      loop
      playsinline
      preload="auto"
    />
    <img v-else class="hero-poster" src="/images/poster.png" alt="" />

    <div class="scrim" />
    <div class="hero-content">
      <h1 class="title">{{ t('hero.title') }}</h1>
      <p class="subtitle">
        {{ t('brand.tagline') }} · {{ t('hero.subtitle') }}
      </p>
      <div class="cta-row">
        <a
          v-if="docsUrl"
          class="btn-glass btn-primary"
          :href="docsUrl"
          target="_blank"
          rel="noopener"
        >{{ t('hero.docs') }}</a>
        <button v-else class="btn-glass btn-primary" disabled :title="t('hero.docsSoon')">
          {{ t('hero.docs') }} · {{ t('hero.docsSoon') }}
        </button>
        <button class="btn-glass" @click="$emit('ecosystem')">
          {{ t('hero.ecosystem') }}
        </button>
        <button class="btn-glass" @click="$emit('watch-full')">
          ▶ {{ t('hero.watchFull') }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.hero-video,
.hero-poster {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
.scrim {
  position: absolute;
  inset: 0;
  background: var(--scrim);
  z-index: 1;
}
.hero-content {
  position: relative;
  z-index: 2;
  padding: 0 8vw;
  max-width: 1100px;
  animation: fade-up 0.8s ease both;
}
.title {
  font-size: clamp(40px, 7vw, 84px);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 14px;
  line-height: 1.05;
}
.subtitle {
  font-size: clamp(15px, 2vw, 22px);
  color: var(--text-muted);
  margin: 0 0 32px;
  max-width: 640px;
}
.cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}
@media (prefers-reduced-motion: reduce) {
  .hero-content { animation: none; }
}
@keyframes fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (max-width: 480px) {
  .hero-content { padding: 0 6vw; }
  .cta-row { gap: 10px; }
  .btn-glass { padding: 9px 16px; font-size: 13px; }
}
</style>
```

- [ ] **Step 2: Wire into App temporarily and verify visually**

Temporarily edit `src/App.vue` `<template>` to include `<HeroSection />` (import it). Run:
```bash
pnpm dev
```
Open the page; confirm: video autoplays muted looping, dark scrim, white title, three CTA buttons render. Stop server. (Full App wiring happens in Task 12; this is a sanity check.)

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add HeroSection with autoplay video background and CTAs"
```

---

## Task 9: VideoModal (full-video lightbox, TDD)

**Files:**
- Create: `src/components/VideoModal.vue`, `src/components/VideoModal.spec.ts`

- [ ] **Step 1: Write the failing test `src/components/VideoModal.spec.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import VideoModal from './VideoModal.vue';

describe('VideoModal', () => {
  it('renders video element when open', () => {
    const w = mount(VideoModal, { props: { open: true } });
    expect(w.find('video').exists()).toBe(true);
    expect(w.find('video').attributes('src')).toBe('/videos/hero-full.mp4');
  });

  it('does not render when closed', () => {
    const w = mount(VideoModal, { props: { open: false } });
    expect(w.find('video').exists()).toBe(false);
  });

  it('emits close on Escape', async () => {
    const w = mount(VideoModal, { props: { open: true } });
    await w.trigger('keydown.escape');
    expect(w.emitted('close')).toBeTruthy();
  });

  it('emits close when backdrop clicked', async () => {
    const w = mount(VideoModal, { props: { open: true } });
    await w.find('.modal-backdrop').trigger('click');
    expect(w.emitted('close')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:run src/components/VideoModal.spec.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/components/VideoModal.vue`**

```vue
<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const videoEl = ref<HTMLVideoElement | null>(null);

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close');
}

onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));

watch(
  () => props.open,
  async (open) => {
    if (open) {
      await nextTick();
      const v = videoEl.value;
      if (v) {
        v.currentTime = 0;
        v.play().catch(() => {});
      }
    } else {
      videoEl.value?.pause();
    }
  },
);
</script>

<template>
  <div v-if="open" class="modal-backdrop" @click.self="emit('close')" @keydown="onKey" tabindex="-1">
    <div class="modal-inner">
      <video
        ref="videoEl"
        src="/videos/hero-full.mp4"
        controls
        playsinline
        class="modal-video"
      />
      <button class="close-btn" aria-label="close" @click="emit('close')">✕</button>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal-inner {
  position: relative;
  width: 92%;
  max-width: 880px;
}
.modal-video {
  width: 100%;
  border-radius: var(--radius-card);
  background: #000;
  display: block;
}
.close-btn {
  position: absolute;
  top: -44px;
  right: 0;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  color: var(--text);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
}
@media (max-width: 480px) {
  .modal-inner { width: 100%; height: 100%; max-width: none; }
  .modal-video { border-radius: 0; height: 100%; object-fit: contain; }
  .close-btn { top: 8px; right: 8px; }
}
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:run src/components/VideoModal.spec.ts`
Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add VideoModal full-video lightbox with tests"
```

---

## Task 10: TokenLoginModal (TDD)

**Files:**
- Create: `src/components/TokenLoginModal.vue`, `src/components/TokenLoginModal.spec.ts`

- [ ] **Step 1: Write the failing test `src/components/TokenLoginModal.spec.ts`**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent } from 'vue';
import TokenLoginModal from './TokenLoginModal.vue';
import i18n from '../i18n';
import { setLocale } from '../i18n';
import * as gitlab from '../lib/gitlab';

beforeEach(() => { localStorage.clear(); setLocale('zh'); vi.restoreAllMocks(); });

const StubRedirect = defineComponent({ template: '<div />' });

function makeFetch(status: number, body: unknown) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })) as unknown as typeof fetch;
}

describe('TokenLoginModal', () => {
  it('shows empty error when submitting with no token', async () => {
    const w = mount(TokenLoginModal, { global: { plugins: [i18n] } });
    await w.find('form').trigger('submit');
    expect(w.find('.error').text()).toContain('请先输入');
  });

  it('shows invalid error on 401', async () => {
    global.fetch = makeFetch(401, { message: '401' });
    const w = mount(TokenLoginModal, { global: { plugins: [i18n], stubs: { RedirectStub: StubRedirect } } });
    await w.find('input').setValue('bad');
    await w.find('form').trigger('submit');
    await flushPromises();
    expect(w.find('.error').text()).toContain('无效或已过期');
  });

  it('stores auth and emits success on 200 active', async () => {
    global.fetch = makeFetch(200, { id: 2, username: 'qiuyl4', name: 'qiuyl4', email: 'q@l.com', state: 'active', avatar_url: '', web_url: '' });
    const w = mount(TokenLoginModal, { global: { plugins: [i18n] } });
    await w.find('input').setValue('good');
    await w.find('form').trigger('submit');
    await flushPromises();
    expect(w.emitted('success')).toBeTruthy();
    expect(localStorage.getItem('byclaw_auth')).toContain('qiuyl4');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:run src/components/TokenLoginModal.spec.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/components/TokenLoginModal.vue`**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { validateToken, type TokenError } from '../lib/gitlab';
import { saveAuth } from '../composables/useAuth';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'success'): void }>();

const { t, tm } = useI18n();
const token = ref('');
const submitting = ref(false);
const errorKey = ref<TokenError | 'empty' | null>(null);
const showHelp = ref(false);

const gitlabUrl = import.meta.env.VITE_GITLAB_URL;
const partnerUrl = import.meta.env.VITE_PARTNER_URL;
const testToken = import.meta.env.VITE_TEST_TOKEN || '';

const errorMsg = computed(() => (errorKey.value ? t(`login.errors.${errorKey.value}`) : ''));

async function submit() {
  errorKey.value = null;
  if (!token.value.trim()) {
    errorKey.value = 'empty';
    return;
  }
  submitting.value = true;
  const result = await validateToken(gitlabUrl, token.value.trim());
  submitting.value = false;
  if (result.ok && result.user) {
    saveAuth(token.value.trim(), result.user);
    emit('success');
    window.location.href = partnerUrl;
    return;
  }
  errorKey.value = result.error ?? 'unknown';
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close');
}

const helpSteps = computed(() => {
  const raw = tm('login.helpSteps') as unknown;
  return Array.isArray(raw) ? (raw as string[]) : [];
});

function fillTest() {
  if (testToken) token.value = testToken;
}
</script>

<template>
  <div v-if="open" class="modal-backdrop" @click.self="emit('close')" @keydown="onKey" tabindex="-1">
    <div class="modal-card">
      <button class="close-btn" aria-label="close" @click="emit('close')">✕</button>
      <h2 class="title">{{ t('login.title') }}</h2>

      <form @submit.prevent="submit">
        <label class="label">{{ t('login.label') }}</label>
        <div class="input-row">
          <input
            v-model="token"
            type="password"
            class="input"
            :placeholder="t('login.placeholder')"
            autocomplete="off"
            spellcheck="false"
          />
          <button type="button" class="mini" @click="fillTest" v-if="testToken">
            {{ t('login.fillTestToken') }}
          </button>
        </div>

        <p v-if="errorKey" class="error">{{ errorMsg }}</p>

        <button type="submit" class="btn-glass btn-primary submit" :disabled="submitting">
          {{ submitting ? t('login.submitting') : t('login.submit') }}
        </button>
      </form>

      <button class="help-toggle" @click="showHelp = !showHelp">
        {{ t('login.helpTitle') }} <span>{{ showHelp ? '▾' : '▸' }}</span>
      </button>
      <ol v-if="showHelp" class="help">
        <li v-for="(s, i) in helpSteps" :key="i">{{ s }}</li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}
.modal-card {
  position: relative;
  width: 100%;
  max-width: 440px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 28px 26px 24px;
}
.close-btn {
  position: absolute;
  top: 14px; right: 14px;
  background: none; border: none;
  color: var(--text-muted); font-size: 18px; cursor: pointer;
}
.title { font-size: 20px; font-weight: 700; margin: 0 0 18px; }
.label { display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 8px; }
.input-row { display: flex; gap: 8px; }
.input {
  flex: 1; min-width: 0;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--glass-border);
  color: var(--text);
  border-radius: 10px;
  padding: 11px 14px;
  font-size: 14px;
  font-family: inherit;
}
.input::placeholder { color: var(--text-faint); }
.mini {
  background: var(--glass); border: 1px solid var(--glass-border);
  color: var(--text); border-radius: 10px; padding: 0 12px; font-size: 12px; cursor: pointer;
}
.error { color: var(--danger); font-size: 13px; margin: 10px 0 0; }
.submit { width: 100%; justify-content: center; margin-top: 16px; }
.help-toggle {
  margin-top: 18px; background: none; border: none; color: var(--text-muted);
  font-size: 13px; cursor: pointer; padding: 0;
}
.help { margin: 10px 0 0; padding-left: 18px; color: var(--text-muted); font-size: 12px; line-height: 1.7; }
@media (max-width: 480px) {
  .modal-backdrop { padding: 0; }
  .modal-card { max-width: none; min-height: 100%; border-radius: 0; padding-top: max(28px, env(safe-area-inset-top)); }
}
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:run src/components/TokenLoginModal.spec.ts`
Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add TokenLoginModal with client-side gitlab validation"
```

---

## Task 11: AppFooter (docs + ecosystem links)

**Files:**
- Create: `src/components/AppFooter.vue`

- [ ] **Step 1: Implement `src/components/AppFooter.vue`**

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
defineEmits<{ (e: 'ecosystem'): void }>();
const docsUrl = import.meta.env.VITE_DOCS_URL || '';
</script>

<template>
  <footer class="app-footer">
    <div class="links">
      <a
        v-if="docsUrl"
        :href="docsUrl"
        target="_blank"
        rel="noopener"
        class="link"
      >{{ t('footer.docs') }}</a>
      <span v-else class="link disabled" :title="t('hero.docsSoon')">
        {{ t('footer.docs') }} · {{ t('hero.docsSoon') }}
      </span>
      <span class="dot">·</span>
      <button class="link" @click="$emit('ecosystem')">{{ t('footer.ecosystem') }}</button>
    </div>
    <p class="copyright">{{ t('footer.copyright') }}</p>
  </footer>
</template>

<style scoped>
.app-footer {
  position: relative;
  z-index: 5;
  padding: 28px 8vw 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.links { display: flex; align-items: center; gap: 12px; }
.link {
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  background: none;
  border: none;
  font-family: inherit;
}
.link:hover { color: var(--text); }
.link.disabled { opacity: 0.5; cursor: not-allowed; }
.dot { color: var(--text-faint); }
.copyright { color: var(--text-faint); font-size: 12px; margin: 0; }
@media (max-width: 480px) {
  .app-footer { padding: 24px 6vw 32px; }
  .links { flex-direction: column; gap: 10px; }
  .dot { display: none; }
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add AppFooter with docs and ecosystem links"
```

---

## Task 12: App.vue wiring + main.ts

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: Implement `src/App.vue`**

```vue
<script setup lang="ts">
import { ref } from 'vue';
import AppHeader from './components/AppHeader.vue';
import HeroSection from './components/HeroSection.vue';
import VideoModal from './components/VideoModal.vue';
import TokenLoginModal from './components/TokenLoginModal.vue';
import AppFooter from './components/AppFooter.vue';

const videoOpen = ref(false);
const loginOpen = ref(false);
</script>

<template>
  <div class="app">
    <AppHeader @ecosystem="loginOpen = true" />
    <main class="main">
      <HeroSection @watch-full="videoOpen = true" @ecosystem="loginOpen = true" />
    </main>
    <AppFooter @ecosystem="loginOpen = true" />

    <VideoModal :open="videoOpen" @close="videoOpen = false" />
    <TokenLoginModal :open="loginOpen" @close="loginOpen = false" @success="loginOpen = false" />
  </div>
</template>

<style scoped>
.app { min-height: 100vh; display: flex; flex-direction: column; }
.main { flex: 1; }
</style>
```

- [ ] **Step 2: Run all tests**

Run: `pnpm test:run`
Expected: PASS — all suites green (gitlab 6, useAuth 4, AppHeader 3, VideoModal 4, TokenLoginModal 3).

- [ ] **Step 3: Run dev server and visual sanity check**

Run: `pnpm dev` → confirm header (logo + 中/EN + ecosystem), hero video autoplay + title + 3 CTAs, footer. Click「开发者生态」→ token modal opens. Click「观看完整版」→ full video lightbox. Click 中/EN → text switches. Stop server.

- [ ] **Step 4: Production build**

Run: `pnpm build`
Expected: `dist/` produced, no TS errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: wire App composition and finalize landing page"
```

---

## Task 13: End-to-end verification (browser)

**Files:** none (verification only)

- [ ] **Step 1: Start preview server**

Run: `pnpm preview -- --port 5188 --host 127.0.0.1` in background.

- [ ] **Step 2: Screenshot desktop + mobile via browser-use**

Run (UTF-8):
```bash
export PYTHONUTF8=1 PYTHONIOENCODING=utf-8
browser-use open "http://127.0.0.1:5188/"
browser-use screenshot "d:/workspace/new-doc-page/verify-desktop.png"
browser-use eval "(()=>{const v=document.querySelector('video'); return JSON.stringify({hasVideo:!!v, muted:v?.muted, autoplay:v?.autoplay, loop:v?.loop});})()"
# mobile viewport
browser-use eval "window.close&&0" 2>/dev/null
browser-use --headed open "http://127.0.0.1:5188/"
```
Then emulate mobile (or just resize). Confirm hero video + layout at narrow width.

- [ ] **Step 3: Test the token flow against real GitLab**

Run:
```bash
export PYTHONUTF8=1 PYTHONIOENCODING=utf-8
browser-use open "http://127.0.0.1:5188/"
browser-use eval "document.querySelector('.btn-ecosystem')?.click() || document.querySelector('[class*=ecosystem]')?.click()"
# fill the test token (VITE_TEST_TOKEN) and submit
browser-use eval "(()=>{const i=document.querySelector('.input'); if(!i)return'no input'; const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; setter.call(i,'HmypUXeJokPNUxcPozgZ'); i.dispatchEvent(new Event('input',{bubbles:true})); return 'filled';})()"
browser-use eval "document.querySelector('form').requestSubmit ? document.querySelector('form').requestSubmit() : document.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))"
sleep 3
browser-use get title
```
Expected: after submit, the page navigates to `https://dawei.lenovo.com/partner` (token valid, redirect). If it stays, check the `.error` text.

- [ ] **Step 4: Verify bilingual toggle persists**

In the browser, click `EN`, reload, confirm it stays English (localStorage `byclaw_lang=en`).

- [ ] **Step 5: Stop servers and finalize**

Stop the preview server. Final commit if any verification fixes were made:
```bash
git add -A
git commit -m "chore: e2e verification" --allow-empty
```

---

## Self-Review Notes

- **Spec coverage:** every spec section maps to a task — theme (T2), i18n (T3), gitlab validation (T4), useAuth (T5), assets/video (T6), header (T7), hero/video (T8/T9), token modal (T10), footer (T11), wiring (T12), mobile/bilingual/e2e (T13). `VITE_DOCS_URL` TBD handled via disabled "即将上线" button in Hero (T8) and Footer (T11). Reduced-motion/saveData fallback to poster in Hero (T8). ✓
- **Placeholders:** none; every code step contains full file content.
- **Type consistency:** `GitLabUser`/`TokenError`/`ValidateResult` (T4) reused in useAuth (T5) and TokenLoginModal (T10). `emit('ecosystem')`/`emit('watch-full')`/`emit('close')`/`emit('success')` names consistent across T7–T12.
