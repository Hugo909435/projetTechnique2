<template>
  <div class="bg-white rounded-lg border border-gray-200 p-5">
    <h2 class="text-sm font-semibold text-gray-700 mb-4">Commentaires internes</h2>

    <div v-if="loading" class="text-sm text-gray-400">Chargement…</div>

    <div v-else>
      <!-- Liste des commentaires -->
      <div v-if="comments.length === 0" class="text-sm text-gray-400 italic mb-4">
        Aucun commentaire pour l'instant.
      </div>

      <div v-else class="space-y-3 mb-4">
        <div
          v-for="c in comments"
          :key="c.id"
          class="rounded-lg border border-gray-100 bg-gray-50 p-3"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <span class="text-xs font-semibold text-gray-700">{{ c.authorName }}</span>
              <span class="ml-1.5 text-xs text-gray-400">
                {{ ROLE_LABELS[c.authorRole] }} · {{ formatDate(c.createdAt) }}
              </span>
              <span v-if="c.updatedAt !== c.createdAt" class="ml-1 text-xs text-gray-400 italic">
                (modifié)
              </span>
            </div>
            <div v-if="c.canEdit || c.canDelete" class="flex gap-2 shrink-0">
              <button
                v-if="c.canEdit"
                @click="startEdit(c)"
                class="text-xs text-blue-600 hover:underline"
              >
                Modifier
              </button>
              <button
                v-if="c.canDelete"
                @click="confirmDelete(c.id)"
                :disabled="deleting === c.id"
                class="text-xs text-red-500 hover:underline disabled:opacity-50"
              >
                Supprimer
              </button>
            </div>
          </div>

          <!-- Mode édition -->
          <div v-if="editingId === c.id" class="mt-2">
            <textarea
              v-model="editContent"
              rows="3"
              class="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
            <div class="flex gap-2 mt-1.5">
              <button
                @click="saveEdit(c.id)"
                :disabled="saving"
                class="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
              </button>
              <button
                @click="cancelEdit"
                class="text-xs text-gray-500 px-3 py-1 hover:text-gray-700"
              >
                Annuler
              </button>
            </div>
          </div>

          <!-- Affichage normal -->
          <p v-else class="mt-1.5 text-sm text-gray-800 whitespace-pre-line">{{ c.content }}</p>
        </div>
      </div>

      <!-- Formulaire nouveau commentaire (TRAINER / TUTOR uniquement) -->
      <div v-if="canWrite" class="border-t border-gray-100 pt-4">
        <textarea
          v-model="newContent"
          rows="3"
          placeholder="Ajouter un commentaire interne…"
          class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
        <div class="flex items-center justify-between mt-2">
          <p v-if="createError" class="text-xs text-red-600">{{ createError }}</p>
          <span v-else />
          <button
            @click="addComment"
            :disabled="saving || !newContent.trim()"
            class="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ saving ? 'Publication…' : 'Publier' }}
          </button>
        </div>
      </div>
    </div>

    <p v-if="deleteError" class="mt-2 text-xs text-red-600">{{ deleteError }}</p>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

interface Comment {
  id: number
  reportId: number
  authorId: number
  authorName: string
  authorRole: string
  content: string
  createdAt: string
  updatedAt: string
  canEdit: boolean
  canDelete: boolean
}

const ROLE_LABELS: Record<string, string> = {
  TRAINER: 'Formateur',
  TUTOR: 'Tuteur',
  ADMIN: 'Admin',
}

const props = defineProps<{ reportId: number }>()

const authStore = useAuthStore()
const { comments: commentsApi } = useApi()

const comments   = ref<Comment[]>([])
const loading    = ref(false)
const saving     = ref(false)
const deleting   = ref<number | null>(null)
const newContent = ref('')
const createError = ref('')
const deleteError = ref('')
const editingId  = ref<number | null>(null)
const editContent = ref('')

const canWrite = computed(() => authStore.isTrainer || authStore.isTutor)

onMounted(fetchComments)

async function fetchComments() {
  loading.value = true
  try {
    const res = await commentsApi.list(props.reportId)
    comments.value = res.data
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

async function addComment() {
  if (!newContent.value.trim()) return
  createError.value = ''
  saving.value = true
  try {
    const res = await commentsApi.create(props.reportId, newContent.value.trim())
    comments.value.push(res.data)
    newContent.value = ''
  } catch (e: any) {
    createError.value = e.response?.data?.message ?? 'Erreur lors de la publication'
  } finally {
    saving.value = false
  }
}

function startEdit(c: Comment) {
  editingId.value = c.id
  editContent.value = c.content
}

function cancelEdit() {
  editingId.value = null
  editContent.value = ''
}

async function saveEdit(commentId: number) {
  if (!editContent.value.trim()) return
  saving.value = true
  try {
    const res = await commentsApi.update(commentId, editContent.value.trim())
    const idx = comments.value.findIndex(c => c.id === commentId)
    if (idx !== -1) comments.value[idx] = res.data
    cancelEdit()
  } catch (e: any) {
    deleteError.value = e.response?.data?.message ?? 'Erreur lors de la modification'
  } finally {
    saving.value = false
  }
}

async function confirmDelete(commentId: number) {
  if (!confirm('Supprimer ce commentaire ?')) return
  deleteError.value = ''
  deleting.value = commentId
  try {
    await commentsApi.delete(commentId)
    comments.value = comments.value.filter(c => c.id !== commentId)
  } catch (e: any) {
    deleteError.value = e.response?.data?.message ?? 'Erreur lors de la suppression'
  } finally {
    deleting.value = null
  }
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
</script>
