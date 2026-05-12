<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Mes étudiants</h1>
    </div>

    <div v-if="loading" class="text-gray-500">Chargement…</div>

    <div v-else-if="students.length === 0" class="text-gray-500 italic">
      Aucun étudiant associé à votre compte.
    </div>

    <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-6 py-3 font-medium text-gray-600">Étudiant</th>
            <th class="text-left px-6 py-3 font-medium text-gray-600">Email</th>
            <th class="text-left px-6 py-3 font-medium text-gray-600">Entreprise</th>
            <th class="text-left px-6 py-3 font-medium text-gray-600">Tuteur</th>
            <th class="text-center px-6 py-3 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="s in students" :key="s.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-gray-800">
              {{ s.firstName }} {{ s.lastName }}
              <span class="ml-2 text-xs text-gray-400 font-normal">{{ s.studentNumber }}</span>
            </td>
            <td class="px-6 py-4 text-gray-600">{{ s.email }}</td>
            <td class="px-6 py-4 text-gray-600">{{ s.companyName ?? '—' }}</td>
            <td class="px-6 py-4 text-gray-600">
              <span v-if="s.tutor">
                {{ s.tutor.firstName }} {{ s.tutor.lastName }}
              </span>
              <span v-else class="text-gray-400 italic">Aucun tuteur</span>
            </td>
            <td class="px-6 py-4 text-center">
              <div class="flex justify-center gap-4">
                <NuxtLink :to="`/trainer/students/${s.id}`"
                  class="text-blue-600 hover:underline text-sm">
                  Fiche
                </NuxtLink>
                <NuxtLink :to="`/students/${s.id}/reports`"
                  class="text-indigo-600 hover:underline text-sm">
                  Rapports
                </NuxtLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: ['auth', 'role'],
  requiredRoles: ['TRAINER', 'TUTOR', 'ADMIN'],
})

const authStore = useAuthStore()
const { students: studentsApi } = useApi()

const students = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await studentsApi.list()
    students.value = res.data
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
})
</script>
