export type ReportStatus =
  | 'DRAFT'
  | 'STUDENT_VALIDATED'
  | 'AUTO_VALIDATED'
  | 'TRAINER_VALIDATED'
  | 'TUTOR_VALIDATED'
  | 'COMPLETED'

export type SectionType =
  | 'SCHOOL_ACTIVITIES'
  | 'COMPANY_ACTIVITIES'
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
  schoolActivitiesPreview: string | null
  companyActivitiesPreview: string | null
  createdAt: string
  updatedAt: string
}

export interface Report extends ReportSummary {
  editable: boolean
  studentCanEditAndReset: boolean
  sections: ReportSection[]
  statusLogs: ReportStatusLog[]
  studentValidatedAt: string | null
  autoValidatedAt: string | null
  trainerValidatedAt: string | null
  tutorValidatedAt: string | null
  completedAt: string | null
  trainerNote: string | null
  tutorNote: string | null
}

export interface SectionUpdate {
  sectionType: SectionType
  content: string
}

// ── Constantes d'affichage ─────────────────────────────────────────────────

export const STATUS_LABELS: Record<ReportStatus, string> = {
  DRAFT:             'Brouillon',
  STUDENT_VALIDATED: 'À vérifier par le tuteur',
  AUTO_VALIDATED:    'À vérifier par le tuteur',
  TUTOR_VALIDATED:   'À vérifier par le formateur',
  TRAINER_VALIDATED: 'Terminé',
  COMPLETED:         'Terminé',
}

export const SECTION_LABELS: Record<SectionType, string> = {
  SCHOOL_ACTIVITIES:  'Activités réalisées à l\'école',
  COMPANY_ACTIVITIES: 'Activités réalisées en entreprise',
  FREE_COMMENT:       'Commentaire libre',
}

export const STATUS_COLORS: Record<ReportStatus, string> = {
  DRAFT:             'bg-gray-100 text-gray-500',
  STUDENT_VALIDATED: 'bg-orange-100 text-orange-700',
  AUTO_VALIDATED:    'bg-orange-100 text-orange-700',
  TUTOR_VALIDATED:   'bg-indigo-100 text-indigo-700',
  TRAINER_VALIDATED: 'bg-green-600 text-white',
  COMPLETED:         'bg-green-600 text-white',
}
