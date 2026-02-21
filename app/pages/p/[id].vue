<script setup lang="ts">
const route = useRoute()
const proverbId = route.params.id as string

const { proverb, loading, error } = useProverb(proverbId)
const user = useSupabaseUser()
const { isBanned } = useUserRole()
const { hasReported } = useReport(proverbId)
const showReportModal = ref(false)
const meaningRevealed = ref(false)

const timeAgo = computed(() => {
  if (!proverb.value) return ''
  const diff = Date.now() - new Date(proverb.value.created_at).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  return new Date(proverb.value.created_at).toLocaleDateString()
})

watchEffect(() => {
  if (proverb.value) {
    useSeoMeta({
      title: `"${proverb.value.original_text}" — NDT`,
      description: `Literally: "${proverb.value.literal_text}" — A ${proverb.value.language_name} proverb`
    })
  }
})
</script>

<template>
  <UPage>
    <UPageBody>
      <!-- Loading -->
      <div v-if="loading" class="max-w-2xl mx-auto space-y-4">
        <USkeleton class="h-6 w-32" />
        <USkeleton class="h-10 w-full" />
        <USkeleton class="h-6 w-3/4" />
        <USkeleton class="h-20 w-full" />
      </div>

      <!-- Error / 404 -->
      <div v-else-if="error || !proverb" class="text-center py-16">
        <UIcon name="i-lucide-search-x" class="size-12 text-muted mx-auto mb-4" />
        <h2 class="text-xl font-semibold mb-2">Proverb not found</h2>
        <p class="text-muted mb-4">This proverb may have been removed or doesn't exist.</p>
        <UButton to="/" label="Back to feed" icon="i-lucide-home" />
      </div>

      <!-- Proverb detail -->
      <div v-else class="max-w-2xl mx-auto space-y-6">
        <div class="flex items-center gap-3 flex-wrap">
          <CountryBadge :country-code="proverb.country_code" :language-name="proverb.language_name" />
          <span class="text-sm text-dimmed">{{ timeAgo }}</span>
        </div>

        <h1 class="text-2xl sm:text-3xl font-bold text-highlighted leading-snug">
          "{{ proverb.original_text }}"
        </h1>

        <UCard variant="subtle">
          <div class="space-y-1">
            <p class="text-xs font-medium text-muted uppercase tracking-wide">Literal Translation</p>
            <p class="text-lg">"{{ proverb.literal_text }}"</p>
          </div>
        </UCard>

        <!-- Meaning reveal -->
        <UCard v-if="meaningRevealed" class="border-primary/30 bg-accented">
          <div class="space-y-1">
            <p class="text-xs font-medium text-primary uppercase tracking-wide">Actual Meaning</p>
            <p class="text-lg font-medium">{{ proverb.meaning_text }}</p>
          </div>
        </UCard>

        <UButton
          v-else
          label="Reveal the meaning"
          icon="i-lucide-eye"
          variant="soft"
          size="lg"
          block
          @click="meaningRevealed = true"
        />

        <!-- Reactions -->
        <div class="pt-4 border-t border-default space-y-3">
          <EmojiReactions :proverb-id="proverb.id" />

          <div class="flex items-center justify-between">
            <span v-if="proverb.profiles?.display_name" class="text-sm text-muted">
              Submitted by {{ proverb.profiles.display_name }}
            </span>

            <UButton
              v-if="user && !isBanned && !hasReported"
              label="Report"
              icon="i-lucide-flag"
              variant="ghost"
              color="neutral"
              size="xs"
              @click="showReportModal = true"
            />
            <span v-else-if="hasReported" class="text-xs text-dimmed">
              Reported
            </span>
          </div>
        </div>

        <ReportModal v-model="showReportModal" :proverb-id="proverb.id" />
      </div>
    </UPageBody>
  </UPage>
</template>
