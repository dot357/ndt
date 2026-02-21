<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

useSeoMeta({
  title: 'Submit a Proverb — NDT',
  description: 'Share a funny proverb from your country.'
})
</script>

<template>
  <UPage>
    <UPageHeader
      title="Submit a Proverb"
      description="Share a funny saying from your culture. Include the original text, a literal translation, and the actual meaning. Don't forget 3 fake meanings for the guessing game!"
    />
    <UPageBody>
      <div class="max-w-2xl mx-auto">
        <ProverbForm />
      </div>
    </UPageBody>
  </UPage>
</template>
