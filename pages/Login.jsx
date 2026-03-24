import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { User, Eye, EyeOff } from 'lucide-react'
import Reveal from '../components/Reveal'
import { useLanguage } from '../context/LanguageContext'
import { auth } from '../firebase'
import { validateEmail, validatePassword } from '../utils/authValidation'
import { mapFirebaseAuthError } from '../utils/firebaseAuthErrors'
import { formatValidationError } from '../utils/validationMessage'
import '../styles/Login.css'

const AUTH_BG_URL = '../../auth-bg.jpg'

function Login() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ email: null, password: null })
  const [authErrorKey, setAuthErrorKey] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAuthErrorKey('')
    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)
    setErrors({ email: emailErr, password: passwordErr })
    if (emailErr || passwordErr) return

    setSubmitting(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
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
      className="login-page"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.35)), url(${AUTH_BG_URL})`,
      }}
    >
      <Link to="/" className="auth-back-home">
        {t('common.backHome')}
      </Link>
      <Reveal>
        <div className="login-card">
          <div className="login-card__icon">
            <User size={36} aria-hidden />
          </div>
          <h1 className="login-card__title">{t('auth.login.title')}</h1>
          <p className="login-card__subtitle">
            {t('auth.login.subtitleBefore')}{' '}
            <Link to="/signup">{t('nav.signup')}</Link>
          </p>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-form__field">
              <label className="login-form__label" htmlFor="email">
                {t('auth.login.emailLabel')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`login-form__input ${errors.email ? 'login-form__input--invalid' : ''}`}
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
                aria-describedby={errors.email ? 'login-email-error' : undefined}
              />
              {errors.email ? (
                <p id="login-email-error" className="login-form__error" role="alert">
                  {formatValidationError(errors.email, t)}
                </p>
              ) : null}
            </div>

            <div className="login-form__field">
              <div className="login-form__password-label-row">
                <label className="login-form__label" htmlFor="password">
                  {t('auth.login.passwordLabel')}
                </label>
                <button
                  type="button"
                  className="login-form__toggle-password"
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
                className={`login-form__input ${errors.password ? 'login-form__input--invalid' : ''}`}
                placeholder=""
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  const v = e.target.value
                  setPassword(v)
                  setAuthErrorKey('')
                  setErrors((prev) =>
                    prev.password != null ? { ...prev, password: validatePassword(v) } : prev,
                  )
                }}
                onBlur={(e) =>
                  setErrors((prev) => ({
                    ...prev,
                    password: validatePassword(e.target.value),
                  }))
                }
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={errors.password ? 'login-password-error' : undefined}
              />
              {errors.password ? (
                <p id="login-password-error" className="login-form__error" role="alert">
                  {formatValidationError(errors.password, t)}
                </p>
              ) : null}
            </div>
            <a href="/forgot-password" className="login-form__forgot">
              {t('auth.login.forgotPassword')}
            </a>

            {authErrorKey ? (
              <p className="login-form__error login-form__error--banner" role="alert">
                {t(authErrorKey)}
              </p>
            ) : null}

            <button
              type="submit"
              className="login-form__submit"
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? t('auth.login.submitting') : t('auth.login.submit')}
            </button>
          </form>
        </div>
      </Reveal>
    </div>
  )
}

export default Login
