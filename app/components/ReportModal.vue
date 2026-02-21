<script setup lang="ts">
const props = defineProps<{
  proverbId: string
}>()

const open = defineModel<boolean>({ default: false })

const { hasReported, loading, error, submitReport } = useReport(props.proverbId)
const reason = ref('')
const submitted = ref(false)

async function handleSubmit() {
  if (!reason.value.trim()) return
  const success = await submitReport(reason.value.trim())
  if (success) {
    submitted.value = true
  }
}

function close() {
  open.value = false
  setTimeout(() => {
    submitted.value = false
    reason.value = ''
    error.value = null
  }, 300)
}
</script>

<template>
  <UModal v-model:open="open" title="Report Proverb" @close="close">
    <template #body>
      <div v-if="!submitted" class="space-y-4">
        <p class="text-muted text-sm">
          Tell us why this proverb should be reviewed by a moderator.
        </p>

        <UFormField label="Reason">
          <UTextarea
            v-model="reason"
            class="w-full"
            placeholder="e.g. Incorrect translation, offensive content, duplicate..."
            autofocus
            :rows="3"
          />
        </UFormField>

        <p v-if="error" class="text-sm text-red-500">
          {{ error }}
        </p>

        <UButton
          label="Submit report"
          icon="i-lucide-flag"
          color="error"
          block
          :loading="loading"
          :disabled="!reason.trim()"
          @click="handleSubmit"
        />
      </div>

      <div v-else class="text-center space-y-4">
        <UIcon name="i-lucide-check-circle" class="size-12 text-green-500 mx-auto" />
        <h3 class="text-lg font-semibold">Report submitted</h3>
        <p class="text-muted text-sm">
          Thank you. A moderator will review this proverb.
        </p>
        <UButton label="Done" variant="soft" @click="close" />
      </div>
    </template>
  </UModal>
</template>
