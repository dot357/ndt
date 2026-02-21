<script setup lang="ts">
definePageMeta({ layout: 'manage', middleware: 'admin' })

useSeoMeta({ title: 'Moderation — NDT Admin' })

const {
  proverbs, loading, selected,
  approveProverb, rejectProverb,
  bulkApprove, bulkReject,
  toggleSelect, toggleSelectAll
} = useManageModeration()

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

    <!-- Bulk actions -->
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

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <USkeleton v-for="i in 3" :key="i" class="h-40 w-full" />
    </div>

    <!-- Empty -->
    <div v-else-if="proverbs.length === 0" class="text-center py-12">
      <UIcon name="i-lucide-check-circle" class="size-12 text-success mx-auto mb-4" />
      <p class="text-lg font-medium">All clear!</p>
      <p class="text-muted">No proverbs waiting for review.</p>
    </div>

    <!-- Proverb list -->
    <div v-else class="space-y-4">
      <div class="flex items-center gap-2 text-sm text-muted">
        <UCheckbox
          :model-value="selected.size === proverbs.length"
          @update:model-value="toggleSelectAll"
        />
        <span>Select all</span>
      </div>

      <UCard v-for="p in proverbs" :key="p.id">
        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <UCheckbox
              :model-value="selected.has(p.id)"
              class="mt-1"
              @update:model-value="toggleSelect(p.id)"
            />
            <div class="flex-1 space-y-2">
              <div class="flex items-center gap-2 flex-wrap">
                <CountryBadge :country-code="p.country_code" :language-name="p.language_name" />
                <span class="text-xs text-dimmed">{{ formatDate(p.created_at) }}</span>
                <span v-if="p.profiles?.display_name" class="text-xs text-dimmed">
                  by {{ p.profiles.display_name }}
                </span>
              </div>

              <p class="font-semibold text-highlighted">"{{ p.original_text }}"</p>
              <p class="text-sm text-muted">Literally: "{{ p.literal_text }}"</p>
              <p class="text-sm">Meaning: {{ p.meaning_text }}</p>
            </div>
          </div>

          <div class="flex items-center gap-2 pl-8">
            <UButton
              label="Approve"
              icon="i-lucide-check"
              size="sm"
              color="success"
              variant="soft"
              :loading="actionLoading === p.id"
              @click="handleApprove(p.id)"
            />
            <UButton
              label="Reject"
              icon="i-lucide-x"
              size="sm"
              color="error"
              variant="soft"
              :loading="actionLoading === p.id"
              @click="handleReject(p.id)"
            />
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
