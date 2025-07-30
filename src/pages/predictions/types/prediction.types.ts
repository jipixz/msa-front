export interface PredictionData {
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

export interface WeatherAlert {
  type: string
  severity?: string
  title?: string
  message: string
  recommendation?: string
  recommendations?: string[]
}

export interface AlertsData {
  alerts: WeatherAlert[]
}

export interface WeatherData {
  temperature: number
  humidity: number
  precipitation: number
  cloudiness: number
  windSpeed: number
  description: string
  icon: string
}

export interface GridPoint {
  lat: number
  lng: number
  temperature: number
  humidity: number
  precipitation: number
  cloudiness: number
  windSpeed: number
}