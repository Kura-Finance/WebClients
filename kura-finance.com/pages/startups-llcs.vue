<template>
  <div class="text-white">
    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 md:py-32">
      <div class="max-w-4xl mx-auto text-center space-y-8">
        <div class="inline-block">
          <span class="text-6xl md:text-8xl">🏢</span>
        </div>
        <h1 class="text-4xl md:text-6xl font-bold leading-tight">
          Treasury Management
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-kura-primary to-kura-secondary">
            for Modern Companies
          </span>
        </h1>
        <p class="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
          Consolidate bank accounts, SaaS expenses, and blockchain assets. Get compliance-ready reports without the complexity.
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

    <!-- The Challenge for Startups -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
      <div class="text-center space-y-4">
        <h2 class="text-3xl md:text-5xl font-bold">The Startup Treasury Problem</h2>
        <p class="text-xl text-gray-400">Growing fast means scattered finances.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4 hover:border-kura-primary/30 transition-colors">
          <div class="text-4xl">🏦</div>
          <h3 class="text-xl font-bold">Multiple Bank Accounts</h3>
          <p class="text-gray-400">Operating account. Reserve account. Different currencies for different markets.</p>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4 hover:border-kura-primary/30 transition-colors">
          <div class="text-4xl">💳</div>
          <h3 class="text-xl font-bold">SaaS Subscription Hell</h3>
          <p class="text-gray-400">GCP, AWS, Stripe, GitHub, Linear... dozens of recurring charges scattered across statements.</p>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4 hover:border-kura-primary/30 transition-colors">
          <div class="text-4xl">🔗</div>
          <h3 class="text-xl font-bold">Blockchain Treasury</h3>
          <p class="text-gray-400">Holding ETH, USDC, or DAO tokens on-chain. How do you value it? Where is it tracked?</p>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4 hover:border-kura-primary/30 transition-colors">
          <div class="text-4xl">📋</div>
          <h3 class="text-xl font-bold">Compliance Reporting</h3>
          <p class="text-gray-400">Your accountant needs detailed records. Manual entry and spreadsheets aren't scaling.</p>
        </div>
      </div>
    </section>

    <!-- The Solution -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
      <div class="text-center space-y-4">
        <h2 class="text-3xl md:text-5xl font-bold">Kura Finance: Your Unified Treasury Dashboard</h2>
        <p class="text-xl text-gray-400">One view. All your assets. Complete transparency.</p>
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
                <h3 class="text-xl font-bold mb-2">Bank Account Aggregation</h3>
                <p class="text-gray-400">All your business accounts in one place. See total cash position instantly. Drill down by account or currency.</p>
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
                <h3 class="text-xl font-bold mb-2">Blockchain Asset Integration</h3>
                <p class="text-gray-400">Track your on-chain treasury. ETH, USDC, staking rewards, DAO governance tokens. All valued in real-time.</p>
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
                <h3 class="text-xl font-bold mb-2">SaaS Expense Tracking</h3>
                <p class="text-gray-400">Automatic categorization of recurring charges. See which services eat your budget. Identify cost optimization opportunities.</p>
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
                <h3 class="text-xl font-bold mb-2">Compliance & Audit Ready</h3>
                <p class="text-gray-400">Generate detailed financial reports in seconds. Tax-ready breakdowns. Audit trails for every transaction.</p>
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
                <h3 class="text-xl font-bold mb-2">Blockchain Notary (Coming Soon)</h3>
                <p class="text-gray-400">Immutable proof of financial state recorded on-chain. Perfect for investor reporting, legal proceedings, and compliance.</p>
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
        <h2 class="text-3xl md:text-5xl font-bold">For Startups & LLCs</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4">
          <div class="text-3xl">🚀</div>
          <h3 class="text-xl font-bold">B2B SaaS Startup</h3>
          <p class="text-gray-400">Operating accounts across US, EU, and APAC. Track ARR and cash burn across currencies in one dashboard.</p>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4">
          <div class="text-3xl">⚡</div>
          <h3 class="text-xl font-bold">Web3 Protocol DAO</h3>
          <p class="text-gray-400">Manage multi-sig treasury. Track ETH, governance tokens, and staking rewards. Show investors your financial health.</p>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4">
          <div class="text-3xl">📱</div>
          <h3 class="text-xl font-bold">Indie Developer LLC</h3>
          <p class="text-gray-400">App Store, Play Store, and subscription payments all tracked. Know your actual take-home revenue.</p>
        </div>
      </div>
    </section>

    <!-- Key Features -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
      <div class="text-center space-y-4">
        <h2 class="text-3xl md:text-5xl font-bold">Why Companies Trust Kura</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="flex gap-4">
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center h-10 w-10 rounded-lg bg-kura-primary/20 text-kura-primary text-lg font-bold">✓</div>
          </div>
          <div>
            <h3 class="font-bold mb-1">Non-Custodial</h3>
            <p class="text-gray-400">Read-only access. We never control company funds. Zero counterparty risk.</p>
          </div>
        </div>

        <div class="flex gap-4">
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center h-10 w-10 rounded-lg bg-kura-primary/20 text-kura-primary text-lg font-bold">✓</div>
          </div>
          <div>
            <h3 class="font-bold mb-1">Enterprise Security</h3>
            <p class="text-gray-400">TLS 1.2/1.3 encryption, AES-256 at rest, Zero-trust architecture.</p>
          </div>
        </div>

        <div class="flex gap-4">
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center h-10 w-10 rounded-lg bg-kura-primary/20 text-kura-primary text-lg font-bold">✓</div>
          </div>
          <div>
            <h3 class="font-bold mb-1">Compliance Focus</h3>
            <p class="text-gray-400">OFAC compliant. Audit-ready reports. Built for regulators.</p>
          </div>
        </div>

        <div class="flex gap-4">
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center h-10 w-10 rounded-lg bg-kura-primary/20 text-kura-primary text-lg font-bold">✓</div>
          </div>
          <div>
            <h3 class="font-bold mb-1">Real-Time Intelligence</h3>
            <p class="text-gray-400">Live data. Instant alerts. Know your financial position every second.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8">
      <div class="bg-gradient-to-r from-kura-primary/10 to-kura-secondary/10 border border-kura-primary/30 rounded-xl p-12 text-center space-y-6">
        <h2 class="text-3xl md:text-4xl font-bold">Get Your Treasury in Order</h2>
        <p class="text-lg text-gray-400">Consolidate your finances. Simplify compliance. Focus on building.</p>
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
  title: 'For Startups & LLCs - Treasury Management',
  description: 'Unified treasury management for startups and LLCs. Track bank accounts, SaaS expenses, and blockchain assets. Compliance-ready reporting for modern companies.',
  keywords: 'startup treasury, LLC accounting, business finances, startup accounting software, treasury management, DeFi treasury',
  ogTitle: 'For Startups & LLCs - Treasury Management',
  ogDescription: 'Unified treasury management for startups and LLCs.',
  ogUrl: 'https://kura-finance.com/startups-llcs',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'For Startups & LLCs - Kura Finance'
});
</script>

<style scoped>
section {
  position: relative;
}
</style>
