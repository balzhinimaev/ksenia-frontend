export default defineNuxtRouteMiddleware((to) => {
  const cookie = useCookie('bearer-token')
  
  // Если пользователь не авторизован и пытается попасть не на страницу входа
  if (!cookie.value && to.path !== '/login') {
    return navigateTo('/login')
  }
  
  // Если пользователь авторизован и пытается попасть на страницу входа
  if (cookie.value && to.path === '/login') {
    return navigateTo('/')
  }
}) 