<script setup lang="ts">
const props = defineProps<{ userId: string }>()

const client = useSupabaseClient<any>()

const proverbs = ref<any[]>([])
const loading = ref(true)
const total = ref(0)
const page = ref(0)
const limit = 10
const languageFilter = ref('all')
const userLanguages = ref<{ language: string; count: number }[]>([])

const totalPages = computed(() => Math.ceil(total.value / limit))

const allCount = computed(() =>
  userLanguages.value.reduce((sum, l) => sum + l.count, 0)
)

const languageItems = computed(() => [
  { label: `All languages (${allCount.value})`, value: 'all' },
  ...userLanguages.value.map(l => ({
    label: `${l.language} (${l.count})`,
    value: l.language
  }))
])

async function fetchLanguages() {
  const { data } = await client
    .from('proverbs')
    .select('language_name')
    .eq('user_id', props.userId)

  const counts = new Map<string, number>()
  for (const row of data || []) {
    counts.set(row.language_name, (counts.get(row.language_name) || 0) + 1)
  }
  userLanguages.value = Array.from(counts.entries())
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count)
}

async function fetchProverbs() {
  loading.value = true
  const from = page.value * limit
  const to = from + limit - 1

  let query = client
    .from('proverbs')
    .select('id, original_text, country_code, language_name, status, vote_count, created_at', { count: 'exact' })
    .eq('user_id', props.userId)
    .order('created_at', { ascending: false })

  if (languageFilter.value && languageFilter.value !== 'all') {
    query = query.eq('language_name', languageFilter.value)
  }

  query = query.range(from, to)

  const { data, count } = await query
  proverbs.value = data || []
  total.value = count ?? 0
  loading.value = false
}

watch(languageFilter, () => {
  page.value = 0
  fetchProverbs()
})

function goToPage(p: number) {
  page.value = p
  fetchProverbs()
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const statusColor: Record<string, string> = {
  published: 'text-success',
  pending: 'text-warning',
  rejected: 'text-error',
  flagged: 'text-error',
  draft: 'text-muted'
}

// Fetch both on mount
fetchLanguages()
fetchProverbs()


console.log('User contributions:', proverbs.value)
</script>

<template>
  <div class="border-t border-default pt-3">
    <!-- Language filter -->
    <div class="flex items-center gap-3 mb-3"  v-if="languageItems.length > 0">

      <USelect
        v-model="languageFilter"
        :items="languageItems ?? []"
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
              <th class="pb-2 pr-3 font-medium">Status</th>
              <th class="pb-2 pr-3 font-medium">Reactions</th>
              <th class="pb-2 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in proverbs" :key="p.id" class="border-b border-default last:border-0">
              <td class="py-2 pr-3">
                <NuxtLink :to="`/p/${p.id}`" class="text-primary hover:underline font-mono text-xs">
                  {{ p.id.slice(0, 8) }}...
                </NuxtLink>
              </td>
              <td class="py-2 pr-3 max-w-xs truncate">"{{ p.original_text }}"</td>
              <td class="py-2 pr-3">
                <CountryBadge :country-code="p.country_code" :language-name="p.language_name" />
              </td>
              <td class="py-2 pr-3">
                <span class="font-medium text-xs" :class="statusColor[p.status] || 'text-muted'">
                  {{ p.status }}
                </span>
              </td>
              <td class="py-2 pr-3 tabular-nums">{{ p.vote_count }}</td>
              <td class="py-2 text-xs text-dimmed whitespace-nowrap">{{ formatDate(p.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between pt-3">
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
  </div>
</template>
