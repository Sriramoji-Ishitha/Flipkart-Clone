import { Link } from 'react-router-dom'

const EMOJI = {
  Mobiles: '📱', Laptops: '💻', Electronics: '🎧', Fashion: '👕',
  Home: '🛋️', Appliances: '🧺', Books: '📚', Toys: '🧸',
}

export default function CategoryStrip({ categories }) {
  return (
    <nav className="category-strip" aria-label="Shop by category">
      {categories.map((c) => (
        <Link key={c.id} to={`/products?categoryId=${c.id}`} className="category-item">
          <span className="category-emoji" aria-hidden="true">{EMOJI[c.name] || '🛍️'}</span>
          <span>{c.name}</span>
        </Link>
      ))}
    </nav>
  )
}
