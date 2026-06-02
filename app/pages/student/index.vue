<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-2">Mon espace</h1>
    <p class="text-gray-500 text-sm mb-6">Bienvenue, {{ authStore.fullName }}</p>

    <div v-if="loading" class="text-gray-500">Chargement…</div>

    <template v-else>
      <div v-if="profile" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 class="text-base font-semibold text-gray-700 mb-4">Mon profil</h2>
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <InfoRow label="Email"       :value="profile.email" />
          <InfoRow label="Entreprise"  :value="profile.companyName ?? '—'" />
          <InfoRow label="N° étudiant" :value="profile.studentNumber ?? '—'" />
          <InfoRow label="Formateur"
            :value="profile.trainer ? `${profile.trainer.firstName} ${profile.trainer.lastName}` : '—'" />
          <InfoRow label="Tuteur"
            :value="profile.tutor ? `${profile.tutor.firstName} ${profile.tutor.lastName}` : '—'" />
        </dl>
      </div>

      <!-- Rapports récents -->
      <div class="mb-2 flex items-center justify-between">
        <h2 class="text-base font-semibold text-gray-700">Mes rapports récents</h2>
        <NuxtLink to="/reports" class="text-sm text-blue-600 hover:underline">Voir tout →</NuxtLink>
      </div>

      <div v-if="reportsLoading" class="text-gray-500 text-sm">Chargement…</div>

      <div v-else-if="recentReports.length === 0" class="bg-gray-50 border border-gray-200 rounded-lg p-5 text-sm text-gray-500 italic">
        Aucun rapport pour l'instant.
        <NuxtLink to="/reports/create" class="text-blue-600 hover:underline ml-1">Créer mon premier rapport →</NuxtLink>
      </div>

      <div v-else class="space-y-3">
        <NuxtLink
          v-for="report in recentReports"
          :key="report.id"
          :to="`/reports/${report.id}`"
          class="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-5 py-4 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div>
            <p class="font-semibold text-gray-800 capitalize">{{ report.monthLabel }}</p>
            <p class="text-xs text-gray-400 mt-0.5">Mis à jour : {{ formatDate(report.updatedAt) }}</p>
          </div>
          <div class="flex items-center gap-3">
            <ReportStatusBadge :status="report.status" />
            <span class="text-gray-400 text-sm">→</span>
          </div>
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import type { ReportSummary } from '~/types/report'

definePageMeta({ middleware: ['auth'] })

const authStore = useAuthStore()
const { students: studentsApi, reports: reportsApi } = useApi()

const profile = ref<any>(null)
const loading = ref(true)
const reportsLoading = ref(true)
const recentReports = ref<ReportSummary[]>([])

onMounted(async () => {
  if (!authStore.user) return
  const [profileRes, reportsRes] = await Promise.allSettled([
    studentsApi.get(authStore.user.id),
    reportsApi.list(),
  ])
  if (profileRes.status === 'fulfilled') profile.value = profileRes.value.data
  if (reportsRes.status === 'fulfilled') recentReports.value = reportsRes.value.data.slice(0, 5)
  loading.value = false
  reportsLoading.value = false
})

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
</script>
