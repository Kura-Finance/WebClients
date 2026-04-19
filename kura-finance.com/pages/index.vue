<script setup lang="ts">
definePageMeta({
  layout: 'default'
});

import HeroSection from '~/components/HeroSection.vue';
import FeaturesSection from '~/components/FeaturesSection.vue';

useSeoMeta({
  title: 'Kura Finance - Unified Wealth Management',
  description: 'Unify your Web3 & Fiat finances in one dashboard. Real-time analytics, automated tracking, and enterprise-grade security for modern investors.',
  keywords: 'Web3 portfolio tracker, crypto wealth management, DeFi dashboard, unified finance, wealth management platform',
  ogTitle: 'Kura Finance - Unified Wealth Management',
  ogDescription: 'Unify your Web3 & Fiat finances in one dashboard. Real-time analytics, automated tracking, and enterprise-grade security for modern investors.',
  ogUrl: 'https://kura-finance.com/',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Kura Finance - Unified Wealth Management',
  twitterDescription: 'Unify your Web3 & Fiat finances in one dashboard.'
});
</script>

<template>
  <div>
    <!-- Grid Background Pattern -->
    <div class="fixed inset-0 bg-[linear-gradient(rgba(0,0,0,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

    <!-- Main Content -->
    <div class="relative z-10 w-full">
      <HeroSection />
      <FeaturesSection />

      <!-- CTA Section -->
      <section class="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl mx-auto text-center space-y-8">
          <div class="space-y-4">
            <h2 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-kura-primary to-kura-secondary bg-clip-text text-transparent">
              Ready to unify your wealth?
            </h2>
            <p class="text-lg text-kura-text-secondary">
              Join the revolution of personal wealth management. Launch your dashboard today.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a href="https://app.kura-finance.com" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-lg bg-gradient-to-r from-kura-primary to-kura-secondary text-white font-semibold hover:shadow-lg hover:shadow-kura-primary/50 transition-all duration-300">
              Launch Dashboard
            </a>
            <button @click="navigateTo('/about')" class="px-8 py-4 rounded-lg border-2 border-kura-accent text-kura-accent font-semibold hover:bg-kura-accent/10 transition-colors duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
