<script setup lang="ts">
useSeoMeta({
  title: 'Play — NDT',
  description: 'Guess the meaning of proverbs from around the world.'
})
</script>

<template>
  <UPage>
    <UPageHeader
      title="Guess the Meaning"
      description="Can you figure out what these proverbs really mean? Pick the correct answer!"
    />
    <UPageBody>
      <GuessGame />
    </UPageBody>
  </UPage>
</template>
