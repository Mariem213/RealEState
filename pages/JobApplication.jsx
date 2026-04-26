import { useState } from 'react'
import { Briefcase, User, Send } from 'lucide-react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import Reveal from '../components/Reveal'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'
import '../styles/JobApplication.css'

function getSubmitErrorMessage(error) {
  const code = error?.code ?? ''
  if (code === 'permission-denied') {
    return 'You do not have permission to submit this request right now. Please contact support.'
  }
  if (code === 'unavailable' || code === 'deadline-exceeded') {
    return 'Network issue while sending your request. Please check your connection and try again.'
  }
  return 'Unable to send your request right now. Please try again.'
}

function JobApplication() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    tel: '',
    email: '',
    address: '',
    pincode: '',
    cv: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitState, setSubmitState] = useState({ type: '', message: '' })

  const handleChange = (e) => {
    const { name, value, type, files } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'file' ? (files?.[0] ?? null) : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitState({ type: '', message: '' })
    try {
      const modernPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company,
        tel: formData.tel,
        email: formData.email,
        address: formData.address,
        pincode: formData.pincode,
        cvName: formData.cv?.name ?? '',
        createdAt: serverTimestamp(),
        userId: user?.uid ?? null,
        userEmail: user?.email ?? null,
      }

      const modernPayloadNoUser = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company,
        tel: formData.tel,
        email: formData.email,
        address: formData.address,
        pincode: formData.pincode,
        cvName: formData.cv?.name ?? '',
        createdAt: serverTimestamp(),
      }

      const legacyPayload = {
        'First Name': formData.firstName,
        'Last Name': formData.lastName,
        Company: formData.company,
        Tel: formData.tel,
        Email: formData.email,
        Address: formData.address,
        Pincode: formData.pincode,
        CV: formData.cv?.name ?? '',
        createdAt: serverTimestamp(),
      }

      const legacyPayloadNoTimestamp = {
        ...legacyPayload,
      }
      delete legacyPayloadNoTimestamp.createdAt

      const attempts = [
        { collectionName: 'jobs', payload: legacyPayload },
        { collectionName: 'jobApplications', payload: modernPayload },
        { collectionName: 'jobs', payload: legacyPayloadNoTimestamp },
        { collectionName: 'jobApplications', payload: modernPayloadNoUser },
      ]

      let writeError = new Error('Unknown write failure')
      for (const attempt of attempts) {
        try {
          await addDoc(collection(db, attempt.collectionName), attempt.payload)
          writeError = null
          break
        } catch (error) {
          writeError = error
        }
      }

      if (writeError) {
        throw writeError
      }

      setFormData({
        firstName: '',
        lastName: '',
        company: '',
        tel: '',
        email: '',
        address: '',
        pincode: '',
        cv: null,
      })
      setSubmitState({
        type: 'success',
        message: 'Job application submitted successfully.',
      })
    } catch (error) {
      console.error('Failed to submit job application:', error)
      setSubmitState({
        type: 'error',
        message: getSubmitErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="job-application-page">
      <main className="job-application-main">
        <Reveal>
          <div className="job-application-header">
            <div className="job-application-header__icon">
              <Briefcase size={40} aria-hidden />
            </div>
            <h1 className="job-application-header__title">{t('job.title')}</h1>
            <p className="job-application-header__desc">{t('job.intro')}</p>
          </div>
        </Reveal>

        <div className="job-application-card">
          <Reveal>
            <div className="job-application-card__header">
              <h2 className="job-application-card__header-title">{t('job.sectionTitle')}</h2>
              <p className="job-application-card__header-sub">{t('common.requiredFieldsHint')}</p>
            </div>
          </Reveal>

          <form className="job-application-form" onSubmit={handleSubmit}>
            <Reveal delay={80}>
              <section className="job-application-section">
                <h3 className="job-application-section__title">
                  <User size={20} aria-hidden />
                  {t('job.personalInfo')}
                </h3>

                <div className="job-application-form__row">
                  <label className="job-application-form__label">
                    {t('job.firstName')} <span className="job-application-form__required">*</span>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder={t('job.placeholders.firstName')}
                      className="job-application-form__input"
                      required
                    />
                  </label>
                  <label className="job-application-form__label">
                    {t('job.lastName')} <span className="job-application-form__required">*</span>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder={t('job.placeholders.lastName')}
                      className="job-application-form__input"
                      required
                    />
                  </label>
                </div>

                <div className="job-application-form__row job-application-form__row--full">
                  <label className="job-application-form__label">
                    {t('job.company')} <span className="job-application-form__required">*</span>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder={t('job.placeholders.company')}
                      className="job-application-form__input"
                      required
                    />
                  </label>
                </div>

                <div className="job-application-form__row">
                  <label className="job-application-form__label">
                    {t('job.tel')} <span className="job-application-form__required">*</span>
                    <input
                      type="tel"
                      name="tel"
                      value={formData.tel}
                      onChange={handleChange}
                      placeholder={t('job.placeholders.tel')}
                      className="job-application-form__input"
                      required
                    />
                  </label>
                  <label className="job-application-form__label">
                    {t('job.email')} <span className="job-application-form__required">*</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('job.placeholders.email')}
                      className="job-application-form__input"
                      required
                    />
                  </label>
                </div>

                <div className="job-application-form__row">
                  <label className="job-application-form__label">
                    {t('job.address')} <span className="job-application-form__required">*</span>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder={t('job.placeholders.address')}
                      className="job-application-form__input"
                      required
                    />
                  </label>
                  <label className="job-application-form__label">
                    {t('job.pincode')} <span className="job-application-form__required">*</span>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder={t('job.placeholders.pincode')}
                      className="job-application-form__input"
                      required
                    />
                  </label>
                </div>

                <div className="job-application-form__row job-application-form__row--full">
                  <label className="job-application-form__label job-application-form__label--file">
                    {t('job.uploadCv')} <span className="job-application-form__required">*</span>
                    <input
                      type="file"
                      name="cv"
                      onChange={handleChange}
                      className="job-application-form__file"
                      accept=".pdf,.doc,.docx"
                      required
                    />
                    <span className="job-application-form__file-text">
                      {formData.cv ? formData.cv.name : t('job.placeholders.cv')}
                    </span>
                  </label>
                </div>
              </section>
            </Reveal>

            <Reveal delay={140}>
              <button type="submit" className="job-application-form__submit" disabled={isSubmitting}>
                <Send size={20} aria-hidden />
                {isSubmitting ? 'Sending...' : t('common.sendForm')}
              </button>

              {submitState.message ? (
                <p
                  className="job-application-form__footer"
                  style={{ color: submitState.type === 'error' ? '#dc2626' : '#15803d', marginBottom: '10px' }}
                  role="status"
                >
                  {submitState.message}
                </p>
              ) : null}

              <p className="job-application-form__footer">{t('common.formFooterLegal')}</p>
            </Reveal>
          </form>
        </div>
      </main>
    </div>
  )
}

export default JobApplication
