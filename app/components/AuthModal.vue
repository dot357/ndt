<script setup lang="ts">
const open = defineModel<boolean>({ default: false })

const client = useSupabaseClient<any>()
const config = useRuntimeConfig()
const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref('')

const redirectUrl = computed(() => {
  if (import.meta.client) {
    return `${window.location.origin}/auth/confirm`
  }
  return '/auth/confirm'
})

async function sendMagicLink() {
  if (!email.value) return

  loading.value = true
  error.value = ''

  const { error: authError } = await client.auth.signInWithOtp({
    email: email.value,
    options: {
      emailRedirectTo: redirectUrl.value
    }
  })

  loading.value = false

  if (authError) {
    error.value = authError.message
  } else {
    sent.value = true
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
  <UModal v-model:open="open" @close="close">
    <template #header>
      <h3 class="text-lg font-semibold">Sign in to NDT</h3>
    </template>

    <div v-if="!sent" class="p-6 space-y-4">
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
        :loading="loading"
        @click="sendMagicLink"
      />
    </div>

    <div v-else class="p-6 text-center space-y-4">
      <UIcon name="i-lucide-mail-check" class="size-12 text-primary mx-auto" />
      <h3 class="text-lg font-semibold">Check your email!</h3>
      <p class="text-muted text-sm">
        We sent a sign-in link to <strong>{{ email }}</strong>. Click the link to sign in.
      </p>
      <UButton label="Done" variant="soft" @click="close" />
    </div>
  </UModal>
</template>
