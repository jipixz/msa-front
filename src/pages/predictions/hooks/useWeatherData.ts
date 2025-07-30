import { useState, useEffect } from 'react'
import { WeatherData } from '../types/prediction.types'
import { CERRO_BLANCO_COORDS, OPENWEATHER_API_KEY } from '../config/constants'
import { CACHE_DURATION, CACHE_KEY, CACHE_TIMESTAMP_KEY } from '../utils/weather.utils'

export const useWeatherData = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

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
      setCachedData(weatherInfo)
      
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

  useEffect(() => {
    fetchWeatherData()
    
    // Auto-refresh cada 10 minutos (solo si la página está activa)
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchWeatherData()
      }
    }, CACHE_DURATION)
    
    return () => clearInterval(interval)
  }, [])

  // Detectar cuando la página vuelve a estar activa
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const { isValid } = getCachedData()
        if (!isValid) {
          fetchWeatherData()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return {
    weatherData,
    loading,
    error,
    lastUpdate,
    refetch: () => fetchWeatherData(true)
  }
}