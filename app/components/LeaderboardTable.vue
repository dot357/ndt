<script setup lang="ts">
defineProps<{
  entries: {
    id: string
    original_text: string
    literal_text: string
    country_code: string
    language_name: string
    vote_count: number
    author_name: string | null
  }[]
  loading: boolean
}>()

function rankIcon(index: number) {
  if (index === 0) return '🥇'
  if (index === 1) return '🥈'
  if (index === 2) return '🥉'
  return ''
}
</script>

<template>
  <!-- Loading -->
  <div v-if="loading" class="space-y-3">
    <USkeleton v-for="i in 5" :key="i" class="h-16 w-full" />
  </div>

  <!-- Empty -->
  <div v-else-if="entries.length === 0" class="text-center py-12">
    <UIcon name="i-lucide-trophy" class="size-12 text-muted mx-auto mb-4" />
    <p class="text-muted">No proverbs in this period yet.</p>
  </div>

  <!-- Table -->
  <div v-else class="space-y-2">
    <NuxtLink
      v-for="(entry, index) in entries"
      :key="entry.id"
      :to="`/p/${entry.id}`"
      class="block"
    >
      <UCard
        :class="[
          'transition-shadow hover:shadow-md',
          index < 3 ? 'border-primary/20' : ''
        ]"
      >
        <div class="flex items-center gap-4">
          <div class="text-2xl w-10 text-center shrink-0">
            <span v-if="index < 3">{{ rankIcon(index) }}</span>
            <span v-else class="text-sm text-muted font-mono">{{ index + 1 }}</span>
          </div>

          <div class="flex-1 min-w-0">
            <p class="font-medium text-highlighted truncate">
              "{{ entry.original_text }}"
            </p>
            <div class="flex items-center gap-2 mt-1">
              <CountryBadge :country-code="entry.country_code" :language-name="entry.language_name" />
              <span v-if="entry.author_name" class="text-xs text-dimmed">
                by {{ entry.author_name }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-1 shrink-0">
            <UIcon name="i-lucide-heart" class="size-4 text-primary" />
            <span class="font-semibold">{{ entry.vote_count }}</span>
          </div>
        </div>
      </UCard>
    </NuxtLink>
  </div>
</template>
