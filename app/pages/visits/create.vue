<script setup lang="ts">
// Redirigé vers /visits (la création se fait via le calendrier)
definePageMeta({ middleware: ['auth'] })
await navigateTo('/visits', { replace: true })
</script>
