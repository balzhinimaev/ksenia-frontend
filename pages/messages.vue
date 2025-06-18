<template>
  <div>
    <Navbar />
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Управление сообщениями</h1>

          <!-- Отправка одиночного сообщения -->
          <div class="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4">Отправить одиночное сообщение</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Chat ID</label>
                <input
                  v-model="singleMessage.chat_id"
                  type="text"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Введите chat_id получателя"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Сообщение</label>
                <textarea
                  v-model="singleMessage.message"
                  rows="3"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Введите текст сообщения"
                ></textarea>
              </div>
              <button
                @click="sendSingleMessage"
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                :disabled="sending"
              >
                {{ sending ? 'Отправка...' : 'Отправить' }}
              </button>
            </div>
          </div>

          <!-- Массовая отправка сообщений -->
          <div class="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4">Массовая отправка сообщений</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Chat IDs (через запятую)</label>
                <input
                  v-model="massMessage.chatIdsInput"
                  type="text"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Например: 123456789, 987654321"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Сообщение</label>
                <textarea
                  v-model="massMessage.message"
                  rows="3"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Введите текст сообщения"
                ></textarea>
              </div>
              <button
                @click="sendMassMessage"
                class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                :disabled="sending"
              >
                {{ sending ? 'Отправка...' : 'Отправить выбранным' }}
              </button>
            </div>
          </div>

          <!-- Broadcast отправка -->
          <div class="mt-8 bg-white p-6 rounded-lg shadow border-2 border-purple-200">
            <h2 class="text-xl font-semibold mb-4 text-purple-900">Отправка всем пользователям (Broadcast)</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Сообщение для всех пользователей</label>
                <textarea
                  v-model="broadcastMessage"
                  rows="3"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Введите текст сообщения, которое получат ВСЕ пользователи"
                ></textarea>
              </div>
              <button
                @click="sendBroadcastMessage"
                class="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                :disabled="sending"
              >
                {{ sending ? 'Отправка...' : 'Отправить ВСЕМ пользователям' }}
              </button>
              <p class="text-sm text-purple-600">
                ⚠️ Внимание: Сообщение будет отправлено ВСЕМ пользователям системы
              </p>
            </div>
          </div>

          <!-- Уведомления -->
          <div v-if="notification" :class="[
            'mt-4 p-4 rounded-md',
            notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          ]">
            {{ notification.message }}
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
const sending = ref(false)
const notification = ref(null)
const broadcastMessage = ref('')

const singleMessage = ref({
  chat_id: '',
  message: ''
})

const massMessage = ref({
  chatIdsInput: '',
  message: ''
})

// Отправка одиночного сообщения
async function sendSingleMessage() {
  if (!singleMessage.value.chat_id || !singleMessage.value.message) {
    showNotification('Заполните все поля', 'error')
    return
  }

  sending.value = true
  try {
    const response = await fetch('/api/messages/single', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(singleMessage.value)
    })

    if (!response.ok) {
      if (response.status === 401) {
        token.value = null
        navigateTo('/login')
        throw new Error('Сессия истекла. Пожалуйста, войдите снова.')
      }
      throw new Error('Ошибка при отправке сообщения')
    }

    showNotification('Сообщение успешно отправлено', 'success')
    singleMessage.value.message = ''
  } catch (error) {
    showNotification(error.message, 'error')
  } finally {
    sending.value = false
  }
}

// Отправка массового сообщения
async function sendMassMessage() {
  if (!massMessage.value.chatIdsInput || !massMessage.value.message) {
    showNotification('Заполните все поля', 'error')
    return
  }

  const chat_ids = massMessage.value.chatIdsInput
    .split(',')
    .map(id => id.trim())
    .filter(id => id)

  if (chat_ids.length === 0) {
    showNotification('Введите хотя бы один chat_id', 'error')
    return
  }

  sending.value = true
  try {
    const response = await fetch('/api/messages/mass', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_ids,
        message: massMessage.value.message
      })
    })

    if (!response.ok) {
      if (response.status === 401) {
        token.value = null
        navigateTo('/login')
        throw new Error('Сессия истекла. Пожалуйста, войдите снова.')
      }
      throw new Error('Ошибка при отправке сообщений')
    }

    showNotification('Сообщения успешно отправлены', 'success')
    massMessage.value.message = ''
  } catch (error) {
    showNotification(error.message, 'error')
  } finally {
    sending.value = false
  }
}

// Отправка broadcast сообщения
async function sendBroadcastMessage() {
  if (!broadcastMessage.value) {
    showNotification('Введите текст сообщения', 'error')
    return
  }

  sending.value = true
  try {
    const response = await fetch('/api/messages/broadcast', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: broadcastMessage.value
      })
    })

    if (!response.ok) {
      if (response.status === 401) {
        token.value = null
        navigateTo('/login')
        throw new Error('Сессия истекла. Пожалуйста, войдите снова.')
      }
      throw new Error('Ошибка при отправке broadcast сообщения')
    }

    showNotification('Broadcast сообщение успешно отправлено всем пользователям', 'success')
    broadcastMessage.value = ''
  } catch (error) {
    showNotification(error.message, 'error')
  } finally {
    sending.value = false
  }
}

// Показ уведомления
function showNotification(message, type = 'success') {
  notification.value = { message, type }
  setTimeout(() => {
    notification.value = null
  }, 3000)
}
</script> 