import { useEffect, useMemo, useState } from "react"
import { io } from "socket.io-client"
import { API_URL, apiFetch } from "@/lib/api"
import { API_BASE_URL as PRED_URL } from "@/pages/predictions/config/constants"
import { construirPanel, pronosticoPorDia, type Alerta, type DiaPronostico, type Panel } from "./datos"

export type DatosPanel = {
  panel: Panel
  pronostico: DiaPronostico[]
  alertasModelo: Alerta[]
  cargando: boolean
  error: string | null
  enVivo: boolean
  ahora: Date
}

const REFRESCO_MS = 60_000

async function json<T>(url: string): Promise<T | null> {
  try {
    const r = await apiFetch(url)
    return r.ok ? ((await r.json()) as T) : null
  } catch {
    return null
  }
}

/** Datos del panel: lecturas de msa-back (REST + socket) y pronóstico de fastapimsa. */
export function usePanel(): DatosPanel {
  const [docs, setDocs] = useState<Record<string, unknown>[]>([])
  const [pred, setPred] = useState<{ t: unknown[]; r: unknown[]; a: Alerta[] }>({ t: [], r: [], a: [] })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enVivo, setEnVivo] = useState(false)
  const [ahora, setAhora] = useState(() => new Date())

  useEffect(() => {
    let vivo = true
    const cargar = async () => {
      const datos = await json<Record<string, unknown>[]>(`${API_URL}/api/datos-sensores`)
      if (!vivo) return
      if (datos) { setDocs(datos); setError(null) } else setError("No se pudieron leer los sensores")
      setCargando(false)
      setAhora(new Date())
    }
    const cargarPred = async () => {
      const [t, r, a] = await Promise.all([
        json<{ predictions: unknown[] }>(`${PRED_URL}/predictions/temperature?days=7`),
        json<{ predictions: unknown[] }>(`${PRED_URL}/predictions/rainfall?days=7`),
        json<{ alerts: { type: string; title: string; message: string }[] }>(`${PRED_URL}/predictions/alerts`),
      ])
      if (!vivo) return
      setPred({
        t: t?.predictions ?? [],
        r: r?.predictions ?? [],
        a: (a?.alerts ?? []).map((x) => ({ nivel: x.type === "danger" ? "bad" : x.type === "warning" ? "warn" : "info", titulo: x.title, detalle: x.message })),
      })
    }
    cargar()
    cargarPred()
    const id = setInterval(cargar, REFRESCO_MS)
    return () => { vivo = false; clearInterval(id) }
  }, [])

  useEffect(() => {
    const socket = io(API_URL, { withCredentials: true, reconnectionAttempts: 5, timeout: 20000 })
    socket.on("connect", () => setEnVivo(true))
    socket.on("disconnect", () => setEnVivo(false))
    socket.on("connect_error", () => setEnVivo(false))
    socket.on("nueva-lectura", (lectura: Record<string, unknown>) => {
      setDocs((prev) => [lectura, ...prev].slice(0, 2000))
      setAhora(new Date())
    })
    return () => { socket.disconnect() }
  }, [])

  const panel = useMemo(() => construirPanel(docs, ahora), [docs, ahora])
  const pronostico = useMemo(() => pronosticoPorDia(pred.t as never, pred.r as never), [pred])
  return { panel, pronostico, alertasModelo: pred.a, cargando, error, enVivo, ahora }
}
