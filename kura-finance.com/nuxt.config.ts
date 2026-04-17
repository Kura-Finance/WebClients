export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2026-04-18',
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/css/globals.css'],
  app: {
    head: {
      title: 'Kura Finance - Unified Wealth Management',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Unify your Web3 & Fiat finances in one dashboard. Real-time analytics, automated tracking, and enterprise-grade security for modern investors.' }
      ]
    }
  },
  tailwindcss: {
    configPath: '~/tailwind.config.ts',
    viewer: false,
  },
  devtools: { enabled: false }
});
