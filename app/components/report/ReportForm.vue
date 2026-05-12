<template>
  <form @submit.prevent="handleSubmit" novalidate>
    <!-- Sections -->
    <div class="space-y-4">
      <ReportReportSectionEditor
        v-for="section in localSections"
        :key="section.sectionType"
        :section="section"
        :editable="editable"
        @update="handleSectionUpdate"
      />
    </div>

    <!-- Actions -->
    <div v-if="editable" class="mt-6 flex flex-wrap items-center gap-3">
      <!-- Sauvegarde -->
      <button
        type="submit"
        :disabled="saving"
        class="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
      >
        {{ saving ? 'Enregistrement…' : 'Enregistrer le brouillon' }}
      </button>

      <!-- Valider (sera branché au module suivant) -->
      <button
        type="button"
        :disabled="saving"
        @click="$emit('validate')"
        class="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
      >
        Valider mon rapport
      </button>
    </div>

    <p v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</p>
  </form>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { ReportSection, SectionType, SectionUpdate } from '~/types/report'

const props = defineProps<{
  sections: ReportSection[]
  editable: boolean
  saving: boolean
  error: string | null
}>()

const emit = defineEmits<{
  save:     [sections: SectionUpdate[]]
  validate: []
}>()

// Copie locale réactive des sections
const localSections = ref<ReportSection[]>([])

watchEffect(() => {
  localSections.value = props.sections.map((s) => ({ ...s }))
})

const handleSectionUpdate = (type: SectionType, content: string) => {
  const idx = localSections.value.findIndex((s) => s.sectionType === type)
  if (idx !== -1) localSections.value[idx] = { ...localSections.value[idx], content }
}

const sectionSchema = z.object({
  sectionType: z.string().min(1),
  content:     z.string().default(''),
})

const handleSubmit = () => {
  const updates = localSections.value.map((s) =>
    sectionSchema.parse({ sectionType: s.sectionType, content: s.content ?? '' })
  ) as SectionUpdate[]
  emit('save', updates)
}
</script>
