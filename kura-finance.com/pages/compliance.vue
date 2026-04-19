<template>
  <div class="min-h-screen bg-kura-background text-white">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">Trust & Security Center</h1>
        <p class="text-gray-400 text-lg">At Kura Finance, we build with enterprise-grade security and transparent compliance from day one.</p>
      </div>

      <!-- Content -->
      <div class="prose prose-invert max-w-none space-y-8">
        <!-- Corporate Entity -->
        <section>
          <h2 class="text-2xl font-bold text-white mb-4">Corporate Entity</h2>
          <div class="space-y-3">
            <p class="text-gray-300">
              <span class="font-semibold text-white">Legal Name:</span> Kura Finance LLC
            </p>
            <p class="text-gray-300">
              <span class="font-semibold text-white">Jurisdiction:</span> Registered in the State of Wyoming, USA
            </p>
            <p class="text-gray-300">
              <span class="font-semibold text-white">Mailing Address:</span> 1007 N Orange St. 4th Floor 5629
Wilmington, DE 19801
            </p>
            <p class="text-gray-300">
              <span class="font-semibold text-white">D-U-N-S® Number:</span> 14-499-3126
            </p>
          </div>
        </section>

        <!-- Infrastructure Security -->
        <section>
          <h2 class="text-2xl font-bold text-white mb-4">Infrastructure Security</h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold text-white mb-2">Encryption</h3>
              <p class="text-gray-300 leading-relaxed">
                All data in transit is encrypted using TLS 1.2/1.3. Data at rest is secured using AES-256 encryption.
              </p>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-white mb-2">Zero-Trust Architecture</h3>
              <p class="text-gray-300 leading-relaxed">
                We implement strict access controls and do not store sensitive API keys or private keys on client devices.
              </p>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-white mb-2">Non-Custodial</h3>
              <p class="text-gray-300 leading-relaxed">
                Our system architecture is mathematically incapable of moving your funds.
              </p>
            </div>
          </div>
        </section>

        <!-- Compliance Stance -->
        <section>
          <h2 class="text-2xl font-bold text-white mb-4">Compliance Stance</h2>
          <p class="text-gray-300 leading-relaxed">
            We are committed to operating within the legal frameworks of the United States. While we are a non-custodial software provider, we strictly adhere to international sanctions and do not provide services to entities located in comprehensively sanctioned jurisdictions (OFAC).
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
