<template>
  <div class="min-h-screen bg-kura-background text-kura-text">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 text-kura-text">Trust & Security Center</h1>
        <p class="text-kura-text-secondary text-lg">At Kura Finance, we build with enterprise-grade security, cryptographic privacy, and absolute regulatory clarity from day one.</p>
      </div>

      <!-- Content -->
      <div class="prose prose-invert max-w-none space-y-8">
        <!-- Corporate Entity -->
        <section>
          <h2 class="text-2xl font-bold text-kura-text mb-4">Corporate Entity</h2>
          <div class="space-y-3">
            <p class="text-kura-text-secondary">
              <span class="font-semibold text-kura-text">Legal Name:</span> Kura Finance LLC
            </p>
            <p class="text-kura-text-secondary">
              <span class="font-semibold text-kura-text">Jurisdiction:</span> Registered in the State of Wyoming, USA
            </p>
            <p class="text-kura-text-secondary">
              <span class="font-semibold text-kura-text">Mailing Address:</span> 1007 N Orange St. 4th Floor 5629
Wilmington, DE 19801
            </p>
            <p class="text-kura-text-secondary">
              <span class="font-semibold text-kura-text">D-U-N-S® Number:</span> 14-499-3126
            </p>
          </div>
        </section>

        <!-- Cryptographic Privacy & Infrastructure -->
        <section>
          <h2 class="text-2xl font-bold text-kura-text mb-4">Cryptographic Privacy & Infrastructure</h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold text-kura-text mb-2">Non-Custodial Architecture:</h3>
              <p class="text-kura-text-secondary leading-relaxed">
                We are a software infrastructure provider, not a custodian. Our system architecture is mathematically incapable of moving, trading, or accessing the underlying funds in your connected bank accounts or Web3 wallets.
              </p>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-kura-text mb-2">Encryption Standards:</h3>
              <p class="text-kura-text-secondary leading-relaxed">
                All data in transit is encrypted using TLS 1.2/1.3. Internal data at rest is secured using AES-256 encryption with strict zero-trust access controls.
              </p>
            </div>
          </div>
        </section>


        <!-- Regulatory Framework & Compliance Stance -->
        <section>
          <h2 class="text-2xl font-bold text-kura-text mb-4">Regulatory Framework & Compliance Stance</h2>
          <div class="space-y-4">

            <div>
              <h3 class="text-lg font-semibold text-kura-text mb-2">Global Sanctions (OFAC) Compliance:</h3>
              <p class="text-kura-text-secondary leading-relaxed">
                We are committed to operating within the legal frameworks of the United States. We strictly adhere to international sanctions and utilize wallet-screening APIs to block addresses associated with illicit activities or comprehensively sanctioned jurisdictions (OFAC) from utilizing our services.
              </p>
            </div>
          </div>
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
  title: 'Compliance & Trust Center - Kura Finance',
  description: 'Kura Finance Trust Center. Learn about our compliance, security standards, and legal framework. Enterprise-grade security for your financial data.',
  keywords: 'compliance, security, trust center, SOC 2, data security, regulatory compliance',
  ogTitle: 'Compliance & Trust Center - Kura Finance',
  ogDescription: 'Learn about our compliance, security standards, and legal framework.',
  ogUrl: 'https://kura-finance.com/compliance',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Compliance - Kura Finance'
});
</script>
