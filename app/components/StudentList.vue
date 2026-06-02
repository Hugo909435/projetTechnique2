<template>
  <div>
    <!-- Chargement de la liste -->
    <div v-if="loading" class="space-y-2">
      <div v-for="i in 4" :key="i" class="h-14 bg-gray-100 rounded-xl animate-pulse" />
    </div>

    <p v-else-if="students.length === 0" class="text-sm text-gray-400 italic">
      Aucun élève associé.
    </p>

    <div v-else class="space-y-2">
      <div v-for="s in students" :key="s.id"
        class="bg-white rounded-xl border border-gray-200 overflow-hidden">

        <!-- Ligne élève cliquable -->
        <button @click="toggle(s.id)"
          class="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors text-left">
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
              {{ initials(s) }}
            </div>
            <div>
              <span class="font-semibold text-gray-800">{{ s.firstName }} {{ s.lastName }}</span>
              <span v-if="s.companyName" class="ml-2 text-xs text-gray-400">{{ s.companyName }}</span>
            </div>
          </div>
        </button>

        <!-- Rapports de l'élève (dépliés) -->
        <div v-if="open.includes(s.id)" class="border-t border-gray-100">

          <!-- Chargement des rapports -->
          <div v-if="loadingMap[s.id]" class="px-7 py-4 space-y-2">
            <div v-for="i in 3" :key="i" class="h-8 bg-gray-100 rounded-lg animate-pulse" />
          </div>

          <!-- Aucun rapport -->
          <p v-else-if="reportsMap[s.id] && reportsMap[s.id].length === 0"
            class="px-7 py-4 text-sm text-gray-400 italic">
            Aucun rapport pour cet élève.
          </p>

          <!-- Liste des mois -->
          <div v-else-if="reportsMap[s.id]" class="divide-y divide-gray-100">
            <NuxtLink
              v-for="r in reportsMap[s.id]" :key="r.id"
              :to="`/reports/${r.id}`"
              class="flex items-center justify-between px-7 py-3 hover:bg-gray-50 transition-colors">
              <span class="text-sm text-gray-700 capitalize">{{ r.monthLabel }}</span>
              <div class="flex items-center gap-3">
                <ReportStatusBadge :status="r.status" />
                <span class="text-gray-400 text-sm">→</span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ReportSummary } from '~/types/report'

const { students: studentsApi, reports: reportsApi } = useApi()

const students = ref<any[]>([])
const loading = ref(true)
const open = ref<number[]>([])
const reportsMap = ref<Record<number, ReportSummary[]>>({})
const loadingMap = ref<Record<number, boolean>>({})

onMounted(async () => {
  try {
    const res = await studentsApi.list()
    students.value = res.data
  } catch {
    students.value = []
  } finally {
    loading.value = false
  }
})

const toggle = async (id: number) => {
  const idx = open.value.indexOf(id)
  if (idx > -1) {
    open.value.splice(idx, 1)
    return
  }
  open.value.push(id)

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

const initials = (s: any) =>
  `${s.firstName?.[0] ?? ''}${s.lastName?.[0] ?? ''}`.toUpperCase()
</script>
