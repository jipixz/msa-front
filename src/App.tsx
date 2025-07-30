import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { ThemeProvider } from "@/components/theme-provider"
import { Layout } from "@/components/layout"
import { SensorDashboard } from "@/components/sensor-dashboard"
import Navigation from "@/components/navigation"
import PredictionsPage from "@/pages/predictions/predictions"
import ProductionPage from "@/pages/production/production"

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
            <Route path="/" element={<SensorDashboard />} />
            <Route path="/predictions" element={<PredictionsPage />} />
            <Route path="/production" element={<ProductionPage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}

export default App
