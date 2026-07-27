<script setup lang="ts">
import { ref } from 'vue';
import AppHeader from './components/AppHeader.vue';
import HeroSection from './components/HeroSection.vue';
import TokenLoginModal from './components/TokenLoginModal.vue';
import AppFooter from './components/AppFooter.vue';

const loginOpen = ref(false);
</script>

<template>
  <div class="app">
    <AppHeader @ecosystem="loginOpen = true" />
    <main class="main">
      <HeroSection @ecosystem="loginOpen = true" />
    </main>
    <AppFooter />

    <TokenLoginModal :open="loginOpen" @close="loginOpen = false" @success="loginOpen = false" />
  </div>
</template>

<style scoped>
.app {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.main {
  flex: 1;
  min-height: 0;
  display: flex;
}
</style>
