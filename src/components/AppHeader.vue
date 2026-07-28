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
  position: relative;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 28px;
  z-index: 20;
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
  .app-header { padding: 12px 14px; }
  .logo { height: 26px; }
  .actions { gap: 10px; }
}
</style>
