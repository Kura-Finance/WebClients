<template>
  <div class="w-full text-kura-text">
    <!-- Hero Section -->
    <section class="relative pt-20 md:pt-32 pb-16 md:pb-24 px-4 sm:px-6">
      <div class="max-w-5xl mx-auto">
        <div class="text-center space-y-8">
          <div class="inline-block">
            <div class="px-4 py-2 rounded-full bg-kura-primary/10 border border-kura-primary/20">
              <p class="text-sm font-semibold text-kura-primary">DeFi Infrastructure & DAOs</p>
            </div>
          </div>

          <h1 class="text-5xl md:text-7xl font-black tracking-tight">
            <span class="bg-gradient-to-r from-kura-primary to-kura-secondary bg-clip-text text-transparent">
              Beyond Overcollateralization
            </span>
          </h1>

          <h2 class="text-2xl md:text-3xl font-bold text-kura-text-secondary">
            DeFi's Next-Generation Credit Oracle. Integrate Kura Liquidity Health Score (KLHS). Defend against attack vectors, eliminate malicious defaults, and unlock institutional-grade capital efficiency for your quality users.
          </h2>

          <p class="text-lg md:text-xl text-kura-text-secondary max-w-3xl mx-auto leading-relaxed">
            For DeFi protocols seeking to transcend overcollateralization. Sybil-resistant scoring, cross-fi utilization insights, and privacy-preserving risk oracles.
          </p>

          <div class="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://docs.kura-finance.com" target="_blank" rel="noopener noreferrer" 
               class="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-kura-primary to-kura-secondary text-white font-semibold hover:shadow-lg hover:shadow-kura-primary/50 transition-all duration-300">
              Integrate KLHS API
            </a>
            <a href="https://docs.kura-finance.com" target="_blank" rel="noopener noreferrer"
               class="inline-block px-8 py-4 rounded-lg border border-kura-primary text-kura-primary font-semibold hover:bg-kura-primary/10 transition-all duration-300">
              Read The Docs
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Four Pillars Section -->
    <section class="py-20 md:py-32 px-4 sm:px-6">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold mb-6">
            The Four Pillars of DeFi Credit Infrastructure
          </h2>
          <p class="text-lg text-kura-text-secondary max-w-3xl mx-auto">
            Sybil resistance, cross-fi insights, dynamic optimization, and privacy-first design.
          </p>
        </div>

        <div class="space-y-12">
          <!-- Pillar 1 -->
          <div class="grid md:grid-cols-2 gap-8 items-start">
            <div class="order-2 md:order-1">
              <div class="rounded-xl bg-kura-background-light border border-kura-border p-8 h-64 flex items-center justify-center">
                <div class="text-center text-kura-text-secondary">Risk Scoring Dashboard</div>
              </div>
            </div>
            <div class="order-1 md:order-2 space-y-6">
              <div>
                <p class="text-sm font-semibold text-kura-primary uppercase tracking-wider mb-2">Pillar 1</p>
                <h3 class="text-3xl md:text-4xl font-bold mb-4">
                  Sybil-Resistant Risk Scoring
                </h3>
              </div>
              <p class="text-lg text-kura-text-secondary leading-relaxed">
                Collateral lies, but history never does. KLHS deeply tracks borrower lending and liquidation history across major protocols like Aave and Morpho over two-year periods. Reject wash attack wallets created five minutes ago before they drain your liquidity pools.
              </p>
              <div class="space-y-3 pt-4">
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-kura-primary/20 flex items-center justify-center">
                    <svg class="w-4 h-4 text-kura-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-kura-text-secondary">Two-year borrowing history across Aave, Morpho, and major protocols</span>
                </div>
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-kura-primary/20 flex items-center justify-center">
                    <svg class="w-4 h-4 text-kura-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-kura-text-secondary">Liquidation event tracking and default pattern analysis</span>
                </div>
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-kura-primary/20 flex items-center justify-center">
                    <svg class="w-4 h-4 text-kura-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-kura-text-secondary">Real-time Sybil detection and wash attack prevention</span>
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
                  Cross-Fi Utilization Oracle
                </h3>
              </div>
              <p class="text-lg text-kura-text-secondary leading-relaxed">
                This is the only cross-interface data dimension available. Through compliant API integration of borrowers' traditional bank deposit balances, provide your lending pool with proof of "real-world off-chain financial capacity." Addresses that appear impoverished in the real world but hold massive on-chain assets will be exposed instantly.
              </p>
              <div class="space-y-3 pt-4">
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-kura-primary/20 flex items-center justify-center">
                    <svg class="w-4 h-4 text-kura-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-kura-text-secondary">Integration of traditional banking data via compliant APIs</span>
                </div>
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-kura-primary/20 flex items-center justify-center">
                    <svg class="w-4 h-4 text-kura-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-kura-text-secondary">Real-world financial capacity verification and validation</span>
                </div>
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-kura-primary/20 flex items-center justify-center">
                    <svg class="w-4 h-4 text-kura-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-kura-text-secondary">Anomaly detection for mismatched on-chain and off-chain wealth</span>
                </div>
              </div>
            </div>
            <div>
              <div class="rounded-xl bg-kura-background-light border border-kura-border p-8 h-64 flex items-center justify-center">
                <div class="text-center text-kura-text-secondary">Cross-Fi Oracle</div>
              </div>
            </div>
          </div>

          <div class="h-px bg-gradient-to-r from-transparent via-kura-border to-transparent" />

          <!-- Pillar 3 -->
          <div class="grid md:grid-cols-2 gap-8 items-start">
            <div class="order-2 md:order-1">
              <div class="rounded-xl bg-kura-background-light border border-kura-border p-8 h-64 flex items-center justify-center">
                <div class="text-center text-kura-text-secondary">LTV Optimization Engine</div>
              </div>
            </div>
            <div class="order-1 md:order-2 space-y-6">
              <div>
                <p class="text-sm font-semibold text-kura-primary uppercase tracking-wider mb-2">Pillar 3</p>
                <h3 class="text-3xl md:text-4xl font-bold mb-4">
                  Dynamic LTV Optimization
                </h3>
              </div>
              <p class="text-lg text-kura-text-secondary leading-relaxed">
                Reject undifferentiated capital waste. By calling the KLHS smart contract, automatically increase the loan-to-value (LTV) ratio for whale users with KDID binding and credit scores above standard thresholds. Maximize your protocol's capital utilization without increasing systemic risk.
              </p>
              <div class="space-y-3 pt-4">
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-kura-primary/20 flex items-center justify-center">
                    <svg class="w-4 h-4 text-kura-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-kura-text-secondary">Smart contract integration for automated LTV adjustments</span>
                </div>
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-kura-primary/20 flex items-center justify-center">
                    <svg class="w-4 h-4 text-kura-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-kura-text-secondary">Risk-adjusted LTV tiers based on credit scores and KDID</span>
                </div>
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-kura-primary/20 flex items-center justify-center">
                    <svg class="w-4 h-4 text-kura-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-kura-text-secondary">Real-time capital efficiency maximization without risk increase</span>
                </div>
              </div>
            </div>
          </div>

          <div class="h-px bg-gradient-to-r from-transparent via-kura-border to-transparent" />

          <!-- Pillar 4 -->
          <div class="grid md:grid-cols-2 gap-8 items-start">
            <div class="space-y-6">
              <div>
                <p class="text-sm font-semibold text-kura-primary uppercase tracking-wider mb-2">Pillar 4</p>
                <h3 class="text-3xl md:text-4xl font-bold mb-4">
                  Privacy by Design with zkTLS
                </h3>
              </div>
              <p class="text-lg text-kura-text-secondary leading-relaxed">
                Protocol operators never handle sensitive personal information. When your smart contracts call the Kura oracle, we only return cryptographically verified risk rating results. Perfect implementation of "Know Your Risk (KYR)" while maintaining Web3's anonymous spirit and user privacy ideals.
              </p>
              <div class="space-y-3 pt-4">
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-kura-primary/20 flex items-center justify-center">
                    <svg class="w-4 h-4 text-kura-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-kura-text-secondary">Zero-knowledge proof verification of risk scores</span>
                </div>
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-kura-primary/20 flex items-center justify-center">
                    <svg class="w-4 h-4 text-kura-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-kura-text-secondary">No sensitive personal data exposed to protocol operators</span>
                </div>
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-6 h-6 rounded-full bg-kura-primary/20 flex items-center justify-center">
                    <svg class="w-4 h-4 text-kura-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-kura-text-secondary">KYR compliance with Web3 anonymity principles intact</span>
                </div>
              </div>
            </div>
            <div>
              <div class="rounded-xl bg-kura-background-light border border-kura-border p-8 h-64 flex items-center justify-center">
                <div class="text-center text-kura-text-secondary">zkTLS Privacy Proof</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why DeFi Protocols Choose Kura -->
    <section class="py-20 md:py-32 px-4 sm:px-6 bg-kura-background-light">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold mb-6">
            Why DeFi Protocols Choose Kura
          </h2>
          <p class="text-lg text-kura-text-secondary max-w-3xl mx-auto">
            Proven risk infrastructure for institutional protocols.
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
                <h3 class="font-bold text-kura-text mb-2">Reduced Bad Debt</h3>
                <p class="text-kura-text-secondary">Eliminate unprofitable liquidations and protocol losses through Sybil-resistant scoring and off-chain verification.</p>
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
                <h3 class="font-bold text-kura-text mb-2">Increased Capital Efficiency</h3>
                <p class="text-kura-text-secondary">Qualified users get better LTV ratios, boosting protocol revenue and TVL without excessive risk.</p>
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
                <h3 class="font-bold text-kura-text mb-2">Privacy Compliance</h3>
                <p class="text-kura-text-secondary">Implement KYR without exposing PII. Zero-knowledge architecture maintains Web3 privacy principles.</p>
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
                <h3 class="font-bold text-kura-text mb-2">Simple Integration</h3>
                <p class="text-kura-text-secondary">One API call to access institutional-grade risk oracles. Minimal smart contract complexity.</p>
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
            Ready to Build Next-Gen DeFi Infrastructure?
          </h2>
          <p class="text-lg text-kura-text-secondary max-w-2xl mx-auto">
            Integrate KLHS today. Transcend overcollateralization tomorrow.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://docs.kura-finance.com" target="_blank" rel="noopener noreferrer" 
               class="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-kura-primary to-kura-secondary text-white font-semibold hover:shadow-lg hover:shadow-kura-primary/50 transition-all duration-300">
              Integrate KLHS API
            </a>
            <a href="https://docs.kura-finance.com" target="_blank" rel="noopener noreferrer"
               class="inline-block px-8 py-4 rounded-lg border border-kura-primary text-kura-primary font-semibold hover:bg-kura-primary/10 transition-all duration-300">
              View Documentation
            </a>
          </div>
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
  title: 'For DeFi Protocols | KLHS Credit Oracle - Kura Finance',
  description: 'Next-generation DeFi credit oracle. Sybil-resistant risk scoring, cross-fi utilization data, dynamic LTV optimization, and privacy-preserving infrastructure for lending protocols.',
  keywords: 'DeFi lending, credit oracle, Sybil resistance, risk scoring, LTV optimization, KLHS, zero-knowledge proof, lending protocol infrastructure',
  ogTitle: 'For DeFi Protocols | Beyond Overcollateralization',
  ogDescription: 'Transcend overcollateralization. Institutional-grade credit infrastructure.',
  ogUrl: 'https://kura-finance.com/defi-protocols',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'DeFi Protocols | Kura Finance'
});
</script>
