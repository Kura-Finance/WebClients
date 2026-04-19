<template>
  <section id="features" class="relative w-full bg-kura-background py-20 md:py-32 px-4 sm:px-6 lg:px-8">
    <!-- Background Elements -->
    <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.03)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none opacity-20" />
    
    <div class="relative z-10 max-w-7xl mx-auto">
      <!-- Section Header -->
      <div class="text-center mb-16 md:mb-20">
        <h2 class="text-4xl md:text-5xl font-black mb-4 text-kura-text">
          Platform Capabilities
        </h2>
        <p class="text-lg md:text-xl text-kura-text-secondary max-w-2xl mx-auto">
          Built for modern investors who demand clarity across their entire financial landscape.
        </p>
      </div>

      <!-- Features Grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
        <!-- Feature 1: Bank & Fiat Integration -->
        <div class="group relative">
          <div class="absolute inset-0 bg-gradient-to-r from-kura-primary/10 to-kura-secondary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div class="relative bg-gradient-to-br from-kura-background-light to-transparent border border-kura-border rounded-2xl p-8 hover:border-kura-primary/30 transition-all duration-300 h-full">
            <div class="w-12 h-12 rounded-lg bg-kura-primary/20 flex items-center justify-center mb-6 group-hover:bg-kura-primary/30 transition-colors text-2xl">
              🪪
            </div>
            <h3 class="text-2xl font-bold text-kura-text mb-4">Bank & Fiat Integration</h3>
            <p class="text-kura-text-secondary leading-relaxed">
              Connect your traditional bank accounts securely with industry-leading technology in a single click.
            </p>
          </div>
        </div>

        <!-- Feature 2: Web3 Wallet & Asset Management -->
        <div class="group relative">
          <div class="absolute inset-0 bg-gradient-to-r from-kura-secondary/10 to-kura-accent/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div class="relative bg-gradient-to-br from-kura-background-light to-transparent border border-kura-border rounded-2xl p-8 hover:border-kura-secondary/30 transition-all duration-300 h-full">
            <div class="w-12 h-12 rounded-lg bg-kura-secondary/20 flex items-center justify-center mb-6 group-hover:bg-kura-secondary/30 transition-colors text-2xl">
              🔐
            </div>
            <h3 class="text-2xl font-bold text-kura-text mb-4">Mobile Web3 Wallet Management</h3>
            <p class="text-kura-text-secondary leading-relaxed">
              Support multi-chain assets, wallet connections, and DeFi interactions. Manage your crypto assets effortlessly.
            </p>
          </div>
        </div>

        <!-- Feature 3: Dashboard & Investment Tracking -->
        <div class="group relative">
          <div class="absolute inset-0 bg-gradient-to-r from-kura-accent/10 to-kura-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div class="relative bg-gradient-to-br from-kura-background-light to-transparent border border-kura-border rounded-2xl p-8 hover:border-kura-accent/30 transition-all duration-300 h-full">
            <div class="w-12 h-12 rounded-lg bg-kura-accent/20 flex items-center justify-center mb-6 group-hover:bg-kura-accent/30 transition-colors text-2xl">
              📊
            </div>
            <h3 class="text-2xl font-bold text-kura-text mb-4">Intuitive Investment Dashboard</h3>
            <p class="text-kura-text-secondary leading-relaxed">
              Beautiful, visual portfolio dashboard that makes your investment performance and asset allocation crystal clear.
            </p>
          </div>
        </div>

        <!-- Feature 4: Premium Subscription -->
        <div class="group relative">
          <div class="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div class="relative bg-gradient-to-br from-kura-background-light to-transparent border border-kura-border rounded-2xl p-8 hover:border-purple-500/30 transition-all duration-300 h-full">
            <div class="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-6 group-hover:bg-purple-500/30 transition-colors text-2xl">
              💎
            </div>
            <h3 class="text-2xl font-bold text-kura-text mb-4">Premium Membership & Subscriptions</h3>
            <p class="text-kura-text-secondary leading-relaxed">
              Unlock professional-grade financial analysis tools and exclusive notifications to level up your financial management.
            </p>
          </div>
        </div>

        <!-- Feature 5: Global Ready -->
        <div class="group relative">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div class="relative bg-gradient-to-br from-kura-background-light to-transparent border border-kura-border rounded-2xl p-8 hover:border-blue-500/30 transition-all duration-300 h-full">
            <div class="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-colors text-2xl">
              🌍
            </div>
            <h3 class="text-2xl font-bold text-kura-text mb-4">Multi-Language Support</h3>
            <p class="text-kura-text-secondary leading-relaxed">
              No matter where you are, manage your wealth in the language you're most comfortable with.
            </p>
          </div>
        </div>

        <!-- Feature 6: Smart Notifications -->
        <div class="group relative">
          <div class="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div class="relative bg-gradient-to-br from-kura-background-light to-transparent border border-kura-border rounded-2xl p-8 hover:border-amber-500/30 transition-all duration-300 h-full">
            <div class="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center mb-6 group-hover:bg-amber-500/30 transition-colors text-2xl">
              🔔
            </div>
            <h3 class="text-2xl font-bold text-kura-text mb-4">Smart Real-Time Notifications</h3>
            <p class="text-kura-text-secondary leading-relaxed">
              Get instant alerts when market conditions change or important account events occur. Never miss an opportunity.
            </p>
          </div>
        </div>
      </div>

      <!-- Core Pillars -->
      <div class="mt-16 md:mt-24">
        <h3 class="text-3xl font-bold text-kura-text mb-12 text-center">Our Core Pillars</h3>
        
        <div class="grid md:grid-cols-2 gap-8">
          <!-- Pillar 1: Absolute Clarity -->
          <div class="rounded-2xl border border-kura-border bg-gradient-to-br from-kura-primary/5 to-transparent backdrop-blur-xl p-8 md:p-10">
            <div class="flex items-start gap-4 mb-6">
              <div class="w-14 h-14 rounded-lg bg-kura-primary/20 flex items-center justify-center flex-shrink-0">
                <svg class="w-7 h-7 text-kura-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <h4 class="text-2xl font-bold text-kura-text mb-2">Absolute Clarity</h4>
                <p class="text-kura-text-secondary leading-relaxed">
                  Eliminate financial fragmentation. One dashboard. One truth. Spanning every account and blockchain.
                </p>
              </div>
            </div>
          </div>

          <!-- Pillar 2: Sovereign Security -->
          <div class="rounded-2xl border border-kura-border bg-gradient-to-br from-kura-secondary/5 to-transparent backdrop-blur-xl p-8 md:p-10">
            <div class="flex items-start gap-4 mb-6">
              <div class="w-14 h-14 rounded-lg bg-kura-secondary/20 flex items-center justify-center flex-shrink-0">
                <svg class="w-7 h-7 text-kura-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h4 class="text-2xl font-bold text-kura-text mb-2">Sovereign Security</h4>
                <p class="text-kura-text-secondary leading-relaxed">
                  Not your keys, not your coins. We're read-only. Zero counterparty risk. Your sovereignty is non-negotiable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
