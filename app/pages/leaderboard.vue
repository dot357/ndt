<script setup lang="ts">
useSeoMeta({
  title: 'Leaderboard — NDT',
  description: 'The most popular proverbs on NDT.'
})

const period = ref<'daily' | 'weekly' | 'alltime'>('weekly')
const { entries, loading } = useLeaderboard(period)

const tabs = [
  { label: 'Daily', value: 'daily' as const, icon: 'i-lucide-calendar' },
  { label: 'Weekly', value: 'weekly' as const, icon: 'i-lucide-calendar-range' },
  { label: 'All Time', value: 'alltime' as const, icon: 'i-lucide-infinity' }
]
</script>

<template>
  <UPage>
    <UPageHeader
      title="Leaderboard"
      description="The most loved proverbs, ranked by votes."
    />
    <UPageBody>
      <div class="max-w-2xl mx-auto space-y-6">
        <div class="flex gap-2 justify-center">
          <UButton
            v-for="tab in tabs"
            :key="tab.value"
            :label="tab.label"
            :icon="tab.icon"
            size="sm"
            :variant="period === tab.value ? 'solid' : 'ghost'"
            :color="period === tab.value ? 'primary' : 'neutral'"
            @click="period = tab.value"
          />
        </div>

        <LeaderboardTable :entries="entries" :loading="loading" />
      </div>
    </UPageBody>
  </UPage>
</template>
