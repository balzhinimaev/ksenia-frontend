<template>
  <div>
    <Navbar />
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 text-center mb-8">Мессенджер</h1>

        <div v-if="loading" class="text-center">
          <p>Загрузка пользователей...</p>
        </div>
        <div v-else-if="error" class="text-center text-red-500">
          <p>{{ error }}</p>
        </div>
        <div v-else-if="!users || users.length === 0" class="text-center text-gray-500">
          <p>Пользователи не найдены.</p>
        </div>
        <div v-else class="bg-white rounded-lg shadow overflow-hidden">
          <ul class="divide-y divide-gray-200">
            <li v-for="user in users" :key="user._id" class="p-4 hover:bg-gray-50 cursor-pointer" @click="toggleUser(user._id)">
              <div class="flex items-center space-x-4">
                <div>
                  <p class="text-sm font-medium text-gray-900">Пользователь: {{ user.chat_id }}</p>
                  <p v-if="user.state" class="text-sm text-gray-500">
                    Статус: <span class="font-semibold">{{ user.state }}</span>
                  </p>
                   <p v-if="user.birthday" class="text-sm text-gray-500">
                    Дата рождения: {{ user.birthday }}
                  </p>
                  <p v-if="user.updatedAt" class="text-xs text-gray-400 mt-1">
                    Последнее взаимодействие: {{ new Date(user.updatedAt).toLocaleString() }}
                  </p>
                </div>
              </div>
              <!-- Расширенный блок -->
              <div v-if="expandedUserId === user._id" class="mt-4 pt-4 border-t border-gray-200">
                <h4 class="text-sm font-semibold text-gray-700 mb-2">История диалога:</h4>
                <div class="space-y-3">
                  <div v-for="pair in qaPairs(user)" :key="pair.id">
                    <div v-if="pair.question">
                      <p class="text-xs font-medium text-gray-500">Вопрос {{ pair.id }}:</p>
                      <p class="text-sm text-gray-800 bg-gray-100 p-2 rounded-md mt-1">{{ pair.question }}</p>
                    </div>
                    <div v-if="pair.answer" class="mt-1">
                      <p class="text-xs font-medium text-blue-600">Ответ {{ pair.id }}:</p>
                      <div class="text-sm text-gray-800 bg-blue-50 p-2 rounded-md mt-1 prose" v-html="pair.answer"></div>
                    </div>
                  </div>
                </div>

                <h4 class="text-sm font-semibold text-gray-700 mt-4 mb-2">Лог сообщений:</h4>
                <div v-if="user.messages && user.messages.length > 0" class="max-h-40 overflow-y-auto bg-gray-50 p-2 rounded">
                  <ul class="text-xs text-gray-600 space-y-1">
                    <li v-for="(message, index) in user.messages.slice(-10).reverse()" :key="index">
                      <span class="font-mono">{{ message }}</span>
                    </li>
                  </ul>
                </div>
                <p v-else class="text-xs text-gray-500">Лог сообщений пуст.</p>
              </div>
            </li>
          </ul>
        </div>
        
        <!-- Пагинация -->
        <div v-if="totalPages > 1" class="mt-8 flex justify-center items-center space-x-4">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Назад
          </button>
          <span class="text-gray-700">Страница {{ currentPage }} из {{ totalPages }}</span>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Вперед
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "customer",
});

const users = ref([]);
const loading = ref(false);
const error = ref('');
const config = useRuntimeConfig();
const token = useCookie('bearer-token');
const expandedUserId = ref(null);
const currentPage = ref(1);
const totalPages = ref(1);

const qaPairs = (user) => {
  const pairs = [];
  const keys = Object.keys(user);
  
  const numbers = new Set();
  keys.forEach(key => {
    const match = key.match(/^(?:usermessage|answer_)(\d+)$/);
    if (match) {
      numbers.add(parseInt(match[1], 10));
    }
  });

  const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

  for (const num of sortedNumbers) {
    const question = user[`usermessage${num}`];
    const answer = user[`answer_${num}`];
    if (question || answer) {
      pairs.push({
        id: num,
        question: question,
        answer: answer,
      });
    }
  }
  return pairs;
};

function toggleUser(userId) {
  if (expandedUserId.value === userId) {
    expandedUserId.value = null;
  } else {
    expandedUserId.value = userId;
  }
}

async function fetchUsers(page = 1) {
  loading.value = true;
  error.value = '';
  expandedUserId.value = null; // Сбрасываем открытый элемент при переходе по страницам
  try {
    const response = await fetch(`${config.public.apiBase}/api/users?sortBy=recent&page=${page}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    users.value = Array.isArray(data.users) ? data.users : [];
    currentPage.value = data.currentPage;
    totalPages.value = data.totalPages;

  } catch (err) {
    error.value = err.message || 'Не удалось загрузить пользователей';
    console.error('Ошибка загрузки пользователей:', err);
  } finally {
    loading.value = false;
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    fetchUsers(currentPage.value + 1);
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    fetchUsers(currentPage.value - 1);
  }
}

onMounted(() => {
  fetchUsers(currentPage.value);
});
</script> 