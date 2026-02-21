<script setup lang="ts">
const region = defineModel<string>('region', { default: 'All' })
const sort = defineModel<'trending' | 'newest'>('sort', { default: 'trending' })

const regionTabs = regions.map(r => ({ label: r, value: r }))

const sortOptions = [
  { label: 'Trending', value: 'trending' as const, icon: 'i-lucide-flame' },
  { label: 'Newest', value: 'newest' as const, icon: 'i-lucide-clock' }
]
</script>

<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div class="flex gap-2 overflow-x-auto pb-1 max-w-full">
      <UButton
        v-for="tab in regionTabs"
        :key="tab.value"
        :label="tab.label"
        size="sm"
        :variant="region === tab.value ? 'solid' : 'ghost'"
        :color="region === tab.value ? 'primary' : 'neutral'"
        @click="region = tab.value"
      />
    </div>

    <div class="flex gap-1 shrink-0">
      <UButton
        v-for="opt in sortOptions"
        :key="opt.value"
        :icon="opt.icon"
        :label="opt.label"
        size="sm"
        :variant="sort === opt.value ? 'soft' : 'ghost'"
        :color="sort === opt.value ? 'primary' : 'neutral'"
        @click="sort = opt.value"
      />
    </div>
  </div>
</template>
