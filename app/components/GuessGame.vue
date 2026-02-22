<script setup lang="ts">
const {
  proverb,
  options,
  selectedOption,
  result,
  loading,
  loadingNext,
  error,
  sessionScore,
  noMore,
  distribution,
  totalProverbs,
  answeredCount,
  submitGuess,
  nextProverb
} = useGuess()

const remainingCount = computed(() => Math.max(totalProverbs.value - answeredCount.value, 0))

function optionColor(optionId: string, isCorrect: boolean) {
  if (!result.value) return 'neutral'
  if (optionId === selectedOption.value) {
    return isCorrect ? 'success' : 'error'
  }
  if (isCorrect) return 'success'
  return 'neutral'
}

function optionVariant(optionId: string, isCorrect: boolean) {
  if (!result.value) return 'outline'
  if (optionId === selectedOption.value || isCorrect) return 'solid'
  return 'outline'
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Score & Progress -->
    <div class="flex items-center justify-center gap-4 text-sm">
      <UBadge color="primary" variant="subtle">
        {{ sessionScore.correct }} / {{ sessionScore.total }} correct
      </UBadge>
      <UBadge v-if="totalProverbs > 0" color="neutral" variant="subtle">
        {{ remainingCount }} remaining
      </UBadge>
    </div>

    <!-- Loading -->
    <div v-if="loadingNext" class="space-y-4">
      <USkeleton class="h-6 w-1/3" />
      <USkeleton class="h-20 w-full" />
      <USkeleton class="h-12 w-full" />
      <USkeleton class="h-12 w-full" />
      <USkeleton class="h-12 w-full" />
      <USkeleton class="h-12 w-full" />
    </div>

    <!-- No more proverbs -->
    <UCard v-else-if="noMore" class="text-center py-8">
      <UIcon name="i-lucide-party-popper" class="size-12 text-primary mx-auto mb-4" />
      <h3 class="text-lg font-semibold mb-2">You've guessed them all!</h3>
      <p class="text-muted mb-4">Come back when new proverbs are submitted.</p>
      <UButton to="/" label="Browse feed" icon="i-lucide-home" />
    </UCard>

    <!-- Error -->
    <UCard v-else-if="error" class="text-center py-8">
      <p class="text-red-500 mb-4">{{ error }}</p>
      <UButton label="Try again" @click="nextProverb" />
    </UCard>

    <!-- Game -->
    <template v-else-if="proverb">
      <UCard>
        <div class="space-y-3">
          <CountryBadge :country-code="proverb.country_code" :language-name="proverb.language_name" />

          <p class="text-xl font-semibold text-highlighted">
            "{{ proverb.original_text }}"
          </p>

          <p class="text-muted">
            Literally: "{{ proverb.literal_text }}"
          </p>
        </div>
      </UCard>

      <p class="text-sm font-medium text-center">What does this proverb actually mean?</p>

      <!-- Option buttons (before answer) -->
      <div v-if="!result" class="grid gap-3">
        <UButton
          v-for="option in options"
          :key="option.id"
          :label="option.option_text"
          color="neutral"
          variant="outline"
          size="lg"
          block
          class="text-left justify-start"
          :loading="loading && selectedOption === option.id"
          :disabled="loading"
          @click="submitGuess(option.id)"
        />
      </div>

      <!-- Distribution bars (after answer) -->
      <div v-if="result && distribution.length > 0" class="grid gap-3">
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
          <!-- Label row -->
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

          <!-- Option text -->
          <p class="text-sm mb-2">{{ item.option_text }}</p>

          <!-- Progress bar -->
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

      <!-- Result feedback (without distribution) -->
      <div v-else-if="result" class="text-center space-y-4">
        <UBadge
          :color="result === 'correct' ? 'success' : 'error'"
          size="lg"
          variant="solid"
        >
          {{ result === 'correct' ? '✓ Correct!' : '✗ Wrong!' }}
        </UBadge>
      </div>

      <!-- Next button -->
      <div v-if="result" class="text-center">
        <UButton
          label="Next proverb"
          icon="i-lucide-arrow-right"
          trailing
          size="lg"
          @click="nextProverb"
        />
      </div>
    </template>
  </div>
</template>
