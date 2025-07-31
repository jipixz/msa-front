import { useState, useEffect } from 'react'

export const useTimeAgo = (date: Date | null) => {
  const [timeAgo, setTimeAgo] = useState<string>('')

  const getTimeAgo = (date: Date): string => {
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

  useEffect(() => {
    if (!date) {
      setTimeAgo('')
      return
    }

    // Actualizar inmediatamente
    setTimeAgo(getTimeAgo(date))

    // Configurar intervalo para actualizar cada 30 segundos
    const interval = setInterval(() => {
      setTimeAgo(getTimeAgo(date))
    }, 30000) // 30 segundos

    return () => clearInterval(interval)
  }, [date])

  return timeAgo
}