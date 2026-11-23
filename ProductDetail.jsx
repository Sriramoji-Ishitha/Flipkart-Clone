import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api, { errorMessage } from '../api/client.js'
import Rating from '../components/Rating.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { inr, FALLBACK_IMG } from '../utils/format.js'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart, busy } = useCart()
  const [product, setProduct] = useState(null)
  const [error, setError] = useState('')
  const [qty, setQty] = useState(1)

  useEffect(() => {
    setProduct(null)
    setError('')
    api.get(`/products/${id}`)
      .then((r) => setProduct(r.data))
      .catch((e) => setError(errorMessage(e)))
  }, [id])

  if (error) return <div className="container"><div className="alert alert-error">{error}</div><Link to="/products">Back to products</Link></div>
  if (!product) return <div className="center-msg">Loading...</div>

  const requireLogin = () => navigate('/login', { state: { from: `/products/${id}` } })

  const onAdd = async () => {
    if (!user) return requireLogin()
    await addToCart(product.id, qty)
  }

  const onBuyNow = async () => {
    if (!user) return requireLogin()
    if (await addToCart(product.id, qty)) navigate('/checkout')
  }

  const inStock = product.stock > 0
  const maxQty = Math.min(product.stock, 10)

  return (
    <div className="container">
      <div className="detail">
        <div className="detail-media">
          <img src={product.imageUrl || FALLBACK_IMG} alt={product.name} onError={(e) => { e.currentTarget.src = FALLBACK_IMG }} />
          <div className="detail-actions">
            <button className="btn btn-orange-light" onClick={onAdd} disabled={!inStock || busy}>Add to cart</button>
            <button className="btn btn-orange" onClick={onBuyNow} disabled={!inStock || busy}>Buy now</button>
          </div>
        </div>

        <div className="detail-info">
          <div className="crumbs">
            <Link to="/">Home</Link> › <Link to={`/products?categoryId=${product.category.id}`}>{product.category.name}</Link>
          </div>
          <h1>{product.name}</h1>
          <Rating value={product.rating} count={product.ratingCount} />
          <div className="price-row price-row-lg">
            <span className="price">{inr(product.price)}</span>
            {product.discountPercent > 0 && (
              <>
                <span className="mrp">{inr(product.mrp)}</span>
                <span className="off">{product.discountPercent}% off</span>
              </>
            )}
          </div>

          <p className={inStock ? 'stock-ok' : 'oos'}>
            {inStock ? (product.stock <= 5 ? `Hurry, only ${product.stock} left` : 'In stock') : 'Currently out of stock'}
          </p>

          {inStock && (
            <label className="qty-select">
              Quantity
              <select value={qty} onChange={(e) => setQty(Number(e.target.value))}>
                {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          )}

          <dl className="specs">
            <dt>Brand</dt><dd>{product.brand}</dd>
            <dt>Category</dt><dd>{product.category.name}</dd>
          </dl>

          <h3>Description</h3>
          <p className="description">{product.description}</p>
        </div>
      </div>
    </div>
  )
}
