<template>
  <div>
    <Navbar />
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">
            Добро пожаловать в систему
          </h1>
          <p class="mt-4 text-lg text-gray-500">
            Вы успешно авторизованы
          </p>
        </div>

        <!-- Статистика пользователей -->
        <div v-if="loading" class="text-center">
          <p class="text-gray-500">Загрузка статистики...</p>
        </div>
        
        <div v-else-if="stats" class="mb-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">📊 Статистика ваших пользователей</h2>
          
          <!-- Основные метрики -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div class="flex items-center">
                <div class="flex-1">
                  <p class="text-blue-100 text-sm font-medium">ваша БАЗА пользователей</p>
                  <p class="text-3xl font-bold">{{ stats.totalUsers }}</p>
                </div>
                <div class="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
                  <span class="text-2xl">👥</span>
                </div>
              </div>
            </div>
            
            <!-- <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div class="flex items-center">
                <div class="flex-1">
                  <p class="text-green-100 text-sm font-medium">Активных сегодня</p>
                  <p class="text-3xl font-bold">{{ stats.todayActive }}</p>
                </div>
                <div class="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
                  <span class="text-2xl">⚡</span>
                </div>
              </div>
            </div>
             -->
            <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div class="flex items-center">
                <div class="flex-1">
                  <p class="text-purple-100 text-sm font-medium">Новых за неделю</p>
                  <p class="text-3xl font-bold">{{ stats.weeklyNew }}</p>
                </div>
                <div class="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center">
                  <span class="text-2xl">🆕</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="text-center">
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
const config = useRuntimeConfig()
const token = useCookie('bearer-token')
const loading = ref(true)
const stats = ref(null)

// Вычисление статистики из данных пользователей
function calculateStats(users) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  const todayActive = users.filter(user => {
    if (!user.updatedAt) return false
    const userDate = new Date(user.updatedAt)
    return userDate >= today
  }).length
  
  const weeklyNew = users.filter(user => {
    if (!user.createdAt) return false
    const userDate = new Date(user.createdAt)
    return userDate >= weekAgo
  }).length
  
  return {
    totalUsers: users.length,
    todayActive,
    weeklyNew,
  }
}

// Загрузка статистики пользователей
async function fetchUserStats() {
  loading.value = true
  try {
    const response = await fetch(`${config.public.apiBase}/api/users/all`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Не удалось загрузить статистику')
    }
    
    const data = await response.json()
    const users = data.users || data || []
    
    stats.value = calculateStats(users)
  } catch (err) {
    console.error('Ошибка загрузки статистики:', err)
    stats.value = {
      totalUsers: 0,
      todayActive: 0,
      weeklyNew: 0,
    }
  } finally {
    loading.value = false
  }
}

function handleLogout() {
  const cookie = useCookie('bearer-token')
  cookie.value = null
  router.push('/login')
}

// Загружаем статистику при монтировании компонента
onMounted(() => {
  fetchUserStats()
})
</script> 