import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { ESTILO_POR_DEFECTO, ESTILOS, SIN_PERSONALIZAR, aplicarPersonalizacion, buscarEstilo, buscarVariante, variablesCss, type Estilo, type Paleta, type Personalizacion, type Variante } from "@/estilos/registro"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  /** Compatibilidad con el botón claro/oscuro: refleja si la variante actual es oscura. */
  theme: Theme
  setTheme: (theme: Theme) => void
  /** Modo preferido del usuario; se conserva al pasar por estilos que solo tienen una variante. */
  modo: "claro" | "oscuro"
  estilo: Estilo
  variante: Variante
  setEstilo: (estiloId: string, varianteId?: string) => void
  setVariante: (varianteId: string) => void
  estilos: Estilo[]
  /** Personalización (fondo y acentos) del estilo indicado; la del actual si no se indica. */
  personalizacionDe: (estiloId?: string) => Personalizacion
  setPersonalizacion: (estiloId: string, p: Personalizacion) => void
  /** Paleta final del estilo actual con la personalización aplicada. */
  paleta: Paleta
}

const CLAVE = "msa-estilo"

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

type Modo = "claro" | "oscuro"
type Seleccion = { estilo: string; variante: string; modo: Modo; per?: Record<string, Personalizacion> }

function leerGuardado(storageKey: string, defaultTheme: Theme): Seleccion {
  try {
    const g = JSON.parse(localStorage.getItem(CLAVE) || "null")
    if (g?.estilo) {
      // El modo preferido se guarda aparte: si no existe (versión anterior), sale de la variante
      const modo: Modo = g.modo === "claro" || g.modo === "oscuro" ? g.modo
        : buscarVariante(buscarEstilo(g.estilo), g.variante).paleta.oscuro ? "oscuro" : "claro"
      return { estilo: g.estilo, variante: g.variante, modo, per: g.per && typeof g.per === "object" ? g.per : {} }
    }
  } catch {
    // valor corrupto: se ignora
  }
  // Migración del selector viejo (vite-ui-theme = dark | light | system)
  const viejo = (localStorage.getItem(storageKey) as Theme) || defaultTheme
  const prefiereOscuro = viejo === "dark" || (viejo === "system" && window.matchMedia?.("(prefers-color-scheme: dark)").matches)
  const modo: Modo = prefiereOscuro ? "oscuro" : "claro"
  return { estilo: ESTILO_POR_DEFECTO.estilo, variante: modo, modo, per: {} }
}

/** Variante del estilo que respeta el modo preferido; si el estilo no la tiene, su primera variante. */
export function varianteParaModo(estilo: Estilo, modo: Modo): Variante {
  return estilo.variantes.find((v) => v.paleta.oscuro === (modo === "oscuro")) ?? estilo.variantes[0]
}

const tieneAmbosModos = (e: Estilo) => e.variantes.some((v) => v.paleta.oscuro) && e.variantes.some((v) => !v.paleta.oscuro)

/** Carga (una sola vez por estilo) las fuentes de Google del estilo. */
export function cargarFuentes(estilo: Estilo) {
  const id = `fuentes-${estilo.id}`
  if (document.getElementById(id)) return
  const link = document.createElement("link")
  link.id = id
  link.rel = "stylesheet"
  link.href = `https://fonts.googleapis.com/css2?${estilo.googleFonts}&display=swap`
  document.head.appendChild(link)
}

export function ThemeProvider({ children, defaultTheme = "dark", storageKey = "vite-ui-theme" }: ThemeProviderProps) {
  const [sel, setSel] = useState(() => leerGuardado(storageKey, defaultTheme))
  const estilo = buscarEstilo(sel.estilo)
  const variante = buscarVariante(estilo, sel.variante)
  const per = sel.per?.[estilo.id] ?? SIN_PERSONALIZAR
  const paleta = useMemo(() => aplicarPersonalizacion(estilo, variante, per), [estilo, variante, per])

  useEffect(() => {
    const root = document.documentElement
    for (const [k, v] of Object.entries(variablesCss(estilo, variante, per))) root.style.setProperty(k, v)
    root.classList.remove("light", "dark")
    root.classList.add(paleta.oscuro ? "dark" : "light")
    root.dataset.estilo = estilo.id
    root.dataset.variante = variante.id
    root.dataset.efectos = estilo.efectos.join(" ")
    root.style.colorScheme = paleta.oscuro ? "dark" : "light"
    cargarFuentes(estilo)
    localStorage.setItem(CLAVE, JSON.stringify({ estilo: estilo.id, variante: variante.id, modo: sel.modo, per: sel.per ?? {} }))
  }, [estilo, variante, sel.modo, sel.per, per, paleta])

  const value = useMemo<ThemeProviderState>(() => {
    // Elegir una variante a mano solo cambia el modo preferido si el estilo tiene claro y oscuro
    // (pasar por Termux o neón, que solo son oscuros, no debe borrar tu preferencia por "claro").
    const elegir = (e: Estilo, v: Variante) => setSel((s) => ({
      ...s, estilo: e.id, variante: v.id, modo: tieneAmbosModos(e) ? (v.paleta.oscuro ? "oscuro" : "claro") : s.modo,
    }))
    return {
      theme: paleta.oscuro ? "dark" : "light",
      modo: sel.modo,
      setTheme: (t) => {
        const quiereOscuro = t === "dark" || (t === "system" && window.matchMedia?.("(prefers-color-scheme: dark)").matches)
        const modo: Modo = quiereOscuro ? "oscuro" : "claro"
        const v = estilo.variantes.find((x) => x.paleta.oscuro === quiereOscuro)
        setSel((s) => {
          const perActual = s.per?.[estilo.id] ?? SIN_PERSONALIZAR
          // Si el estilo tiene variante con ese brillo se usa (y se quita un fondo personalizado
          // que lo contradiga); si no la tiene (Termux, neón...), se cambia el fondo personalizado.
          const fondoContradice = perActual.fondo !== "estilo" && aplicarPersonalizacion(estilo, v ?? variante, perActual).oscuro !== quiereOscuro
          const fondo = v
            ? (fondoContradice ? "estilo" : perActual.fondo)
            : (variante.paleta.oscuro === quiereOscuro ? "estilo" : quiereOscuro ? "oscuro-gris" : "claro")
          return { ...s, estilo: estilo.id, variante: (v ?? variante).id, modo, per: { ...(s.per ?? {}), [estilo.id]: { ...perActual, fondo } } }
        })
      },
      estilo,
      variante,
      setEstilo: (estiloId, varianteId) => {
        const e = buscarEstilo(estiloId)
        if (varianteId) return elegir(e, buscarVariante(e, varianteId))
        // Sin variante: la que respeta el modo preferido (no el de la variante actual)
        setSel((s) => ({ ...s, estilo: e.id, variante: varianteParaModo(e, s.modo).id }))
      },
      setVariante: (varianteId) => elegir(estilo, buscarVariante(estilo, varianteId)),
      estilos: ESTILOS,
      personalizacionDe: (id) => sel.per?.[id ?? estilo.id] ?? SIN_PERSONALIZAR,
      setPersonalizacion: (id, p) => setSel((s) => ({ ...s, per: { ...(s.per ?? {}), [id]: p } })),
      paleta,
    }
  }, [estilo, variante, sel.modo, sel.per, paleta])

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
