<template>
  <div>
    <Navbar />
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 text-center">Настройки бота</h1>
        <p class="text-center text-gray-600 mt-2">Здесь вы можете управлять настройками вашего бота.</p>

        <form v-if="settings" @submit.prevent="updateSettings" class="mt-8 bg-white p-8 rounded-lg shadow space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="currentPrice" class="block text-sm font-medium text-gray-700">Текущая цена</label>
              <input type="number" v-model.number="settings.currentPrice" id="currentPrice" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label for="basePrice" class="block text-sm font-medium text-gray-700">Базовая цена</label>
              <input type="number" v-model.number="settings.basePrice" id="basePrice" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label for="cardNumber" class="block text-sm font-medium text-gray-700">Номер карты</label>
              <input type="text" v-model="settings.cardNumber" id="cardNumber" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label for="cardHolderName" class="block text-sm font-medium text-gray-700">Имя держателя карты</label>
              <input type="text" v-model="settings.cardHolderName" id="cardHolderName" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>
          <div class="space-y-6">
            <div>
              <label for="otherCountries" class="block text-sm font-medium text-gray-700">Ссылка для других стран</label>
              <input type="url" v-model="settings.otherCountries" id="otherCountries" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label for="sendTo" class="block text-sm font-medium text-gray-700">Отправлять на (email/id)</label>
              <input type="text" v-model="settings.sendTo" id="sendTo" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>
          
          <div class="pt-5">
            <button type="submit" :disabled="loading" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              {{ loading ? 'Сохранение...' : 'Сохранить изменения' }}
            </button>
          </div>
        </form>

        <div v-if="notification.message" :class="['mt-6 p-4 rounded-md', notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
          {{ notification.message }}
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

definePageMeta({
  middleware: "customer",
});

const { user } = useAuth();
const router = useRouter();

const settings = ref(null);
const loading = ref(false);
const notification = ref({ message: '', type: '' });

// Загрузка настроек при монтировании компонента
onMounted(async () => {
  if (!user.value?.id) {
    notification.value = { message: 'Не удалось определить ID пользователя.', type: 'error' };
    return;
  }
  loading.value = true;
  try {
    const response = await fetch(`/api/customers/${user.value.id}/settings`, {
      headers: { 'Authorization': `Bearer ${useCookie('bearer-token').value}` }
    });
    if (!response.ok) throw new Error('Не удалось загрузить настройки.');
    
    const data = await response.json();
    settings.value = data;
  } catch (err) {
    notification.value = { message: err.message, type: 'error' };
  } finally {
    loading.value = false;
  }
});

// Обновление настроек
async function updateSettings() {
  if (!user.value?.id || !settings.value) return;
  
  loading.value = true;
  notification.value = { message: '', type: '' };
  
  try {
    const response = await fetch(`/api/customers/${user.value.id}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${useCookie('bearer-token').value}`
      },
      body: JSON.stringify(settings.value)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при сохранении настроек.');
    }
    
    notification.value = { message: 'Настройки успешно сохранены!', type: 'success' };
  } catch (err) {
    notification.value = { message: err.message, type: 'error' };
  } finally {
    loading.value = false;
  }
}
</script> 