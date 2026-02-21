<script setup lang="ts">
const props = defineProps<{
  proverbId: string
  compact?: boolean
}>()

const user = useSupabaseUser()
const showAuthModal = inject<Ref<boolean>>('showAuthModal')
const { totalCount, loading, toggleReaction, getCount, hasReacted } = useReactions(props.proverbId)

function handleClick(emoji: string) {
  if (!user.value) {
    if (showAuthModal) showAuthModal.value = true
    return
  }
  toggleReaction(emoji)
}
</script>

<template>
  <div class="flex items-center gap-1 flex-wrap">
    <button
      v-for="emoji in REACTION_EMOJIS"
      :key="emoji.key"
      :title="emoji.label"
      :disabled="loading"
      class="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs transition-all duration-150 cursor-pointer select-none border"
      :class="[
        hasReacted(emoji.key)
          ? 'bg-primary/10 border-primary/30 scale-110'
          : 'bg-transparent border-transparent hover:bg-muted hover:border-default',
        loading ? 'opacity-50' : ''
      ]"
      @click.stop="handleClick(emoji.key)"
    >
      <UIcon :name="emoji.icon" class="size-4 shrink-0" />
      <span
        v-if="getCount(emoji.key) > 0"
        class="font-medium tabular-nums"
        :class="hasReacted(emoji.key) ? 'text-primary' : 'text-muted'"
      >
        {{ getCount(emoji.key) }}
      </span>
    </button>

    <span v-if="!compact && totalCount > 0" class="text-xs text-dimmed ml-1">
      {{ totalCount }} reaction{{ totalCount === 1 ? '' : 's' }}
    </span>
  </div>
</template>
