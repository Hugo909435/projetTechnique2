<template>
  <div class="max-w-lg">
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/reports" class="text-blue-600 hover:underline text-sm">← Retour</NuxtLink>
      <h1 class="text-2xl font-bold text-gray-800">Nouveau rapport</h1>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <form @submit.prevent="handleCreate" novalidate>
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mois</label>
            <select v-model.number="form.month" class="input"
              :class="errors.month ? 'border-red-400' : ''">
              <option v-for="m in months" :key="m.value" :value="m.value">
                {{ m.label }}
              </option>
            </select>
            <p v-if="errors.month" class="mt-1 text-xs text-red-600">{{ errors.month }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Année</label>
            <select v-model.number="form.year" class="input">
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
        </div>

        <p v-if="store.error" class="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
          {{ store.error }}
        </p>

        <button
          type="submit"
          :disabled="store.saving"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
        >
          {{ store.saving ? 'Création…' : 'Créer le rapport' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { useReportStore } from '~/stores/report'

definePageMeta({
  middleware: ['auth', 'role'],
  requiredRoles: ['STUDENT'],
})

const store = useReportStore()
const router = useRouter()

const now = new Date()
const form = reactive({ month: now.getMonth() + 1, year: now.getFullYear() })
const errors = reactive<{ month?: string }>({})

const createSchema = z.object({
  year:  z.number().int().min(2020, 'Année invalide'),
  month: z.number().int().min(1).max(12, 'Mois invalide'),
})

const months = [
  { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' },    { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },     { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' }, { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre' },
]

const years = Array.from({ length: 6 }, (_, i) => now.getFullYear() - 2 + i)

const handleCreate = async () => {
  errors.month = undefined

  const result = createSchema.safeParse(form)
  if (!result.success) {
    result.error.errors.forEach((e) => {
      if (e.path[0] === 'month') errors.month = e.message
    })
    return
  }

  const id = await store.createReport(form.year, form.month)
  if (id) await router.push(`/reports/${id}`)
}
</script>

<style scoped>
.input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm;
}
</style>
