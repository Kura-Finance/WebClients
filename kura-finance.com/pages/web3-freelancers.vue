<template>
  <div class="w-full text-kura-text">
    <!-- Hero Section -->
    <section class="relative pt-20 md:pt-32 pb-16 md:pb-24 px-4 sm:px-6">
      <div class="max-w-5xl mx-auto">
        <div class="text-center space-y-8">
          <div class="inline-block">
            <div class="px-4 py-2 rounded-full bg-kura-primary/10 border border-kura-primary/20">
              <p class="text-sm font-semibold text-kura-primary">Web3 Freelancer Financial Freedom</p>
            </div>
          </div>

          <h1 class="text-5xl md:text-7xl font-black tracking-tight">
            <span class="bg-gradient-to-r from-kura-primary to-kura-secondary bg-clip-text text-transparent">
              Reclaim Financial Control
            </span>
          </h1>

          <h2 class="text-2xl md:text-3xl font-bold text-kura-text-secondary">
            Earn USDT. Spend USDC. Hold ETH. Track it all with precision, and transform your on-chain income into institutional-grade credit.
          </h2>

          <p class="text-lg md:text-xl text-kura-text-secondary max-w-3xl mx-auto leading-relaxed">
            For Web3 freelancers who deserve more than spreadsheets. Real-time accounting, proof of income, and the power to build credit without compromising privacy.
          </p>

          <div class="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://app.kura-finance.com" target="_blank" rel="noopener noreferrer" 
               class="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-kura-primary to-kura-secondary text-white font-semibold hover:shadow-lg hover:shadow-kura-primary/50 transition-all duration-300">
              Build Your Web3 Credit
            </a>
            <NuxtLink to="/about" 
               class="inline-block px-8 py-4 rounded-lg border border-kura-primary text-kura-primary font-semibold hover:bg-kura-primary/10 transition-all duration-300">
              Learn More
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Three Pillars Section -->
    <section class="py-20 md:py-32 px-4 sm:px-6">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold mb-6">
            The Three Pillars of Web3 Freelancer Finance
          </h2>
          <p class="text-lg text-kura-text-secondary max-w-3xl mx-auto">
            Real-time accounting, institutional credit, and privacy-first income verification.
          </p>
        </div>

        <div class="space-y-12">
          <!-- Pillar 1 -->
          <div class="grid md:grid-cols-2 gap-8 items-start">
            <div class="order-2 md:order-1">
              <div class="rounded-xl bg-kura-background-light border border-kura-border p-8 h-64 flex items-center justify-center">
                <div class="text-center text-kura-text-secondary">Accounting Dashboard</div>
              </div>
            </div>
            <div class="order-1 md:order-2 space-y-6">
              <div>
                <p class="text-sm font-semibold text-kura-primary uppercase tracking-wider mb-2">Pillar 1</p>
                <h3 class="text-3xl md:text-4xl font-bold mb-4">
                  Automated Crypto Accounting
                </h3>
              </div>
              <p class="text-lg text-kura-text-secondary leading-relaxed">
                Stop the nightmare of tracking exchange rates and gas fees. Kura automatically monitors every on-chain transaction, converts to real-world value in real-time, and turns tax season from disaster into clarity. No manual entry. No spreadsheet hell.
              </p>
              <div class="space-y-3 pt-4">
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-kura-primary/20 flex items-center justify-center">
                    <svg class="w-4 h-4 text-kura-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-kura-text-secondary">Track USDT, USDC, DAI, and other stablecoins across all chains</span>
                </div>
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-kura-primary/20 flex items-center justify-center">
                    <svg class="w-4 h-4 text-kura-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-kura-text-secondary">Automatic cost-basis calculation and tax-ready reporting</span>
                </div>
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-kura-primary/20 flex items-center justify-center">
                    <svg class="w-4 h-4 text-kura-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-kura-text-secondary">Real-time exchange rates and gas fee tracking</span>
                </div>
              </div>
            </div>
          </div>

          <div class="h-px bg-gradient-to-r from-transparent via-kura-border to-transparent" />

          <!-- Pillar 2 -->
          <div class="grid md:grid-cols-2 gap-8 items-start">
            <div class="space-y-6">
              <div>
                <p class="text-sm font-semibold text-kura-primary uppercase tracking-wider mb-2">Pillar 2</p>
                <h3 class="text-3xl md:text-4xl font-bold mb-4">
                  Build Your Web3 Credit Asset
                </h3>
              </div>
              <p class="text-lg text-kura-text-secondary leading-relaxed">
                Traditional finance ignores your crypto income. Kura transforms your verified on-chain earnings and repayment history into institutional-grade identity (KDID). Prove your financial health to the world without exposing your real wallet addresses.
              </p>
              <div class="space-y-3 pt-4">
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-kura-primary/20 flex items-center justify-center">
                    <svg class="w-4 h-4 text-kura-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-kura-text-secondary">Mint your KDID as institutional-grade identity across protocols</span>
                </div>
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-kura-primary/20 flex items-center justify-center">
                    <svg class="w-4 h-4 text-kura-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-kura-text-secondary">Build a portable credit history recognized by DeFi protocols</span>
                </div>
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-kura-primary/20 flex items-center justify-center">
                    <svg class="w-4 h-4 text-kura-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-kura-text-secondary">Prove financial health without exposing wallet addresses</span>
                </div>
              </div>
            </div>
            <div>
              <div class="rounded-xl bg-kura-background-light border border-kura-border p-8 h-64 flex items-center justify-center">
                <div class="text-center text-kura-text-secondary">KDID Identity Card</div>
              </div>
            </div>
          </div>

          <div class="h-px bg-gradient-to-r from-transparent via-kura-border to-transparent" />

          <!-- Pillar 3 -->
          <div class="grid md:grid-cols-2 gap-8 items-start">
            <div class="order-2 md:order-1">
              <div class="rounded-xl bg-kura-background-light border border-kura-border p-8 h-64 flex items-center justify-center">
                <div class="text-center text-kura-text-secondary">ZK Proof Certificate</div>
              </div>
            </div>
            <div class="order-1 md:order-2 space-y-6">
              <div>
                <p class="text-sm font-semibold text-kura-primary uppercase tracking-wider mb-2">Pillar 3</p>
                <h3 class="text-3xl md:text-4xl font-bold mb-4">
                  ZK Proof of Income
                </h3>
              </div>
              <p class="text-lg text-kura-text-secondary leading-relaxed">
                Need to prove income to a landlord or traditional institution? Stop uploading your entire transaction history. Kura generates zero-knowledge proofs that mathematically prove your financial capacity while preserving absolute privacy. Math, not trust.
              </p>
              <div class="space-y-3 pt-4">
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-kura-primary/20 flex items-center justify-center">
                    <svg class="w-4 h-4 text-kura-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-kura-text-secondary">Generate zero-knowledge proofs of income for verification</span>
                </div>
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-kura-primary/20 flex items-center justify-center">
                    <svg class="w-4 h-4 text-kura-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-kura-text-secondary">Prove income thresholds without sharing detailed transaction data</span>
                </div>
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-kura-primary/20 flex items-center justify-center">
                    <svg class="w-4 h-4 text-kura-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-kura-text-secondary">Privacy-first approach to financial credential sharing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Web3 Freelancers Trust Kura -->
    <section class="py-20 md:py-32 px-4 sm:px-6 bg-kura-background-light">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold mb-6">
            Why Web3 Freelancers Trust Kura
          </h2>
          <p class="text-lg text-kura-text-secondary max-w-3xl mx-auto">
            Built for the independent crypto professional.
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          <div class="p-8 rounded-xl bg-white border border-kura-border hover:border-kura-primary/50 transition-all duration-300">
            <div class="flex gap-4 mb-4">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center h-10 w-10 rounded-lg bg-kura-primary/20 text-kura-primary">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 class="font-bold text-kura-text mb-2">Read-Only Access</h3>
                <p class="text-kura-text-secondary">We never control your wallets. Full transparency, zero custody risk.</p>
              </div>
            </div>
          </div>

          <div class="p-8 rounded-xl bg-white border border-kura-border hover:border-kura-primary/50 transition-all duration-300">
            <div class="flex gap-4 mb-4">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center h-10 w-10 rounded-lg bg-kura-primary/20 text-kura-primary">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 class="font-bold text-kura-text mb-2">Privacy by Design</h3>
                <p class="text-kura-text-secondary">Zero-knowledge architecture. Your data never leaves your control.</p>
              </div>
            </div>
          </div>

          <div class="p-8 rounded-xl bg-white border border-kura-border hover:border-kura-primary/50 transition-all duration-300">
            <div class="flex gap-4 mb-4">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center h-10 w-10 rounded-lg bg-kura-primary/20 text-kura-primary">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 class="font-bold text-kura-text mb-2">Tax-Ready Reporting</h3>
                <p class="text-kura-text-secondary">Export compliance-ready documents for accountants and regulators.</p>
              </div>
            </div>
          </div>

          <div class="p-8 rounded-xl bg-white border border-kura-border hover:border-kura-primary/50 transition-all duration-300">
            <div class="flex gap-4 mb-4">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center h-10 w-10 rounded-lg bg-kura-primary/20 text-kura-primary">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 class="font-bold text-kura-text mb-2">Multi-Chain Support</h3>
                <p class="text-kura-text-secondary">Track income across Ethereum, Polygon, Optimism, and more.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 md:py-32 px-4 sm:px-6">
      <div class="max-w-4xl mx-auto">
        <div class="bg-gradient-to-r from-kura-primary/10 to-kura-secondary/10 border border-kura-primary/20 rounded-xl p-12 text-center space-y-6">
          <h2 class="text-4xl md:text-5xl font-bold">
            Ready to Take Control of Your Crypto Income?
          </h2>
          <p class="text-lg text-kura-text-secondary max-w-2xl mx-auto">
            Track earnings. Build credit. Prove income. All while keeping your privacy intact.
          </p>
          <a href="https://app.kura-finance.com" target="_blank" rel="noopener noreferrer" 
             class="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-kura-primary to-kura-secondary text-white font-semibold hover:shadow-lg hover:shadow-kura-primary/50 transition-all duration-300">
            Start Building Your Web3 Credit Today
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
});

useSeoMeta({
  title: 'For Web3 Freelancers | Build Your Crypto Credit - Kura Finance',
  description: 'Web3 freelancer financial freedom. Track crypto income, build institutional credit with KDID, and prove earnings with zero-knowledge proofs. Automated accounting for digital nomads.',
  keywords: 'Web3 freelancer, crypto income tracking, KDID identity, zero-knowledge proof, crypto accounting, freelancer taxes, DeFi credit, USDT USDC tracking',
  ogTitle: 'For Web3 Freelancers | Reclaim Financial Control',
  ogDescription: 'Earn USDT. Spend USDC. Hold ETH. Build your Web3 credit asset.',
  ogUrl: 'https://kura-finance.com/web3-freelancers',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Web3 Freelancers | Kura Finance'
});
</script>
