<script setup lang="ts">
const props = defineProps<{
  proverbId: string
  initialCount?: number
}>()

const user = useSupabaseUser()
const showAuthModal = inject<Ref<boolean>>('showAuthModal')
const { hasVoted, voteCount, toggleVote, loading } = useVote(
  props.proverbId,
  props.initialCount ?? 0
)

function handleClick() {
  if (!user.value) {
    if (showAuthModal) showAuthModal.value = true
    return
  }
  toggleVote()
}
</script>

<template>
  <UButton
    :icon="hasVoted ? 'i-lucide-heart' : 'i-lucide-heart'"
    :color="hasVoted ? 'primary' : 'neutral'"
    :variant="hasVoted ? 'soft' : 'ghost'"
    size="sm"
    :loading="loading"
    :class="{ 'text-primary': hasVoted }"
    @click.stop="handleClick"
  >
    {{ voteCount }}
  </UButton>
</template>
