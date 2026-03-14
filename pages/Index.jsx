import { Link } from 'react-router-dom'
import { Building2, Home, TrendingUp, Briefcase } from 'lucide-react'
import '../styles/Home.css'

function Index() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__content">
          <h1 className="home-hero__title">
            Find Your Perfect Property
          </h1>
          <p className="home-hero__subtitle">
            Your trusted partner in real estate. Browse listings, sell with confidence, or explore investment opportunities.
          </p>
          <div className="home-hero__actions">
            <Link to="/buy" className="home-hero__btn home-hero__btn--primary">
              Browse Properties
            </Link>
            <Link to="/login" className="home-hero__btn home-hero__btn--secondary">
              Log in
            </Link>
          </div>
        </div>
        <div className="home-hero__icon">
          <Building2 size={120} aria-hidden />
        </div>
      </section>

      <section className="home-cards">
        <Link to="/buy" className="home-card">
          <span className="home-card__icon">
            <Home size={32} aria-hidden />
          </span>
          <h2 className="home-card__title">Buy</h2>
          <p className="home-card__text">Discover properties for sale and find your next home.</p>
        </Link>
        <Link to="/sell" className="home-card">
          <span className="home-card__icon">
            <Building2 size={32} aria-hidden />
          </span>
          <h2 className="home-card__title">Sell</h2>
          <p className="home-card__text">List your property and connect with serious buyers.</p>
        </Link>
        <Link to="/investment" className="home-card">
          <span className="home-card__icon">
            <TrendingUp size={32} aria-hidden />
          </span>
          <h2 className="home-card__title">Investment</h2>
          <p className="home-card__text">Explore investment opportunities in real estate.</p>
        </Link>
        <Link to="/careers" className="home-card">
          <span className="home-card__icon">
            <Briefcase size={32} aria-hidden />
          </span>
          <h2 className="home-card__title">Careers</h2>
          <p className="home-card__text">Join our team and grow your career with us.</p>
        </Link>
      </section>
    </div>
  )
}

export default Home
