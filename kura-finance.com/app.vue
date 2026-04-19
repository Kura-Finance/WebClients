<template>
  <div class="min-h-screen bg-kura-background text-kura-text flex flex-col">
    <!-- Background Ambient Glows (subtle) -->
    <div class="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-kura-primary/5 blur-[150px] rounded-full pointer-events-none z-0" />
    <div class="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-kura-secondary/5 blur-[150px] rounded-full pointer-events-none z-0" />

    <!-- Content -->
    <div class="relative z-10 flex flex-col flex-grow">
      <Header />
      <main class="flex-grow">
        <NuxtPage />
      </main>
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from '~/components/Header.vue';
import Footer from '~/components/Footer.vue';

useHead({
  htmlAttrs: {
    lang: 'en'
  }
});
</script>
