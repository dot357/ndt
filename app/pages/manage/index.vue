<script setup lang="ts">
definePageMeta({ layout: 'manage', middleware: 'admin' })

useSeoMeta({ title: 'Dashboard — NDT Admin' })

const { stats, recentActions, loading } = useManageStats()
const { isAdmin } = useUserRole()

type StatCard = {
  label: string
  value: number
  icon: string
  highlight?: boolean
  to?: string
}

const statCards = computed(() => {
  const cards: StatCard[] = [
    { label: 'Total Users', value: stats.value.totalUsers, icon: 'i-lucide-users' },
    { label: 'Published', value: stats.value.publishedProverbs, icon: 'i-lucide-book-open' },
    { label: 'Pending', value: stats.value.pendingProverbs, icon: 'i-lucide-clock', highlight: stats.value.pendingProverbs > 0 },
    { label: 'Rejected', value: stats.value.rejectedProverbs, icon: 'i-lucide-x-circle' },
    { label: 'Reactions', value: stats.value.totalReactions, icon: 'i-lucide-heart' },
    { label: 'Open Reports', value: stats.value.openReports, icon: 'i-lucide-flag', highlight: stats.value.openReports > 0 }
  ]

  if (isAdmin.value) {
    cards.push({
      label: 'Email Opt In',
      value: stats.value.emailOptInUsers,
      icon: 'i-lucide-mail-check',
      to: '/manage/users?email=opted_in&status=active,banned'
    })
  }

  return cards
})

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

function shortId(id: string) {
  return `${id.slice(0, 8)}...`
}

function getEntityLink(targetType: string, targetId: string) {
  if (targetType === 'proverb') return `/p/${targetId}`
  if (targetType === 'report') return '/manage/reports'
  if (targetType === 'user') return '/manage/users'
  return null
}

function getEntityLabel(targetType: string, targetId: string) {
  if (targetType === 'proverb') return `Proverb ${shortId(targetId)}`
  if (targetType === 'report') return `Report ${shortId(targetId)}`
  if (targetType === 'user') return `User ${shortId(targetId)}`
  return `${targetType} ${shortId(targetId)}`
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
      <UCard v-for="i in statCards.length || 6" :key="i">
        <div class="space-y-2">
          <USkeleton class="h-4 w-20" />
          <USkeleton class="h-8 w-12" />
        </div>
      </UCard>
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <template v-for="card in statCards" :key="card.label">
        <NuxtLink v-if="card.to" :to="card.to" class="block">
          <UCard class="hover:bg-accented/40 transition-colors">
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
        </NuxtLink>
        <UCard v-else>
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
      </template>
    </div>

    <!-- Recent mod actions -->
    <div>
      <h2 class="text-lg font-semibold mb-4">Recent Mod Actions</h2>

      <div v-if="recentActions.length === 0" class="text-sm text-muted py-4">
        No moderation actions yet.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs text-muted uppercase tracking-wide border-b border-default">
              <th class="pb-2 pr-3 font-medium">Moderator</th>
              <th class="pb-2 pr-3 font-medium">Action</th>
              <th class="pb-2 pr-3 font-medium">Entity</th>
              <th class="pb-2 pr-3 font-medium">Details</th>
              <th class="pb-2 font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="action in recentActions" :key="action.id" class="border-b border-default last:border-0">
              <td class="py-2 pr-3 font-medium whitespace-nowrap">
                {{ action.profiles?.display_name || 'Unknown' }}
              </td>
              <td class="py-2 pr-3 text-muted whitespace-nowrap">
                {{ formatAction(action.action) }}
              </td>
              <td class="py-2 pr-3 whitespace-nowrap">
                <NuxtLink
                  v-if="getEntityLink(action.target_type, action.target_id)"
                  :to="getEntityLink(action.target_type, action.target_id)!"
                  class="text-primary hover:underline font-mono text-xs"
                >
                  {{ getEntityLabel(action.target_type, action.target_id) }}
                </NuxtLink>
                <span v-else class="font-mono text-xs text-dimmed">
                  {{ getEntityLabel(action.target_type, action.target_id) }}
                </span>
              </td>
              <td class="py-2 pr-3 text-xs text-dimmed max-w-xs truncate" :title="action.note || ''">
                {{ action.note || '—' }}
              </td>
              <td class="py-2 text-xs text-dimmed whitespace-nowrap">
                {{ timeAgo(action.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div>
      <h2 class="text-lg font-semibold mb-4">Latest Proverbs</h2>
      <UCard>
        <ManageProverbsTable :show-user="true" :show-moderation-actions="true" />
      </UCard>
    </div>
  </div>
</template>
