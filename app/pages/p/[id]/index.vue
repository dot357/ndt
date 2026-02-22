<script setup lang="ts">
const route = useRoute()
const proverbId = route.params.id as string

const client = useSupabaseClient<any>()
const toast = useToast()
const { proverb, loading, error } = useProverb(proverbId)
const user = useSupabaseUser()
const { isBanned, isAdmin } = useUserRole()
const { hasReported } = useReport(proverbId)
const showReportModal = ref(false)
const showRemoveModal = ref(false)
const removing = ref(false)
const removeError = ref<string | null>(null)
const selectedOption = ref<string | null>(null)
const result = ref<'correct' | 'wrong' | null>(null)
const answering = ref(false)
const hasAnswered = ref(false)
const distribution = ref<Array<{
  option_id: string
  option_text: string
  is_correct: boolean
  pick_count: number
  pick_percentage: number
}>>([])
const shuffledOptions = ref<Array<{ id: string; option_text: string; is_correct: boolean }>>([])

const ANON_PROVERB_GUESSES_KEY = 'ndt_proverb_detail_guesses'

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

function getAnonGuesses(): Record<string, string> {
  if (import.meta.server) return {}
  try {
    return JSON.parse(localStorage.getItem(ANON_PROVERB_GUESSES_KEY) || '{}')
  } catch {
    return {}
  }
}

function setAnonGuess(proverbId: string, optionId: string) {
  const guesses = getAnonGuesses()
  guesses[proverbId] = optionId
  localStorage.setItem(ANON_PROVERB_GUESSES_KEY, JSON.stringify(guesses))
}

async function getSessionUserId(): Promise<string | null> {
  const { data: { session } } = await client.auth.getSession()
  return session?.user?.id ?? null
}

function resetGuessState() {
  selectedOption.value = null
  result.value = null
  answering.value = false
  hasAnswered.value = false
  distribution.value = []
  shuffledOptions.value = []
}

function setupShuffledOptions() {
  if (!proverb.value) return
  shuffledOptions.value = [...(proverb.value.guess_options || [])]
    .sort(() => Math.random() - 0.5)
}

async function fetchDistribution() {
  if (!proverb.value) return
  try {
    const { data } = await client.rpc('get_answer_distribution', {
      p_proverb_id: proverb.value.id
    })
    distribution.value = data || []
  } catch {
    // Non-critical
  }
}

async function restoreExistingGuess() {
  if (!proverb.value) return

  const userId = await getSessionUserId()
  let previousOptionId: string | null = null

  if (userId) {
    const { data } = await client
      .from('guesses')
      .select('selected_option, is_correct')
      .eq('proverb_id', proverb.value.id)
      .eq('user_id', userId)
      .maybeSingle()

    if (data?.selected_option) {
      previousOptionId = data.selected_option
      result.value = data.is_correct ? 'correct' : 'wrong'
    }
  } else {
    const anonGuess = getAnonGuesses()[proverb.value.id]
    if (anonGuess) {
      previousOptionId = anonGuess
      const picked = proverb.value.guess_options.find(o => o.id === anonGuess)
      result.value = picked?.is_correct ? 'correct' : 'wrong'
    }
  }

  if (!previousOptionId) return

  selectedOption.value = previousOptionId
  hasAnswered.value = true
  await fetchDistribution()
}

async function submitGuess(optionId: string) {
  if (!proverb.value || hasAnswered.value || answering.value) return

  answering.value = true
  selectedOption.value = optionId

  const picked = proverb.value.guess_options.find(o => o.id === optionId)
  const isCorrect = !!picked?.is_correct
  result.value = isCorrect ? 'correct' : 'wrong'

  const userId = await getSessionUserId()

  if (userId) {
    const { error: insertError } = await client.from('guesses').insert({
      proverb_id: proverb.value.id,
      selected_option: optionId,
      is_correct: isCorrect
    })

    if (insertError) {
      console.error('Failed to save guess:', insertError.message)
    }
  } else {
    setAnonGuess(proverb.value.id, optionId)
  }

  hasAnswered.value = true
  await fetchDistribution()
  answering.value = false
}

watch(() => proverb.value?.id, async () => {
  resetGuessState()
  if (!proverb.value) return
  setupShuffledOptions()
  await restoreExistingGuess()
})

function closeRemoveModal() {
  if (removing.value) return
  showRemoveModal.value = false
  removeError.value = null
}

async function removeProverb() {
  if (!proverb.value || !isAdmin.value) return

  removing.value = true
  removeError.value = null

  try {
    const { error: updateError } = await client
      .from('proverbs')
      .update({ status: 'flagged' })
      .eq('id', proverb.value.id)

    if (updateError) throw updateError

    if (user.value?.id) {
      await client.from('mod_actions').insert({
        mod_id: user.value.id,
        action: 'remove_proverb',
        target_type: 'proverb',
        target_id: proverb.value.id
      })
    }

    showRemoveModal.value = false
    toast.add({
      title: 'Proverb removed',
      description: 'The proverb was removed from the public feed.',
      color: 'success',
      icon: 'i-lucide-check-circle'
    })
    await navigateTo('/')
  } catch (e: any) {
    const message = e?.message || 'Failed to remove proverb'
    removeError.value = message
    toast.add({
      title: 'Failed to remove proverb',
      description: message,
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } finally {
    removing.value = false
  }
}
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

        <UCard>
          <div class="space-y-4">
            <p class="text-sm font-medium">What does this proverb actually mean?</p>

            <div v-if="!hasAnswered" class="grid gap-3">
              <UButton
                v-for="option in shuffledOptions"
                :key="option.id"
                :label="option.option_text"
                color="neutral"
                variant="outline"
                size="lg"
                block
                class="text-left justify-start"
                :loading="answering && selectedOption === option.id"
                :disabled="answering"
                @click="submitGuess(option.id)"
              />
            </div>

            <div v-else-if="distribution.length > 0" class="grid gap-3">
              <div
                v-for="item in distribution"
                :key="item.option_id"
                class="rounded-lg border p-4"
                :class="[
                  item.is_correct
                    ? 'border-green-500/50 bg-green-500/5'
                    : item.option_id === selectedOption
                      ? 'border-red-500/50 bg-red-500/5'
                      : 'border-default bg-default'
                ]"
              >
                <div class="flex items-center justify-between mb-1">
                  <div class="flex items-center gap-2">
                    <UBadge
                      v-if="item.is_correct"
                      color="success"
                      variant="subtle"
                      size="xs"
                    >
                      {{ item.option_id === selectedOption ? 'Correct' : 'Correct answer' }}
                    </UBadge>
                    <UBadge
                      v-else
                      color="error"
                      variant="subtle"
                      size="xs"
                    >
                      Incorrect
                    </UBadge>
                    <UBadge
                      v-if="item.option_id === selectedOption"
                      color="primary"
                      variant="subtle"
                      size="xs"
                    >
                      YOUR CHOICE
                    </UBadge>
                  </div>
                  <span class="text-sm font-semibold tabular-nums">{{ item.pick_percentage }}%</span>
                </div>

                <p class="text-sm mb-2">{{ item.option_text }}</p>

                <div class="h-2 rounded-full bg-elevated overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-700 ease-out"
                    :class="[
                      item.is_correct
                        ? 'bg-green-500'
                        : item.option_id === selectedOption
                          ? 'bg-red-500'
                          : 'bg-(--ui-border-accented)'
                    ]"
                    :style="{ width: `${item.pick_percentage}%` }"
                  />
                </div>
              </div>
            </div>

            <div v-else class="text-sm text-muted">
              Answer distribution is not available yet.
            </div>
          </div>
        </UCard>

        <!-- Reactions -->
        <div class="pt-4 border-t border-default space-y-3">
          <EmojiReactions :proverb-id="proverb.id" />

          <div class="flex items-center justify-between gap-3">
            <span v-if="proverb.profiles?.display_name" class="text-sm text-muted">
              Submitted by {{ proverb.profiles.display_name }}
            </span>

            <div class="flex items-center gap-2">
              <UButton
                v-if="isAdmin"
                label="Remove proverb"
                icon="i-lucide-shield-alert"
                variant="soft"
                color="error"
                size="xs"
                @click="showRemoveModal = true"
              />

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
        </div>

        <ReportModal v-model="showReportModal" :proverb-id="proverb.id" />

        <UModal v-model:open="showRemoveModal" title="Remove proverb" @close="closeRemoveModal">
          <template #body>
            <div class="space-y-4">
              <p class="text-sm text-muted">
                This will remove the proverb from the public feed.
              </p>
              <p class="text-sm">
                <span class="font-medium">Proverb:</span> "{{ proverb.original_text }}"
              </p>

              <p v-if="removeError" class="text-sm text-red-500">
                {{ removeError }}
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
    </UPageBody>
  </UPage>
</template>
