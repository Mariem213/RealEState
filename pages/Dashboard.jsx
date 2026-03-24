import { useState } from 'react'
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
import '../styles/Dashboard.css'

const SIDEBAR_LINKS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/admin', end: true },
  { id: 'home', label: 'Home', icon: Home, to: '/', end: true },
  { id: 'buy', label: 'Buy Requests', icon: ShoppingCart, to: '/buy' },
  { id: 'sell', label: 'Sell Requests', icon: Tag, to: '/sell' },
  { id: 'investment', label: 'Investment Requests', icon: TrendingUp, to: '/investment' },
  { id: 'careers', label: 'Job Applications', icon: Briefcase, to: '/careers' },
]

const METRICS = [
  { label: 'Total Properties', value: '1,247', delta: '+12%', up: true, icon: Building2, iconBg: 'var(--dash-icon-blue)' },
  { label: 'For Sale', value: '856', delta: '+5%', up: true, icon: Tag, iconBg: 'var(--dash-icon-green)' },
  { label: 'Buy Requests', value: '324', delta: '+8%', up: true, icon: ShoppingCart, iconBg: 'var(--dash-icon-purple)' },
  { label: 'Sell Requests', value: '189', delta: '-2%', up: false, icon: Tag, iconBg: 'var(--dash-icon-orange)' },
  { label: 'Investment Requests', value: '97', delta: '+18%', up: true, icon: TrendingUp, iconBg: 'var(--dash-icon-blue)' },
  { label: 'Job Applications', value: '156', delta: '+4%', up: true, icon: Briefcase, iconBg: 'var(--dash-icon-green)' },
  { label: 'Registered Users', value: '2,847', delta: '+21%', up: true, icon: Users, iconBg: 'var(--dash-icon-purple)' },
  { label: 'Avg Property Price', value: '$485K', delta: '+3%', up: true, icon: DollarSign, iconBg: 'var(--dash-icon-orange)' },
  { label: 'Avg Investment', value: '$125K', delta: '+7%', up: true, icon: DollarSign, iconBg: 'var(--dash-icon-blue)' },
  { label: 'Conversion Rate', value: '68%', delta: '-1%', up: false, icon: PieChart, iconBg: 'var(--dash-icon-green)' },
]

const PIE_SEGMENTS = [
  { label: 'Apartments', pct: 38, color: '#1a365d' },
  { label: 'Houses', pct: 26, color: '#c4a574' },
  { label: 'Commercial', pct: 18, color: '#4a7abc' },
  { label: 'Land', pct: 10, color: '#5b9a6e' },
  { label: 'Villas', pct: 8, color: '#7c6fd6' },
]

const LINE_POINTS = [12, 18, 22, 28, 38, 52, 68]
const BAR_TOP = [
  { label: 'Marina District', pct: 100 },
  { label: 'Downtown', pct: 86 },
  { label: 'Bay View', pct: 72 },
  { label: 'Hillside', pct: 58 },
  { label: 'Old Town', pct: 44 },
]
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
    const slice = { d, color: s.color, label: s.label, key: i, delay: i * 0.06 }
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
  const location = useLocation()
  const [lang, setLang] = useState('EN')
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
          <span className="dashboard__sidebar-title">RealEstate Admin</span>
        </div>
        <nav className="dashboard__sidebar-nav" aria-label="Admin sections">
          <ul className="dashboard__sidebar-list">
            {SIDEBAR_LINKS.map(({ id, label, icon: Icon, to, end }) => {
              const active = isActivePath(to, end)
              return (
                <li key={id}>
                  <Link
                    to={to}
                    className={`dashboard__sidebar-link ${active ? 'dashboard__sidebar-link--active' : ''}`}
                  >
                    <Icon size={18} strokeWidth={2} aria-hidden />
                    <span>{label}</span>
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
            <span>Last 7 Days</span>
          </button>
          <div className="dashboard__topbar-right">
            <div className="dashboard__pill-lang" role="group" aria-label="Language">
              <button
                type="button"
                className={lang === 'EN' ? 'is-active' : ''}
                onClick={() => setLang('EN')}
              >
                EN
              </button>
              <button
                type="button"
                className={lang === 'AR' ? 'is-active' : ''}
                onClick={() => setLang('AR')}
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
            <h1 className="dashboard__title">Admin Dashboard</h1>
            <p className="dashboard__subtitle">
              Monitor your real estate platform performance and user activity.
            </p>
          </header>

          <div className="dashboard__metrics">
            {METRICS.map((m, i) => {
              const Icon = m.icon
              return (
                <article
                  key={m.label}
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
                  <p className="dashboard__metric-label">{m.label}</p>
                </article>
              )
            })}
          </div>

          <div className="dashboard__charts">
            <section className="dashboard__card dashboard__card-chart dashboard__anim" style={{ '--d': '200ms' }}>
              <h2 className="dashboard__card-title">Property Type Distribution</h2>
              <div className="dashboard__pie-wrap">
                <svg className="dashboard__pie-svg" viewBox="0 0 200 200" role="img" aria-label="Property types pie chart">
                  <title>Property type distribution</title>
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
                    <li key={s.label}>
                      <span className="dashboard__dot" style={{ background: s.color }} />
                      {s.label}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="dashboard__card dashboard__card-chart dashboard__anim" style={{ '--d': '260ms' }}>
              <h2 className="dashboard__card-title">User Registrations Over Time</h2>
              <div className="dashboard__line-chart">
                <svg
                  viewBox={`0 0 ${lineW} ${lineH}`}
                  className="dashboard__line-svg"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label="User registrations trend"
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
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              </div>
            </section>

            <section className="dashboard__card dashboard__card-chart dashboard__anim" style={{ '--d': '320ms' }}>
              <h2 className="dashboard__card-title">Most Popular Locations</h2>
              <ul className="dashboard__h-bars">
                {BAR_TOP.map((row, idx) => (
                  <li key={row.label}>
                    <span className="dashboard__h-label">{row.label}</span>
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
              <h2 className="dashboard__card-title">Investment Requests Trend</h2>
              <div className="dashboard__v-chart">
                {INVEST_MONTHS.map((h, i) => (
                  <div key={i} className="dashboard__v-col">
                    <div
                      className="dashboard__v-bar"
                      style={{
                        height: `${Math.max(24, (h / INVEST_MAX) * V_BAR_MAX_PX)}px`,
                        '--v-delay': `${i * 0.07}s`,
                      }}
                    />
                    <span className="dashboard__v-month">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}
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
                <p className="dashboard__insight-label">Top Property</p>
                <p className="dashboard__insight-title">Luxury Villa in Downtown</p>
                <p className="dashboard__insight-meta">$2.4M</p>
              </div>
            </article>
            <article className="dashboard__insight dashboard__anim" style={{ '--d': '500ms' }}>
              <span className="dashboard__insight-icon is-blue">
                <MapPin size={22} />
              </span>
              <div>
                <p className="dashboard__insight-label">Hot Location</p>
                <p className="dashboard__insight-title">Marina District</p>
                <p className="dashboard__insight-meta is-positive">+45% demand</p>
              </div>
            </article>
            <article className="dashboard__insight dashboard__anim" style={{ '--d': '560ms' }}>
              <span className="dashboard__insight-icon is-purple">
                <Gem size={22} />
              </span>
              <div>
                <p className="dashboard__insight-label">Growth Segment</p>
                <p className="dashboard__insight-title">Residential Apartments</p>
                <p className="dashboard__insight-meta is-positive">+28% growth</p>
              </div>
            </article>
          </div>

          <div className="dashboard__lists">
            <section className="dashboard__card dashboard__anim" style={{ '--d': '600ms' }}>
              <h2 className="dashboard__card-title">Recent Properties</h2>
              <ul className="dashboard__list">
                <li>
                  <div>
                    <p className="dashboard__list-title">Modern Apartment</p>
                    <p className="dashboard__list-sub">Downtown · $420K</p>
                  </div>
                  <span className="dashboard__badge is-green">Active</span>
                </li>
                <li>
                  <div>
                    <p className="dashboard__list-title">Family House</p>
                    <p className="dashboard__list-sub">Marina · $890K</p>
                  </div>
                  <span className="dashboard__badge is-amber">Pending</span>
                </li>
                <li>
                  <div>
                    <p className="dashboard__list-title">Office Space</p>
                    <p className="dashboard__list-sub">Business Bay · $1.1M</p>
                  </div>
                  <span className="dashboard__badge is-blue">Sold</span>
                </li>
              </ul>
            </section>
            <section className="dashboard__card dashboard__anim" style={{ '--d': '660ms' }}>
              <h2 className="dashboard__card-title">Recent Applications</h2>
              <ul className="dashboard__list dashboard__list--people">
                <li>
                  <span className="dashboard__avatar">SJ</span>
                  <div>
                    <p className="dashboard__list-title">Sarah Johnson</p>
                    <p className="dashboard__list-sub">Sales Associate</p>
                  </div>
                  <span className="dashboard__badge is-green">Approved</span>
                </li>
                <li>
                  <span className="dashboard__avatar">MC</span>
                  <div>
                    <p className="dashboard__list-title">Mike Chen</p>
                    <p className="dashboard__list-sub">Investment Analyst</p>
                  </div>
                  <span className="dashboard__badge is-amber">Review</span>
                </li>
                <li>
                  <span className="dashboard__avatar">LR</span>
                  <div>
                    <p className="dashboard__list-title">Lisa Rodriguez</p>
                    <p className="dashboard__list-sub">Property Manager</p>
                  </div>
                  <span className="dashboard__badge is-red">Rejected</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
