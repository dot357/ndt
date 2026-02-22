<script setup lang="ts">
const user = useSupabaseUser()
const route = useRoute()
const showAuthModal = inject<Ref<boolean> | undefined>('showAuthModal', undefined)

const pendingConsentStorageKey = 'ndt:pending_profile_consent'
const isSavingConsent = ref(false)

function getQueryValue(key: string) {
  const raw = route.query[key]
  if (typeof raw === 'string') return raw
  if (Array.isArray(raw) && typeof raw[0] === 'string') return raw[0]
  return ''
}

function decodeQueryValue(value: string) {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '))
  } catch {
    return value
  }
}

const callbackError = computed(() => getQueryValue('error'))
const callbackErrorCode = computed(() => getQueryValue('error_code'))
const callbackErrorDescription = computed(() => decodeQueryValue(getQueryValue('error_description')))
const hasCallbackError = computed(() => !!callbackError.value || !!callbackErrorCode.value)

const callbackErrorMessage = computed(() => {
  if (!hasCallbackError.value) return ''

  if (callbackErrorCode.value === 'otp_expired') {
    return 'This sign-in link has expired or was already used. Please request a new magic link.'
  }

  return callbackErrorDescription.value || 'Sign-in could not be completed. Please try again.'
})

async function signInAgain() {
  await navigateTo('/')
  if (showAuthModal && typeof showAuthModal.value === 'boolean') {
    showAuthModal.value = true
  }
}

async function consumeConsentFromToken() {
  if (!import.meta.client || isSavingConsent.value) return
  const consentToken = typeof route.query.consent_token === 'string' ? route.query.consent_token : ''
  if (!consentToken) return

  isSavingConsent.value = true
  try {
    await $fetch('/api/profile/preferences/consume', {
      method: 'POST',
      body: { consentToken }
    })
  } catch {
    // Ignore non-critical consent persistence failures.
  } finally {
    isSavingConsent.value = false
  }
}

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
    const body: {
      marketing_updates_opt_in?: boolean
      terms_accepted_at?: string | null
      privacy_accepted_at?: string | null
    } = {
      terms_accepted_at: parsed.terms_accepted_at,
      privacy_accepted_at: parsed.privacy_accepted_at
    }

    // Never downgrade opt-in during sign-in flows; profile settings handles explicit opt-out.
    if (parsed.marketing_updates_opt_in) {
      body.marketing_updates_opt_in = true
    }

    await $fetch('/api/profile/preferences', {
      method: 'POST',
      body
    })
    localStorage.removeItem(pendingConsentStorageKey)
  } catch {
    // Ignore non-critical preference persistence failures.
  } finally {
    isSavingConsent.value = false
  }
}

watchEffect(() => {
  if (hasCallbackError.value) return

  if (user.value) {
    void consumeConsentFromToken()
      .then(() => persistPendingConsent())
      .finally(() => {
      navigateTo('/')
    })
  }
})
</script>

<template>
  <UPage>
    <UPageBody>
      <div class="flex items-center justify-center min-h-[50vh]">
        <div v-if="hasCallbackError" class="text-center space-y-4 max-w-md">
          <UIcon name="i-lucide-circle-alert" class="size-8 text-error mx-auto" />
          <p class="font-medium">
            Sign-in link issue
          </p>
          <p class="text-muted">
            {{ callbackErrorMessage }}
          </p>
          <div class="flex items-center justify-center gap-2">
            <UButton
              label="Back to home"
              variant="soft"
              icon="i-lucide-house"
              @click="navigateTo('/')"
            />
            <UButton
              label="Sign in again"
              icon="i-lucide-log-in"
              @click="signInAgain"
            />
          </div>
        </div>

        <div v-else class="text-center space-y-4">
          <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-primary mx-auto" />
          <p class="text-muted">Confirming your sign-in...</p>
        </div>
      </div>
    </UPageBody>
  </UPage>
</template>
