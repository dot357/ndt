<script setup lang="ts">
const user = useSupabaseUser()

watchEffect(() => {
  if (user.value) {
    navigateTo('/')
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
