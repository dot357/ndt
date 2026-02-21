interface ManagedReport {
  id: string
  reason: string
  status: string
  created_at: string
  reporter: { display_name: string | null } | null
  proverb: {
    id: string
    original_text: string
    literal_text: string
    country_code: string
    language_name: string
  } | null
}

export function useManageReports() {
  const client = useSupabaseClient<any>()
  const user = useSupabaseUser()

  const reports = ref<ManagedReport[]>([])
  const loading = ref(false)
  const filter = ref<'open' | 'resolved' | 'dismissed'>('open')

  function getUserId(): string | null {
    return user.value?.id ?? (user.value as any)?.sub ?? null
  }

  async function fetchReports() {
    loading.value = true

    try {
      const { data, error } = await client
        .from('reports')
        .select('id, reason, status, created_at, reporter:reporter_id(display_name), proverb:proverb_id(id, original_text, literal_text, country_code, language_name)')
        .eq('status', filter.value)
        .order('created_at', { ascending: false })

      if (error) throw error
      reports.value = (data || []) as unknown as ManagedReport[]
    } catch {
      // Non-critical
    } finally {
      loading.value = false
    }
  }

  async function resolveReport(reportId: string): Promise<boolean> {
    const uid = getUserId()
    if (!uid) return false

    try {
      // Find the report to get the proverb ID
      const report = reports.value.find(r => r.id === reportId)

      // Flag the reported proverb (remove from public feed)
      if (report?.proverb?.id) {
        await client
          .from('proverbs')
          .update({ status: 'flagged' })
          .eq('id', report.proverb.id)
      }

      const { error } = await client
        .from('reports')
        .update({ status: 'resolved', resolved_by: uid })
        .eq('id', reportId)

      if (error) throw error

      await logAction('resolve_report', 'report', reportId)
      reports.value = reports.value.filter(r => r.id !== reportId)
      return true
    } catch {
      return false
    }
  }

  async function dismissReport(reportId: string): Promise<boolean> {
    const uid = getUserId()
    if (!uid) return false

    try {
      const { error } = await client
        .from('reports')
        .update({ status: 'dismissed', resolved_by: uid })
        .eq('id', reportId)

      if (error) throw error

      await logAction('dismiss_report', 'report', reportId)
      reports.value = reports.value.filter(r => r.id !== reportId)
      return true
    } catch {
      return false
    }
  }

  async function logAction(action: string, targetType: string, targetId: string) {
    const uid = getUserId()
    if (!uid) return
    await client.from('mod_actions').insert({
      mod_id: uid,
      action,
      target_type: targetType,
      target_id: targetId
    })
  }

  fetchReports()

  watch(filter, () => fetchReports())

  return {
    reports,
    loading,
    filter,
    fetchReports,
    resolveReport,
    dismissReport
  }
}
