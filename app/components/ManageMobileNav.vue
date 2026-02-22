<script setup lang="ts">
interface NavItem {
  label: string
  to: string
  icon?: string
}

const props = defineProps<{
  items: NavItem[]
  role: string
}>()

const route = useRoute()
const open = ref(false)

const drawerItems = computed(() =>
  props.items.map(item => ({
    ...item,
    onSelect: () => {
      open.value = false
    }
  }))
)

const primaryItems = computed(() => props.items.slice(0, 3))

watch(() => route.fullPath, () => {
  open.value = false
})
</script>

<template>
  <div class="md:hidden">
    <USlideover v-model:open="open" side="right" title="Manage">
      <template #body>
        <div class="flex h-full flex-col gap-4">
          <UNavigationMenu
            :items="drawerItems"
            orientation="vertical"
            highlight
            class="w-full"
          />

          <div class="mt-auto border-t border-default pt-4">
            <div class="flex items-center justify-between gap-2">
              <UBadge :label="role" variant="subtle" size="sm" />
              <UButton
                to="/"
                icon="i-lucide-arrow-left"
                label="Back to site"
                variant="ghost"
                color="neutral"
                size="sm"
              />
            </div>
          </div>
        </div>
      </template>
    </USlideover>

    <div class="fixed inset-x-0 bottom-0 z-40 border-t border-default bg-default/95 backdrop-blur">
      <div class="grid grid-cols-4 gap-1 px-2 py-2">
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
