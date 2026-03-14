import { useState } from 'react'
import { Briefcase, User, Send } from 'lucide-react'
import '../styles/JobApplication.css'

function JobApplication() {
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
    // Handle form submission (e.g. API call)
    console.log('Job application submitted:', formData)
  }

  return (
    <div className="job-application-page">
      <main className="job-application-main">
        <div className="job-application-header">
          <div className="job-application-header__icon">
            <Briefcase size={40} aria-hidden />
          </div>
          <h1 className="job-application-header__title">Job Application</h1>
          <p className="job-application-header__desc">
            Tell us about your investment goals and preferences. Our team will review your application and get back to you within 24 hours.
          </p>
        </div>

        <div className="job-application-card">
          <div className="job-application-card__header">
            <h2 className="job-application-card__header-title">Job Details</h2>
            <p className="job-application-card__header-sub">Please fill out all required fields marked with *</p>
          </div>

          <form className="job-application-form" onSubmit={handleSubmit}>
            <section className="job-application-section">
              <h3 className="job-application-section__title">
                <User size={20} aria-hidden />
                Personal Information
              </h3>

              <div className="job-application-form__row">
                <label className="job-application-form__label">
                  First Name <span className="job-application-form__required">*</span>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Your first name"
                    className="job-application-form__input"
                    required
                  />
                </label>
                <label className="job-application-form__label">
                  Last Name <span className="job-application-form__required">*</span>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Your last name"
                    className="job-application-form__input"
                    required
                  />
                </label>
              </div>

              <div className="job-application-form__row job-application-form__row--full">
                <label className="job-application-form__label">
                  Company <span className="job-application-form__required">*</span>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Name of your company"
                    className="job-application-form__input"
                    required
                  />
                </label>
              </div>

              <div className="job-application-form__row">
                <label className="job-application-form__label">
                  Tel <span className="job-application-form__required">*</span>
                  <input
                    type="tel"
                    name="tel"
                    value={formData.tel}
                    onChange={handleChange}
                    placeholder="+966 123456789"
                    className="job-application-form__input"
                    required
                  />
                </label>
                <label className="job-application-form__label">
                  Email <span className="job-application-form__required">*</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your email including @"
                    className="job-application-form__input"
                    required
                  />
                </label>
              </div>

              <div className="job-application-form__row">
                <label className="job-application-form__label">
                  Address <span className="job-application-form__required">*</span>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Your address"
                    className="job-application-form__input"
                    required
                  />
                </label>
                <label className="job-application-form__label">
                  Pincode <span className="job-application-form__required">*</span>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Your pincode"
                    className="job-application-form__input"
                    required
                  />
                </label>
              </div>

              <div className="job-application-form__row job-application-form__row--full">
                <label className="job-application-form__label job-application-form__label--file">
                  Upload Your CV <span className="job-application-form__required">*</span>
                  <input
                    type="file"
                    name="cv"
                    onChange={handleChange}
                    className="job-application-form__file"
                    accept=".pdf,.doc,.docx"
                    required
                  />
                  <span className="job-application-form__file-text">
                    {formData.cv ? formData.cv.name : 'Choose file (PDF, DOC)'}
                  </span>
                </label>
              </div>
            </section>

            <button type="submit" className="job-application-form__submit">
              <Send size={20} aria-hidden />
              Send Form
            </button>

            <p className="job-application-form__footer">
              By submitting this form, you agree to our terms and conditions. We'll review your application within 24 hours.
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}

export default JobApplication
