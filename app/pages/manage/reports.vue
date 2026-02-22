<script setup lang="ts">
definePageMeta({ layout: 'manage', middleware: 'admin' })

useSeoMeta({ title: 'Reports — NDT Admin' })

const { reports, loading, filter, resolveReport, dismissReport } = useManageReports()

const actionLoading = ref<string | null>(null)

const filterOptions = [
  { label: 'Open', value: 'open' as const },
  { label: 'Resolved', value: 'resolved' as const },
  { label: 'Dismissed', value: 'dismissed' as const }
]

async function handleResolve(id: string) {
  actionLoading.value = id
  await resolveReport(id)
  actionLoading.value = null
}

async function handleDismiss(id: string) {
  actionLoading.value = id
  await dismissReport(id)
  actionLoading.value = null
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
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Reports</h1>
      <UBadge :label="`${reports.length} ${filter}`" variant="subtle" />
    </div>

    <!-- Filter tabs -->
    <div class="flex gap-2">
      <UButton
        v-for="opt in filterOptions"
        :key="opt.value"
        :label="opt.label"
        size="sm"
        :variant="filter === opt.value ? 'solid' : 'ghost'"
        :color="filter === opt.value ? 'primary' : 'neutral'"
        @click="filter = opt.value"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <USkeleton v-for="i in 3" :key="i" class="h-28 w-full" />
    </div>

    <!-- Empty -->
    <div v-else-if="reports.length === 0" class="text-center py-12">
      <UIcon name="i-lucide-inbox" class="size-12 text-muted mx-auto mb-4" />
      <p class="text-muted">No {{ filter }} reports.</p>
    </div>

    <!-- Report table -->
    <UCard v-else>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs text-muted uppercase tracking-wide border-b border-default">
              <th class="pb-2 pr-3 font-medium">Proverb</th>
              <th class="pb-2 pr-3 font-medium">Language</th>
              <th class="pb-2 pr-3 font-medium">Reporter</th>
              <th class="pb-2 pr-3 font-medium">Reason</th>
              <th class="pb-2 pr-3 font-medium">When</th>
              <th v-if="filter === 'open'" class="pb-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in reports" :key="report.id" class="border-b border-default last:border-0">
              <td class="py-2 pr-3 max-w-sm">
                <div v-if="report.proverb" class="space-y-0.5">
                  <p class="font-medium truncate" :title="report.proverb.original_text">
                    "{{ report.proverb.original_text }}"
                  </p>
                  <p class="text-xs text-dimmed truncate" :title="report.proverb.literal_text">
                    Literally: "{{ report.proverb.literal_text }}"
                  </p>
                </div>
                <span v-else class="text-xs text-dimmed">Proverb removed</span>
              </td>
              <td class="py-2 pr-3">
                <CountryBadge
                  v-if="report.proverb"
                  :country-code="report.proverb.country_code"
                  :language-name="report.proverb.language_name"
                />
                <span v-else class="text-xs text-dimmed">N/A</span>
              </td>
              <td class="py-2 pr-3 text-xs text-dimmed">
                {{ report.reporter?.display_name || 'Unknown' }}
              </td>
              <td class="py-2 pr-3 max-w-md truncate" :title="report.reason">
                {{ report.reason }}
              </td>
              <td class="py-2 pr-3 text-xs text-dimmed whitespace-nowrap">
                {{ timeAgo(report.created_at) }}
              </td>
              <td v-if="filter === 'open'" class="py-2 text-right">
                <div class="inline-flex items-center gap-1.5">
                  <UButton
                    label="Remove proverb"
                    icon="i-lucide-shield-alert"
                    size="xs"
                    color="error"
                    variant="soft"
                    :loading="actionLoading === report.id"
                    @click="handleResolve(report.id)"
                  />
                  <UButton
                    label="False report"
                    icon="i-lucide-shield-off"
                    size="xs"
                    color="neutral"
                    variant="soft"
                    :loading="actionLoading === report.id"
                    @click="handleDismiss(report.id)"
                  />
                  <UButton
                    v-if="report.proverb"
                    :to="`/p/${report.proverb.id}`"
                    label="View"
                    icon="i-lucide-external-link"
                    size="xs"
                    variant="ghost"
                    color="neutral"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>
