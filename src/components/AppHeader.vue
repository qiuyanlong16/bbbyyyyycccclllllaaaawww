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
  padding: 20px 40px;
  z-index: 20;
  background: linear-gradient(180deg, rgba(2, 2, 15, 0.6) 0%, rgba(2, 2, 15, 0) 100%);
}
.logo {
  height: 36px;
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
  gap: 8px;
  font-size: 14px;
}
.lang-toggle button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-muted);
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  backdrop-filter: blur(8px);
  transition: all 0.2s;
}
.lang-toggle button:hover {
  background: rgba(255, 255, 255, 0.2);
  color: var(--text);
}
.lang-toggle button.active {
  color: var(--text);
  background: rgba(255, 255, 255, 0.25);
}
.sep {
  color: var(--text-faint);
}
@media (max-width: 768px) {
  .app-header { padding: 16px 20px; }
  .logo { height: 30px; }
  .actions { gap: 12px; }
}
@media (max-width: 480px) {
  .app-header { padding: 12px 16px; }
  .logo { height: 26px; }
  .lang-toggle button { padding: 5px 10px; font-size: 13px; }
  .actions { gap: 10px; }
}
</style>
