<template>
  <div class="rounded-lg border overflow-hidden" :class="cardClass">
    <!-- En-tête section -->
    <div class="px-5 py-3 border-b flex items-center gap-2" :class="headerClass">
      <span class="text-base">{{ icon }}</span>
      <h3 class="text-sm font-semibold" :class="titleClass">{{ section.label }}</h3>
    </div>

    <!-- Corps -->
    <div class="p-5 bg-white">
      <textarea
        v-if="editable"
        :value="section.content"
        @input="$emit('update', section.sectionType, ($event.target as HTMLTextAreaElement).value)"
        rows="5"
        class="w-full px-3 py-2 border-2 border-blue-300 rounded-md text-sm bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-y transition-colors"
        :placeholder="`✏️ Rédiger ici : ${section.label.toLowerCase()}…`"
      />
      <div v-else class="min-h-[4rem]">
        <p
          v-if="section.content?.trim()"
          class="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed"
        >
          {{ section.content }}
        </p>
        <p v-else class="text-sm text-gray-400 italic">Aucun contenu renseigné.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ReportSection, SectionType } from '~/types/report'

const props = defineProps<{
  section: ReportSection
  editable: boolean
}>()

defineEmits<{
  update: [sectionType: SectionType, content: string]
}>()

const SECTION_STYLES: Record<string, { card: string; header: string; title: string; icon: string }> = {
  SCHOOL_ACTIVITIES:  { card: 'border-blue-200',   header: 'bg-blue-50 border-blue-200',   title: 'text-blue-800',   icon: '🎓' },
  COMPANY_ACTIVITIES: { card: 'border-green-200',  header: 'bg-green-50 border-green-200',  title: 'text-green-800',  icon: '🏢' },
  SKILLS:             { card: 'border-indigo-200', header: 'bg-indigo-50 border-indigo-200', title: 'text-indigo-800', icon: '⚡' },
  DIFFICULTIES:       { card: 'border-orange-200', header: 'bg-orange-50 border-orange-200', title: 'text-orange-800', icon: '⚠️' },
  SOLUTIONS:          { card: 'border-teal-200',   header: 'bg-teal-50 border-teal-200',    title: 'text-teal-800',   icon: '✅' },
  OBJECTIVES:         { card: 'border-purple-200', header: 'bg-purple-50 border-purple-200', title: 'text-purple-800', icon: '🎯' },
  FREE_COMMENT:       { card: 'border-gray-200',   header: 'bg-gray-50 border-gray-200',    title: 'text-gray-700',   icon: '💬' },
}

const style = computed(() => SECTION_STYLES[props.section.sectionType] ?? SECTION_STYLES.FREE_COMMENT)
const cardClass   = computed(() => style.value.card)
const headerClass = computed(() => style.value.header)
const titleClass  = computed(() => style.value.title)
const icon        = computed(() => style.value.icon)
</script>
