<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-800">Application</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span v-if="user" class="text-gray-600">
              {{ user.firstName }} {{ user.lastName }}
            </span>
            <button
              @click="handleLogout"
              class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Bienvenue !</h2>
          <p class="text-gray-600">Vous êtes connecté avec succès.</p>

          <div v-if="user" class="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 class="text-lg font-medium text-gray-800 mb-2">Informations utilisateur</h3>
            <ul class="space-y-1 text-gray-600">
              <li><strong>ID:</strong> {{ user.id }}</li>
              <li><strong>Email:</strong> {{ user.email }}</li>
              <li><strong>Prénom:</strong> {{ user.firstName }}</li>
              <li><strong>Nom:</strong> {{ user.lastName }}</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth',
});

const { me } = useApi();
const router = useRouter();

const user = ref<any>(null);

onMounted(async () => {
  const stored = localStorage.getItem('user');
  if (stored) user.value = JSON.parse(stored);

  try {
    const response = await me();
    user.value = response.data;
    localStorage.setItem('user', JSON.stringify(response.data));
  } catch {
    handleLogout();
  }
});

const handleLogout = async () => {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('user');
  await router.push('/login');
};
</script>
