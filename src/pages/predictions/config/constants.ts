export const API_BASE_URL = "http://localhost:23457"

// Constantes para valores óptimos
export const OPTIMAL_TEMPERATURE = 28 // Temperatura óptima para cacao en °C
export const OPTIMAL_HUMIDITY = 70 // Humedad óptima para cacao en %
export const OPTIMAL_SOIL_MOISTURE = 50 // Humedad óptima del suelo para cacao en %

// Configuración del mapa
export const CERRO_BLANCO_COORDS = {
  lat: 17.448472, // 17°26'54.5"N
  lng: -92.821528 // 92°49'17.5"W
}

export const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || "tu_api_key_aqui"