<script setup lang="ts">
useSeoMeta({
  title: 'Play — NDT',
  description: 'Redirecting to a random unanswered proverb.'
})

const client = useSupabaseClient<any>()
const loading = ref(true)
const error = ref<string | null>(null)

async function redirectToRandomUnansweredProverb() {
  try {
    const { data: { session } } = await client.auth.getSession()
    const userId = session?.user?.id ?? null
    let guessedIds: string[] = []

    if (userId) {
      // Join proverbs with guesses to collect this user's already answered proverb IDs.
      const { data: guessedRows, error: guessedError } = await client
        .from('proverbs')
        .select('id, guesses!inner(user_id)')
        .eq('status', 'published')
        .eq('guesses.user_id', userId)

      if (guessedError) throw guessedError
      guessedIds = (guessedRows || []).map((row: any) => row.id)
    }

    let query = client
      .from('proverbs')
      .select('id')
      .eq('status', 'published')
      .limit(200)

    if (userId && guessedIds.length > 0) {
      query = query.not('id', 'in', `(${guessedIds.join(',')})`)
    }

    const { data: candidates, error: candidatesError } = await query
    if (candidatesError) throw candidatesError

    const ids = (candidates || []).map((row: { id: string }) => row.id)
    if (ids.length === 0) return

    const randomId = ids[Math.floor(Math.random() * ids.length)]
    await navigateTo(`/p/${randomId}`, { replace: true })
  } catch (e: any) {
    error.value = e?.message || 'Could not load a playable proverb.'
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
