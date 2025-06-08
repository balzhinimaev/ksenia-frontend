<template>
  <nav class="bg-gray-800 p-4">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <NuxtLink 
            to="/" 
            class="text-white hover:text-gray-300"
          >
            Главная
          </NuxtLink>
          <NuxtLink 
            to="/users" 
            class="text-white hover:text-gray-300"
          >
            Пользователи
          </NuxtLink>
          <NuxtLink 
            to="/messages" 
            class="text-white hover:text-gray-300"
          >
            Сообщения
          </NuxtLink>
        </div>
        <button
          @click="handleLogout"
          class="text-white hover:text-gray-300"
        >
          Выйти
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
const router = useRouter()

function handleLogout() {
  const cookie = useCookie('bearer-token')
  cookie.value = null
  router.push('/login')
}
</script> 