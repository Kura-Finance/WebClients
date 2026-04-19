<template>
  <div class="text-white">
    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 md:py-32">
      <div class="max-w-4xl mx-auto text-center space-y-8">
        <div class="inline-block">
          <span class="text-6xl md:text-8xl">💼</span>
        </div>
        <h1 class="text-4xl md:text-6xl font-bold leading-tight">
          Track Your Crypto Earnings
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-kura-primary to-kura-secondary">
            With Clarity
          </span>
        </h1>
        <p class="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
          Get paid in USDT. Spend in USDC. Hold in ETH. Know exactly how much you've earned and what you owe.
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

    <!-- The Pain Points -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
      <div class="text-center space-y-4">
        <h2 class="text-3xl md:text-5xl font-bold">The Freelancer's Crypto Challenge</h2>
        <p class="text-xl text-gray-400">Earning in crypto is freedom. Managing it shouldn't be a nightmare.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4 hover:border-kura-primary/30 transition-colors">
          <div class="text-4xl">🎯</div>
          <h3 class="text-xl font-bold">Multiple Payment Stablecoins</h3>
          <p class="text-gray-400">Clients pay you in USDT, others in USDC. Each has different gas fees, exchange rates, and liquidity.</p>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4 hover:border-kura-primary/30 transition-colors">
          <div class="text-4xl">📉</div>
          <h3 class="text-xl font-bold">Volatile Cost Basis</h3>
          <p class="text-gray-400">You earned 100 USDC last month. What was it worth in your local currency when you received it?</p>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4 hover:border-kura-primary/30 transition-colors">
          <div class="text-4xl">💰</div>
          <h3 class="text-xl font-bold">Tax Reporting Nightmare</h3>
          <p class="text-gray-400">Tracking crypto income for taxes requires detailed records of every transaction. Most tools miss important data.</p>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4 hover:border-kura-primary/30 transition-colors">
          <div class="text-4xl">🔄</div>
          <h3 class="text-xl font-bold">Exchange Rate Uncertainty</h3>
          <p class="text-gray-400">When you convert USDT to USDC, what's your actual spread? How much does it cost to cash out?</p>
        </div>
      </div>
    </section>

    <!-- The Solution -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
      <div class="text-center space-y-4">
        <h2 class="text-3xl md:text-5xl font-bold">Kura Finance: Your Crypto Accounting Partner</h2>
        <p class="text-xl text-gray-400">Earnings. Costs. Taxes. All crystal clear.</p>
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
                <h3 class="text-xl font-bold mb-2">Unified Stablecoin Tracking</h3>
                <p class="text-gray-400">USDT, USDC, DAI, USDT-T—we track them all. See your total stablecoin position across multiple networks.</p>
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
                <h3 class="text-xl font-bold mb-2">Accurate Cost Basis Tracking</h3>
                <p class="text-gray-400">Every transaction recorded with live exchange rates at the time of receipt. Your true gain/loss is always accurate.</p>
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
                <h3 class="text-xl font-bold mb-2">Tax-Ready Reports</h3>
                <p class="text-gray-400">Generate detailed income and expense reports ready for your accountant or tax software. No more manual work.</p>
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
                <h3 class="text-xl font-bold mb-2">Real Exchange Rates</h3>
                <p class="text-gray-400">See exactly what you paid to convert between stablecoins. Every spread, every fee, accounted for.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Use Cases -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
      <div class="text-center space-y-4">
        <h2 class="text-3xl md:text-5xl font-bold">For Web3 Freelancers & Builders</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4">
          <div class="text-3xl">👨‍💻</div>
          <h3 class="text-xl font-bold">Smart Contract Auditor</h3>
          <p class="text-gray-400">Get paid in USDC per audit. Track earnings across multiple clients and know your monthly income instantly.</p>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4">
          <div class="text-3xl">🎨</div>
          <h3 class="text-xl font-bold">Web3 Designer</h3>
          <p class="text-gray-400">Receive payment in USDT from global clients. Report to your home country tax authority with confidence.</p>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4">
          <div class="text-3xl">📝</div>
          <h3 class="text-xl font-bold">Content Creator</h3>
          <p class="text-gray-400">Earn from DAOs, grants, and sponsorships in different tokens. See your total earned value and net worth.</p>
        </div>
      </div>
    </section>

    <!-- Features Highlight -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
      <div class="text-center space-y-4">
        <h2 class="text-3xl md:text-5xl font-bold">Why Freelancers Choose Kura</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="flex gap-4">
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center h-10 w-10 rounded-lg bg-kura-primary/20 text-kura-primary text-lg font-bold">✓</div>
          </div>
          <div>
            <h3 class="font-bold mb-1">Non-Custodial</h3>
            <p class="text-gray-400">We never hold your crypto. Read-only access keeps you in full control.</p>
          </div>
        </div>

        <div class="flex gap-4">
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center h-10 w-10 rounded-lg bg-kura-primary/20 text-kura-primary text-lg font-bold">✓</div>
          </div>
          <div>
            <h3 class="font-bold mb-1">Privacy First</h3>
            <p class="text-gray-400">Your financial data stays private. We don't sell your information.</p>
          </div>
        </div>

        <div class="flex gap-4">
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center h-10 w-10 rounded-lg bg-kura-primary/20 text-kura-primary text-lg font-bold">✓</div>
          </div>
          <div>
            <h3 class="font-bold mb-1">Real-Time Data</h3>
            <p class="text-gray-400">Live exchange rates and instant balance updates across all your wallets.</p>
          </div>
        </div>

        <div class="flex gap-4">
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center h-10 w-10 rounded-lg bg-kura-primary/20 text-kura-primary text-lg font-bold">✓</div>
          </div>
          <div>
            <h3 class="font-bold mb-1">Enterprise Security</h3>
            <p class="text-gray-400">TLS 1.2/1.3 encryption. AES-256 at rest. Zero-trust architecture.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8">
      <div class="bg-gradient-to-r from-kura-primary/10 to-kura-secondary/10 border border-kura-primary/30 rounded-xl p-12 text-center space-y-6">
        <h2 class="text-3xl md:text-4xl font-bold">Start Tracking Your Crypto Earnings Today</h2>
        <p class="text-lg text-gray-400">Know exactly how much you've earned, what you owe, and what your crypto is worth.</p>
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
  title: 'For Web3 Freelancers - Crypto Accounting',
  description: 'Track your USDT, USDC, and crypto earnings with clarity. Perfect for Web3 freelancers and crypto professionals. Real-time portfolio tracking and tax reporting.',
  keywords: 'Web3 freelancer, crypto accounting, USDT tracking, freelancer taxes, crypto income, stablecoin tracker',
  ogTitle: 'For Web3 Freelancers - Crypto Accounting',
  ogDescription: 'Track your USDT, USDC, and crypto earnings with clarity.',
  ogUrl: 'https://kura-finance.com/web3-freelancers',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'For Web3 Freelancers - Kura Finance'
});
</script>

<style scoped>
section {
  position: relative;
}
</style>
