<script setup lang="ts">
const route = useRoute()
const proverbId = route.params.id as string

const client = useSupabaseClient<any>()
const toast = useToast()
const { proverb, loading, error } = useProverb(proverbId)
const user = useSupabaseUser()
const showAuthModal = inject<Ref<boolean> | undefined>('showAuthModal', undefined)
const { isBanned, isAdmin } = useUserRole()
const { hasReported } = useReport(proverbId)
const showReportModal = ref(false)
const showRemoveModal = ref(false)
const removing = ref(false)
const removeError = ref<string | null>(null)
const navigatingRandom = ref(false)
const sharing = ref(false)
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
let hammerManager: HammerManager | null = null
const isAuthenticated = computed(() => !!user.value)

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
    const shareTitle = `"${proverb.value.original_text}" — NDT`
    const shareDescription = `Literally: "${proverb.value.literal_text}" — A ${proverb.value.language_name} proverb`

    useSeoMeta({
      title: shareTitle,
      description: shareDescription,
      ogTitle: shareTitle,
      ogDescription: shareDescription,
      twitterTitle: shareTitle,
      twitterDescription: shareDescription
    })
  }
})

async function getSessionUserId(): Promise<string | null> {
  const { data: { session } } = await client.auth.getSession()
  return session?.user?.id ?? null
}

function requireAuth(message: string) {
  if (isAuthenticated.value) return true
  toast.add({
    title: 'Sign in required',
    description: message,
    color: 'neutral',
    icon: 'i-lucide-log-in'
  })
  if (showAuthModal) showAuthModal.value = true
  return false
}

function isDesktopClient() {
  if (import.meta.server) return false
  return window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches
}

function canUseKeyboardShortcut() {
  if (!isDesktopClient()) return false
  if (showReportModal.value || showRemoveModal.value) return false

  const active = document.activeElement as HTMLElement | null
  if (!active) return true

  const tag = active.tagName
  return tag !== 'INPUT' && tag !== 'TEXTAREA' && !active.isContentEditable
}

function canUseSwipeNavigation() {
  if (import.meta.server) return false
  if (showReportModal.value || showRemoveModal.value) return false
  return window.matchMedia('(pointer: coarse)').matches
}

async function goToRandomProverb() {
  if (!proverb.value || navigatingRandom.value) return

  navigatingRandom.value = true

  try {
    const userId = user.value?.id
    let query = client
      .from('proverbs')
      .select('id')
      .eq('status', 'published')
      .limit(200)

    if (userId) {
      const { data: guessedRows, error: guessedError } = await client
        .from('proverbs')
        .select('id, guesses!inner(user_id)')
        .eq('status', 'published')
        .eq('guesses.user_id', userId)

      if (guessedError) throw guessedError

      const guessedIds = new Set((guessedRows || []).map((row: any) => row.id))
      guessedIds.add(proverb.value.id)

      if (guessedIds.size > 0) {
        query = query.not('id', 'in', `(${Array.from(guessedIds).join(',')})`)
      }
    } else {
      query = query.neq('id', proverb.value.id)
    }

    const { data, error: fetchError } = await query

    if (fetchError) throw fetchError

    const ids = (data || []).map((row: { id: string }) => row.id)

    if (ids.length === 0) {
      toast.add({
        title: 'No other proverb found',
        description: 'This is the only published proverb right now.',
        color: 'neutral',
        icon: 'i-lucide-info'
      })
      return
    }

    const randomId = ids[Math.floor(Math.random() * ids.length)]
    await navigateTo(`/p/${randomId}`)
  } catch (e: any) {
    toast.add({
      title: 'Could not open next proverb',
      description: e?.message || 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } finally {
    navigatingRandom.value = false
  }
}

function goBack() {
  if (import.meta.server) return
  window.history.back()
}

async function shareProverb() {
  if (!proverb.value || sharing.value || import.meta.server) return

  sharing.value = true
  const url = window.location.href
  const title = `"${proverb.value.original_text}" — NDT`
  const text = `Literally: "${proverb.value.literal_text}" — A ${proverb.value.language_name} proverb`

  try {
    if (navigator.share) {
      await navigator.share({ title, text, url })
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url)
      toast.add({
        title: 'Link copied',
        description: 'Proverb link copied to clipboard.',
        color: 'success',
        icon: 'i-lucide-check-circle'
      })
    } else {
      toast.add({
        title: 'Share not supported',
        description: 'Your browser does not support share or clipboard.',
        color: 'neutral',
        icon: 'i-lucide-info'
      })
    }
  } catch {
    // User cancelled share or clipboard failed
  } finally {
    sharing.value = false
  }
}

function handleKeyboardNavigation(event: KeyboardEvent) {
  if (event.defaultPrevented) return
  if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
  if (!canUseKeyboardShortcut()) return

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    void goToRandomProverb()
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    goBack()
  }
}

async function initSwipeNavigation() {
  if (!canUseSwipeNavigation() || hammerManager) return

  const { default: Hammer } = await import('hammerjs')
  hammerManager = new Hammer.Manager(document.body, {
    touchAction: 'pan-y'
  })

  hammerManager.add(new Hammer.Swipe({
    direction: Hammer.DIRECTION_HORIZONTAL,
    threshold: 18,
    velocity: 0.2
  }))

  hammerManager.on('swiperight', () => {
    if (!canUseSwipeNavigation()) return
   goBack()
  })

  hammerManager.on('swipeleft', () => {
    if (!canUseSwipeNavigation()) return
     void goToRandomProverb()

  })
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
    distribution.value = (data || []) as typeof distribution.value
  } catch {
    // Non-critical
  }
}

async function restoreExistingGuess() {
  if (!proverb.value) return

  const userId = await getSessionUserId()
  if (!userId) return
  let previousOptionId: string | null = null

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

  if (!previousOptionId) return

  selectedOption.value = previousOptionId
  hasAnswered.value = true
  await fetchDistribution()
}

async function submitGuess(optionId: string) {
  if (!proverb.value || hasAnswered.value || answering.value) return

  const userId = await getSessionUserId()
  if (!userId) {
    requireAuth('Sign in to submit an answer and see your progress.')
    return
  }

  answering.value = true
  selectedOption.value = optionId

  const picked = proverb.value.guess_options.find(o => o.id === optionId)
  const isCorrect = !!picked?.is_correct
  result.value = isCorrect ? 'correct' : 'wrong'

  const { error: insertError } = await client.from('guesses').insert({
    proverb_id: proverb.value.id,
    selected_option: optionId,
    is_correct: isCorrect
  })

  if (insertError) {
    console.error('Failed to save guess:', insertError.message)
    const { data: existing } = await client
      .from('guesses')
      .select('selected_option, is_correct')
      .eq('proverb_id', proverb.value.id)
      .eq('user_id', userId)
      .maybeSingle()

    if (existing?.selected_option) {
      selectedOption.value = existing.selected_option
      result.value = existing.is_correct ? 'correct' : 'wrong'
    }
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

watch(() => user.value?.id, async () => {
  if (!proverb.value) return
  resetGuessState()
  setupShuffledOptions()
  await restoreExistingGuess()
})

onMounted(() => {
  window.addEventListener('keydown', handleKeyboardNavigation)
  void initSwipeNavigation()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyboardNavigation)
  if (hammerManager) {
    hammerManager.destroy()
    hammerManager = null
  }
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
      <div v-else class="max-w-7xl  mx-auto space-y-6">
        <!-- Desktop shortcuts -->
        <UCard variant="soft" class="hidden md:block border-primary/20 bg-primary/5">
          <div class="flex items-center justify-between gap-3 flex-wrap text-sm">
            <span class="font-medium text-primary">Desktop shortcuts</span>
            <div class="flex items-center gap-3 text-dimmed">
              <UButton
                variant="ghost"
                color="neutral"
                size="xs"
                class="gap-1.5 cursor-pointer"
                @click="goBack"
              >
                <UKbd value="←" />
                <span>Go back</span>
              </UButton>
              <UButton
                variant="ghost"
                color="neutral"
                size="xs"
                class="gap-1.5 cursor-pointer"
                :loading="navigatingRandom"
                @click="goToRandomProverb"
              >
                <UKbd value="→" />
                <span>Next random</span>
              </UButton>
            </div>
          </div>
        </UCard>

        <div class="flex items-center justify-center gap-3 flex-wrap">
          <CountryBadge :country-code="proverb.country_code" :language-name="proverb.language_name" />
          <span class="text-sm text-dimmed">{{ timeAgo }}</span>
        </div>

        <h1 class="text-2xl sm:text-4xl font-bold text-highlighted leading-snug text-center break-words">
          "{{ proverb.original_text }}"
        </h1>

        <UCard variant="subtle" class="max-w-2xl mx-auto">
          <div class="space-y-1">
            <p class="text-xs font-medium text-muted uppercase tracking-wide">Literal Translation</p>
            <p class="text-lg break-words">"{{ proverb.literal_text }}"</p>
          </div>
        </UCard>

        <UCard class="max-w-2xl mx-auto">
          <div class="space-y-4">
            <p class="text-sm font-medium">What does this proverb actually mean?</p>
            <UAlert
              v-if="!isAuthenticated"
              color="neutral"
              variant="subtle"
              icon="i-lucide-lock"
              title="Sign in to answer"
              description="Answers and progress are saved globally only for signed-in users."
            />

            <div v-if="!hasAnswered" class="grid gap-3">
              <UButton
                v-for="(option, index) in shuffledOptions"
                :key="option.id"
                color="neutral"
                variant="outline"
                size="lg"
                block
                :class="[
                  'text-left justify-start h-auto py-3',
                  !isAuthenticated && index >= 2 ? 'blur-[3px]' : ''
                ]"
                :loading="answering && selectedOption === option.id"
                :disabled="answering || !isAuthenticated"
                @click="submitGuess(option.id)"
              >
                <span class="w-full text-left whitespace-normal break-words leading-snug">
                  {{ option.option_text }}
                </span>
              </UButton>
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

                <p class="text-sm mb-2 break-words">{{ item.option_text }}</p>

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

        <div v-if="hasAnswered" class="md:hidden max-w-2xl mx-auto">
          <div class="space-y-2">
            <p class="text-xs text-dimmed text-center">
              Swipe left to go back
              • Swipe right for next random
            </p>
            <div class="flex flex-row items-center justify-between gap-2">
              <UButton
                variant="subtle"
                color="neutral"
                size="sm"
                class="gap-1.5"
                @click="goBack"
              >
                <UKbd value="←" />
                <span>Go back</span>
              </UButton>
              <UButton
                variant="subtle"
                color="neutral"
                size="sm"
                class="gap-1.5"
                :loading="navigatingRandom"
                @click="goToRandomProverb"
              >
                <UKbd value="→" />
                <span>Next random</span>
              </UButton>
            </div>
          </div>
        </div>

        <!-- Reactions -->
        <div class="pt-4 border-t border-default space-y-3 max-w-2xl mx-auto">
          <div class="flex items-center justify-between gap-3">
            <EmojiReactions :proverb-id="proverb.id" />
            <UButton
              label="Share"
              icon="i-lucide-share-2"
              variant="ghost"
              color="neutral"
              size="xs"
              :loading="sharing"
              @click="shareProverb"
            />
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span v-if="proverb.profiles?.display_name" class="text-sm text-muted">
              Submitted by {{ proverb.profiles.display_name }}
            </span>

            <div class="flex flex-row items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
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
