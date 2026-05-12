<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        Bonjour, {{ authStore.fullName }}
      </h1>
      <p class="text-gray-500 text-sm mt-1">{{ authStore.roleLabel }}</p>
    </div>

    <!-- ADMIN -->
    <template v-if="authStore.isAdmin">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardCard title="Utilisateurs" icon="👥" to="/admin/users"
          description="Gérer tous les comptes" />
      </div>
    </template>

    <!-- TRAINER -->
    <template v-else-if="authStore.isTrainer">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <DashboardCard title="Mes étudiants" icon="🎓" to="/trainer/students"
          description="Suivre les rapports de vos étudiants" />
      </div>

      <!-- Rapports en attente de validation -->
      <div>
        <h2 class="text-base font-semibold text-gray-800 mb-3">
          Rapports en attente de validation
          <span v-if="reportStore.pendingReports.length"
            class="ml-2 text-sm font-normal bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {{ reportStore.pendingReports.length }}
          </span>
        </h2>

        <div v-if="reportStore.loading" class="text-sm text-gray-400">Chargement…</div>

        <div v-else-if="reportStore.pendingReports.length"
          class="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          <NuxtLink
            v-for="r in reportStore.pendingReports"
            :key="r.id"
            :to="`/reports/${r.id}`"
            class="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
          >
            <div>
              <span class="font-medium text-gray-800 capitalize">{{ r.monthLabel }}</span>
              <span class="text-sm text-gray-500 ml-2">— {{ r.studentName }}</span>
            </div>
            <ReportReportStatusBadge :status="r.status" />
          </NuxtLink>
        </div>

        <p v-else class="text-sm text-gray-400 italic">Aucun rapport en attente.</p>
      </div>
    </template>

    <!-- TUTOR -->
    <template v-else-if="authStore.isTutor">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <DashboardCard title="Mes alternants" icon="🏢" to="/trainer/students"
          description="Consulter les rapports de vos alternants" />
      </div>

      <!-- Rapports en attente de validation -->
      <div>
        <h2 class="text-base font-semibold text-gray-800 mb-3">
          Rapports en attente de validation
          <span v-if="reportStore.pendingReports.length"
            class="ml-2 text-sm font-normal bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
            {{ reportStore.pendingReports.length }}
          </span>
        </h2>

        <div v-if="reportStore.loading" class="text-sm text-gray-400">Chargement…</div>

        <div v-else-if="reportStore.pendingReports.length"
          class="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          <NuxtLink
            v-for="r in reportStore.pendingReports"
            :key="r.id"
            :to="`/reports/${r.id}`"
            class="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
          >
            <div>
              <span class="font-medium text-gray-800 capitalize">{{ r.monthLabel }}</span>
              <span class="text-sm text-gray-500 ml-2">— {{ r.studentName }}</span>
            </div>
            <ReportReportStatusBadge :status="r.status" />
          </NuxtLink>
        </div>

        <p v-else class="text-sm text-gray-400 italic">Aucun rapport en attente.</p>
      </div>
    </template>

    <!-- STUDENT -->
    <template v-else-if="authStore.isStudent">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardCard title="Mes rapports" icon="📄" to="/student"
          description="Rédiger et suivre vos rapports mensuels" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useReportStore } from '~/stores/report'

definePageMeta({ middleware: ['auth'] })

const authStore = useAuthStore()
const reportStore = useReportStore()

onMounted(() => {
  if (authStore.isTrainer || authStore.isTutor) {
    reportStore.fetchPendingReports()
  }
})
</script>
