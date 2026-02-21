<script setup lang="ts">
definePageMeta({ layout: 'manage', middleware: 'admin' })

useSeoMeta({ title: 'Users — NDT Admin' })

const { isAdmin } = useUserRole()
const { users, loading, search, fetchUsers, banUser, unbanUser, changeRole, fetchUserProverbs } = useManageUsers()

const actionLoading = ref<string | null>(null)
const expandedUser = ref<string | null>(null)
const userProverbs = ref<any[]>([])
const proverbsLoading = ref(false)

// Redirect non-admins
if (!isAdmin.value) {
  navigateTo('/manage')
}

async function toggleContributions(userId: string) {
  if (expandedUser.value === userId) {
    expandedUser.value = null
    userProverbs.value = []
    return
  }

  expandedUser.value = userId
  proverbsLoading.value = true
  userProverbs.value = await fetchUserProverbs(userId)
  proverbsLoading.value = false
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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const statusColor: Record<string, string> = {
  published: 'text-success',
  pending: 'text-warning',
  rejected: 'text-error',
  flagged: 'text-error',
  draft: 'text-muted'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Users</h1>
      <UBadge :label="`${users.length} total`" variant="subtle" />
    </div>

    <!-- Search -->
    <UInput
      v-model="search"
      placeholder="Search by name..."
      icon="i-lucide-search"
      @update:model-value="debouncedSearch"
    />

    <!-- Loading -->
    <div v-if="loading" class="space-y-3">
      <USkeleton v-for="i in 5" :key="i" class="h-16 w-full" />
    </div>

    <!-- User list -->
    <div v-else class="space-y-2">
      <div v-if="users.length === 0" class="text-center py-8 text-muted">
        No users found.
      </div>

      <UCard v-for="u in users" :key="u.id">
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-4 flex-wrap">
            <div class="flex items-center gap-3 min-w-0">
              <UIcon name="i-lucide-user-circle" class="size-8 text-muted shrink-0" />
              <div class="min-w-0">
                <p class="font-medium truncate">{{ u.display_name || 'Anonymous' }}</p>
                <p class="text-xs text-dimmed">Joined {{ formatDate(u.created_at) }}</p>
              </div>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <!-- Role badge -->
              <UBadge
                :label="u.role"
                :color="u.role === 'admin' ? 'primary' : u.role === 'moderator' ? 'info' : 'neutral'"
                variant="subtle"
                size="sm"
              />

              <!-- Banned badge -->
              <UBadge v-if="u.banned_at" label="Banned" color="error" variant="subtle" size="sm" />

              <!-- Role change -->
              <USelect
                :model-value="u.role"
                :items="['user', 'moderator', 'admin']"
                size="xs"
                class="w-28"
                :disabled="actionLoading === u.id"
                @update:model-value="(val: string) => handleRoleChange(u.id, val)"
              />

              <!-- Contributions -->
              <UButton
                label="Contributions"
                icon="i-lucide-book-open"
                variant="soft"
                color="neutral"
                size="xs"
                @click="toggleContributions(u.id)"
              />

              <!-- Ban/Unban -->
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
            </div>
          </div>

          <!-- Expanded contributions -->
          <div v-if="expandedUser === u.id" class="border-t border-default pt-3">
            <div v-if="proverbsLoading" class="space-y-2 py-2">
              <USkeleton class="h-8 w-full" />
              <USkeleton class="h-8 w-full" />
            </div>

            <div v-else-if="userProverbs.length === 0" class="text-sm text-muted py-2">
              No proverbs submitted.
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left text-xs text-muted uppercase tracking-wide border-b border-default">
                    <th class="pb-2 pr-3 font-medium">ID</th>
                    <th class="pb-2 pr-3 font-medium">Proverb</th>
                    <th class="pb-2 pr-3 font-medium">Language</th>
                    <th class="pb-2 pr-3 font-medium">Status</th>
                    <th class="pb-2 pr-3 font-medium">Reactions</th>
                    <th class="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in userProverbs" :key="p.id" class="border-b border-default last:border-0">
                    <td class="py-2 pr-3">
                      <NuxtLink :to="`/p/${p.id}`" class="text-primary hover:underline font-mono text-xs">
                        {{ p.id.slice(0, 8) }}...
                      </NuxtLink>
                    </td>
                    <td class="py-2 pr-3 max-w-xs truncate">"{{ p.original_text }}"</td>
                    <td class="py-2 pr-3">
                      <CountryBadge :country-code="p.country_code" :language-name="p.language_name" />
                    </td>
                    <td class="py-2 pr-3">
                      <span class="font-medium text-xs" :class="statusColor[p.status] || 'text-muted'">
                        {{ p.status }}
                      </span>
                    </td>
                    <td class="py-2 pr-3 tabular-nums">{{ p.vote_count }}</td>
                    <td class="py-2 text-xs text-dimmed whitespace-nowrap">{{ formatDate(p.created_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
