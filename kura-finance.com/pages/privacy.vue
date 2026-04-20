<template>
  <div class="min-h-screen bg-kura-background text-kura-text">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 text-kura-text">Privacy Policy</h1>
        <p class="text-kura-text-secondary text-lg">Last Updated: April 2026</p>
      </div>

      <!-- Content -->
      <div class="prose max-w-none space-y-8">
        <!-- 1. Information We Collect -->
        <section>
          <h2 class="text-2xl font-bold text-kura-text mb-4">1. Information We Collect</h2>
          <p class="text-kura-text-secondary leading-relaxed">
            We collect information necessary to provide our Service, including account details, read-only financial data accessed via authorized APIs (e.g., Plaid), and public blockchain wallet addresses. For users opting into the Kura Decentralized ID (KDID) and Kura Liquidity Health Score (KLHS) features, we may process identity verification data through authorized third-party KYC providers. For Kura Notary services, we collect cryptographic hashes of your documents, never the file contents.
          </p>
        </section>

        <!-- 2. How We Use Your Information -->
        <section>
          <h2 class="text-2xl font-bold text-kura-text mb-4">2. How We Use Your Information</h2>
          <p class="text-kura-text-secondary leading-relaxed">
            Your data is used to provide the Kura Finance dashboard, generate Zero-Knowledge (ZK) proofs, and calculate the Kura Liquidity Health Score (KLHS). We do not sell your raw personal or financial data. When you authorize a decentralized protocol to verify your KLHS, we only transmit cryptographically verified risk scores or boolean values (e.g., pass/fail), never your underlying bank account numbers or raw transaction history.
          </p>
        </section>

        <!-- 3. Third-Party Data Processors & Partners -->
        <section>
          <h2 class="text-2xl font-bold text-kura-text mb-4">3. Third-Party Data Processors & Partners</h2>
          <p class="text-kura-text-secondary leading-relaxed">
            We use trusted third-party services (such as Google Cloud, Lemon Squeezy, and identity verification partners like Sumsub) to operate our platform. Furthermore, upon your explicit on-chain or in-app authorization, cryptographically secured risk attestations (ZK Proofs) may be shared with designated DeFi protocols to facilitate undercollateralized lending or identity verification.
          </p>
        </section>

        <!-- 4. Data Security & Read-Only Access -->
        <section>
          <h2 class="text-2xl font-bold text-kura-text mb-4">4. Data Security & Read-Only Access</h2>
          <p class="text-kura-text-secondary leading-relaxed">
            Our platform operates on a non-custodial, read-only architecture. We cannot initiate transfers or access the underlying funds in your connected bank accounts or Web3 wallets. All data transmitted is secured using industry-standard encryption.
          </p>
        </section>

        <!-- 5. FCRA Disclaimer (US Users) -->
        <section>
          <h2 class="text-2xl font-bold text-kura-text mb-4">5. FCRA Disclaimer (US Users)</h2>
          <p class="text-kura-text-secondary leading-relaxed">
            Kura Finance LLC is not a Consumer Reporting Agency (CRA) as defined by the Fair Credit Reporting Act (FCRA). The Kura Liquidity Health Score (KLHS) is a proprietary, on-chain liquidity and risk assessment tool designed strictly for decentralized finance (DeFi) protocols. It is not intended to be used, and must not be used, for traditional credit, employment, insurance, or housing decisions.
          </p>
        </section>

        <!-- 6. Your Rights -->
        <section>
          <h2 class="text-2xl font-bold text-kura-text mb-4">6. Your Rights</h2>
          <p class="text-kura-text-secondary leading-relaxed">
            You have the right to request access to, correction of, or deletion of your personal data at any time. To exercise these rights, please contact us at 
            <a href="mailto:support@kura-finance.com" class="text-kura-primary hover:text-kura-accent transition-colors">support@kura-finance.com</a>.
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
  title: 'Privacy Policy - Kura Finance',
  description: 'Kura Finance privacy policy. Learn how we protect and handle your personal data and financial information. Your privacy is our top priority.',
  keywords: 'privacy policy, data protection, GDPR, user privacy',
  ogTitle: 'Privacy Policy - Kura Finance',
  ogDescription: 'Learn how we protect and handle your personal data and financial information.',
  ogUrl: 'https://kura-finance.com/privacy',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Privacy Policy - Kura Finance'
});
</script>
