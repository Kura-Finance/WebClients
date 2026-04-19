<template>
  <div class="min-h-screen bg-kura-background text-white">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">Disclaimer</h1>
        <p class="text-gray-400 text-lg">Please read this carefully before using Kura Finance.</p>
      </div>

      <!-- Content -->
      <div class="prose prose-invert max-w-none space-y-8">
        <!-- 1. Not Financial Advice (NFA) -->
        <section>
          <h2 class="text-2xl font-bold text-white mb-4">1. Not Financial Advice (NFA)</h2>
          <p class="text-gray-300 leading-relaxed">
            All information, charts, data, and analytics provided on the Kura Finance platform are for informational and educational purposes only. Nothing contained herein constitutes financial, investment, legal, or tax advice. You should conduct your own research (DYOR) and consult with a licensed professional before making any financial decisions.
          </p>
        </section>

        <!-- 2. Non-Custodial Nature -->
        <section>
          <h2 class="text-2xl font-bold text-white mb-4">2. Non-Custodial Nature</h2>
          <p class="text-gray-300 leading-relaxed">
            Kura Finance LLC is a software technology provider, not a bank, broker, or registered investment advisor. We operate entirely on a non-custodial basis. We do not hold, control, or manage your fiat currency or digital assets.
          </p>
        </section>

        <!-- 3. No Fiduciary Duty -->
        <section>
          <h2 class="text-2xl font-bold text-white mb-4">3. No Fiduciary Duty</h2>
          <p class="text-gray-300 leading-relaxed">
            Your use of Kura Finance does not create a fiduciary relationship between you and Kura Finance LLC. You are solely responsible for evaluating the merits and risks associated with the use of any information provided by the Service.
          </p>
        </section>

        <!-- 4. Data Accuracy -->
        <section>
          <h2 class="text-2xl font-bold text-white mb-4">4. Data Accuracy</h2>
          <p class="text-gray-300 leading-relaxed">
            While we strive to provide accurate and real-time data, we rely on third-party APIs and blockchain nodes. We do not guarantee the accuracy, completeness, or timeliness of any financial or on-chain data displayed.
          </p>
        </section>
      </div>

      <!-- Back Link -->
      <div class="mt-16 pt-8 border-t border-kura-border">
        <NuxtLink to="/" class="text-kura-primary hover:text-kura-accent transition-colors">
          ← Back to Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
});

useSeoMeta({
  title: 'Disclaimer - Kura Finance',
  description: 'Important disclaimer for Kura Finance. Financial information provided for informational purposes only. Not investment advice.',
  keywords: 'disclaimer, financial disclaimer, investment disclaimer',
  ogTitle: 'Disclaimer - Kura Finance',
  ogDescription: 'Important disclaimer for Kura Finance.',
  ogUrl: 'https://kura-finance.com/disclaimer',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Disclaimer - Kura Finance'
});
</script>
