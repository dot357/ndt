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

    <!-- Report list -->
    <div v-else class="space-y-3">
      <UCard v-for="report in reports" :key="report.id">
        <div class="space-y-3">
          <!-- Proverb preview -->
          <div v-if="report.proverb" class="flex items-start gap-2">
            <CountryBadge :country-code="report.proverb.country_code" :language-name="report.proverb.language_name" />
            <div class="min-w-0 flex-1">
              <p class="font-medium truncate">"{{ report.proverb.original_text }}"</p>
              <p class="text-sm text-muted truncate">Literally: "{{ report.proverb.literal_text }}"</p>
            </div>
          </div>

          <!-- Report details -->
          <div class="bg-accented rounded-md p-3">
            <div class="flex items-center gap-2 mb-1">
              <UIcon name="i-lucide-flag" class="size-3.5 text-warning" />
              <span class="text-xs font-medium text-muted">
                Reported by {{ report.reporter?.display_name || 'Unknown' }} · {{ timeAgo(report.created_at) }}
              </span>
            </div>
            <p class="text-sm">{{ report.reason }}</p>
          </div>

          <!-- Actions -->
          <div v-if="filter === 'open'" class="flex items-center gap-2">
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
        </div>
      </UCard>
    </div>
  </div>
</template>
