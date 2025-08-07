<template>
  <div>
    <Navbar />
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 text-center mb-8">Список оплат</h1>

                  <!-- Поиск пользователя -->
        <!-- Фильтр оплат -->
<div class="mt-6">
  <div class="bg-gray-100 p-4 rounded-md shadow-sm">
    <h2 class="text-lg font-semibold text-gray-700 mb-4">Фильтрация</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Username -->
      <div v-if="!isCustomer">
        <label for="username" class="block text-sm font-medium text-gray-600 mb-1">Username</label>
        <input
          id="username"
          v-model="filters.username"
          type="text"
          placeholder="Введите username"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- Дата от -->
      <div>
        <label for="fromDate" class="block text-sm font-medium text-gray-600 mb-1">Дата от</label>
        <input
          id="fromDate"
          v-model="filters.fromDate"
          type="date"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- Дата до -->
      <div>
        <label for="toDate" class="block text-sm font-medium text-gray-600 mb-1">Дата до</label>
        <input
          id="toDate"
          v-model="filters.toDate"
          type="date"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>

        <!-- Кнопка поиска -->
        <div class="mt-4 flex justify-end space-x-2">
        <button
            @click="applyFilters"
            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            :disabled="loading"
        >
               {{ loading ? 'Загрузка...' : 'Обновить список' }}
        </button>
        <button
          @click="resetFilters"
          class="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
          :disabled="loading"
        >
          Сбросить фильтры
        </button>
        </div>
    </div>
    </div>

        <div class="mt-8">
               <div class="bg-white rounded-lg shadow p-8">
          <button
            @click="fetchPayments"
            class="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            :disabled="loading"
          >
            {{ loading ? 'Загрузка...' : 'Обновить список' }}
          </button>
          <div v-if="error" class="p-4 mt-6 bg-red-50 border-l-4 border-red-400 mb-4">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>
          <div v-else-if="payments.length === 0 && !loading" class="text-center text-gray-500">
            Нет оплат или данные не загружены
          </div>
          <div v-else>
            <table class="min-w-full divide-y mt-6 divide-gray-200">
              <thead>
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Пользователь</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Бот</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="payment in payments" :key="payment._id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ payment._id }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ payment.username }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ payment.bot_name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ payment.type }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ payment.amount }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(payment.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
            <!-- Информация о пагинации -->
            <div class="bg-white mb-8 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div class="flex-1 flex justify-between items-center">
    
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
                    :data="totalDisplayPages"
                    :disabled="currentPage === totalDisplayPages"
                    :class="[
                      'relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md',
                      currentPage === totalDisplayPages
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
            </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const payments = ref([])
const loading = ref(false)
const error = ref(null)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(25)

const config = useRuntimeConfig()
const token = useCookie('bearer-token')

const { isCustomer, isAdmin } = useAuth();
 
// Фильтры
const filters = ref({
  username: '',
  fromDate: '',
  toDate: ''
})

// Пагинация
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() =>
  Math.min(startIndex.value + pageSize.value, total.value)
)
const totalDisplayPages = computed(() =>
  Math.ceil(total.value / pageSize.value)
)

// Загрузка платежей с учетом фильтров
async function fetchPayments() {
  loading.value = true
  error.value = null
  try {
    const url = new URL(`${config.public.apiBase}/api/payments/`)
    url.searchParams.append('page', currentPage.value)
    url.searchParams.append('limit', pageSize.value)

    // Применяем фильтры
    if (filters.value.username) {
      url.searchParams.append('filters[username]', filters.value.username)
    }
    if (filters.value.fromDate) {
      url.searchParams.append('filters[fromDate]', filters.value.fromDate)
    }
    if (filters.value.toDate) {
      url.searchParams.append('filters[toDate]', filters.value.toDate)
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    })

    if (!response.ok) {
      throw new Error('Ошибка загрузки данных')
    }

    const result = await response.json()
    payments.value = result?.payments || []
    total.value = result?.total || 0 // total — общее количество записей
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// Применить фильтры
function applyFilters() {
  currentPage.value = 1
  fetchPayments()
}

// Сбросить фильтры
function resetFilters() {
  filters.value.username = ''
  filters.value.fromDate = ''
  filters.value.toDate = ''
  applyFilters()
}

function changePage(page) {
  if (page >= 1 && page <= totalDisplayPages.value) {
    currentPage.value = page
  }
}

// Форматирование даты
function formatDate(dateString) {
  if (!dateString) return 'Не указано'
  
  try {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

// Автоматическая загрузка при смене страницы
watch(currentPage, () => {
  fetchPayments()
})

// Первая загрузка
fetchPayments()

 
</script>
