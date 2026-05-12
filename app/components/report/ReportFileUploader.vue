<template>
  <div>
    <label
      class="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
      :class="{ 'opacity-50 cursor-not-allowed pointer-events-none': uploading }"
    >
      <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1" />
      </svg>
      <span class="text-sm text-gray-500">
        {{ uploading ? 'Envoi en cours…' : 'Cliquer pour ajouter un fichier' }}
      </span>
      <span class="text-xs text-gray-400 mt-1">PDF, Word, Excel, PowerPoint, image — 10 Mo max</span>
      <input
        type="file"
        class="hidden"
        :accept="ACCEPTED"
        :disabled="uploading"
        @change="handleFileChange"
      />
    </label>

    <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
const ACCEPTED = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg'

const props = defineProps<{ reportId: number }>()
const emit = defineEmits<{ uploaded: [] }>()

const { files: filesApi } = useApi()
const uploading = ref(false)
const error = ref('')

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  error.value = ''
  uploading.value = true

  try {
    await filesApi.upload(props.reportId, file)
    emit('uploaded')
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Erreur lors de l\'envoi du fichier'
  } finally {
    uploading.value = false
    input.value = ''
  }
}
</script>
