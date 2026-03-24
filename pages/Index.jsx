import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Check,
  DollarSign,
  Home,
  MapPin,
  Search,
  Star,
  TrendingUp,
} from 'lucide-react'
import CustomSelect from '../components/CustomSelect'
import Reveal from '../components/Reveal'
import { useLanguage } from '../context/LanguageContext'
import '../styles/Home.css'
import { fetchProducts } from '../data/products'
import { productDisplayName, productLocationDisplay } from '../utils/productLocale'
import { ALL_LOCATIONS } from '../data/properties'

const HERO_VILLA = '../../public/hero.png'
const WHY_IMAGE = '../../public/reason.png'

const LOCATION_OPTIONS = ALL_LOCATIONS.filter((l) => l !== 'All Locations')
const PROPERTY_TYPE_VALUES = ['Apartment', 'Villa', 'Studio', 'Penthouse']

const SERVICE_DEFS = [
  {
    titleKey: 'home.services.buyingTitle',
    textKey: 'home.services.buyingText',
    Icon: Home,
    variant: 'landing-service-card--blue',
  },
  {
    titleKey: 'home.services.sellingTitle',
    textKey: 'home.services.sellingText',
    Icon: DollarSign,
    variant: 'landing-service-card--gold',
  },
  {
    titleKey: 'home.services.investTitle',
    textKey: 'home.services.investText',
    Icon: TrendingUp,
    variant: 'landing-service-card--green',
  },
]

const WHY_DEFS = [
  { titleKey: 'home.why.point1Title', textKey: 'home.why.point1Text' },
  { titleKey: 'home.why.point2Title', textKey: 'home.why.point2Text' },
  { titleKey: 'home.why.point3Title', textKey: 'home.why.point3Text' },
]

const TESTIMONIAL_DEFS = [
  {
    nameKey: 'home.testimonials.t1Name',
    roleKey: 'home.testimonials.t1Role',
    quoteKey: 'home.testimonials.t1Quote',
    avatar: '../../public/reviewer1.jpg',
  },
  {
    nameKey: 'home.testimonials.t2Name',
    roleKey: 'home.testimonials.t2Role',
    quoteKey: 'home.testimonials.t2Quote',
    avatar: '../../public/reviewer2.jpg',
  },
  {
    nameKey: 'home.testimonials.t3Name',
    roleKey: 'home.testimonials.t3Role',
    quoteKey: 'home.testimonials.t3Quote',
    avatar: '../../public/reviewer3.jpg',
  },
]

function formatSar(price, t) {
  if (price >= 1_000_000) {
    const m = price / 1_000_000
    const n = m >= 10 ? m.toFixed(0) : m.toFixed(1).replace(/\.0$/, '')
    return t('home.priceFormat.million', { n })
  }
  if (price >= 1000) {
    const n = Math.round(price / 1000)
    return t('home.priceFormat.thousand', { n })
  }
  return t('home.priceFormat.full', { n: price })
}

function specsLine(type, area, t) {
  if (type === 'Studio') {
    return t('home.specs.studio', { area })
  }
  const beds =
    type === 'Villa'
      ? Math.min(6, Math.max(4, Math.round(area / 80)))
      : type === 'Penthouse'
        ? 4
        : Math.max(2, Math.round(area / 50))
  const baths = Math.max(2, Math.min(5, beds - 1))
  return t('home.specs.line', { beds, baths, area })
}

function Index() {
  const { t, locale } = useLanguage()
  const navigate = useNavigate()
  const [featured, setFeatured] = useState([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [searchLocation, setSearchLocation] = useState('')
  const [searchType, setSearchType] = useState('')
  const [searchPrice, setSearchPrice] = useState('')

  useEffect(() => {
    let cancelled = false
    fetchProducts()
      .then((list) => {
        if (!cancelled && Array.isArray(list)) {
          setFeatured(list.slice(0, 3))
        }
      })
      .catch(() => {
        if (!cancelled) setFeatured([])
      })
      .finally(() => {
        if (!cancelled) setFeaturedLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const onSearch = useCallback(
    (e) => {
      e.preventDefault()
      navigate('/buy')
    },
    [navigate],
  )

  const handleSearchSelectChange = (e) => {
    const { name, value } = e.target
    if (name === 'searchLocation') setSearchLocation(value)
    else if (name === 'searchType') setSearchType(value)
    else if (name === 'searchPrice') setSearchPrice(value)
  }

  const priceOptions = useMemo(
    () => [
      { value: '', label: t('home.priceOptions.any') },
      { value: '0-500000', label: t('home.priceOptions.upTo500k') },
      { value: '500000-1000000', label: t('home.priceOptions.500kTo1m') },
      { value: '1000000-2000000', label: t('home.priceOptions.1mTo2m') },
      { value: '2000000-', label: t('home.priceOptions.over2m') },
    ],
    [t],
  )

  const propertyTypeOptions = useMemo(
    () =>
      PROPERTY_TYPE_VALUES.map((value) => ({
        value,
        label: t(`home.propertyTypes.${value}`),
      })),
    [t],
  )

  return (
    <div className="landing-page">
      <section className="landing-hero-wrap" aria-label={t('common.introduction')}>
        <div className="landing-hero landing-container">
          <Reveal className="landing-hero__col landing-hero__col--text">
            <h1 className="landing-hero__title">
              {t('home.hero.titleBefore')}{' '}
              <span className="landing-hero__title-accent">{t('home.hero.titleAccent')}</span>{' '}
              {t('home.hero.titleAfter')}
            </h1>
            <p className="landing-hero__lead">{t('home.hero.lead')}</p>
            <div className="landing-hero__ctas">
              <Link to="/buy" className="landing-btn landing-btn--primary">
                {t('home.hero.ctaSearch')}
              </Link>
              <Link to="/investment" className="landing-btn landing-btn--outline">
                {t('home.hero.ctaLearn')}
              </Link>
            </div>
          </Reveal>
          <Reveal className="landing-hero__col landing-hero__col--visual" delay={80}>
            <div className="landing-hero__image-frame">
              <img
                src={HERO_VILLA}
                alt=""
                className="landing-hero__image"
                decoding="async"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="landing-search-section" aria-label={t('home.search.sectionAria')}>
        <form
          className="landing-search landing-container"
          onSubmit={onSearch}
          aria-label={t('home.search.formAria')}
        >
          <h2 className="landing-search__title">{t('home.search.title')}</h2>
          <div className="landing-search__row">
            <label className="landing-search__field">
              <span className="landing-search__label">{t('home.search.location')}</span>
              <CustomSelect
                name="searchLocation"
                value={searchLocation}
                onChange={handleSearchSelectChange}
                options={LOCATION_OPTIONS}
                placeholder={t('home.search.placeholderArea')}
              />
            </label>
            <label className="landing-search__field">
              <span className="landing-search__label">{t('home.search.propertyType')}</span>
              <CustomSelect
                name="searchType"
                value={searchType}
                onChange={handleSearchSelectChange}
                options={propertyTypeOptions}
                placeholder={t('home.search.placeholderType')}
              />
            </label>
            <label className="landing-search__field">
              <span className="landing-search__label">{t('home.search.priceRange')}</span>
              <CustomSelect
                name="searchPrice"
                value={searchPrice}
                onChange={handleSearchSelectChange}
                options={priceOptions}
                placeholder={t('home.search.placeholderPrice')}
              />
            </label>
            <button type="submit" className="landing-search__submit">
              <Search size={20} aria-hidden />
              <span>{t('home.search.submit')}</span>
            </button>
          </div>
        </form>
      </section>

      <section className="landing-section landing-section--featured">
        <div className="landing-container">
          <Reveal>
            <header className="landing-section__head">
              <h2 className="landing-section__title">{t('home.featured.title')}</h2>
              <p className="landing-section__subtitle">{t('home.featured.subtitle')}</p>
            </header>
          </Reveal>
          <div className="landing-cards-grid">
            {featuredLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="landing-property-skeleton" aria-hidden />
              ))
              : featured.length === 0
                ? (
                  <p className="landing-cards-empty">
                    {t('home.featured.empty')}{' '}
                    <Link to="/buy">{t('home.featured.browseAll')}</Link>
                  </p>
                )
                : featured.map((p, i) => (
                  <Reveal key={p.id} delay={i * 70}>
                    <article className="landing-property-card">
                      <div className="landing-property-card__media">
                        <img src={p.thumbnail} alt="" decoding="async" />
                        <span className="landing-property-card__price">
                          {formatSar(p.price, t)}
                        </span>
                      </div>
                      <div className="landing-property-card__body">
                        <h3 className="landing-property-card__name">{productDisplayName(p, locale)}</h3>
                        <p className="landing-property-card__specs">
                          {specsLine(p.type, p.area, t)}
                        </p>
                        <p className="landing-property-card__loc">
                          <MapPin size={16} aria-hidden />
                          {productLocationDisplay(p, locale)}
                        </p>
                        <Link to={`/buy/${p.id}`} className="landing-property-card__btn">
                          {t('home.featured.viewDetails')}
                        </Link>
                      </div>
                    </article>
                  </Reveal>
                ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-section--services">
        <div className="landing-container">
          <Reveal>
            <header className="landing-section__head">
              <h2 className="landing-section__title">{t('home.services.sectionTitle')}</h2>
              <p className="landing-section__subtitle">{t('home.services.sectionSubtitle')}</p>
            </header>
          </Reveal>
          <div className="landing-services-grid">
            {SERVICE_DEFS.map(({ titleKey, textKey, Icon, variant }, i) => (
              <Reveal key={titleKey} delay={i * 60}>
                <article className={`landing-service-card ${variant}`}>
                  <div className="landing-service-card__icon">
                    <Icon size={28} aria-hidden />
                  </div>
                  <h3 className="landing-service-card__title">{t(titleKey)}</h3>
                  <p className="landing-service-card__text">{t(textKey)}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-section--why">
        <div className="landing-container landing-why">
          <Reveal>
            <div className="landing-why__copy">
              <h2 className="landing-section__title landing-section__title--left">
                {t('home.why.title')}
              </h2>
              <ul className="landing-why__list">
                {WHY_DEFS.map(({ titleKey, textKey }) => (
                  <li key={titleKey} className="landing-why__item">
                    <span className="landing-why__check" aria-hidden>
                      <Check size={18} strokeWidth={3} />
                    </span>
                    <div>
                      <h3 className="landing-why__item-title">{t(titleKey)}</h3>
                      <p className="landing-why__item-text">{t(textKey)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="landing-why__visual">
              <img src={WHY_IMAGE} alt="" decoding="async" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="landing-section landing-section--testimonials">
        <div className="landing-container">
          <Reveal>
            <header className="landing-section__head">
              <h2 className="landing-section__title">{t('home.testimonials.title')}</h2>
              <p className="landing-section__subtitle">{t('home.testimonials.subtitle')}</p>
            </header>
          </Reveal>
          <div className="landing-testimonials-grid">
            {TESTIMONIAL_DEFS.map((item, i) => (
              <Reveal key={item.nameKey} delay={i * 70}>
                <blockquote className="landing-quote-card">
                  <div className="landing-quote-card__head">
                    <img src={item.avatar} alt="" className="landing-quote-card__avatar" />
                    <div>
                      <cite className="landing-quote-card__name">{t(item.nameKey)}</cite>
                      <p className="landing-quote-card__role">{t(item.roleKey)}</p>
                    </div>
                  </div>
                  <p className="landing-quote-card__quote">&ldquo;{t(item.quoteKey)}&rdquo;</p>
                  <div className="landing-quote-card__stars" aria-label={t('common.starsRating')}>
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star
                        key={si}
                        size={18}
                        className="landing-quote-card__star"
                        fill="currentColor"
                        aria-hidden
                      />
                    ))}
                  </div>
                </blockquote>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <Reveal>
          <div className="landing-cta__inner">
            <h2 className="landing-cta__title">{t('home.cta.title')}</h2>
            <p className="landing-cta__text">{t('home.cta.text')}</p>
            <Link to="/buy" className="landing-cta__btn">
              {t('home.cta.button')}
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}

export default Index
