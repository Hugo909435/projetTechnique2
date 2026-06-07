<script setup lang="ts">
// Plus utilisé dans la nouvelle architecture
definePageMeta({ middleware: ['auth'] })
await navigateTo('/visits', { replace: true })
</script>
