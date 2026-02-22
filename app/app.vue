<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#ffffff' }
  ],
  link: [
    { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png?v=2' },
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg?v=2' },
    { rel: 'shortcut icon', href: '/favicon.ico?v=2' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png?v=2' },
    { rel: 'manifest', href: '/site.webmanifest?v=2' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'NDT — No Direct Translation'
const description = 'Discover funny proverbs from around the world. Submit, vote, and guess the meaning of sayings that just can\'t be translated.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
