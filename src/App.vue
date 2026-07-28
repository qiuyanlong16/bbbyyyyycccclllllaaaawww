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
    <AppHeader />
    <main class="main">
      <HeroSection @docs="loginOpen = true" />
    </main>
    <AppFooter />

    <TokenLoginModal :open="loginOpen" @close="loginOpen = false" />
  </div>
</template>

<style scoped>
.app {
  height: 100vh;
  height: 100dvh;
  position: relative;
  overflow: hidden;
}
.main {
  position: absolute;
  inset: 0;
}
</style>
