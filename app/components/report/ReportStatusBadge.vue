<template>
  <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', colorClass]">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { STATUS_LABELS, STATUS_COLORS } from '~/types/report'
import type { ReportStatus } from '~/types/report'

const props = defineProps<{ status: ReportStatus }>()

const label     = computed(() => STATUS_LABELS[props.status] ?? props.status)
const colorClass = computed(() => STATUS_COLORS[props.status] ?? 'bg-gray-100 text-gray-700')
</script>
