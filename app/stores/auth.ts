import { defineStore } from 'pinia'

export type UserRole = 'ADMIN' | 'STUDENT' | 'TRAINER' | 'TUTOR'

export interface AuthUser {
  id: number
  email: string
  firstName: string
  lastName: string
  role: UserRole
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as AuthUser | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin:   (state) => state.user?.role === 'ADMIN',
    isTrainer: (state) => state.user?.role === 'TRAINER',
    isTutor:   (state) => state.user?.role === 'TUTOR',
    isStudent: (state) => state.user?.role === 'STUDENT',
    fullName:  (state) => state.user
      ? `${state.user.firstName} ${state.user.lastName}`
      : '',
    roleLabel: (state) => {
      const labels: Record<UserRole, string> = {
        ADMIN: 'Administrateur',
        TRAINER: 'Formateur',
        TUTOR: 'Tuteur',
        STUDENT: 'Étudiant',
      }
      return state.user ? labels[state.user.role] : ''
    },
  },

  actions: {
    /** Rehydrate depuis localStorage au démarrage (client-side uniquement). */
    init() {
      if (!import.meta.client) return
      const storedToken = localStorage.getItem('jwt_token')
      const storedUser  = localStorage.getItem('user')
      if (storedToken) this.token = storedToken
      if (storedUser)  this.user  = JSON.parse(storedUser)
    },

    setAuth(token: string, user: AuthUser) {
      this.token = token
      this.user  = user
      if (import.meta.client) {
        localStorage.setItem('jwt_token', token)
        localStorage.setItem('user', JSON.stringify(user))
      }
    },

    logout() {
      this.token = null
      this.user  = null
      if (import.meta.client) {
        localStorage.removeItem('jwt_token')
        localStorage.removeItem('user')
      }
    },

    hasRole(...roles: UserRole[]): boolean {
      return this.user !== null && roles.includes(this.user.role)
    },
  },
})
