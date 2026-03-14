import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Index from './pages/Index'
import Login from './pages/Login'
import Register from './pages/Register'
import JobApplication from './pages/JobApplication'
import InvestmentApplication from './pages/InvestmentApplication'
import SellProperty from './pages/SellProperty'

const AUTH_PATHS = ['/login', '/signup']

function AppContent() {
  const location = useLocation()
  const isAuthPage = AUTH_PATHS.includes(location.pathname)

  return (
    <div className="app-layout">
      {!isAuthPage && <Navbar />}
      <main className="app-main">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/careers" element={<JobApplication />} />
          <Route path="/investment" element={<InvestmentApplication />} />
          <Route path="/sell" element={<SellProperty />} />
          <Route path="/" element={<Index />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
