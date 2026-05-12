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

    <div v-else class="space-y-3">
      <NuxtLink
        v-for="report in store.reports"
        :key="report.id"
        :to="`/reports/${report.id}`"
        class="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-5 py-4 hover:border-blue-300 hover:shadow-sm transition-all"
      >
        <div>
          <p class="font-semibold text-gray-800 capitalize">{{ report.monthLabel }}</p>
          <p v-if="!authStore.isStudent" class="text-xs text-gray-500 mt-0.5">
            {{ report.studentName }}
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

definePageMeta({ middleware: ['auth'] })

const authStore = useAuthStore()
const store = useReportStore()

onMounted(() => store.fetchMyReports())
</script>
