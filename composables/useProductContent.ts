interface ContentBlock {
  _id: string;
  productType: string;
  productId: string;
  title: string;
  description: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ContentResponse {
  success: boolean;
  data: ContentBlock | ContentBlock[];
  message?: string;
}

interface CreateContentData {
  productType: string;
  productId: string;
  title: string;
  description: string;
  content: string;
  isActive?: boolean;
}

interface UpdateContentData {
  title?: string;
  description?: string;
  content?: string;
  isActive?: boolean;
}

export const useProductContent = (productType: string, productId: string) => {
  const config = useRuntimeConfig();
  const tokenCookie = useCookie('bearer-token');

  // Получение активного контента для продукта (публичный эндпоинт)
  const fetchActiveContent = async (): Promise<ContentBlock | null> => {
    try {
      const response = await $fetch<ContentResponse>(`${config.public.apiBase}/api/content/active`, {
        query: {
          productType,
          productId
        }
      });

      if (response.success && response.data) {
        return response.data as ContentBlock;
      }
      return null;
    } catch (error) {
      console.error('Ошибка загрузки активного контента:', error);
      return null;
    }
  };

  // Получение всех контентных блоков для продукта (только для админа)
  const fetchAllContent = async (): Promise<ContentBlock[]> => {
    try {
      if (!tokenCookie.value) {
        throw new Error('Токен авторизации не найден');
      }

      const response = await $fetch<ContentResponse>(`${config.public.apiBase}/api/content`, {
        headers: {
          'Authorization': `Bearer ${tokenCookie.value}`
        },
        query: {
          productType,
          productId
        }
      });

      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Ошибка загрузки всех контентных блоков:', error);
      throw error;
    }
  };

  // Создание нового контентного блока (только для админа)
  const createContent = async (data: CreateContentData): Promise<ContentBlock> => {
    try {
      if (!tokenCookie.value) {
        throw new Error('Токен авторизации не найден');
      }

      const response = await $fetch<ContentResponse>(`${config.public.apiBase}/api/content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenCookie.value}`,
          'Content-Type': 'application/json'
        },
        body: {
          ...data,
          productType,
          productId
        }
      });

      if (response.success && response.data) {
        return response.data as ContentBlock;
      }
      throw new Error(response.message || 'Ошибка создания контента');
    } catch (error) {
      console.error('Ошибка создания контента:', error);
      throw error;
    }
  };

  // Обновление контентного блока (только для админа)
  const updateContent = async (contentId: string, data: UpdateContentData): Promise<ContentBlock> => {
    try {
      if (!tokenCookie.value) {
        throw new Error('Токен авторизации не найден');
      }

      const response = await $fetch<ContentResponse>(`${config.public.apiBase}/api/content/${contentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${tokenCookie.value}`,
          'Content-Type': 'application/json'
        },
        body: data
      });

      if (response.success && response.data) {
        return response.data as ContentBlock;
      }
      throw new Error(response.message || 'Ошибка обновления контента');
    } catch (error) {
      console.error('Ошибка обновления контента:', error);
      throw error;
    }
  };

  // Переключение активности контентного блока (только для админа)
  const toggleContentActivity = async (contentId: string): Promise<ContentBlock> => {
    try {
      if (!tokenCookie.value) {
        throw new Error('Токен авторизации не найден');
      }

      const response = await $fetch<ContentResponse>(`${config.public.apiBase}/api/content/${contentId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${tokenCookie.value}`
        }
      });

      if (response.success && response.data) {
        return response.data as ContentBlock;
      }
      throw new Error(response.message || 'Ошибка переключения активности');
    } catch (error) {
      console.error('Ошибка переключения активности:', error);
      throw error;
    }
  };

  // Удаление контентного блока (только для админа)
  const deleteContent = async (contentId: string): Promise<void> => {
    try {
      if (!tokenCookie.value) {
        throw new Error('Токен авторизации не найден');
      }

      const response = await $fetch<ContentResponse>(`${config.public.apiBase}/api/content/${contentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tokenCookie.value}`
        }
      });

      if (!response.success) {
        throw new Error(response.message || 'Ошибка удаления контента');
      }
    } catch (error) {
      console.error('Ошибка удаления контента:', error);
      throw error;
    }
  };

  // Простой рендер Markdown
  const renderMarkdown = (content: string): string => {
    if (!content) return '';
    
    return content
      .replace(/^# (.*)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*)/gm, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
      .replace(/^### (.*)/gm, '<h3 class="text-lg font-medium mb-2">$1</h3>')
      .replace(/^---$/gm, '<hr class="my-6 border-t border-gray-300" />')
      .replace(/^\*\*\*$/gm, '<hr class="my-6 border-t border-gray-300" />')
      .replace(/^___$/gm, '<hr class="my-6 border-t border-gray-300" />')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank">$1</a>')
      .replace(/^> (.*)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">$1</blockquote>')
      .replace(/^\* (.*)/gm, '<li class="ml-4">• $1</li>')
      .replace(/^- (.*)/gm, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.*)/gm, '<li class="ml-4">$1</li>')
      .split('\n\n')
      .map(paragraph => {
        if (paragraph.startsWith('<h') || paragraph.startsWith('<hr') || paragraph.startsWith('<blockquote') || paragraph.includes('<li')) {
          return paragraph;
        }
        return `<p class="mb-4">${paragraph.replace(/\n/g, '<br>')}</p>`;
      })
      .join('');
  };

  // Форматирование даты
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return {
    fetchActiveContent,
    fetchAllContent,
    createContent,
    updateContent,
    toggleContentActivity,
    deleteContent,
    renderMarkdown,
    formatDate
  };
};