import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Eye, EyeOff } from 'lucide-react'
import Reveal from '../components/Reveal'
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
} from '../utils/authValidation'
import '../styles/Register.css'

const AUTH_BG_URL = '../../auth-bg.jpg'

function Register() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    repeatPassword: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)
    const matchErr = validatePasswordMatch(password, repeatPassword)
    setErrors({
      email: emailErr,
      password: passwordErr,
      repeatPassword: matchErr,
    })
    if (emailErr || passwordErr || matchErr) return
    navigate('/', { replace: true })
  }

  return (
    <div
      className="register-page"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.35)), url(${AUTH_BG_URL})`,
      }}
    >
      <Link to="/" className="auth-back-home">
        ← Back to home
      </Link>
      <Reveal delay={40}>
      <div className="register-card">
        <div className="register-card__icon">
          <User size={36} aria-hidden />
        </div>
        <h1 className="register-card__title">Sign up</h1>
        <p className="register-card__subtitle">
          Already have an account? <Link to="/login">Log in</Link>
        </p>

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <div className="register-form__field">
            <label className="register-form__label" htmlFor="email">
              Your email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`register-form__input ${errors.email ? 'register-form__input--invalid' : ''}`}
              placeholder=""
              autoComplete="email"
              value={email}
              onChange={(e) => {
                const v = e.target.value
                setEmail(v)
                setErrors((prev) =>
                  prev.email ? { ...prev, email: validateEmail(v) } : prev,
                )
              }}
              onBlur={(e) =>
                setErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }))
              }
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? 'register-email-error' : undefined}
            />
            {errors.email ? (
              <p id="register-email-error" className="register-form__error" role="alert">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className="register-form__field">
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
              name="password"
              type={showPassword ? 'text' : 'password'}
              className={`register-form__input ${errors.password ? 'register-form__input--invalid' : ''}`}
              placeholder=""
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                const v = e.target.value
                setPassword(v)
                setErrors((prev) => {
                  const next = { ...prev }
                  if (prev.password) next.password = validatePassword(v)
                  if (prev.repeatPassword)
                    next.repeatPassword = validatePasswordMatch(v, repeatPassword)
                  return next
                })
              }}
              onBlur={(e) =>
                setErrors((prev) => ({
                  ...prev,
                  password: validatePassword(e.target.value),
                }))
              }
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? 'register-password-error' : undefined}
            />
            {errors.password ? (
              <p id="register-password-error" className="register-form__error" role="alert">
                {errors.password}
              </p>
            ) : null}
          </div>

          <div className="register-form__field">
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
              name="repeat-password"
              type={showRepeatPassword ? 'text' : 'password'}
              className={`register-form__input ${errors.repeatPassword ? 'register-form__input--invalid' : ''}`}
              placeholder=""
              autoComplete="new-password"
              value={repeatPassword}
              onChange={(e) => {
                const v = e.target.value
                setRepeatPassword(v)
                setErrors((prev) =>
                  prev.repeatPassword
                    ? { ...prev, repeatPassword: validatePasswordMatch(password, v) }
                    : prev,
                )
              }}
              onBlur={(e) =>
                setErrors((prev) => ({
                  ...prev,
                  repeatPassword: validatePasswordMatch(password, e.target.value),
                }))
              }
              aria-invalid={errors.repeatPassword ? true : undefined}
              aria-describedby={
                errors.repeatPassword ? 'register-repeat-password-error' : undefined
              }
            />
            {errors.repeatPassword ? (
              <p
                id="register-repeat-password-error"
                className="register-form__error"
                role="alert"
              >
                {errors.repeatPassword}
              </p>
            ) : null}
          </div>

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
