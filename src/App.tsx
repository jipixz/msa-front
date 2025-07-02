import { useEffect } from 'react'
import './App.css'
import { ThemeProvider } from "@/components/theme-provider"
import { Layout } from "@/components/layout"
import { SensorDashboard } from "@/components/sensor-dashboard"

function App() {
  useEffect(() => {
    document.title = "Sistema de Monitoreo Ambiental"
  }, [])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Layout>
        <SensorDashboard />
      </Layout>
    </ThemeProvider>
  )
}

export default App
