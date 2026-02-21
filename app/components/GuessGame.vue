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
  submitGuess,
  nextProverb
} = useGuess()

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
    <!-- Score -->
    <div class="flex items-center justify-center gap-4 text-sm">
      <UBadge color="primary" variant="subtle">
        {{ sessionScore.correct }} / {{ sessionScore.total }} correct
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

      <div class="grid gap-3">
        <UButton
          v-for="option in options"
          :key="option.id"
          :label="option.option_text"
          :color="optionColor(option.id, option.is_correct)"
          :variant="optionVariant(option.id, option.is_correct)"
          size="lg"
          block
          class="text-left justify-start"
          :disabled="!!result"
          @click="submitGuess(option.id)"
        />
      </div>

      <!-- Result feedback -->
      <div v-if="result" class="text-center space-y-4">
        <UBadge
          :color="result === 'correct' ? 'success' : 'error'"
          size="lg"
          variant="solid"
        >
          {{ result === 'correct' ? '✓ Correct!' : '✗ Wrong!' }}
        </UBadge>

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
