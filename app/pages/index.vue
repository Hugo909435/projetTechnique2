<template>
  <div />
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

if (!authStore.isAuthenticated) {
  await navigateTo('/login')
} else {
  await navigateTo('/dashboard')
}
</script>
