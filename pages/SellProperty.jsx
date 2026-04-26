import { useState, useRef, useMemo } from 'react'
import { CloudUpload, Check, Save } from 'lucide-react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { jsPDF } from 'jspdf'
import CustomSelect from '../components/CustomSelect'
import NumberStepper from '../components/NumberStepper'
import Reveal from '../components/Reveal'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'
import '../styles/SellProperty.css'

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Land', 'Commercial', 'Other']
const PROPERTY_STATUSES = ['For Sale', 'For Rent', 'Both']
const PAYMENT_OPTIONS = ['Cash', 'Installments', 'Cash or Installments']
const CONTACT_METHODS = ['Email', 'Call', 'Both']

const MAX_IMAGES = 7
const MAX_FILE_SIZE_MB = 10
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
const SELL_REQUESTS_LOCAL_KEY = 'sellRequestsLocal'

function getSubmitErrorMessage(error) {
  const message = error?.message ?? ''
  if (message.toLowerCase().includes('quota')) {
    return 'Local storage is full. Please remove old requests or use fewer images.'
  }
  return 'Unable to send your request right now. Please try again.'
}

function readLocalSellRequests() {
  try {
    const raw = localStorage.getItem(SELL_REQUESTS_LOCAL_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveLocalSellRequests(requests) {
  localStorage.setItem(SELL_REQUESTS_LOCAL_KEY, JSON.stringify(requests))
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read image file.'))
    reader.readAsDataURL(file)
  })
}

const INITIAL_FORM_DATA = {
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
}

function SellProperty() {
  const { t, tSegments } = useLanguage()
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const propertyTypeOptions = useMemo(
    () =>
      PROPERTY_TYPES.map((v) => ({
        value: v,
        label: t(`sell.types.${v}`),
      })),
    [t],
  )

  const propertyStatusOptions = useMemo(
    () =>
      PROPERTY_STATUSES.map((v) => ({
        value: v,
        label: tSegments(['sell', 'status', v]),
      })),
    [tSegments],
  )

  const paymentSelectOptions = useMemo(
    () =>
      PAYMENT_OPTIONS.map((v) => ({
        value: v,
        label: tSegments(['sell', 'payment', v]),
      })),
    [tSegments],
  )

  const contactSelectOptions = useMemo(
    () =>
      CONTACT_METHODS.map((v) => ({
        value: v,
        label: tSegments(['sell', 'contact', v]),
      })),
    [tSegments],
  )

  const yesNoOptions = useMemo(
    () => [
      { value: 'Yes', label: t('common.yes') },
      { value: 'No', label: t('common.no') },
    ],
    [t],
  )

  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  const [images, setImages] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitState, setSubmitState] = useState({ type: '', message: '' })

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitState({ type: '', message: '' })
    try {
      setSubmitState({
        type: 'progress',
        message: images.length ? 'Preparing images...' : 'Saving request...',
      })
      const imageUrls = await Promise.all(images.map((file) => fileToDataUrl(file)))
      const localRecord = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ...formData,
        imagesCount: imageUrls.length,
        imageUrls,
        createdAt: new Date().toISOString(),
        source: 'local',
        userId: user?.uid ?? null,
        userEmail: user?.email ?? null,
      }
      const existing = readLocalSellRequests()
      saveLocalSellRequests([localRecord, ...existing])

      let cloudSaved = false
      const cloudPayload = {
        ...formData,
        imagesCount: imageUrls.length,
        createdAt: serverTimestamp(),
        userId: user?.uid ?? null,
        userEmail: user?.email ?? null,
        localId: localRecord.id,
      }
      const legacyPayload = {
        ...formData,
        'Property Title': formData.propertyTitle,
        'Property Type': formData.propertyType,
        Location: formData.location,
        'Asking Price': formData.askingPrice,
        'Full Name': formData.fullName,
        Phone: formData.phone,
        Email: formData.email,
        imagesCount: imageUrls.length,
        createdAt: serverTimestamp(),
        localId: localRecord.id,
      }
      const attempts = [
        { collectionName: 'sell', payload: legacyPayload },
        { collectionName: 'sellRequests', payload: cloudPayload },
      ]
      for (const attempt of attempts) {
        try {
          await addDoc(collection(db, attempt.collectionName), attempt.payload)
          cloudSaved = true
          break
        } catch {
          // Keep trying next compatible collection name.
        }
      }

      setFormData(INITIAL_FORM_DATA)
      setImages([])
      setSubmitState({
        type: 'success',
        message: cloudSaved
          ? 'Property request submitted to database and saved locally.'
          : 'Saved locally. Database save failed, but your data is kept on this device.',
      })
    } catch (error) {
      console.error('Failed to submit sell request:', error)
      setSubmitState({
        type: 'error',
        message: getSubmitErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = (e) => {
    e.preventDefault()
    const doc = new jsPDF()
    const generatedAt = new Date().toLocaleString()
    const safeTitle = (formData.propertyTitle || 'sell-property-draft').trim().replace(/[\\/:*?"<>|]/g, '-')
    const fileName = `${safeTitle || 'sell-property-draft'}.pdf`
    const lines = [
      'Sell Property Draft',
      `Generated at: ${generatedAt}`,
      '',
      'Property Information',
      `- Property title: ${formData.propertyTitle || '-'}`,
      `- Property type: ${formData.propertyType || '-'}`,
      `- Location: ${formData.location || '-'}`,
      `- Full address: ${formData.fullAddress || '-'}`,
      `- Property status: ${formData.propertyStatus || '-'}`,
      '',
      'Property Specifications',
      `- Bedrooms: ${formData.bedrooms}`,
      `- Bathrooms: ${formData.bathrooms}`,
      `- Area (sqm): ${formData.area}`,
      `- Floor number: ${formData.floorNumber}`,
      `- Parking: ${formData.parking || '-'}`,
      `- Furnished: ${formData.furnished || '-'}`,
      `- Year built: ${formData.yearBuilt || '-'}`,
      '',
      'Price Details',
      `- Asking price: ${formData.askingPrice || '-'}`,
      `- Payment options: ${formData.paymentOptions || '-'}`,
      `- Price negotiable: ${formData.priceNegotiable ? 'Yes' : 'No'}`,
      '',
      'Listing Description',
      `- Description: ${formData.description || '-'}`,
      `- Uploaded images: ${images.length}`,
      '',
      'Owner Contact',
      `- Full name: ${formData.fullName || '-'}`,
      `- Email: ${formData.email || '-'}`,
      `- Phone: ${formData.phone || '-'}`,
      `- Preferred contact method: ${formData.preferredContact || '-'}`,
      `- Agreed to terms: ${formData.agreeTerms ? 'Yes' : 'No'}`,
    ]

    doc.setFontSize(12)
    doc.text(lines, 14, 18, { maxWidth: 182, lineHeightFactor: 1.4 })
    doc.save(fileName)
    setSubmitState({
      type: 'success',
      message: 'Draft saved and downloaded as PDF.',
    })
  }

  return (
    <div className="sell-property-page">
      <section className="sell-property-hero">
        <Reveal>
          <div className="sell-property-hero__inner">
            <h1 className="sell-property-hero__title">{t('sell.heroTitle')}</h1>
            <p className="sell-property-hero__subtitle">{t('sell.heroSubtitle')}</p>
            <p className="sell-property-hero__desc">{t('sell.heroDesc')}</p>
          </div>
        </Reveal>
      </section>

      <main className="sell-property-main">
        <div className="sell-property-card">
          <form className="sell-property-form" onSubmit={handleSubmit}>
            <Reveal delay={0}>
              <section className="sell-property-section">
                <h2 className="sell-property-section__title">
                  <span className="sell-property-section__badge">1</span>
                  {t('sell.section1')}
                </h2>
                <div className="sell-property-form__row sell-property-form__row--full">
                  <label className="sell-property-form__label">
                    <span className="sell-property-form__label-line">
                      {t('sell.propertyTitle')}
                      <span className="sell-property-form__required">*</span>
                    </span>
                    <input
                      type="text"
                      name="propertyTitle"
                      value={formData.propertyTitle}
                      onChange={handleChange}
                      placeholder={t('sell.placeholders.propertyTitle')}
                      className="sell-property-form__input"
                      required
                    />
                  </label>
                </div>
                <div className="sell-property-form__row">
                  <label className="sell-property-form__label">
                    <span className="sell-property-form__label-line">
                      {t('sell.propertyType')}
                      <span className="sell-property-form__required">*</span>
                    </span>
                    <CustomSelect
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                      options={propertyTypeOptions}
                      placeholder={t('sell.placeholders.selectPropertyType')}
                      required
                    />
                  </label>
                  <label className="sell-property-form__label">
                    <span className="sell-property-form__label-line">
                      {t('sell.locationCity')}
                      <span className="sell-property-form__required">*</span>
                    </span>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder={t('sell.placeholders.location')}
                      className="sell-property-form__input"
                      required
                    />
                  </label>
                </div>
                <div className="sell-property-form__row sell-property-form__row--full">
                  <label className="sell-property-form__label">
                    {t('sell.fullAddress')}
                    <input
                      type="text"
                      name="fullAddress"
                      value={formData.fullAddress}
                      onChange={handleChange}
                      placeholder={t('sell.placeholders.address')}
                      className="sell-property-form__input"
                    />
                  </label>
                </div>
                <div className="sell-property-form__row">
                  <label className="sell-property-form__label">
                    {t('sell.propertyStatus')}
                    <CustomSelect
                      name="propertyStatus"
                      value={formData.propertyStatus}
                      onChange={handleChange}
                      options={propertyStatusOptions}
                    />
                  </label>
                </div>
              </section>
            </Reveal>

            <Reveal delay={55}>
              <section className="sell-property-section">
                <h2 className="sell-property-section__title">
                  <span className="sell-property-section__badge">2</span>
                  {t('sell.section2')}
                </h2>
                <div className="sell-property-form__grid sell-property-form__grid--specs">
                  <label className="sell-property-form__label">
                    <span className="sell-property-form__label-line">
                      {t('sell.bedrooms')}
                      <span className="sell-property-form__required">*</span>
                    </span>
                    <NumberStepper
                      name="bedrooms"
                      value={formData.bedrooms === '' ? '' : formData.bedrooms}
                      onChange={handleNumberChange}
                      min={0}
                      required
                    />
                  </label>
                  <label className="sell-property-form__label">
                    <span className="sell-property-form__label-line">
                      {t('sell.bathrooms')}
                      <span className="sell-property-form__required">*</span>
                    </span>
                    <NumberStepper
                      name="bathrooms"
                      value={formData.bathrooms === '' ? '' : formData.bathrooms}
                      onChange={handleNumberChange}
                      min={0}
                      required
                    />
                  </label>
                  <label className="sell-property-form__label">
                    <span className="sell-property-form__label-line">
                      {t('sell.areaSqm')}
                      <span className="sell-property-form__required">*</span>
                    </span>
                    <NumberStepper
                      name="area"
                      value={formData.area === '' ? '' : formData.area}
                      onChange={handleNumberChange}
                      min={0}
                      required
                    />
                  </label>
                  <label className="sell-property-form__label">
                    {t('sell.floorNumber')}
                    <NumberStepper
                      name="floorNumber"
                      value={formData.floorNumber === '' ? '' : formData.floorNumber}
                      onChange={handleNumberChange}
                      min={0}
                    />
                  </label>
                  <label className="sell-property-form__label">
                    {t('sell.parkingAvailability')}
                    <CustomSelect
                      name="parking"
                      value={formData.parking}
                      onChange={handleChange}
                      options={yesNoOptions}
                    />
                  </label>
                  <label className="sell-property-form__label">
                    {t('sell.furnished')}
                    <CustomSelect
                      name="furnished"
                      value={formData.furnished}
                      onChange={handleChange}
                      options={yesNoOptions}
                    />
                  </label>
                  <label className="sell-property-form__label sell-property-form__label--full">
                    {t('sell.yearBuilt')}
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
            </Reveal>

            <Reveal delay={110}>
              <section className="sell-property-section">
                <h2 className="sell-property-section__title">
                  <span className="sell-property-section__badge">3</span>
                  {t('sell.section3')}
                </h2>
                <div className="sell-property-form__row">
                  <label className="sell-property-form__label">
                    <span className="sell-property-form__label-line">
                      {t('sell.askingPrice')}
                      <span className="sell-property-form__required">*</span>
                    </span>
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
                    {t('sell.paymentOptions')}
                    <CustomSelect
                      name="paymentOptions"
                      value={formData.paymentOptions}
                      onChange={handleChange}
                      options={paymentSelectOptions}
                    />
                  </label>
                </div>
                <div className="sell-property-form__row sell-property-form__row--toggle">
                  <span className="sell-property-form__label-text">{t('sell.priceNegotiable')}</span>
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
            </Reveal>

            <Reveal delay={165}>
              <section className="sell-property-section">
                <h2 className="sell-property-section__title">
                  <span className="sell-property-section__badge">4</span>
                  {t('sell.section4')}
                </h2>
                <label className="sell-property-form__label sell-property-form__label--desc sell-property-form__row--full">
                  {t('sell.describeProperty')}
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={t('sell.placeholders.description')}
                    className="sell-property-form__textarea"
                    rows={5}
                  />
                </label>
              </section>
            </Reveal>

            <Reveal delay={220}>
              <section className="sell-property-section">
                <h2 className="sell-property-section__title">
                  <span className="sell-property-section__badge">5</span>
                  {t('sell.section5')}
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
                    aria-label={t('sell.uploadAria')}
                  />
                  <CloudUpload size={48} className="sell-property-upload__icon" aria-hidden />
                  <p className="sell-property-upload__text">{t('sell.uploadDrop')}</p>
                  <p className="sell-property-upload__sub">{t('sell.uploadSub')}</p>
                  <button
                    type="button"
                    className="sell-property-upload__btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      fileInputRef.current?.click()
                    }}
                  >
                    <CloudUpload size={18} aria-hidden />
                    {t('sell.uploadBtn')}
                  </button>
                </div>
                <p className="sell-property-upload__hint">{t('sell.uploadHint')}</p>
                {images.length > 0 && (
                  <div className="sell-property-previews">
                    {images.map((file, i) => (
                      <div key={i} className="sell-property-preview">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={t('sell.previewAlt', { n: i + 1 })}
                          className="sell-property-preview__img"
                        />
                        <button
                          type="button"
                          className="sell-property-preview__remove"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeImage(i)
                          }}
                          aria-label={t('sell.removeImage')}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </Reveal>

            <Reveal delay={275}>
              <section className="sell-property-section">
                <h2 className="sell-property-section__title">
                  <span className="sell-property-section__badge">6</span>
                  {t('sell.section6')}
                </h2>
                <div className="sell-property-form__row">
                  <label className="sell-property-form__label">
                    <span className="sell-property-form__label-line">
                      {t('sell.fullName')}
                      <span className="sell-property-form__required">*</span>
                    </span>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder={t('sell.placeholders.fullName')}
                      className="sell-property-form__input"
                      required
                    />
                  </label>
                  <label className="sell-property-form__label">
                    <span className="sell-property-form__label-line">
                      {t('sell.email')}
                      <span className="sell-property-form__required">*</span>
                    </span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('sell.placeholders.email')}
                      className="sell-property-form__input"
                      required
                    />
                  </label>
                </div>
                <div className="sell-property-form__row">
                  <label className="sell-property-form__label">
                    <span className="sell-property-form__label-line">
                      {t('sell.phone')}
                      <span className="sell-property-form__required">*</span>
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t('sell.placeholders.phone')}
                      className="sell-property-form__input"
                      required
                    />
                  </label>
                  <label className="sell-property-form__label">
                    {t('sell.preferredContact')}
                    <CustomSelect
                      name="preferredContact"
                      value={formData.preferredContact}
                      onChange={handleChange}
                      options={contactSelectOptions}
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
                    <span className="sell-property-form__checkbox-line">
                      {t('sell.agreeTermsLine')}
                      <a href="#terms" className="sell-property-form__terms-link">
                        {t('sell.termsLink')}
                      </a>
                    </span>
                    <span className="sell-property-form__checkbox-sub">{t('sell.agreeTermsSub')}</span>
                  </span>
                </label>
              </section>
            </Reveal>

            <Reveal delay={320}>
              <div className="sell-property-form__actions">
                <button type="submit" className="sell-property-form__submit" disabled={isSubmitting}>
                  <Check size={20} aria-hidden />
                  {isSubmitting ? 'Submitting...' : t('sell.submitProperty')}
                </button>
                <button type="button" className="sell-property-form__draft" onClick={handleSaveDraft}>
                  <Save size={18} aria-hidden />
                  {t('sell.saveDraft')}
                </button>
              </div>
              {submitState.message ? (
                <p
                  className="sell-property-upload__hint"
                  style={{
                    marginTop: '12px',
                    color: submitState.type === 'error' ? '#dc2626' : '#15803d',
                  }}
                  role="status"
                >
                  {submitState.message}
                </p>
              ) : null}
            </Reveal>
          </form>
        </div>
      </main>
    </div>
  )
}

export default SellProperty
