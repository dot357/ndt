<script setup lang="ts">
definePageMeta({ layout: 'manage', middleware: 'admin' })

useSeoMeta({ title: 'Moderation — NDT Admin' })

const {
  proverbs, loading, selected,
  approveProverb, rejectProverb,
  bulkApprove, bulkReject,
  toggleSelect, toggleSelectAll
} = useManageModeration()

const { isAdminOrMod } = useUserRole()

const actionLoading = ref<string | null>(null)
const bulkLoading = ref(false)

async function handleApprove(id: string) {
  actionLoading.value = id
  await approveProverb(id)
  actionLoading.value = null
}

async function handleReject(id: string) {
  actionLoading.value = id
  await rejectProverb(id)
  actionLoading.value = null
}

async function handleBulkApprove() {
  bulkLoading.value = true
  await bulkApprove()
  bulkLoading.value = false
}

async function handleBulkReject() {
  bulkLoading.value = true
  await bulkReject()
  bulkLoading.value = false
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Moderation Queue</h1>
      <UBadge :label="`${proverbs.length} pending`" variant="subtle" :color="proverbs.length > 0 ? 'warning' : 'neutral'" />
    </div>

    <div v-if="selected.size > 0" class="flex items-center gap-3 p-3 bg-accented rounded-lg">
      <span class="text-sm font-medium">{{ selected.size }} selected</span>
      <UButton
        label="Approve all"
        icon="i-lucide-check"
        size="xs"
        color="success"
        variant="soft"
        :loading="bulkLoading"
        @click="handleBulkApprove"
      />
      <UButton
        label="Reject all"
        icon="i-lucide-x"
        size="xs"
        color="error"
        variant="soft"
        :loading="bulkLoading"
        @click="handleBulkReject"
      />
    </div>

    <div v-if="loading" class="space-y-2">
      <USkeleton class="h-8 w-full" />
      <USkeleton class="h-8 w-full" />
      <USkeleton class="h-8 w-full" />
    </div>

    <div v-else-if="proverbs.length === 0" class="text-center py-12">
      <UIcon name="i-lucide-check-circle" class="size-12 text-success mx-auto mb-4" />
      <p class="text-lg font-medium">All clear!</p>
      <p class="text-muted">No proverbs waiting for review.</p>
    </div>

    <UCard v-else>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs text-muted uppercase tracking-wide border-b border-default">
              <th class="pb-2 pr-3 font-medium w-8">
                <UCheckbox
                  :model-value="selected.size === proverbs.length"
                  @update:model-value="toggleSelectAll"
                />
              </th>
              <th class="pb-2 pr-3 font-medium">ID</th>
              <th class="pb-2 pr-3 font-medium">Proverb</th>
              <th class="pb-2 pr-3 font-medium">Language</th>
              <th class="pb-2 pr-3 font-medium">User</th>
              <th class="pb-2 pr-3 font-medium">Status</th>
              <th class="pb-2 pr-3 font-medium">Date</th>
              <th class="pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in proverbs" :key="p.id" class="border-b border-default last:border-0">
              <td class="py-2 pr-3">
                <UCheckbox
                  :model-value="selected.has(p.id)"
                  @update:model-value="toggleSelect(p.id)"
                />
              </td>
              <td class="py-2 pr-3">
                <span class="font-mono text-xs">{{ p.id.slice(0, 8) }}...</span>
              </td>
              <td class="py-2 pr-3 max-w-xs truncate" :title="p.original_text">
                "{{ p.original_text }}"
              </td>
              <td class="py-2 pr-3">
                <CountryBadge :country-code="p.country_code" :language-name="p.language_name" />
              </td>
              <td class="py-2 pr-3 text-xs text-dimmed">
                {{ p.profiles?.display_name || 'Anonymous' }}
              </td>
              <td class="py-2 pr-3">
                <span class="font-medium text-xs text-warning">pending</span>
              </td>
              <td class="py-2 pr-3 text-xs text-dimmed whitespace-nowrap">{{ formatDate(p.created_at) }}</td>
              <td class="py-2">
                <div class="flex items-center gap-1.5">
                  <UButton
                    label="Approve"
                    icon="i-lucide-check"
                    size="xs"
                    color="success"
                    variant="soft"
                    :loading="actionLoading === p.id"
                    @click="handleApprove(p.id)"
                  />
                  <UButton
                    label="Reject"
                    icon="i-lucide-x"
                    size="xs"
                    color="error"
                    variant="soft"
                    :loading="actionLoading === p.id"
                    @click="handleReject(p.id)"
                  />
                  <UButton
                    v-if="isAdminOrMod"
                    :to="`/p/${p.id}/edit`"
                    label="Edit"
                    icon="i-lucide-pencil"
                    size="xs"
                    color="neutral"
                    variant="ghost"
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
