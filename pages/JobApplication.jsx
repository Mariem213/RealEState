import { useState } from 'react'
import { Briefcase, User, Send } from 'lucide-react'
import Reveal from '../components/Reveal'
import { useLanguage } from '../context/LanguageContext'
import '../styles/JobApplication.css'

function JobApplication() {
  const { t } = useLanguage()
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

  const handleChange = (e) => {
    const { name, value, type, files } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'file' ? (files?.[0] ?? null) : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Job application submitted:', formData)
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
              <button type="submit" className="job-application-form__submit">
                <Send size={20} aria-hidden />
                {t('common.sendForm')}
              </button>

              <p className="job-application-form__footer">{t('common.formFooterLegal')}</p>
            </Reveal>
          </form>
        </div>
      </main>
    </div>
  )
}

export default JobApplication
