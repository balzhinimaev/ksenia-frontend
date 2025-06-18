import { jwtDecode } from 'jwt-decode';

interface AuthUser {
  id: string;
  role: string;
  login?: string; // для админа
  username?: string; // для кастомера
}

export const useAuth = () => {
  const tokenCookie = useCookie<string | undefined>('bearer-token');

  const user = computed<AuthUser | null>(() => {
    if (!tokenCookie.value) {
      return null;
    }
    try {
      // Декодируем токен, чтобы получить данные пользователя
      const decoded = jwtDecode<any>(tokenCookie.value);
      return {
        id: decoded.id, // Предполагаем, что ID пользователя хранится в поле 'id'
        role: decoded.role,
        login: decoded.login,
        username: decoded.username,
      };
    } catch (e) {
      console.error('Invalid token:', e);
      // Если токен невалидный, очищаем его
      tokenCookie.value = undefined;
      return null;
    }
  });
  
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isCustomer = computed(() => user.value?.role === 'customer');

  return { user, isAdmin, isCustomer };
}; 