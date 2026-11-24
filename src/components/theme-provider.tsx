import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { ESTILO_POR_DEFECTO, ESTILOS, buscarEstilo, buscarVariante, variablesCss, type Estilo, type Variante } from "@/estilos/registro"

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
  estilo: Estilo
  variante: Variante
  setEstilo: (estiloId: string, varianteId?: string) => void
  setVariante: (varianteId: string) => void
  estilos: Estilo[]
}

const CLAVE = "msa-estilo"

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

function leerGuardado(storageKey: string, defaultTheme: Theme) {
  try {
    const g = JSON.parse(localStorage.getItem(CLAVE) || "null")
    if (g?.estilo) return g as { estilo: string; variante: string }
  } catch {
    // valor corrupto: se ignora
  }
  // Migración del selector viejo (vite-ui-theme = dark | light | system)
  const viejo = (localStorage.getItem(storageKey) as Theme) || defaultTheme
  const prefiereOscuro = viejo === "dark" || (viejo === "system" && window.matchMedia?.("(prefers-color-scheme: dark)").matches)
  return { estilo: ESTILO_POR_DEFECTO.estilo, variante: prefiereOscuro ? "oscuro" : "claro" }
}

/** Carga (una sola vez por estilo) las fuentes de Google del estilo. */
function cargarFuentes(estilo: Estilo) {
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

  useEffect(() => {
    const root = document.documentElement
    for (const [k, v] of Object.entries(variablesCss(estilo, variante))) root.style.setProperty(k, v)
    root.classList.remove("light", "dark")
    root.classList.add(variante.paleta.oscuro ? "dark" : "light")
    root.dataset.estilo = estilo.id
    root.dataset.variante = variante.id
    root.dataset.efectos = estilo.efectos.join(" ")
    root.style.colorScheme = variante.paleta.oscuro ? "dark" : "light"
    cargarFuentes(estilo)
    localStorage.setItem(CLAVE, JSON.stringify({ estilo: estilo.id, variante: variante.id }))
  }, [estilo, variante])

  const value = useMemo<ThemeProviderState>(() => ({
    theme: variante.paleta.oscuro ? "dark" : "light",
    setTheme: (t) => {
      const quiereOscuro = t === "dark" || (t === "system" && window.matchMedia?.("(prefers-color-scheme: dark)").matches)
      // La primera variante del estilo con ese brillo; si no hay, la siguiente variante
      const candidata = estilo.variantes.find((v) => v.paleta.oscuro === quiereOscuro && v.id !== variante.id)
        ?? estilo.variantes.find((v) => v.paleta.oscuro === quiereOscuro)
        ?? estilo.variantes[(estilo.variantes.indexOf(variante) + 1) % estilo.variantes.length]
      setSel({ estilo: estilo.id, variante: candidata.id })
    },
    estilo,
    variante,
    setEstilo: (estiloId, varianteId) => {
      const e = buscarEstilo(estiloId)
      // Al cambiar de estilo se intenta conservar el brillo (oscuro/claro) actual
      const v = varianteId ? buscarVariante(e, varianteId)
        : e.variantes.find((x) => x.paleta.oscuro === variante.paleta.oscuro) ?? e.variantes[0]
      setSel({ estilo: e.id, variante: v.id })
    },
    setVariante: (varianteId) => setSel({ estilo: estilo.id, variante: buscarVariante(estilo, varianteId).id }),
    estilos: ESTILOS,
  }), [estilo, variante])

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
