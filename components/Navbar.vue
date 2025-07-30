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

          <!-- Ссылки для Админа -->
          <template v-if="isAdmin">
            <NuxtLink 
              to="/constructor" 
              class="text-white hover:text-gray-300"
            >
              Конструктор продуктов
            </NuxtLink>
            <NuxtLink 
              to="/users" 
              class="text-white hover:text-gray-300"
            >
              Пользователи
            </NuxtLink>
            <!-- <NuxtLink 
              to="/messages" 
              class="text-white hover:text-gray-300"
            >
              Сообщения
            </NuxtLink> -->
            <NuxtLink 
              to="/customers" 
              class="text-white hover:text-gray-300"
            >
              Кастомеры
            </NuxtLink>
          </template>

          <!-- Ссылки для Кастомера -->
          <template v-if="isCustomer">
            <a
              href="https://taplink.cc/sistema/p/1008398/"
              target="_blank"
              rel="noopener noreferrer"
              class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              ТРАФИК
            </a>
            <NuxtLink 
              to="/messenger" 
              class="text-white hover:text-gray-300"
            >
              Мессенджер
            </NuxtLink>
            <NuxtLink 
              to="/constructor" 
              class="text-white hover:text-gray-300"
            >
              Конструктор продуктов
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
            <NuxtLink 
              to="/settings" 
              class="text-white hover:text-gray-300"
            >
              Настройки бота
            </NuxtLink>
          </template>

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
const { isAdmin, isCustomer } = useAuth()

function handleLogout() {
  const cookie = useCookie('bearer-token')
  cookie.value = null
  router.push('/login')
}
</script> 