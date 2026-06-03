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
          <p v-if="!isStudent && store.currentReport" class="text-sm text-gray-500 mt-1">
            Étudiant : <span class="font-medium text-gray-700">{{ store.currentReport.studentName }}</span>
          </p>
        </div>

        <div v-if="store.currentReport" class="flex items-center gap-2 flex-shrink-0">
          <ReportStatusBadge :status="store.currentReport.status" />

          <!-- Valider (formateur / tuteur) -->
          <button
            v-if="canValidateAsTrainerOrTutor"
            @click="showValidateModal = true"
            :disabled="store.saving"
            class="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            Valider le rapport
          </button>

          <!-- Modifier + Valider (étudiant, DRAFT) -->
          <template v-if="store.currentReport?.editable && isOwner && !editMode">
            <button
              @click="editMode = true"
              class="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
              </svg>
              Modifier
            </button>
            <button
              @click="handleValidate"
              :disabled="store.saving"
              class="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Valider
            </button>
          </template>

          <!-- Modifier (étudiant, rapport déjà validé — avec reset) -->
          <button
            v-if="canEditAndResetValue && isOwner && !editMode"
            @click="showResetConfirmModal = true"
            class="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
            </svg>
            Modifier le rapport
          </button>

        </div>
      </div>
    </div>

    <!-- Bannière erreur -->
    <div
      v-if="store.error && !showValidateModal && !showResetConfirmModal"
      class="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
    >
      <span class="font-medium">Erreur :</span> {{ store.error }}
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

          <ReportForm
            ref="reportFormRef"
            :key="editMode ? 'edit' : 'read'"
            :sections="store.currentReport.sections"
            :editable="editMode && isOwner"
            :will-reset="canEditAndResetValue && editMode"
            :saving="store.saving"
            :error="editMode && isOwner ? store.error : null"
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
          <InternalCommentPanel
            v-if="!isStudent"
            :report-id="reportId"
          />
        </div>
      </div>
    </template>

    <!-- Modal : confirmer ouverture du mode modification -->
    <div v-if="showResetConfirmModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">Modifier le rapport validé ?</h3>
        <p class="text-sm text-gray-500 mb-5">
          Le formateur et le tuteur devront re-valider votre rapport.
        </p>
        <div class="flex gap-3">
          <button
            @click="confirmEditMode"
            class="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            Modifier quand même
          </button>
          <button
            @click="showResetConfirmModal = false"
            class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>

    <!-- Modal : valider -->
    <div v-if="showValidateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">Valider le rapport</h3>
        <p class="text-sm text-gray-500 mb-5">
          {{ isTrainer
            ? 'Le rapport sera marqué comme terminé.'
            : 'Le rapport sera transmis au formateur.' }}
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

const { isStudent, isTrainer, isTutor } = storeToRefs(authStore)

const reportId = Number(route.params.id)
const showValidateModal = ref(false)
const validateComment = ref('')
const validateError = ref('')
const showResetConfirmModal = ref(false)
const editMode = ref(false)
const reportFormRef = ref()

// Vrai si une modification réinitialisera les validations
const canEditAndResetValue = computed(() => {
  const s = store.currentReport?.status
  return s === 'STUDENT_VALIDATED' || s === 'AUTO_VALIDATED'
      || s === 'TUTOR_VALIDATED' || s === 'COMPLETED'
})

// Vrai si l'utilisateur connecté est le propriétaire du rapport
const isOwner = computed(() => {
  if (!store.currentReport || !authStore.user) return false
  return store.currentReport.studentId === authStore.user.id
})

// Booléen pur pour le prop :editable du formulaire
const formEditable = computed<boolean>(() => {
  if (!isOwner.value) return false
  if (!editMode.value) return false
  if (store.currentReport?.editable === true) return true
  if (canEditAndResetValue.value) return true
  return false
})

const canValidateAsTrainerOrTutor = computed(() => {
  const status = store.currentReport?.status
  if (!status) return false
  if (isTutor.value)   return status === 'STUDENT_VALIDATED' || status === 'AUTO_VALIDATED'
  if (isTrainer.value) return status === 'TUTOR_VALIDATED'
  return false
})

onMounted(async () => {
  const wasJustCreated = store.justCreatedId === reportId
  store.justCreatedId = null
  await store.fetchReport(reportId)
  if (wasJustCreated && store.currentReport?.editable) {
    editMode.value = true
  }
})

const confirmEditMode = () => {
  editMode.value = true
  showResetConfirmModal.value = false
}

// Réinitialise editMode uniquement lors d'une navigation entre deux rapports différents,
// pas au chargement initial (où l'id passe par undefined)
watch(() => store.currentReport?.id, (newId, oldId) => {
  if (oldId && newId && oldId !== newId) editMode.value = false
})

const handleSave = async (sections: SectionUpdate[]) => {
  await store.saveReport(reportId, sections)
  if (!store.error && !canEditAndResetValue.value) editMode.value = false
}

const handleValidate = async (sections?: SectionUpdate[]) => {
  if (sections?.length) {
    await store.saveReport(reportId, sections)
    if (store.error) return
  }
  await store.validateReport(reportId, 'student')
  editMode.value = false
}

const handleValidateConfirm = async () => {
  validateError.value = ''
  const role = isTrainer.value ? 'trainer' : 'tutor'
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
