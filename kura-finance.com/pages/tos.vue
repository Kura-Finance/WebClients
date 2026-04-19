<template>
  <div class="min-h-screen bg-kura-background text-white">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
        <p class="text-gray-400 text-lg">Last Updated: April 2026</p>
      </div>

      <!-- Content -->
      <div class="prose prose-invert max-w-none space-y-8">
        <!-- 1. Acceptance of Terms -->
        <section>
          <h2 class="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
          <p class="text-gray-300 leading-relaxed">
            By accessing or using the Kura Finance platform ("Service"), operated by Kura Finance LLC ("Company", "we", "us", or "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use our Service.
          </p>
        </section>

        <!-- 2. Description of Service -->
        <section>
          <h2 class="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
          <p class="text-gray-300 leading-relaxed">
            Kura Finance provides a read-only financial data aggregation dashboard and blockchain-based proof-of-existence tools. We do not execute trades, hold assets, or provide financial advice.
          </p>
        </section>

        <!-- 3. Blockchain Notary & Document Uploads -->
        <section>
          <h2 class="text-2xl font-bold text-white mb-4">3. Blockchain Notary & Document Uploads</h2>
          <p class="text-gray-300 leading-relaxed">
            For features involving blockchain document verification, you acknowledge that Kura Finance only generates and stores a cryptographic hash of your documents on the blockchain. We do not verify the legality, authenticity, or contents of the original documents. You remain solely responsible for any data you process through this feature.
          </p>
        </section>

        <!-- 4. Limitation of Liability -->
        <section>
          <h2 class="text-2xl font-bold text-white mb-4">4. Limitation of Liability</h2>
          <p class="text-gray-300 leading-relaxed">
            To the maximum extent permitted by law, Kura Finance LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or digital assets, resulting from your use of the Service. In no event shall our total liability exceed the amount you paid to us in the past twelve (12) months.
          </p>
        </section>

        <!-- 5. Governing Law & Jurisdiction -->
        <section>
          <h2 class="text-2xl font-bold text-white mb-4">5. Governing Law & Jurisdiction</h2>
          <p class="text-gray-300 leading-relaxed">
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
