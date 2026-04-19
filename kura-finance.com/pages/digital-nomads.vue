<template>
  <div class="text-white">
    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 md:py-32">
      <div class="max-w-4xl mx-auto text-center space-y-8">
        <div class="inline-block">
          <span class="text-6xl md:text-8xl">🌍</span>
        </div>
        <h1 class="text-4xl md:text-6xl font-bold leading-tight">
          Your Finances,
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-kura-primary to-kura-secondary">
            Every Border
          </span>
        </h1>
        <p class="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
          Stop juggling USD, TWD, and crypto wallets. Unify everything in one intuitive dashboard and keep your financial life sane.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="https://app.kura-finance.com" target="_blank" rel="noopener noreferrer" class="px-8 py-4 bg-gradient-to-r from-kura-primary to-kura-secondary rounded-lg font-semibold text-white hover:shadow-glow-primary transition-all duration-300 text-lg">
            Launch App
          </a>
          <NuxtLink to="/about" class="px-8 py-4 border border-kura-primary text-kura-primary rounded-lg font-semibold hover:bg-kura-primary hover:text-white transition-all duration-300 text-lg">
            Learn More
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- The Challenge -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
      <div class="text-center space-y-4">
        <h2 class="text-3xl md:text-5xl font-bold">The Nomad's Dilemma</h2>
        <p class="text-xl text-gray-400">Sound familiar?</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4 hover:border-kura-primary/30 transition-colors">
          <div class="text-4xl">💸</div>
          <h3 class="text-xl font-bold">Multiple Bank Apps</h3>
          <p class="text-gray-400">Chase for USD. Your local bank for TWD. Each with their own interface, fees, and limits.</p>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4 hover:border-kura-primary/30 transition-colors">
          <div class="text-4xl">🔗</div>
          <h3 class="text-xl font-bold">Fragmented Crypto Holdings</h3>
          <p class="text-gray-400">Exchange wallets, hardware wallets, DeFi protocols. Scattered across different networks and platforms.</p>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4 hover:border-kura-primary/30 transition-colors">
          <div class="text-4xl">📊</div>
          <h3 class="text-xl font-bold">No Real Picture</h3>
          <p class="text-gray-400">Manually updating spreadsheets to track everything. Your net worth is always out of date.</p>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4 hover:border-kura-primary/30 transition-colors">
          <div class="text-4xl">📈</div>
          <h3 class="text-xl font-bold">Exchange Rate Chaos</h3>
          <p class="text-gray-400">Converting between USD, TWD, USDT, and USDC without a clear sense of your actual purchasing power.</p>
        </div>
      </div>
    </section>

    <!-- The Solution -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
      <div class="text-center space-y-4">
        <h2 class="text-3xl md:text-5xl font-bold">Kura Finance: Your Financial Command Center</h2>
        <p class="text-xl text-gray-400">One dashboard. All your money. One truth.</p>
      </div>

      <div class="space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div class="space-y-6">
            <div class="flex gap-4">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center h-12 w-12 rounded-lg bg-kura-primary/20 text-kura-primary">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <div>
                <h3 class="text-xl font-bold mb-2">Multi-Currency Aggregation</h3>
                <p class="text-gray-400">See USD, TWD, and all your crypto assets in one place. Real-time conversion with live exchange rates.</p>
              </div>
            </div>
          </div>
          <div class="bg-gradient-to-br from-kura-primary/10 to-kura-secondary/10 rounded-xl p-8 h-64 flex items-center justify-center border border-kura-primary/20">
            <div class="text-center text-gray-400">Interface Preview</div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div class="bg-gradient-to-br from-kura-primary/10 to-kura-secondary/10 rounded-xl p-8 h-64 flex items-center justify-center border border-kura-primary/20">
            <div class="text-center text-gray-400">Interface Preview</div>
          </div>
          <div class="space-y-6">
            <div class="flex gap-4">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center h-12 w-12 rounded-lg bg-kura-primary/20 text-kura-primary">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <div>
                <h3 class="text-xl font-bold mb-2">Non-Custodial & Secure</h3>
                <p class="text-gray-400">Read-only access to your accounts. We never touch your funds. Your keys, your coins, your control.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div class="space-y-6">
            <div class="flex gap-4">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center h-12 w-12 rounded-lg bg-kura-primary/20 text-kura-primary">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <div>
                <h3 class="text-xl font-bold mb-2">Real-Time Net Worth</h3>
                <p class="text-gray-400">Always know your exact financial position. Updated instantly as markets move. No more guessing.</p>
              </div>
            </div>
          </div>
          <div class="bg-gradient-to-br from-kura-primary/10 to-kura-secondary/10 rounded-xl p-8 h-64 flex items-center justify-center border border-kura-primary/20">
            <div class="text-center text-gray-400">Interface Preview</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Use Cases -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
      <div class="text-center space-y-4">
        <h2 class="text-3xl md:text-5xl font-bold">Built for Digital Nomads Like You</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4">
          <div class="text-3xl">🏖️</div>
          <h3 class="text-xl font-bold">Digital Nomad Traveling Asia</h3>
          <p class="text-gray-400">Monitor your US stocks, Taiwan bank account, and Ethereum staking rewards across every timezone you land in.</p>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4">
          <div class="text-3xl">💼</div>
          <h3 class="text-xl font-bold">Remote Worker Living Abroad</h3>
          <p class="text-gray-400">Get paid in USD, spend in local currency, and diversify into crypto—all tracked effortlessly in one view.</p>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4">
          <div class="text-3xl">🌐</div>
          <h3 class="text-xl font-bold">Multi-Country Financial Life</h3>
          <p class="text-gray-400">Maintain bank accounts in multiple countries while managing crypto. Consolidate everything without leaving your current countries.</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8">
      <div class="bg-gradient-to-r from-kura-primary/10 to-kura-secondary/10 border border-kura-primary/30 rounded-xl p-12 text-center space-y-6">
        <h2 class="text-3xl md:text-4xl font-bold">Ready to Unify Your Finances?</h2>
        <p class="text-lg text-gray-400">Stop juggling multiple apps. Start with clarity.</p>
        <a href="https://app.kura-finance.com" target="_blank" rel="noopener noreferrer" class="inline-block px-8 py-4 bg-gradient-to-r from-kura-primary to-kura-secondary rounded-lg font-semibold text-white hover:shadow-glow-primary transition-all duration-300 text-lg">
          Launch Kura Finance Today
        </a>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
});

useSeoMeta({
  title: 'For Digital Nomads - Multi-Currency Wealth Management',
  description: 'Unify your USD, TWD, and crypto wallets in one dashboard. Perfect for digital nomads managing cross-border finances with real-time currency conversion.',
  keywords: 'digital nomad finances, multi-currency wallet, cross-border payments, expatriate accounting, remote worker finances',
  ogTitle: 'For Digital Nomads - Wealth Management',
  ogDescription: 'Unify your USD, TWD, and crypto wallets in one dashboard.',
  ogUrl: 'https://kura-finance.com/digital-nomads',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'For Digital Nomads - Kura Finance'
});
</script>

<style scoped>
section {
  position: relative;
}
</style>
