import { createError, type H3Event } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

function getAuthUserId(user: any): string | null {
  return user?.id ?? user?.sub ?? null
}

export async function requireUser(event: H3Event) {
  const user = await serverSupabaseUser(event)
  const userId = getAuthUserId(user)

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized', message: 'Authentication required.' })
  }

  return {
    ...(user || {}),
    id: userId
  }
}

export async function requireAdmin(event: H3Event) {
  const user = await requireUser(event)
  const client = await serverSupabaseClient<any>(event)

  const { data: profile, error } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: error.message })
  }

  if (profile?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden', message: 'Admin access required.' })
  }

  return { user, client }
}

export async function requireAdminOrMod(event: H3Event) {
  const user = await requireUser(event)
  const client = await serverSupabaseClient<any>(event)

  const { data: profile, error } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: error.message })
  }

  if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden', message: 'Moderator access required.' })
  }

  return { user, client, role: profile?.role as 'admin' | 'moderator' }
}

export async function logModAction(
  client: any,
  modId: string,
  action: string,
  targetType: string,
  targetId: string,
  note?: string | null
) {
  const { error } = await client.from('mod_actions').insert({
    mod_id: modId,
    action,
    target_type: targetType,
    target_id: targetId,
    note: note ?? null
  })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: error.message })
  }
}
