import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { errorMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { inr } from '../utils/format.js'

const PAYMENTS = [
  { value: 'COD', label: 'Cash on delivery' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CARD', label: 'Credit / debit card' },
]

export default function Checkout() {
  const { user } = useAuth()
  const { items, totals, clearLocal } = useCart()
  const toast = useToast()
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  const [payment, setPayment] = useState('COD')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="empty">
          <h2>Nothing to check out</h2>
          <Link to="/products" className="btn btn-blue">Browse products</Link>
        </div>
      </div>
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (address.trim().length < 10) {
      setError('Enter your full delivery address (house, street, city, PIN code).')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await api.post('/orders', { shippingAddress: address.trim(), paymentMethod: payment })
      clearLocal()
      toast(`Order #${data.id} placed successfully`, 'success')
      navigate('/orders')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="container cart-layout" onSubmit={submit}>
      <section className="panel">
        <h2 className="panel-title">Delivery address</h2>
        <div className="pad">
          <p className="muted">Deliver to {user.name}{user.phone ? ` · ${user.phone}` : ''}</p>
          <textarea
            rows="4"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="House no., street, area, city, state, PIN code"
            aria-label="Delivery address"
          />
        </div>

        <h2 className="panel-title">Payment method</h2>
        <div className="pad pay-options">
          {PAYMENTS.map((p) => (
            <label key={p.value} className="pay-option">
              <input type="radio" name="pay" value={p.value} checked={payment === p.value} onChange={() => setPayment(p.value)} />
              {p.label}
            </label>
          ))}
          {payment !== 'COD' && <p className="muted">This is a demo. No payment is taken and the order is placed as pending payment.</p>}
        </div>

        <h2 className="panel-title">Order summary</h2>
        {items.map((it) => (
          <div key={it.id} className="sum-row pad">
            <span>{it.product.name} × {it.quantity}</span>
            <span>{inr(it.product.price * it.quantity)}</span>
          </div>
        ))}
      </section>

      <aside className="panel summary">
        <h3 className="panel-title">Price details</h3>
        <div className="sum-row"><span>Price ({totals.count} items)</span><span>{inr(totals.mrp)}</span></div>
        <div className="sum-row"><span>Discount</span><span className="green">− {inr(totals.savings)}</span></div>
        <div className="sum-row"><span>Delivery charges</span><span className="green">Free</span></div>
        <div className="sum-row sum-total"><span>Amount payable</span><span>{inr(totals.price)}</span></div>
        {error && <div className="alert alert-error">{error}</div>}
        <button type="submit" className="btn btn-orange btn-lg btn-block" disabled={submitting}>
          {submitting ? 'Placing order...' : 'Confirm order'}
        </button>
      </aside>
    </form>
  )
}
