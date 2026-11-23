import axios from 'axios'

export const TOKEN_KEY = 'fk_token'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // An expired or invalid token on a protected call: clear it so the UI returns to logged-out state.
    const url = err.config?.url || ''
    if (err.response?.status === 401 && !url.startsWith('/auth/login')) {
      localStorage.removeItem(TOKEN_KEY)
      window.dispatchEvent(new Event('fk:logout'))
    }
    return Promise.reject(err)
  }
)

export const errorMessage = (err) =>
  err.response?.data?.message || (err.request ? 'Cannot reach the server. Is the backend running?' : 'Something went wrong')

export default api
