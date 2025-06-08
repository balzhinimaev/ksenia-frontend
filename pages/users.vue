<template>
  <div>
    <Navbar />
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Управление пользователями</h1>
          
          <!-- Поиск пользователя -->
          <div class="mt-6">
            <div class="flex space-x-4">
              <input
                v-model="searchChatId"
                type="text"
                placeholder="Введите chat_id пользователя"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-md"
              />
              <button
                @click="searchUser"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Найти
              </button>
            </div>
          </div>

          <!-- Результат поиска -->
          <div v-if="searchedUser" class="mt-6 bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4">Информация о пользователе</h2>
            <div class="space-y-4">
              <div class="border-b pb-4">
                <p><span class="font-medium">Chat ID:</span> {{ searchedUser.chat_id }}</p>
                <p><span class="font-medium">Состояние:</span> {{ searchedUser.state }}</p>
                <p><span class="font-medium">День рождения:</span> {{ searchedUser.birthday }}</p>
              </div>

              <!-- Диалог -->
              <div class="space-y-6">
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="font-medium text-gray-700">Ответ 1:</p>
                  <p class="mt-2 whitespace-pre-wrap">{{ searchedUser.answer_1 }}</p>
                </div>

                <div v-if="searchedUser.usermessage2" class="bg-blue-50 p-4 rounded-lg">
                  <p class="font-medium text-blue-700">Сообщение пользователя 2:</p>
                  <p class="mt-2 whitespace-pre-wrap">{{ searchedUser.usermessage2 }}</p>
                </div>

                <div v-if="searchedUser.answer_2" class="bg-gray-50 p-4 rounded-lg">
                  <p class="font-medium text-gray-700">Ответ 2:</p>
                  <p class="mt-2 whitespace-pre-wrap">{{ searchedUser.answer_2 }}</p>
                </div>

                <div v-if="searchedUser.usermessage3" class="bg-blue-50 p-4 rounded-lg">
                  <p class="font-medium text-blue-700">Сообщение пользователя 3:</p>
                  <p class="mt-2 whitespace-pre-wrap">{{ searchedUser.usermessage3 }}</p>
                </div>

                <div v-if="searchedUser.answer_3" class="bg-gray-50 p-4 rounded-lg">
                  <p class="font-medium text-gray-700">Ответ 3:</p>
                  <p class="mt-2 whitespace-pre-wrap">{{ searchedUser.answer_3 }}</p>
                </div>

                <div v-if="searchedUser.usermessage4" class="bg-blue-50 p-4 rounded-lg">
                  <p class="font-medium text-blue-700">Сообщение пользователя 4:</p>
                  <p class="mt-2 whitespace-pre-wrap">{{ searchedUser.usermessage4 }}</p>
                </div>

                <div v-if="searchedUser.answer_4" class="bg-gray-50 p-4 rounded-lg">
                  <p class="font-medium text-gray-700">Ответ 4:</p>
                  <p class="mt-2 whitespace-pre-wrap">{{ searchedUser.answer_4 }}</p>
                </div>

                <div v-if="searchedUser.usermessage_5" class="bg-blue-50 p-4 rounded-lg">
                  <p class="font-medium text-blue-700">Сообщение пользователя 5:</p>
                  <p class="mt-2 whitespace-pre-wrap">{{ searchedUser.usermessage_5 }}</p>
                </div>

                <div v-if="searchedUser.answer_5" class="bg-gray-50 p-4 rounded-lg">
                  <p class="font-medium text-gray-700">Ответ 5:</p>
                  <p class="mt-2 whitespace-pre-wrap">{{ searchedUser.answer_5 }}</p>
                </div>

                <div v-if="searchedUser.usermessage_6" class="bg-blue-50 p-4 rounded-lg">
                  <p class="font-medium text-blue-700">Сообщение пользователя 6:</p>
                  <p class="mt-2 whitespace-pre-wrap">{{ searchedUser.usermessage_6 }}</p>
                </div>

                <div v-if="searchedUser.answer_6" class="bg-gray-50 p-4 rounded-lg">
                  <p class="font-medium text-gray-700">Ответ 6:</p>
                  <p class="mt-2 whitespace-pre-wrap">{{ searchedUser.answer_6 }}</p>
                </div>

                <!-- История сообщений пользователя -->
                <div v-if="searchedUser.messages && searchedUser.messages.length > 0" class="mt-8 bg-blue-50 p-6 rounded-lg">
                  <h3 class="text-lg font-semibold text-blue-900 mb-4">История сообщений пользователя</h3>
                  <div class="space-y-3">
                    <div 
                      v-for="(message, index) in searchedUser.messages" 
                      :key="index"
                      class="bg-white p-3 rounded shadow-sm"
                    >
                      <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-500">Сообщение #{{ index + 1 }}</span>
                        <span class="text-xs text-gray-400">
                          {{ message.timestamp ? new Date(message.timestamp).toLocaleString() : 'Время не указано' }}
                        </span>
                      </div>
                      <p class="mt-2 text-gray-700 whitespace-pre-wrap">{{ message || 'Пустое сообщение' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Список всех пользователей -->
          <div class="mt-8">
            <h2 class="text-2xl font-bold mb-4">Все пользователи</h2>
            <div class="bg-white shadow overflow-hidden rounded-lg">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chat ID</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Состояние</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">День рождения</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="user in users" :key="user._id">
                      <td class="px-6 py-4 whitespace-nowrap">{{ user.chat_id }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">{{ user.state }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">{{ user.birthday }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <button
                          @click="viewUserDetails(user.chat_id)"
                          class="text-blue-600 hover:text-blue-900"
                        >
                          Подробнее
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- Пагинация -->
              <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div class="flex-1 flex justify-between items-center">
                  <div>
                    <p class="text-sm text-gray-700">
                      Страница {{ currentPage }} из {{ totalPages }}
                    </p>
                  </div>
                  <div class="flex space-x-2">
                    <button
                      @click="changePage(currentPage - 1)"
                      :disabled="currentPage === 1"
                      :class="[
                        'relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md',
                        currentPage === 1 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      ]"
                    >
                      Назад
                    </button>
                    <button
                      @click="changePage(currentPage + 1)"
                      :disabled="currentPage === totalPages"
                      :class="[
                        'relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md',
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      ]"
                    >
                      Вперед
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Ошибка -->
          <div v-if="error" class="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
            {{ error }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const searchChatId = ref('')
const searchedUser = ref(null)
const users = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const error = ref('')

// Получение токена из куки
const token = useCookie('bearer-token')

// Поиск пользователя по chat_id
async function searchUser() {
  if (!searchChatId.value) return
  error.value = ''
  
  try {
    const response = await fetch(`http://217.114.2.121:7000/api/users/by-chat-id/${searchChatId.value}`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        token.value = null
        navigateTo('/login')
        throw new Error('Сессия истекла. Пожалуйста, войдите снова.')
      }
      throw new Error('Пользователь не найден')
    }
    
    searchedUser.value = await response.json()
  } catch (err) {
    console.error('Ошибка при поиске пользователя:', err)
    error.value = err.message
    searchedUser.value = null
  }
}

// Получение всех пользователей с пагинацией
async function fetchUsers(page = 1) {
  error.value = ''
  try {
    const response = await fetch(`http://217.114.2.121:7000/api/users/?page=${page}`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        token.value = null
        navigateTo('/login')
        throw new Error('Сессия истекла. Пожалуйста, войдите снова.')
      }
      throw new Error('Ошибка при получении списка пользователей')
    }
    
    const data = await response.json()
    users.value = data.users
    totalPages.value = data.totalPages
    currentPage.value = data.currentPage
  } catch (err) {
    console.error('Ошибка при получении пользователей:', err)
    error.value = err.message
    users.value = []
  }
}

// Изменение страницы
async function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  await fetchUsers(page)
}

// Просмотр деталей пользователя
function viewUserDetails(chatId) {
  searchChatId.value = chatId
  searchUser()
}

// Загрузка пользователей при монтировании компонента
onMounted(() => {
  fetchUsers()
})
</script> 