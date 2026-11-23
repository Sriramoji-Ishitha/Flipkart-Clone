import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { totals } = useCart()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') || '')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const submit = (e) => {
    e.preventDefault()
    const term = q.trim()
    navigate(term ? `/products?q=${encodeURIComponent(term)}` : '/products')
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo" aria-label="Flipkart Clone home">
          <span className="logo-name">Flipkart</span>
          <span className="logo-tag">Explore <em>Plus</em></span>
        </Link>

        <form className="search" onSubmit={submit} role="search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for products, brands and more"
            aria-label="Search products"
          />
          <button type="submit" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.5-4.5" />
            </svg>
          </button>
        </form>

        <div className="nav-actions">
          {user ? (
            <div className="dropdown" ref={menuRef}>
              <button className="nav-link" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen}>
                {user.name.split(' ')[0]} ▾
              </button>
              {menuOpen && (
                <div className="dropdown-menu">
                  <Link to="/orders" onClick={() => setMenuOpen(false)}>My orders</Link>
                  <Link to="/cart" onClick={() => setMenuOpen(false)}>My cart</Link>
                  <button onClick={() => { logout(); setMenuOpen(false); navigate('/') }}>Log out</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-btn">Login</Link>
          )}

          <Link to="/cart" className="nav-link cart-link">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" />
              <path d="M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" />
            </svg>
            <span>Cart</span>
            {totals.count > 0 && <span className="cart-badge">{totals.count}</span>}
          </Link>
        </div>
      </div>
    </header>
  )
}
