<template>
  <div>
    <Navbar />
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 text-center">Создать нового кастомера</h1>

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
</template>

<script setup>
definePageMeta({
  middleware: "admin",
});

const token = useCookie('bearer-token')
const router = useRouter()

const formData = ref({
  username: '',
  botToken: ''
})

const loading = ref(false)
const error = ref('')
const result = ref(null)

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