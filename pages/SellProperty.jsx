import { useState, useRef } from 'react'
import {
  CloudUpload,
  Check,
  Save,
  Building2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from 'lucide-react'
import CustomSelect from '../components/CustomSelect'
import NumberStepper from '../components/NumberStepper'
import '../styles/SellProperty.css'

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Land', 'Commercial', 'Other']
const PROPERTY_STATUSES = ['For Sale', 'For Rent', 'Both']
const PAYMENT_OPTIONS = ['Cash', 'Installments', 'Cash or Installments']
const CONTACT_METHODS = ['Email', 'Call', 'Both']

const MAX_IMAGES = 7
const MAX_FILE_SIZE_MB = 10
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

function SellProperty() {
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState({
    propertyTitle: '',
    propertyType: '',
    location: '',
    fullAddress: '',
    propertyStatus: 'For Sale',
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    floorNumber: 0,
    parking: 'Yes',
    furnished: 'Yes',
    yearBuilt: '2024',
    askingPrice: '0',
    paymentOptions: 'Cash',
    priceNegotiable: false,
    description: '',
    fullName: '',
    email: '',
    phone: '',
    preferredContact: 'Call',
    agreeTerms: false,
  })
  const [images, setImages] = useState([])
  const [isDragging, setIsDragging] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleNumberChange = (e) => {
    const { name, value } = e.target
    const num = value === '' ? '' : Math.max(0, parseInt(value, 10) || 0)
    setFormData((prev) => ({ ...prev, [name]: num }))
  }

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) return false
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return false
    return true
  }

  const addImages = (files) => {
    const valid = Array.from(files).filter(validateFile)
    setImages((prev) => {
      const next = [...prev, ...valid].slice(0, MAX_IMAGES)
      return next
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.length) addImages(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleFileSelect = (e) => {
    if (e.target.files?.length) addImages(e.target.files)
    e.target.value = ''
  }

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Property submitted:', { ...formData, images: images.length })
  }

  const handleSaveDraft = (e) => {
    e.preventDefault()
    console.log('Draft saved:', { ...formData, images: images.length })
  }

  return (
    <div className="sell-property-page">
      <section className="sell-property-hero">
        <div className="sell-property-hero__inner">
          <h1 className="sell-property-hero__title">Sell Your Property</h1>
          <p className="sell-property-hero__subtitle">
            List your property and reach serious buyers
          </p>
          <p className="sell-property-hero__desc">
            Complete the form below to submit your property listing. Our team will review your
            submission and publish it to thousands of potential buyers actively searching for
            properties like yours.
          </p>
        </div>
      </section>

      <main className="sell-property-main">
        <div className="sell-property-card">
          <form className="sell-property-form" onSubmit={handleSubmit}>
            {/* Section 1: Property Basic Information */}
            <section className="sell-property-section">
              <h2 className="sell-property-section__title">
                <span className="sell-property-section__badge">1</span>
                Property Basic Information
              </h2>
              <div className="sell-property-form__row sell-property-form__row--full">
                <label className="sell-property-form__label">
                  <span className="sell-property-form__label-line">Property Title<span className="sell-property-form__required">*</span></span>
                  <input
                    type="text"
                    name="propertyTitle"
                    value={formData.propertyTitle}
                    onChange={handleChange}
                    placeholder="e.g., Modern 3BR Apartment in Downtown"
                    className="sell-property-form__input"
                    required
                  />
                </label>
              </div>
              <div className="sell-property-form__row">
                <label className="sell-property-form__label">
                  <span className="sell-property-form__label-line">Property Type<span className="sell-property-form__required">*</span></span>
                  <CustomSelect
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    options={PROPERTY_TYPES}
                    placeholder="Select Property Type"
                    required
                  />
                </label>
                <label className="sell-property-form__label">
                  <span className="sell-property-form__label-line">Location (City / Area)<span className="sell-property-form__required">*</span></span>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Dubai Marina"
                    className="sell-property-form__input"
                    required
                  />
                </label>
              </div>
              <div className="sell-property-form__row sell-property-form__row--full">
                <label className="sell-property-form__label">
                  Full Address
                  <input
                    type="text"
                    name="fullAddress"
                    value={formData.fullAddress}
                    onChange={handleChange}
                    placeholder="Street, Building, Area"
                    className="sell-property-form__input"
                  />
                </label>
              </div>
              <div className="sell-property-form__row">
                <label className="sell-property-form__label">
                  Property Status
                  <CustomSelect
                    name="propertyStatus"
                    value={formData.propertyStatus}
                    onChange={handleChange}
                    options={PROPERTY_STATUSES}
                  />
                </label>
              </div>
            </section>

            {/* Section 2: Property Specifications */}
            <section className="sell-property-section">
              <h2 className="sell-property-section__title">
                <span className="sell-property-section__badge">2</span>
                Property Specifications
              </h2>
              <div className="sell-property-form__grid sell-property-form__grid--specs">
                <label className="sell-property-form__label">
                  <span className="sell-property-form__label-line">Bedrooms<span className="sell-property-form__required">*</span></span>
                  <NumberStepper
                    name="bedrooms"
                    value={formData.bedrooms === '' ? '' : formData.bedrooms}
                    onChange={handleNumberChange}
                    min={0}
                    required
                  />
                </label>
                <label className="sell-property-form__label">
                  <span className="sell-property-form__label-line">Bathrooms<span className="sell-property-form__required">*</span></span>
                  <NumberStepper
                    name="bathrooms"
                    value={formData.bathrooms === '' ? '' : formData.bathrooms}
                    onChange={handleNumberChange}
                    min={0}
                    required
                  />
                </label>
                <label className="sell-property-form__label">
                  <span className="sell-property-form__label-line">Area (sqm)<span className="sell-property-form__required">*</span></span>
                  <NumberStepper
                    name="area"
                    value={formData.area === '' ? '' : formData.area}
                    onChange={handleNumberChange}
                    min={0}
                    required
                  />
                </label>
                <label className="sell-property-form__label">
                  Floor Number
                  <NumberStepper
                    name="floorNumber"
                    value={formData.floorNumber === '' ? '' : formData.floorNumber}
                    onChange={handleNumberChange}
                    min={0}
                  />
                </label>
                <label className="sell-property-form__label">
                  Parking Availability
                  <CustomSelect
                    name="parking"
                    value={formData.parking}
                    onChange={handleChange}
                    options={['Yes', 'No']}
                  />
                </label>
                <label className="sell-property-form__label">
                  Furnished
                  <CustomSelect
                    name="furnished"
                    value={formData.furnished}
                    onChange={handleChange}
                    options={['Yes', 'No']}
                  />
                </label>
                <label className="sell-property-form__label sell-property-form__label--full">
                  Year Built
                  <NumberStepper
                    name="yearBuilt"
                    value={formData.yearBuilt}
                    onChange={handleChange}
                    min={1900}
                    max={2100}
                  />
                </label>
              </div>
            </section>

            {/* Section 3: Pricing */}
            <section className="sell-property-section">
              <h2 className="sell-property-section__title">
                <span className="sell-property-section__badge">3</span>
                Pricing
              </h2>
              <div className="sell-property-form__row">
                <label className="sell-property-form__label">
                  <span className="sell-property-form__label-line">Asking Price<span className="sell-property-form__required">*</span></span>
                  <div className="sell-property-form__price-wrap">
                    <span className="sell-property-form__price-prefix">$</span>
                    <input
                      type="text"
                      name="askingPrice"
                      value={formData.askingPrice}
                      onChange={handleChange}
                      className="sell-property-form__input sell-property-form__input--price"
                      required
                    />
                  </div>
                </label>
                <label className="sell-property-form__label">
                  Payment Options
                  <CustomSelect
                    name="paymentOptions"
                    value={formData.paymentOptions}
                    onChange={handleChange}
                    options={PAYMENT_OPTIONS}
                  />
                </label>
              </div>
              <div className="sell-property-form__row sell-property-form__row--toggle">
                <span className="sell-property-form__label-text">Price Negotiable</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.priceNegotiable}
                  className={`sell-property-toggle ${formData.priceNegotiable ? 'sell-property-toggle--on' : ''}`}
                  onClick={() => setFormData((p) => ({ ...p, priceNegotiable: !p.priceNegotiable }))}
                >
                  <span className="sell-property-toggle__track" />
                  <span className="sell-property-toggle__thumb" />
                </button>
              </div>
            </section>

            {/* Section 4: Property Description */}
            <section className="sell-property-section">
              <h2 className="sell-property-section__title">
                <span className="sell-property-section__badge">4</span>
                Property Description
              </h2>
              <label className="sell-property-form__label sell-property-form__label--desc sell-property-form__row--full">
                Describe Your Property
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide detailed information about your property, including key features, amenities, nearby facilities, and any unique selling points..."
                  className="sell-property-form__textarea"
                  rows={5}
                />
              </label>
            </section>

            {/* Section 5: Property Images */}
            <section className="sell-property-section">
              <h2 className="sell-property-section__title">
                <span className="sell-property-section__badge">5</span>
                Property Images
              </h2>
              <div
                className={`sell-property-upload ${isDragging ? 'sell-property-upload--dragging' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpeg,.jpg,.png,image/jpeg,image/jpg,image/png"
                  multiple
                  onChange={handleFileSelect}
                  className="sell-property-upload__input"
                  aria-label="Upload property images"
                />
                <CloudUpload size={48} className="sell-property-upload__icon" aria-hidden />
                <p className="sell-property-upload__text">Drag & Drop Images Here</p>
                <p className="sell-property-upload__sub">or click to browse from your device</p>
                <button
                  type="button"
                  className="sell-property-upload__btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                >
                  <CloudUpload size={18} aria-hidden />
                  Upload Images
                </button>
              </div>
              <p className="sell-property-upload__hint">
                Supported formats: JPG, PNG | Max file size: 5MB per image
              </p>
              {images.length > 0 && (
                <div className="sell-property-previews">
                  {images.map((file, i) => (
                    <div key={i} className="sell-property-preview">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${i + 1}`}
                        className="sell-property-preview__img"
                      />
                      <button
                        type="button"
                        className="sell-property-preview__remove"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeImage(i)
                        }}
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Section 6: Contact Information */}
            <section className="sell-property-section">
              <h2 className="sell-property-section__title">
                <span className="sell-property-section__badge">6</span>
                Contact Information
              </h2>
              <div className="sell-property-form__row">
                <label className="sell-property-form__label">
                  <span className="sell-property-form__label-line">Full Name<span className="sell-property-form__required">*</span></span>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="sell-property-form__input"
                    required
                  />
                </label>
                <label className="sell-property-form__label">
                  <span className="sell-property-form__label-line">Email<span className="sell-property-form__required">*</span></span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="sell-property-form__input"
                    required
                  />
                </label>
              </div>
              <div className="sell-property-form__row">
                <label className="sell-property-form__label">
                  <span className="sell-property-form__label-line">Phone Number<span className="sell-property-form__required">*</span></span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+971 50 123 4567"
                    className="sell-property-form__input"
                    required
                  />
                </label>
                <label className="sell-property-form__label">
                  Preferred Contact Method
                  <CustomSelect
                    name="preferredContact"
                    value={formData.preferredContact}
                    onChange={handleChange}
                    options={CONTACT_METHODS}
                  />
                </label>
              </div>
              <label className="sell-property-form__checkbox-wrap">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="sell-property-form__checkbox"
                />
                <span className="sell-property-form__checkbox-label">
                  <span className="sell-property-form__checkbox-line">I agree to the <a href="#terms" className="sell-property-form__terms-link">Terms & Conditions</a></span>
                  <span className="sell-property-form__checkbox-sub">and confirm that all information provided is accurate and complete.</span>
                </span>
              </label>
            </section>

            <div className="sell-property-form__actions">
              <button type="submit" className="sell-property-form__submit">
                <Check size={20} aria-hidden />
                Submit Property
              </button>
              <button type="button" className="sell-property-form__draft" onClick={handleSaveDraft}>
                <Save size={18} aria-hidden />
                Save as draft
              </button>
            </div>
          </form>
        </div>
      </main>

    </div>
  )
}

export default SellProperty
