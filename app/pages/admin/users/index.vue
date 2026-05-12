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
        <UiField label="Prénom *" v-model="form.firstName" />
        <UiField label="Nom *" v-model="form.lastName" />
        <UiField label="Email *" v-model="form.email" type="email" />
        <UiField label="Mot de passe *" v-model="form.password" type="password" />
        <UiField label="Téléphone" v-model="form.phone" />
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
          <select v-model="form.role" class="input">
            <option value="STUDENT">Étudiant</option>
            <option value="TRAINER">Formateur</option>
            <option value="TUTOR">Tuteur</option>
          </select>
        </div>
        <template v-if="form.role === 'STUDENT'">
          <UiField label="N° étudiant" v-model="form.studentNumber" />
          <UiField label="Entreprise" v-model="form.companyName" />
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
      <button v-for="f in filters" :key="f.value" @click="activeFilter = f.value"
        :class="['px-3 py-1.5 rounded-md text-sm', activeFilter === f.value
          ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50']">
        {{ f.label }}
      </button>
    </div>

    <div v-if="loading" class="text-gray-500">Chargement…</div>

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
          <tr v-for="u in filteredUsers" :key="u.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-gray-800">{{ u.firstName }} {{ u.lastName }}</td>
            <td class="px-6 py-4 text-gray-600">{{ u.email }}</td>
            <td class="px-6 py-4">
              <span :class="['text-xs px-2 py-0.5 rounded font-medium', roleClass(u.role)]">
                {{ roleLabel(u.role) }}
              </span>
            </td>
            <td class="px-6 py-4 text-gray-500">{{ u.phone ?? '—' }}</td>
            <td class="px-6 py-4 text-center">
              <button @click="deleteUser(u.id)"
                class="text-red-500 hover:underline text-xs">
                Supprimer
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin'] })

const { users: usersApi } = useApi()

const users = ref<any[]>([])
const loading = ref(true)
const showForm = ref(false)
const submitting = ref(false)
const formError = ref('')
const activeFilter = ref('ALL')

const filters = [
  { label: 'Tous',       value: 'ALL'     },
  { label: 'Étudiants',  value: 'STUDENT' },
  { label: 'Formateurs', value: 'TRAINER' },
  { label: 'Tuteurs',    value: 'TUTOR'   },
]

const form = reactive({
  firstName: '', lastName: '', email: '', password: '',
  phone: '', role: 'STUDENT', studentNumber: '', companyName: '',
})

const filteredUsers = computed(() =>
  activeFilter.value === 'ALL'
    ? users.value
    : users.value.filter((u) => u.role === activeFilter.value)
)

onMounted(async () => {
  try {
    const res = await usersApi.list()
    users.value = res.data.filter((u: any) => u.role !== 'ADMIN')
  } finally {
    loading.value = false
  }
})

const openCreate = () => {
  showForm.value = true
  formError.value = ''
  Object.assign(form, {
    firstName: '', lastName: '', email: '', password: '',
    phone: '', role: 'STUDENT', studentNumber: '', companyName: '',
  })
}

const submitCreate = async () => {
  submitting.value = true
  formError.value = ''
  try {
    const res = await usersApi.create({ ...form })
    users.value.push(res.data)
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
  users.value = users.value.filter((u) => u.id !== id)
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
