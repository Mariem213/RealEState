import { Link } from 'react-router-dom'
import { Building2, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import '../styles/Footer.css'

const quickLinks = [
  { to: '/about', labelKey: 'footer.aboutUs' },
  { to: '/buy', labelKey: 'footer.properties' },
  { to: '/agents', labelKey: 'footer.agents' },
  { to: '/blog', labelKey: 'footer.blog' },
]

const supportLinks = [
  { to: '/help', labelKey: 'footer.helpCenter' },
  { to: '/contact', labelKey: 'footer.contactUs' },
  { to: '/privacy', labelKey: 'footer.privacyPolicy' },
  { to: '/terms', labelKey: 'footer.termsOfService' },
]

const socialLinks = [
  { href: 'https://facebook.com', icon: Facebook, labelKey: 'footer.facebook' },
  { href: 'https://twitter.com', icon: Twitter, labelKey: 'footer.twitter' },
  { href: 'https://instagram.com', icon: Instagram, labelKey: 'footer.instagram' },
  { href: 'https://linkedin.com', icon: Linkedin, labelKey: 'footer.linkedin' },
]

function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__logo-link" aria-label={t('footer.homeAria')}>
            <span className="footer__logo">
              <Building2 size={24} aria-hidden />
            </span>
            <span className="footer__brand-name">{t('brand.name')}</span>
          </Link>
          <p className="footer__slogan">{t('footer.slogan')}</p>
        </div>

        <div className="footer__column">
          <h3 className="footer__heading">{t('footer.quickLinks')}</h3>
          <ul className="footer__links">
            {quickLinks.map(({ to, labelKey }) => (
              <li key={to}>
                <Link to={to} className="footer__link">
                  {t(labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__column">
          <h3 className="footer__heading">{t('footer.support')}</h3>
          <ul className="footer__links">
            {supportLinks.map(({ to, labelKey }) => (
              <li key={to}>
                <Link to={to} className="footer__link">
                  {t(labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__column">
          <h3 className="footer__heading">{t('footer.connect')}</h3>
          <div className="footer__social">
            {socialLinks.map(({ href, icon: Icon, labelKey }) => (
              <a
                key={labelKey}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
                aria-label={t(labelKey)}
              >
                <Icon size={20} aria-hidden />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer__divider" />

      <div className="footer__bottom">
        <p className="footer__copyright">{t('footer.copyright')}</p>
      </div>
    </footer>
  )
}

export default Footer
