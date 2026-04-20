<template>
  <div class="min-h-screen bg-kura-background text-kura-text">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 text-kura-text">Disclaimer</h1>
        <p class="text-kura-text-secondary text-lg">Please read this carefully before using Kura Finance.</p>
      </div>

      <!-- Content -->
      <div class="prose prose-invert max-w-none space-y-8">
        <!-- 1. Not Financial, Legal, or Tax Advice (NFA) -->
        <section>
          <h2 class="text-2xl font-bold text-kura-text mb-4">1. Not Financial, Legal, or Tax Advice (NFA)</h2>
          <p class="text-kura-text-secondary leading-relaxed">
            All information, charts, risk scores (including KLHS), data, and analytics provided on the Kura Finance platform are for informational, educational, and software utility purposes only. Nothing contained herein constitutes financial, investment, legal, tax, or credit-building advice. You should conduct your own research (DYOR) and consult with a licensed professional before making any financial decisions or interacting with decentralized protocols.
          </p>
        </section>

        <!-- 2. Not a Consumer Reporting Agency (FCRA Exemption) -->
        <section>
          <h2 class="text-2xl font-bold text-kura-text mb-4">2. Not a Consumer Reporting Agency (FCRA Exemption)</h2>
          <p class="text-kura-text-secondary leading-relaxed">
            Kura Finance LLC is a Web3 software infrastructure provider, not a Consumer Reporting Agency (CRA) as defined by the US Fair Credit Reporting Act (FCRA). The Kura Liquidity Health Score (KLHS) and Kura Decentralized ID (KDID) are proprietary on-chain risk assessment tools designed strictly for use within Decentralized Finance (DeFi) ecosystems. They are explicitly not intended to be used for traditional consumer credit, mortgage, employment, insurance, or housing eligibility decisions.
          </p>
        </section>

        <!-- 3. Non-Custodial Nature & No Lending -->
        <section>
          <h2 class="text-2xl font-bold text-kura-text mb-4">3. Non-Custodial Nature & No Lending</h2>
          <p class="text-kura-text-secondary leading-relaxed">
            We operate entirely on a non-custodial, read-only basis. Kura Finance LLC does not hold, control, manage, or custody your fiat currency or digital assets. Furthermore, we are not a bank, lender, or broker. Kura Finance does not originate loans, approve credit lines, or underwrite debt. Any lending or borrowing activities you engage in are executed directly via third-party smart contracts.
          </p>
        </section>

        <!-- 4. Oracle & Smart Contract Risk -->
        <section>
          <h2 class="text-2xl font-bold text-kura-text mb-4">4. Oracle & Smart Contract Risk</h2>
          <p class="text-kura-text-secondary leading-relaxed">
            When you authorize Kura Finance to act as a Zero-Knowledge (ZK) data oracle for third-party DeFi protocols, you acknowledge that we merely transmit cryptographically verified data states. Kura Finance is not responsible for any protocol-level actions, including but not limited to loan denials, forced liquidations, or loss of collateral. You assume all risks associated with smart contract vulnerabilities and decentralized lending mechanisms.
          </p>
        </section>

        <!-- 5. Data Accuracy & API Limitations -->
        <section>
          <h2 class="text-2xl font-bold text-kura-text mb-4">5. Data Accuracy & API Limitations</h2>
          <p class="text-kura-text-secondary leading-relaxed">
            While we strive to provide real-time and accurate cross-chain and fiat data, we rely heavily on third-party APIs (e.g., Plaid, Sumsub) and blockchain RPC nodes. We do not guarantee the 100% accuracy, uptime, completeness, or timeliness of any financial data, risk scores, or on-chain attestations displayed. We are not liable for any financial impact caused by API synchronization delays or network outages.
          </p>
        </section>

        <!-- 6. No Fiduciary Duty -->
        <section>
          <h2 class="text-2xl font-bold text-kura-text mb-4">6. No Fiduciary Duty</h2>
          <p class="text-kura-text-secondary leading-relaxed">
            Your use of Kura Finance does not create a fiduciary, advisory, or principal-agent relationship between you and Kura Finance LLC. You are solely responsible for evaluating the merits and risks associated with the use of any tools, Oracles, or information provided by our Service.
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
