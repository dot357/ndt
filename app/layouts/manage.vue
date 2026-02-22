<script setup lang="ts">
const { role, isAdmin } = useUserRole()

const navItems = computed(() => {
  const items = [
    { label: 'Dashboard', to: '/manage', icon: 'i-lucide-layout-dashboard' },
    { label: 'Moderation', to: '/manage/moderation', icon: 'i-lucide-shield-check' },
    { label: 'Reports', to: '/manage/reports', icon: 'i-lucide-flag' }
  ]
  if (isAdmin.value) {
    items.splice(1, 0, { label: 'Users', to: '/manage/users', icon: 'i-lucide-users' })
  }
  return items
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <div class="hidden md:block">
      <UHeader>
        <template #left>
          <NuxtLink to="/manage" class="flex items-center gap-2">
            <UIcon name="i-lucide-shield" class="text-primary size-6" />
            <span class="font-bold text-lg tracking-tight">NDT Admin</span>
          </NuxtLink>
        </template>

        <template #right>
          <UBadge :label="role" variant="subtle" size="sm" />
          <UButton
            to="/"
            icon="i-lucide-arrow-left"
            label="Back to site"
            variant="ghost"
            color="neutral"
            size="sm"
          />
        </template>
      </UHeader>
    </div>

    <div class="flex flex-1 w-full md:max-w-7xl md:mx-auto">
      <!-- Sidebar -->
      <aside class="w-56 shrink-0 border-r border-default p-4 hidden md:block">
        <nav class="space-y-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accented"
            active-class="bg-primary/10 text-primary font-medium"
          >
            <UIcon :name="item.icon" class="size-4" />
            {{ item.label }}
          </NuxtLink>
        </nav>
      </aside>

      <!-- Content -->
      <main class="flex-1 w-full p-4 md:p-6 pb-24 md:pb-6 md:max-w-5xl">
        <slot />
      </main>
    </div>

    <ManageMobileNav :items="navItems" :role="role" />
  </div>
</template>
