<template>
  <div>
    <!-- En-tête -->
    <div class="flex items-start justify-between mb-6">
      <div class="flex items-center gap-3">
        <NuxtLink to="/reports" class="text-blue-600 hover:underline text-sm">← Retour</NuxtLink>
        <div>
          <h1 class="text-2xl font-bold text-gray-800 capitalize">
            {{ store.currentReport?.monthLabel ?? 'Rapport' }}
          </h1>
          <p v-if="!authStore.isStudent && store.currentReport" class="text-sm text-gray-500 mt-0.5">
            {{ store.currentReport.studentName }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3" v-if="store.currentReport">
        <ReportReportStatusBadge :status="store.currentReport.status" />

        <!-- Valider (TRAINER / TUTOR) -->
        <button
          v-if="canValidateAsTrainerOrTutor"
          @click="showValidateModal = true"
          :disabled="store.saving"
          class="text-sm bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          Valider le rapport
        </button>

        <!-- Rouvrir (TRAINER / ADMIN) -->
        <button
          v-if="canReopen"
          @click="showReopenModal = true"
          class="text-sm bg-orange-100 text-orange-700 px-3 py-1.5 rounded-md hover:bg-orange-200"
        >
          Rouvrir
        </button>
      </div>
    </div>

    <!-- Bannière erreur globale -->
    <div
      v-if="store.error && !showValidateModal && !showReopenModal"
      class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
    >
      {{ store.error }}
    </div>

    <div v-if="store.loading" class="text-gray-500">Chargement…</div>

    <template v-else-if="store.currentReport">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Formulaire sections + fichiers (2/3) -->
        <div class="lg:col-span-2 space-y-6">
          <ReportReportForm
            :sections="store.currentReport.sections"
            :editable="store.canEdit && authStore.isStudent"
            :saving="store.saving"
            :error="store.canEdit && authStore.isStudent ? store.error : null"
            @save="handleSave"
            @validate="handleValidate"
          />

          <!-- Fichiers joints -->
          <div class="bg-white rounded-lg border border-gray-200 p-5">
            <h2 class="text-sm font-semibold text-gray-700 mb-4">Fichiers joints</h2>

            <ReportReportFileList
              ref="fileListRef"
              :report-id="reportId"
              :editable="store.canEdit && authStore.isStudent"
              class="mb-4"
            />

            <ReportReportFileUploader
              v-if="store.canEdit && authStore.isStudent"
              :report-id="reportId"
              @uploaded="fileListRef?.refresh()"
            />
          </div>
        </div>

        <!-- Sidebar : timeline des validations + historique + commentaires (1/3) -->
        <div class="space-y-6">
          <!-- Timeline des validations -->
          <div class="bg-white rounded-lg border border-gray-200 p-5">
            <h2 class="text-sm font-semibold text-gray-700 mb-4">Avancement des validations</h2>
            <ValidationTimeline :report="store.currentReport" />
          </div>

          <!-- Historique des statuts -->
          <div class="bg-white rounded-lg border border-gray-200 p-5">
            <h2 class="text-sm font-semibold text-gray-700 mb-4">Historique des statuts</h2>
            <ReportReportTimeline
              v-if="store.currentReport.statusLogs.length"
              :logs="store.currentReport.statusLogs"
            />
            <p v-else class="text-sm text-gray-400 italic">Aucun historique.</p>
          </div>

          <!-- Commentaires internes — TRAINER, TUTOR, ADMIN uniquement -->
          <ReportInternalCommentPanel
            v-if="!authStore.isStudent"
            :report-id="reportId"
          />
        </div>
      </div>

      <!-- Bannière si rapport non modifiable -->
      <div
        v-if="!store.currentReport.editable && authStore.isStudent"
        class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800"
      >
        Ce rapport est en lecture seule (statut : <strong>{{ STATUS_LABELS[store.currentReport.status] }}</strong>).
      </div>
    </template>

    <!-- Modal validation (formateur / tuteur) -->
    <div v-if="showValidateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 class="text-base font-semibold text-gray-800 mb-1">Valider le rapport</h3>
        <p class="text-sm text-gray-500 mb-4">
          {{ authStore.isTrainer
            ? 'Le rapport sera transmis au tuteur entreprise.'
            : 'Le rapport sera marqué comme terminé.' }}
        </p>
        <textarea
          v-model="validateComment"
          rows="3"
          placeholder="Commentaire interne (optionnel, max 5000 caractères)"
          class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 mb-3"
        />
        <p v-if="validateError" class="mb-3 text-sm text-red-600">{{ validateError }}</p>
        <div class="flex gap-3">
          <button
            @click="handleValidateConfirm"
            :disabled="store.saving"
            class="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
          >
            {{ store.saving ? 'Validation…' : 'Confirmer la validation' }}
          </button>
          <button
            @click="closeValidateModal"
            class="text-gray-500 text-sm px-4 py-2 hover:text-gray-700"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>

    <!-- Modal réouverture -->
    <div v-if="showReopenModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 class="text-base font-semibold text-gray-800 mb-3">Rouvrir le rapport</h3>
        <p class="text-sm text-gray-500 mb-4">
          L'étudiant pourra à nouveau modifier son rapport.
        </p>
        <textarea
          v-model="reopenNote"
          rows="3"
          placeholder="Motif de réouverture (optionnel)"
          class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 mb-4"
        />
        <div class="flex gap-3">
          <button @click="handleReopen"
            :disabled="store.saving"
            class="bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700 disabled:opacity-50">
            Confirmer la réouverture
          </button>
          <button @click="showReopenModal = false"
            class="text-gray-500 text-sm px-4 py-2 hover:text-gray-700">
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
const showReopenModal = ref(false)
const reopenNote = ref('')
const fileListRef = ref<{ refresh: () => void } | null>(null)

const showValidateModal = ref(false)
const validateComment = ref('')
const validateError = ref('')

const canReopen = computed(() =>
  (authStore.isTrainer || authStore.isAdmin) &&
  store.currentReport?.status !== undefined &&
  ['STUDENT_VALIDATED', 'AUTO_VALIDATED', 'TRAINER_VALIDATED']
    .includes(store.currentReport.status)
)

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
  const ok = await store.validateReport(reportId, 'student')
  if (!ok) {
    // store.error est affiché par la bannière globale
  }
}

const handleValidateConfirm = async () => {
  validateError.value = ''
  const role = authStore.isTrainer ? 'trainer' : 'tutor'
  const ok = await store.validateReport(reportId, role, validateComment.value || undefined)
  if (ok) {
    closeValidateModal()
  } else {
    validateError.value = store.error ?? 'Erreur lors de la validation'
  }
}

const closeValidateModal = () => {
  showValidateModal.value = false
  validateComment.value = ''
  validateError.value = ''
}

const handleReopen = async () => {
  await store.reopenReport(reportId, reopenNote.value || undefined)
  showReopenModal.value = false
  reopenNote.value = ''
}
</script>
