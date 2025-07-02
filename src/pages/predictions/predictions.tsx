"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { Sun, CloudRain, Thermometer, Droplets, AlertTriangle, CheckCircle, Leaf, Loader2 } from "lucide-react"
import Navigation from "./components/navigation"

// Tipos para los datos de la API
interface PredictionData {
  predictions: Array<{
    day?: string
    hora_futura?: number
    predicted?: number
    actual?: number
    optimal?: number
    probability?: number
    prediccion_valor?: number
  }>
  grafica?: string
}

interface WeatherAlert {
  type: string
  severity: string
  message: string
  recommendation: string
}

interface AlertsData {
  alerts: WeatherAlert[]
}

// Configuración de la API
const API_BASE_URL = "http://localhost:8000"

export default function PredictionsPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estados para los datos de predicción
  const [temperatureData, setTemperatureData] = useState<PredictionData | null>(null)
  const [humidityData, setHumidityData] = useState<PredictionData | null>(null)
  const [rainfallData, setRainfallData] = useState<PredictionData | null>(null)
  const [soilMoistureData, setSoilMoistureData] = useState<PredictionData | null>(null)
  const [alertsData, setAlertsData] = useState<AlertsData | null>(null)

  // Función para cargar predicciones de temperatura
  const loadTemperaturePredictions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/predictions/temperature?days=7`)
      if (!response.ok) throw new Error("Error al cargar predicciones de temperatura")
      const data = await response.json()
      setTemperatureData(data)
    } catch (err) {
      console.error("Error cargando predicciones de temperatura:", err)
    }
  }

  // Función para cargar predicciones de humedad
  const loadHumidityPredictions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/predictions/humidity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hours_to_predict: 168, // 7 días
          include_graph: false
        }),
      })
      if (!response.ok) throw new Error("Error al cargar predicciones de humedad")
      const data = await response.json()
      setHumidityData(data)
    } catch (err) {
      console.error("Error cargando predicciones de humedad:", err)
    }
  }

  // Función para cargar predicciones de lluvia
  const loadRainfallPredictions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/predictions/rainfall?days=7`)
      if (!response.ok) throw new Error("Error al cargar predicciones de lluvia")
      const data = await response.json()
      setRainfallData(data)
    } catch (err) {
      console.error("Error cargando predicciones de lluvia:", err)
    }
  }

  // Función para cargar predicciones de humedad del suelo
  const loadSoilMoisturePredictions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/predictions/soil-moisture?days=7`)
      if (!response.ok) throw new Error("Error al cargar predicciones de humedad del suelo")
      const data = await response.json()
      setSoilMoistureData(data)
    } catch (err) {
      console.error("Error cargando predicciones de humedad del suelo:", err)
    }
  }

  // Función para cargar alertas
  const loadAlerts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/predictions/alerts`)
      if (!response.ok) throw new Error("Error al cargar alertas")
      const data = await response.json()
      setAlertsData(data)
    } catch (err) {
      console.error("Error cargando alertas:", err)
    }
  }

  // Cargar todos los datos al montar el componente
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          loadTemperaturePredictions(),
          loadHumidityPredictions(),
          loadRainfallPredictions(),
          loadSoilMoisturePredictions(),
          loadAlerts(),
        ])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando predicciones...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // Obtener valores actuales para las tarjetas de estado
  const getCurrentTemperature = () => {
    if (!temperatureData?.predictions?.length) return { predicted: 0, optimal: 28 }
    const today = temperatureData.predictions.find(p => p.day === "Hoy")
    return today || temperatureData.predictions[0] || { predicted: 0, optimal: 28 }
  }

  const getCurrentHumidity = () => {
    if (!humidityData?.predictions?.length) return { predicted: 0, optimal: 65 }
    return humidityData.predictions[0] || { predicted: 0, optimal: 65 }
  }

  const getCurrentRainfall = () => {
    if (!rainfallData?.predictions?.length) return { predicted: 0, probability: 0 }
    const today = rainfallData.predictions.find(p => p.day === "Hoy")
    return today || rainfallData.predictions[0] || { predicted: 0, probability: 0 }
  }

  const getCurrentSoilMoisture = () => {
    if (!soilMoistureData?.predictions?.length) return { predicted: 0, optimal: 40 }
    const today = soilMoistureData.predictions.find(p => p.day === "Hoy")
    return today || soilMoistureData.predictions[0] || { predicted: 0, optimal: 40 }
  }

  const currentTemp = getCurrentTemperature()
  const currentHumidity = getCurrentHumidity()
  const currentRainfall = getCurrentRainfall()
  const currentSoilMoisture = getCurrentSoilMoisture()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50">
      <Navigation />

      <div className="max-w-7xl mx-auto p-6">
        {/* Prediction Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-l-4 border-l-orange-500 bg-orange-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800">Temperatura</p>
                  <p className="text-2xl font-bold text-orange-900">
                    ↗ {currentTemp.predicted?.toFixed(1) || 0}°C
                  </p>
                  <p className="text-xs text-orange-600">Pico en 2 días</p>
                </div>
                <Thermometer className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Humedad</p>
                  <p className="text-2xl font-bold text-blue-900">
                    ↗ {currentHumidity.predicted?.toFixed(0) || 0}%
                  </p>
                  <p className="text-xs text-blue-600">Mejora en 4 días</p>
                </div>
                <Droplets className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-cyan-500 bg-cyan-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cyan-800">Lluvia</p>
                  <p className="text-2xl font-bold text-cyan-900">
                    {currentRainfall.predicted?.toFixed(0) || 0}mm
                  </p>
                  <p className="text-xs text-cyan-600">
                    {currentRainfall.probability?.toFixed(0) || 0}% probabilidad
                  </p>
                </div>
                <CloudRain className="h-8 w-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 bg-green-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Suelo</p>
                  <p className="text-2xl font-bold text-green-900">
                    ↗ {currentSoilMoisture.predicted?.toFixed(0) || 0}%
                  </p>
                  <p className="text-xs text-green-600">Óptimo en 5 días</p>
                </div>
                <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-amber-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts for Cacao Cultivation */}
        {alertsData?.alerts && alertsData.alerts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {alertsData.alerts.map((alert, index) => (
              <Alert 
                key={index}
                className={`border-${alert.severity === 'warning' ? 'amber' : 'green'}-200 bg-${alert.severity === 'warning' ? 'amber' : 'green'}-50`}
              >
                {alert.severity === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <AlertDescription className={`text-${alert.severity === 'warning' ? 'amber' : 'green'}-800`}>
                  <strong>{alert.type === 'temperature' ? 'Alerta de Temperatura:' : 'Condiciones Favorables:'}</strong> {alert.message}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="climate">Clima</TabsTrigger>
            <TabsTrigger value="soil">Suelo</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Temperature Predictions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-orange-500" />
                    Predicción de Temperatura
                    <Badge variant="outline" className="ml-auto text-xs">
                      7 días
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={temperatureData?.predictions || []}>
                        <XAxis dataKey="day" />
                        <YAxis domain={[25, 40]} />
                        <ReferenceLine y={28} stroke="#10b981" strokeDasharray="5 5" label="Óptimo Cacao" />
                        <Line
                          type="monotone"
                          dataKey="predicted"
                          stroke="#f97316"
                          strokeWidth={3}
                          strokeDasharray="5 5"
                          dot={{ fill: "#f97316", r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="actual"
                          stroke="#ef4444"
                          strokeWidth={2}
                          dot={{ fill: "#ef4444", r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-orange-500" style={{ borderStyle: "dashed" }}></div>
                      <span>Predicción</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-red-500"></div>
                      <span>Actual</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-green-500" style={{ borderStyle: "dashed" }}></div>
                      <span>Óptimo</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Humidity Predictions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-500" />
                    Predicción de Humedad
                    <Badge variant="outline" className="ml-auto text-xs">
                      7 días
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={humidityData?.predictions || []}>
                        <XAxis dataKey="hora_futura" />
                        <YAxis domain={[0, 100]} />
                        <ReferenceLine y={65} stroke="#10b981" strokeDasharray="5 5" label="Óptimo Cacao" />
                        <Area
                          type="monotone"
                          dataKey="prediccion_valor"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Humedad Predicha</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-green-500" style={{ borderStyle: "dashed" }}></div>
                      <span>Óptimo</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rainfall Predictions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CloudRain className="h-5 w-5 text-cyan-500" />
                    Predicción de Lluvia
                    <Badge variant="outline" className="ml-auto text-xs">
                      7 días
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={rainfallData?.predictions || []}>
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Bar dataKey="predicted" fill="#06b6d4" name="Lluvia (mm)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <p>Probabilidad de lluvia: {currentRainfall.probability?.toFixed(0) || 0}%</p>
                  </div>
                </CardContent>
              </Card>

              {/* Soil Moisture Predictions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="h-2 w-2 bg-amber-600 rounded-full"></div>
                    </div>
                    Humedad del Suelo
                    <Badge variant="outline" className="ml-auto text-xs">
                      7 días
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={soilMoistureData?.predictions || []}>
                        <XAxis dataKey="day" />
                        <YAxis domain={[0, 60]} />
                        <ReferenceLine y={40} stroke="#10b981" strokeDasharray="5 5" label="Óptimo Cacao" />
                        <Line
                          type="monotone"
                          dataKey="predicted"
                          stroke="#84cc16"
                          strokeWidth={3}
                          dot={{ fill: "#84cc16", r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-green-500"></div>
                      <span>Humedad del Suelo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-green-500" style={{ borderStyle: "dashed" }}></div>
                      <span>Óptimo</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="climate" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tendencia de Temperatura</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={temperatureData?.predictions || []}>
                        <XAxis dataKey="day" />
                        <YAxis />
                        <ReferenceLine y={28} stroke="#10b981" strokeDasharray="5 5" label="Óptimo" />
                        <Line
                          type="monotone"
                          dataKey="predicted"
                          stroke="#f97316"
                          strokeWidth={3}
                          name="Temperatura (°C)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Humedad Atmosférica</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={humidityData?.predictions || []}>
                        <XAxis dataKey="hora_futura" />
                        <YAxis />
                        <ReferenceLine y={65} stroke="#10b981" strokeDasharray="5 5" label="Óptimo" />
                        <Area
                          type="monotone"
                          dataKey="prediccion_valor"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.3}
                          name="Humedad (%)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="soil" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Humedad del Suelo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={soilMoistureData?.predictions || []}>
                        <XAxis dataKey="day" />
                        <YAxis />
                        <ReferenceLine y={40} stroke="#10b981" strokeDasharray="5 5" label="Óptimo" />
                        <Line
                          type="monotone"
                          dataKey="predicted"
                          stroke="#84cc16"
                          strokeWidth={3}
                          name="Humedad (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Patrones de Lluvia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={rainfallData?.predictions || []}>
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Bar dataKey="predicted" fill="#06b6d4" name="Lluvia (mm)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recomendaciones de Riego</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Riego Programado</h4>
                      <p className="text-blue-700 text-sm">
                        Basado en las predicciones, se recomienda aumentar el riego en los próximos 2 días
                        debido a las altas temperaturas previstas.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Condiciones Favorables</h4>
                      <p className="text-green-700 text-sm">
                        La humedad del suelo alcanzará niveles óptimos en 4-5 días gracias a las lluvias previstas.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Manejo de Sombra</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Protección Solar</h4>
                      <p className="text-orange-700 text-sm">
                        Considere aumentar la sombra artificial para proteger las plantas de cacao
                        durante los picos de temperatura.
                      </p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg">
                      <h4 className="font-semibold text-amber-800 mb-2">Monitoreo Continuo</h4>
                      <p className="text-amber-700 text-sm">
                        Mantenga un monitoreo constante de las condiciones ambientales
                        y ajuste las prácticas agrícolas según sea necesario.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
