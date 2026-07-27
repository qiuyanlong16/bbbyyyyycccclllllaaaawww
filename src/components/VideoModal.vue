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
  <div v-if="open" class="modal-backdrop" @click.self="emit('close')">
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
