<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const route = useRoute()
const proverbId = route.params.id as string

const toast = useToast()

const loading = ref(true)
const saving = ref(false)
const loadError = ref<string | null>(null)
const saveError = ref<string | null>(null)

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

const status = ref('pending')
const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Published', value: 'published' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Flagged', value: 'flagged' },
  { label: 'Draft', value: 'draft' }
]

const statusBadgeColor = computed(() => {
  if (status.value === 'pending') return 'warning'
  if (status.value === 'published') return 'success'
  if (status.value === 'rejected' || status.value === 'flagged') return 'error'
  return 'neutral'
})

const countryOptions = countries.map(c => ({ label: c.name, value: c.code }))
const languageOptions = computed(() => languages.map(l => ({ label: l, value: l })))

const selectedCountry = computed(() => countries.find(c => c.code === form.country_code))

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

watch(() => form.country_code, (code) => {
  if (code && !form.language_name) {
    const lang = getCountryLanguage(code)
    if (lang) form.language_name = lang
  }
})

async function fetchProverb() {
  loading.value = true
  loadError.value = null

  try {
    const response = await $fetch<{ proverb: any }>(`/api/manage/proverbs/${proverbId}`)
    const data = response.proverb

    form.country_code = data.country_code
    form.language_name = data.language_name
    form.original_text = data.original_text
    form.literal_text = data.literal_text
    form.meaning_text = data.meaning_text
    status.value = data.status
    const wrongOptions = (data.guess_options || [])
      .filter((option: any) => !option.is_correct)
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .slice(0, 3)
      .map((option: any) => option.option_text)

    form.wrong_option_1 = wrongOptions[0] || ''
    form.wrong_option_2 = wrongOptions[1] || ''
    form.wrong_option_3 = wrongOptions[2] || ''

    useSeoMeta({ title: `Edit Proverb — ${data.original_text}` })
  } catch (e: any) {
    loadError.value = e?.message || 'Failed to load proverb'
  } finally {
    loading.value = false
  }
}

async function saveChanges() {
  if (!isValid.value || saving.value) return

  saving.value = true
  saveError.value = null

  try {
    await $fetch(`/api/manage/proverbs/${proverbId}`, {
      method: 'PATCH' as any,
      body: {
        country_code: form.country_code,
        region: selectedCountry.value?.region || null,
        language_name: form.language_name,
        original_text: form.original_text,
        literal_text: form.literal_text,
        meaning_text: form.meaning_text,
        status: status.value,
        wrong_options: [form.wrong_option_1, form.wrong_option_2, form.wrong_option_3]
      }
    })

    toast.add({
      title: 'Proverb updated',
      description: 'Changes were saved successfully.',
      color: 'success',
      icon: 'i-lucide-check-circle'
    })
  } catch (e: any) {
    saveError.value = e?.data?.message || e?.message || 'Failed to save changes'
    toast.add({
      title: 'Update failed',
      description: saveError.value || 'Failed to save changes',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } finally {
    saving.value = false
  }
}

fetchProverb()
</script>

<template>
  <UPage>
    <UPageBody>
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 class="text-2xl font-bold">Edit Proverb</h1>
            <p class="text-sm text-dimmed">ID: <span class="font-mono">{{ proverbId }}</span></p>
          </div>

          <div class="flex items-center gap-2">
            <USelect
              v-model="status"
              :items="statusOptions"
              value-key="value"
              class="w-36"
            />
            <UBadge :label="status" variant="subtle" :color="statusBadgeColor" />
            <UButton :to="`/manage/moderation`" label="Back to queue" icon="i-lucide-arrow-left" variant="ghost" color="neutral" />
          </div>
        </div>

        <div v-if="loading" class="space-y-4">
          <USkeleton class="h-10 w-full" />
          <USkeleton class="h-24 w-full" />
          <USkeleton class="h-24 w-full" />
        </div>

        <UAlert
          v-else-if="loadError"
          color="error"
          variant="soft"
          title="Could not load proverb"
          :description="loadError || undefined"
        />

        <UCard v-else>
          <form class="space-y-5" @submit.prevent="saveChanges">
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
              <UTextarea v-model="form.original_text" :rows="2" />
            </UFormField>

            <UFormField label="Literal Translation" required>
              <UTextarea v-model="form.literal_text" :rows="2" />
            </UFormField>

            <UFormField label="Actual Meaning" required>
              <UTextarea v-model="form.meaning_text" :rows="3" />
            </UFormField>

            <p class="text-sm text-muted">
              Add 3 fake meanings so players can guess. Make them plausible but wrong.
            </p>

            <UFormField label="Wrong meaning #1" required>
              <UInput v-model="form.wrong_option_1" />
            </UFormField>

            <UFormField label="Wrong meaning #2" required>
              <UInput v-model="form.wrong_option_2" />
            </UFormField>

            <UFormField label="Wrong meaning #3" required>
              <UInput v-model="form.wrong_option_3" />
            </UFormField>

            <p v-if="saveError" class="text-sm text-red-500">{{ saveError }}</p>

            <div class="flex justify-end">
              <UButton
                type="submit"
                label="Save changes"
                icon="i-lucide-save"
                :loading="saving"
                :disabled="!isValid"
              />
            </div>
          </form>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>
