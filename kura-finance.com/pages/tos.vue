<template>
  <div class="min-h-screen bg-kura-background text-kura-text">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 text-kura-text">Terms of Service</h1>
        <p class="text-kura-text-secondary text-lg">Last Updated: April 2026</p>
      </div>

      <!-- Content -->
      <div class="prose prose-invert max-w-none space-y-8">
        <!-- 1. Acceptance of Terms -->
        <section>
          <h2 class="text-2xl font-bold text-kura-text mb-4">1. Acceptance of Terms</h2>
          <p class="text-kura-text-secondary leading-relaxed">
            By accessing or using the Kura Finance platform ("Service"), operated by Kura Finance LLC ("Company", "we", "us", or "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use our Service.
          </p>
        </section>

        <!-- 2. Description of Service -->
        <section>
          <h2 class="text-2xl font-bold text-kura-text mb-4">2. Description of Service</h2>
          <p class="text-kura-text-secondary leading-relaxed">
            Kura Finance provides a read-only financial data aggregation dashboard, decentralized identity verification (KDID), zero-knowledge liquidity health scoring (KLHS), and blockchain-based proof-of-existence tools. We do not execute trades, hold assets, act as a custodian, or provide financial, legal, or tax advice.
          </p>
        </section>

        <!-- 3. Kura Liquidity Health Score (KLHS) & FCRA Exemption -->
        <section>
          <h2 class="text-2xl font-bold text-kura-text mb-4">3. Kura Liquidity Health Score (KLHS) & FCRA Exemption</h2>
          <p class="text-kura-text-secondary leading-relaxed">
            Kura Finance LLC is NOT a Consumer Reporting Agency (CRA) as defined by the US Fair Credit Reporting Act (FCRA) or equivalent international regulations. The Kura Liquidity Health Score (KLHS) is a proprietary, on-chain risk and liquidity assessment metric designed exclusively for use by decentralized finance (DeFi) protocols and smart contracts. It is explicitly not intended to be used, and you agree not to use it, for establishing eligibility for traditional consumer credit, employment, insurance, housing, or any other purpose covered by the FCRA.
          </p>
        </section>

        <!-- 4. Oracle Liability & Third-Party APIs -->
        <section>
          <h2 class="text-2xl font-bold text-kura-text mb-4">4. Oracle Liability & Third-Party APIs</h2>
          <p class="text-kura-text-secondary leading-relaxed">
            Our Service, including the calculation of the KLHS, relies on data provided by authorized third-party fiat APIs (e.g., Plaid) and blockchain RPC nodes. We do not guarantee the real-time accuracy, uptime, or completeness of this external data. Kura Finance shall not be held liable for any financial losses, smart contract liquidations, denied loan originations, or adverse protocol actions resulting from delayed data synchronization, API outages, or fluctuations in your KLHS or KDID status.
          </p>
        </section>

        <!-- 5. Blockchain Notary & Document Uploads -->
        <section>
          <h2 class="text-2xl font-bold text-kura-text mb-4">5. Blockchain Notary & Document Uploads</h2>
          <p class="text-kura-text-secondary leading-relaxed">
            For features involving blockchain document verification (Kura Notary), you acknowledge that Kura Finance only generates and broadcasts a cryptographic hash of your documents on the blockchain. We do not verify the legality, authenticity, or contents of the original documents. You remain solely responsible for any data you process through this feature and its legal standing in your respective jurisdiction.
          </p>
        </section>

        <!-- 6. Limitation of Liability -->
        <section>
          <h2 class="text-2xl font-bold text-kura-text mb-4">6. Limitation of Liability</h2>
          <p class="text-kura-text-secondary leading-relaxed">
            To the maximum extent permitted by law, Kura Finance LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, digital assets, or funds lost due to smart contract vulnerabilities, resulting from your use of the Service. In no event shall our total liability exceed the amount you paid to us in the past twelve (12) months.
          </p>
        </section>

        <!-- 7. Governing Law & Jurisdiction -->
        <section>
          <h2 class="text-2xl font-bold text-kura-text mb-4">7. Governing Law & Jurisdiction</h2>
          <p class="text-kura-text-secondary leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of the State of Wyoming, USA, without regard to its conflict of law provisions. Any legal action or proceeding shall be brought exclusively in the state or federal courts located in Wyoming.
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
  title: 'Terms of Service - Kura Finance',
  description: 'Kura Finance Terms of Service. Read the legal terms governing the use of our platform and services.',
  keywords: 'terms of service, legal terms, user agreement',
  ogTitle: 'Terms of Service - Kura Finance',
  ogDescription: 'Read the legal terms governing the use of our platform and services.',
  ogUrl: 'https://kura-finance.com/tos',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Terms of Service - Kura Finance'
});
</script>
