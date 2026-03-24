import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  const location = useLocation()

  if (loading) {
    return (
      <div className="protected-route-loading" aria-live="polite">
        {t('common.loading')}
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  return children
}
