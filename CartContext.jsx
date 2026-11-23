import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api, { errorMessage } from '../api/client.js'
import { useAuth } from './AuthContext.jsx'
import { useToast } from './ToastContext.jsx'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const toast = useToast()
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user) {
      setItems([])
      return
    }
     api.get('/cart').then((res) => setItems(res.data)).catch(() => {})
  }, [user])

    const run = useCallback(async (request, successMessage) => {
      setBusy(true)
      try {
        const { data } = await request()
        if (data) setItems(data)
        if (successMessage) toast(successMessage, 'success')
        return true
      } catch (err) {
        toast(errorMessage(err), 'error')
        return false
      } finally {
        setBusy(false)
      }
    }, [toast])

    const addToCart = (productId, quantity = 1) =>
      run(() => api.post('/cart', { productId, quantity }), 'Added to cart')

    const updateQuantity = (itemId, quantity) =>
      run(() => api.put(`/cart/${itemId}`, null, { params: { quantity } }))

    const removeItem = (itemId) => run(() => api.delete(`/cart/${itemId}`), 'Item removed')

    const clearLocal = () => setItems([])

    const totals = useMemo(() => {
      const count = items.reduce((n, i) => n + i.quantity, 0)
      const price = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
      const mrp = items.reduce((s, i) => s + i.product.mrp * i.quantity, 0)
      return { count, price, mrp, savings: mrp - price }
    }, [items])
    return (
      <CartContext.Provider value={{ items, busy, totals, addToCart, updateQuantity, removeItem, clearLocal }}>
        {children}
      </CartContext.Provider>
    )
  }

export const useCart = () => useContext(CartContext)
