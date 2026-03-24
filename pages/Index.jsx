import { useCallback, useEffect, useState } from 'react'
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
import '../styles/Home.css'
import { fetchProducts } from '../data/products'
import { ALL_LOCATIONS } from '../data/properties'

const HERO_VILLA = '../../public/hero.png'
const WHY_IMAGE = '../../public/reason.png'

const LOCATION_OPTIONS = ALL_LOCATIONS.filter((l) => l !== 'All Locations')
const PROPERTY_TYPE_OPTIONS = ['Apartment', 'Villa', 'Studio', 'Penthouse']
const PRICE_OPTIONS = [
  { value: '', label: 'Any price' },
  { value: '0-500000', label: 'Up to 500K SAR' },
  { value: '500000-1000000', label: '500K – 1M SAR' },
  { value: '1000000-2000000', label: '1M – 2M SAR' },
  { value: '2000000-', label: '2M+ SAR' },
]

const SERVICES = [
  {
    title: 'Property Buying',
    text: 'Find your perfect home with our extensive property database and expert guidance.',
    Icon: Home,
    variant: 'landing-service-card--blue',
  },
  {
    title: 'Property Selling',
    text: 'Maximize your property value with our professional marketing and sales expertise.',
    Icon: DollarSign,
    variant: 'landing-service-card--gold',
  },
  {
    title: 'Investment Advisory',
    text: 'Strategic investment opportunities with detailed market analysis and ROI projections.',
    Icon: TrendingUp,
    variant: 'landing-service-card--green',
  },
]

const WHY_POINTS = [
  {
    title: 'Expert Market Knowledge',
    text: 'Deep understanding of local markets with data-driven insights.',
  },
  {
    title: 'Trusted Network',
    text: 'Established relationships with verified buyers, sellers, and investors.',
  },
  {
    title: 'End-to-End Service',
    text: 'Complete support from initial consultation to final transaction.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Sarah Ahmed',
    role: 'Property Investor',
    quote:
      'Exceptional service and market insights. Found the perfect investment property with excellent ROI potential.',
    avatar:
      '../../public/reviewer1.jpg',
  },
  {
    name: 'Mohammed Al-Rashid',
    role: 'Home Buyer',
    quote:
      'Professional team that understood our needs perfectly.Made the buying process smooth and stress- free.',
    avatar:
      '../../public/reviewer2.jpg',
  },
  {
    name: 'Haddad Al-Zahra',
    role: 'Property Seller',
    quote:
      'Sold my property above asking price within weeks.Their marketing strategy and negotiation skills are outstanding.',
    avatar:
      '../../public/reviewer3.jpg',
  },
]

function formatSar(price) {
  if (price >= 1_000_000) {
    const m = price / 1_000_000
    const s = m >= 10 ? m.toFixed(0) : m.toFixed(1).replace(/\.0$/, '')
    return `${s}M SAR`
  }
  if (price >= 1000) {
    return `${Math.round(price / 1000)}K SAR`
  }
  return `${price} SAR`
}

function specsLine(type, area) {
  if (type === 'Studio') {
    return `1 Bed • 1 Bath • ${area} sqm`
  }
  const beds =
    type === 'Villa'
      ? Math.min(6, Math.max(4, Math.round(area / 80)))
      : type === 'Penthouse'
        ? 4
        : Math.max(2, Math.round(area / 50))
  const baths = Math.max(2, Math.min(5, beds - 1))
  return `${beds} Beds • ${baths} Baths • ${area} sqm`
}

function Index() {
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

  return (
    <div className="landing-page">
      <section className="landing-hero-wrap" aria-label="Introduction">
        <div className="landing-hero landing-container">
          <Reveal className="landing-hero__col landing-hero__col--text">
            <h1 className="landing-hero__title">
              Find Your Dream{' '}
              <span className="landing-hero__title-accent">Property</span> Today
            </h1>
            <p className="landing-hero__lead">
              Discover premium real estate opportunities with our comprehensive
              platform. Whether buying, selling, or investing, we provide trusted
              solutions for your property needs.
            </p>
            <div className="landing-hero__ctas">
              <Link to="/buy" className="landing-btn landing-btn--primary">
                Start Searching
              </Link>
              <Link to="/investment" className="landing-btn landing-btn--outline">
                Learn More
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

      <section className="landing-search-section" aria-label="Property search">
        <form
          className="landing-search landing-container"
          onSubmit={onSearch}
          aria-label="Smart property search"
        >
          <h2 className="landing-search__title">Smart Property Search</h2>
          <div className="landing-search__row">
            <label className="landing-search__field">
              <span className="landing-search__label">Location</span>
              <CustomSelect
                name="searchLocation"
                value={searchLocation}
                onChange={handleSearchSelectChange}
                options={LOCATION_OPTIONS}
                placeholder="All areas"
              />
            </label>
            <label className="landing-search__field">
              <span className="landing-search__label">Property Type</span>
              <CustomSelect
                name="searchType"
                value={searchType}
                onChange={handleSearchSelectChange}
                options={PROPERTY_TYPE_OPTIONS}
                placeholder="Any type"
              />
            </label>
            <label className="landing-search__field">
              <span className="landing-search__label">Price Range</span>
              <CustomSelect
                name="searchPrice"
                value={searchPrice}
                onChange={handleSearchSelectChange}
                options={PRICE_OPTIONS}
                placeholder="Any price"
              />
            </label>
            <button type="submit" className="landing-search__submit">
              <Search size={20} aria-hidden />
              <span>Search</span>
            </button>
          </div>
        </form>
      </section>

      <section className="landing-section landing-section--featured">
        <div className="landing-container">
          <Reveal>
            <header className="landing-section__head">
              <h2 className="landing-section__title">Featured Properties</h2>
              <p className="landing-section__subtitle">
                Discover our handpicked selection of premium properties
              </p>
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
                    Properties are unavailable right now.{' '}
                    <Link to="/buy">Browse all listings</Link>
                  </p>
                )
                : featured.map((p, i) => (
                  <Reveal key={p.id} delay={i * 70}>
                    <article className="landing-property-card">
                      <div className="landing-property-card__media">
                        <img src={p.thumbnail} alt="" decoding="async" />
                        <span className="landing-property-card__price">
                          {formatSar(p.price)}
                        </span>
                      </div>
                      <div className="landing-property-card__body">
                        <h3 className="landing-property-card__name">{p.name}</h3>
                        <p className="landing-property-card__specs">
                          {specsLine(p.type, p.area)}
                        </p>
                        <p className="landing-property-card__loc">
                          <MapPin size={16} aria-hidden />
                          {p.location}
                        </p>
                        <Link to={`/buy/${p.id}`} className="landing-property-card__btn">
                          View Details
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
              <h2 className="landing-section__title">Our Services</h2>
              <p className="landing-section__subtitle">
                Comprehensive real estate solutions for all your needs
              </p>
            </header>
          </Reveal>
          <div className="landing-services-grid">
            {SERVICES.map(({ title, text, Icon, variant }, i) => (
              <Reveal key={title} delay={i * 60}>
                <article className={`landing-service-card ${variant}`}>
                  <div className="landing-service-card__icon">
                    <Icon size={28} aria-hidden />
                  </div>
                  <h3 className="landing-service-card__title">{title}</h3>
                  <p className="landing-service-card__text">{text}</p>
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
                Why Choose RealEstate?
              </h2>
              <ul className="landing-why__list">
                {WHY_POINTS.map(({ title, text }) => (
                  <li key={title} className="landing-why__item">
                    <span className="landing-why__check" aria-hidden>
                      <Check size={18} strokeWidth={3} />
                    </span>
                    <div>
                      <h3 className="landing-why__item-title">{title}</h3>
                      <p className="landing-why__item-text">{text}</p>
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
              <h2 className="landing-section__title">What Our Clients Say</h2>
              <p className="landing-section__subtitle">
                Real experiences from satisfied property owners and investors
              </p>
            </header>
          </Reveal>
          <div className="landing-testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 70}>
                <blockquote className="landing-quote-card">
                  <div className="landing-quote-card__head">
                    <img src={t.avatar} alt="" className="landing-quote-card__avatar" />
                    <div>
                      <cite className="landing-quote-card__name">{t.name}</cite>
                      <p className="landing-quote-card__role">{t.role}</p>
                    </div>
                  </div>
                  <p className="landing-quote-card__quote">&ldquo;{t.quote}&rdquo;</p>
                  <div className="landing-quote-card__stars" aria-label="5 out of 5 stars">
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
            <h2 className="landing-cta__title">Ready to Start Your Real Estate Journey?</h2>
            <p className="landing-cta__text">
              Join thousands of satisfied clients who trust us with their property needs
            </p>
            <Link to="/buy" className="landing-cta__btn">
              Get Started Today
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}

export default Index
