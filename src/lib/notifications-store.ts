import { create } from "zustand"
import { io, Socket } from "socket.io-client"

type Notification = { id: string; title: string; message: string; timestamp: number; read: boolean }

type NotificationsState = {
  notifications: Notification[]
  unreadCount: number
  markAllRead: () => void
  clearAll: () => void
}

let socket: Socket | null = null

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  markAllRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0,
  })),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}))

// Lightweight initializer to listen to backend events
export function initNotifications(backUrl: string) {
  if (socket) return
  socket = io(backUrl, { transports: ['websocket'], withCredentials: false })
  socket.on('nueva-lectura', (payload: any) => {
    const n: Notification = {
      id: String(Date.now()),
      title: 'Nueva lectura de sensores',
      message: `Humedad suelo: ${payload?.humedadSuelo ?? '-'}%, Temperatura: ${payload?.temperaturaBME ?? '-'}°C`,
      timestamp: Date.now(),
      read: false,
    }
    const prev = useNotificationsStore.getState().notifications
    useNotificationsStore.setState({ notifications: [n, ...prev].slice(0, 20), unreadCount: (useNotificationsStore.getState().unreadCount + 1) })
  })
}




