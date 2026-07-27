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
