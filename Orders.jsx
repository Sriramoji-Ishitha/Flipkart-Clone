import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { errorMessage } from '../api/client.js'
import { useToast } from '../context/ToastContext.jsx'
import { dateTime, inr, FALLBACK_IMG } from '../utils/format.js'

export default function Orders() {
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/orders')
      .then((r) => setOrders(r.data))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  const cancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return
    try {
      const { data } = await api.put(`/orders/${id}/cancel`)
      setOrders((list) => list.map((o) => (o.id === id ? data : o)))
      toast('Order cancelled', 'success')
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  if (loading) return <div className="center-msg">Loading orders...</div>

  return (
    <div className="container">
      <h1 className="page-title">My orders</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {!error && orders.length === 0 && (
        <div className="empty">
          <h3>You have not placed any orders yet</h3>
          <Link to="/products" className="btn btn-blue">Start shopping</Link>
        </div>
      )}
      {orders.map((o) => (
        <article key={o.id} className="panel order">
          <header className="order-head">
            <div><strong>Order #{o.id}</strong><div className="muted">Placed on {dateTime(o.createdAt)}</div></div>
            <div><span className={`status status-${o.status.toLowerCase()}`}>{o.status}</span></div>
            <div className="order-total">{inr(o.totalAmount)}<div className="muted">{o.paymentMethod}</div></div>
          </header>
          {o.items.map((i, idx) => (
            <div key={idx} className="order-item">
              <img src={i.imageUrl || FALLBACK_IMG} alt={i.productName} onError={(e) => { e.currentTarget.src = FALLBACK_IMG }} />
              <div>
                <Link to={`/products/${i.productId}`}>{i.productName}</Link>
                <div className="muted">Qty {i.quantity} · {inr(i.price)} each</div>
              </div>
            </div>
          ))}
          <footer className="order-foot">
            <span className="muted">Ship to: {o.shippingAddress}</span>
            {(o.status === 'PLACED' || o.status === 'CONFIRMED') && (
              <button className="btn btn-outline btn-sm" onClick={() => cancel(o.id)}>Cancel order</button>
            )}
          </footer>
        </article>
      ))}
    </div>
  )
}
