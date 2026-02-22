<script setup lang="ts">
useSeoMeta({
  title: 'Play — NDT',
  description: 'Redirecting to a random unanswered proverb.'
})

const loading = ref(true)
const error = ref<string | null>(null)

async function redirectToRandomUnansweredProverb() {
  try {
    const response = await $fetch<{ id: string | null }>('/api/play/random')
    if (!response.id) return
    await navigateTo(`/p/${response.id}`, { replace: true })
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Could not load a playable proverb.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void redirectToRandomUnansweredProverb()
})
</script>

<template>
  <UPage>
    <UPageBody>
      <div class="max-w-2xl mx-auto py-10">
        <UCard v-if="loading" class="text-center py-8">
          <USkeleton class="h-5 w-40 mx-auto mb-3" />
          <USkeleton class="h-4 w-56 mx-auto" />
        </UCard>

        <UCard v-else-if="error" class="text-center py-8">
          <UIcon name="i-lucide-alert-circle" class="size-10 text-error mx-auto mb-3" />
          <p class="font-medium mb-2">Could not start play mode</p>
          <p class="text-sm text-muted mb-4">{{ error }}</p>
          <UButton to="/" label="Back to feed" />
        </UCard>

        <UCard v-else class="text-center py-8">
          <UIcon name="i-lucide-party-popper" class="size-10 text-primary mx-auto mb-3" />
          <p class="font-medium mb-2">You have answered all available proverbs.</p>
          <p class="text-sm text-muted mb-4">Check back later for new ones.</p>
          <UButton to="/" label="Back to feed" />
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>
