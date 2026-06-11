<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-2">
        Suivi de rapports d'alternance
      </h2>
      <p class="text-center text-gray-500 text-sm mb-8">Connectez-vous à votre espace</p>

      <form @submit.prevent="handleLogin" novalidate>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-medium mb-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            autocomplete="email"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="errors.email ? 'border-red-400' : 'border-gray-300'"
            placeholder="vous@exemple.com"
          />
          <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
        </div>

        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-medium mb-1">Mot de passe</label>
          <input
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="errors.password ? 'border-red-400' : 'border-gray-300'"
            placeholder="••••••••"
          />
          <p v-if="errors.password" class="mt-1 text-xs text-red-600">{{ errors.password }}</p>
        </div>

        <div v-if="serverError" class="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded text-sm">
          {{ serverError }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {{ loading ? 'Connexion…' : 'Se connecter' }}
        </button>
      </form>

      <!-- Connexion rapide (démo) -->
      <div class="mt-8 pt-5 border-t border-gray-100">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center mb-3">
          Connexion rapide — démo
        </p>
        <div class="space-y-2.5">
          <div v-for="group in quickAccounts" :key="group.role">
            <p class="text-[11px] font-medium text-gray-400 mb-1">{{ group.role }}</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="acc in group.accounts"
                :key="acc.email"
                type="button"
                :disabled="loading"
                @click="quickLogin(acc.email)"
                class="text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors disabled:opacity-50"
                :class="group.cls"
              >
                {{ acc.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: false })

const authStore = useAuthStore()
const router = useRouter()

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

const quickAccounts = [
  {
    role: 'Admin',
    cls: 'border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100',
    accounts: [{ email: 'admin@example.com', label: 'Admin' }],
  },
  {
    role: 'Formateurs',
    cls: 'border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100',
    accounts: [
      { email: 'trainer1@example.com', label: 'Jean Dupont' },
      { email: 'trainer2@example.com', label: 'Sophie Bernard' },
    ],
  },
  {
    role: 'Tuteurs',
    cls: 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100',
    accounts: [
      { email: 'tutor1@example.com', label: 'Pierre Martin' },
      { email: 'tutor2@example.com', label: 'Marie Leblanc' },
      { email: 'tutor3@example.com', label: 'Luc Moreau' },
    ],
  },
  {
    role: 'Étudiants',
    cls: 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100',
    accounts: [
      { email: 'student1@example.com', label: 'Alice Durand' },
      { email: 'student2@example.com', label: 'Bob Martin' },
      { email: 'student3@example.com', label: 'Clara Petit' },
      { email: 'student4@example.com', label: 'David Roux' },
    ],
  },
]

const quickLogin = async (email: string) => {
  form.email = email
  form.password = 'password123'
  await handleLogin()
}

const form = reactive({ email: '', password: '' })
const errors = reactive<{ email?: string; password?: string }>({})
const serverError = ref('')
const loading = ref(false)

const handleLogin = async () => {
  serverError.value = ''
  errors.email = undefined
  errors.password = undefined

  const result = loginSchema.safeParse(form)
  if (!result.success) {
    result.error.errors.forEach((e) => {
      const field = e.path[0] as 'email' | 'password'
      errors[field] = e.message
    })
    return
  }

  loading.value = true
  const { useApi } = await import('~/composables/useApi')
  const { auth } = useApi()

  try {
    const response = await auth.login(form.email, form.password)
    const { token, user } = response.data
    authStore.setAuth(token, user)
    await router.push('/dashboard')
  } catch (err: any) {
    if (err.code === 'ERR_NETWORK') {
      serverError.value = "Impossible de contacter le serveur (port 8080)."
    } else {
      serverError.value = err.response?.data?.message || 'Email ou mot de passe incorrect'
    }
  } finally {
    loading.value = false
  }
}
</script>
