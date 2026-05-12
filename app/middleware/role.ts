import { useAuthStore } from '~/stores/auth'
import type { UserRole } from '~/stores/auth'

declare module '#app' {
  interface PageMeta {
    requiredRoles?: UserRole[]
  }
}

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  const requiredRoles = to.meta.requiredRoles as UserRole[] | undefined

  if (!requiredRoles || requiredRoles.length === 0) return

  if (!authStore.user || !requiredRoles.includes(authStore.user.role)) {
    return navigateTo('/dashboard')
  }
})
