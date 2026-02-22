<script setup lang="ts">
const open = defineModel<boolean>({ default: false })

const client = useSupabaseClient<any>()
const { getToken } = useCaptcha()
const email = ref('')
const loadingMagicLink = ref(false)
const loadingGoogle = ref(false)
const sent = ref(false)
const error = ref('')

async function sendMagicLink() {
  if (!email.value) return

  loadingMagicLink.value = true
  error.value = ''

  try {
    const captchaToken = await getToken('request_magic_link')

    await $fetch('/api/auth/magic-link', {
      method: 'POST',
      body: {
        email: email.value,
        captchaToken
      }
    })

    sent.value = true
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Failed to send magic link.'
  } finally {
    loadingMagicLink.value = false
  }
}

async function signInWithGoogle() {
  loadingGoogle.value = true
  error.value = ''

  try {
    const redirectTo = import.meta.client ? `${window.location.origin}/auth/confirm` : '/auth/confirm'
    const { error: authError } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    })

    if (authError) {
      error.value = authError.message
    }
  } catch (err: any) {
    error.value = err?.message || 'Failed to start Google sign-in.'
  } finally {
    loadingGoogle.value = false
  }
}

function close() {
  open.value = false
  setTimeout(() => {
    sent.value = false
    email.value = ''
    error.value = ''
  }, 300)
}
</script>

<template>
  <UModal v-model:open="open" title="Sign in to NDT" @close="close">
    <template #body>
      <div v-if="!sent" class="space-y-4">
        <UButton
          label="Continue with Google"
          icon="i-simple-icons-google"
          block
          variant="soft"
          :loading="loadingGoogle"
          @click="signInWithGoogle"
        />

        <div class="relative py-1">
          <div class="border-t border-default" />
          <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-default px-2 text-xs text-muted">
            or
          </span>
        </div>

        <p class="text-muted text-sm">
          Enter your email to receive a magic sign-in link.
        </p>

        <UFormField label="Email">
          <UInput
            v-model="email"
            type="email"
            placeholder="you@example.com"
            icon="i-lucide-mail"
            autofocus
            @keydown.enter="sendMagicLink"
          />
        </UFormField>

        <p v-if="error" class="text-sm text-red-500">
          {{ error }}
        </p>

        <UButton
          label="Send magic link"
          icon="i-lucide-wand-sparkles"
          block
          :loading="loadingMagicLink"
          @click="sendMagicLink"
        />
      </div>

      <div v-else class="text-center space-y-4">
        <UIcon name="i-lucide-mail-check" class="size-12 text-primary mx-auto" />
        <h3 class="text-lg font-semibold">Check your email!</h3>
        <p class="text-muted text-sm">
          We sent a sign-in link to <strong>{{ email }}</strong>. Click the link to sign in.
        </p>
        <UButton label="Done" variant="soft" @click="close" />
      </div>
    </template>
  </UModal>
</template>
