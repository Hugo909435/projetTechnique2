export type ReportStatus =
  | 'DRAFT'
  | 'STUDENT_VALIDATED'
  | 'AUTO_VALIDATED'
  | 'TRAINER_VALIDATED'
  | 'TUTOR_VALIDATED'
  | 'COMPLETED'
  | 'REOPENED'

export type SectionType =
  | 'ACTIVITIES'
  | 'SKILLS'
  | 'DIFFICULTIES'
  | 'SOLUTIONS'
  | 'OBJECTIVES'
  | 'FREE_COMMENT'

export interface ReportSection {
  id: number
  sectionType: SectionType
  label: string
  content: string
}

export interface ReportStatusLog {
  fromStatus: ReportStatus | null
  toStatus: ReportStatus
  changedByName: string
  changedAt: string
  note: string | null
}

export interface ReportSummary {
  id: number
  year: number
  month: number
  monthLabel: string
  status: ReportStatus
  studentId: number
  studentName: string
  createdAt: string
  updatedAt: string
}

export interface Report extends ReportSummary {
  editable: boolean
  sections: ReportSection[]
  statusLogs: ReportStatusLog[]
  studentValidatedAt: string | null
  autoValidatedAt: string | null
  trainerValidatedAt: string | null
  tutorValidatedAt: string | null
  completedAt: string | null
}

export interface SectionUpdate {
  sectionType: SectionType
  content: string
}

// ── Constantes d'affichage ─────────────────────────────────────────────────

export const STATUS_LABELS: Record<ReportStatus, string> = {
  DRAFT:             'Brouillon',
  STUDENT_VALIDATED: 'Validé par l\'étudiant',
  AUTO_VALIDATED:    'Validé automatiquement',
  TRAINER_VALIDATED: 'Validé par le formateur',
  TUTOR_VALIDATED:   'Validé par le tuteur',
  COMPLETED:         'Terminé',
  REOPENED:          'Rouvert',
}

export const STATUS_COLORS: Record<ReportStatus, string> = {
  DRAFT:             'bg-gray-100 text-gray-700',
  STUDENT_VALIDATED: 'bg-blue-100 text-blue-700',
  AUTO_VALIDATED:    'bg-yellow-100 text-yellow-700',
  TRAINER_VALIDATED: 'bg-indigo-100 text-indigo-700',
  TUTOR_VALIDATED:   'bg-purple-100 text-purple-700',
  COMPLETED:         'bg-green-100 text-green-700',
  REOPENED:          'bg-orange-100 text-orange-700',
}
