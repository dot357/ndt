<script setup lang="ts">
const consentStorageKey = 'ndt:analytics-consent'
const consent = ref<'granted' | 'denied' | null>(null)

function readConsent() {
  if (!import.meta.client) return
  const value = localStorage.getItem(consentStorageKey)
  if (value === 'granted' || value === 'denied') {
    consent.value = value
    return
  }
  consent.value = null
}

function setConsent(value: 'granted' | 'denied') {
  if (!import.meta.client) return
  localStorage.setItem(consentStorageKey, value)
  consent.value = value
  window.dispatchEvent(new CustomEvent('ndt:analytics-consent-changed', {
    detail: { status: value }
  }))
}

onMounted(() => {
  readConsent()
})
</script>

<template>
  <div v-if="consent === null" class="fixed inset-x-0 bottom-4 z-50 px-4">
    <UCard class="mx-auto max-w-3xl border border-default shadow-lg">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-muted">
          We use analytics cookies to improve gameplay and product quality.
          You can change this later.
        </p>
        <div class="flex items-center gap-2">
          <UButton label="Decline" color="neutral" variant="soft" @click="setConsent('denied')" />
          <UButton label="Accept analytics" color="primary" @click="setConsent('granted')" />
        </div>
      </div>
    </UCard>
  </div>
</template>
