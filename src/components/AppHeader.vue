<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { toggleLocale } from '../i18n';

const { t, locale } = useI18n();

const isZh = computed(() => locale.value === 'zh');
const isEn = computed(() => locale.value === 'en');
</script>

<template>
  <header class="app-header">
    <img class="logo" src="/images/logo.png" alt="Byclaw" />
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
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 32px;
  z-index: 20;
  background: rgba(2, 2, 15, 0.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.logo {
  height: 32px;
  width: auto;
  display: block;
}
.actions {
  display: flex;
  align-items: center;
  gap: 14px;
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
  padding: 4px 8px;
  border-radius: 6px;
  transition: color 0.2s;
}
.lang-toggle button:hover {
  color: var(--text);
}
.lang-toggle button.active {
  color: var(--text);
}
.sep {
  color: var(--text-faint);
}
@media (max-width: 768px) {
  .app-header { padding: 14px 20px; }
  .logo { height: 28px; }
}
@media (max-width: 480px) {
  .app-header { padding: 12px 16px; }
  .logo { height: 24px; }
  .lang-toggle { font-size: 13px; }
}
</style>
