function getRoleFromToken(token: string): string | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const { role } = JSON.parse(jsonPayload);
    return role;
  } catch (e) {
    console.error('Failed to decode or parse token:', e);
    return null;
  }
}

export default defineNuxtRouteMiddleware((to, from) => {
  const tokenCookie = useCookie('bearer-token');
  
  if (tokenCookie.value) {
    const role = getRoleFromToken(tokenCookie.value);
    
    if (role !== 'admin') {
      // Если пользователь не админ, перенаправляем на главную.
      // Можно также создать страницу "Доступ запрещен".
      return navigateTo('/');
    }
    // Если роль 'admin', то доступ разрешен.
  } else {
      // Если токена нет, глобальный middleware уже должен был перенаправить на /login.
      // Это дополнительная подстраховка.
      return navigateTo('/login');
  }
}); 