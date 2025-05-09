import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/home'
import LoginPage from './pages/login'
import AboutPage from './pages/about'
import DashboardPage from './pages/dashboard'
import NotFoundPage from './pages/not-found'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
