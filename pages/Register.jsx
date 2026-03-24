import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { User, Eye, EyeOff } from 'lucide-react'
import Reveal from '../components/Reveal'
import { useLanguage } from '../context/LanguageContext'
import { auth } from '../firebase'
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateUsername,
} from '../utils/authValidation'
import { mapFirebaseAuthError } from '../utils/firebaseAuthErrors'
import { formatValidationError } from '../utils/validationMessage'
import '../styles/Register.css'

const AUTH_BG_URL = '../../auth-bg.jpg'

function Register() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [errors, setErrors] = useState({
    username: null,
    email: null,
    password: null,
    repeatPassword: null,
  })
  const [authErrorKey, setAuthErrorKey] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAuthErrorKey('')
    const usernameErr = validateUsername(username)
    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)
    const matchErr = validatePasswordMatch(password, repeatPassword)
    setErrors({
      username: usernameErr,
      email: emailErr,
      password: passwordErr,
      repeatPassword: matchErr,
    })
    if (usernameErr || emailErr || passwordErr || matchErr) return

    setSubmitting(true)
    try {
      const trimmedName = username.trim()
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
      await updateProfile(cred.user, { displayName: trimmedName })
      navigate('/', { replace: true })
    } catch (err) {
      const code = err?.code ?? ''
      setAuthErrorKey(mapFirebaseAuthError(code))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="register-page"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.35)), url(${AUTH_BG_URL})`,
      }}
    >
      <Link to="/" className="auth-back-home">
        {t('common.backHome')}
      </Link>
      <Reveal delay={40}>
        <div className="register-card">
          <div className="register-card__icon">
            <User size={36} aria-hidden />
          </div>
          <h1 className="register-card__title">{t('auth.register.title')}</h1>
          <p className="register-card__subtitle">
            {t('auth.register.subtitleBefore')} <Link to="/login">{t('nav.login')}</Link>
          </p>

          <form className="register-form" onSubmit={handleSubmit} noValidate>
            <div className="register-form__field">
              <label className="register-form__label" htmlFor="username">
                {t('auth.register.username')}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className={`register-form__input ${errors.username ? 'register-form__input--invalid' : ''}`}
                placeholder=""
                autoComplete="username"
                value={username}
                onChange={(e) => {
                  const v = e.target.value
                  setUsername(v)
                  setAuthErrorKey('')
                  setErrors((prev) =>
                    prev.username != null ? { ...prev, username: validateUsername(v) } : prev,
                  )
                }}
                onBlur={(e) =>
                  setErrors((prev) => ({
                    ...prev,
                    username: validateUsername(e.target.value),
                  }))
                }
                aria-invalid={errors.username ? true : undefined}
                aria-describedby={errors.username ? 'register-username-error' : undefined}
              />
              {errors.username ? (
                <p id="register-username-error" className="register-form__error" role="alert">
                  {formatValidationError(errors.username, t)}
                </p>
              ) : null}
            </div>

            <div className="register-form__field">
              <label className="register-form__label" htmlFor="email">
                {t('auth.register.emailLabel')}
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
                  setAuthErrorKey('')
                  setErrors((prev) =>
                    prev.email != null ? { ...prev, email: validateEmail(v) } : prev,
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
                  {formatValidationError(errors.email, t)}
                </p>
              ) : null}
            </div>

            <div className="register-form__field">
              <div className="register-form__password-label-row">
                <label className="register-form__label" htmlFor="password">
                  {t('auth.register.passwordLabel')}
                </label>
                <button
                  type="button"
                  className="register-form__toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}
                >
                  {showPassword ? <Eye size={20} aria-hidden /> : <EyeOff size={20} aria-hidden />}
                  <span>{showPassword ? t('common.hide') : t('common.show')}</span>
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
                  setAuthErrorKey('')
                  setErrors((prev) => {
                    const next = { ...prev }
                    if (prev.password != null) next.password = validatePassword(v)
                    if (prev.repeatPassword != null)
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
                  {formatValidationError(errors.password, t)}
                </p>
              ) : null}
            </div>

            <div className="register-form__field">
              <div className="register-form__password-label-row">
                <label className="register-form__label" htmlFor="repeat-password">
                  {t('auth.register.repeatPassword')}
                </label>
                <button
                  type="button"
                  className="register-form__toggle-password"
                  onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                  aria-label={
                    showRepeatPassword ? t('common.hidePassword') : t('common.showPassword')
                  }
                >
                  {showRepeatPassword ? (
                    <Eye size={20} aria-hidden />
                  ) : (
                    <EyeOff size={20} aria-hidden />
                  )}
                  <span>{showRepeatPassword ? t('common.hide') : t('common.show')}</span>
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
                  setAuthErrorKey('')
                  setErrors((prev) =>
                    prev.repeatPassword != null
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
                  {formatValidationError(errors.repeatPassword, t)}
                </p>
              ) : null}
            </div>

            {authErrorKey ? (
              <p className="register-form__error register-form__error--banner" role="alert">
                {t(authErrorKey)}
              </p>
            ) : null}

            <button
              type="submit"
              className="register-form__submit"
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? t('auth.register.submitting') : t('auth.register.submit')}
            </button>
          </form>
        </div>
      </Reveal>
    </div>
  )
}

export default Register
