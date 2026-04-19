<template>
  <div class="min-h-screen bg-kura-background text-white">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
        <p class="text-gray-400 text-lg">Last Updated: April 2026</p>
      </div>

      <!-- Content -->
      <div class="prose prose-invert max-w-none space-y-8">
        <!-- 1. Information We Collect -->
        <section>
          <h2 class="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
          <p class="text-gray-300 leading-relaxed">
            We collect information necessary to provide our Service, including account details (email, username), read-only financial data accessed via authorized third-party APIs (e.g., Plaid), and public blockchain wallet addresses you connect to our platform.
          </p>
        </section>

        <!-- 2. How We Use Your Information -->
        <section>
          <h2 class="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
          <p class="text-gray-300 leading-relaxed">
            Your data is used strictly to provide, maintain, and improve the Kura Finance dashboard. We do not and will never sell your personal or financial data to data brokers or third parties.
          </p>
        </section>

        <!-- 3. Third-Party Processors -->
        <section>
          <h2 class="text-2xl font-bold text-white mb-4">3. Third-Party Processors</h2>
          <p class="text-gray-300 leading-relaxed">
            We use trusted third-party services (such as Google Cloud for hosting and Lemon Squeezy for payment processing) to operate our platform. These providers are bound by strict data protection standards.
          </p>
        </section>

        <!-- 4. Data Security & Read-Only Access -->
        <section>
          <h2 class="text-2xl font-bold text-white mb-4">4. Data Security & Read-Only Access</h2>
          <p class="text-gray-300 leading-relaxed">
            Our platform operates on a non-custodial, read-only architecture. We cannot initiate transfers or access the underlying funds in your connected bank accounts or Web3 wallets. All data transmitted is secured using industry-standard encryption.
          </p>
        </section>

        <!-- 5. Your Rights -->
        <section>
          <h2 class="text-2xl font-bold text-white mb-4">5. Your Rights</h2>
          <p class="text-gray-300 leading-relaxed">
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
