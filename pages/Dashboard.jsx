import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  ShoppingCart,
  Tag,
  TrendingUp,
  Briefcase,
  Users,
  DollarSign,
  PieChart,
  Trophy,
  MapPin,
  Gem,
} from 'lucide-react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import { useLanguage } from '../context/LanguageContext'
import AdminLayout from '../components/AdminLayout'
import '../styles/Dashboard.css'

const PIE_SEGMENTS = [
  { id: 'apartments', pct: 41, color: '#1a365d' },
  { id: 'houses', pct: 25, color: '#c4a574' },
  { id: 'commercial', pct: 15, color: '#4a7abc' },
  { id: 'land', pct: 10, color: '#21b87d' },
  { id: 'villas', pct: 9, color: '#7c6fd6' },
]

const LINE_POINTS = [140, 190, 175, 250, 305, 285, 350]
const BAR_TOP = [
  { locationKey: 'waterfront', pct: 52 },
  { locationKey: 'businessDistrict', pct: 64 },
  { locationKey: 'suburbs', pct: 72 },
  { locationKey: 'downtown', pct: 86 },
  { locationKey: 'marina', pct: 100 },
]

const INVEST_MONTHS = [12, 15, 18, 22, 19, 25]
const INVEST_MONTH_LABELS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun']
const LINE_MONTH_LABELS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul']
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
    angle += sweep
    return { ...s, d, key: i, delay: i * 0.06 }
  })
}

export default function Dashboard() {
  const { t } = useLanguage()
  const [counts, setCounts] = useState({
    investment: 0,
    sell: 0,
    jobs: 0,
  })
  const [sellCollectionCounts, setSellCollectionCounts] = useState({
    sell: 0,
    sellRequests: 0,
  })
  const [jobCollectionCounts, setJobCollectionCounts] = useState({
    jobs: 0,
    jobApplications: 0,
  })
  const pieSlices = buildPieSlices(PIE_SEGMENTS, 100, 100, 78)

  useEffect(() => {
    const unsubs = [
      onSnapshot(collection(db, 'investments'), (s) =>
        setCounts((p) => ({ ...p, investment: s.size })),
      ),
      onSnapshot(
        collection(db, 'sell'),
        (s) => setSellCollectionCounts((prev) => ({ ...prev, sell: s.size })),
        () => setSellCollectionCounts((prev) => ({ ...prev, sell: 0 })),
      ),
      onSnapshot(
        collection(db, 'sellRequests'),
        (s) => setSellCollectionCounts((prev) => ({ ...prev, sellRequests: s.size })),
        () => setSellCollectionCounts((prev) => ({ ...prev, sellRequests: 0 })),
      ),
      onSnapshot(
        collection(db, 'jobs'),
        (s) => setJobCollectionCounts((prev) => ({ ...prev, jobs: s.size })),
        () => setJobCollectionCounts((prev) => ({ ...prev, jobs: 0 })),
      ),
      onSnapshot(
        collection(db, 'jobApplications'),
        (s) => setJobCollectionCounts((prev) => ({ ...prev, jobApplications: s.size })),
        () => setJobCollectionCounts((prev) => ({ ...prev, jobApplications: 0 })),
      ),
    ]
    return () => unsubs.forEach((u) => u())
  }, [])

  useEffect(() => {
    setCounts((prev) => ({
      ...prev,
      sell: sellCollectionCounts.sell + sellCollectionCounts.sellRequests,
    }))
  }, [sellCollectionCounts.sell, sellCollectionCounts.sellRequests])

  useEffect(() => {
    setCounts((prev) => ({
      ...prev,
      jobs: jobCollectionCounts.jobs + jobCollectionCounts.jobApplications,
    }))
  }, [jobCollectionCounts.jobApplications, jobCollectionCounts.jobs])

  const metrics = useMemo(
    () => [
      { labelKey: 'dashboard.metrics.totalProperties', value: '1,247', delta: '+12%', up: true, icon: Building2, iconBg: 'var(--dash-icon-blue)' },
      { labelKey: 'dashboard.metrics.forSale', value: '856', delta: '+8%', up: true, icon: Tag, iconBg: 'var(--dash-icon-green)' },
      { labelKey: 'dashboard.metrics.buyRequests', value: '324', delta: '+16%', up: true, icon: ShoppingCart, iconBg: 'var(--dash-icon-purple)' },
      { labelKey: 'dashboard.metrics.sellRequests', value: `${counts.sell}`, delta: '-3%', up: false, icon: Tag, iconBg: 'var(--dash-icon-orange)' },
      { labelKey: 'dashboard.metrics.investmentRequests', value: `${counts.investment}`, delta: '+22%', up: true, icon: TrendingUp, iconBg: 'var(--dash-icon-orange)' },
      { labelKey: 'dashboard.metrics.jobApplications', value: `${counts.jobs}`, delta: '+18%', up: true, icon: Briefcase, iconBg: 'var(--dash-icon-blue)' },
      { labelKey: 'dashboard.metrics.registeredUsers', value: '2,847', delta: '+25%', up: true, icon: Users, iconBg: 'var(--dash-icon-purple)' },
      { labelKey: 'dashboard.metrics.avgPropertyPrice', value: '$485K', delta: '+7%', up: true, icon: DollarSign, iconBg: 'var(--dash-icon-orange)' },
      { labelKey: 'dashboard.metrics.avgInvestment', value: '$125K', delta: '+14%', up: true, icon: DollarSign, iconBg: 'var(--dash-icon-blue)' },
      { labelKey: 'dashboard.metrics.conversionRate', value: '68%', delta: '+2%', up: true, icon: PieChart, iconBg: 'var(--dash-icon-green)' },
    ],
    [counts.investment, counts.jobs, counts.sell],
  )

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

  return (
    <AdminLayout title={t('dashboard.title')} subtitle={t('dashboard.subtitle')}>
      <div className="dashboard__metrics">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <article key={m.labelKey} className="dashboard__metric dashboard__metric-interactive">
              <div className="dashboard__metric-top">
                <span className="dashboard__metric-icon" style={{ background: m.iconBg }}>
                  <Icon size={18} strokeWidth={2} />
                </span>
                <span className={`dashboard__metric-delta ${m.up ? 'is-up' : 'is-down'}`}>{m.delta}</span>
              </div>
              <p className="dashboard__metric-value">{m.value}</p>
              <p className="dashboard__metric-label">{t(m.labelKey)}</p>
            </article>
          )
        })}
      </div>

      <div className="dashboard__charts">
        <section className="dashboard__card dashboard__card-chart">
          <h2 className="dashboard__card-title">{t('dashboard.charts.propertyTypeDistribution')}</h2>
          <div className="dashboard__pie-wrap">
            <svg className="dashboard__pie-svg" viewBox="0 0 200 200" role="img" aria-label={t('dashboard.charts.pieAria')}>
              {pieSlices.map((slice) => (
                <path key={slice.key} d={slice.d} fill={slice.color} className="dashboard__pie-slice" style={{ '--slice-delay': `${slice.delay}s` }} />
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

        <section className="dashboard__card dashboard__card-chart">
          <h2 className="dashboard__card-title">{t('dashboard.charts.userRegistrations')}</h2>
          <div className="dashboard__line-chart">
            <svg viewBox={`0 0 ${lineW} ${lineH}`} className="dashboard__line-svg" preserveAspectRatio="none" role="img" aria-label={t('dashboard.charts.lineAria')}>
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
              {LINE_MONTH_LABELS.map((mk) => (
                <span key={mk}>{t(`dashboard.monthsShort.${mk}`)}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="dashboard__card dashboard__card-chart">
          <h2 className="dashboard__card-title">{t('dashboard.charts.popularLocations')}</h2>
          <ul className="dashboard__h-bars">
            {BAR_TOP.map((row, idx) => (
              <li key={row.locationKey}>
                <span className="dashboard__h-label">{t(`admin.locations.${row.locationKey}`)}</span>
                <div className="dashboard__h-track">
                  <div className="dashboard__h-fill" style={{ '--w': `${row.pct}%`, '--bar-delay': `${idx * 0.08}s` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="dashboard__card dashboard__card-chart">
          <h2 className="dashboard__card-title">{t('dashboard.charts.investmentTrend')}</h2>
          <div className="dashboard__v-chart">
            {INVEST_MONTHS.map((h, i) => (
              <div key={INVEST_MONTH_LABELS[i]} className="dashboard__v-col">
                <div className="dashboard__v-bar" style={{ height: `${Math.max(24, (h / INVEST_MAX) * V_BAR_MAX_PX)}px`, '--v-delay': `${i * 0.07}s` }} />
                <span className="dashboard__v-month">{t(`dashboard.monthsShort.${INVEST_MONTH_LABELS[i]}`)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="dashboard__insights">
        <article className="dashboard__insight">
          <span className="dashboard__insight-icon is-green">
            <Trophy size={22} />
          </span>
          <div>
            <p className="dashboard__insight-label">{t('dashboard.insights.topProperty')}</p>
            <p className="dashboard__insight-title">{t('dashboard.insights.topPropertyTitle')}</p>
            <p className="dashboard__insight-meta">$2.4M</p>
          </div>
        </article>
        <article className="dashboard__insight">
          <span className="dashboard__insight-icon is-blue">
            <MapPin size={22} />
          </span>
          <div>
            <p className="dashboard__insight-label">{t('dashboard.insights.hotLocation')}</p>
            <p className="dashboard__insight-title">{t('dashboard.insights.hotLocationTitle')}</p>
            <p className="dashboard__insight-meta is-positive">{t('dashboard.insights.hotLocationMeta')}</p>
          </div>
        </article>
        <article className="dashboard__insight">
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
        <section className="dashboard__card">
          <h2 className="dashboard__card-title">{t('dashboard.lists.recentProperties')}</h2>
          <ul className="dashboard__list">
            <li>
              <div>
                <p className="dashboard__list-title">{t('admin.recentProperties.item1.title')}</p>
                <p className="dashboard__list-sub">{t('admin.recentProperties.item1.sub')}</p>
              </div>
              <span className="dashboard__badge is-green">{t('dashboard.lists.badgeActive')}</span>
            </li>
            <li>
              <div>
                <p className="dashboard__list-title">{t('admin.recentProperties.item2.title')}</p>
                <p className="dashboard__list-sub">{t('admin.recentProperties.item2.sub')}</p>
              </div>
              <span className="dashboard__badge is-amber">{t('dashboard.lists.badgePending')}</span>
            </li>
            <li>
              <div>
                <p className="dashboard__list-title">{t('admin.recentProperties.item3.title')}</p>
                <p className="dashboard__list-sub">{t('admin.recentProperties.item3.sub')}</p>
              </div>
              <span className="dashboard__badge is-blue">{t('dashboard.lists.badgeSold')}</span>
            </li>
          </ul>
        </section>
        <section className="dashboard__card">
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
                <p className="dashboard__list-sub">{t('admin.recentApplications.item2Role')}</p>
              </div>
              <span className="dashboard__badge is-amber">{t('dashboard.lists.badgeReview')}</span>
            </li>
            <li>
              <span className="dashboard__avatar">LR</span>
              <div>
                <p className="dashboard__list-title">{t('admin.recentApplications.item3Name')}</p>
                <p className="dashboard__list-sub">{t('dashboard.lists.app3Role')}</p>
              </div>
              <span className="dashboard__badge is-red">{t('dashboard.lists.badgeRejected')}</span>
            </li>
          </ul>
          <div style={{ marginTop: '14px' }}>
            <Link to="/admin/investment-requests" className="dashboard__sidebar-link">{t('admin.links.viewInvestmentRequests')}</Link>
            <Link to="/admin/sell-requests" className="dashboard__sidebar-link" style={{ marginTop: '8px' }}>{t('admin.links.viewSellRequests')}</Link>
            <Link to="/admin/job-applications" className="dashboard__sidebar-link" style={{ marginTop: '8px' }}>{t('admin.links.viewJobApplications')}</Link>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
