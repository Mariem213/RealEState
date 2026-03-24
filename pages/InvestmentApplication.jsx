import { useState } from 'react'
import { CircleDollarSign, User, TrendingUp, Send } from 'lucide-react'
import CustomSelect from '../components/CustomSelect'
import Reveal from '../components/Reveal'
import '../styles/InvestmentApplication.css'

const INVESTOR_TYPES = ['Individual', 'Institutional', 'Family Office', 'Other']
const EXPERTISE_OPTIONS = ['Real Estate', 'Stocks', 'Bonds', 'Private Equity', 'Mixed', 'Other']
const OPPORTUNITY_TYPES = ['Residential', 'Commercial', 'Mixed-Use', 'Land', 'Development', 'Other']
const INVESTMENT_METHODS = ['Direct', 'Fund', 'Syndication', 'REIT', 'Other']
const TICKET_SIZES = ['Under 500K SAR', '500K - 1M SAR', '1M - 5M SAR', '5M - 10M SAR', '10M+ SAR']

function InvestmentApplication() {
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Investment application submitted:', formData)
  }

  return (
    <div className="investment-application-page">
      <main className="investment-application-main">
        <Reveal>
          <div className="investment-application-header">
            <div className="investment-application-header__icon">
              <CircleDollarSign size={40} aria-hidden />
            </div>
            <h1 className="investment-application-header__title">Investment Application</h1>
            <p className="investment-application-header__desc">
              Tell us about your investment goals and preferences. Our team will review your application and get back to you within 24 hours.
            </p>
          </div>
        </Reveal>

        <div className="investment-application-card">
          <Reveal>
            <div className="investment-application-card__header">
              <h2 className="investment-application-card__header-title">Investment Details</h2>
              <p className="investment-application-card__header-sub">Please fill out all required fields marked with *</p>
            </div>
          </Reveal>

          <form className="investment-application-form" onSubmit={handleSubmit}>
            <Reveal delay={60}>
            <section className="investment-application-section">
              <h3 className="investment-application-section__title">
                <User size={20} aria-hidden />
                Personal Information
              </h3>

              <div className="investment-application-form__row">
                <label className="investment-application-form__label">
                  First Name <span className="investment-application-form__required">*</span>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Your first name"
                    className="investment-application-form__input"
                    required
                  />
                </label>
                <label className="investment-application-form__label">
                  Last Name <span className="investment-application-form__required">*</span>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Your last name"
                    className="investment-application-form__input"
                    required
                  />
                </label>
              </div>

              <div className="investment-application-form__row investment-application-form__row--full">
                <label className="investment-application-form__label">
                  Company <span className="investment-application-form__required">*</span>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Name of your company"
                    className="investment-application-form__input"
                    required
                  />
                </label>
              </div>

              <div className="investment-application-form__row">
                <label className="investment-application-form__label">
                  Tel <span className="investment-application-form__required">*</span>
                  <input
                    type="tel"
                    name="tel"
                    value={formData.tel}
                    onChange={handleChange}
                    placeholder="+966 123456789"
                    className="investment-application-form__input"
                    required
                  />
                </label>
                <label className="investment-application-form__label">
                  Email <span className="investment-application-form__required">*</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your email including @"
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
                Investment Preferences
              </h3>

              <div className="investment-application-form__row">
                <label className="investment-application-form__label">
                  Investor Type <span className="investment-application-form__required">*</span>
                  <CustomSelect
                    name="investorType"
                    value={formData.investorType}
                    onChange={handleChange}
                    options={INVESTOR_TYPES}
                    placeholder="Select an option"
                    className="investment-application-form__select"
                    required
                  />
                </label>
                <label className="investment-application-form__label">
                  Expertise <span className="investment-application-form__required">*</span>
                  <CustomSelect
                    name="expertise"
                    value={formData.expertise}
                    onChange={handleChange}
                    options={EXPERTISE_OPTIONS}
                    placeholder="Select here"
                    className="investment-application-form__select"
                    required
                  />
                </label>
              </div>

              <div className="investment-application-form__row investment-application-form__row--full">
                <label className="investment-application-form__label">
                  What type of opportunity are you looking for? <span className="investment-application-form__required">*</span>
                  <CustomSelect
                    name="opportunityType"
                    value={formData.opportunityType}
                    onChange={handleChange}
                    options={OPPORTUNITY_TYPES}
                    placeholder="Select an option"
                    className="investment-application-form__select"
                    required
                  />
                </label>
              </div>

              <div className="investment-application-form__row">
                <label className="investment-application-form__label">
                  Preferred Investment Method <span className="investment-application-form__required">*</span>
                  <CustomSelect
                    name="investmentMethod"
                    value={formData.investmentMethod}
                    onChange={handleChange}
                    options={INVESTMENT_METHODS}
                    placeholder="Select here"
                    className="investment-application-form__select"
                    required
                  />
                </label>
                <label className="investment-application-form__label">
                  Ticket size (SAR) <span className="investment-application-form__required">*</span>
                  <CustomSelect
                    name="ticketSize"
                    value={formData.ticketSize}
                    onChange={handleChange}
                    options={TICKET_SIZES}
                    placeholder="Your ticket size in SAR"
                    className="investment-application-form__select"
                    required
                  />
                </label>
              </div>
            </section>
            </Reveal>

            <Reveal delay={180}>
              <button type="submit" className="investment-application-form__submit">
                <Send size={20} aria-hidden />
                Send Form
              </button>

              <p className="investment-application-form__footer">
                By submitting this form, you agree to our terms and conditions. We&apos;ll review your application within 24 hours.
              </p>
            </Reveal>
          </form>
        </div>
      </main>
    </div>
  )
}

export default InvestmentApplication
