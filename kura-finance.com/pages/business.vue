<script setup lang="ts">
definePageMeta({
  layout: 'default'
});

useSeoMeta({
  title: 'Business Solutions - Kura Finance',
  description: 'Enterprise-grade financial management solutions for businesses. Custom pricing and dedicated support for your organization.',
  keywords: 'Kura Finance business, enterprise solutions, custom pricing, wealth management',
  ogTitle: 'Business Solutions | Kura Finance',
  ogDescription: 'Enterprise-grade financial management solutions for businesses.',
  ogUrl: 'https://kura-finance.com/business',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Business Solutions - Kura Finance'
});

const handleContactSales = () => {
  navigateTo('mailto:sales@kura-finance.com', { external: true });
};
</script>

<template>
  <div class="w-full text-kura-text">
    <!-- Main content -->
    <main class="relative z-10 w-full px-4 sm:px-6 py-16 md:py-24">
      <div class="max-w-7xl mx-auto">
        <!-- Page Header -->
        <section class="mb-20 text-center pt-16 md:pt-20">
          <h1 class="text-5xl md:text-6xl font-black mb-6 tracking-tight">
            <span class="bg-gradient-to-r from-kura-primary to-kura-secondary bg-clip-text text-transparent">Business Solutions</span>
          </h1>
          <p class="text-lg md:text-xl text-kura-text-secondary max-w-3xl mx-auto leading-relaxed">
            Enterprise-grade financial management tailored to your organization's needs. Custom pricing, dedicated support, and scalable infrastructure.
          </p>
        </section>

        <!-- Features Grid -->
        <section class="mb-20">
          <div class="grid md:grid-cols-2 gap-8">
            <div class="border border-kura-border rounded-2xl p-8 hover:border-kura-border/70 transition-colors">
              <h3 class="text-2xl font-bold mb-4">Custom Infrastructure</h3>
              <p class="text-kura-text-secondary mb-4">Dedicated API keys, custom rate limits, and white-label solutions tailored to your needs.</p>
              <ul class="space-y-2 text-sm text-kura-text-secondary">
                <li>✓ Dedicated Node Access</li>
                <li>✓ Custom Rate Limits</li>
                <li>✓ White-Label Options</li>
              </ul>
            </div>

            <div class="border border-kura-border rounded-2xl p-8 hover:border-kura-border/70 transition-colors">
              <h3 class="text-2xl font-bold mb-4">Developer API</h3>
              <p class="text-kura-text-secondary mb-4">Full API access with webhooks and real-time streaming for seamless integration.</p>
              <ul class="space-y-2 text-sm text-kura-text-secondary">
                <li>✓ REST & WebSocket APIs</li>
                <li>✓ Webhook Support</li>
                <li>✓ Real-Time Streaming</li>
              </ul>
            </div>

            <div class="border border-kura-border rounded-2xl p-8 hover:border-kura-border/70 transition-colors">
              <h3 class="text-2xl font-bold mb-4">Dedicated Support</h3>
              <p class="text-kura-text-secondary mb-4">Priority support with dedicated account managers and SLA guarantees.</p>
              <ul class="space-y-2 text-sm text-kura-text-secondary">
                <li>✓ Dedicated Account Manager</li>
                <li>✓ Priority Support</li>
                <li>✓ SLA Guarantees</li>
              </ul>
            </div>

            <div class="border border-kura-border rounded-2xl p-8 hover:border-kura-border/70 transition-colors">
              <h3 class="text-2xl font-bold mb-4">Compliance & Security</h3>
              <p class="text-kura-text-secondary mb-4">Enterprise-grade security with zero-custody architecture and compliance certifications.</p>
              <ul class="space-y-2 text-sm text-kura-text-secondary">
                <li>✓ Zero-Custody Architecture</li>
                <li>✓ Enterprise Encryption</li>
                <li>✓ Compliance Ready</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="text-center py-16 border-t border-kura-border">
          <h2 class="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p class="text-lg text-kura-text-secondary mb-8 max-w-2xl mx-auto">
            Contact our sales team to discuss your specific needs and receive a custom quote.
          </p>
          <button @click="handleContactSales" class="px-8 py-3 bg-gradient-to-r from-kura-primary to-kura-secondary hover:shadow-glow-primary text-white font-bold rounded-lg transition-all duration-300">
            Contact Sales
          </button>
        </section>
      </div>
    </main>
  </div>
</template>
