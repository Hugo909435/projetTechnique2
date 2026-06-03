<template>
  <form @submit.prevent="handleSubmit" novalidate>

    <!-- Barre d'actions sticky -->
    <div v-if="editable" class="sticky top-4 z-10 mb-6">
      <div class="bg-white border border-gray-200 rounded-xl shadow-md px-4 py-3 flex items-center justify-between gap-3">
        <span class="text-sm text-gray-500 hidden sm:block">
          {{ willReset ? 'Les validations précédentes seront réinitialisées.' : 'Brouillon — non encore validé.' }}
        </span>
        <p v-if="error" class="text-sm text-red-600 font-medium">{{ error }}</p>
        <div class="flex items-center gap-2 ml-auto">
          <button
            type="submit"
            :disabled="saving"
            class="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {{ saving ? 'Enregistrement…' : willReset ? 'Enregistrer' : 'Enregistrer le brouillon' }}
          </button>
          <button
            v-if="!willReset"
            type="button"
            :disabled="saving"
            @click="$emit('validate')"
            class="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Valider
          </button>
        </div>
      </div>
    </div>

    <!-- Sections -->
    <div class="space-y-3">
      <ReportSectionEditor
        v-for="section in localSections"
        :key="section.sectionType"
        :section="section"
        :editable="editable"
        @update="handleSectionUpdate"
      />
    </div>

  </form>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { ReportSection, SectionType, SectionUpdate } from '~/types/report'

const props = defineProps<{
  sections: ReportSection[]
  editable: boolean
  willReset?: boolean
  saving: boolean
  error: string | null
}>()

const emit = defineEmits<{
  save:     [sections: SectionUpdate[]]
  validate: []
}>()

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

defineExpose({ submit: handleSubmit })
</script>
