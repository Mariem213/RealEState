import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Building2, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import '../styles/Navbar.css'

const allNavLinks = [
  { to: '/', label: 'Home' },
  { to: '/buy', label: 'Buy' },
  { to: '/sell', label: 'Sell' },
  { to: '/investment', label: 'Investment' },
  { to: '/careers', label: 'Careers' },
]

function displayNameFromUser(user) {
  if (!user) return ''
  if (user.displayName?.trim()) return user.displayName.trim()
  const email = user.email?.trim()
  if (email) return email.split('@')[0] || email
  return 'User'
}

function Navbar() {
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [lang, setLang] = useState('EN')
  const location = useLocation()

  const navLinks = user ? allNavLinks : allNavLinks.filter((l) => l.to === '/')

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="navbar__left">
          <Link to="/" className="navbar__brand" aria-label="RealEstate home">
            <span className="navbar__logo">
              <Building2 size={24} aria-hidden />
            </span>
            <span className="navbar__brand-text">RealEstate</span>
          </Link>
          <nav
            id="navbar-menu"
            className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`}
          >
            <ul className="navbar__links">
              {navLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className={`navbar__link ${isActive(to) ? 'navbar__link--active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
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
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
        </button>

        <div className="navbar__actions">
          <div className="navbar__lang" role="group" aria-label="Language">
            <button
              type="button"
              className={`navbar__lang-btn ${lang === 'EN' ? 'navbar__lang-btn--active' : ''}`}
              onClick={() => setLang('EN')}
            >
              EN
            </button>
            <button
              type="button"
              className={`navbar__lang-btn ${lang === 'AR' ? 'navbar__lang-btn--active' : ''}`}
              onClick={() => setLang('AR')}
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
                  {displayNameFromUser(user)}
                </span>
                <button
                  type="button"
                  className="navbar__logout"
                  onClick={() => {
                    setMenuOpen(false)
                    signOut()
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/signup" className="navbar__signup" onClick={() => setMenuOpen(false)}>
                  Sign up
                </Link>
                <Link to="/login" className="navbar__login" onClick={() => setMenuOpen(false)}>
                  Login
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
