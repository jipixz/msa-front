import { create } from "zustand"
import { api, mensajeError } from "./api"

type User = {
  _id?: string
  email: string
  name?: string
  role: "admin" | "user"
  avatarUrl?: string
  /** Preferencias de interfaz guardadas en el servidor (ver theme-provider.tsx) */
  preferencias?: unknown
}

type AuthState = {
  user: User | null
  loading: boolean
  initialized: boolean
  error: string | null
  initialize: () => Promise<void>
  fetchMe: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,
  error: null,
  initialize: async () => {
    try {
      await (useAuthStore.getState().fetchMe())
    } finally {
      set({ initialized: true })
    }
  },
  fetchMe: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get("/auth/me")
      set({ user: data.user, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  },
  login: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      await api.post("/auth/login", { email, password })
      const { data } = await api.get("/auth/me")
      set({ user: data.user, loading: false })
    } catch (e) {
      set({ error: mensajeError(e, "Error al iniciar sesión"), loading: false })
      throw e
    }
  },
  logout: async () => {
    set({ loading: true })
    try {
      await api.post("/auth/logout")
    } finally {
      set({ user: null, loading: false })
    }
  },
}))


