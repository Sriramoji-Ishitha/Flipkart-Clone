import { Link } from 'react-router-dom'
import Rating from './Rating.jsx'
import { inr, FALLBACK_IMG } from '../utils/format.js'

export default function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-card-img">
        <img
          src={product.imageUrl || FALLBACK_IMG}
          alt={product.name}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = FALLBACK_IMG }}
        />
      </div>
      <div className="product-card-body">
        <div className="product-card-brand">{product.brand}</div>
        <div className="product-card-name" title={product.name}>{product.name}</div>
        <Rating value={product.rating} count={product.ratingCount} />
        <div className="price-row">
          <span className="price">{inr(product.price)}</span>
          {product.discountPercent > 0 && (
            <>
              <span className="mrp">{inr(product.mrp)}</span>
              <span className="off">{product.discountPercent}% off</span>
            </>
          )}
        </div>
        {product.stock === 0 && <div className="oos">Out of stock</div>}
      </div>
    </Link>
  )
}
