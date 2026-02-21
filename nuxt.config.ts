// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxtjs/supabase'
  ],

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

  compatibilityDate: '2025-01-15'
})
