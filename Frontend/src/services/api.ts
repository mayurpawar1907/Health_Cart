import axios, { type AxiosError } from 'axios'
import { store } from '@/store'
import { clearSession, updateTokens } from '@/store/authSlice'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hc_access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshing: Promise<string | null> | null = null

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ message?: string }>) => {
    const original = error.config
    if (!original || error.response?.status !== 401 || original.url?.includes('/auth/')) {
      return Promise.reject(error)
    }
    if (!refreshing) {
      refreshing = (async () => {
        const refreshToken = localStorage.getItem('hc_refresh')
        if (!refreshToken) return null
        try {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken })
          const payload = data.data ?? data
          store.dispatch(updateTokens({ accessToken: payload.accessToken, refreshToken: payload.refreshToken }))
          return payload.accessToken as string
        } catch {
          store.dispatch(clearSession())
          return null
        } finally {
          refreshing = null
        }
      })()
    }
    const token = await refreshing
    if (!token) {
      window.location.href = '/login'
      return Promise.reject(error)
    }
    original.headers.Authorization = `Bearer ${token}`
    return api(original)
  },
)

export function unwrap<T>(payload: { success?: boolean; data?: T } | T): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data
  }
  return payload as T
}

export default api
