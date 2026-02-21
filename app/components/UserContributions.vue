<script setup lang="ts">
defineProps<{ userId: string }>()
</script>

<template>
  <div class="border-t border-default pt-3">
    <ManageProverbsTable :user-id="userId" />
  </div>
</template>
