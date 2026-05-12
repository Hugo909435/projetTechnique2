<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
    <input
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; modelValue?: string; type?: string }>()
defineEmits(['update:modelValue'])
</script>
