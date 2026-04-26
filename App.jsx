import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import Index from './pages/Index'
import Login from './pages/Login'
import Register from './pages/Register'
import JobApplication from './pages/JobApplication'
import InvestmentApplication from './pages/InvestmentApplication'
import SellProperty from './pages/SellProperty'
import Buy from './pages/Buy'
import PropertyDetail from './pages/PropertyDetail'
import Dashboard from './pages/Dashboard'
import InvestmentRequests from './pages/InvestmentRequests'
import SellRequests from './pages/SellRequests'
import JobApplicationsAdmin from './pages/JobApplicationsAdmin'

const AUTH_PATHS = ['/login', '/signup']

function AppContent() {
  const location = useLocation()
  const hideNavbar =
    AUTH_PATHS.includes(location.pathname) || location.pathname.startsWith('/admin')

  return (
    <div className="app-layout">
      {!hideNavbar && <Navbar />}
      <main className="app-main">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route
            path="/careers"
            element={
              <ProtectedRoute>
                <JobApplication />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investment"
            element={
              <ProtectedRoute>
                <InvestmentApplication />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sell"
            element={
              <ProtectedRoute>
                <SellProperty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buy"
            element={
              <ProtectedRoute>
                <Buy />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buy/:id"
            element={
              <ProtectedRoute>
                <PropertyDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Index />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/investment-requests"
            element={
              <ProtectedRoute>
                <InvestmentRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sell-requests"
            element={
              <ProtectedRoute>
                <SellRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/job-applications"
            element={
              <ProtectedRoute>
                <JobApplicationsAdmin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}

export default App
