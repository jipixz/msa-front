// Función para formatear etiquetas de días
export const formatDayLabel = (day: string | undefined) => {
  if (!day) return ''
  if (day === 'Hoy') return 'Hoy'
  if (day === 'Mañana') return 'Mañana'
  // Si es un día de la semana, devolverlo tal como está
  return day
}

// Función para formatear tiempo transcurrido
export const getTimeAgo = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  
  if (diffMins < 1) return 'Hace menos de 1 minuto'
  if (diffMins === 1) return 'Hace 1 minuto'
  if (diffMins < 60) return `Hace ${diffMins} minutos`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours === 1) return 'Hace 1 hora'
  return `Hace ${diffHours} horas`
}