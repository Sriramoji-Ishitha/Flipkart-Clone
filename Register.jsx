import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    setSubmitting(true)
    try {
      await register(form)
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
        <h2>Create your account</h2>
        <p>Sign up to save your cart and track every order.</p>
      </aside>
      <form className="auth-form" onSubmit={submit}>
        <label>Full name<input value={form.name} onChange={set('name')} required autoFocus autoComplete="name" /></label>
        <label>Email<input type="email" value={form.email} onChange={set('email')} required autoComplete="email" /></label>
        <label>Mobile number<input type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" /></label>
        <label>Password<input type="password" value={form.password} onChange={set('password')} required minLength={6} autoComplete="new-password" /></label>
        {error && <div className="alert alert-error">{error}</div>}
        <button className="btn btn-orange btn-lg btn-block" disabled={submitting}>{submitting ? 'Creating account...' : 'Sign up'}</button>
        <p className="muted center">Already have an account? <Link to="/login" state={location.state}>Log in</Link></p>
      </form>
    </div>
  )
}
