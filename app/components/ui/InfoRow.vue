<template>
  <div>
    <dt class="text-xs text-gray-500 uppercase tracking-wide">{{ label }}</dt>
    <dd class="mt-0.5 font-medium text-gray-800">{{ value }}</dd>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: string }>()
</script>
