<script setup lang="ts">
definePageMeta({
  layout: 'default'
});

import Header from '~/components/Header.vue';
import HeroSection from '~/components/HeroSection.vue';
import FeaturesSection from '~/components/FeaturesSection.vue';
import Footer from '~/components/Footer.vue';
</script>

<template>
  <div class="min-h-screen bg-kura-background text-white">
    <!-- Background Ambient Glows -->
    <div class="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-kura-primary/10 blur-[150px] rounded-full pointer-events-none z-0" />
    <div class="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-kura-secondary/10 blur-[150px] rounded-full pointer-events-none z-0" />

    <!-- Grid Background Pattern -->
    <div class="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

    <!-- Main Content -->
    <div class="relative z-10">
      <Header />
      <HeroSection />
      <FeaturesSection />

      <!-- CTA Section -->
      <section class="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl mx-auto text-center space-y-8">
          <div class="space-y-4">
            <h2 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-kura-primary to-kura-secondary bg-clip-text text-transparent">
              Ready to unify your wealth?
            </h2>
            <p class="text-lg text-gray-400">
              Join the revolution of personal wealth management. Launch your dashboard today.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a href="https://app.kura-finance.com" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-lg bg-gradient-to-r from-kura-primary to-kura-secondary text-white font-semibold hover:shadow-lg hover:shadow-kura-primary/50 transition-all duration-300">
              Launch Dashboard
            </a>
            <button @click="navigateTo('/about')" class="px-8 py-4 rounded-lg border-2 border-kura-accent text-kura-accent font-semibold hover:bg-kura-accent/10 transition-colors duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  </div>
</template>
