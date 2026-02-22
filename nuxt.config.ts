// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxtjs/supabase'
  ],

  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in'
    }
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    captchaProvider: process.env.CAPTCHA_PROVIDER || 'turnstile',
    captchaSecretKey: process.env.CAPTCHA_SECRET_KEY || '',
    captchaMode: process.env.CAPTCHA_MODE || 'monitor',
    authRedirectBaseUrl: process.env.AUTH_REDIRECT_BASE_URL || '',
    public: {
      captchaSiteKey: process.env.CAPTCHA_SITE_KEY || ''
    }
  },

  supabase: {
    redirectOptions: {
      login: '/',
      callback: '/auth/confirm',
      exclude: ['/', '/p/*', '/leaderboard', '/play', '/auth/confirm']
    }
  },

  experimental: {
    emitRouteChunkError: 'automatic-immediate'
  },

  compatibilityDate: '2025-01-15'
})
