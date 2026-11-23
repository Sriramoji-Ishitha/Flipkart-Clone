import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client.js'
import CategoryStrip from '../components/CategoryStrip.jsx'
import ProductCard from '../components/ProductCard.jsx'

export default function Home() {
  const [categories, setCategories] = useState([])
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { data: cats } = await api.get('/categories')
        const top = await api.get('/products', { params: { sort: 'rating', size: 6 } })
        const perCategory = await Promise.all(
          cats.slice(0, 4).map((c) =>
            api.get('/products', { params: { categoryId: c.id, size: 6 } }).then((r) => ({ category: c, items: r.data.items }))
          )
        )
        if (cancelled) return
        setCategories(cats)
        setSections([{ title: 'Top rated right now', link: '/products?sort=rating', items: top.data.items }, ...perCategory.map((s) => ({
          title: `Best of ${s.category.name}`, link: `/products?categoryId=${s.category.id}`, items: s.items,
        }))])
      } catch (e) {
        if (!cancelled) setError('Could not load products. Make sure the backend is running on port 8080.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <>
      <CategoryStrip categories={categories} />
      <section className="hero">
        <div className="hero-text">
          <h1>Big Billion Savings</h1>
          <p>Up to 70% off on mobiles, laptops, fashion and home essentials.</p>
          <Link to="/products?sort=price_asc" className="btn btn-yellow">Shop the lowest prices</Link>
        </div>
        <div className="hero-art" aria-hidden="true">🛍️</div>
      </section>

      <div className="container">
        {loading && <div className="center-msg">Loading products...</div>}
        {error && <div className="alert alert-error">{error}</div>}
        {sections.map((s) => (
          <section key={s.title} className="shelf">
            <div className="shelf-head">
              <h2>{s.title}</h2>
              <Link to={s.link} className="btn btn-blue btn-sm">View all</Link>
            </div>
            <div className="grid">
              {s.items.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
