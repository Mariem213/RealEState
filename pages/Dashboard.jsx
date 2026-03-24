import { Link, useLocation } from 'react-router-dom'
import {
  Building2,
  LayoutDashboard,
  Home,
  ShoppingCart,
  Tag,
  TrendingUp,
  Briefcase,
  Users,
  DollarSign,
  PieChart,
  CalendarDays,
  UserRound,
  Trophy,
  MapPin,
  Gem,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import '../styles/Dashboard.css'

const SIDEBAR_LINKS = [
  { id: 'dashboard', labelKey: 'dashboard.sidebar.dashboard', icon: LayoutDashboard, to: '/admin', end: true },
  { id: 'home', labelKey: 'dashboard.sidebar.home', icon: Home, to: '/', end: true },
  { id: 'buy', labelKey: 'dashboard.sidebar.buyRequests', icon: ShoppingCart, to: '/buy' },
  { id: 'sell', labelKey: 'dashboard.sidebar.sellRequests', icon: Tag, to: '/sell' },
  { id: 'investment', labelKey: 'dashboard.sidebar.investmentRequests', icon: TrendingUp, to: '/investment' },
  { id: 'careers', labelKey: 'dashboard.sidebar.jobApplications', icon: Briefcase, to: '/careers' },
]

const METRICS = [
  { labelKey: 'dashboard.metrics.totalProperties', value: '1,247', delta: '+12%', up: true, icon: Building2, iconBg: 'var(--dash-icon-blue)' },
  { labelKey: 'dashboard.metrics.forSale', value: '856', delta: '+5%', up: true, icon: Tag, iconBg: 'var(--dash-icon-green)' },
  { labelKey: 'dashboard.metrics.buyRequests', value: '324', delta: '+8%', up: true, icon: ShoppingCart, iconBg: 'var(--dash-icon-purple)' },
  { labelKey: 'dashboard.metrics.sellRequests', value: '189', delta: '-2%', up: false, icon: Tag, iconBg: 'var(--dash-icon-orange)' },
  { labelKey: 'dashboard.metrics.investmentRequests', value: '97', delta: '+18%', up: true, icon: TrendingUp, iconBg: 'var(--dash-icon-blue)' },
  { labelKey: 'dashboard.metrics.jobApplications', value: '156', delta: '+4%', up: true, icon: Briefcase, iconBg: 'var(--dash-icon-green)' },
  { labelKey: 'dashboard.metrics.registeredUsers', value: '2,847', delta: '+21%', up: true, icon: Users, iconBg: 'var(--dash-icon-purple)' },
  { labelKey: 'dashboard.metrics.avgPropertyPrice', value: '$485K', delta: '+3%', up: true, icon: DollarSign, iconBg: 'var(--dash-icon-orange)' },
  { labelKey: 'dashboard.metrics.avgInvestment', value: '$125K', delta: '+7%', up: true, icon: DollarSign, iconBg: 'var(--dash-icon-blue)' },
  { labelKey: 'dashboard.metrics.conversionRate', value: '68%', delta: '-1%', up: false, icon: PieChart, iconBg: 'var(--dash-icon-green)' },
]

const PIE_SEGMENTS = [
  { id: 'apartments', pct: 38, color: '#1a365d' },
  { id: 'houses', pct: 26, color: '#c4a574' },
  { id: 'commercial', pct: 18, color: '#4a7abc' },
  { id: 'land', pct: 10, color: '#5b9a6e' },
  { id: 'villas', pct: 8, color: '#7c6fd6' },
]

const LINE_POINTS = [12, 18, 22, 28, 38, 52, 68]
const BAR_TOP = [
  { locationKey: 'marina', pct: 100 },
  { locationKey: 'downtown', pct: 86 },
  { locationKey: 'bayView', pct: 72 },
  { locationKey: 'hillside', pct: 58 },
  { locationKey: 'oldTown', pct: 44 },
]

const MONTH_KEYS_LINE = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul']
const MONTH_KEYS_INVEST = ['jan', 'feb', 'mar', 'apr', 'may', 'jun']
const INVEST_MONTHS = [42, 55, 48, 72, 68, 88]
const INVEST_MAX = Math.max(...INVEST_MONTHS)
const V_BAR_MAX_PX = 140

function polarToCartesian(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const large = endAngle - startAngle <= 180 ? 0 : 1
  return `M ${cx} ${cy} L ${end.x} ${end.y} A ${r} ${r} 0 ${large} 1 ${start.x} ${start.y} Z`
}

function buildPieSlices(segments, cx, cy, r) {
  let angle = 0
  return segments.map((s, i) => {
    const sweep = (s.pct / 100) * 360
    const d = describeArc(cx, cy, r, angle, angle + sweep)
    const slice = { d, color: s.color, id: s.id, key: i, delay: i * 0.06 }
    angle += sweep
    return slice
  })
}

function displayAdminName(user) {
  if (!user) return 'John Admin'
  if (user.displayName?.trim()) return user.displayName.trim()
  const email = user.email?.trim()
  if (email) {
    const local = email.split('@')[0]
    return local ? `${local.charAt(0).toUpperCase()}${local.slice(1)} Admin` : 'Admin'
  }
  return 'Admin'
}

export default function Dashboard() {
  const { user } = useAuth()
  const { locale, setLocale, t } = useLanguage()
  const location = useLocation()
  const pieSlices = buildPieSlices(PIE_SEGMENTS, 100, 100, 78)
  const lineW = 320
  const lineH = 140
  const linePadding = 8
  const maxY = Math.max(...LINE_POINTS)
  const minY = Math.min(...LINE_POINTS)
  const norm = (v) => linePadding + (lineH - 2 * linePadding) * (1 - (v - minY) / (maxY - minY || 1))
  const linePath =
    LINE_POINTS.map((p, i) => {
      const x = linePadding + (i / (LINE_POINTS.length - 1)) * (lineW - 2 * linePadding)
      const y = norm(p)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ') +
    ` L ${lineW - linePadding} ${lineH} L ${linePadding} ${lineH} Z`

  const lineStroke = LINE_POINTS.map((p, i) => {
    const x = linePadding + (i / (LINE_POINTS.length - 1)) * (lineW - 2 * linePadding)
    const y = norm(p)
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')

  const isActivePath = (to, end) => {
    if (to === '/admin') return location.pathname === '/admin'
    if (end) return location.pathname === to
    return location.pathname === to || location.pathname.startsWith(`${to}/`)
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
            {SIDEBAR_LINKS.map(({ id, labelKey, icon: Icon, to, end }) => {
              const active = isActivePath(to, end)
              return (
                <li key={id}>
                  <Link
                    to={to}
                    className={`dashboard__sidebar-link ${active ? 'dashboard__sidebar-link--active' : ''}`}
                  >
                    <Icon size={18} strokeWidth={2} aria-hidden />
                    <span>{t(labelKey)}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      <div className="dashboard__column">
        <header className="dashboard__topbar">
          <button type="button" className="dashboard__date-range">
            <CalendarDays size={18} aria-hidden />
            <span>{t('dashboard.last7Days')}</span>
          </button>
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
          <header className="dashboard__heading dashboard__anim" style={{ '--d': '0ms' }}>
            <h1 className="dashboard__title">{t('dashboard.title')}</h1>
            <p className="dashboard__subtitle">{t('dashboard.subtitle')}</p>
          </header>

          <div className="dashboard__metrics">
            {METRICS.map((m, i) => {
              const Icon = m.icon
              return (
                <article
                  key={m.labelKey}
                  className="dashboard__metric dashboard__anim dashboard__metric-interactive"
                  style={{ '--d': `${40 + i * 45}ms` }}
                >
                  <div className="dashboard__metric-top">
                    <span className="dashboard__metric-icon" style={{ background: m.iconBg }}>
                      <Icon size={18} strokeWidth={2} />
                    </span>
                    <span className={`dashboard__metric-delta ${m.up ? 'is-up' : 'is-down'}`}>
                      {m.delta}
                    </span>
                  </div>
                  <p className="dashboard__metric-value">{m.value}</p>
                  <p className="dashboard__metric-label">{t(m.labelKey)}</p>
                </article>
              )
            })}
          </div>

          <div className="dashboard__charts">
            <section className="dashboard__card dashboard__card-chart dashboard__anim" style={{ '--d': '200ms' }}>
              <h2 className="dashboard__card-title">{t('dashboard.charts.propertyTypeDistribution')}</h2>
              <div className="dashboard__pie-wrap">
                <svg
                  className="dashboard__pie-svg"
                  viewBox="0 0 200 200"
                  role="img"
                  aria-label={t('dashboard.charts.pieAria')}
                >
                  <title>{t('dashboard.charts.pieTitle')}</title>
                  {pieSlices.map((slice) => (
                    <path
                      key={slice.key}
                      d={slice.d}
                      fill={slice.color}
                      className="dashboard__pie-slice"
                      style={{ '--slice-delay': `${slice.delay}s` }}
                    />
                  ))}
                </svg>
                <ul className="dashboard__pie-legend">
                  {PIE_SEGMENTS.map((s) => (
                    <li key={s.id}>
                      <span className="dashboard__dot" style={{ background: s.color }} />
                      {t(`dashboard.pie.${s.id}`)}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="dashboard__card dashboard__card-chart dashboard__anim" style={{ '--d': '260ms' }}>
              <h2 className="dashboard__card-title">{t('dashboard.charts.userRegistrations')}</h2>
              <div className="dashboard__line-chart">
                <svg
                  viewBox={`0 0 ${lineW} ${lineH}`}
                  className="dashboard__line-svg"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label={t('dashboard.charts.lineAria')}
                >
                  <defs>
                    <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1a365d" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#1a365d" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={linePath} fill="url(#lineFill)" className="dashboard__line-fill" />
                  <path d={lineStroke} fill="none" stroke="#1a365d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="dashboard__line-stroke" />
                </svg>
                <div className="dashboard__line-labels">
                  {MONTH_KEYS_LINE.map((mk) => (
                    <span key={mk}>{t(`dashboard.monthsShort.${mk}`)}</span>
                  ))}
                </div>
              </div>
            </section>

            <section className="dashboard__card dashboard__card-chart dashboard__anim" style={{ '--d': '320ms' }}>
              <h2 className="dashboard__card-title">{t('dashboard.charts.popularLocations')}</h2>
              <ul className="dashboard__h-bars">
                {BAR_TOP.map((row, idx) => (
                  <li key={row.locationKey}>
                    <span className="dashboard__h-label">{t(`dashboard.locations.${row.locationKey}`)}</span>
                    <div className="dashboard__h-track">
                      <div
                        className="dashboard__h-fill"
                        style={{ '--w': `${row.pct}%`, '--bar-delay': `${idx * 0.08}s` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="dashboard__card dashboard__card-chart dashboard__anim" style={{ '--d': '380ms' }}>
              <h2 className="dashboard__card-title">{t('dashboard.charts.investmentTrend')}</h2>
              <div className="dashboard__v-chart">
                {INVEST_MONTHS.map((h, i) => (
                  <div key={MONTH_KEYS_INVEST[i]} className="dashboard__v-col">
                    <div
                      className="dashboard__v-bar"
                      style={{
                        height: `${Math.max(24, (h / INVEST_MAX) * V_BAR_MAX_PX)}px`,
                        '--v-delay': `${i * 0.07}s`,
                      }}
                    />
                    <span className="dashboard__v-month">
                      {t(`dashboard.monthsShort.${MONTH_KEYS_INVEST[i]}`)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="dashboard__insights">
            <article className="dashboard__insight dashboard__anim" style={{ '--d': '440ms' }}>
              <span className="dashboard__insight-icon is-green">
                <Trophy size={22} />
              </span>
              <div>
                <p className="dashboard__insight-label">{t('dashboard.insights.topProperty')}</p>
                <p className="dashboard__insight-title">{t('dashboard.insights.topPropertyTitle')}</p>
                <p className="dashboard__insight-meta">$2.4M</p>
              </div>
            </article>
            <article className="dashboard__insight dashboard__anim" style={{ '--d': '500ms' }}>
              <span className="dashboard__insight-icon is-blue">
                <MapPin size={22} />
              </span>
              <div>
                <p className="dashboard__insight-label">{t('dashboard.insights.hotLocation')}</p>
                <p className="dashboard__insight-title">{t('dashboard.insights.hotLocationTitle')}</p>
                <p className="dashboard__insight-meta is-positive">{t('dashboard.insights.hotLocationMeta')}</p>
              </div>
            </article>
            <article className="dashboard__insight dashboard__anim" style={{ '--d': '560ms' }}>
              <span className="dashboard__insight-icon is-purple">
                <Gem size={22} />
              </span>
              <div>
                <p className="dashboard__insight-label">{t('dashboard.insights.growthSegment')}</p>
                <p className="dashboard__insight-title">{t('dashboard.insights.growthTitle')}</p>
                <p className="dashboard__insight-meta is-positive">{t('dashboard.insights.growthMeta')}</p>
              </div>
            </article>
          </div>

          <div className="dashboard__lists">
            <section className="dashboard__card dashboard__anim" style={{ '--d': '600ms' }}>
              <h2 className="dashboard__card-title">{t('dashboard.lists.recentProperties')}</h2>
              <ul className="dashboard__list">
                <li>
                  <div>
                    <p className="dashboard__list-title">{t('dashboard.lists.prop1Title')}</p>
                    <p className="dashboard__list-sub">{t('dashboard.lists.prop1Sub')}</p>
                  </div>
                  <span className="dashboard__badge is-green">{t('dashboard.lists.badgeActive')}</span>
                </li>
                <li>
                  <div>
                    <p className="dashboard__list-title">{t('dashboard.lists.prop2Title')}</p>
                    <p className="dashboard__list-sub">{t('dashboard.lists.prop2Sub')}</p>
                  </div>
                  <span className="dashboard__badge is-amber">{t('dashboard.lists.badgePending')}</span>
                </li>
                <li>
                  <div>
                    <p className="dashboard__list-title">{t('dashboard.lists.prop3Title')}</p>
                    <p className="dashboard__list-sub">{t('dashboard.lists.prop3Sub')}</p>
                  </div>
                  <span className="dashboard__badge is-blue">{t('dashboard.lists.badgeSold')}</span>
                </li>
              </ul>
            </section>
            <section className="dashboard__card dashboard__anim" style={{ '--d': '660ms' }}>
              <h2 className="dashboard__card-title">{t('dashboard.lists.recentApplications')}</h2>
              <ul className="dashboard__list dashboard__list--people">
                <li>
                  <span className="dashboard__avatar">SJ</span>
                  <div>
                    <p className="dashboard__list-title">{t('dashboard.lists.app1Name')}</p>
                    <p className="dashboard__list-sub">{t('dashboard.lists.app1Role')}</p>
                  </div>
                  <span className="dashboard__badge is-green">{t('dashboard.lists.badgeApproved')}</span>
                </li>
                <li>
                  <span className="dashboard__avatar">MC</span>
                  <div>
                    <p className="dashboard__list-title">{t('dashboard.lists.app2Name')}</p>
                    <p className="dashboard__list-sub">{t('dashboard.lists.app2Role')}</p>
                  </div>
                  <span className="dashboard__badge is-amber">{t('dashboard.lists.badgeReview')}</span>
                </li>
                <li>
                  <span className="dashboard__avatar">LR</span>
                  <div>
                    <p className="dashboard__list-title">{t('dashboard.lists.app3Name')}</p>
                    <p className="dashboard__list-sub">{t('dashboard.lists.app3Role')}</p>
                  </div>
                  <span className="dashboard__badge is-red">{t('dashboard.lists.badgeRejected')}</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
