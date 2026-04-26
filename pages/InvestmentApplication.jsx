import { useMemo, useState } from 'react'
import { CircleDollarSign, User, TrendingUp, Send } from 'lucide-react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import CustomSelect from '../components/CustomSelect'
import Reveal from '../components/Reveal'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'
import '../styles/InvestmentApplication.css'

const INVESTOR_TYPES = ['Individual', 'Institutional', 'Family Office', 'Other']
const EXPERTISE_OPTIONS = ['Real Estate', 'Stocks', 'Bonds', 'Private Equity', 'Mixed', 'Other']
const OPPORTUNITY_TYPES = ['Residential', 'Commercial', 'Mixed-Use', 'Land', 'Development', 'Other']
const INVESTMENT_METHODS = ['Direct', 'Fund', 'Syndication', 'REIT', 'Other']
const TICKET_SIZES = ['Under 500K SAR', '500K - 1M SAR', '1M - 5M SAR', '5M - 10M SAR', '10M+ SAR']

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

function InvestmentApplication() {
  const { t, tSegments } = useLanguage()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    tel: '',
    email: '',
    investorType: '',
    expertise: '',
    opportunityType: '',
    investmentMethod: '',
    ticketSize: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitState, setSubmitState] = useState({ type: '', message: '' })

  const investorTypeOptions = useMemo(
    () =>
      INVESTOR_TYPES.map((v) => ({
        value: v,
        label: tSegments(['investmentForm', 'options', 'investorType', v]),
      })),
    [tSegments],
  )

  const expertiseOptions = useMemo(
    () =>
      EXPERTISE_OPTIONS.map((v) => ({
        value: v,
        label: tSegments(['investmentForm', 'options', 'expertise', v]),
      })),
    [tSegments],
  )

  const opportunityOptions = useMemo(
    () =>
      OPPORTUNITY_TYPES.map((v) => ({
        value: v,
        label: tSegments(['investmentForm', 'options', 'opportunityType', v]),
      })),
    [tSegments],
  )

  const methodOptions = useMemo(
    () =>
      INVESTMENT_METHODS.map((v) => ({
        value: v,
        label: tSegments(['investmentForm', 'options', 'investmentMethod', v]),
      })),
    [tSegments],
  )

  const ticketOptions = useMemo(
    () =>
      TICKET_SIZES.map((v) => ({
        value: v,
        label: tSegments(['investmentForm', 'options', 'ticketSize', v]),
      })),
    [tSegments],
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitState({ type: '', message: '' })

    try {
      const modernPayload = {
        ...formData,
        createdAt: serverTimestamp(),
        userId: user?.uid ?? null,
        userEmail: user?.email ?? null,
      }

      const modernPayloadNoUser = {
        ...formData,
        createdAt: serverTimestamp(),
      }

      const legacyPayload = {
        'First Name': formData.firstName,
        'Last Name': formData.lastName,
        Company: formData.company,
        Email: formData.email,
        Expertise: formData.expertise,
        'Investor Type': formData.investorType,
        'Preferred Investment Method': formData.investmentMethod,
        Tel: formData.tel,
        'Ticket size (SAR)': formData.ticketSize,
        'What type of opportunity are you looking for?': formData.opportunityType,
        createdAt: serverTimestamp(),
      }

      const legacyPayloadNoTimestamp = {
        ...formData,
        'First Name': formData.firstName,
        'Last Name': formData.lastName,
        Company: formData.company,
        Email: formData.email,
        Expertise: formData.expertise,
        'Investor Type': formData.investorType,
        'Preferred Investment Method': formData.investmentMethod,
        Tel: formData.tel,
        'Ticket size (SAR)': formData.ticketSize,
        'What type of opportunity are you looking for?': formData.opportunityType,
      }

      const attempts = [
        { collectionName: 'investments', payload: legacyPayload },
        { collectionName: 'investmentRequests', payload: modernPayload },
        { collectionName: 'investments', payload: legacyPayloadNoTimestamp },
        { collectionName: 'investmentRequests', payload: modernPayloadNoUser },
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
        investorType: '',
        expertise: '',
        opportunityType: '',
        investmentMethod: '',
        ticketSize: '',
      })
      setSubmitState({
        type: 'success',
        message: 'Your investment request was sent successfully.',
      })
    } catch (error) {
      console.error('Failed to send investment request:', error)
      setSubmitState({
        type: 'error',
        message: getSubmitErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="investment-application-page">
      <main className="investment-application-main">
        <Reveal>
          <div className="investment-application-header">
            <div className="investment-application-header__icon">
              <CircleDollarSign size={40} aria-hidden />
            </div>
            <h1 className="investment-application-header__title">{t('investmentForm.title')}</h1>
            <p className="investment-application-header__desc">{t('investmentForm.intro')}</p>
          </div>
        </Reveal>

        <div className="investment-application-card">
          <Reveal>
            <div className="investment-application-card__header">
              <h2 className="investment-application-card__header-title">
                {t('investmentForm.sectionTitle')}
              </h2>
              <p className="investment-application-card__header-sub">
                {t('common.requiredFieldsHint')}
              </p>
            </div>
          </Reveal>

          <form className="investment-application-form" onSubmit={handleSubmit}>
            <Reveal delay={60}>
              <section className="investment-application-section">
                <h3 className="investment-application-section__title">
                  <User size={20} aria-hidden />
                  {t('investmentForm.personalInfo')}
                </h3>

                <div className="investment-application-form__row">
                  <label className="investment-application-form__label">
                    {t('investmentForm.firstName')}{' '}
                    <span className="investment-application-form__required">*</span>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder={t('investmentForm.placeholders.firstName')}
                      className="investment-application-form__input"
                      required
                    />
                  </label>
                  <label className="investment-application-form__label">
                    {t('investmentForm.lastName')}{' '}
                    <span className="investment-application-form__required">*</span>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder={t('investmentForm.placeholders.lastName')}
                      className="investment-application-form__input"
                      required
                    />
                  </label>
                </div>

                <div className="investment-application-form__row investment-application-form__row--full">
                  <label className="investment-application-form__label">
                    {t('investmentForm.company')}{' '}
                    <span className="investment-application-form__required">*</span>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder={t('investmentForm.placeholders.company')}
                      className="investment-application-form__input"
                      required
                    />
                  </label>
                </div>

                <div className="investment-application-form__row">
                  <label className="investment-application-form__label">
                    {t('investmentForm.tel')}{' '}
                    <span className="investment-application-form__required">*</span>
                    <input
                      type="tel"
                      name="tel"
                      value={formData.tel}
                      onChange={handleChange}
                      placeholder={t('investmentForm.placeholders.tel')}
                      className="investment-application-form__input"
                      required
                    />
                  </label>
                  <label className="investment-application-form__label">
                    {t('investmentForm.email')}{' '}
                    <span className="investment-application-form__required">*</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('investmentForm.placeholders.email')}
                      className="investment-application-form__input"
                      required
                    />
                  </label>
                </div>
              </section>
            </Reveal>

            <Reveal delay={120}>
              <section className="investment-application-section">
                <h3 className="investment-application-section__title">
                  <TrendingUp size={20} aria-hidden />
                  {t('investmentForm.preferencesTitle')}
                </h3>

                <div className="investment-application-form__row">
                  <label className="investment-application-form__label">
                    {t('investmentForm.investorType')}{' '}
                    <span className="investment-application-form__required">*</span>
                    <CustomSelect
                      name="investorType"
                      value={formData.investorType}
                      onChange={handleChange}
                      options={investorTypeOptions}
                      placeholder={t('investmentForm.placeholders.selectOption')}
                      className="investment-application-form__select"
                      required
                    />
                  </label>
                  <label className="investment-application-form__label">
                    {t('investmentForm.expertise')}{' '}
                    <span className="investment-application-form__required">*</span>
                    <CustomSelect
                      name="expertise"
                      value={formData.expertise}
                      onChange={handleChange}
                      options={expertiseOptions}
                      placeholder={t('investmentForm.placeholders.selectHere')}
                      className="investment-application-form__select"
                      required
                    />
                  </label>
                </div>

                <div className="investment-application-form__row investment-application-form__row--full">
                  <label className="investment-application-form__label">
                    {t('investmentForm.opportunityType')}{' '}
                    <span className="investment-application-form__required">*</span>
                    <CustomSelect
                      name="opportunityType"
                      value={formData.opportunityType}
                      onChange={handleChange}
                      options={opportunityOptions}
                      placeholder={t('investmentForm.placeholders.selectOption')}
                      className="investment-application-form__select"
                      required
                    />
                  </label>
                </div>

                <div className="investment-application-form__row">
                  <label className="investment-application-form__label">
                    {t('investmentForm.investmentMethod')}{' '}
                    <span className="investment-application-form__required">*</span>
                    <CustomSelect
                      name="investmentMethod"
                      value={formData.investmentMethod}
                      onChange={handleChange}
                      options={methodOptions}
                      placeholder={t('investmentForm.placeholders.selectHere')}
                      className="investment-application-form__select"
                      required
                    />
                  </label>
                  <label className="investment-application-form__label">
                    {t('investmentForm.ticketSize')}{' '}
                    <span className="investment-application-form__required">*</span>
                    <CustomSelect
                      name="ticketSize"
                      value={formData.ticketSize}
                      onChange={handleChange}
                      options={ticketOptions}
                      placeholder={t('investmentForm.placeholders.ticketSize')}
                      className="investment-application-form__select"
                      required
                    />
                  </label>
                </div>
              </section>
            </Reveal>

            <Reveal delay={180}>
              <button type="submit" className="investment-application-form__submit" disabled={isSubmitting}>
                <Send size={20} aria-hidden />
                {isSubmitting ? 'Sending...' : t('common.sendForm')}
              </button>

              {submitState.message ? (
                <p
                  className="investment-application-form__footer"
                  style={{ color: submitState.type === 'error' ? '#dc2626' : '#15803d', marginBottom: '10px' }}
                  role="status"
                >
                  {submitState.message}
                </p>
              ) : null}

              <p className="investment-application-form__footer">{t('common.formFooterLegal')}</p>
            </Reveal>
          </form>
        </div>
      </main>
    </div>
  )
}

export default InvestmentApplication
