<template>
  <div class="bg-white rounded-xl border overflow-hidden" :class="cardClass">

    <!-- En-tête -->
    <div class="px-5 py-3 border-b flex items-center justify-between" :class="headerClass">
      <h3 class="text-sm font-semibold" :class="titleClass">{{ section.label }}</h3>
      <span v-if="editable && charCount > 0" class="text-xs tabular-nums opacity-60">
        {{ charCount }} car.
      </span>
    </div>

    <!-- Corps -->
    <div class="px-5 py-4">
      <textarea
        v-if="editable"
        :value="section.content"
        @input="onInput"
        rows="4"
        class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-y transition-shadow"
        :placeholder="`Rédiger la section « ${section.label.toLowerCase()} »…`"
      />
      <div v-else class="min-h-[2.5rem]">
        <p
          v-if="section.content?.trim()"
          class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed"
        >{{ section.content }}</p>
        <p v-else class="text-sm text-gray-400 italic">Non renseigné.</p>
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

const emit = defineEmits<{
  update: [sectionType: SectionType, content: string]
}>()

const SECTION_STYLES: Record<string, { card: string; header: string; title: string }> = {
  SCHOOL_ACTIVITIES:  { card: 'border-blue-200',  header: 'bg-blue-50 border-blue-200',  title: 'text-blue-800'  },
  COMPANY_ACTIVITIES: { card: 'border-green-200', header: 'bg-green-50 border-green-200', title: 'text-green-800' },
  FREE_COMMENT:       { card: 'border-gray-200',  header: 'bg-gray-50 border-gray-200',   title: 'text-gray-700'  },
}

const style       = computed(() => SECTION_STYLES[props.section.sectionType] ?? SECTION_STYLES.FREE_COMMENT)
const cardClass   = computed(() => style.value.card)
const headerClass = computed(() => style.value.header)
const titleClass  = computed(() => style.value.title)
const charCount   = computed(() => props.section.content?.length ?? 0)

const onInput = (e: Event) => {
  emit('update', props.section.sectionType, (e.target as HTMLTextAreaElement).value)
}
</script>
