import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MapPin, ArrowLeft } from 'lucide-react'
import { fetchProperties } from '../data/properties'
import '../styles/PropertyDetail.css'

function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const list = await fetchProperties()
        if (!cancelled) {
          setProperties(list)
        }
      } catch (err) {
        if (!cancelled) {
          setError('Unable to load property. Please go back and try again.')
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

  const property = useMemo(
    () => properties.find((p) => String(p.id) === String(id)),
    [id, properties]
  )

  if (loading) {
    return (
      <div className="property-detail-page">
        <button type="button" className="property-detail__back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} aria-hidden />
          <span>Back</span>
        </button>
        <p>Loading property...</p>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="property-detail-page">
        <button type="button" className="property-detail__back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} aria-hidden />
          <span>Back</span>
        </button>
        <div className="property-detail__not-found">
          <h1>Property not found</h1>
          <p>The property you are looking for does not exist or may have been removed.</p>
          <button type="button" className="property-detail__primary" onClick={() => navigate('/buy')}>
            Browse Properties
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="property-detail-page">
      <button type="button" className="property-detail__back" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} aria-hidden />
        <span>Back to results</span>
      </button>

      <div className="property-detail__header">
        <div>
          <p className="property-detail__eyebrow">{property.type}</p>
          <h1 className="property-detail__title">{property.title}</h1>
          <p className="property-detail__location">
            <MapPin size={16} aria-hidden />
            <span>{property.location}</span>
          </p>
        </div>
        <div className="property-detail__price-card">
          <p className="property-detail__price">${property.price.toLocaleString()}</p>
          <p className="property-detail__area">{property.area} m² total area</p>
          <button
            type="button"
            className="property-detail__primary"
            onClick={() => navigate('/investment')}
          >
            Request Details
          </button>
        </div>
      </div>

      <div className="property-detail__layout">
        <div className="property-detail__media">
          <div className="property-detail__image-wrap">
            <img
              src={property.image}
              alt={property.title}
              className="property-detail__image"
              loading="lazy"
            />
            <span className="property-detail__tag">{property.tag}</span>
          </div>
        </div>

        <aside className="property-detail__sidebar">
          <div className="property-detail__stats">
            <div className="property-detail__stat-item">
              <span className="property-detail__stat-label">Bedrooms</span>
              <span className="property-detail__stat-value">{property.bedrooms}</span>
            </div>
            <div className="property-detail__stat-item">
              <span className="property-detail__stat-label">Bathrooms</span>
              <span className="property-detail__stat-value">{property.bathrooms}</span>
            </div>
            <div className="property-detail__stat-item">
              <span className="property-detail__stat-label">Parking</span>
              <span className="property-detail__stat-value">{property.parking}</span>
            </div>
            <div className="property-detail__stat-item">
              <span className="property-detail__stat-label">Area</span>
              <span className="property-detail__stat-value">{property.area} m²</span>
            </div>
          </div>

          <div className="property-detail__highlights">
            <h2>Highlights</h2>
            <ul>
              {property.highlights?.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <section className="property-detail__section">
        <h2>About this property</h2>
        <p>{property.description}</p>
      </section>
    </div>
  )
}

export default PropertyDetail

