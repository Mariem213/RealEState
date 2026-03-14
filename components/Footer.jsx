import { Link } from 'react-router-dom'
import { Building2, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import '../styles/Footer.css'

const quickLinks = [
  { to: '/about', label: 'About Us' },
  { to: '/buy', label: 'Properties' },
  { to: '/agents', label: 'Agents' },
  { to: '/blog', label: 'Blog' },
]

const supportLinks = [
  { to: '/help', label: 'Help Center' },
  { to: '/contact', label: 'Contact Us' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
]

const socialLinks = [
  { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
  { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
  { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
  { href: 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
]

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* Brand */}
        <div className="footer__brand">
          <Link to="/" className="footer__logo-link" aria-label="EstateHub home">
            <span className="footer__logo">
              <Building2 size={24} aria-hidden />
            </span>
            <span className="footer__brand-name">RealEstate</span>
          </Link>
          <p className="footer__slogan">
            Your trusted partner in real estate transactions.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer__column">
          <h3 className="footer__heading">Quick Links</h3>
          <ul className="footer__links">
            {quickLinks.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="footer__link">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div className="footer__column">
          <h3 className="footer__heading">Support</h3>
          <ul className="footer__links">
            {supportLinks.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="footer__link">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Connect */}
        <div className="footer__column">
          <h3 className="footer__heading">Connect</h3>
          <div className="footer__social">
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
                aria-label={label}
              >
                <Icon size={20} aria-hidden />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer__divider" />

      <div className="footer__bottom">
        <p className="footer__copyright">
          © 2024 EstateHub. All rights reserved. Academic Project.
        </p>
      </div>
    </footer>
  )
}

export default Footer
