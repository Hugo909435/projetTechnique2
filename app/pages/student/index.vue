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

      <div class="bg-blue-50 border border-blue-200 rounded-lg p-5 text-sm text-blue-700">
        Les rapports mensuels seront disponibles dans le prochain module.
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ middleware: ['auth'] })

const authStore = useAuthStore()
const { students: studentsApi } = useApi()

const profile = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  if (!authStore.user) return
  try {
    const res = await studentsApi.get(authStore.user.id)
    profile.value = res.data
  } catch {
    // profil étudiant peut ne pas encore exister
  } finally {
    loading.value = false
  }
})
</script>
