import axios from 'axios'
import { useAuthStore } from '~/stores/auth'

export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const api = axios.create({
    baseURL: config.public.apiBase,
    headers: { 'Content-Type': 'application/json' },
  })

  api.interceptors.request.use((cfg) => {
    if (authStore.token) cfg.headers.Authorization = `Bearer ${authStore.token}`
    return cfg
  })

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        authStore.logout()
        navigateTo('/login')
      }
      return Promise.reject(error)
    }
  )

  return {
    // ── Auth ─────────────────────────────────────────────────────────────────
    auth: {
      login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
      me: () => api.get('/auth/me'),
    },

    // ── Users ─────────────────────────────────────────────────────────────────
    users: {
      list: ()                       => api.get('/users'),
      get:  (id: number)             => api.get(`/users/${id}`),
      create: (data: object)         => api.post('/users', data),
      update: (id: number, data: object) => api.put(`/users/${id}`, data),
      delete: (id: number)           => api.delete(`/users/${id}`),
    },

    // ── Students ──────────────────────────────────────────────────────────────
    students: {
      list: ()                        => api.get('/students'),
      get:  (id: number)              => api.get(`/students/${id}`),
      update: (id: number, data: object) => api.put(`/students/${id}`, data),
      updateTutor: (studentId: number, data: object) =>
        api.put(`/students/${studentId}/tutor`, data),
      assignTrainer: (studentId: number, trainerId: number) =>
        api.put(`/students/${studentId}/assign-trainer/${trainerId}`),
      assignTutor: (studentId: number, tutorId: number) =>
        api.put(`/students/${studentId}/assign-tutor/${tutorId}`),
    },

    // ── Reports ───────────────────────────────────────────────────────────────
    reports: {
      list: ()                               => api.get('/reports'),
      get:  (id: number)                     => api.get(`/reports/${id}`),
      create: (data: object)                 => api.post('/reports', data),
      update: (id: number, data: object)     => api.put(`/reports/${id}`, data),
      listForStudent: (studentId: number)    => api.get(`/students/${studentId}/reports`),
    },

    // ── Report comments ───────────────────────────────────────────────────────
    comments: {
      list: (reportId: number) => api.get(`/reports/${reportId}/comments`),
      create: (reportId: number, content: string) =>
        api.post(`/reports/${reportId}/comments`, { content }),
      update: (commentId: number, content: string) =>
        api.put(`/report-comments/${commentId}`, { content }),
      delete: (commentId: number) => api.delete(`/report-comments/${commentId}`),
    },

    // ── Visits / Trainer slots ────────────────────────────────────────────────
    visits: {
      slots:        ()                   => api.get('/trainer-slots'),
      tutors:       ()                   => api.get('/trainer-slots/tutors'),
      createSlot:   (data: object)       => api.post('/trainer-slots', data),
      deleteSlot:   (id: number)         => api.delete(`/trainer-slots/${id}`),
      propose:      (id: number, tutorId: number) =>
        api.put(`/trainer-slots/${id}/propose`, { tutorId }),
      cancelPropose:(id: number)         => api.delete(`/trainer-slots/${id}/propose`),
      confirm:      (id: number)         => api.put(`/trainer-slots/${id}/confirm`),
    },

    // ── Validation ────────────────────────────────────────────────────────────
    validation: {
      validateStudent: (id: number) =>
        api.post(`/reports/${id}/validate/student`),
      validateTrainer: (id: number, comment?: string) =>
        api.post(`/reports/${id}/validate/trainer`, comment ? { comment } : {}),
      validateTutor: (id: number, comment?: string) =>
        api.post(`/reports/${id}/validate/tutor`, comment ? { comment } : {}),
      pending: () => api.get('/reports/pending'),
    },
  }
}
