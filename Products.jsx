import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/client.js'
import ProductCard from '../components/ProductCard.jsx'

const SORTS = [
  { value: '', label: 'Popularity' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Rating' },
  { value: 'newest', label: 'Newest first' },
]

export default function Products() {
  const [params, setParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [data, setData] = useState({ items: [], totalPages: 0, totalItems: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const q = params.get('q') || ''
  const categoryId = params.get('categoryId') || ''
  const sort = params.get('sort') || ''
  const minRating = params.get('minRating') || ''
  const maxPrice = params.get('maxPrice') || ''
  const page = Number(params.get('page') || 0)

  useEffect(() => { api.get('/categories').then((r) => setCategories(r.data)).catch(() => {}) }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    api.get('/products', {
      params: {
        q: q || undefined, categoryId: categoryId || undefined, sort: sort || undefined,
        minRating: minRating || undefined, maxPrice: maxPrice || undefined, page, size: 12,
      },
    })
      .then((r) => { if (!cancelled) setData(r.data) })
      .catch(() => { if (!cancelled) setError('Could not load products.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [q, categoryId, sort, minRating, maxPrice, page])

  const update = (changes) => {
    const next = new URLSearchParams(params)
    Object.entries({ page: 0, ...changes }).forEach(([k, v]) => {
      if (v === '' || v == null || (k === 'page' && Number(v) === 0)) next.delete(k)
      else next.set(k, v)
    })
    setParams(next)
  }

  const activeCategory = categories.find((c) => String(c.id) === categoryId)
  const title = q ? `Results for "${q}"` : activeCategory ? activeCategory.name : 'All products'

  return (
    <div className="container listing">
      <aside className="filters">
        <h3>Filters</h3>
        <div className="filter-group">
          <h4>Category</h4>
          <label><input type="radio" name="cat" checked={!categoryId} onChange={() => update({ categoryId: '' })} /> All</label>
          {categories.map((c) => (
            <label key={c.id}>
              <input type="radio" name="cat" checked={categoryId === String(c.id)} onChange={() => update({ categoryId: c.id })} /> {c.name}
            </label>
          ))}
        </div>
        <div className="filter-group">
          <h4>Customer rating</h4>
          {[['', 'Any'], ['4', '4★ & above'], ['3', '3★ & above']].map(([v, label]) => (
            <label key={label}><input type="radio" name="rating" checked={minRating === v} onChange={() => update({ minRating: v })} /> {label}</label>
          ))}
        </div>
        <div className="filter-group">
          <h4>Max price</h4>
          {[['', 'Any'], ['2000', 'Up to ₹2,000'], ['10000', 'Up to ₹10,000'], ['50000', 'Up to ₹50,000']].map(([v, label]) => (
            <label key={label}><input type="radio" name="price" checked={maxPrice === v} onChange={() => update({ maxPrice: v })} /> {label}</label>
          ))}
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => setParams({})}>Clear all</button>
      </aside>

      <section className="results">
        <div className="results-head">
          <div>
            <h1>{title}</h1>
            <span className="muted">{data.totalItems} items</span>
          </div>
          <label className="sort">
            Sort by
            <select value={sort} onChange={(e) => update({ sort: e.target.value })}>
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
        </div>

        {loading && <div className="center-msg">Loading...</div>}
        {error && <div className="alert alert-error">{error}</div>}
        {!loading && !error && data.items.length === 0 && (
          <div className="empty">
            <h3>No products match your search</h3>
            <p>Try a different keyword or clear the filters.</p>
          </div>
        )}

        <div className="grid grid-4">
          {data.items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {data.totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => update({ page: page - 1 })}>Previous</button>
            <span>Page {page + 1} of {data.totalPages}</span>
            <button className="btn btn-outline btn-sm" disabled={page + 1 >= data.totalPages} onClick={() => update({ page: page + 1 })}>Next</button>
          </div>
        )}
      </section>
    </div>
  )
}
