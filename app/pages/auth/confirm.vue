<script setup lang="ts">
const user = useSupabaseUser()

const pendingConsentStorageKey = 'ndt:pending_profile_consent'
const isSavingConsent = ref(false)

async function persistPendingConsent() {
  if (!import.meta.client || isSavingConsent.value) return
  const raw = localStorage.getItem(pendingConsentStorageKey)
  if (!raw) return

  let parsed: {
    marketing_updates_opt_in?: boolean
    terms_accepted_at?: string | null
    privacy_accepted_at?: string | null
  } | null = null

  try {
    parsed = JSON.parse(raw)
  } catch {
    localStorage.removeItem(pendingConsentStorageKey)
    return
  }

  if (!parsed) {
    localStorage.removeItem(pendingConsentStorageKey)
    return
  }

  isSavingConsent.value = true
  try {
    await $fetch('/api/profile/preferences', {
      method: 'POST',
      body: parsed
    })
    localStorage.removeItem(pendingConsentStorageKey)
  } catch {
    // Ignore non-critical preference persistence failures.
  } finally {
    isSavingConsent.value = false
  }
}

watchEffect(() => {
  if (user.value) {
    void persistPendingConsent().finally(() => {
      navigateTo('/')
    })
  }
})
</script>

<template>
  <UPage>
    <UPageBody>
      <div class="flex items-center justify-center min-h-[50vh]">
        <div class="text-center space-y-4">
          <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-primary mx-auto" />
          <p class="text-muted">Confirming your sign-in...</p>
        </div>
      </div>
    </UPageBody>
  </UPage>
</template>
