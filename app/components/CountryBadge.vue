<script setup lang="ts">
const props = defineProps<{
  countryCode: string
  languageName?: string
}>()

const countryName = computed(() => getCountryName(props.countryCode))
const flagIcon = computed(() => `i-circle-flags-${props.countryCode.toLowerCase()}`)
</script>

<template>
  <UBadge variant="subtle" color="neutral" class="gap-1.5">
    <UIcon :name="flagIcon" class="size-4 rounded-full" />
    <span>{{ languageName || countryName }}</span>
  </UBadge>
</template>
