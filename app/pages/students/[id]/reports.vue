<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/trainer/students" class="text-blue-600 hover:underline text-sm">← Étudiants</NuxtLink>
      <NuxtLink :to="`/trainer/students/${studentId}`" class="text-blue-600 hover:underline text-sm">
        Fiche
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-800">
        Rapports{{ studentName ? ` — ${studentName}` : '' }}
      </h1>
    </div>

    <div v-if="store.loading" class="text-gray-500">Chargement…</div>

    <div v-else-if="store.error" class="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-600">
      {{ store.error }}
    </div>

    <div v-else-if="store.reports.length === 0" class="text-gray-500 italic">
      Aucun rapport pour cet étudiant.
    </div>

    <div v-else class="space-y-3">
      <NuxtLink
        v-for="report in store.reports"
        :key="report.id"
        :to="`/reports/${report.id}`"
        class="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-5 py-4 hover:border-blue-300 hover:shadow-sm transition-all"
      >
        <div>
          <p class="font-semibold text-gray-800 capitalize">{{ report.monthLabel }}</p>
          <p class="text-xs text-gray-400 mt-0.5">
            Mis à jour : {{ formatDate(report.updatedAt) }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <ReportReportStatusBadge :status="report.status" />
          <span class="text-gray-400 text-sm">→</span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useReportStore } from '~/stores/report'

definePageMeta({
  middleware: ['auth', 'role'],
  requiredRoles: ['TRAINER', 'TUTOR', 'ADMIN'],
})

const route = useRoute()
const authStore = useAuthStore()
const store = useReportStore()
const { students: studentsApi } = useApi()

const studentId = Number(route.params.id)
const studentName = ref('')

onMounted(async () => {
  store.fetchStudentReports(studentId)
  try {
    const res = await studentsApi.get(studentId)
    studentName.value = `${res.data.firstName} ${res.data.lastName}`
  } catch {}
})

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
</script>
