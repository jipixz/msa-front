import { useState, useEffect } from 'react'
import { PredictionData, AlertsData } from '../types/prediction.types'
import { API_BASE_URL } from '../config/constants'
import { formatDayLabel } from '../utils/formatters'

export const usePredictionData = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
      
      // Transformar datos si es necesario
      if (data.predictions) {
        data.predictions = data.predictions.map((item: any) => ({
          ...item,
          predicted: item.predicted || item.prediccion_valor,
          day: item.day || formatDayLabel(new Date(item.hora_futura).toISOString().split('T')[0])
        }))
      }
      
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

  // Cargar todos los datos
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

  useEffect(() => {
    loadAllData()
  }, [])

  return {
    loading,
    error,
    temperatureData,
    humidityData,
    rainfallData,
    soilMoistureData,
    alertsData,
    refetch: loadAllData
  }
}
