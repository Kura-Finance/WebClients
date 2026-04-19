<template>
  <div class="text-white min-h-screen flex items-center justify-center px-4">
    <div class="max-w-4xl mx-auto text-center space-y-8">
      <div class="space-y-4">
        <div class="inline-block">
          <span class="text-7xl md:text-8xl">💬</span>
        </div>
        <h1 class="text-5xl md:text-6xl font-bold">Help Center</h1>
        <p class="text-2xl text-gray-400">Coming Soon</p>
      </div>
      <p class="text-lg text-gray-500 max-w-2xl mx-auto">
        We're preparing FAQs, guides, and support resources. Stay tuned!
      </p>
      <NuxtLink to="/" class="inline-block px-8 py-4 bg-gradient-to-r from-kura-primary to-kura-secondary rounded-lg font-semibold text-white hover:shadow-glow-primary transition-all duration-300">
        Back Home
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
});

useSeoMeta({
  title: 'Help Center - Kura Finance',
  description: 'Get help with Kura Finance. Browse FAQs, guides, and support resources. Find answers to common questions about Web3 finance and portfolio tracking.',
  keywords: 'Kura Finance help, FAQ, support, documentation, guides',
  ogTitle: 'Help Center - Kura Finance',
  ogDescription: 'Get help with Kura Finance. Browse FAQs, guides, and support resources.',
  ogUrl: 'https://kura-finance.com/help',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Help Center - Kura Finance'
});
</script>

