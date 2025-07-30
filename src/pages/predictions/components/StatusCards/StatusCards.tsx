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
      <Card className="border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Temperatura</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                ↗ {currentTemp.predicted?.toFixed(1) || 0}°C
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400">Pico en 2 días</p>
            </div>
            <Thermometer className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Humedad</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                ↗ {currentHumidity.predicted?.toFixed(0) || 0}%
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Mejora en 4 días</p>
            </div>
            <Droplets className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-800 dark:text-cyan-200">Lluvia</p>
              <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">
                {currentRainfall.predicted?.toFixed(0) || 0}mm
              </p>
              <p className="text-xs text-cyan-600 dark:text-cyan-400">
                {currentRainfall.probability?.toFixed(0) || 0}% probabilidad
              </p>
            </div>
            <CloudRain className="h-8 w-8 text-cyan-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">Suelo</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                ↗ {currentSoilMoisture.predicted?.toFixed(0) || 0}%
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">Óptimo en 5 días</p>
            </div>
            <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-amber-600 rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}