export default defineNuxtPlugin(() => {
  const router = useRouter()
  const token = useCookie('bearer-token')

  // Функция для проверки истек ли токен
  function isTokenExpired(token: string): boolean {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))

      const { exp } = JSON.parse(jsonPayload)
      return exp * 1000 < Date.now()
    } catch {
      return true
    }
  }

  // Глобальный обработчик fetch запросов
  globalThis.$fetch = new Proxy(globalThis.$fetch, {
    apply: async function(target, thisArg, argumentsList) {
      try {
        // Проверяем токен перед каждым запросом
        if (token.value && isTokenExpired(token.value)) {
          token.value = null
          router.push('/login')
          throw new Error('Сессия истекла. Пожалуйста, войдите снова.')
        }

        const response = await target.apply(thisArg, argumentsList)
        return response
      } catch (error: any) {
        // Если получаем 401, значит токен истек или невалиден
        if (error.response?.status === 401) {
          token.value = null
          router.push('/login')
          throw new Error('Сессия истекла. Пожалуйста, войдите снова.')
        }
        throw error
      }
    }
  })
}) 