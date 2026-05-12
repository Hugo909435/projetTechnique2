<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/trainer/students" class="text-blue-600 hover:underline text-sm">
        ← Retour
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-800">Fiche étudiant</h1>
    </div>

    <div v-if="loading" class="text-gray-500">Chargement…</div>

    <template v-else-if="student">
      <!-- Profil étudiant -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-gray-700">Informations étudiant</h2>
          <button
            v-if="canEdit"
            @click="editMode = !editMode"
            class="text-sm text-blue-600 hover:underline"
          >
            {{ editMode ? 'Annuler' : 'Modifier' }}
          </button>
        </div>

        <form v-if="editMode" @submit.prevent="saveStudent" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Prénom" v-model="form.firstName" />
          <Field label="Nom" v-model="form.lastName" />
          <Field label="Téléphone" v-model="form.phone" />
          <Field label="N° étudiant" v-model="form.studentNumber" />
          <Field label="Entreprise" v-model="form.companyName" class="sm:col-span-2" />
          <div class="sm:col-span-2 flex gap-3">
            <button type="submit" :disabled="saving"
              class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm">
              {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
          </div>
        </form>

        <dl v-else class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <InfoRow label="Prénom"    :value="student.firstName" />
          <InfoRow label="Nom"       :value="student.lastName" />
          <InfoRow label="Email"     :value="student.email" />
          <InfoRow label="Téléphone" :value="student.phone ?? '—'" />
          <InfoRow label="N° étudiant" :value="student.studentNumber ?? '—'" />
          <InfoRow label="Entreprise"  :value="student.companyName ?? '—'" />
        </dl>
      </div>

      <!-- Tuteur -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-gray-700">Tuteur entreprise</h2>
          <button
            v-if="canEdit && student.tutor"
            @click="editTutorMode = !editTutorMode"
            class="text-sm text-blue-600 hover:underline"
          >
            {{ editTutorMode ? 'Annuler' : 'Modifier' }}
          </button>
        </div>

        <p v-if="!student.tutor" class="text-gray-400 italic text-sm">Aucun tuteur assigné.</p>

        <form v-else-if="editTutorMode" @submit.prevent="saveTutor" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Prénom" v-model="tutorForm.firstName" />
          <Field label="Nom" v-model="tutorForm.lastName" />
          <Field label="Téléphone" v-model="tutorForm.phone" />
          <Field label="Email" v-model="tutorForm.email" type="email" />
          <div class="sm:col-span-2 flex gap-3">
            <button type="submit" :disabled="savingTutor"
              class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm">
              {{ savingTutor ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
          </div>
        </form>

        <dl v-else-if="student.tutor" class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <InfoRow label="Prénom" :value="student.tutor.firstName" />
          <InfoRow label="Nom"    :value="student.tutor.lastName" />
          <InfoRow label="Email"  :value="student.tutor.email" />
          <InfoRow label="Téléphone" :value="student.tutor.phone ?? '—'" />
        </dl>
      </div>

      <!-- Formateur (lecture seule) -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-base font-semibold text-gray-700 mb-4">Formateur école</h2>
        <p v-if="!student.trainer" class="text-gray-400 italic text-sm">Aucun formateur assigné.</p>
        <dl v-else class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <InfoRow label="Prénom" :value="student.trainer.firstName" />
          <InfoRow label="Nom"    :value="student.trainer.lastName" />
          <InfoRow label="Email"  :value="student.trainer.email" />
        </dl>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: ['auth', 'role'],
  requiredRoles: ['TRAINER', 'TUTOR', 'ADMIN'],
})

const authStore = useAuthStore()
const route = useRoute()
const { students: studentsApi } = useApi()

const studentId = Number(route.params.id)
const student = ref<any>(null)
const loading = ref(true)
const editMode = ref(false)
const editTutorMode = ref(false)
const saving = ref(false)
const savingTutor = ref(false)

const canEdit = computed(() => authStore.hasRole('TRAINER', 'ADMIN'))

const form = reactive({
  firstName: '', lastName: '', phone: '', studentNumber: '', companyName: '',
})
const tutorForm = reactive({
  firstName: '', lastName: '', phone: '', email: '',
})

onMounted(async () => {
  try {
    const res = await studentsApi.get(studentId)
    student.value = res.data
    Object.assign(form, {
      firstName: res.data.firstName,
      lastName: res.data.lastName,
      phone: res.data.phone ?? '',
      studentNumber: res.data.studentNumber ?? '',
      companyName: res.data.companyName ?? '',
    })
    if (res.data.tutor) {
      Object.assign(tutorForm, {
        firstName: res.data.tutor.firstName,
        lastName: res.data.tutor.lastName,
        phone: res.data.tutor.phone ?? '',
        email: res.data.tutor.email ?? '',
      })
    }
  } finally {
    loading.value = false
  }
})

const saveStudent = async () => {
  saving.value = true
  try {
    const res = await studentsApi.update(studentId, { ...form })
    student.value = { ...student.value, ...res.data }
    editMode.value = false
  } finally {
    saving.value = false
  }
}

const saveTutor = async () => {
  savingTutor.value = true
  try {
    await studentsApi.updateTutor(studentId, { ...tutorForm })
    student.value.tutor = { ...student.value.tutor, ...tutorForm }
    editTutorMode.value = false
  } finally {
    savingTutor.value = false
  }
}
</script>
