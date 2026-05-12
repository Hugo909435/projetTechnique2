<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div class="px-5 py-3 bg-gray-50 border-b border-gray-200">
      <h3 class="text-sm font-semibold text-gray-700">{{ section.label }}</h3>
    </div>
    <div class="p-5">
      <textarea
        v-if="editable"
        :value="section.content"
        @input="$emit('update', section.sectionType, ($event.target as HTMLTextAreaElement).value)"
        rows="5"
        class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        :placeholder="`Rédiger : ${section.label.toLowerCase()}…`"
      />
      <div v-else class="min-h-[5rem]">
        <p v-if="section.content?.trim()" class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {{ section.content }}
        </p>
        <p v-else class="text-sm text-gray-400 italic">Aucun contenu renseigné.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ReportSection, SectionType } from '~/types/report'

defineProps<{
  section: ReportSection
  editable: boolean
}>()

defineEmits<{
  update: [sectionType: SectionType, content: string]
}>()
</script>
