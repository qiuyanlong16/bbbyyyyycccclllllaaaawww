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
