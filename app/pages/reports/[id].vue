<template>
  <div>
    <!-- En-tête -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <div class="flex items-center gap-1.5 text-sm text-gray-400 mb-4">
        <NuxtLink to="/reports" class="hover:text-gray-600 transition-colors">Rapports mensuels</NuxtLink>
        <span>/</span>
        <span class="text-gray-600 font-medium capitalize">{{ store.currentReport?.monthLabel ?? '…' }}</span>
      </div>

      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 capitalize leading-tight">
            {{ store.currentReport?.monthLabel ?? 'Rapport' }}
          </h1>
          <p v-if="!authStore.isStudent && store.currentReport" class="text-sm text-gray-500 mt-1">
            Étudiant : <span class="font-medium text-gray-700">{{ store.currentReport.studentName }}</span>
          </p>
        </div>

        <div v-if="store.currentReport" class="flex items-center gap-2 flex-shrink-0">
          <ReportStatusBadge :status="store.currentReport.status" />

          <button
            v-if="canValidateAsTrainerOrTutor"
            @click="showValidateModal = true"
            :disabled="store.saving"
            class="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            Valider le rapport
          </button>

        </div>
      </div>
    </div>

    <!-- Bannière erreur -->
    <div
      v-if="store.error && !showValidateModal && !showReopenModal"
      class="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
    >
      <span class="font-medium">Erreur :</span> {{ store.error }}
    </div>

    <!-- Bannière lecture seule -->
    <div
      v-if="store.currentReport && !store.currentReport.editable && authStore.isStudent"
      class="mb-6 flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800"
    >
      Ce rapport est en lecture seule — statut : <strong class="ml-1">{{ STATUS_LABELS[store.currentReport.status] }}</strong>
    </div>

    <!-- Chargement -->
    <div v-if="store.loading" class="space-y-4">
      <div class="h-64 bg-gray-100 rounded-xl animate-pulse" />
      <div class="h-40 bg-gray-100 rounded-xl animate-pulse" />
    </div>

    <template v-else-if="store.currentReport">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Contenu principal (2/3) -->
        <div class="lg:col-span-2 space-y-4">

          <!-- Activités du mois -->
          <div
            v-if="schoolSection?.content || companySection?.content"
            class="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <div class="px-5 py-3.5 border-b border-gray-100">
              <h2 class="text-sm font-semibold text-gray-700">Activités du mois</h2>
            </div>
            <div class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-if="schoolSection?.content" class="border-l-4 border-blue-400 pl-3">
                <p class="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">École</p>
                <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{{ schoolSection.content }}</p>
              </div>
              <div v-if="companySection?.content" class="border-l-4 border-emerald-400 pl-3">
                <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Entreprise</p>
                <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{{ companySection.content }}</p>
              </div>
            </div>
          </div>

          <ReportReportForm
            :sections="store.currentReport.sections"
            :editable="store.canEdit && authStore.isStudent"
            :saving="store.saving"
            :error="store.canEdit && authStore.isStudent ? store.error : null"
            @save="handleSave"
            @validate="handleValidate"
          />
        </div>

        <!-- Sidebar (1/3) -->
        <div class="space-y-4">

          <!-- Retours des encadrants -->
          <div
            v-if="store.currentReport.trainerNote || store.currentReport.tutorNote"
            class="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <div class="px-5 py-3.5 border-b border-gray-100">
              <h2 class="text-sm font-semibold text-gray-700">Retours des encadrants</h2>
            </div>
            <div class="p-4 space-y-4">
              <div v-if="store.currentReport.trainerNote" class="border-l-4 border-indigo-400 pl-3">
                <p class="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">Formateur</p>
                <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{{ store.currentReport.trainerNote }}</p>
              </div>
              <div v-if="store.currentReport.tutorNote" class="border-l-4 border-violet-400 pl-3">
                <p class="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-1">Tuteur entreprise</p>
                <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{{ store.currentReport.tutorNote }}</p>
              </div>
            </div>
          </div>

          <!-- Commentaires internes -->
          <ReportInternalCommentPanel
            v-if="!authStore.isStudent"
            :report-id="reportId"
          />
        </div>
      </div>
    </template>

    <!-- Modal : valider -->
    <div v-if="showValidateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">Valider le rapport</h3>
        <p class="text-sm text-gray-500 mb-5">
          {{ authStore.isTrainer
            ? 'Le rapport sera transmis au tuteur entreprise.'
            : 'Le rapport sera marqué comme terminé.' }}
        </p>
        <textarea
          v-model="validateComment"
          rows="3"
          placeholder="Note pour l'étudiant (optionnel)"
          class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none mb-1"
        />
        <p class="text-xs text-gray-400 mb-4">Visible par l'étudiant après validation</p>
        <div v-if="validateError" class="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ validateError }}</div>
        <div class="flex gap-3">
          <button
            @click="handleValidateConfirm"
            :disabled="store.saving"
            class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
          >
            {{ store.saving ? 'Validation…' : 'Confirmer' }}
          </button>
          <button
            @click="closeValidateModal"
            class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { STATUS_LABELS } from '~/types/report'
import type { SectionUpdate } from '~/types/report'
import { useAuthStore } from '~/stores/auth'
import { useReportStore } from '~/stores/report'

definePageMeta({ middleware: ['auth'] })

const authStore = useAuthStore()
const store = useReportStore()
const route = useRoute()

const reportId = Number(route.params.id)
const showValidateModal = ref(false)
const validateComment = ref('')
const validateError = ref('')

const schoolSection = computed(() => store.currentReport?.sections.find(s => s.sectionType === 'SCHOOL_ACTIVITIES'))
const companySection = computed(() => store.currentReport?.sections.find(s => s.sectionType === 'COMPANY_ACTIVITIES'))

const canValidateAsTrainerOrTutor = computed(() => {
  const status = store.currentReport?.status
  if (!status) return false
  if (authStore.isTrainer) return status === 'STUDENT_VALIDATED' || status === 'AUTO_VALIDATED'
  if (authStore.isTutor)   return status === 'TRAINER_VALIDATED'
  return false
})

onMounted(() => store.fetchReport(reportId))

const handleSave = async (sections: SectionUpdate[]) => {
  await store.saveReport(reportId, sections)
}

const handleValidate = async () => {
  await store.validateReport(reportId, 'student')
}

const handleValidateConfirm = async () => {
  validateError.value = ''
  const role = authStore.isTrainer ? 'trainer' : 'tutor'
  const ok = await store.validateReport(reportId, role, validateComment.value || undefined)
  if (ok) closeValidateModal()
  else validateError.value = store.error ?? 'Erreur lors de la validation'
}

const closeValidateModal = () => {
  showValidateModal.value = false
  validateComment.value = ''
  validateError.value = ''
}

</script>
