import { useAuth } from '~/composables/useAuth';

export default defineNuxtRouteMiddleware((to, from) => {
  const { isCustomer } = useAuth();
  
  if (!isCustomer.value) {
    // Если пользователь не кастомер, перенаправляем на главную.
    // Глобальный middleware уже должен обработать неавторизованных пользователей.
    return navigateTo('/');
  }
  // Если роль 'customer', доступ разрешен.
}); 