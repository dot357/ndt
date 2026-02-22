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
  const reports = ref<ManagedReport[]>([])
  const loading = ref(false)
  const filter = ref<'open' | 'resolved' | 'dismissed'>('open')

  async function fetchReports() {
    loading.value = true

    try {
      const response = await $fetch<{ reports: ManagedReport[] }>('/api/manage/reports', {
        query: { status: filter.value }
      })
      reports.value = response.reports || []
    } catch {
      // Non-critical
    } finally {
      loading.value = false
    }
  }

  async function resolveReport(reportId: string): Promise<boolean> {
    try {
      await $fetch(`/api/manage/reports/${reportId}/resolve`, { method: 'POST' })
      reports.value = reports.value.filter(r => r.id !== reportId)
      return true
    } catch {
      return false
    }
  }

  async function dismissReport(reportId: string): Promise<boolean> {
    try {
      await $fetch(`/api/manage/reports/${reportId}/dismiss`, { method: 'POST' })
      reports.value = reports.value.filter(r => r.id !== reportId)
      return true
    } catch {
      return false
    }
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
