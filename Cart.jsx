import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { inr, FALLBACK_IMG } from '../utils/format.js'

export default function Cart() {
  const { items, totals, busy, updateQuantity, removeItem } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="empty">
          <h2>Your cart is empty</h2>
          <p>Add items you like and they will show up here.</p>
          <Link to="/products" className="btn btn-blue">Start shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container cart-layout">
      <section className="panel">
        <h2 className="panel-title">My cart ({totals.count})</h2>
        {items.map((it) => (
          <article key={it.id} className="cart-row">
            <Link to={`/products/${it.product.id}`}>
              <img src={it.product.imageUrl || FALLBACK_IMG} alt={it.product.name} onError={(e) => { e.currentTarget.src = FALLBACK_IMG }} />
            </Link>
            <div className="cart-info">
              <Link to={`/products/${it.product.id}`} className="cart-name">{it.product.name}</Link>
              <div className="muted">Brand: {it.product.brand}</div>
              <div className="price-row">
                <span className="price">{inr(it.product.price)}</span>
                <span className="mrp">{inr(it.product.mrp)}</span>
                <span className="off">{it.product.discountPercent}% off</span>
              </div>
              <div className="cart-controls">
                <div className="stepper">
                  <button disabled={busy} onClick={() => updateQuantity(it.id, it.quantity - 1)} aria-label="Decrease quantity">−</button>
                  <span>{it.quantity}</span>
                  <button disabled={busy || it.quantity >= Math.min(it.product.stock, 10)} onClick={() => updateQuantity(it.id, it.quantity + 1)} aria-label="Increase quantity">+</button>
                </div>
                <button className="link-btn" disabled={busy} onClick={() => removeItem(it.id)}>Remove</button>
              </div>
            </div>
            <div className="cart-line-total">{inr(it.product.price * it.quantity)}</div>
          </article>
        ))}
        <div className="place-order-bar">
          <button className="btn btn-orange btn-lg" onClick={() => navigate('/checkout')}>Place order</button>
        </div>
      </section>

      <aside className="panel summary">
        <h3 className="panel-title">Price details</h3>
        <div className="sum-row"><span>Price ({totals.count} items)</span><span>{inr(totals.mrp)}</span></div>
        <div className="sum-row"><span>Discount</span><span className="green">− {inr(totals.savings)}</span></div>
        <div className="sum-row"><span>Delivery charges</span><span className="green">Free</span></div>
        <div className="sum-row sum-total"><span>Total amount</span><span>{inr(totals.price)}</span></div>
        {totals.savings > 0 && <p className="green savings">You will save {inr(totals.savings)} on this order</p>}
      </aside>
    </div>
  )
}
