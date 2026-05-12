<template>
  <ol class="space-y-3">
    <li v-for="step in steps" :key="step.label" class="flex items-start gap-3">
      <!-- Icône -->
      <div class="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
        :class="step.done
          ? 'bg-green-500 text-white'
          : step.active
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-400'"
      >
        <span v-if="step.done">✓</span>
        <span v-else>·</span>
      </div>

      <!-- Texte -->
      <div class="min-w-0">
        <p class="text-sm font-medium"
          :class="step.done ? 'text-gray-800' : step.active ? 'text-blue-700' : 'text-gray-400'">
          {{ step.label }}
        </p>
        <p v-if="step.timestamp" class="text-xs text-gray-500 mt-0.5">
          {{ formatDate(step.timestamp) }}
          <span v-if="step.auto" class="ml-1 text-yellow-600">(auto)</span>
        </p>
        <p v-else-if="step.active" class="text-xs text-blue-500 mt-0.5">En attente</p>
      </div>
    </li>
  </ol>
</template>

<script setup lang="ts">
import type { Report } from '~/types/report'

const props = defineProps<{ report: Report }>()

const steps = computed(() => {
  const r = props.report
  const studentDone = [
    'STUDENT_VALIDATED', 'AUTO_VALIDATED',
    'TRAINER_VALIDATED', 'TUTOR_VALIDATED', 'COMPLETED',
  ].includes(r.status)
  const trainerDone = ['TRAINER_VALIDATED', 'TUTOR_VALIDATED', 'COMPLETED'].includes(r.status)
  const tutorDone   = ['TUTOR_VALIDATED', 'COMPLETED'].includes(r.status)

  const studentActive = r.status === 'DRAFT' || r.status === 'REOPENED'
  const trainerActive = r.status === 'STUDENT_VALIDATED' || r.status === 'AUTO_VALIDATED'
  const tutorActive   = r.status === 'TRAINER_VALIDATED'

  return [
    {
      label:     'Validation étudiant',
      done:      studentDone,
      active:    studentActive,
      timestamp: r.studentValidatedAt ?? r.autoValidatedAt,
      auto:      !r.studentValidatedAt && !!r.autoValidatedAt,
    },
    {
      label:     'Validation formateur',
      done:      trainerDone,
      active:    trainerActive,
      timestamp: r.trainerValidatedAt,
      auto:      false,
    },
    {
      label:     'Validation tuteur',
      done:      tutorDone,
      active:    tutorActive,
      timestamp: r.tutorValidatedAt,
      auto:      false,
    },
  ]
})

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
</script>
