<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineEmits<{ (e: 'docs'): void }>();

const ecosystemUrl = import.meta.env.VITE_ECOSYSTEM_URL || 'https://chat.z.ai/auth';

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
      <div class="kicker">{{ t('hero.kicker') }}</div>
      <h1 class="title">{{ t('hero.title') }}</h1>
      <p class="subtitle">{{ t('hero.subtitle') }}</p>
      <div class="cta-row">
        <button class="btn-glass btn-primary" @click="$emit('docs')">
          {{ t('hero.docs') }}
        </button>
        <a
          class="btn-glass"
          :href="ecosystemUrl"
          target="_blank"
          rel="noopener"
        >
          {{ t('hero.ecosystem') }}
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  flex: 1;
  min-height: 0;
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
  width: 100%;
  animation: fade-up 0.8s ease both;
}
.kicker {
  font-size: clamp(12px, 1.6vw, 15px);
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 14px;
}
.title {
  font-size: clamp(44px, 9vw, 96px);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 14px;
  line-height: 1;
}
.subtitle {
  font-size: clamp(14px, 1.9vw, 21px);
  color: var(--text-muted);
  margin: 0 0 30px;
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
  .kicker { margin-bottom: 10px; letter-spacing: 0.24em; }
  .title { font-size: clamp(40px, 13vw, 64px); margin-bottom: 10px; }
  .subtitle { margin-bottom: 22px; }
  .cta-row { gap: 10px; }
  .btn-glass { padding: 9px 16px; font-size: 13px; }
}
</style>
