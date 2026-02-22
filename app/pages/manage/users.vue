<script setup lang="ts">
definePageMeta({ layout: 'manage', middleware: 'admin' })

useSeoMeta({ title: 'Users — NDT Admin' })

const { isAdmin } = useUserRole()
const { users, loading, search, statusFilter, fetchUsers, banUser, unbanUser, changeRole } = useManageUsers()

const actionLoading = ref<string | null>(null)
const expandedUser = ref<string | null>(null)
const statusOptions = [
  { label: 'Unbanned', value: 'active' },
  { label: 'Banned', value: 'banned' }
]

// Redirect non-admins
if (!isAdmin.value) {
  navigateTo('/manage')
}

function toggleContributions(userId: string) {
  expandedUser.value = expandedUser.value === userId ? null : userId
}

async function handleBan(userId: string) {
  actionLoading.value = userId
  await banUser(userId)
  actionLoading.value = null
}

async function handleUnban(userId: string) {
  actionLoading.value = userId
  await unbanUser(userId)
  actionLoading.value = null
}

async function handleRoleChange(userId: string, newRole: string) {
  actionLoading.value = userId
  await changeRole(userId, newRole)
  actionLoading.value = null
}

function debouncedSearch() {
  fetchUsers()
}

function updateStatusFilter(values: string[]) {
  statusFilter.value = values.filter(v => v === 'active' || v === 'banned')
  fetchUsers()
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Users</h1>
      <UBadge :label="`${users.length} total`" variant="subtle" />
    </div>

    <UCard>
      <div class="space-y-4">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-3 flex-wrap">
            <UInput
              v-model="search"
              placeholder="Search by name..."
              icon="i-lucide-search"
              class="w-full sm:w-64"
              @update:model-value="debouncedSearch"
            />
            <USelectMenu
              :model-value="statusFilter"
              :items="statusOptions"
              value-key="value"
              multiple
              placeholder="Status"
              class="w-full sm:w-52"
              @update:model-value="updateStatusFilter"
            />
          </div>
          <span class="text-xs text-dimmed">
            {{ users.length }} user{{ users.length === 1 ? '' : 's' }}
          </span>
        </div>

        <div v-if="loading" class="space-y-2 py-2">
          <USkeleton class="h-8 w-full" />
          <USkeleton class="h-8 w-full" />
        </div>

        <div v-else-if="users.length === 0" class="text-center py-8 text-muted">
          No users found.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs text-muted uppercase tracking-wide border-b border-default">
                <th class="pb-2 pr-3 font-medium">User</th>
                <th class="pb-2 pr-3 font-medium">Joined</th>
                <th class="pb-2 pr-3 font-medium">Role</th>
                <th class="pb-2 pr-3 font-medium">Status</th>
                <th class="pb-2 pr-3 font-medium">Change Role</th>
                <th class="pb-2 pr-3 font-medium">Contributions</th>
                <th class="pb-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="u in users" :key="u.id">
                <tr class="border-b border-default">
                  <td class="py-2 pr-3">
                    <div class="flex items-center gap-2 min-w-0">
                      <UIcon name="i-lucide-user-circle" class="size-5 text-muted shrink-0" />
                      <span class="truncate font-medium">{{ u.display_name || 'Anonymous' }}</span>
                    </div>
                  </td>
                  <td class="py-2 pr-3 text-xs text-dimmed whitespace-nowrap">
                    {{ formatDate(u.created_at) }}
                  </td>
                  <td class="py-2 pr-3">
                    <UBadge
                      :label="u.role"
                      :color="u.role === 'admin' ? 'primary' : u.role === 'moderator' ? 'info' : 'neutral'"
                      variant="subtle"
                      size="sm"
                    />
                  </td>
                  <td class="py-2 pr-3">
                    <UBadge
                      :label="u.banned_at ? 'Banned' : 'Active'"
                      :color="u.banned_at ? 'error' : 'success'"
                      variant="subtle"
                      size="sm"
                    />
                  </td>
                  <td class="py-2 pr-3">
                    <USelect
                      :model-value="u.role"
                      :items="['user', 'moderator', 'admin']"
                      size="xs"
                      class="w-32"
                      :disabled="actionLoading === u.id"
                      @update:model-value="(val: string) => handleRoleChange(u.id, val)"
                    />
                  </td>
                  <td class="py-2 pr-3">
                    <UButton
                      label="Contributions"
                      icon="i-lucide-book-open"
                      variant="soft"
                      color="neutral"
                      size="xs"
                      @click="toggleContributions(u.id)"
                    />
                  </td>
                  <td class="py-2 text-right">
                    <UButton
                      v-if="u.banned_at"
                      label="Unban"
                      icon="i-lucide-shield-off"
                      variant="soft"
                      color="success"
                      size="xs"
                      :loading="actionLoading === u.id"
                      @click="handleUnban(u.id)"
                    />
                    <UButton
                      v-else
                      label="Ban"
                      icon="i-lucide-ban"
                      variant="soft"
                      color="error"
                      size="xs"
                      :loading="actionLoading === u.id"
                      @click="handleBan(u.id)"
                    />
                  </td>
                </tr>

                <tr v-if="expandedUser === u.id" class="border-b border-default">
                  <td colspan="7" class="py-3">
                    <UserContributions :user-id="u.id" />
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </UCard>
  </div>
</template>
