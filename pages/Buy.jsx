import { useEffect, useMemo, useState } from 'react'
import { MapPin, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CustomSelect from '../components/CustomSelect'
import Reveal from '../components/Reveal'
import { useLanguage } from '../context/LanguageContext'
import '../styles/Buy.css'
import { ALL_LOCATIONS } from '../data/properties'
import { fetchProducts } from '../data/products'
import {
  productDisplayName,
  productLocationDisplay,
  productShortDescription,
} from '../utils/productLocale'

const PROPERTY_TYPE_VALUES = ['Apartment', 'Villa', 'Studio']

const PRICE_FILTER_DEFS = [
  { value: '', key: 'any' },
  { value: 100000, key: '100k' },
  { value: 200000, key: '200k' },
  { value: 500000, key: '500k' },
  { value: 750000, key: '750k' },
  { value: 1000000, key: '1m' },
  { value: 1500000, key: '1_5m' },
  { value: 2000000, key: '2m' },
  { value: 3000000, key: '3m' },
]

const PRICE_SLIDER_MIN = 0
const PRICE_SLIDER_MAX = 3000000
const PRICE_SLIDER_STEP = 50000

const initialFilterState = {
  location: 'All Locations',
  propertyTypes: [],
  minPrice: '',
  maxPrice: '',
  minArea: '',
  maxArea: '',
}

function Buy() {
  const { t, locale } = useLanguage()
  const [formFilters, setFormFilters] = useState(initialFilterState)
  const [appliedFilters, setAppliedFilters] = useState(initialFilterState)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('low-high')
  const pageSize = 6
  const navigate = useNavigate()

  const locationOptions = useMemo(
    () =>
      ALL_LOCATIONS.map((loc) => ({
        value: loc,
        label: loc === 'All Locations' ? t('buy.allLocations') : loc,
      })),
    [t],
  )

  const priceSelectOptions = useMemo(
    () =>
      PRICE_FILTER_DEFS.map(({ value, key }) => ({
        value: value === '' ? '' : String(value),
        label: t(`buy.priceOptions.${key}`),
      })),
    [t],
  )

  const propertyTypeOptions = useMemo(
    () =>
      PROPERTY_TYPE_VALUES.map((type) => ({
        value: type,
        label: t(`home.propertyTypes.${type}`),
      })),
    [t],
  )

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const list = await fetchProducts()
        if (!cancelled) {
          setProducts(list)
        }
      } catch {
        if (!cancelled) {
          setError('buy.loadError')
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

  const handleSelectChange = (e) => {
    const { name, value } = e.target
    if (name === 'minPrice') {
      setFormFilters((prev) => {
        const newMin = value === '' ? '' : Number(value)
        const currentMax = prev.maxPrice
        const adjustedMax =
          currentMax === '' || (newMin !== '' && currentMax < newMin) ? newMin : currentMax
        return { ...prev, minPrice: newMin, maxPrice: adjustedMax }
      })
    } else if (name === 'maxPrice') {
      setFormFilters((prev) => {
        const newMax = value === '' ? '' : Number(value)
        const currentMin = prev.minPrice
        const adjustedMin =
          currentMin === '' || (newMax !== '' && currentMin > newMax) ? newMax : currentMin
        return { ...prev, maxPrice: newMax, minPrice: adjustedMin }
      })
    } else {
      setFormFilters((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleNumberChange = (e) => {
    const { name, value } = e.target
    setFormFilters((prev) => ({ ...prev, [name]: value === '' ? '' : Number(value) }))
  }

  const priceSliderMin = formFilters.minPrice === '' ? PRICE_SLIDER_MIN : formFilters.minPrice
  const priceSliderMax = formFilters.maxPrice === '' ? PRICE_SLIDER_MAX : formFilters.maxPrice

  const handlePriceSliderMin = (e) => {
    const value = Number(e.target.value)
    const maxVal = formFilters.maxPrice === '' ? PRICE_SLIDER_MAX : formFilters.maxPrice
    const clamped = Math.min(value, maxVal)
    setFormFilters((prev) => {
      const newMin = clamped === PRICE_SLIDER_MIN ? '' : clamped
      const newMax = prev.maxPrice === '' ? '' : prev.maxPrice < clamped ? clamped : prev.maxPrice
      return { ...prev, minPrice: newMin, maxPrice: newMax }
    })
  }

  const handlePriceSliderMax = (e) => {
    const value = Number(e.target.value)
    const minVal = formFilters.minPrice === '' ? PRICE_SLIDER_MIN : formFilters.minPrice
    const clamped = Math.max(value, minVal)
    setFormFilters((prev) => {
      const newMax = clamped === PRICE_SLIDER_MAX ? '' : clamped
      const newMin = prev.minPrice === '' ? '' : prev.minPrice > clamped ? clamped : prev.minPrice
      return { ...prev, minPrice: newMin, maxPrice: newMax }
    })
  }

  const handlePropertyTypeChange = (type) => {
    setFormFilters((prev) => {
      const next = prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter((x) => x !== type)
        : [...prev.propertyTypes, type]
      return { ...prev, propertyTypes: next }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setAppliedFilters(formFilters)
    setCurrentPage(1)
  }

  const handleReset = () => {
    setFormFilters(initialFilterState)
    setAppliedFilters(initialFilterState)
    setCurrentPage(1)
  }

  const filteredProperties = useMemo(() => {
    return products.filter((product) => {
      if (
        appliedFilters.location !== 'All Locations' &&
        product.location !== appliedFilters.location
      ) {
        return false
      }

      if (
        appliedFilters.propertyTypes.length > 0 &&
        !appliedFilters.propertyTypes.includes(product.type)
      ) {
        return false
      }

      if (appliedFilters.minPrice !== '' && product.price < appliedFilters.minPrice) {
        return false
      }

      if (appliedFilters.maxPrice !== '' && product.price > appliedFilters.maxPrice) {
        return false
      }

      if (appliedFilters.minArea !== '' && product.area < appliedFilters.minArea) {
        return false
      }

      if (appliedFilters.maxArea !== '' && product.area > appliedFilters.maxArea) {
        return false
      }

      return true
    })
  }, [appliedFilters, products])

  const sortedProperties = useMemo(() => {
    const list = [...filteredProperties]
    if (sortBy === 'low-high') {
      list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    } else if (sortBy === 'high-low') {
      list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    }
    return list
  }, [filteredProperties, sortBy])

  const priceTrackStyle = useMemo(() => {
    const minVal = formFilters.minPrice === '' ? PRICE_SLIDER_MIN : formFilters.minPrice
    const maxVal = formFilters.maxPrice === '' ? PRICE_SLIDER_MAX : formFilters.maxPrice
    const start = (minVal / PRICE_SLIDER_MAX) * 100
    const end = (maxVal / PRICE_SLIDER_MAX) * 100
    return {
      background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${start}%, #1e3a5f ${start}%, #1e3a5f ${end}%, #e5e7eb ${end}%, #e5e7eb 100%)`,
    }
  }, [formFilters.minPrice, formFilters.maxPrice])

  const totalPages = Math.max(1, Math.ceil(sortedProperties.length / pageSize))
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedProperties.slice(start, start + pageSize)
  }, [sortedProperties, currentPage])

  const displayPropertyType = (typ) => {
    const key = `home.propertyTypes.${typ}`
    const resolved = t(key)
    return resolved === key ? typ : resolved
  }

  return (
    <div className="buy-page">
      <div className="buy-page__header">
        <div className="buy-page__header-inner">
          <Reveal>
            <div>
              <h1 className="buy-page__title">{t('buy.title')}</h1>
              <p className="buy-page__subtitle">{t('buy.subtitle')}</p>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="buy-page__content">
        <div className="buy-page__layout">
          <aside className="buy-filters">
            <Reveal delay={60}>
              <div className="buy-filters__reveal">
                <div className="buy-filters__header">
                  <h2 className="buy-filters__title">{t('buy.filtersTitle')}</h2>
                  <button type="button" className="buy-filters__reset" onClick={handleReset}>
                    {t('buy.reset')}
                  </button>
                </div>

                <form className="buy-filters__form" onSubmit={handleSubmit}>
                  <div className="buy-filters__group">
                    <label htmlFor="location" className="buy-filters__label">
                      {t('buy.location')}
                    </label>
                    <CustomSelect
                      id="location"
                      name="location"
                      value={formFilters.location}
                      onChange={handleSelectChange}
                      options={locationOptions}
                      placeholder={t('buy.allLocations')}
                    />
                  </div>

                  <div className="buy-filters__group">
                    <label className="buy-filters__label">{t('buy.propertyType')}</label>
                    <div className="buy-filters__checkboxes">
                      {propertyTypeOptions.map(({ value: type, label }) => (
                        <label key={type} className="buy-filters__checkbox-wrap">
                          <input
                            type="checkbox"
                            checked={formFilters.propertyTypes.includes(type)}
                            onChange={() => handlePropertyTypeChange(type)}
                            className="buy-filters__checkbox"
                          />
                          <span className="buy-filters__checkbox-label">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="buy-filters__group">
                    <label className="buy-filters__label">{t('buy.priceRange')}</label>
                    <div className="buy-filters__slider-wrap">
                      <div className="buy-filters__slider-track" aria-hidden style={priceTrackStyle} />
                      <input
                        type="range"
                        min={PRICE_SLIDER_MIN}
                        max={PRICE_SLIDER_MAX}
                        step={PRICE_SLIDER_STEP}
                        value={priceSliderMin}
                        onChange={handlePriceSliderMin}
                        className="buy-filters__slider buy-filters__slider--min"
                        aria-label={t('buy.minPriceAria')}
                      />
                      <input
                        type="range"
                        min={PRICE_SLIDER_MIN}
                        max={PRICE_SLIDER_MAX}
                        step={PRICE_SLIDER_STEP}
                        value={priceSliderMax}
                        onChange={handlePriceSliderMax}
                        className="buy-filters__slider buy-filters__slider--max"
                        aria-label={t('buy.maxPriceAria')}
                      />
                    </div>
                    <div className="buy-filters__range buy-filters__range--two">
                      <CustomSelect
                        name="minPrice"
                        value={formFilters.minPrice === '' ? '' : String(formFilters.minPrice)}
                        onChange={handleSelectChange}
                        options={priceSelectOptions}
                        placeholder={t('common.any')}
                        className="buy-filters__price-select"
                      />
                      <CustomSelect
                        name="maxPrice"
                        value={formFilters.maxPrice === '' ? '' : String(formFilters.maxPrice)}
                        onChange={handleSelectChange}
                        options={priceSelectOptions}
                        placeholder={t('common.any')}
                        className="buy-filters__price-select"
                      />
                    </div>
                  </div>

                  <div className="buy-filters__group">
                    <label className="buy-filters__label">{t('buy.areaSqm')}</label>
                    <div className="buy-filters__range buy-filters__range--two">
                      <input
                        type="number"
                        name="minArea"
                        value={formFilters.minArea === '' ? '' : formFilters.minArea}
                        onChange={handleNumberChange}
                        placeholder={t('common.any')}
                        min={0}
                        className="buy-filters__input"
                      />
                      <input
                        type="number"
                        name="maxArea"
                        value={formFilters.maxArea === '' ? '' : formFilters.maxArea}
                        onChange={handleNumberChange}
                        placeholder={t('common.any')}
                        min={0}
                        className="buy-filters__input"
                      />
                    </div>
                  </div>

                  <button type="submit" className="buy-filters__submit">
                    <SlidersHorizontal size={18} aria-hidden />
                    <span>{t('buy.applyFilters')}</span>
                  </button>
                </form>
              </div>
            </Reveal>
          </aside>

          <section className="buy-results">
            <Reveal>
              <div className="buy-results__header">
                <p className="buy-results__count">
                  {loading
                    ? t('buy.loading')
                    : t('buy.showingCount', { count: sortedProperties.length })}
                </p>
                <div className="buy-results__sort-wrap">
                  <span className="buy-results__sort-label">{t('buy.sortLabel')}</span>
                  <CustomSelect
                    name="sortBy"
                    id="sort-price"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value)
                      setCurrentPage(1)
                    }}
                    options={[
                      { value: 'low-high', label: t('buy.sortLowHigh') },
                      { value: 'high-low', label: t('buy.sortHighLow') },
                    ]}
                    placeholder={t('buy.sortPlaceholder')}
                    className="buy-results__sort-dropdown"
                  />
                </div>
              </div>
            </Reveal>

            {error && <p className="buy-results__error">{t(error)}</p>}

            {!loading && !error && sortedProperties.length > 0 && (
              <div className="buy-results__grid">
                {paginatedProducts.map((product, i) => (
                  <Reveal key={product.id} delay={i * 70}>
                    <article className="property-card">
                      <div className="property-card__image-wrap">
                        <img
                          src={product.thumbnail || product.image}
                          alt={productDisplayName(product, locale)}
                          className="property-card__image"
                          loading="lazy"
                        />
                        {(product.source === 'sellRequests' || product.tag) && (
                          <span
                            className={`property-card__tag ${
                              product.source === 'sellRequests' ? 'property-card__tag--user' : ''
                            }`}
                          >
                            {product.source === 'sellRequests'
                              ? t('buy.userSubmitted')
                              : product.tag}
                          </span>
                        )}
                      </div>
                      <div className="property-card__body">
                        <h3 className="property-card__title">{productDisplayName(product, locale)}</h3>
                        <p className="property-card__location">
                          <MapPin size={14} aria-hidden />
                          <span>{productLocationDisplay(product, locale)}</span>
                        </p>
                        <p className="property-card__price">${product.price.toLocaleString()}</p>
                        <p className="property-card__meta">
                          {displayPropertyType(product.type)} · {product.area} m²
                        </p>
                        <p className="property-card__description">
                          {productShortDescription(product, locale)}
                        </p>
                        <button
                          type="button"
                          className="property-card__cta"
                          onClick={() => navigate(`/buy/${product.id}`)}
                        >
                          {t('common.viewDetails')}
                        </button>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            )}

            {sortedProperties.length > 0 && (
              <Reveal delay={40}>
                <div className="buy-results__pagination">
                  {Array.from({ length: totalPages }, (_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        type="button"
                        className={`buy-results__page ${
                          page === currentPage ? 'buy-results__page--active' : ''
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>
              </Reveal>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default Buy

