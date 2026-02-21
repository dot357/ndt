<script setup lang="ts">
definePageMeta({ layout: 'manage', middleware: 'admin' })

useSeoMeta({ title: 'Dashboard — NDT Admin' })

const { stats, recentActions, loading } = useManageStats()

const statCards = computed(() => [
  { label: 'Total Users', value: stats.value.totalUsers, icon: 'i-lucide-users' },
  { label: 'Published', value: stats.value.publishedProverbs, icon: 'i-lucide-book-open' },
  { label: 'Pending', value: stats.value.pendingProverbs, icon: 'i-lucide-clock', highlight: stats.value.pendingProverbs > 0 },
  { label: 'Rejected', value: stats.value.rejectedProverbs, icon: 'i-lucide-x-circle' },
  { label: 'Reactions', value: stats.value.totalReactions, icon: 'i-lucide-heart' },
  { label: 'Open Reports', value: stats.value.openReports, icon: 'i-lucide-flag', highlight: stats.value.openReports > 0 }
])

function formatAction(action: string) {
  const map: Record<string, string> = {
    approve: 'Approved proverb',
    reject: 'Rejected proverb',
    ban: 'Banned user',
    unban: 'Unbanned user',
    role_change: 'Changed role',
    resolve_report: 'Resolved report',
    dismiss_report: 'Dismissed report'
  }
  return map[action] || action
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
</script>

<template>
  <div class="space-y-8">
    <h1 class="text-2xl font-bold">Dashboard</h1>

    <!-- Stats grid -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <UCard v-for="i in 6" :key="i">
        <div class="space-y-2">
          <USkeleton class="h-4 w-20" />
          <USkeleton class="h-8 w-12" />
        </div>
      </UCard>
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <UCard v-for="card in statCards" :key="card.label">
        <div class="flex items-start gap-3">
          <UIcon
            :name="card.icon"
            class="size-5 shrink-0 mt-0.5"
            :class="card.highlight ? 'text-warning' : 'text-muted'"
          />
          <div>
            <p class="text-xs text-muted uppercase tracking-wide">{{ card.label }}</p>
            <p class="text-2xl font-bold" :class="card.highlight ? 'text-warning' : ''">
              {{ card.value }}
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Recent mod actions -->
    <div>
      <h2 class="text-lg font-semibold mb-4">Recent Mod Actions</h2>

      <div v-if="recentActions.length === 0" class="text-sm text-muted py-4">
        No moderation actions yet.
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="action in recentActions"
          :key="action.id"
          class="flex items-center justify-between py-2 px-3 rounded-md bg-accented text-sm"
        >
          <div class="flex items-center gap-2">
            <span class="font-medium">{{ action.profiles?.display_name || 'Unknown' }}</span>
            <span class="text-muted">{{ formatAction(action.action) }}</span>
            <span v-if="action.note" class="text-dimmed">— {{ action.note }}</span>
          </div>
          <span class="text-xs text-dimmed shrink-0">{{ timeAgo(action.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
