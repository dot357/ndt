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
