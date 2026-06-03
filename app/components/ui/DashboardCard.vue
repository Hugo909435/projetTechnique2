<template>
  <NuxtLink
    :to="to"
    class="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-300 hover:shadow transition-all group"
  >
    <h3 class="text-base font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
      {{ title }}
    </h3>
    <p class="text-sm text-gray-500 mt-1">{{ description }}</p>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{ title: string; to: string; description: string; icon?: string }>()
</script>
