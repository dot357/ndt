<script setup lang="ts">
const { submit, loading, error } = useSubmitProverb()
const toast = useToast()

const form = reactive({
  country_code: '',
  language_name: '',
  original_text: '',
  literal_text: '',
  meaning_text: '',
  wrong_option_1: '',
  wrong_option_2: '',
  wrong_option_3: ''
})

const countryOptions = countries.map(c => ({
  label: c.name,
  value: c.code
}))

const languageOptions = computed(() =>
  languages.map(l => ({ label: l, value: l }))
)

const selectedCountry = computed(() =>
  countries.find(c => c.code === form.country_code)
)

// Auto-fill language when country changes
watch(() => form.country_code, (code) => {
  if (code) {
    const lang = getCountryLanguage(code)
    if (lang) form.language_name = lang
  }
})

const isValid = computed(() =>
  form.country_code
  && form.language_name
  && form.original_text
  && form.literal_text
  && form.meaning_text
  && form.wrong_option_1
  && form.wrong_option_2
  && form.wrong_option_3
)

async function handleSubmit() {
  if (!isValid.value) return

  const id = await submit({
    country_code: form.country_code,
    region: selectedCountry.value?.region || '',
    language_name: form.language_name,
    original_text: form.original_text,
    literal_text: form.literal_text,
    meaning_text: form.meaning_text,
    wrong_options: [form.wrong_option_1, form.wrong_option_2, form.wrong_option_3]
  })

  if (id) {
    toast.add({ title: 'Proverb submitted!', color: 'success', icon: 'i-lucide-check-circle' })
    navigateTo(`/p/${id}`)
  }
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UFormField label="Country" required>
        <USelectMenu
          v-model="form.country_code"
          :items="countryOptions"
          value-key="value"
          placeholder="Search for a country..."
        />
      </UFormField>

      <UFormField label="Language" required>
        <USelectMenu
          v-model="form.language_name"
          :items="languageOptions"
          value-key="value"
          placeholder="Search for a language..."
          create-item
        />
      </UFormField>
    </div>

    <UFormField label="Original Proverb" required>
      <UTextarea
        v-model="form.original_text"
        placeholder="The proverb in its original language"
        :rows="2"
      />
    </UFormField>

    <UFormField label="Literal Translation" required>
      <UTextarea
        v-model="form.literal_text"
        placeholder="What it literally translates to in English (the funny part!)"
        :rows="2"
      />
    </UFormField>

    <USeparator label="Guess Game Options" />

    <UFormField label="Actual Meaning (correct answer)" required>
      <UTextarea
        v-model="form.meaning_text"
        placeholder="What the proverb actually means"
        :rows="2"
      />
    </UFormField>

    <p class="text-sm text-muted">
      Add 3 fake meanings so players can guess. Make them plausible but wrong!
    </p>

    <UFormField label="Wrong meaning #1" required>
      <UInput v-model="form.wrong_option_1" placeholder="A plausible but wrong meaning" />
    </UFormField>

    <UFormField label="Wrong meaning #2" required>
      <UInput v-model="form.wrong_option_2" placeholder="Another wrong meaning" />
    </UFormField>

    <UFormField label="Wrong meaning #3" required>
      <UInput v-model="form.wrong_option_3" placeholder="One more wrong meaning" />
    </UFormField>

    <p v-if="error" class="text-sm text-red-500">
      {{ error }}
    </p>

    <UButton
      type="submit"
      label="Submit Proverb"
      icon="i-lucide-send"
      size="lg"
      block
      :loading="loading"
      :disabled="!isValid"
    />
  </form>
</template>
