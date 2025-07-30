import { useAuth } from '~/composables/useAuth';

export default defineNuxtRouteMiddleware((to, from) => {
  const { isCustomer, isAdmin } = useAuth();
  
  if (!isCustomer.value && !isAdmin.value) {
    // Если пользователь не кастомер и не админ, перенаправляем на главную.
    // Глобальный middleware уже должен обработать неавторизованных пользователей.
    return navigateTo('/');
  }
  // Если роль 'customer' или 'admin', доступ разрешен.
});