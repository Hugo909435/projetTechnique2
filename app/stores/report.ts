import { defineStore } from 'pinia'
import type { Report, ReportSummary, SectionUpdate } from '~/types/report'

export const useReportStore = defineStore('report', {
  state: () => ({
    reports: [] as ReportSummary[],
    currentReport: null as Report | null,
    pendingReports: [] as ReportSummary[],
    loading: false,
    saving: false,
    error: null as string | null,
  }),

  getters: {
    canEdit:     (state) => state.currentReport?.editable ?? false,
    isDraft:     (state) => state.currentReport?.status === 'DRAFT',
    isReopened:  (state) => state.currentReport?.status === 'REOPENED',
    isCompleted: (state) => state.currentReport?.status === 'COMPLETED',
  },

  actions: {
    async fetchMyReports() {
      this.loading = true
      this.error = null
      try {
        const { reports } = useApi()
        const res = await reports.list()
        this.reports = res.data
      } catch (e: any) {
        this.error = e.response?.data?.message ?? 'Erreur lors du chargement'
      } finally {
        this.loading = false
      }
    },

    async fetchReport(id: number) {
      this.loading = true
      this.error = null
      this.currentReport = null
      try {
        const { reports } = useApi()
        const res = await reports.get(id)
        this.currentReport = res.data
      } catch (e: any) {
        this.error = e.response?.data?.message ?? 'Rapport introuvable'
      } finally {
        this.loading = false
      }
    },

    async fetchStudentReports(studentId: number) {
      this.loading = true
      this.error = null
      try {
        const { reports } = useApi()
        const res = await reports.listForStudent(studentId)
        this.reports = res.data
      } catch (e: any) {
        this.error = e.response?.data?.message ?? 'Erreur lors du chargement'
      } finally {
        this.loading = false
      }
    },

    async createReport(year: number, month: number): Promise<number | null> {
      this.saving = true
      this.error = null
      try {
        const { reports } = useApi()
        const res = await reports.create({ year, month })
        this.currentReport = res.data
        return res.data.id as number
      } catch (e: any) {
        this.error = e.response?.data?.message ?? 'Erreur lors de la création'
        return null
      } finally {
        this.saving = false
      }
    },

    async saveReport(id: number, sections: SectionUpdate[]) {
      this.saving = true
      this.error = null
      try {
        const { reports } = useApi()
        const res = await reports.update(id, { sections })
        this.currentReport = res.data
      } catch (e: any) {
        this.error = e.response?.data?.message ?? 'Erreur lors de la sauvegarde'
      } finally {
        this.saving = false
      }
    },

    async reopenReport(id: number, note?: string) {
      this.saving = true
      this.error = null
      try {
        const { reports } = useApi()
        const res = await reports.reopen(id, note)
        this.currentReport = res.data
      } catch (e: any) {
        this.error = e.response?.data?.message ?? 'Erreur lors de la réouverture'
      } finally {
        this.saving = false
      }
    },

    async validateReport(
      id: number,
      role: 'student' | 'trainer' | 'tutor',
      comment?: string,
    ): Promise<boolean> {
      this.saving = true
      this.error = null
      try {
        const { validation } = useApi()
        let res
        if (role === 'student') res = await validation.validateStudent(id)
        else if (role === 'trainer') res = await validation.validateTrainer(id, comment)
        else res = await validation.validateTutor(id, comment)
        this.currentReport = res.data
        return true
      } catch (e: any) {
        this.error = e.response?.data?.message ?? 'Erreur lors de la validation'
        return false
      } finally {
        this.saving = false
      }
    },

    async fetchPendingReports() {
      this.loading = true
      this.error = null
      try {
        const { validation } = useApi()
        const res = await validation.pending()
        this.pendingReports = res.data
      } catch (e: any) {
        this.error = e.response?.data?.message ?? 'Erreur lors du chargement'
      } finally {
        this.loading = false
      }
    },
  },
})
