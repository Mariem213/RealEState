import { useEffect, useMemo, useState } from 'react'
import { MapPin, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CustomSelect from '../components/CustomSelect'
import '../styles/Buy.css'
import { ALL_LOCATIONS } from '../data/properties'
import { fetchProducts } from '../data/products'

const PROPERTY_TYPE_OPTIONS = ['Apartment', 'Villa', 'Studio']

const PRICE_SLIDER_MIN = 0
const PRICE_SLIDER_MAX = 3000000
const PRICE_SLIDER_STEP = 50000

const PRICE_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 100000, label: '$100,000' },
  { value: 200000, label: '$200,000' },
  { value: 500000, label: '$500,000' },
  { value: 750000, label: '$750,000' },
  { value: 1000000, label: '$1,000,000' },
  { value: 1500000, label: '$1,500,000' },
  { value: 2000000, label: '$2,000,000' },
  { value: 3000000, label: '$3,000,000' },
]

const initialFilterState = {
  location: 'All Locations',
  propertyTypes: [],
  minPrice: '',
  maxPrice: '',
  minArea: '',
  maxArea: '',
}

function Buy() {
  const [formFilters, setFormFilters] = useState(initialFilterState)
  const [appliedFilters, setAppliedFilters] = useState(initialFilterState)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('low-high')
  const pageSize = 6
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const list = await fetchProducts()
        if (!cancelled) {
          setProducts(list)
        }
      } catch (error) {
        if (!cancelled) {
          setError('Unable to load properties. Please try again later.')
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
      const newMax = prev.maxPrice === '' ? '' : (prev.maxPrice < clamped ? clamped : prev.maxPrice)
      return { ...prev, minPrice: newMin, maxPrice: newMax }
    })
  }

  const handlePriceSliderMax = (e) => {
    const value = Number(e.target.value)
    const minVal = formFilters.minPrice === '' ? PRICE_SLIDER_MIN : formFilters.minPrice
    const clamped = Math.max(value, minVal)
    setFormFilters((prev) => {
      const newMax = clamped === PRICE_SLIDER_MAX ? '' : clamped
      const newMin = prev.minPrice === '' ? '' : (prev.minPrice > clamped ? clamped : prev.minPrice)
      return { ...prev, minPrice: newMin, maxPrice: newMax }
    })
  }

  const handlePropertyTypeChange = (type) => {
    setFormFilters((prev) => {
      const next = prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter((t) => t !== type)
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
      if (appliedFilters.location !== 'All Locations' && product.location !== appliedFilters.location) {
        return false
      }

      if (appliedFilters.propertyTypes.length > 0 && !appliedFilters.propertyTypes.includes(product.type)) {
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

  return (
    <div className="buy-page">
      <div className="buy-page__header">
        <div className="buy-page__header-inner">
          <div>
            {/* <p className="buy-page__eyebrow">Buy</p> */}
            <h1 className="buy-page__title">Buy Properties</h1>
            <p className="buy-page__subtitle">
              Find your ideal property from verified listings
            </p>
          </div>
          {/* <div className="buy-page__badge">
            <MapPin size={18} aria-hidden />
            <span>Property Listings</span>
          </div> */}
        </div>
      </div>

      <div className="buy-page__content">
        <div className="buy-page__layout">
          <aside className="buy-filters">
            <div className="buy-filters__header">
              <h2 className="buy-filters__title">Filters</h2>
              <button type="button" className="buy-filters__reset" onClick={handleReset}>
                Reset
              </button>
            </div>

            <form className="buy-filters__form" onSubmit={handleSubmit}>
              <div className="buy-filters__group">
                <label htmlFor="location" className="buy-filters__label">
                  Location
                </label>
                <CustomSelect
                  id="location"
                  name="location"
                  value={formFilters.location}
                  onChange={handleSelectChange}
                  options={ALL_LOCATIONS}
                  placeholder="All Locations"
                />
              </div>

              <div className="buy-filters__group">
                <label className="buy-filters__label">Property Type</label>
                <div className="buy-filters__checkboxes">
                  {PROPERTY_TYPE_OPTIONS.map((type) => (
                    <label key={type} className="buy-filters__checkbox-wrap">
                      <input
                        type="checkbox"
                        checked={formFilters.propertyTypes.includes(type)}
                        onChange={() => handlePropertyTypeChange(type)}
                        className="buy-filters__checkbox"
                      />
                      <span className="buy-filters__checkbox-label">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="buy-filters__group">
                <label className="buy-filters__label">Price Range</label>
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
                    aria-label="Minimum price"
                  />
                  <input
                    type="range"
                    min={PRICE_SLIDER_MIN}
                    max={PRICE_SLIDER_MAX}
                    step={PRICE_SLIDER_STEP}
                    value={priceSliderMax}
                    onChange={handlePriceSliderMax}
                    className="buy-filters__slider buy-filters__slider--max"
                    aria-label="Maximum price"
                  />
                </div>
                <div className="buy-filters__range buy-filters__range--two">
                  <CustomSelect
                    name="minPrice"
                    value={formFilters.minPrice === '' ? '' : String(formFilters.minPrice)}
                    onChange={handleSelectChange}
                    options={PRICE_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
                    placeholder="Any"
                    className="buy-filters__price-select"
                  />
                  <CustomSelect
                    name="maxPrice"
                    value={formFilters.maxPrice === '' ? '' : String(formFilters.maxPrice)}
                    onChange={handleSelectChange}
                    options={PRICE_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
                    placeholder="Any"
                    className="buy-filters__price-select"
                  />
                </div>
              </div>

              <div className="buy-filters__group">
                <label className="buy-filters__label">Area (sqm)</label>
                <div className="buy-filters__range buy-filters__range--two">
                  <input
                    type="number"
                    name="minArea"
                    value={formFilters.minArea === '' ? '' : formFilters.minArea}
                    onChange={handleNumberChange}
                    placeholder="Any"
                    min={0}
                    className="buy-filters__input"
                  />
                  <input
                    type="number"
                    name="maxArea"
                    value={formFilters.maxArea === '' ? '' : formFilters.maxArea}
                    onChange={handleNumberChange}
                    placeholder="Any"
                    min={0}
                    className="buy-filters__input"
                  />
                </div>
              </div>

              <button type="submit" className="buy-filters__submit">
                <SlidersHorizontal size={18} aria-hidden />
                <span>Apply Filters</span>
              </button>
            </form>
          </aside>

          <section className="buy-results">
            <div className="buy-results__header">
              <p className="buy-results__count">
                {loading
                  ? 'Loading properties...'
                  : `Showing ${sortedProperties.length} properties`}
              </p>
              <div className="buy-results__sort-wrap">
                <span className="buy-results__sort-label">Sort by price</span>
                <CustomSelect
                  name="sortBy"
                  id="sort-price"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value)
                    setCurrentPage(1)
                  }}
                  options={[
                    { value: 'low-high', label: 'Low to High' },
                    { value: 'high-low', label: 'High to Low' },
                  ]}
                  placeholder="Choose order"
                  className="buy-results__sort-dropdown"
                />
              </div>
            </div>

            {error && <p className="buy-results__error">{error}</p>}

            {!loading && !error && sortedProperties.length > 0 && (
              <div className="buy-results__grid">
                {paginatedProducts.map((product) => (
                  <article key={product.id} className="property-card">
                    <div className="property-card__image-wrap">
                      <img
                        src={product.thumbnail || product.image}
                        alt={product.name || product.title}
                        className="property-card__image"
                        loading="lazy"
                      />
                      {product.tag && <span className="property-card__tag">{product.tag}</span>}
                    </div>
                    <div className="property-card__body">
                      <h3 className="property-card__title">{product.name || product.title}</h3>
                      <p className="property-card__location">
                        <MapPin size={14} aria-hidden />
                        <span>{product.location}</span>
                      </p>
                      <p className="property-card__price">
                        ${product.price.toLocaleString()}
                      </p>
                      <p className="property-card__meta">
                        {product.type} · {product.area} m²
                      </p>
                      <p className="property-card__description">
                        {product.shortDescription || product.description}
                      </p>
                      <button
                        type="button"
                        className="property-card__cta"
                        onClick={() => navigate(`/buy/${product.propertyId ?? product.id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {sortedProperties.length > 0 && (
              <div className="buy-results__pagination">
                {Array.from({ length: totalPages }, (_, i) => {
                  const page = i + 1
                  return (
                    <button
                      key={page}
                      type="button"
                      className={`buy-results__page ${page === currentPage ? 'buy-results__page--active' : ''
                        }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default Buy

