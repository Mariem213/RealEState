import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Eye, EyeOff } from 'lucide-react'
import '../styles/Login.css'

const AUTH_BG_URL = '../../auth-bg.jpg'

function Login() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div
      className="login-page"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.35)), url(${AUTH_BG_URL})`,
      }}
    >
      <div className="login-card">
        <div className="login-card__icon">
          <User size={36} aria-hidden />
        </div>
        <h1 className="login-card__title">Log in</h1>
        <p className="login-card__subtitle">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>

        <form className="login-form">
          <label className="login-form__label" htmlFor="email">
            Your email
          </label>
          <input
            id="email"
            type="email"
            className="login-form__input"
            placeholder=""
            autoComplete="email"
          />

          <div className="login-form__password-label-row">
            <label className="login-form__label" htmlFor="password">
              Your password
            </label>
            <button
              type="button"
              className="login-form__toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <Eye size={20} aria-hidden /> : <EyeOff size={20} aria-hidden />}
              <span>{showPassword ? 'Hide' : 'Show'}</span>
            </button>
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className="login-form__input"
            placeholder=""
            autoComplete="current-password"
          />
          <a href="/forgot-password" className="login-form__forgot">
            Forget your password
          </a>

          <button type="submit" className="login-form__submit">
            Log in
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
