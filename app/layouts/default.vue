<script setup lang="ts">
const user = useSupabaseUser()
const client = useSupabaseClient<any>()
const { isAdminOrMod } = useUserRole()

const navLinks = [
  { label: 'Feed', to: '/', icon: 'i-lucide-flame' },
  { label: 'Play', to: '/play', icon: 'i-lucide-gamepad-2' },
  { label: 'Leaderboard', to: '/leaderboard', icon: 'i-lucide-trophy' }
]

const showAuthModal = ref(false)
const accountMenuItems = computed(() => [[
  {
    label: 'Sign out',
    icon: 'i-lucide-log-out',
    color: 'error',
    onSelect: () => { void signOut() }
  }
]])

async function signOut() {
  await client.auth.signOut()
  navigateTo('/')
}

provide('showAuthModal', showAuthModal)
</script>

<template>
  <div class="min-h-screen flex flex-col ">
    <UHeader class="overflow-hidden">
      <template #left>

        <div class="relative -z-1 opacity-40">
          <div class="absolute left-12 -top-12">
            <Logo class="text-primary size-24" />
          </div>
        </div>
        <NuxtLink to="/" class="flex items-center gap-2 py-4">

          <span class="font-bold text-lg tracking-tight">No Direct Translation</span>
        </NuxtLink>

        <UNavigationMenu :items="navLinks" class="hidden sm:flex" />
      </template>

      <template #right>
        <UColorModeButton />

        <template v-if="user">
          <UButton
            v-if="isAdminOrMod"
            to="/manage"
            icon="i-lucide-shield"
            label="Manage"
            variant="soft"
            color="neutral"
            size="sm"
          />
          <UButton
            to="/submit"
            icon="i-lucide-plus"
            label="Submit"
            size="sm"
          />
          <UDropdownMenu :items="accountMenuItems">
            <UButton
              :label="user.email || 'Account'"
              icon="i-lucide-user"
              trailing-icon="i-lucide-chevron-down"
              variant="ghost"
              color="neutral"
              size="sm"
            />
          </UDropdownMenu>
        </template>
        <template v-else>
          <UButton
            label="Sign in"
            icon="i-lucide-log-in"
            variant="soft"
            size="sm"
            @click="showAuthModal = true"
          />
        </template>
      </template>
    </UHeader>

    <UMain class="flex-1">
      <slot />
    </UMain>

    <UFooter>
      <template #left>
        <Logo class="text-primary size-6" />
        <p class="text-sm text-muted">
          NDT — No Direct Translation · © {{ new Date().getFullYear() }}
        </p>
      </template>
      <template #right>
        <UNavigationMenu
          :items="navLinks"
          class="sm:hidden"
        />
      </template>
    </UFooter>

    <ClientOnly>
      <AuthModal v-model="showAuthModal" />
    </ClientOnly>
  </div>
</template>
