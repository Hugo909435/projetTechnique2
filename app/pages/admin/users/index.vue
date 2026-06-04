<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Utilisateurs</h1>
      <button @click="openCreate" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
        + Nouvel utilisateur
      </button>
    </div>

    <!-- Formulaire création -->
    <div v-if="showForm" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 class="text-base font-semibold text-gray-700 mb-4">Créer un utilisateur</h2>
      <form @submit.prevent="submitCreate" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Prénom *" v-model="form.firstName" />
        <Field label="Nom *" v-model="form.lastName" />
        <Field label="Email *" v-model="form.email" type="email" />
        <Field label="Mot de passe *" v-model="form.password" type="password" />
        <Field label="Téléphone" v-model="form.phone" />
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
          <select v-model="form.role" class="input">
            <option value="STUDENT">Étudiant</option>
            <option value="TRAINER">Formateur</option>
            <option value="TUTOR">Tuteur</option>
          </select>
        </div>
        <template v-if="form.role === 'STUDENT'">
          <Field label="N° étudiant" v-model="form.studentNumber" />
          <Field label="Entreprise" v-model="form.companyName" />
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Formateur</label>
            <select v-model="form.trainerId" class="input">
              <option :value="null">— Aucun —</option>
              <option v-for="t in trainers" :key="t.id" :value="t.id">
                {{ t.firstName }} {{ t.lastName }}
              </option>
            </select>
            <p v-if="!trainers.length" class="text-xs text-gray-400 mt-1">Aucun formateur enregistré</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tuteur entreprise</label>
            <select v-model="form.tutorId" class="input">
              <option :value="null">— Aucun —</option>
              <option v-for="t in tutors" :key="t.id" :value="t.id">
                {{ t.firstName }} {{ t.lastName }}
              </option>
            </select>
            <p v-if="!tutors.length" class="text-xs text-gray-400 mt-1">Aucun tuteur enregistré</p>
          </div>
        </template>
        <div v-if="formError" class="sm:col-span-2 text-sm text-red-600">{{ formError }}</div>
        <div class="sm:col-span-2 flex gap-3">
          <button type="submit" :disabled="submitting"
            class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm">
            {{ submitting ? 'Création…' : 'Créer' }}
          </button>
          <button type="button" @click="showForm = false" class="text-gray-500 text-sm px-4 py-2 hover:text-gray-700">
            Annuler
          </button>
        </div>
      </form>
    </div>

    <!-- Filtres -->
    <div class="flex gap-2 mb-4">
      <button v-for="f in filters" :key="f.value" @click="setFilter(f.value)"
        :class="['px-3 py-1.5 rounded-md text-sm', activeFilter === f.value
          ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50']">
        {{ f.label }}
        <span class="ml-1 opacity-70">({{ filterCount(f.value) }})</span>
      </button>
    </div>

    <div v-if="loading" class="text-gray-500 py-8 text-center">Chargement…</div>

    <!-- Vue Étudiants enrichie -->
    <div v-else-if="activeFilter === 'STUDENT'" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-6 py-3 font-medium text-gray-600">Étudiant</th>
            <th class="text-left px-6 py-3 font-medium text-gray-600">Email</th>
            <th class="text-left px-6 py-3 font-medium text-gray-600">Entreprise</th>
            <th class="text-left px-6 py-3 font-medium text-gray-600">Formateur</th>
            <th class="text-left px-6 py-3 font-medium text-gray-600">Tuteur entreprise</th>
            <th class="text-center px-6 py-3 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <template v-for="s in studentProfiles" :key="s.id">
            <tr class="hover:bg-gray-50" :class="{ 'bg-blue-50': assigningStudent?.id === s.id }">
              <td class="px-6 py-4 font-medium text-gray-800">{{ s.firstName }} {{ s.lastName }}</td>
              <td class="px-6 py-4 text-gray-600">{{ s.email }}</td>
              <td class="px-6 py-4 text-gray-500">{{ s.companyName ?? '—' }}</td>
              <td class="px-6 py-4">
                <span v-if="s.trainer" class="text-blue-700 font-medium">
                  {{ s.trainer.firstName }} {{ s.trainer.lastName }}
                </span>
                <span v-else class="text-gray-400 italic text-xs">Non assigné</span>
              </td>
              <td class="px-6 py-4">
                <span v-if="s.tutor" class="text-purple-700 font-medium">
                  {{ s.tutor.firstName }} {{ s.tutor.lastName }}
                </span>
                <span v-else class="text-gray-400 italic text-xs">Non assigné</span>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex gap-3 justify-center">
                  <button @click="openEdit(s)"
                    class="text-yellow-600 hover:underline text-xs font-medium">
                    {{ editingUser?.id === s.id ? 'Fermer' : 'Modifier' }}
                  </button>
                  <button @click="toggleAssign(s)"
                    class="text-blue-600 hover:underline text-xs font-medium">
                    {{ assigningStudent?.id === s.id ? 'Fermer' : 'Assigner' }}
                  </button>
                  <button @click="deleteUser(s.id)" class="text-red-500 hover:underline text-xs">
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
            <!-- Panel d'assignation inline -->
            <tr v-if="assigningStudent?.id === s.id" class="bg-blue-50">
              <td colspan="6" class="px-6 py-4 border-t border-blue-100">
                <div class="flex flex-wrap gap-4 items-end">
                  <div class="min-w-52">
                    <label class="block text-xs font-medium text-gray-600 mb-1">Formateur</label>
                    <select v-model="assignForm.trainerId" class="input">
                      <option :value="null">— Aucun —</option>
                      <option v-for="t in trainers" :key="t.id" :value="t.id">
                        {{ t.firstName }} {{ t.lastName }}
                      </option>
                    </select>
                  </div>
                  <div class="min-w-52">
                    <label class="block text-xs font-medium text-gray-600 mb-1">Tuteur entreprise</label>
                    <select v-model="assignForm.tutorId" class="input">
                      <option :value="null">— Aucun —</option>
                      <option v-for="t in tutors" :key="t.id" :value="t.id">
                        {{ t.firstName }} {{ t.lastName }}
                      </option>
                    </select>
                  </div>
                  <div class="flex gap-2">
                    <button @click="submitAssign" :disabled="assignSubmitting"
                      class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-xs">
                      {{ assignSubmitting ? 'Enregistrement…' : 'Enregistrer' }}
                    </button>
                    <button @click="assigningStudent = null"
                      class="text-gray-500 text-xs px-3 py-2 hover:text-gray-700">
                      Annuler
                    </button>
                  </div>
                  <p v-if="assignError" class="w-full text-sm text-red-600">{{ assignError }}</p>
                </div>
              </td>
            </tr>
            <!-- Panel de modification inline -->
            <tr v-if="editingUser?.id === s.id" class="bg-yellow-50">
              <td colspan="6" class="px-6 py-4 border-t border-yellow-100">
                <div class="flex flex-wrap gap-4 items-end">
                  <div class="min-w-40">
                    <label class="block text-xs font-medium text-gray-600 mb-1">Prénom</label>
                    <input v-model="editForm.firstName" class="input" />
                  </div>
                  <div class="min-w-40">
                    <label class="block text-xs font-medium text-gray-600 mb-1">Nom</label>
                    <input v-model="editForm.lastName" class="input" />
                  </div>
                  <div class="min-w-40">
                    <label class="block text-xs font-medium text-gray-600 mb-1">Téléphone</label>
                    <input v-model="editForm.phone" class="input" />
                  </div>
                  <div class="flex gap-2">
                    <button @click="submitEdit" :disabled="editSubmitting"
                      class="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 disabled:opacity-50 text-xs">
                      {{ editSubmitting ? 'Enregistrement…' : 'Enregistrer' }}
                    </button>
                    <button @click="editingUser = null" class="text-gray-500 text-xs px-3 py-2 hover:text-gray-700">
                      Annuler
                    </button>
                  </div>
                  <p v-if="editError" class="w-full text-sm text-red-600">{{ editError }}</p>
                </div>
              </td>
            </tr>
          </template>
          <tr v-if="!studentProfiles.length">
            <td colspan="6" class="px-6 py-8 text-center text-gray-400 italic">Aucun étudiant</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Vue standard (ALL / TRAINER / TUTOR) -->
    <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-6 py-3 font-medium text-gray-600">Nom</th>
            <th class="text-left px-6 py-3 font-medium text-gray-600">Email</th>
            <th class="text-left px-6 py-3 font-medium text-gray-600">Rôle</th>
            <th class="text-left px-6 py-3 font-medium text-gray-600">Téléphone</th>
            <th class="text-center px-6 py-3 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <template v-for="u in filteredUsers" :key="u.id">
            <tr class="hover:bg-gray-50" :class="{ 'bg-yellow-50': editingUser?.id === u.id }">
              <td class="px-6 py-4 font-medium text-gray-800">{{ u.firstName }} {{ u.lastName }}</td>
              <td class="px-6 py-4 text-gray-600">{{ u.email }}</td>
              <td class="px-6 py-4">
                <span :class="['text-xs px-2 py-0.5 rounded font-medium', roleClass(u.role)]">
                  {{ roleLabel(u.role) }}
                </span>
              </td>
              <td class="px-6 py-4 text-gray-500">{{ u.phone ?? '—' }}</td>
              <td class="px-6 py-4 text-center">
                <div class="flex gap-3 justify-center">
                  <button @click="openEdit(u)" class="text-yellow-600 hover:underline text-xs font-medium">
                    {{ editingUser?.id === u.id ? 'Fermer' : 'Modifier' }}
                  </button>
                  <button @click="deleteUser(u.id)" class="text-red-500 hover:underline text-xs">
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="editingUser?.id === u.id" class="bg-yellow-50">
              <td colspan="5" class="px-6 py-4 border-t border-yellow-100">
                <div class="flex flex-wrap gap-4 items-end">
                  <div class="min-w-40">
                    <label class="block text-xs font-medium text-gray-600 mb-1">Prénom</label>
                    <input v-model="editForm.firstName" class="input" />
                  </div>
                  <div class="min-w-40">
                    <label class="block text-xs font-medium text-gray-600 mb-1">Nom</label>
                    <input v-model="editForm.lastName" class="input" />
                  </div>
                  <div class="min-w-40">
                    <label class="block text-xs font-medium text-gray-600 mb-1">Téléphone</label>
                    <input v-model="editForm.phone" class="input" />
                  </div>
                  <div class="flex gap-2">
                    <button @click="submitEdit" :disabled="editSubmitting"
                      class="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 disabled:opacity-50 text-xs">
                      {{ editSubmitting ? 'Enregistrement…' : 'Enregistrer' }}
                    </button>
                    <button @click="editingUser = null" class="text-gray-500 text-xs px-3 py-2 hover:text-gray-700">
                      Annuler
                    </button>
                  </div>
                  <p v-if="editError" class="w-full text-sm text-red-600">{{ editError }}</p>
                </div>
              </td>
            </tr>
          </template>
          <tr v-if="!filteredUsers.length">
            <td colspan="5" class="px-6 py-8 text-center text-gray-400 italic">Aucun utilisateur</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin'] })

const { users: usersApi, students: studentsApi } = useApi()

const users = ref<any[]>([])
const studentProfiles = ref<any[]>([])
const loading = ref(true)
const showForm = ref(false)
const submitting = ref(false)
const formError = ref('')
const activeFilter = ref('ALL')
const assigningStudent = ref<any>(null)
const assignSubmitting = ref(false)
const assignError = ref('')

const editingUser = ref<any>(null)
const editSubmitting = ref(false)
const editError = ref('')

const editForm = reactive({
  firstName: '',
  lastName: '',
  phone: '',
})

const filters = [
  { label: 'Tous',       value: 'ALL'     },
  { label: 'Étudiants',  value: 'STUDENT' },
  { label: 'Formateurs', value: 'TRAINER' },
  { label: 'Tuteurs',    value: 'TUTOR'   },
]

const form = reactive({
  firstName: '', lastName: '', email: '', password: '',
  phone: '', role: 'STUDENT', studentNumber: '', companyName: '',
  trainerId: null as number | null,
  tutorId: null as number | null,
})

const assignForm = reactive({
  trainerId: null as number | null,
  tutorId: null as number | null,
})

const trainers = computed(() => users.value.filter(u => u.role === 'TRAINER'))
const tutors = computed(() => users.value.filter(u => u.role === 'TUTOR'))

const filteredUsers = computed(() => {
  if (activeFilter.value === 'ALL') return users.value
  return users.value.filter(u => u.role === activeFilter.value)
})

const filterCount = (filter: string) => {
  if (filter === 'ALL') return users.value.length
  if (filter === 'STUDENT') return studentProfiles.value.length
  return users.value.filter(u => u.role === filter).length
}

onMounted(async () => {
  try {
    const [usersRes, studentsRes] = await Promise.all([
      usersApi.list(),
      studentsApi.list(),
    ])
    users.value = usersRes.data.filter((u: any) => u.role !== 'ADMIN')
    studentProfiles.value = studentsRes.data
  } finally {
    loading.value = false
  }
})

const setFilter = (f: string) => {
  activeFilter.value = f
  assigningStudent.value = null
}

const openCreate = () => {
  showForm.value = true
  formError.value = ''
  Object.assign(form, {
    firstName: '', lastName: '', email: '', password: '',
    phone: '', role: 'STUDENT', studentNumber: '', companyName: '',
    trainerId: null, tutorId: null,
  })
}

const submitCreate = async () => {
  submitting.value = true
  formError.value = ''
  try {
    const payload: any = { ...form }
    if (form.role !== 'STUDENT') {
      delete payload.studentNumber
      delete payload.companyName
      delete payload.trainerId
      delete payload.tutorId
    }
    const res = await usersApi.create(payload)
    users.value.push(res.data)
    if (form.role === 'STUDENT') {
      const sRes = await studentsApi.list()
      studentProfiles.value = sRes.data
    }
    showForm.value = false
  } catch (err: any) {
    formError.value = err.response?.data?.message ?? 'Erreur lors de la création'
  } finally {
    submitting.value = false
  }
}

const deleteUser = async (id: number) => {
  if (!confirm('Supprimer cet utilisateur ?')) return
  await usersApi.delete(id)
  users.value = users.value.filter(u => u.id !== id)
  studentProfiles.value = studentProfiles.value.filter(s => s.id !== id)
}

const toggleAssign = (student: any) => {
  if (assigningStudent.value?.id === student.id) {
    assigningStudent.value = null
    return
  }
  assigningStudent.value = student
  assignError.value = ''
  assignForm.trainerId = student.trainer?.id ?? null
  assignForm.tutorId = student.tutor?.id ?? null
}

const submitAssign = async () => {
  if (!assigningStudent.value) return
  assignSubmitting.value = true
  assignError.value = ''
  try {
    const studentId = assigningStudent.value.id
    const promises: Promise<any>[] = []
    if (assignForm.trainerId && assignForm.trainerId !== (assigningStudent.value.trainer?.id ?? null)) {
      promises.push(studentsApi.assignTrainer(studentId, assignForm.trainerId))
    }
    if (assignForm.tutorId && assignForm.tutorId !== (assigningStudent.value.tutor?.id ?? null)) {
      promises.push(studentsApi.assignTutor(studentId, assignForm.tutorId))
    }
    await Promise.all(promises)
    const sRes = await studentsApi.list()
    studentProfiles.value = sRes.data
    assigningStudent.value = null
  } catch (err: any) {
    assignError.value = err.response?.data?.message ?? "Erreur lors de l'assignation"
  } finally {
    assignSubmitting.value = false
  }
}

const openEdit = (user: any) => {
  if (editingUser.value?.id === user.id) {
    editingUser.value = null
    return
  }
  editingUser.value = user
  editError.value = ''
  editForm.firstName = user.firstName ?? ''
  editForm.lastName = user.lastName ?? ''
  editForm.phone = user.phone ?? ''
}

const submitEdit = async () => {
  if (!editingUser.value) return
  editSubmitting.value = true
  editError.value = ''
  try {
    const res = await usersApi.update(editingUser.value.id, { ...editForm })
    const updated = res.data
    const idx = users.value.findIndex(u => u.id === updated.id)
    if (idx !== -1) users.value[idx] = { ...users.value[idx], ...updated }
    const sIdx = studentProfiles.value.findIndex(s => s.id === updated.id)
    if (sIdx !== -1) studentProfiles.value[sIdx] = { ...studentProfiles.value[sIdx], ...updated }
    editingUser.value = null
  } catch (err: any) {
    editError.value = err.response?.data?.message ?? 'Erreur lors de la modification'
  } finally {
    editSubmitting.value = false
  }
}

const roleLabel = (role: string) => ({
  STUDENT: 'Étudiant', TRAINER: 'Formateur', TUTOR: 'Tuteur', ADMIN: 'Admin',
}[role] ?? role)

const roleClass = (role: string) => ({
  STUDENT: 'bg-green-100 text-green-700',
  TRAINER: 'bg-blue-100 text-blue-700',
  TUTOR:   'bg-purple-100 text-purple-700',
  ADMIN:   'bg-red-100 text-red-700',
}[role] ?? 'bg-gray-100 text-gray-700')
</script>

<style scoped>
.input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm;
}
</style>
