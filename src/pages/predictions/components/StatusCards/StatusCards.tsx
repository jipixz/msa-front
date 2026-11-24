import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Thermometer, Droplets, CloudRain } from 'lucide-react'
import { PredictionData } from '../../types/prediction.types'

interface StatusCardsProps {
  temperatureData: PredictionData | null
  humidityData: PredictionData | null
  rainfallData: PredictionData | null
  soilMoistureData: PredictionData | null
}

export const StatusCards: React.FC<StatusCardsProps> = ({
  temperatureData,
  humidityData,
  rainfallData,
  soilMoistureData
}) => {
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
  )
}