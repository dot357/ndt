<script setup lang="ts">
defineProps<{
  proverb: {
    id: string
    original_text: string
    literal_text: string
    country_code: string
    language_name: string
    vote_count: number
    profiles: { display_name: string | null } | null
  }
}>()
</script>

<template>
  <NuxtLink :to="`/p/${proverb.id}`" class="block group">
    <UCard class="h-full transition-shadow group-hover:shadow-lg">
      <div class="space-y-3">
        <div class="flex items-start justify-between gap-2">
          <CountryBadge :country-code="proverb.country_code" :language-name="proverb.language_name" />
          <VoteButton :proverb-id="proverb.id" :initial-count="proverb.vote_count" />
        </div>

        <p class="font-semibold text-highlighted leading-snug">
          "{{ proverb.original_text }}"
        </p>

        <p class="text-sm text-muted line-clamp-2">
          Literally: "{{ proverb.literal_text }}"
        </p>

        <div class="flex items-center justify-between pt-1">
          <span v-if="proverb.profiles?.display_name" class="text-xs text-dimmed">
            by {{ proverb.profiles.display_name }}
          </span>
          <UIcon name="i-lucide-arrow-right" class="size-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </UCard>
  </NuxtLink>
</template>
