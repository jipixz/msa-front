import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
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
import { Sun, CloudRain, Thermometer, Droplets, AlertTriangle, CheckCircle, Leaf, Loader2, Map, Eye, EyeOff, RefreshCw } from "lucide-react"
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTimeAgo } from './hooks/useTimeAgo'
import { apiFetch } from "@/lib/api"

type PuntoCrudo = { predicted?: number; prediccion_valor?: number; day?: string; hora_futura?: string; [k: string]: unknown }


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
  severity?: string
  title?: string
  message: string
  recommendation?: string
  recommendations?: string[]
}

interface AlertsData {
  alerts: WeatherAlert[]
}

// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_PREDICTIONS_API_URL || "http://localhost:23457"

// Constantes para valores óptimos
const OPTIMAL_TEMPERATURE = 28 // Temperatura óptima para cacao en °C
const OPTIMAL_HUMIDITY = 70 // Humedad óptima para cacao en %
const OPTIMAL_SOIL_MOISTURE = 50 // Humedad óptima del suelo para cacao en %

// Configuración del mapa
const CERRO_BLANCO_COORDS = {
  lat: 17.448472, // 17°26'54.5"N
  lng: -92.821528 // 92°49'17.5"W
}

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || "tu_api_key_aqui";

// Interfaz para datos meteorológicos
interface WeatherData {
  temperature: number
  humidity: number
  precipitation: number
  cloudiness: number
  windSpeed: number
  description: string
  icon: string
}

// Función para formatear etiquetas de días
const formatDayLabel = (day: string | undefined) => {
  if (!day) return ''
  if (day === 'Hoy') return 'Hoy'
  if (day === 'Mañana') return 'Mañana'
  // Si es un día de la semana, devolverlo tal como está
  return day
}

// Configurar el icono del marcador
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Componente del mapa meteorológico
const WeatherMap = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showWeatherInfo, setShowWeatherInfo] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  
  // Usar el hook para actualización automática del tiempo
  const timeAgoText = useTimeAgo(lastUpdate)
  
  // Solo capas de tiles de OpenWeather (eliminamos las simuladas)
  const [activeWeatherTiles, setActiveWeatherTiles] = useState({
    temperatureTile: false,
    precipitationTile: false,
    cloudsTile: false,
    windTile: false,
    pressureTile: false
  })

  // Configuración de caché
  const CACHE_DURATION = 10 * 60 * 1000 // 10 minutos en milisegundos
  const CACHE_KEY = 'weather_data_cerro_blanco'
  const CACHE_TIMESTAMP_KEY = 'weather_data_timestamp'

  // Función para obtener datos del caché
  const getCachedData = (): { data: WeatherData | null, isValid: boolean } => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY)
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
      
      if (!cachedData || !cachedTimestamp) {
        return { data: null, isValid: false }
      }
      
      const timestamp = new Date(cachedTimestamp)
      const now = new Date()
      const isValid = (now.getTime() - timestamp.getTime()) < CACHE_DURATION
      
      if (isValid) {
        return { data: JSON.parse(cachedData), isValid: true }
      }
      
      return { data: null, isValid: false }
    } catch (error) {
      console.error('Error reading cache:', error)
      return { data: null, isValid: false }
    }
  }

  // Función para guardar datos en caché
  const setCachedData = (data: WeatherData) => {
    try {
      const now = new Date()
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
      localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toISOString())
      setLastUpdate(now)
    } catch (error) {
      console.error('Error saving cache:', error)
    }
  }

  // Función optimizada para obtener datos meteorológicos
  const fetchWeatherData = async (forceRefresh: boolean = false) => {
    // Verificar caché primero (a menos que sea refresh forzado)
    if (!forceRefresh) {
      const { data: cachedData, isValid } = getCachedData()
      if (isValid && cachedData) {
        setWeatherData(cachedData)
        const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
        if (cachedTimestamp) {
          setLastUpdate(new Date(cachedTimestamp))
        }
        return
      }
    }

    setLoading(true)
    setError(null)
    
    try {
      // Solo una petición para el punto central
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${CERRO_BLANCO_COORDS.lat}&lon=${CERRO_BLANCO_COORDS.lng}&units=metric&appid=${OPENWEATHER_API_KEY}`
      )
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      const weatherInfo: WeatherData = {
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        precipitation: data.rain?.['1h'] || 0,
        cloudiness: data.clouds.all,
        windSpeed: data.wind.speed,
        description: data.weather[0].description,
        icon: data.weather[0].icon
      }
      
      setWeatherData(weatherInfo)
      setCachedData(weatherInfo) // Guardar en caché
      
    } catch (err) {
      console.error('Error fetching weather data:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      
      // En caso de error, intentar usar datos en caché aunque sean antiguos
      const { data: cachedData } = getCachedData()
      if (cachedData) {
        setWeatherData(cachedData)
        setError('Usando datos en caché debido a error de conexión')
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleWeatherTile = (tile: keyof typeof activeWeatherTiles) => {
    setActiveWeatherTiles(prev => ({
      ...prev,
      [tile]: !prev[tile]
    }))
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchWeatherData()
    
    // Auto-refresh cada 10 minutos (solo si la página está activa)
    const interval = setInterval(() => {
      if (!document.hidden) { // Solo si la pestaña está activa
        fetchWeatherData()
      }
    }, CACHE_DURATION)
    
    return () => clearInterval(interval)
  }, [])

  // Detectar cuando la página vuelve a estar activa
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Verificar si necesitamos actualizar cuando la página vuelve a estar activa
        const { isValid } = getCachedData()
        if (!isValid) {
          fetchWeatherData()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const weatherTileConfig = {
    temperatureTile: { 
      name: 'Temperatura', 
      layer: 'temp_new', 
      color: 'bg-warn', 
      icon: Thermometer 
    },
    precipitationTile: { 
      name: 'Precipitación', 
      layer: 'precipitation_new', 
      color: 'bg-info', 
      icon: CloudRain 
    },
    cloudsTile: { 
      name: 'Nubes', 
      layer: 'clouds_new', 
      color: 'bg-muted', 
      icon: Sun 
    },
    windTile: { 
      name: 'Viento', 
      layer: 'wind_new', 
      color: 'bg-ok', 
      icon: Leaf 
    },
    pressureTile: { 
      name: 'Presión', 
      layer: 'pressure_new', 
      color: 'bg-chart-4', 
      icon: Thermometer 
    }
  }



  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5" />
          Mapa Meteorológico - Cerro Blanco 5ta Sección, Tacotalpa
          <div className="ml-auto flex items-center gap-2 flex-col">
            {lastUpdate && (
              <span className="text-xs text-muted-foreground">
                {timeAgoText}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchWeatherData(true)} // Forzar refresh
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Solo controles de capas de tiles globales */}
        <div className="mb-4">
          <p className="text-md font-medium mb-3 text-foreground text-left">
            Capas meteorológicas globales:
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(weatherTileConfig).map(([key, config]) => {
              const Icon = config.icon
              const isActive = activeWeatherTiles[key as keyof typeof activeWeatherTiles]
              return (
                <Button
                  key={key}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleWeatherTile(key as keyof typeof activeWeatherTiles)}
                  className={`flex items-center gap-2 ${
                    isActive 
                      ? `${config.color} text-background hover:opacity-90` 
                      : 'hover:bg-accent '
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {config.name}
                  {isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
              )
            })}
          </div>
          
          <div className="mt-3">
            <Button
              variant={showWeatherInfo ? "default" : "outline"}
              size="sm"
              onClick={() => setShowWeatherInfo(!showWeatherInfo)}
              className="flex items-center gap-2"
            >
              <Sun className="h-4 w-4" />
              Información Meteorológica
              {showWeatherInfo ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        {/* Mapa simplificado */}
        <div className="h-96 w-full rounded-lg overflow-hidden border border-border relative isolate z-0">
          <MapContainer
            center={[CERRO_BLANCO_COORDS.lat, CERRO_BLANCO_COORDS.lng]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              className="grayscale-[0.1] contrast-[1.1]"
            />

            {/* Solo capas de tiles meteorológicos de OpenWeather */}
            {Object.entries(activeWeatherTiles).map(([tileType, isActive]) => {
              if (!isActive) return null
              const config = weatherTileConfig[tileType as keyof typeof weatherTileConfig]
              return (
                <TileLayer
                  key={`weather-tile-${tileType}`}
                  url={`https://tile.openweathermap.org/map/${config.layer}/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`}
                  attribution='Weather data © OpenWeatherMap'
                  opacity={1}
                  maxZoom={18}
                  className="saturate-[1.4] contrast-[1.2]"
                />
              )
            })}

            <Marker 
              position={[CERRO_BLANCO_COORDS.lat, CERRO_BLANCO_COORDS.lng]} 
              icon={customIcon}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-semibold text-sm mb-2">Cerro Blanco 5ta Sección</h3>
                  <p className="text-xs text-foreground mb-2">Tacotalpa, Tabasco</p>
                  {weatherData && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{weatherData.description}</p>
                      <p className="text-xs">🌡️ {weatherData.temperature}°C</p>
                      <p className="text-xs">💧 {weatherData.humidity}%</p>
                      <p className="text-xs">🌬️ {weatherData.windSpeed} m/s</p>
                      {lastUpdate && (
                        <p className="text-xs text-muted-foreground">
                          {timeAgoText}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>

            <Circle
              center={[CERRO_BLANCO_COORDS.lat, CERRO_BLANCO_COORDS.lng]}
              radius={3000}
              pathOptions={{
                color: 'hsl(var(--ok))',
                fillColor: 'hsl(var(--ok))',
                fillOpacity: 0.1,
                weight: 2,
                dashArray: '5, 5'
              }}
            >
              <Popup>
                <div className="text-center">
                  <p className="text-sm font-medium">Área de monitoreo</p>
                  <p className="text-xs text-foreground">Radio de 3 kilómetros</p>
                </div>
              </Popup>
            </Circle>
          </MapContainer>

          {/* Información meteorológica optimizada */}
          {showWeatherInfo && weatherData && (
            <div className="absolute top-4 right-4 bg-card text-card-foreground border border-border rounded-lg shadow-lg p-4 max-w-xs z-[1000]">
              <div className="flex items-center justify-between mb-3 flex-col">
                <h4 className="font-semibold text-sm text-foreground">
                  Condiciones Actuales
                </h4>
                {lastUpdate && (
                  <span className="text-xs text-muted-foreground">
                    {timeAgoText}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-bad" />
                  <span className="text-foreground">{weatherData.temperature}°C</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-info" />
                  <span className="text-foreground">{weatherData.humidity}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <CloudRain className="h-4 w-4 text-info" />
                  <span className="text-foreground">{weatherData.precipitation} mm</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-warn" />
                  <span className="text-foreground">{weatherData.cloudiness}%</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <Leaf className="h-4 w-4 text-ok" />
                  <span className="text-foreground">{weatherData.windSpeed} m/s</span>
                </div>
              </div>
              <p className="text-xs text-foreground mt-2 capitalize">
                {weatherData.description}
              </p>
            </div>
          )}
        </div>

        {/* Leyenda simplificada */}
        {Object.values(activeWeatherTiles).some((isActive) => isActive) && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-foreground mb-2">
              <strong>Capas activas:</strong>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              {Object.entries(activeWeatherTiles).map(([tileType, isActive]) => {
                if (!isActive) return null
                const config = weatherTileConfig[tileType as keyof typeof weatherTileConfig]
                return (
                  <div key={tileType} className="flex items-center gap-2">
                    <div className={`w-3 h-3 ${config.color} rounded`}></div>
                    <span className="text-foreground">
                      {config.name}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {error && (
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Aviso:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

      </CardContent>
    </Card>
  )
}

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
      const response = await apiFetch(`${API_BASE_URL}/predictions/temperature?days=7`);
      if (!response.ok) throw new Error("Error al cargar predicciones de temperatura");
      const data = await response.json();
      
      // Transformar datos si es necesario
      if (data.predictions) {
        data.predictions = data.predictions.map((item: PuntoCrudo) => ({
          ...item,
          predicted: item.predicted || item.prediccion_valor,
          day: item.day || formatDayLabel(new Date(item.hora_futura ?? Date.now()).toISOString().split('T')[0])
        }));
      }
      
      setTemperatureData(data);
    } catch (err) {
      console.error("Error cargando predicciones de temperatura:", err);
    }
  };

  // Función para cargar predicciones de humedad
  const loadHumidityPredictions = async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/predictions/humidity`, {
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
      const response = await apiFetch(`${API_BASE_URL}/predictions/rainfall?days=7`)
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
      const response = await apiFetch(`${API_BASE_URL}/predictions/soil-moisture?days=7`)
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
      const response = await apiFetch(`${API_BASE_URL}/predictions/alerts`)
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
      <div className="flex min-h-[70vh] w-full items-center justify-center" role="status">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando predicciones...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold font-mono text-foreground mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-ok text-background rounded-lg hover:bg-ok/15"
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
    <div className="w-full h-full">
      <div className="w-full h-full p-4 px-8">
        {/* Prediction Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-warn">Temperatura</p>
                  <p className="text-2xl font-bold font-mono text-foreground">
                    ↗ {currentTemp.predicted?.toFixed(1) || 0}°C
                  </p>
                  <p className="text-xs text-warn">Pico en 2 días</p>
                </div>
                <Thermometer className="h-8 w-8 text-warn" />
              </div>
            </CardContent>
          </Card>

          <Card className="">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-info">Humedad</p>
                  <p className="text-2xl font-bold font-mono text-foreground">
                    ↗ {currentHumidity.predicted?.toFixed(0) || 0}%
                  </p>
                  <p className="text-xs text-info">Mejora en 4 días</p>
                </div>
                <Droplets className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>

          <Card className="">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-info">Lluvia</p>
                  <p className="text-2xl font-bold font-mono text-foreground">
                    {currentRainfall.predicted?.toFixed(0) || 0}mm
                  </p>
                  <p className="text-xs text-info">
                    {currentRainfall.probability?.toFixed(0) || 0}% probabilidad
                  </p>
                </div>
                <CloudRain className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>

          <Card className="">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ok">Suelo</p>
                  <p className="text-2xl font-bold font-mono text-foreground">
                    ↗ {currentSoilMoisture.predicted?.toFixed(0) || 0}%
                  </p>
                  <p className="text-xs text-ok">Óptimo en 5 días</p>
                </div>
                <div className="h-8 w-8 bg-ok rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-warn rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mapa Meteorológico */}
        <WeatherMap />

        {/* Alerts for Cacao Cultivation */}
        {/* {alertsData?.alerts && alertsData.alerts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
            {alertsData.alerts.map((alert, index) => {
              // Determinar la severidad basada en el tipo
              const isWarning = alert.type === 'warning';
              const severity = alert.severity || (isWarning ? 'warning' : 'favorable');
              
              return (
                <Alert 
                  key={index}
                  className={`
                    border-2 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md
                    ${
                      severity === 'warning' 
                        ? 'border-warn/40 bg-warn/10 ' 
                        : 'border-ok/40 bg-ok/10 '
                    }
                  `}
                >
                  <div className="flex items-start gap-3 flex-col">
                    <div className="flex-shrink-0 mt-0.5 mx-auto">
                      {severity === 'warning' ? (
                        <AlertTriangle className="h-5 w-5 text-warn" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-ok" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`
                        font-semibold text-sm sm:text-base mb-2
                        ${
                          severity === 'warning' 
                            ? 'text-warn ' 
                            : 'text-ok '
                        }
                      `}>
                        {alert.title || (alert.type === 'temperature' ? 'Alerta de Temperatura:' : 'Condiciones Favorables:')}
                      </h4>
                      <AlertDescription className={`
                        text-sm leading-relaxed
                        ${
                          severity === 'warning' 
                            ? 'text-warn ' 
                            : 'text-ok '
                        }
                      `}>
                        <p className="mb-3">{alert.message}</p>
                        
                        
                        {(alert.recommendations && alert.recommendations.length > 0) && (
                          <div className="space-y-2">
                            <p className="font-medium text-foreground">
                              Recomendaciones:
                            </p>
                            <ul className="space-y-1.5 ml-0">
                              {alert.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className={`
                                    inline-block w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0
                                    ${
                                      severity === 'warning' 
                                        ? 'bg-warn ' 
                                        : 'bg-ok '
                                    }
                                  `}></span>
                                  <span className="text-sm leading-relaxed">{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        
                        {alert.recommendation && (
                          <div className="space-y-2">
                            <p className="font-medium text-foreground">
                              Recomendación:
                            </p>
                            <div className="flex items-start gap-2">
                              <span className={`
                                inline-block w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0
                                ${
                                  severity === 'warning' 
                                    ? 'bg-warn ' 
                                    : 'bg-ok '
                                }
                              `}></span>
                              <span className="text-sm leading-relaxed">{alert.recommendation}</span>
                            </div>
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              );
            })}
          </div>
        )}
 */}
        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 h-20 md:h-10 md:grid-cols-4 max-w-2xl">
            <TabsTrigger value="overview" className="text-xs md:text-sm">Resumen</TabsTrigger>
            <TabsTrigger value="climate" className="text-xs md:text-sm">Clima</TabsTrigger>
            <TabsTrigger value="soil" className="text-xs md:text-sm">Suelo</TabsTrigger>
            <TabsTrigger value="recommendations" className="text-xs md:text-sm">Recomendaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Gráfico de Temperatura */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-warn" />
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
                        <XAxis dataKey="day" tickFormatter={formatDayLabel} />
                        <YAxis domain={[25, 40]} />
                        <ReferenceLine y={OPTIMAL_TEMPERATURE} stroke="hsl(var(--ok))" strokeDasharray="5 5" label="Óptimo Cacao" />
                        <Line
                          type="monotone"
                          dataKey="predicted"
                          stroke="hsl(var(--warn))"
                          strokeWidth={3}
                          strokeDasharray="5 5"
                          dot={{ fill: "hsl(var(--warn))", r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="actual"
                          stroke="hsl(var(--bad))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--bad))", r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Gráfico de Humedad */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-info" />
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
                        <XAxis dataKey="day" tickFormatter={formatDayLabel} />
                        <YAxis domain={[40, 100]} />
                        <ReferenceLine y={OPTIMAL_HUMIDITY} stroke="hsl(var(--ok))" strokeDasharray="5 5" label="Óptimo Cacao" />
                        <Area
                          type="monotone"
                          dataKey="predicted"
                          stroke="hsl(var(--chart-1))"
                          fill="hsl(var(--chart-1))"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="climate" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Gráfico de Temperatura detallado */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-warn" />
                    Temperatura Detallada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={temperatureData?.predictions || []}>
                        <XAxis dataKey="day" tickFormatter={formatDayLabel} />
                        <YAxis domain={[20, 40]} />
                        <ReferenceLine y={OPTIMAL_TEMPERATURE} stroke="hsl(var(--ok))" strokeDasharray="5 5" label="Óptimo Cacao" />
                        <Line
                          type="monotone"
                          dataKey="predicted"
                          stroke="hsl(var(--warn))"
                          strokeWidth={3}
                          dot={{ fill: "hsl(var(--warn))", r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="actual"
                          stroke="hsl(var(--bad))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--bad))", r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Gráfico de Lluvia */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CloudRain className="h-5 w-5 text-info" />
                    Predicción de Lluvia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={rainfallData?.predictions || []}>
                        <XAxis dataKey="day" tickFormatter={formatDayLabel} />
                        <YAxis />
                        <Bar dataKey="predicted" fill="hsl(var(--info))" />
                        <Bar dataKey="probability" fill="hsl(var(--info))" fillOpacity={0.6} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="soil" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-ok" />
                  Humedad del Suelo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={soilMoistureData?.predictions || []}>
                      <XAxis dataKey="day" tickFormatter={formatDayLabel} />
                      <YAxis domain={[20, 80]} />
                      <ReferenceLine y={OPTIMAL_SOIL_MOISTURE} stroke="hsl(var(--ok))" strokeDasharray="5 5" label="Óptimo Cacao" />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="hsl(var(--ok))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--ok))", r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="hsl(var(--ok))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--ok))", r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6">
            <div className="mx-auto space-y-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              {alertsData?.alerts && alertsData.alerts.length > 0 ? (
                alertsData.alerts.map((alert, index) => {
                  const isWarning = alert.type === 'warning';
                  const severity = alert.severity || (isWarning ? 'warning' : 'favorable');
                  
                  return (
                    <Alert 
                      key={index}
                      className={`
                        border-2 rounded-lg shadow-sm
                        ${
                          severity === 'warning' 
                            ? 'border-warn/40 bg-warn/10 ' 
                            : 'border-ok/40 bg-ok/10 '
                        }
                      `}
                    >
                      <div className="flex items-start gap-3 flex-col">
                        <div className="flex-shrink-0 mt-0.5 mx-auto">
                          {severity === 'warning' ? (
                            <AlertTriangle className="h-5 w-5 text-warn" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-ok" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className={`
                            font-semibold text-base mb-2
                            ${
                              severity === 'warning' 
                                ? 'text-warn ' 
                                : 'text-ok '
                            }
                          `}>
                            {alert.title || (alert.type === 'temperature' ? 'Alerta de Temperatura:' : 'Condiciones Favorables:')}
                          </h4>
                          <AlertDescription className={`
                            text-sm leading-relaxed
                            ${
                              severity === 'warning' 
                                ? 'text-warn ' 
                                : 'text-ok '
                            }
                          `}>
                            <p className="mb-3">{alert.message}</p>
                            
                            {(alert.recommendations && alert.recommendations.length > 0) && (
                              <div className="space-y-2">
                                <p className="font-medium text-foreground">
                                  Recomendaciones:
                                </p>
                                <ul className="space-y-2 ml-0">
                                  {alert.recommendations.map((rec, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <span className={`
                                        inline-block w-2 h-2 rounded-full mt-1.5 flex-shrink-0
                                        ${
                                          severity === 'warning' 
                                            ? 'bg-warn ' 
                                            : 'bg-ok '
                                        }
                                      `}></span>
                                      <span className="text-sm leading-relaxed">{rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {alert.recommendation && (
                              <div className="space-y-2">
                                <p className="font-medium text-foreground">
                                  Recomendación:
                                </p>
                                <div className="flex items-start gap-2">
                                  <span className={`
                                    inline-block w-2 h-2 rounded-full mt-1.5 flex-shrink-0
                                    ${
                                      severity === 'warning' 
                                        ? 'bg-warn ' 
                                        : 'bg-ok '
                                    }
                                  `}></span>
                                  <span className="text-sm leading-relaxed">{alert.recommendation}</span>
                                </div>
                              </div>
                            )}
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-ok mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No hay alertas activas
                    </h3>
                    <p className="text-foreground">
                      Las condiciones actuales son favorables para el cultivo de cacao.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
