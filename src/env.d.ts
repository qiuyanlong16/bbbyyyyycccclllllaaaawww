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
