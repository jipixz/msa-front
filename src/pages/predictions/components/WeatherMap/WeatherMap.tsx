import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import { Map, Eye, EyeOff, RefreshCw, Sun, CloudRain, Thermometer, Droplets, Leaf, AlertTriangle } from 'lucide-react'
import { useWeatherData } from '../../hooks/useWeatherData'
import { customIcon } from '../../utils/weather.utils'
import { CERRO_BLANCO_COORDS, OPENWEATHER_API_KEY } from '../../config/constants'
import { getTimeAgo } from '../../utils/formatters'
import 'leaflet/dist/leaflet.css'

export const WeatherMap: React.FC = () => {
  const { weatherData, loading, error, lastUpdate, refetch } = useWeatherData()
  const [showWeatherInfo, setShowWeatherInfo] = useState(true)
  
  // Solo capas de tiles de OpenWeather
  const [activeWeatherTiles, setActiveWeatherTiles] = useState({
    temperatureTile: false,
    precipitationTile: false,
    cloudsTile: false,
    windTile: false,
    pressureTile: false
  })

  const toggleWeatherTile = (tile: keyof typeof activeWeatherTiles) => {
    setActiveWeatherTiles(prev => ({
      ...prev,
      [tile]: !prev[tile]
    }))
  }

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
          <div className="ml-auto flex items-center gap-2">
            {lastUpdate && (
              <span className="text-xs text-muted-foreground">
                {getTimeAgo(lastUpdate)}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Controles de capas */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-3 text-foreground">
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

        {/* Mapa */}
        <div className="h-96 w-full rounded-lg overflow-hidden border border-border relative">
          <MapContainer
            center={[CERRO_BLANCO_COORDS.lat, CERRO_BLANCO_COORDS.lng]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Capas de tiles meteorológicos */}
            {Object.entries(activeWeatherTiles).map(([tileType, isActive]) => {
              if (!isActive) return null
              const config = weatherTileConfig[tileType as keyof typeof weatherTileConfig]
              return (
                <TileLayer
                  key={`weather-tile-${tileType}`}
                  url={`https://tile.openweathermap.org/map/${config.layer}/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`}
                  attribution='Weather data © OpenWeatherMap'
                  opacity={0.6}
                  maxZoom={18}
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
                          {getTimeAgo(lastUpdate)}
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

          {/* Información meteorológica */}
          {showWeatherInfo && weatherData && (
            <div className="absolute top-4 right-4 bg-card text-card-foreground border border-border rounded-lg shadow-lg p-4 max-w-xs z-[1000]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm text-foreground">
                  Condiciones Actuales
                </h4>
                {lastUpdate && (
                  <span className="text-xs text-muted-foreground">
                    {getTimeAgo(lastUpdate)}
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

        {/* Leyenda */}
        {Object.entries(activeWeatherTiles).some(([_, isActive]) => isActive) && (
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