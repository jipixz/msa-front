import L from 'leaflet'

// Configurar el icono del marcador
export const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Configuración de caché
export const CACHE_DURATION = 10 * 60 * 1000 // 10 minutos en milisegundos
export const CACHE_KEY = 'weather_data_cerro_blanco'
export const CACHE_TIMESTAMP_KEY = 'weather_data_timestamp'