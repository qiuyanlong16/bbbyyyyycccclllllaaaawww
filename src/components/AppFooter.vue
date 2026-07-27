<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<template>
  <footer class="app-footer">
    <p class="copyright">{{ t('footer.copyright') }}</p>
  </footer>
</template>

<style scoped>
.app-footer {
  position: relative;
  z-index: 5;
  flex: none;
  padding: 12px 8vw;
  text-align: center;
}
.copyright {
  color: var(--text-faint);
  font-size: 12px;
  margin: 0;
  letter-spacing: 0.04em;
}
@media (max-width: 480px) {
  .app-footer { padding: 8px 6vw; }
  .copyright { font-size: 11px; }
}
</style>
