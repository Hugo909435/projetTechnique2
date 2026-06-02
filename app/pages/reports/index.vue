<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Rapports mensuels</h1>
      <NuxtLink
        v-if="authStore.isStudent"
        to="/reports/create"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
      >
        + Nouveau rapport
      </NuxtLink>
    </div>

    <div v-if="store.loading" class="text-gray-500">Chargement…</div>

    <div v-else-if="store.error" class="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-600">
      {{ store.error }}
    </div>

    <div v-else-if="store.reports.length === 0" class="text-gray-500 italic">
      Aucun rapport disponible.
    </div>

    <!-- Non-étudiants : regroupés par élève puis par mois -->
    <div v-else-if="!authStore.isStudent" class="space-y-2">
      <div
        v-for="group in reportsByStudent"
        :key="group.studentId"
        class="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <button
          @click="toggleStudent(group.studentId)"
          class="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors text-left"
        >
          <div class="flex items-center gap-2">
            <span class="font-semibold text-gray-800">{{ group.studentName }}</span>
            <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {{ group.reports.length }} rapport{{ group.reports.length > 1 ? 's' : '' }}
            </span>
          </div>
        </button>

        <div v-if="isOpen(group.studentId)" class="divide-y divide-gray-100 border-t border-gray-100">
          <NuxtLink
            v-for="report in group.reports"
            :key="report.id"
            :to="`/reports/${report.id}`"
            class="flex items-center justify-between px-7 py-3 hover:bg-gray-50 transition-colors"
          >
            <span class="text-sm text-gray-700 capitalize">{{ report.monthLabel }}</span>
            <div class="flex items-center gap-3">
              <ReportStatusBadge :status="report.status" />
              <span class="text-gray-400 text-sm">→</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Étudiant : liste plate de ses mois -->
    <div v-else class="space-y-3">
      <NuxtLink
        v-for="report in store.reports"
        :key="report.id"
        :to="`/reports/${report.id}`"
        class="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-5 py-4 hover:border-blue-300 hover:shadow-sm transition-all"
      >
        <p class="font-semibold text-gray-800 capitalize">{{ report.monthLabel }}</p>
        <div class="flex items-center gap-3">
          <ReportStatusBadge :status="report.status" />
          <span class="text-gray-400 text-sm">→</span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useReportStore } from '~/stores/report'
import type { ReportSummary } from '~/types/report'

definePageMeta({ middleware: ['auth'] })

const authStore = useAuthStore()
const store = useReportStore()

onMounted(() => store.fetchMyReports())

interface StudentGroup {
  studentId: number
  studentName: string
  reports: ReportSummary[]
}

const reportsByStudent = computed((): StudentGroup[] => {
  const map = new Map<number, StudentGroup>()
  for (const report of store.reports) {
    if (!map.has(report.studentId)) {
      map.set(report.studentId, { studentId: report.studentId, studentName: report.studentName, reports: [] })
    }
    map.get(report.studentId)!.reports.push(report)
  }
  for (const group of map.values()) {
    group.reports.sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month)
  }
  return Array.from(map.values()).sort((a, b) => a.studentName.localeCompare(b.studentName, 'fr'))
})

const openStudents = ref<number[]>([])

const toggleStudent = (studentId: number) => {
  const idx = openStudents.value.indexOf(studentId)
  if (idx > -1) openStudents.value.splice(idx, 1)
  else openStudents.value.push(studentId)
}

const isOpen = (studentId: number) => openStudents.value.includes(studentId)
</script>
