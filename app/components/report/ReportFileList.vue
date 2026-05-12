<template>
  <div>
    <div v-if="loading" class="text-sm text-gray-400">Chargement…</div>

    <div v-else-if="files.length === 0" class="text-sm text-gray-400 italic">
      Aucun fichier joint.
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="f in files"
        :key="f.id"
        class="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5"
      >
        <div class="flex items-center gap-3 min-w-0">
          <span class="text-xs font-mono bg-white border border-gray-200 rounded px-1.5 py-0.5 uppercase text-gray-500 shrink-0">
            {{ ext(f.originalFilename) }}
          </span>
          <div class="min-w-0">
            <p class="text-sm font-medium text-gray-800 truncate">{{ f.originalFilename }}</p>
            <p class="text-xs text-gray-400">
              {{ formatSize(f.size) }} · {{ f.uploadedBy }} · {{ formatDate(f.createdAt) }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0 ml-3">
          <button
            @click="downloadFile(f)"
            :disabled="downloading === f.id"
            class="text-xs text-blue-600 hover:underline disabled:opacity-50"
          >
            {{ downloading === f.id ? 'Téléchargement…' : 'Télécharger' }}
          </button>
          <button
            v-if="editable"
            @click="confirmDelete(f)"
            :disabled="deleting === f.id"
            class="text-xs text-red-500 hover:underline disabled:opacity-50"
          >
            Supprimer
          </button>
        </div>
      </li>
    </ul>

    <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
interface ReportFile {
  id: number
  originalFilename: string
  contentType: string
  size: number
  uploadedBy: string
  createdAt: string
}

const props = defineProps<{
  reportId: number
  editable: boolean
}>()

const { files: filesApi } = useApi()

const files = ref<ReportFile[]>([])
const loading = ref(false)
const downloading = ref<number | null>(null)
const deleting = ref<number | null>(null)
const error = ref('')

const fetchFiles = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await filesApi.list(props.reportId)
    files.value = res.data
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

onMounted(fetchFiles)

defineExpose({ refresh: fetchFiles })

const downloadFile = async (f: ReportFile) => {
  downloading.value = f.id
  error.value = ''
  try {
    const res = await filesApi.download(f.id)
    const url = URL.createObjectURL(new Blob([res.data], { type: f.contentType }))
    const a = document.createElement('a')
    a.href = url
    a.download = f.originalFilename
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    error.value = 'Erreur lors du téléchargement'
  } finally {
    downloading.value = null
  }
}

const confirmDelete = async (f: ReportFile) => {
  if (!confirm(`Supprimer « ${f.originalFilename} » ?`)) return
  deleting.value = f.id
  error.value = ''
  try {
    await filesApi.delete(f.id)
    files.value = files.value.filter(x => x.id !== f.id)
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Erreur lors de la suppression'
  } finally {
    deleting.value = null
  }
}

const ext = (filename: string) => {
  const parts = filename.split('.')
  return parts.length > 1 ? parts.at(-1) : '?'
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / 1_048_576).toFixed(1)} Mo`
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
</script>
