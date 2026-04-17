<script setup lang="ts">
definePageMeta({
  layout: 'default'
});

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for getting started',
    features: [
      'Up to 3 wallet integrations',
      'Basic portfolio analytics',
      'Manual transaction tracking',
      'Community support',
      'Read-only API access'
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$99',
    period: '/month',
    description: 'For serious investors',
    features: [
      'Unlimited wallet integrations',
      'Advanced analytics & insights',
      'Automated transaction tracking',
      'Priority email support',
      'Advanced API access',
      'Tax-loss harvesting reports',
      'Multi-signature support'
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For institutional investors',
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      'Custom API integrations',
      'Phone & email support',
      'Custom reporting',
      'Compliance & audit features',
      'Custom SLA'
    ],
    cta: 'Schedule Demo',
    highlighted: false,
  }
];

const handlePlanAction = (planName: string) => {
  if (planName === 'Starter') {
    navigateTo('https://app.kura-finance.com', { external: true });
  } else if (planName === 'Professional') {
    navigateTo('https://app.kura-finance.com', { external: true });
  } else if (planName === 'Enterprise') {
    alert('Scheduling demo - feature coming soon!');
  }
};
</script>

<template>
  <div class="w-full bg-kura-background text-white">
    <!-- Background Ambient Glows -->
    <div class="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-kura-primary/10 blur-[120px] rounded-full pointer-events-none z-0" />
    <div class="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-kura-secondary/10 blur-[120px] rounded-full pointer-events-none z-0" />

    <!-- Header -->
    <Header />

    <!-- Main content -->
    <main class="relative z-10 w-full px-4 sm:px-6 py-16 md:py-24">
      <div class="max-w-7xl mx-auto">
        <!-- Page Header -->
        <section class="mb-20 text-center pt-16 md:pt-20">
          <h1 class="text-5xl md:text-6xl font-black mb-6 tracking-tight">
            Simple, <span class="bg-gradient-to-r from-kura-primary to-kura-secondary bg-clip-text text-transparent">Transparent Pricing</span>
          </h1>
          <p class="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Choose the plan that fits your needs. All plans include US-grade compliance and zero-custody security.
          </p>
        </section>

        <!-- Pricing Cards -->
        <div class="grid md:grid-cols-3 gap-8 lg:gap-6 mb-16">
          <div v-for="(plan, index) in plans" :key="index" class="relative group">
            <!-- Glow effect for highlighted plan -->
            <div v-if="plan.highlighted" class="absolute inset-0 bg-gradient-to-r from-kura-primary/20 to-kura-secondary/20 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
            
            <!-- Card -->
            <div class="relative bg-gradient-to-br from-white/[0.05] to-transparent border transition-all duration-300 rounded-2xl" :class="plan.highlighted ? 'border-kura-primary/50 lg:scale-105' : 'border-white/10 hover:border-white/20'">
              <div class="p-8 md:p-10">
                <!-- Plan Header -->
                <div class="mb-8">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-2xl font-bold">{{ plan.name }}</h3>
                    <span v-if="plan.highlighted" class="px-3 py-1 rounded-full bg-kura-primary/20 text-kura-primary text-xs font-bold uppercase tracking-widest">Most Popular</span>
                  </div>
                  <p class="text-gray-400 mb-6">{{ plan.description }}</p>
                  
                  <!-- Price -->
                  <div class="mb-6">
                    <span class="text-5xl font-black">{{ plan.price }}</span>
                    <span v-if="plan.period" class="text-gray-400 ml-2">{{ plan.period }}</span>
                  </div>
                </div>

                <!-- CTA Button -->
                <button @click="handlePlanAction(plan.name)" class="w-full px-6 py-3 rounded-lg font-bold transition-all duration-300 mb-8" :class="plan.highlighted ? 'bg-gradient-to-r from-kura-primary to-kura-secondary hover:shadow-glow-primary text-white' : 'border-2 border-kura-primary/50 text-white hover:bg-kura-primary/10'">
                  {{ plan.cta }}
                </button>

                <!-- Features List -->
                <div class="space-y-4">
                  <div v-for="(feature, featureIndex) in plan.features" :key="featureIndex" class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-kura-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-gray-300 text-sm md:text-base">{{ feature }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- FAQ Section -->
        <section class="max-w-3xl mx-auto">
          <h2 class="text-3xl md:text-4xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
          
          <div class="space-y-4">
            <details class="group border border-white/10 rounded-lg p-6 cursor-pointer hover:border-white/20 transition-colors">
              <summary class="flex items-center justify-between font-bold text-lg">
                <span>Can I switch plans anytime?</span>
                <span class="text-2xl group-open:rotate-180 transition-transform">+</span>
              </summary>
              <p class="mt-4 text-gray-400">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </details>

            <details class="group border border-white/10 rounded-lg p-6 cursor-pointer hover:border-white/20 transition-colors">
              <summary class="flex items-center justify-between font-bold text-lg">
                <span>Is my data secure?</span>
                <span class="text-2xl group-open:rotate-180 transition-transform">+</span>
              </summary>
              <p class="mt-4 text-gray-400">Absolutely. We use enterprise-grade encryption and zero-custody architecture. Your private keys never leave your device.</p>
            </details>

            <details class="group border border-white/10 rounded-lg p-6 cursor-pointer hover:border-white/20 transition-colors">
              <summary class="flex items-center justify-between font-bold text-lg">
                <span>What payment methods do you accept?</span>
                <span class="text-2xl group-open:rotate-180 transition-transform">+</span>
              </summary>
              <p class="mt-4 text-gray-400">We accept credit cards, bank transfers, and cryptocurrency. Contact our sales team for Enterprise billing options.</p>
            </details>

            <details class="group border border-white/10 rounded-lg p-6 cursor-pointer hover:border-white/20 transition-colors">
              <summary class="flex items-center justify-between font-bold text-lg">
                <span>Do you offer a free trial?</span>
                <span class="text-2xl group-open:rotate-180 transition-transform">+</span>
              </summary>
              <p class="mt-4 text-gray-400">Yes! Professional plan includes a 30-day free trial. No credit card required.</p>
            </details>
          </div>
        </section>
      </div>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>
