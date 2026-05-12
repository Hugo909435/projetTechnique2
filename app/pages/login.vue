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

      <details class="mt-6 text-xs text-gray-400">
        <summary class="cursor-pointer select-none">Comptes de test</summary>
        <div class="mt-2 space-y-0.5 font-mono">
          <p>admin@example.com / password123 (Admin)</p>
          <p>trainer1@example.com / password123 (Formateur)</p>
          <p>tutor1@example.com / password123 (Tuteur)</p>
          <p>student1@example.com / password123 (Étudiant)</p>
        </div>
      </details>
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
