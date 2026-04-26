import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Building2, Home, UserRound, LayoutDashboard, TrendingUp, Tag, Briefcase, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

const SIDEBAR_LINKS = [
  { id: 'dashboard', labelKey: 'dashboard.sidebar.dashboard', icon: LayoutDashboard, to: '/admin', end: true },
  { id: 'sell', labelKey: 'dashboard.sidebar.sellRequests', icon: Tag, to: '/admin/sell-requests' },
  { id: 'investment', labelKey: 'dashboard.sidebar.investmentRequests', icon: TrendingUp, to: '/admin/investment-requests' },
  { id: 'jobs', labelKey: 'dashboard.sidebar.jobApplications', icon: Briefcase, to: '/admin/job-applications' },
  { id: 'home', labelKey: 'dashboard.sidebar.backToHome', icon: Home, to: '/', end: true },
  { id: 'logout', labelKey: 'dashboard.sidebar.logout', icon: LogOut, action: 'logout' },
]

function displayAdminName(user) {
  if (!user) return 'Admin'
  if (user.displayName?.trim()) return user.displayName.trim()
  const email = user.email?.trim()
  if (email) {
    const local = email.split('@')[0]
    return local ? `${local.charAt(0).toUpperCase()}${local.slice(1)} Admin` : 'Admin'
  }
  return 'Admin'
}

export default function AdminLayout({ title, subtitle, headerAction = null, children }) {
  const { user, signOut } = useAuth()
  const { locale, setLocale, t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()

  const isActivePath = (to, end) => {
    if (to === '/admin') return location.pathname === '/admin'
    if (end) return location.pathname === to
    return location.pathname === to || location.pathname.startsWith(`${to}/`)
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="dashboard">
      <aside className="dashboard__sidebar">
        <div className="dashboard__sidebar-brand">
          <span className="dashboard__sidebar-logo" aria-hidden>
            <Building2 size={22} strokeWidth={2} />
          </span>
          <span className="dashboard__sidebar-title">{t('brand.adminTitle')}</span>
        </div>
        <nav className="dashboard__sidebar-nav" aria-label={t('dashboard.adminSections')}>
          <ul className="dashboard__sidebar-list">
            {SIDEBAR_LINKS.map((item) => {
              const active = item.to ? isActivePath(item.to, item.end) : false
              const SidebarIcon = item.icon
              return (
                <li key={item.id} className={item.action === 'logout' ? 'dashboard__sidebar-item--logout' : ''}>
                  {item.action === 'logout' ? (
                    <button
                      type="button"
                      className="dashboard__sidebar-link dashboard__sidebar-link--danger"
                      onClick={handleLogout}
                    >
                      <SidebarIcon size={18} strokeWidth={2} aria-hidden />
                      <span>{t(item.labelKey)}</span>
                    </button>
                  ) : (
                    <Link
                      to={item.to}
                      className={`dashboard__sidebar-link ${active ? 'dashboard__sidebar-link--active' : ''}`}
                    >
                      <SidebarIcon size={18} strokeWidth={2} aria-hidden />
                      <span>{t(item.labelKey)}</span>
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      <div className="dashboard__column">
        <header className="dashboard__topbar">
          <p className="dashboard__subtitle" style={{ margin: 0 }}>
            {t('admin.common.panelTitle')}
          </p>
          <div className="dashboard__topbar-right">
            <div
              className="dashboard__pill-lang"
              role="group"
              aria-label={t('common.language')}
              dir="ltr"
              data-locale={locale}
            >
              <span className="dashboard__pill-lang-slider" aria-hidden />
              <button
                type="button"
                className={locale === 'en' ? 'is-on' : ''}
                aria-pressed={locale === 'en'}
                onClick={() => setLocale('en')}
              >
                EN
              </button>
              <button
                type="button"
                className={locale === 'ar' ? 'is-on' : ''}
                aria-pressed={locale === 'ar'}
                onClick={() => setLocale('ar')}
              >
                AR
              </button>
            </div>
            <div className="dashboard__profile">
              <span className="dashboard__profile-avatar" aria-hidden>
                <UserRound size={20} />
              </span>
              <span className="dashboard__profile-name">{displayAdminName(user)}</span>
            </div>
          </div>
        </header>

        <div className="dashboard__content">
          <header className="dashboard__heading">
            <div className="dashboard__heading-main">
              <h1 className="dashboard__title">{title}</h1>
              <p className="dashboard__subtitle">{subtitle}</p>
            </div>
            {headerAction ? <div className="dashboard__heading-action">{headerAction}</div> : null}
          </header>
          {children}
        </div>
      </div>
    </div>
  )
}
