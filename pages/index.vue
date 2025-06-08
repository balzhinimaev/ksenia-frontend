<template>
  <div>
    <Navbar />
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900">
            Добро пожаловать в систему
          </h1>
          <p class="mt-4 text-lg text-gray-500">
            Вы успешно авторизованы
          </p>
          <button
            @click="handleLogout"
            class="mt-6 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const router = useRouter()

function handleLogout() {
  const cookie = useCookie('bearer-token')
  cookie.value = null
  router.push('/login')
}
</script> 