<script setup lang="ts">
interface ProverbRow {
  id: string
  original_text: string
  country_code: string
  language_name: string
  status: string
  vote_count: number
  created_at: string
  profiles?: { display_name: string | null } | null
}

const props = withDefaults(defineProps<{
  userId?: string
  limit?: number
  showUser?: boolean
  showModerationActions?: boolean
}>(), {
  userId: undefined,
  limit: 10,
  showUser: false,
  showModerationActions: false
})

const toast = useToast()

const proverbs = ref<ProverbRow[]>([])
const loading = ref(true)
const total = ref(0)
const page = ref(0)
const languageFilter = ref('all')
const languages = ref<{ language: string; count: number }[]>([])
const showRemoveModal = ref(false)
const removing = ref(false)
const proverbToRemove = ref<ProverbRow | null>(null)

const totalPages = computed(() => Math.ceil(total.value / props.limit))

const allCount = computed(() =>
  languages.value.reduce((sum, item) => sum + item.count, 0)
)

const languageItems = computed(() => [
  { label: `All languages (${allCount.value})`, value: 'all' },
  ...languages.value.map(item => ({
    label: `${item.language} (${item.count})`,
    value: item.language
  }))
])

const statusColor: Record<string, string> = {
  published: 'text-success',
  pending: 'text-warning',
  rejected: 'text-error',
  flagged: 'text-error',
  draft: 'text-muted'
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

async function fetchLanguages() {
  const response = await $fetch<{ languages: { language: string; count: number }[] }>('/api/manage/proverbs/languages', {
    query: {
      userId: props.userId
    }
  })
  languages.value = response.languages || []
}

async function fetchProverbs() {
  loading.value = true

  const from = page.value * props.limit
  const to = from + props.limit - 1

  const response = await $fetch<{ proverbs: ProverbRow[]; total: number }>('/api/manage/proverbs', {
    query: {
      userId: props.userId,
      page: page.value,
      limit: props.limit,
      language: languageFilter.value
    }
  })
  proverbs.value = (response.proverbs || []) as unknown as ProverbRow[]
  total.value = response.total || 0
  loading.value = false
}

function goToPage(nextPage: number) {
  page.value = nextPage
  fetchProverbs()
}

function openRemoveModal(proverb: ProverbRow) {
  proverbToRemove.value = proverb
  showRemoveModal.value = true
}

function closeRemoveModal() {
  if (removing.value) return
  showRemoveModal.value = false
  proverbToRemove.value = null
}

async function removeProverb() {
  if (!proverbToRemove.value || removing.value) return

  removing.value = true
  const target = proverbToRemove.value

  try {
    await $fetch(`/api/proverbs/${target.id}/remove`, {
      method: 'POST'
    })

    toast.add({
      title: 'Proverb removed',
      description: 'The proverb was removed from the public feed.',
      color: 'success',
      icon: 'i-lucide-check-circle'
    })

    showRemoveModal.value = false
    proverbToRemove.value = null
    await fetchLanguages()
    await fetchProverbs()
  } catch (e: any) {
    toast.add({
      title: 'Failed to remove proverb',
      description: e?.data?.message || e?.message || 'Something went wrong.',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } finally {
    removing.value = false
  }
}

function getActionItems(proverb: ProverbRow) {
  return [[
    {
      label: 'Edit',
      icon: 'i-lucide-pencil',
      to: `/p/${proverb.id}/edit`
    },
    {
      label: 'Remove',
      icon: 'i-lucide-shield-alert',
      color: 'error',
      onSelect: () => openRemoveModal(proverb)
    }
  ]]
}

async function reload() {
  page.value = 0
  languageFilter.value = 'all'
  await fetchLanguages()
  await fetchProverbs()
}

watch(languageFilter, () => {
  page.value = 0
  fetchProverbs()
})

watch(() => props.userId, () => {
  reload()
})

await reload()
</script>

<template>
  <div class="space-y-3">
    <div v-if="languageItems.length > 0" class="flex items-center gap-3">
      <USelect
        v-model="languageFilter"
        :items="languageItems"
        value-key="value"
        class="w-56"
      />
      <span class="text-xs text-dimmed">
        {{ total }} proverb{{ total === 1 ? '' : 's' }}
      </span>
    </div>

    <div v-if="loading" class="space-y-2 py-2">
      <USkeleton class="h-8 w-full" />
      <USkeleton class="h-8 w-full" />
    </div>

    <div v-else-if="proverbs.length === 0" class="text-sm text-muted py-2">
      No proverbs found.
    </div>

    <template v-else>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs text-muted uppercase tracking-wide border-b border-default">
              <th class="pb-2 pr-3 font-medium">ID</th>
              <th class="pb-2 pr-3 font-medium">Proverb</th>
              <th class="pb-2 pr-3 font-medium">Language</th>
              <th v-if="showUser" class="pb-2 pr-3 font-medium">User</th>
              <th class="pb-2 pr-3 font-medium">Status</th>
              <th class="pb-2 pr-3 font-medium">Reactions</th>
              <th class="pb-2 font-medium">Date</th>
              <th v-if="showModerationActions" class="pb-2 pl-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="proverb in proverbs" :key="proverb.id" class="border-b border-default last:border-0">
              <td class="py-2 pr-3">
                <NuxtLink :to="`/p/${proverb.id}`" class="text-primary hover:underline font-mono text-xs">
                  {{ proverb.id.slice(0, 8) }}...
                </NuxtLink>
              </td>
              <td class="py-2 pr-3 max-w-xs truncate">"{{ proverb.original_text }}"</td>
              <td class="py-2 pr-3">
                <CountryBadge :country-code="proverb.country_code" :language-name="proverb.language_name" />
              </td>
              <td v-if="showUser" class="py-2 pr-3 text-xs text-dimmed">
                {{ proverb.profiles?.display_name || 'Anonymous' }}
              </td>
              <td class="py-2 pr-3">
                <span class="font-medium text-xs" :class="statusColor[proverb.status] || 'text-muted'">
                  {{ proverb.status }}
                </span>
              </td>
              <td class="py-2 pr-3 tabular-nums">{{ proverb.vote_count }}</td>
              <td class="py-2 text-xs text-dimmed whitespace-nowrap">{{ formatDate(proverb.created_at) }}</td>
              <td v-if="showModerationActions" class="py-2 pl-3 text-right">
                <UDropdownMenu :items="getActionItems(proverb)">
                  <UButton
                    label="Actions"
                    icon="i-lucide-chevrons-up-down"
                    variant="ghost"
                    color="neutral"
                    size="xs"
                  />
                </UDropdownMenu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="flex items-center justify-between pt-1">
        <span class="text-xs text-dimmed">
          Page {{ page + 1 }} of {{ totalPages }}
        </span>
        <div class="flex gap-1">
          <UButton
            icon="i-lucide-chevron-left"
            variant="ghost"
            color="neutral"
            size="xs"
            :disabled="page === 0"
            @click="goToPage(page - 1)"
          />
          <UButton
            icon="i-lucide-chevron-right"
            variant="ghost"
            color="neutral"
            size="xs"
            :disabled="page >= totalPages - 1"
            @click="goToPage(page + 1)"
          />
        </div>
      </div>
    </template>

    <UModal v-model:open="showRemoveModal" title="Remove proverb" @close="closeRemoveModal">
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-muted">
            This will remove the proverb from the public feed.
          </p>
          <p class="text-sm">
            <span class="font-medium">Proverb:</span>
            "{{ proverbToRemove?.original_text }}"
          </p>

          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              variant="ghost"
              color="neutral"
              :disabled="removing"
              @click="closeRemoveModal"
            />
            <UButton
              label="Remove proverb"
              icon="i-lucide-shield-alert"
              color="error"
              :loading="removing"
              @click="removeProverb"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
