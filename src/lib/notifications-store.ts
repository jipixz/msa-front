import { create } from "zustand"
import { io, Socket } from "socket.io-client"

type Notification = {
  id: string
  title: string
  message: string
  timestamp: number
  read: boolean
  kind?: "reading" | "alert"
  priority?: string
}

type NotificationsState = {
  notifications: Notification[]
  unreadCount: number
  markAllRead: () => void
  clearAll: () => void
}

let socket: Socket | null = null

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  unreadCount: 0,
  markAllRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0,
  })),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}))

function pushNotification(n: Notification) {
  const prev = useNotificationsStore.getState().notifications
  useNotificationsStore.setState({
    notifications: [n, ...prev].slice(0, 30),
    unreadCount: useNotificationsStore.getState().unreadCount + 1,
  })
}

// Lightweight initializer to listen to backend events
export function initNotifications(backUrl: string) {
  if (socket) return
  socket = io(backUrl, { transports: ['websocket'], withCredentials: true })

  // Lecturas en vivo (informativo)
  socket.on('nueva-lectura', (payload: any) => {
    pushNotification({
      id: `r-${Date.now()}`,
      kind: 'reading',
      title: 'Nueva lectura de sensores',
      message: `Humedad suelo: ${payload?.humedadSuelo ?? '-'}%, Temperatura: ${payload?.temperaturaBME ?? '-'}°C`,
      timestamp: Date.now(),
      read: false,
    })
  })

  // Alertas disparadas por el sistema de reglas (notifier)
  socket.on('notifier-alert', (payload: any) => {
    pushNotification({
      id: `a-${payload?.ruleId || Date.now()}-${Date.now()}`,
      kind: 'alert',
      title: payload?.message?.title || payload?.ruleName || 'Alerta',
      message: payload?.message?.body || '',
      priority: payload?.message?.priority,
      timestamp: payload?.triggeredAt ? new Date(payload.triggeredAt).getTime() : Date.now(),
      read: false,
    })
  })
}




