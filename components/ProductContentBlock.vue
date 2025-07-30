<template>
  <div class="mt-8">
    <!-- Админская панель -->
    <div v-if="isAdmin">
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <!-- Заголовок секции -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-semibold text-gray-800">📝 Управление контентом: {{ props.productDisplayName }}</h2>
          <button 
            @click="showCreateModal = true"
            class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg class="mr-2 -ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Добавить контент
          </button>
        </div>

        <!-- Загрузка -->
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p class="mt-2 text-gray-600">Загрузка контента...</p>
        </div>

        <!-- Ошибка -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Ошибка загрузки</h3>
              <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Контент для админа -->
        <div v-else-if="contentBlocks.length > 0" class="space-y-6">
          <div 
            v-for="block in contentBlocks" 
            :key="block._id"
            class="border border-gray-200 rounded-lg p-6 relative"
          >
            <!-- Кнопки управления для админа -->
            <div class="absolute top-4 right-4 flex space-x-2">
              <button @click="editBlock(block)" class="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700">
                <svg class="mr-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                Редактировать
              </button>
              <button @click="toggleBlock(block)" :class="['inline-flex items-center px-3 py-1 text-xs font-medium rounded', block.isActive ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'bg-green-600 text-white hover:bg-green-700']">
                {{ block.isActive ? 'Деактивировать' : 'Активировать' }}
              </button>
              <button @click="deleteBlock(block)" class="inline-flex items-center px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700">
                <svg class="mr-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                Удалить
              </button>
            </div>
            <!-- Заголовок блока -->
            <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ block.title }}</h3>
            <!-- Описание -->
            <p class="text-gray-600 mb-4">{{ block.description }}</p>
            <!-- Markdown контент -->
            <div class="prose max-w-none" v-html="renderMarkdown(block.content)"></div>
            <!-- Статус для админа -->
            <div class="mt-4 pt-4 border-t border-gray-200">
              <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', block.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800']">
                {{ block.isActive ? 'Активен' : 'Неактивен' }}
              </span>
              <span class="ml-4 text-xs text-gray-500">Создан: {{ formatDate(block.createdAt) }}</span>
              <span class="ml-4 text-xs text-gray-500">Обновлен: {{ formatDate(block.updatedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Нет контента для админа -->
        <div v-else class="text-center py-8">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Нет контента</h3>
          <p class="mt-1 text-sm text-gray-500">Контентные блоки для {{ props.productDisplayName }} не найдены.</p>
        </div>
      </div>
    </div>

    <!-- Контент для обычных пользователей -->
    <div v-else>
      <!-- Загрузка -->
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p class="mt-2 text-gray-600">Загрузка контента...</p>
      </div>

      <!-- Ошибка -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Ошибка загрузки</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Активный контент -->
      <div v-else-if="activeContent" class="bg-white rounded-lg shadow-lg p-8">
        <h3 class="text-xl font-semibold text-gray-800 mb-3">{{ activeContent.title }}</h3>
        <p class="text-gray-600 mb-6">{{ activeContent.description }}</p>
        <div class="prose max-w-none" v-html="renderMarkdown(activeContent.content)"></div>
      </div>

      <!-- Нет активного контента -->
      <div v-else class="text-center py-8">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Нет контента</h3>
        <p class="mt-1 text-sm text-gray-500">Активный контент для {{ props.productDisplayName }} не найден.</p>
      </div>
    </div>

    <!-- Модальное окно создания/редактирования -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ showEditModal ? 'Редактировать контент' : 'Создать новый контент' }} для {{ props.productDisplayName }}
          </h3>
          <form @submit.prevent="showEditModal ? updateContentBlock() : createContentBlock()">
            <!-- Заголовок -->
            <div class="mb-4">
              <label for="title" class="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
              <input 
                v-model="form.title" 
                type="text" 
                id="title" 
                maxlength="200" 
                required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                placeholder="Введите заголовок"
              />
              <p class="text-xs text-gray-500 mt-1">{{ form.title?.length || 0 }}/200 символов</p>
            </div>
            
            <!-- Описание -->
            <div class="mb-4">
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Описание</label>
              <textarea 
                v-model="form.description" 
                id="description" 
                maxlength="500" 
                rows="3" 
                required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                placeholder="Введите краткое описание"
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">{{ form.description?.length || 0 }}/500 символов</p>
            </div>
            
            <!-- Контент -->
            <div class="mb-4">
              <label for="content" class="block text-sm font-medium text-gray-700 mb-2">Контент (Markdown)</label>
              <textarea 
                v-model="form.content" 
                id="content" 
                rows="8" 
                required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                placeholder="Введите контент в формате Markdown"
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">Поддерживается Markdown синтаксис</p>
            </div>
            
            <!-- Активность -->
            <div class="mb-6">
              <label class="flex items-center">
                <input 
                  v-model="form.isActive" 
                  type="checkbox" 
                  class="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm text-gray-700">Активен</span>
              </label>
            </div>
            
            <!-- Кнопки -->
            <div class="flex justify-end space-x-3">
              <button 
                type="button" 
                @click="closeModal()" 
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Отмена
              </button>
              <button 
                type="submit" 
                :disabled="submitting" 
                class="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {{ submitting ? 'Сохранение...' : (showEditModal ? 'Обновить' : 'Создать') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  productType: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    required: true
  },
  productDisplayName: {
    type: String,
    default: 'Продукт'
  }
});

const { isAdmin } = useAuth();

// Использование composable
const {
  fetchActiveContent,
  fetchAllContent,
  createContent,
  updateContent,
  toggleContentActivity,
  deleteContent,
  renderMarkdown,
  formatDate
} = useProductContent(props.productType, props.productId);

// Состояние
const contentBlocks = ref([]);
const activeContent = ref(null);
const loading = ref(true);
const error = ref(null);
const submitting = ref(false);

// Модальные окна
const showCreateModal = ref(false);
const showEditModal = ref(false);
const editingBlock = ref(null);

// Форма
const form = ref({
  title: '',
  description: '',
  content: '',
  isActive: true
});

// Загрузка контента в зависимости от роли
const loadContent = async () => {
  try {
    loading.value = true;
    error.value = null;

    if (isAdmin.value) {
      // Админ видит все контентные блоки
      contentBlocks.value = await fetchAllContent();
    } else {
      // Обычные пользователи видят только активный контент
      activeContent.value = await fetchActiveContent();
    }
  } catch (err) {
    console.error('Ошибка загрузки контента:', err);
    error.value = err.message || 'Не удалось загрузить контент';
  } finally {
    loading.value = false;
  }
};

// Создание нового контента
const createContentBlock = async () => {
  try {
    submitting.value = true;
    
    await createContent({
      productType: props.productType,
      productId: props.productId,
      title: form.value.title,
      description: form.value.description,
      content: form.value.content,
      isActive: form.value.isActive
    });
    
    closeModal();
    await loadContent();
  } catch (err) {
    console.error('Ошибка создания контента:', err);
    error.value = err.message || 'Не удалось создать контент';
  } finally {
    submitting.value = false;
  }
};

// Редактирование контента
const editBlock = (block) => {
  editingBlock.value = block;
  form.value = {
    title: block.title,
    description: block.description,
    content: block.content,
    isActive: block.isActive
  };
  showEditModal.value = true;
};

// Обновление контента
const updateContentBlock = async () => {
  try {
    submitting.value = true;
    
    await updateContent(editingBlock.value._id, {
      title: form.value.title,
      description: form.value.description,
      content: form.value.content,
      isActive: form.value.isActive
    });
    
    closeModal();
    await loadContent();
  } catch (err) {
    console.error('Ошибка обновления контента:', err);
    error.value = err.message || 'Не удалось обновить контент';
  } finally {
    submitting.value = false;
  }
};

// Переключение активности
const toggleBlock = async (block) => {
  try {
    await toggleContentActivity(block._id);
    await loadContent();
  } catch (err) {
    console.error('Ошибка переключения активности:', err);
    error.value = err.message || 'Не удалось изменить статус';
  }
};

// Удаление контента
const deleteBlock = async (block) => {
  if (!confirm('Вы уверены, что хотите удалить этот контент?')) {
    return;
  }
  
  try {
    await deleteContent(block._id);
    await loadContent();
  } catch (err) {
    console.error('Ошибка удаления контента:', err);
    error.value = err.message || 'Не удалось удалить контент';
  }
};

// Закрытие модальных окон
const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingBlock.value = null;
  form.value = {
    title: '',
    description: '',
    content: '',
    isActive: true
  };
};

// Загрузка при монтировании
onMounted(() => {
  loadContent();
});
</script>