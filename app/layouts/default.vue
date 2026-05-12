<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">

          <div class="flex items-center gap-5">
            <NuxtLink to="/dashboard"
              class="text-sm font-semibold text-blue-600 hover:text-blue-700">
              Accueil
            </NuxtLink>

            <!-- ADMIN -->
            <template v-if="authStore.isAdmin">
              <NuxtLink to="/admin/users"
                class="text-sm font-medium text-gray-700 hover:text-blue-600">
                Utilisateurs
              </NuxtLink>
              <NuxtLink to="/reports"
                class="text-sm font-medium text-gray-700 hover:text-blue-600">
                Rapports
              </NuxtLink>
            </template>

            <!-- TRAINER -->
            <template v-if="authStore.isTrainer">
              <NuxtLink to="/trainer/students"
                class="text-sm font-medium text-gray-700 hover:text-blue-600">
                Mes étudiants
              </NuxtLink>
              <NuxtLink to="/reports"
                class="text-sm font-medium text-gray-700 hover:text-blue-600">
                Rapports
              </NuxtLink>
            </template>

            <!-- TUTOR -->
            <template v-if="authStore.isTutor">
              <NuxtLink to="/trainer/students"
                class="text-sm font-medium text-gray-700 hover:text-blue-600">
                Mes étudiants
              </NuxtLink>
              <NuxtLink to="/reports"
                class="text-sm font-medium text-gray-700 hover:text-blue-600">
                Rapports
              </NuxtLink>
            </template>

            <!-- STUDENT -->
            <template v-if="authStore.isStudent">
              <NuxtLink to="/student"
                class="text-sm font-medium text-gray-700 hover:text-blue-600">
                Mon espace
              </NuxtLink>
              <NuxtLink to="/reports"
                class="text-sm font-medium text-gray-700 hover:text-blue-600">
                Mes rapports
              </NuxtLink>
            </template>
          </div>

          <div class="flex items-center gap-4">
            <span v-if="authStore.user" class="text-sm text-gray-600">
              {{ authStore.fullName }}
              <span class="ml-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                {{ authStore.roleLabel }}
              </span>
            </span>
            <button
              @click="logout"
              class="text-sm bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700"
            >
              Déconnexion
            </button>
          </div>

        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const logout = async () => {
  authStore.logout()
  await router.push('/login')
}
</script>
