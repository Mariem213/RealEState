import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Building2, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import '../styles/Navbar.css'

const allNavLinks = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/buy', labelKey: 'nav.buy' },
  { to: '/sell', labelKey: 'nav.sell' },
  { to: '/investment', labelKey: 'nav.investment' },
  { to: '/careers', labelKey: 'nav.careers' },
]

function displayNameFromUser(user, t) {
  if (!user) return ''
  if (user.displayName?.trim()) return user.displayName.trim()
  const email = user.email?.trim()
  if (email) return email.split('@')[0] || email
  return t('common.user')
}

function Navbar() {
  const { user, signOut } = useAuth()
  const { locale, setLocale, t } = useLanguage()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = user ? allNavLinks : allNavLinks.filter((l) => l.to === '/')

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="navbar__left">
          <Link to="/" className="navbar__brand" aria-label={t('common.homeAria')}>
            <span className="navbar__logo">
              <Building2 size={24} aria-hidden />
            </span>
            <span className="navbar__brand-text">{t('brand.name')}</span>
          </Link>
          <nav
            id="navbar-menu"
            className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`}
          >
            <ul className="navbar__links">
              {navLinks.map(({ to, labelKey }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className={`navbar__link ${isActive(to) ? 'navbar__link--active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {t(labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <button
          type="button"
          className="navbar__toggle"
          aria-expanded={menuOpen}
          aria-controls="navbar-menu"
          aria-label={t('common.toggleMenu')}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
        </button>

        <div className="navbar__actions">
          <div
            className="navbar__lang"
            role="group"
            aria-label={t('common.language')}
            dir="ltr"
            data-locale={locale}
          >
            <span className="navbar__lang-slider" aria-hidden />
            <button
              type="button"
              className={`navbar__lang-btn ${locale === 'en' ? 'navbar__lang-btn--on' : ''}`}
              aria-pressed={locale === 'en'}
              onClick={() => setLocale('en')}
            >
              EN
            </button>
            <button
              type="button"
              className={`navbar__lang-btn ${locale === 'ar' ? 'navbar__lang-btn--on' : ''}`}
              aria-pressed={locale === 'ar'}
              onClick={() => setLocale('ar')}
            >
              AR
            </button>
          </div>
          <div className="navbar__auth">
            {user ? (
              <div className="navbar__user">
                <span className="navbar__user-avatar" aria-hidden>
                  <UserRound size={20} strokeWidth={2} />
                </span>
                <span className="navbar__user-name" title={user.email ?? ''}>
                  {displayNameFromUser(user, t)}
                </span>
                <button
                  type="button"
                  className="navbar__logout"
                  onClick={() => {
                    setMenuOpen(false)
                    signOut()
                  }}
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <>
                <Link to="/signup" className="navbar__signup" onClick={() => setMenuOpen(false)}>
                  {t('nav.signup')}
                </Link>
                <Link to="/login" className="navbar__login" onClick={() => setMenuOpen(false)}>
                  {t('nav.login')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
