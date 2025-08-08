import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { ThemeProvider } from "@/components/theme-provider"
import { Layout } from "@/components/layout"
import { SensorDashboard } from "@/components/sensor-dashboard"
import Navigation from "@/components/navigation"
import PredictionsPage from "@/pages/predictions/predictions"
import ProductionPage from "@/pages/production/production"
import LoginPage from "@/pages/login"
import AdminPage from "@/pages/admin/index"
import ForgotPasswordPage from "@/pages/auth/forgot"
import ResetPasswordPage from "@/pages/auth/reset"
import { RequireAdmin, RequireAuth, PublicOnly } from "@/components/RequireAuth"

function App() {
  useEffect(() => {
    document.title = "Sistema de Monitoreo Ambiental"
  }, [])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Layout>
          <Navigation />
          <Routes>
            <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
            <Route path="/reset" element={<PublicOnly><ResetPasswordPage /></PublicOnly>} />
            <Route path="/forgot" element={<PublicOnly><ForgotPasswordPage /></PublicOnly>} />
            <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
            <Route path="/" element={<RequireAuth><SensorDashboard /></RequireAuth>} />
            <Route path="/predictions" element={<RequireAuth><PredictionsPage /></RequireAuth>} />
            <Route path="/production" element={<RequireAuth><ProductionPage /></RequireAuth>} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}

export default App
