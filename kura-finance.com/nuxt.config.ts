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
        { name: 'description', content: 'Unify your Web3 & Fiat finances in one dashboard. Real-time analytics, automated tracking, and enterprise-grade security for modern investors.' },
        { name: 'keywords', content: 'Web3 finance, portfolio tracker, wealth management, crypto, DeFi, fintech, Web3 accounting' },
        { name: 'author', content: 'Kura Finance' },
        { name: 'theme-color', content: '#0b0c10' },
        { name: 'msapplication-TileColor', content: '#0b0c10' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Kura Finance' },
        // Open Graph
        { property: 'og:title', content: 'Kura Finance - Unified Wealth Management' },
        { property: 'og:description', content: 'Unify your Web3 & Fiat finances in one dashboard. Real-time analytics, automated tracking, and enterprise-grade security for modern investors.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://kura-finance.com' },
        { property: 'og:site_name', content: 'Kura Finance' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Kura Finance - Unified Wealth Management' },
        { name: 'twitter:description', content: 'Unify your Web3 & Fiat finances in one dashboard. Real-time analytics, automated tracking, and enterprise-grade security for modern investors.' },
        // Additional SEO
        { name: 'robots', content: 'index, follow' },
        { name: 'language', content: 'English' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/icon.webp' },
        { rel: 'mask-icon', href: '/favicon.svg', color: '#18a058' },
        { rel: 'sitemap', href: '/sitemap.xml', type: 'application/xml' }
      ]
    }
  },
  tailwindcss: {
    configPath: '~/tailwind.config.ts',
    viewer: false,
  },
  devtools: { enabled: false }
});
