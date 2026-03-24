import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Bath,
  Bed,
  Car,
  Check,
  MapPin,
  Maximize2,
} from 'lucide-react'
import { fetchProperties } from '../data/properties'
import { fetchProducts } from '../data/products'
import { useLanguage } from '../context/LanguageContext'
import Reveal from '../components/Reveal'
import '../styles/Home.css'
import '../styles/PropertyDetail.css'

function formatSar(price, t) {
  if (price >= 1_000_000) {
    const m = price / 1_000_000
    const n = m >= 10 ? m.toFixed(0) : m.toFixed(1).replace(/\.0$/, '')
    return t('propertyDetail.priceFormat.million', { n })
  }
  if (price >= 1000) {
    const n = Math.round(price / 1000)
    return t('propertyDetail.priceFormat.thousand', { n })
  }
  return t('propertyDetail.priceFormat.full', { n: price })
}

function titleWithAccent(title) {
  const parts = title.trim().split(/\s+/)
  if (parts.length < 2) {
    return title
  }
  const last = parts[parts.length - 1]
  const rest = parts.slice(0, -1).join(' ')
  return (
    <>
      {rest}{' '}
      <span className="landing-hero__title-accent">{last}</span>
    </>
  )
}

function PropertyDetail() {
  const { t } = useLanguage()
  const { id } = useParams()
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError('')
        const [propsList, prodList] = await Promise.all([
          fetchProperties(),
          fetchProducts().catch(() => []),
        ])
        if (!cancelled) {
          setProperties(propsList)
          setProducts(Array.isArray(prodList) ? prodList : [])
        }
      } catch {
        if (!cancelled) {
          setError('propertyDetail.loadError')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const property = useMemo(() => {
    const listing = products.find((p) => String(p.id) === String(id))
    if (listing) {
      const pid = listing.propertyId ?? listing.id
      return properties.find((p) => String(p.id) === String(pid))
    }
    return properties.find((p) => String(p.id) === String(id))
  }, [id, properties, products])

  if (loading) {
    return (
      <div className="landing-page property-detail-page">
        <div className="landing-container property-detail__shell">
          <button
            type="button"
            className="property-detail__back landing-btn landing-btn--outline"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} aria-hidden />
            <span>{t('common.back')}</span>
          </button>
          <div className="property-detail__loading">
            <div className="landing-property-skeleton property-detail__skeleton-line property-detail__skeleton-line--title" />
            <div className="landing-property-skeleton property-detail__skeleton-line property-detail__skeleton-line--sub" />
            <div className="property-detail__loading-grid">
              <div className="landing-property-skeleton property-detail__skeleton-hero" />
              <div className="property-detail__loading-aside">
                <div className="landing-property-skeleton property-detail__skeleton-card" />
                <div className="landing-property-skeleton property-detail__skeleton-card property-detail__skeleton-card--short" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="landing-page property-detail-page">
        <div className="landing-container property-detail__shell">
          <button
            type="button"
            className="property-detail__back landing-btn landing-btn--outline"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} aria-hidden />
            <span>{t('common.back')}</span>
          </button>
          <Reveal>
            <div className="property-detail__not-found">
              <h1 className="property-detail__not-found-title">
                {error ? t(error) : t('propertyDetail.notFoundTitle')}
              </h1>
              {!error ? (
                <p className="property-detail__not-found-text">{t('propertyDetail.notFoundText')}</p>
              ) : null}
              <div className="property-detail__not-found-actions">
                <button
                  type="button"
                  className="landing-btn landing-btn--primary"
                  onClick={() => navigate('/buy')}
                >
                  {t('common.browseProperties')}
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    )
  }

  return (
    <div className="landing-page property-detail-page">
      <div className="landing-container property-detail__shell">
        <Reveal>
          <button
            type="button"
            className="property-detail__back landing-btn landing-btn--outline"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} aria-hidden />
            <span>{t('propertyDetail.backToResults')}</span>
          </button>
        </Reveal>

        <header className="property-detail__header">
          <Reveal className="property-detail__header-main" delay={60}>
            <p className="property-detail__eyebrow">{property.type}</p>
            <h1 className="property-detail__title landing-hero__title">
              {titleWithAccent(property.title)}
            </h1>
            <p className="property-detail__location">
              <MapPin size={18} aria-hidden className="property-detail__location-icon" />
              <span>{property.location}</span>
            </p>
          </Reveal>
          <Reveal className="property-detail__header-aside" delay={120}>
            <div className="property-detail__price-card">
              <p className="property-detail__price-label">{t('propertyDetail.askingPrice')}</p>
              <p className="property-detail__price">{formatSar(property.price, t)}</p>
              <p className="property-detail__area">
                {t('propertyDetail.totalArea', { area: property.area })}
              </p>
              <div className="property-detail__price-actions">
                <button
                  type="button"
                  className="landing-btn landing-btn--primary property-detail__cta"
                  onClick={() => navigate('/investment')}
                >
                  {t('propertyDetail.requestDetails')}
                </button>
                <button
                  type="button"
                  className="landing-btn landing-btn--outline property-detail__cta"
                  onClick={() => navigate('/buy')}
                >
                  {t('propertyDetail.moreListings')}
                </button>
              </div>
            </div>
          </Reveal>
        </header>

        <div className="property-detail__layout">
          <Reveal className="property-detail__media" delay={100}>
            <div className="property-detail__image-frame landing-hero__image-frame">
              <img
                src={property.image}
                alt=""
                className="property-detail__image"
                loading="lazy"
                decoding="async"
              />
              <span className="property-detail__tag">{property.tag}</span>
            </div>
          </Reveal>

          <aside className="property-detail__sidebar">
            <Reveal delay={140}>
              <div className="property-detail__stats">
                <div className="property-detail__stat-item">
                  <Bed size={20} aria-hidden className="property-detail__stat-icon" />
                  <span className="property-detail__stat-label">{t('propertyDetail.bedrooms')}</span>
                  <span className="property-detail__stat-value">{property.bedrooms}</span>
                </div>
                <div className="property-detail__stat-item">
                  <Bath size={20} aria-hidden className="property-detail__stat-icon" />
                  <span className="property-detail__stat-label">{t('propertyDetail.bathrooms')}</span>
                  <span className="property-detail__stat-value">{property.bathrooms}</span>
                </div>
                <div className="property-detail__stat-item">
                  <Car size={20} aria-hidden className="property-detail__stat-icon" />
                  <span className="property-detail__stat-label">{t('propertyDetail.parking')}</span>
                  <span className="property-detail__stat-value">{property.parking}</span>
                </div>
                <div className="property-detail__stat-item">
                  <Maximize2 size={20} aria-hidden className="property-detail__stat-icon" />
                  <span className="property-detail__stat-label">{t('propertyDetail.area')}</span>
                  <span className="property-detail__stat-value">
                    {t('propertyDetail.areaSqm', { area: property.area })}
                  </span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="property-detail__highlights">
                <h2 className="property-detail__highlights-title">{t('propertyDetail.highlights')}</h2>
                <ul className="property-detail__highlights-list">
                  {property.highlights?.map((item) => (
                    <li key={item} className="property-detail__highlight-item">
                      <span className="property-detail__highlight-check" aria-hidden>
                        <Check size={16} strokeWidth={3} />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </aside>
        </div>

        <Reveal delay={80}>
          <section className="property-detail__section" aria-labelledby="property-about-heading">
            <h2 id="property-about-heading" className="property-detail__section-title">
              {t('propertyDetail.aboutTitle')}
            </h2>
            <p className="property-detail__section-body">{property.description}</p>
          </section>
        </Reveal>
      </div>
    </div>
  )
}

export default PropertyDetail
