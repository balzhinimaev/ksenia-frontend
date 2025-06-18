<template>
  <div>
    <Navbar />
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 text-center mb-8">Управление кастомерами</h1>

        <!-- Список всех кастомеров -->
        <div class="mb-8 bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">Список кастомеров</h2>
            <button
              @click="fetchCustomers"
              class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              :disabled="loadingCustomers"
            >
              {{ loadingCustomers ? 'Загрузка...' : 'Обновить список' }}
            </button>
          </div>
          
          <div v-if="customersError" class="p-4 bg-red-50 border-l-4 border-red-400">
            <p class="text-sm text-red-800">{{ customersError }}</p>
          </div>

          <div v-else-if="customers.length === 0 && !loadingCustomers" class="p-6 text-center text-gray-500">
            Нет кастомеров или данные не загружены
          </div>

          <div v-else class="max-h-96 overflow-y-auto">
            <div class="divide-y divide-gray-200">
              <div
                v-for="customer in customers"
                :key="customer.id"
                class="p-4 hover:bg-gray-50 flex items-center justify-between"
              >
                <div class="flex-1">
                  <div class="flex items-center space-x-4">
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ customer.username || 'Без имени' }}</p>
                      <p class="text-sm text-gray-500">ID: {{ customer.id }}</p>
                      <p v-if="customer.botToken" class="text-xs text-gray-400 font-mono">
                        Token: {{ customer.botToken.substring(0, 20) }}...
                      </p>
                    </div>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    @click="goToCustomer(customer.id)"
                    class="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                  >
                    Перейти
                  </button>
                  <button
                    @click="copyCustomerId(customer.id)"
                    class="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                  >
                    Копировать ID
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Форма создания нового кастомера -->
        <div class="max-w-xl mx-auto">
          <h2 class="text-2xl font-bold text-gray-900 text-center mb-6">Создать нового кастомера</h2>

          <form @submit.prevent="createCustomer" class="mt-8 bg-white p-8 rounded-lg shadow space-y-6">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">Имя пользователя (username)</label>
              <input
                id="username"
                v-model="formData.username"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Например, ivan_ivanov"
              />
            </div>

            <div>
              <label for="botToken" class="block text-sm font-medium text-gray-700">Токен бота</label>
              <input
                id="botToken"
                v-model="formData.botToken"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="7285194020:AAH..."
              />
            </div>

            <div>
              <button
                type="submit"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                :disabled="loading"
              >
                {{ loading ? 'Создание...' : 'Создать кастомера' }}
              </button>
            </div>
          </form>

          <!-- Результат -->
          <div v-if="result" class="mt-6 bg-green-50 border-l-4 border-green-400 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800">{{ result.message }}</h3>
                <div class="mt-2 text-sm text-green-700">
                  <p>Данные для входа нового кастомера:</p>
                  <ul class="list-disc pl-5 space-y-1 mt-1">
                    <li><strong>Username:</strong> {{ result.customer.username }}</li>
                    <li><strong>Password:</strong> {{ result.customer.password }}</li>
                  </ul>
                  <p class="mt-2">Обязательно сохраните пароль, он показывается только один раз!</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Ошибка -->
          <div v-if="error" class="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
              <p class="text-sm font-medium text-red-800">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "admin",
});

const token = useCookie('bearer-token')
const router = useRouter()
const config = useRuntimeConfig()

const formData = ref({
  username: '',
  botToken: ''
})

const loading = ref(false)
const error = ref('')
const result = ref(null)

// Состояние для списка кастомеров
const customers = ref([])
const loadingCustomers = ref(false)
const customersError = ref('')

// Получение списка кастомеров
async function fetchCustomers() {
  loadingCustomers.value = true
  customersError.value = ''

  try {
    const response = await fetch('https://botprorok.ru/api/customers/get-by-id', {
      method: 'GET',
      headers: {
        'x-api-key': config.public.apiKey || process.env.API_KEY || ''
      }
    })

    if (!response.ok) {
      throw new Error(`Ошибка ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    customers.value = Array.isArray(data) ? data : data.customers || []
  } catch (err) {
    customersError.value = err.message || 'Не удалось загрузить список кастомеров'
    console.error('Ошибка загрузки кастомеров:', err)
  } finally {
    loadingCustomers.value = false
  }
}

// Переход на страницу кастомера
function goToCustomer(customerId) {
  // Можно настроить маршрут как /customers/[id] или другой
  router.push(`/customer/${customerId}`)
}

// Копирование ID кастомера в буфер обмена
async function copyCustomerId(customerId) {
  try {
    await navigator.clipboard.writeText(customerId.toString())
    // Можно добавить уведомление об успешном копировании
    alert('ID скопирован в буфер обмена!')
  } catch (err) {
    console.error('Не удалось скопировать ID:', err)
    // Fallback для старых браузеров
    const textArea = document.createElement('textarea')
    textArea.value = customerId
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    alert('ID скопирован в буфер обмена!')
  }
}

// Загрузка кастомеров при монтировании компонента
onMounted(() => {
  fetchCustomers()
})

async function createCustomer() {
  loading.value = true
  error.value = ''
  result.value = null

  try {
    const response = await fetch('/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify(formData.value)
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        router.push('/login')
      }
      throw new Error(data.message || 'Не удалось создать кастомера')
    }

    result.value = data
    formData.value = { username: '', botToken: '' } // Сброс формы
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script> 