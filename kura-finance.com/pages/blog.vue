<template>
  <div class="text-white min-h-screen flex items-center justify-center px-4">
    <div class="max-w-4xl mx-auto text-center space-y-8">
      <div class="space-y-4">
        <div class="inline-block">
          <span class="text-7xl md:text-8xl">📰</span>
        </div>
        <h1 class="text-5xl md:text-6xl font-bold">Blog</h1>
        <p class="text-2xl text-gray-400">Coming Soon</p>
      </div>
      <p class="text-lg text-gray-500 max-w-2xl mx-auto">
        We're preparing amazing content on Web3, fintech, and wealth management. Stay tuned!
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
  title: 'Blog - Kura Finance',
  description: 'Read insights and analysis on Web3, fintech, and wealth management. Expert perspectives on crypto accounting, portfolio tracking, and modern finance.',
  keywords: 'Web3 blog, fintech articles, crypto accounting, wealth management tips, DeFi analysis',
  ogTitle: 'Blog - Kura Finance',
  ogDescription: 'Read insights and analysis on Web3, fintech, and wealth management.',
  ogUrl: 'https://kura-finance.com/blog',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Blog - Kura Finance'
});
</script>
