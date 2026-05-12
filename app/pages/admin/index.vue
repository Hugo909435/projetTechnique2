<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Administration</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UiDashboardCard title="Utilisateurs" icon="👥" to="/admin/users"
        description="Gérer les formateurs, tuteurs et étudiants" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin'] })
</script>
