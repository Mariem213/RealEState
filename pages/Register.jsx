import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Eye, EyeOff } from 'lucide-react'
import Reveal from '../components/Reveal'
import '../styles/Register.css'

const AUTH_BG_URL = '../../auth-bg.jpg'

function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)

  return (
    <div
      className="register-page"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.35)), url(${AUTH_BG_URL})`,
      }}
    >
      <Reveal delay={40}>
      <div className="register-card">
        <div className="register-card__icon">
          <User size={36} aria-hidden />
        </div>
        <h1 className="register-card__title">Sign up</h1>
        <p className="register-card__subtitle">
          Already have an account? <Link to="/login">Log in</Link>
        </p>

        <form className="register-form">
          <label className="register-form__label" htmlFor="email">
            Your email
          </label>
          <input
            id="email"
            type="email"
            className="register-form__input"
            placeholder=""
            autoComplete="email"
          />

          <div className="register-form__password-label-row">
            <label className="register-form__label" htmlFor="password">
              Your password
            </label>
            <button
              type="button"
              className="register-form__toggle-password"
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
            className="register-form__input"
            placeholder=""
            autoComplete="new-password"
          />

          <div className="register-form__password-label-row">
            <label className="register-form__label" htmlFor="repeat-password">
              Repeat Your password
            </label>
            <button
              type="button"
              className="register-form__toggle-password"
              onClick={() => setShowRepeatPassword(!showRepeatPassword)}
              aria-label={showRepeatPassword ? 'Hide password' : 'Show password'}
            >
              {showRepeatPassword ? <Eye size={20} aria-hidden /> : <EyeOff size={20} aria-hidden />}
              <span>{showRepeatPassword ? 'Hide' : 'Show'}</span>
            </button>
          </div>
          <input
            id="repeat-password"
            type={showRepeatPassword ? 'text' : 'password'}
            className="register-form__input"
            placeholder=""
            autoComplete="new-password"
          />

          <button type="submit" className="register-form__submit">
            Sign up
          </button>
        </form>
      </div>
      </Reveal>
    </div>
  )
}

export default Register
