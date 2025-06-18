<template>
  <div>
    <Navbar />
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <!-- Заголовок и навигация -->
        <div class="mb-8">
          <button
            @click="$router.back()"
            class="mb-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
          >
            ← Назад
          </button>
                     <h1 class="text-3xl font-bold text-gray-900">Кастомер {{ customerId || 'Загрузка...' }}</h1>
        </div>

        <!-- Загрузка -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p class="mt-2 text-gray-600">Загрузка данных кастомера...</p>
        </div>

        <!-- Ошибка -->
        <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Ошибка загрузки</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ error }}</p>
              </div>
              <div class="mt-4">
                <button
                  @click="fetchCustomerData"
                  class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  Попробовать снова
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Данные кастомера -->
        <div v-else-if="customer" class="space-y-6">
          <!-- Основная информация -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-xl font-semibold text-gray-900">Основная информация</h2>
            </div>
            <div class="px-6 py-4">
              <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt class="text-sm font-medium text-gray-500">ID</dt>
                  <dd class="mt-1 text-sm text-gray-900 font-mono">{{ customer._id || customerId }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Имя пользователя</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ customer.username || 'Не указано' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Роль</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ customer.role || 'customer' }}</dd>
                </div>
                <div v-if="customer.email">
                  <dt class="text-sm font-medium text-gray-500">Email</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ customer.email }}</dd>
                </div>
                <div v-if="customer.createdAt">
                  <dt class="text-sm font-medium text-gray-500">Дата создания</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatDate(customer.createdAt) }}</dd>
                </div>
                <div v-if="customer.lastLogin">
                  <dt class="text-sm font-medium text-gray-500">Последний вход</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatDate(customer.lastLogin) }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Токен бота -->
          <div v-if="customer.botToken" class="bg-white shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-xl font-semibold text-gray-900">Токен бота</h2>
            </div>
            <div class="px-6 py-4">
              <div class="flex items-center space-x-4">
                <div class="flex-1">
                  <p class="text-sm text-gray-500 mb-2">Bot Token:</p>
                  <p class="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded break-all">
                    {{ showFullToken ? customer.botToken : customer.botToken.substring(0, 20) + '...' }}
                  </p>
                </div>
                <div class="flex flex-col space-y-2">
                  <button
                    @click="toggleTokenVisibility"
                    class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    {{ showFullToken ? 'Скрыть' : 'Показать' }}
                  </button>
                  <button
                    @click="copyToken"
                    class="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                  >
                    Копировать
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Дополнительные данные -->
          <div v-if="hasAdditionalData" class="bg-white shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-xl font-semibold text-gray-900">Дополнительная информация</h2>
            </div>
            <div class="px-6 py-4">
              <pre class="text-sm text-gray-700 whitespace-pre-wrap">{{ JSON.stringify(customer, null, 2) }}</pre>
            </div>
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

const route = useRoute()
const config = useRuntimeConfig()
const router = useRouter()
const customerId = computed(() => route.params.id)

const customer = ref(null)
const loading = ref(false)
const error = ref('')
const showFullToken = ref(false)

// Получение данных кастомера
async function fetchCustomerData() {
  // Проверяем наличие ID
  if (!customerId.value || customerId.value === 'undefined') {
    error.value = 'ID кастомера не указан или некорректен'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // Проверяем наличие API ключа
    const apiKey = config.public.apiKey
    if (!apiKey) {
      throw new Error('API ключ не найден. Проверьте файл .env')
    }

    console.log('Отправляем запрос для кастомера:', customerId.value)
    console.log('API ключ:', apiKey ? 'Установлен' : 'Отсутствует')

    const response = await fetch('https://botprorok.ru/api/customers/get-by-id', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerId: customerId.value
      })
    })

    console.log('Статус ответа:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Ошибка ответа:', errorText)
      throw new Error(`Ошибка ${response.status}: ${response.statusText}. ${errorText}`)
    }

    const data = await response.json()
    console.log('Полученные данные:', data)
    customer.value = data
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить данные кастомера'
    console.error('Ошибка загрузки кастомера:', err)
  } finally {
    loading.value = false
  }
}

// Показать/скрыть полный токен
function toggleTokenVisibility() {
  showFullToken.value = !showFullToken.value
}

// Копировать токен
async function copyToken() {
  if (!customer.value?.botToken) return
  
  try {
    await navigator.clipboard.writeText(customer.value.botToken)
    alert('Токен скопирован в буфер обмена!')
  } catch (err) {
    console.error('Не удалось скопировать токен:', err)
    // Fallback
    const textArea = document.createElement('textarea')
    textArea.value = customer.value.botToken
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    alert('Токен скопирован в буфер обмена!')
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

// Проверка наличия дополнительных данных
const hasAdditionalData = computed(() => {
  if (!customer.value) return false
  
  const standardFields = ['_id', 'username', 'role', 'email', 'createdAt', 'updatedAt', 'lastLogin', 'botToken', '__v']
  const additionalFields = Object.keys(customer.value).filter(key => !standardFields.includes(key))
  
  return additionalFields.length > 0
})

// Загрузка данных при монтировании
onMounted(() => {
  fetchCustomerData()
})
</script> 