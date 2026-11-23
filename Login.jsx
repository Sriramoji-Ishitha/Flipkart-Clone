import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(location.state?.from || '/', { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth">
      <aside className="auth-side">
        <h2>Login</h2>
        <p>Get access to your orders, cart and recommendations.</p>
      </aside>
      <form className="auth-form" onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus autoComplete="email" /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></label>
        {error && <div className="alert alert-error">{error}</div>}
        <button className="btn btn-orange btn-lg btn-block" disabled={submitting}>{submitting ? 'Logging in...' : 'Log in'}</button>
        <p className="muted center">New to Flipkart? <Link to="/register" state={location.state}>Create an account</Link></p>
        <p className="muted center small">Demo: demo@flipkart.com / Demo@123</p>
      </form>
    </div>
  )
}
