<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const user = useSupabaseUser()
const client = useSupabaseClient<any>()

const loadingLink = ref(false)
const loadingUnlink = ref(false)
const error = ref('')
const success = ref('')

const identities = ref<any[]>([])
const providers = ref<string[]>([])

const googleIdentity = computed(() => identities.value.find(identity => identity?.provider === 'google') || null)
const isGoogleLinked = computed(() => !!googleIdentity.value || providers.value.includes('google'))

async function refreshAuthData() {
  const { data, error: userError } = await client.auth.getUser()
  if (userError) {
    error.value = userError.message
    return
  }

  const authUser = data.user as any
  identities.value = (authUser?.identities || []) as any[]
  providers.value = (authUser?.app_metadata?.providers || []) as string[]
}

async function linkGoogle() {
  loadingLink.value = true
  error.value = ''
  success.value = ''

  try {
    const redirectTo = import.meta.client ? `${window.location.origin}/auth/confirm` : '/auth/confirm'
    const auth = client.auth as any

    if (typeof auth.linkIdentity === 'function') {
      const { data, error: linkError } = await auth.linkIdentity({
        provider: 'google',
        options: { redirectTo }
      })

      if (linkError) throw linkError
      if (data?.url && import.meta.client) {
        window.location.assign(data.url)
        return
      }
    } else {
      const { error: oauthError } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      })

      if (oauthError) throw oauthError
    }
  } catch (err: any) {
    error.value = err?.message || 'Unable to connect Google account.'
  } finally {
    loadingLink.value = false
  }
}

async function unlinkGoogle() {
  loadingUnlink.value = true
  error.value = ''
  success.value = ''

  try {
    const auth = client.auth as any
    if (typeof auth.unlinkIdentity !== 'function') {
      throw new Error('This Supabase client version does not support unlinking identities.')
    }

    if (!googleIdentity.value) {
      throw new Error('No linked Google identity found.')
    }

    const { error: unlinkError } = await auth.unlinkIdentity(googleIdentity.value)
    if (unlinkError) throw unlinkError

    await refreshAuthData()
    success.value = 'Google account unlinked.'
  } catch (err: any) {
    error.value = err?.message || 'Unable to unlink Google account.'
  } finally {
    loadingUnlink.value = false
  }
}

watch(
  () => user.value?.id,
  () => {
    void refreshAuthData()
  },
  { immediate: true }
)
</script>

<template>
  <UPage>
    <UPageBody class="max-w-2xl">
      <div class="space-y-6">
        <div>
          <h1 class="text-2xl font-semibold">Profile</h1>
          <p class="text-muted mt-1">
            Manage your sign-in methods.
          </p>
        </div>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="font-medium">Account</p>
                <p class="text-sm text-muted">
                  {{ user?.email }}
                </p>
              </div>
            </div>
          </template>

          <div class="space-y-4">
            <div class="flex items-center justify-between gap-3 rounded-lg border border-default p-4">
              <div>
                <p class="font-medium">Google</p>
                <p class="text-sm text-muted">
                  {{ isGoogleLinked ? 'Connected' : 'Not connected' }}
                </p>
              </div>

              <UButton
                v-if="!isGoogleLinked"
                icon="i-simple-icons-google"
                label="Connect"
                :loading="loadingLink"
                @click="linkGoogle"
              />

              <UButton
                v-else
                icon="i-lucide-unlink"
                label="Unlink"
                color="error"
                variant="soft"
                :loading="loadingUnlink"
                @click="unlinkGoogle"
              />
            </div>

            <p v-if="error" class="text-sm text-error">
              {{ error }}
            </p>

            <p v-if="success" class="text-sm text-success">
              {{ success }}
            </p>
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>
