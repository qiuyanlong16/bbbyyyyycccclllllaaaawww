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
