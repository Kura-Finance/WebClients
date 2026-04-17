import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        'kura': {
          'background': '#0B0B0F',
          'background-light': '#1A1A24',
          'background-lighter': '#2D2D35',
          'primary': '#8B5CF6',
          'primary-dark': '#7C3AED',
          'primary-light': '#A78BFA',
          'secondary': '#3B82F6',
          'secondary-dark': '#1D4ED8',
          'secondary-light': '#60A5FA',
          'accent': '#00D9FF',
          'accent-alt': '#10B981',
          'border': '#2D2D35',
          'border-light': '#404049',
          'success': '#10B981',
          'warning': '#F59E0B',
          'error': '#EF4444',
        }
      },
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', '"Fira Sans"', '"Droid Sans"', '"Helvetica Neue"', 'sans-serif'],
        'mono': ['Monaco', '"Courier New"', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #8B5CF6, #A78BFA, #3B82F6)',
        'gradient-dark': 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
      },
      boxShadow: {
        'glow-primary': '0 0 30px rgba(139, 92, 246, 0.3)',
        'glow-secondary': '0 0 30px rgba(59, 130, 246, 0.3)',
        'glow-lg': '0 0 60px rgba(139, 92, 246, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideInUp 0.5s ease-out',
        'slide-down': 'slideInDown 0.5s ease-out',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
} satisfies Config
