<template>
  <header class="fixed top-0 w-full z-50 transition-colors duration-300 dropdown-container" :class="(isScrolled || activeDropdown || isMobileMenuOpen) ? 'bg-white border-b border-kura-border shadow-sm' : 'bg-transparent'">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 md:h-20">
        <!-- Logo (Left) -->
        <div class="flex-shrink-0 flex items-center md:w-[200px]">
          <NuxtLink to="/" class="flex items-center gap-2 group w-fit">
            <img src="~/assets/icon.webp" alt="Kura Logo" class="w-10 h-10" />
            <span class="hidden sm:inline font-bold text-xl text-kura-text group-hover:text-kura-primary transition-colors">Kura</span>
          </NuxtLink>
        </div>

        <!-- Desktop Navigation (Center) -->
        <nav class="hidden md:flex items-center gap-2 flex-1 justify-center h-full">
          
          <!-- Products Button -->
          <div class="relative h-full flex items-center group">
            <button @click.prevent.stop="toggleDropdown('products')" class="flex items-center gap-1 text-kura-text-secondary hover:text-kura-text hover:bg-kura-background-light rounded-lg px-3 py-2 transition-colors duration-200 text-sm font-medium" :class="{'bg-kura-background-light text-kura-text': activeDropdown === 'products'}">
              Products
              <svg class="w-4 h-4 transition-transform duration-300" :class="activeDropdown === 'products' ? 'rotate-180 text-kura-text' : 'text-kura-text-secondary group-hover:text-kura-text'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </div>

          <!-- Solutions Button -->
          <div class="relative h-full flex items-center group">
            <button @click.prevent.stop="toggleDropdown('solutions')" class="flex items-center gap-1 text-kura-text-secondary hover:text-kura-text hover:bg-kura-background-light rounded-lg px-3 py-2 transition-colors duration-200 text-sm font-medium" :class="{'bg-kura-background-light text-kura-text': activeDropdown === 'solutions'}">
              Solutions
              <svg class="w-4 h-4 transition-transform duration-300" :class="activeDropdown === 'solutions' ? 'rotate-180 text-kura-text' : 'text-kura-text-secondary group-hover:text-kura-text'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </div>

          <!-- Resources Button -->
          <div class="relative h-full flex items-center group">
            <button @click.prevent.stop="toggleDropdown('resources')" class="flex items-center gap-1 text-kura-text-secondary hover:text-kura-text hover:bg-kura-background-light rounded-lg px-3 py-2 transition-colors duration-200 text-sm font-medium" :class="{'bg-kura-background-light text-kura-text': activeDropdown === 'resources'}">
              Resources
              <svg class="w-4 h-4 transition-transform duration-300" :class="activeDropdown === 'resources' ? 'rotate-180 text-kura-text' : 'text-kura-text-secondary group-hover:text-kura-text'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </div>

          <NuxtLink to="/about" class="text-kura-text-secondary hover:text-kura-text hover:bg-kura-background-light rounded-lg px-3 py-2 transition-colors duration-200 text-sm font-medium">About</NuxtLink>
          <NuxtLink to="/pricing" class="text-kura-text-secondary hover:text-kura-text hover:bg-kura-background-light rounded-lg px-3 py-2 transition-colors duration-200 text-sm font-medium">Pricing</NuxtLink>
        </nav>

        <!-- Right Actions (Right) -->
        <div class="flex items-center justify-end gap-3 md:gap-4 md:w-[200px] flex-shrink-0">
          <!-- CTA Button -->
          <a href="https://app.kura-finance.com" target="_blank" rel="noopener noreferrer" class="px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-kura-primary to-kura-secondary rounded-lg font-semibold text-white hover:shadow-glow-primary transition-all duration-300 text-sm md:text-base">
            Launch App
          </a>

          <!-- Mobile Menu Button -->
          <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="md:hidden text-kura-text p-2 rounded-lg hover:bg-kura-background-light transition-colors">
            <svg v-if="!isMobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mega Menu (Desktop) -->
      <transition 
        enter-active-class="transition ease-out duration-200" 
        enter-from-class="opacity-0 -translate-y-2 pointer-events-none" 
        enter-to-class="opacity-100 translate-y-0" 
        leave-active-class="transition ease-in duration-150" 
        leave-from-class="opacity-100 translate-y-0" 
        leave-to-class="opacity-0 -translate-y-2 pointer-events-none"
      >
        <div v-show="activeDropdown && !isMobileMenuOpen" class="hidden md:block absolute top-full left-0 w-full bg-white border-t border-kura-border shadow-lg overflow-hidden">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[180px]">
            
            <!-- Products Menu -->
            <div v-show="activeDropdown === 'products'" class="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <a href="/" class="group/item flex flex-col gap-2 p-4 rounded-xl hover:bg-kura-background-light transition-colors border border-transparent hover:border-kura-border" @click="activeDropdown = null">
                <div class="text-base font-semibold text-kura-text group-hover/item:text-kura-primary transition-colors">Kura APP</div>
                <div class="text-sm text-kura-text-secondary line-clamp-2">Unified wealth management platform with deep tools.</div>
              </a>
              <NuxtLink to="/klhs" class="group/item flex flex-col gap-2 p-4 rounded-xl hover:bg-kura-background-light transition-colors border border-transparent hover:border-kura-border" @click="activeDropdown = null">
                <div class="text-base font-semibold text-kura-text group-hover/item:text-kura-primary transition-colors">KLHS</div>
                <div class="text-sm text-kura-text-secondary line-clamp-2">Kura Liquidity Health Score for creditworthiness.</div>
              </NuxtLink>
              <NuxtLink to="/notary" class="group/item flex flex-col gap-2 p-4 rounded-xl hover:bg-kura-background-light transition-colors border border-transparent hover:border-kura-border" @click="activeDropdown = null">
                <div class="text-base font-semibold text-kura-text group-hover/item:text-kura-primary transition-colors">Kura Notary</div>
                <div class="text-sm text-kura-text-secondary line-clamp-2">Decentralized blockchain notarization platform.</div>
              </NuxtLink>
            </div>

            <!-- Solutions Menu -->
            <div v-show="activeDropdown === 'solutions'" class="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <NuxtLink to="/digital-nomads" class="group/item flex flex-col gap-2 p-4 rounded-xl hover:bg-kura-background-light transition-colors border border-transparent hover:border-kura-border" @click="activeDropdown = null">
                <div class="text-base font-semibold text-kura-text group-hover/item:text-kura-primary transition-colors">For Digital Nomads</div>
                <div class="text-sm text-kura-text-secondary line-clamp-2">Unify your cross-border finances</div>
              </NuxtLink>
              <NuxtLink to="/web3-freelancers" class="group/item flex flex-col gap-2 p-4 rounded-xl hover:bg-kura-background-light transition-colors border border-transparent hover:border-kura-border" @click="activeDropdown = null">
                <div class="text-base font-semibold text-kura-text group-hover/item:text-kura-primary transition-colors">For Web3 Freelancers</div>
                <div class="text-sm text-kura-text-secondary line-clamp-2">Track crypto earnings with clarity</div>
              </NuxtLink>
              <NuxtLink to="/startups-llcs" class="group/item flex flex-col gap-2 p-4 rounded-xl hover:bg-kura-background-light transition-colors border border-transparent hover:border-kura-border" @click="activeDropdown = null">
                <div class="text-base font-semibold text-kura-text group-hover/item:text-kura-primary transition-colors">For Startups & LLCs</div>
                <div class="text-sm text-kura-text-secondary line-clamp-2">Treasury management & compliance tools</div>
              </NuxtLink>
              <NuxtLink to="/defi-protocols" class="group/item flex flex-col gap-2 p-4 rounded-xl hover:bg-kura-background-light transition-colors border border-transparent hover:border-kura-border" @click="activeDropdown = null">
                <div class="text-base font-semibold text-kura-text group-hover/item:text-kura-primary transition-colors">For DeFi Protocols</div>
                <div class="text-sm text-kura-text-secondary line-clamp-2">Credit infrastructure & risk oracles</div>
              </NuxtLink>
            </div>

            <!-- Resources Menu -->
            <div v-show="activeDropdown === 'resources'" class="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <NuxtLink to="/blog" class="group/item flex flex-col gap-2 p-4 rounded-xl hover:bg-kura-background-light transition-colors border border-transparent hover:border-kura-border" @click="activeDropdown = null">
                <div class="text-base font-semibold text-kura-text group-hover/item:text-kura-primary transition-colors">Blog</div>
                <div class="text-sm text-kura-text-secondary line-clamp-2">Latest news and insights</div>
              </NuxtLink>
              <NuxtLink to="/docs" class="group/item flex flex-col gap-2 p-4 rounded-xl hover:bg-kura-background-light transition-colors border border-transparent hover:border-kura-border" @click="activeDropdown = null">
                <div class="text-base font-semibold text-kura-text group-hover/item:text-kura-primary transition-colors">Documentation</div>
                <div class="text-sm text-kura-text-secondary line-clamp-2">Technical guides and APIs</div>
              </NuxtLink>
              <NuxtLink to="/help" class="group/item flex flex-col gap-2 p-4 rounded-xl hover:bg-kura-background-light transition-colors border border-transparent hover:border-kura-border" @click="activeDropdown = null">
                <div class="text-base font-semibold text-kura-text group-hover/item:text-kura-primary transition-colors">Help Center</div>
                <div class="text-sm text-kura-text-secondary line-clamp-2">Support and FAQs</div>
              </NuxtLink>
              <NuxtLink to="/community" class="group/item flex flex-col gap-2 p-4 rounded-xl hover:bg-kura-background-light transition-colors border border-transparent hover:border-kura-border" @click="activeDropdown = null">
                <div class="text-base font-semibold text-kura-text group-hover/item:text-kura-primary transition-colors">Community</div>
                <div class="text-sm text-kura-text-secondary line-clamp-2">Join our community</div>
              </NuxtLink>
            </div>

          </div>
        </div>
      </transition>

      <!-- Mobile Menu -->
      <transition name="slide-down">
        <div v-if="isMobileMenuOpen" class="md:hidden fixed inset-0 top-16 bg-white overflow-y-auto z-40">
          <nav class="px-4 py-4 space-y-3">
            <!-- Products Mobile -->
            <div class="border-b border-kura-border pb-3">
              <button @click="toggleMobileSubmenu('products')" class="w-full flex items-center justify-between py-2 text-kura-text font-medium hover:text-kura-primary transition-colors">
                <span>Products</span>
                <svg class="w-5 h-5 transition-transform duration-300" :class="activeMobileSubmenu === 'products' ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <transition name="slide-down">
                <div v-if="activeMobileSubmenu === 'products'" class="pl-4 space-y-2 mt-2">
                  <a href="/" @click="isMobileMenuOpen = false; activeMobileSubmenu = null" class="block py-2 text-sm text-kura-text-secondary hover:text-kura-primary transition-colors">
                    Kura APP
                  </a>
                  <NuxtLink to="/klhs" @click="isMobileMenuOpen = false; activeMobileSubmenu = null" class="block py-2 text-sm text-kura-text-secondary hover:text-kura-primary transition-colors">
                    KLHS
                  </NuxtLink>
                  <NuxtLink to="/notary" @click="isMobileMenuOpen = false; activeMobileSubmenu = null" class="block py-2 text-sm text-kura-text-secondary hover:text-kura-primary transition-colors">
                    Kura Notary
                  </NuxtLink>
                </div>
              </transition>
            </div>

            <!-- Solutions Mobile -->
            <div class="border-b border-kura-border pb-3">
              <button @click="toggleMobileSubmenu('solutions')" class="w-full flex items-center justify-between py-2 text-kura-text font-medium hover:text-kura-primary transition-colors">
                <span>Solutions</span>
                <svg class="w-5 h-5 transition-transform duration-300" :class="activeMobileSubmenu === 'solutions' ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <transition name="slide-down">
                <div v-if="activeMobileSubmenu === 'solutions'" class="pl-4 space-y-2 mt-2">
                  <NuxtLink to="/digital-nomads" @click="isMobileMenuOpen = false; activeMobileSubmenu = null" class="block py-2 text-sm text-kura-text-secondary hover:text-kura-primary transition-colors">
                    For Digital Nomads
                  </NuxtLink>
                  <NuxtLink to="/web3-freelancers" @click="isMobileMenuOpen = false; activeMobileSubmenu = null" class="block py-2 text-sm text-kura-text-secondary hover:text-kura-primary transition-colors">
                    For Web3 Freelancers
                  </NuxtLink>
                  <NuxtLink to="/startups-llcs" @click="isMobileMenuOpen = false; activeMobileSubmenu = null" class="block py-2 text-sm text-kura-text-secondary hover:text-kura-primary transition-colors">
                    For Startups & LLCs
                  </NuxtLink>
                  <NuxtLink to="/defi-protocols" @click="isMobileMenuOpen = false; activeMobileSubmenu = null" class="block py-2 text-sm text-kura-text-secondary hover:text-kura-primary transition-colors">
                    For DeFi Protocols
                  </NuxtLink>
                </div>
              </transition>
            </div>

            <!-- Resources Mobile -->
            <div class="border-b border-kura-border pb-3">
              <button @click="toggleMobileSubmenu('resources')" class="w-full flex items-center justify-between py-2 text-kura-text font-medium hover:text-kura-primary transition-colors">
                <span>Resources</span>
                <svg class="w-5 h-5 transition-transform duration-300" :class="activeMobileSubmenu === 'resources' ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <transition name="slide-down">
                <div v-if="activeMobileSubmenu === 'resources'" class="pl-4 space-y-2 mt-2">
                  <NuxtLink to="/blog" @click="isMobileMenuOpen = false; activeMobileSubmenu = null" class="block py-2 text-sm text-kura-text-secondary hover:text-kura-primary transition-colors">
                    Blog
                  </NuxtLink>
                  <NuxtLink to="/docs" @click="isMobileMenuOpen = false; activeMobileSubmenu = null" class="block py-2 text-sm text-kura-text-secondary hover:text-kura-primary transition-colors">
                    Documentation
                  </NuxtLink>
                  <NuxtLink to="/help" @click="isMobileMenuOpen = false; activeMobileSubmenu = null" class="block py-2 text-sm text-kura-text-secondary hover:text-kura-primary transition-colors">
                    Help Center
                  </NuxtLink>
                  <NuxtLink to="/community" @click="isMobileMenuOpen = false; activeMobileSubmenu = null" class="block py-2 text-sm text-kura-text-secondary hover:text-kura-primary transition-colors">
                    Community
                  </NuxtLink>
                </div>
              </transition>
            </div>

            <!-- Other Links -->
            <NuxtLink to="/about" @click="isMobileMenuOpen = false" class="block py-2 text-kura-text font-medium hover:text-kura-primary transition-colors border-b border-kura-border pb-3">About</NuxtLink>
            <NuxtLink to="/pricing" @click="isMobileMenuOpen = false" class="block py-2 text-kura-text font-medium hover:text-kura-primary transition-colors border-b border-kura-border pb-3">Pricing</NuxtLink>
            
            <div class="pt-4">
              <a href="https://app.kura-finance.com" target="_blank" rel="noopener noreferrer" class="block text-center px-4 py-3 bg-gradient-to-r from-kura-primary to-kura-secondary rounded-lg font-semibold text-white hover:shadow-glow-primary transition-all duration-300">
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
const activeDropdown = ref<string | null>(null);
const activeMobileSubmenu = ref<string | null>(null);

const toggleDropdown = (menu: string) => {
  activeDropdown.value = activeDropdown.value === menu ? null : menu;
};

const toggleMobileSubmenu = (menu: string) => {
  activeMobileSubmenu.value = activeMobileSubmenu.value === menu ? null : menu;
};

const closeDropdowns = (e: Event) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.dropdown-container')) {
    activeDropdown.value = null;
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  document.addEventListener('click', closeDropdowns);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('click', closeDropdowns);
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
