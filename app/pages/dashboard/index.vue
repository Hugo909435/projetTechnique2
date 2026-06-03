<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Bonjour, {{ authStore.fullName }}</h1>
      <p class="text-gray-500 text-sm mt-1">{{ authStore.roleLabel }}</p>
    </div>

    <!-- ── ADMIN ── -->
    <template v-if="authStore.isAdmin">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <DashboardCard title="Utilisateurs" to="/admin/users" description="Gérer tous les comptes" />
      </div>
      <h2 class="text-base font-semibold text-gray-800 mb-3">Rapports par élève</h2>
      <template v-if="studentsLoading">
        <div class="space-y-2">
          <div v-for="i in 4" :key="i" class="h-14 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </template>
      <p v-else-if="students.length === 0" class="text-sm text-gray-400 italic">Aucun élève associé.</p>
      <div v-else class="space-y-2">
        <div v-for="s in students" :key="s.id" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button @click="toggle(s.id)" class="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors text-left">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {{ initials(s) }}
              </div>
              <div>
                <span class="font-semibold text-gray-800">{{ s.firstName }} {{ s.lastName }}</span>
                <span v-if="s.companyName" class="ml-2 text-xs text-gray-400">{{ s.companyName }}</span>
              </div>
            </div>
            
          </button>
          <div v-if="openIds.includes(s.id)" class="border-t border-gray-100">
            <div v-if="loadingMap[s.id]" class="px-7 py-4 space-y-2">
              <div v-for="i in 3" :key="i" class="h-8 bg-gray-100 rounded-lg animate-pulse" />
            </div>
            <p v-else-if="reportsMap[s.id] && reportsMap[s.id].length === 0" class="px-7 py-4 text-sm text-gray-400 italic">Aucun rapport pour cet élève.</p>
            <div v-else-if="reportsMap[s.id]" class="divide-y divide-gray-100">
              <NuxtLink v-for="r in reportsMap[s.id]" :key="r.id" :to="`/reports/${r.id}`"
                class="flex items-center justify-between px-7 py-3 hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-700 capitalize">{{ r.monthLabel }}</span>
                  <ReportStatusBadge :status="r.status" />
                </div>
                <span class="text-gray-400 text-sm">→</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ── TRAINER ── -->
    <template v-else-if="authStore.isTrainer">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <DashboardCard title="Mes étudiants" to="/trainer/students" description="Suivre les rapports de vos étudiants" />
      </div>

      <div class="mb-8">
        <h2 class="text-base font-semibold text-gray-800 mb-3">
          Rapports à valider
          <span v-if="reportStore.pendingReports.length" class="ml-2 text-sm font-normal bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {{ reportStore.pendingReports.length }}
          </span>
        </h2>
        <div v-if="reportStore.loading" class="space-y-2">
          <div v-for="i in 2" :key="i" class="h-12 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div v-else-if="reportStore.pendingReports.length" class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          <NuxtLink v-for="r in reportStore.pendingReports" :key="r.id" :to="`/reports/${r.id}`"
            class="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
            <div>
              <span class="font-medium text-gray-800 capitalize">{{ r.monthLabel }}</span>
              <span class="text-sm text-gray-500 ml-2">— {{ r.studentName }}</span>
            </div>
            <ReportStatusBadge :status="r.status" />
          </NuxtLink>
        </div>
        <p v-else class="text-sm text-gray-400 italic">Aucun rapport en attente.</p>
      </div>

      <h2 class="text-base font-semibold text-gray-800 mb-3">Rapports par élève</h2>
      <template v-if="studentsLoading">
        <div class="space-y-2">
          <div v-for="i in 4" :key="i" class="h-14 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </template>
      <p v-else-if="students.length === 0" class="text-sm text-gray-400 italic">Aucun élève associé.</p>
      <div v-else class="space-y-2">
        <div v-for="s in students" :key="s.id" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button @click="toggle(s.id)" class="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors text-left">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {{ initials(s) }}
              </div>
              <div>
                <span class="font-semibold text-gray-800">{{ s.firstName }} {{ s.lastName }}</span>
                <span v-if="s.companyName" class="ml-2 text-xs text-gray-400">{{ s.companyName }}</span>
              </div>
            </div>
            
          </button>
          <div v-if="openIds.includes(s.id)" class="border-t border-gray-100">
            <div v-if="loadingMap[s.id]" class="px-7 py-4 space-y-2">
              <div v-for="i in 3" :key="i" class="h-8 bg-gray-100 rounded-lg animate-pulse" />
            </div>
            <p v-else-if="reportsMap[s.id] && reportsMap[s.id].length === 0" class="px-7 py-4 text-sm text-gray-400 italic">Aucun rapport pour cet élève.</p>
            <div v-else-if="reportsMap[s.id]" class="divide-y divide-gray-100">
              <NuxtLink v-for="r in reportsMap[s.id]" :key="r.id" :to="`/reports/${r.id}`"
                class="flex items-center justify-between px-7 py-3 hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-700 capitalize">{{ r.monthLabel }}</span>
                  <ReportStatusBadge :status="r.status" />
                </div>
                <span class="text-gray-400 text-sm">→</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ── TUTOR ── -->
    <template v-else-if="authStore.isTutor">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <DashboardCard title="Mes alternants" to="/trainer/students" description="Consulter les rapports de vos alternants" />
      </div>

      <div class="mb-8">
        <h2 class="text-base font-semibold text-gray-800 mb-3">
          Rapports à valider
          <span v-if="reportStore.pendingReports.length" class="ml-2 text-sm font-normal bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
            {{ reportStore.pendingReports.length }}
          </span>
        </h2>
        <div v-if="reportStore.loading" class="space-y-2">
          <div v-for="i in 2" :key="i" class="h-12 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div v-else-if="reportStore.pendingReports.length" class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          <NuxtLink v-for="r in reportStore.pendingReports" :key="r.id" :to="`/reports/${r.id}`"
            class="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
            <div>
              <span class="font-medium text-gray-800 capitalize">{{ r.monthLabel }}</span>
              <span class="text-sm text-gray-500 ml-2">— {{ r.studentName }}</span>
            </div>
            <ReportStatusBadge :status="r.status" />
          </NuxtLink>
        </div>
        <p v-else class="text-sm text-gray-400 italic">Aucun rapport en attente.</p>
      </div>

      <h2 class="text-base font-semibold text-gray-800 mb-3">Rapports par élève</h2>
      <template v-if="studentsLoading">
        <div class="space-y-2">
          <div v-for="i in 4" :key="i" class="h-14 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </template>
      <p v-else-if="students.length === 0" class="text-sm text-gray-400 italic">Aucun élève associé.</p>
      <div v-else class="space-y-2">
        <div v-for="s in students" :key="s.id" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button @click="toggle(s.id)" class="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors text-left">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {{ initials(s) }}
              </div>
              <div>
                <span class="font-semibold text-gray-800">{{ s.firstName }} {{ s.lastName }}</span>
                <span v-if="s.companyName" class="ml-2 text-xs text-gray-400">{{ s.companyName }}</span>
              </div>
            </div>
            
          </button>
          <div v-if="openIds.includes(s.id)" class="border-t border-gray-100">
            <div v-if="loadingMap[s.id]" class="px-7 py-4 space-y-2">
              <div v-for="i in 3" :key="i" class="h-8 bg-gray-100 rounded-lg animate-pulse" />
            </div>
            <p v-else-if="reportsMap[s.id] && reportsMap[s.id].length === 0" class="px-7 py-4 text-sm text-gray-400 italic">Aucun rapport pour cet élève.</p>
            <div v-else-if="reportsMap[s.id]" class="divide-y divide-gray-100">
              <NuxtLink v-for="r in reportsMap[s.id]" :key="r.id" :to="`/reports/${r.id}`"
                class="flex items-center justify-between px-7 py-3 hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-700 capitalize">{{ r.monthLabel }}</span>
                  <ReportStatusBadge :status="r.status" />
                </div>
                <span class="text-gray-400 text-sm">→</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ── STUDENT ── -->
    <template v-else-if="authStore.isStudent">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-semibold text-gray-800">Mes rapports</h2>
        <NuxtLink to="/reports/create" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
          + Nouveau rapport
        </NuxtLink>
      </div>
      <div v-if="reportStore.loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-14 bg-gray-100 rounded-xl animate-pulse" />
      </div>
      <div v-else-if="reportStore.reports.length === 0" class="bg-white border border-gray-200 rounded-xl p-8 text-center">
        <p class="text-gray-500 text-sm mb-3">Aucun rapport pour l'instant.</p>
        <NuxtLink to="/reports/create" class="text-blue-600 hover:underline text-sm font-medium">Créer mon premier rapport →</NuxtLink>
      </div>
      <div v-else class="space-y-2">
        <NuxtLink v-for="r in reportStore.reports" :key="r.id" :to="`/reports/${r.id}`"
          class="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-blue-300 hover:shadow-sm transition-all">
          <p class="font-medium text-gray-800 capitalize">{{ r.monthLabel }}</p>
          <div class="flex items-center gap-3">
            <ReportStatusBadge :status="r.status" />
            <span class="text-gray-400 text-sm">→</span>
          </div>
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useReportStore } from '~/stores/report'
import type { ReportSummary } from '~/types/report'

definePageMeta({ middleware: ['auth'] })

const authStore = useAuthStore()
const reportStore = useReportStore()
const { students: studentsApi, reports: reportsApi } = useApi()

const students = ref<any[]>([])
const studentsLoading = ref(false)
const openIds = ref<number[]>([])
const reportsMap = ref<Record<number, ReportSummary[]>>({})
const loadingMap = ref<Record<number, boolean>>({})

const initials = (s: any) =>
  `${s.firstName?.[0] ?? ''}${s.lastName?.[0] ?? ''}`.toUpperCase()

const toggle = async (id: number) => {
  const idx = openIds.value.indexOf(id)
  if (idx > -1) {
    openIds.value.splice(idx, 1)
    return
  }
  openIds.value.push(id)
  if (reportsMap.value[id] !== undefined) return
  loadingMap.value = { ...loadingMap.value, [id]: true }
  try {
    const res = await reportsApi.listForStudent(id)
    reportsMap.value = { ...reportsMap.value, [id]: res.data }
  } catch {
    reportsMap.value = { ...reportsMap.value, [id]: [] }
  } finally {
    loadingMap.value = { ...loadingMap.value, [id]: false }
  }
}

onMounted(async () => {
  if (authStore.isStudent) {
    reportStore.fetchMyReports()
    return
  }
  reportStore.fetchPendingReports()
  studentsLoading.value = true
  try {
    const res = await studentsApi.list()
    students.value = res.data
  } catch {
    students.value = []
  } finally {
    studentsLoading.value = false
  }
})
</script>
