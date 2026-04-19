<template>
  <section class="relative min-h-screen w-full bg-kura-background overflow-hidden flex items-center justify-center pt-20">
    <!-- Background Ambient Glows -->
    <div class="fixed top-0 left-0 w-full h-full">
      <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-kura-primary/5 blur-[150px] rounded-full pointer-events-none" />
      <div class="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-kura-secondary/5 blur-[150px] rounded-full pointer-events-none" />
    </div>

    <!-- Grid Background Pattern -->
    <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none opacity-20" />

    <!-- Content -->
    <div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <!-- Badge -->
      <div class="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-kura-primary/30 bg-kura-primary/10">
        <span class="w-2 h-2 rounded-full bg-kura-accent animate-pulse" />
        <span class="text-sm font-semibold text-kura-primary">Enterprise-Grade Infrastructure</span>
      </div>

      <!-- Main Headline -->
      <h1 class="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
        <span class="text-kura-text">Unify Your</span><br />
        <span class="bg-gradient-to-r from-kura-primary via-kura-secondary to-kura-accent bg-clip-text text-transparent">
          Web3 & Fiat Finances
        </span>
      </h1>

      <!-- Sub-headline -->
      <p class="text-lg md:text-2xl text-kura-text-secondary max-w-3xl mx-auto mb-8 leading-relaxed font-light">
        Real-time analytics, automated tracking, and enterprise-grade security for modern investors. No custody, no compromise, just clarity.
      </p>

      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
        <a href="https://app.kura-finance.com" target="_blank" rel="noopener noreferrer" class="px-8 py-4 bg-gradient-to-r from-kura-primary to-kura-secondary rounded-lg font-bold text-white hover:shadow-glow-primary transition-all duration-300 transform hover:scale-105 w-full sm:w-auto text-center">
          Launch App
        </a>
        <button @click="openDemo" class="px-8 py-4 border-2 border-kura-primary/50 rounded-lg font-bold text-kura-primary hover:bg-kura-primary/10 hover:border-kura-primary transition-all duration-300 w-full sm:w-auto">
          Schedule Demo
        </button>
      </div>

      <!-- Trust Indicators -->
      <div class="flex flex-col md:flex-row gap-6 md:gap-12 justify-center items-center text-sm text-kura-text-secondary pb-12">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-kura-accent" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span>US Corporate Compliance</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-kura-accent" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span>Zero-Custody Architecture</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-kura-accent" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span>Read-Only API</span>
        </div>
      </div>

      <!-- Hero Dashboard Image Placeholder -->
      <div class="relative mx-auto max-w-4xl">
        <div class="absolute inset-0 bg-gradient-to-r from-kura-primary/20 to-kura-secondary/20 rounded-2xl blur-2xl" />
        <div class="relative bg-gradient-to-b from-kura-background-light/50 to-kura-background/50 border border-kura-border rounded-2xl p-8 md:p-12 backdrop-blur-xl">
          <div class="aspect-video bg-gradient-to-br from-kura-border to-transparent rounded-lg border border-kura-border flex items-center justify-center">
            <div class="text-center">
              <svg class="w-16 h-16 md:w-24 md:h-24 text-kura-primary/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p class="text-kura-text-secondary text-sm md:text-base">Dashboard Preview</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const openDemo = () => {
  // TODO: Implement demo booking modal
  alert('Demo booking feature coming soon!');
};
</script>
