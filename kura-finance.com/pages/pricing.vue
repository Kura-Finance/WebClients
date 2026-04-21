<script setup lang="ts">
definePageMeta({
  layout: 'default'
});

useSeoMeta({
  title: 'Pricing - Kura Finance',
  description: 'Kura Finance offers flexible pricing plans for every financial management need. From free basic features to enterprise solutions. All plans include US-grade compliance and zero-custody security.',
  keywords: 'Kura Finance pricing, subscription plans, Web3 portfolio tracker pricing, wealth management cost',
  ogTitle: 'Simple Transparent Pricing | Kura Finance',
  ogDescription: 'Kura Finance offers flexible pricing plans for every financial management need.',
  ogUrl: 'https://kura-finance.com/pricing',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Pricing - Kura Finance'
});

const plans = [
  {
    name: 'Kura Basic',
    price: 'Free',
    period: '',
    description: 'Entry-level plan',
    features: [
      'Unlimited Accounts: Bind unlimited traditional banks, credit cards, or Web3 wallets.',
      'Unified Assets: Combine fiat deposits, loans, and crypto with daily automated syncs.',
      '30-Day Trends: Asset charts and basic P&L analysis for the past month.'
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Kura Pro',
    price: '$12.99',
    period: '/ mo',
    priceSubtext: '$129.99 billed annually (~$10.83/mo)',
    description: 'Advanced financial management',
    features: [
      'Everything in Basic',
      'Arbitrage Alerts: Auto-compare fiat debt with on-chain yields for optimal allocation.',
      'One-Click Tax Export: Generate accountant-approved CSV reports including gas fees.',
      'Permanent History: Visually track your long-term financial trajectory without time limits.',
      'Advanced Sync: Up to 5 manual syncs daily, background updates every 6 hours.'
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Kura Ultimate',
    price: '$29.99',
    period: '/ mo',
    priceSubtext: '$299.99 billed annually (~$24.99/mo)',
    description: 'Professional financial tools',
    features: [
      'Everything in Pro',
      'Deep DeFi Analysis: Direct contract parsing for precise IL and cross-chain gas loss.',
      'Real-Time Alerts: Telegram/Discord notifications for abnormal movements or liquidations.',
      'High-Frequency Sync: 20 manual syncs daily, background updates every hour.'
    ],
    footer: 'If you need more, please contact us',
    cta: 'Upgrade to Ultimate',
    highlighted: false,
  }
];

const handlePlanAction = (planName: string) => {
  if (planName === 'Kura Basic' || planName === 'Kura Pro' || planName === 'Kura Ultimate') {
    navigateTo('https://app.kura-finance.com', { external: true });
  } else {
    alert('Scheduling demo - feature coming soon!');
  }
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
            Simple, <span class="bg-gradient-to-r from-kura-primary to-kura-secondary bg-clip-text text-transparent">Transparent Pricing</span>
          </h1>
          <p class="text-lg md:text-xl text-kura-text-secondary max-w-3xl mx-auto leading-relaxed">
            Choose the plan that fits your needs. All plans include US-grade compliance and zero-custody security.
          </p>
        </section>

        <!-- Pricing Cards -->
        <div class="grid md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 mb-16">
          <div v-for="(plan, index) in plans" :key="index" class="relative group flex">
            <!-- Glow effect for highlighted plan -->
            <div v-if="plan.highlighted" class="absolute inset-0 bg-gradient-to-r from-kura-primary/20 to-kura-secondary/20 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
            
            <!-- Card -->
            <div class="relative w-full bg-gradient-to-br from-white/[0.05] to-transparent border transition-all duration-300 rounded-2xl flex flex-col" :class="plan.highlighted ? 'border-kura-primary/50 xl:scale-105 z-10' : 'border-kura-border hover:border-kura-border/50'">
              <div class="p-5 lg:p-7 flex flex-col h-full">
                <!-- Plan Header (Fixed minimum height to align buttons) -->
                <div class="flex flex-col grow-0 min-h-[170px] lg:min-h-[180px]">
                  <div class="flex items-center justify-between mb-2 min-h-[28px]">
                    <h3 class="text-lg lg:text-xl font-bold">{{ plan.name }}</h3>
                    <span v-if="plan.highlighted" class="px-2 py-0.5 rounded-full bg-kura-primary/20 text-kura-primary text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ml-2 shrink-0">Popular</span>
                  </div>
                  <p class="text-kura-text-secondary mb-4 text-xs lg:text-sm">{{ plan.description }}</p>
                  
                  <!-- Price -->
                  <div class="mt-auto mb-4">
                    <span class="text-3xl lg:text-4xl font-black">{{ plan.price }}</span>
                    <span v-if="plan.period" class="text-kura-text-secondary ml-1 text-xs">{{ plan.period }}</span>
                    <div class="text-xs text-kura-primary mt-1 min-h-[16px]">
                      <span v-if="'priceSubtext' in plan">{{ plan.priceSubtext }}</span>
                    </div>
                  </div>
                </div>

                <!-- CTA Button (Moved up directly under price) -->
                <button @click="handlePlanAction(plan.name)" class="w-full px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 mb-6 shrink-0" :class="plan.highlighted ? 'bg-gradient-to-r from-kura-primary to-kura-secondary hover:shadow-glow-primary text-white' : 'border-2 border-kura-primary/50 text-kura-primary hover:bg-kura-primary/10'">
                  {{ plan.cta }}
                </button>

                <!-- Features List -->
                <div class="space-y-3 pt-4 border-t border-kura-border flex-grow">
                  <div v-for="(feature, featureIndex) in plan.features" :key="featureIndex" class="flex items-start gap-2.5">
                    <svg class="w-4 h-4 text-kura-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-kura-text-secondary text-xs leading-relaxed" v-html="feature.replace(': ', ':<br/>')"></span>
                  </div>
                  <div v-if="'footer' in plan" class="text-kura-primary text-xs pt-3 italic">
                    {{ plan.footer }}
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
            <details class="group border border-kura-border rounded-lg p-6 cursor-pointer hover:border-kura-border/70 transition-colors">
              <summary class="flex items-center justify-between font-bold text-lg">
                <span>Can I switch plans anytime?</span>
                <span class="text-2xl group-open:rotate-180 transition-transform">+</span>
              </summary>
              <p class="mt-4 text-kura-text-secondary">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </details>

            <details class="group border border-kura-border rounded-lg p-6 cursor-pointer hover:border-kura-border/70 transition-colors">
              <summary class="flex items-center justify-between font-bold text-lg">
                <span>Is my data secure?</span>
                <span class="text-2xl group-open:rotate-180 transition-transform">+</span>
              </summary>
              <p class="mt-4 text-kura-text-secondary">Absolutely. We use enterprise-grade encryption and zero-custody architecture. Your private keys never leave your device.</p>
            </details>

            <details class="group border border-kura-border rounded-lg p-6 cursor-pointer hover:border-kura-border/70 transition-colors">
              <summary class="flex items-center justify-between font-bold text-lg">
                <span>What payment methods do you accept?</span>
                <span class="text-2xl group-open:rotate-180 transition-transform">+</span>
              </summary>
              <p class="mt-4 text-kura-text-secondary">We accept credit cards, bank transfers, and cryptocurrency. Contact our sales team for Enterprise billing options.</p>
            </details>

            <details class="group border border-kura-border rounded-lg p-6 cursor-pointer hover:border-kura-border/70 transition-colors">
              <summary class="flex items-center justify-between font-bold text-lg">
                <span>Do you offer a free trial?</span>
                <span class="text-2xl group-open:rotate-180 transition-transform">+</span>
              </summary>
              <p class="mt-4 text-kura-text-secondary">Yes! Professional plan includes a 30-day free trial. No credit card required.</p>
            </details>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
