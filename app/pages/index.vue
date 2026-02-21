<script setup lang="ts">
useSeoMeta({
  title: 'NDT — No Direct Translation',
  description: 'Discover funny proverbs from around the world that just can\'t be translated.'
})

const region = ref('All')
const sort = ref<'trending' | 'newest'>('trending')

const { proverbs, loading, hasMore, loadMore } = useProverbs({
  region,
  sort
})
</script>

<template>
  <div>

    <UPageHero
      title="No Direct Translation"
      description="Discover the funniest proverbs from around the world — sayings so unique, they just can't be translated. Vote for your favorites, guess their meanings, and share your own."
      :links="[
        {
          label: 'Browse proverbs',
          to: '#feed',
          trailingIcon: 'i-lucide-arrow-down',
          size: 'xl'
        },
        {
          label: 'Play the game',
          to: '/play',
          icon: 'i-lucide-gamepad-2',
          size: 'xl',
          color: 'neutral',
          variant: 'subtle'
        }
      ]"
    />

    <UPageSection id="feed">
      <template #title>
        <span>{{ sort === 'trending' ? 'Trending' : 'Newest' }} Proverbs</span>
      </template>

      <FeedFilters v-model:region="region" v-model:sort="sort" class="mb-6" />

      <!-- Loading skeleton -->
      <div v-if="loading && proverbs.length === 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard v-for="i in 6" :key="i">
          <div class="space-y-3">
            <USkeleton class="h-5 w-24" />
            <USkeleton class="h-5 w-3/4" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-1/2" />
          </div>
        </UCard>
      </div>

      <!-- Proverb grid -->
      <div v-else-if="proverbs.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ProverbCard v-for="p in proverbs" :key="p.id" :proverb="p" />
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-12">
        <UIcon name="i-lucide-search-x" class="size-12 text-muted mx-auto mb-4" />
        <p class="text-muted">No proverbs found for this filter. Try another region!</p>
      </div>

      <!-- Load more -->
      <div v-if="hasMore && proverbs.length > 0" class="text-center mt-8">
        <UButton
          label="Load more"
          icon="i-lucide-chevrons-down"
          variant="soft"
          :loading="loading"
          @click="loadMore"
        />
      </div>
    </UPageSection>
  </div>
</template>
