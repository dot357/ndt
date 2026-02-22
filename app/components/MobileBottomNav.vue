<script setup lang="ts">
interface NavItem {
  label: string
  to: string
  icon?: string
}

const props = defineProps<{
  items: NavItem[]
  isAuthenticated: boolean
  isAdminOrMod: boolean
}>()

const emit = defineEmits<{
  signOut: []
  signIn: []
}>()

const route = useRoute()
const open = ref(false)

const drawerItems = computed(() => {
  const items = props.items.map(item => ({
    ...item,
    onSelect: () => {
      open.value = false
    }
  }))

  if (props.isAuthenticated && props.isAdminOrMod) {
    items.push({
      label: 'Manage',
      to: '/manage',
      icon: 'i-lucide-shield',
      onSelect: () => {
        open.value = false
      }
    })
  }

  return items
})

const primaryItems = computed(() => props.items.slice(0, 3))

watch(() => route.fullPath, () => {
  open.value = false
})

function handleSignOut() {
  open.value = false
  emit('signOut')
}

function handleSignIn() {
  open.value = false
  emit('signIn')
}
</script>

<template>
  <div class="sm:hidden">
    <USlideover v-model:open="open" side="right" title="Menu">
      <template #body>
        <div class="flex h-full flex-col gap-4">
          <UNavigationMenu
            :items="drawerItems"
            orientation="vertical"
            highlight
            class="w-full"
          />

          <div class="mt-auto border-t border-default pt-4 space-y-2">
            <UButton
              v-if="isAuthenticated"
              to="/profile"
              icon="i-lucide-user-round"
              label="Profile"
              variant="soft"
              color="neutral"
              block
            />

            <UButton
              v-if="isAuthenticated"
              icon="i-lucide-log-out"
              label="Sign out"
              color="error"
              variant="soft"
              block
              @click="handleSignOut"
            />

            <UButton
              v-else
              icon="i-lucide-log-in"
              label="Sign in"
              variant="soft"
              block
              @click="handleSignIn"
            />
          </div>
        </div>
      </template>
    </USlideover>

    <div class="fixed inset-x-0 bottom-0 z-40 border-t border-default bg-default/95 backdrop-blur">
      <div class="mx-auto max-w-7xl grid grid-cols-4 gap-1 px-2 py-2">
        <UButton
          v-for="item in primaryItems"
          :key="item.to"
          :to="item.to"
          :label="item.label"
          :icon="item.icon"
          variant="ghost"
          color="neutral"
          size="sm"
          class="justify-center"
        />

        <UButton
          icon="i-lucide-menu"
          label="Menu"
          variant="ghost"
          color="neutral"
          size="sm"
          class="justify-center"
          @click="open = true"
        />
      </div>
    </div>
  </div>
</template>
