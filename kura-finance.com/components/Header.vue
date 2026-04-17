<template>
  <header class="fixed top-0 w-full z-50 transition-all duration-300" :class="isScrolled ? 'bg-kura-background/80 backdrop-blur-lg border-b border-white/5' : 'bg-transparent'">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 md:h-20">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 group">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-kura-primary to-kura-secondary flex items-center justify-center">
            <span class="text-white font-bold text-lg">K</span>
          </div>
          <span class="hidden sm:inline font-bold text-xl text-white group-hover:text-kura-primary transition-colors">Kura</span>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-8">
          <a href="#features" class="text-gray-300 hover:text-white transition-colors text-sm font-medium">Features</a>
          <a href="#solutions" class="text-gray-300 hover:text-white transition-colors text-sm font-medium">Solutions</a>
          <NuxtLink to="/pricing" class="text-gray-300 hover:text-white transition-colors text-sm font-medium">Pricing</NuxtLink>
          <NuxtLink to="/about" class="text-gray-300 hover:text-white transition-colors text-sm font-medium">About</NuxtLink>
        </nav>

        <!-- Right Actions -->
        <div class="flex items-center gap-3 md:gap-4">
          <a href="#" class="text-gray-300 hover:text-white transition-colors text-sm font-medium hidden sm:inline">Log In</a>
          
          <!-- CTA Button -->
          <a href="https://app.kura-finance.com" target="_blank" rel="noopener noreferrer" class="px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-kura-primary to-kura-secondary rounded-lg font-semibold text-white hover:shadow-glow-primary transition-all duration-300 text-sm md:text-base">
            Launch App
          </a>

          <!-- Mobile Menu Button -->
          <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
            <svg v-if="!isMobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <transition name="slide-down">
        <div v-if="isMobileMenuOpen" class="md:hidden border-t border-white/5 bg-kura-background/95 backdrop-blur-lg">
          <nav class="px-4 py-4 space-y-3">
            <a href="#features" @click="isMobileMenuOpen = false" class="block text-gray-300 hover:text-white transition-colors py-2">Features</a>
            <a href="#solutions" @click="isMobileMenuOpen = false" class="block text-gray-300 hover:text-white transition-colors py-2">Solutions</a>
            <NuxtLink to="/pricing" @click="isMobileMenuOpen = false" class="block text-gray-300 hover:text-white transition-colors py-2">Pricing</NuxtLink>
            <NuxtLink to="/about" @click="isMobileMenuOpen = false" class="block text-gray-300 hover:text-white transition-colors py-2">About</NuxtLink>
            <a href="#" class="block text-gray-300 hover:text-white transition-colors py-2">Log In</a>
            <div class="pt-2 border-t border-white/5">
              <a href="https://app.kura-finance.com" target="_blank" rel="noopener noreferrer" class="block text-center px-4 py-2 bg-gradient-to-r from-kura-primary to-kura-secondary rounded-lg font-semibold text-white hover:shadow-glow-primary transition-all duration-300">
                Launch App
              </a>
            </div>
          </nav>
        </div>
      </transition>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
};
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
