<template>
  <div class="flow-root">
    <ul class="-mb-8">
      <li v-for="(log, idx) in logs" :key="idx">
        <div class="relative pb-8">
          <!-- Ligne verticale sauf pour le dernier élément -->
          <span
            v-if="idx < logs.length - 1"
            class="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
            aria-hidden="true"
          />
          <div class="relative flex gap-3">
            <!-- Icône de statut -->
            <div :class="['flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-4 ring-white', dotColor(log.toStatus)]">
              {{ statusInitial(log.toStatus) }}
            </div>
            <!-- Contenu -->
            <div class="flex min-w-0 flex-1 justify-between gap-4 pt-1.5">
              <div>
                <p class="text-sm text-gray-700">
                  <span class="font-medium">{{ log.changedByName }}</span>
                  <span class="text-gray-500"> → </span>
                  <span class="font-medium">{{ statusLabel(log.toStatus) }}</span>
                </p>
                <p v-if="log.note" class="mt-0.5 text-xs text-gray-500 italic">
                  "{{ log.note }}"
                </p>
              </div>
              <time class="whitespace-nowrap text-xs text-gray-400 pt-0.5">
                {{ formatDate(log.changedAt) }}
              </time>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { STATUS_LABELS, STATUS_COLORS } from '~/types/report'
import type { ReportStatus, ReportStatusLog } from '~/types/report'

defineProps<{ logs: ReportStatusLog[] }>()

const statusLabel = (s: ReportStatus) => STATUS_LABELS[s] ?? s

const statusInitial = (s: ReportStatus) => {
  const initials: Record<string, string> = {
    DRAFT: 'B', STUDENT_VALIDATED: 'É', AUTO_VALIDATED: 'A',
    TRAINER_VALIDATED: 'F', TUTOR_VALIDATED: 'T', COMPLETED: '✓', REOPENED: 'R',
  }
  return initials[s] ?? '?'
}

const dotColor = (s: ReportStatus) =>
  STATUS_COLORS[s]?.replace('bg-', 'bg-') ?? 'bg-gray-200 text-gray-600'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
</script>
