import { useEffect, ReactNode } from "react"
import { useLocation, Navigate } from "react-router-dom"
import { useAuthStore } from "@/lib/auth-store"

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, initialize, initialized } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    if (!initialized) initialize()
  }, [])

  if (!initialized || loading) return null
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading, initialize, initialized } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    if (!initialized) initialize()
  }, [])

  if (!initialized || loading) return null
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

export function PublicOnly({ children }: { children: ReactNode }) {
  const { user, loading, initialize, initialized } = useAuthStore()
  useEffect(() => {
    if (!initialized) initialize()
  }, [])
  if (!initialized || loading) return null
  if (user) return <Navigate to="/" replace />
  return children
}


