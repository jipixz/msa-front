import axios from "axios"

// Sin "/" final: las rutas se concatenan como `${API_URL}/api/...` y una doble barra da 404.
export function normalizarApiUrl(raw: string | undefined) {
  return (raw || "http://localhost:5000").replace(/\/+$/, "")
}
export const API_URL = normalizarApiUrl(import.meta.env.VITE_API_URL)

// --- Cloudflare Access -------------------------------------------------------------------
// msabackend y fastapimsa están detrás de Cloudflare Access. Cuando la cookie
// CF_Authorization de ese host expira, Access responde a fetch/axios con un redirect a su
// página de login; el navegador lo bloquea por CORS y solo vemos un "error de red".
// La única forma de renovar la cookie es una navegación de nivel superior a ese host, así
// que mandamos la pestaña a <api>/access/return?to=<página actual>: Access renueva la cookie
// (o pide login) y esa ruta del API nos regresa a la página donde estábamos.

const REAUTH_INTERVALO_MS = 60_000  // no repetir la redirección más de una vez por minuto

// Dependencias inyectables: las pruebas las reemplazan (en jsdom no se puede simular
// window.location y Vitest no propaga import.meta.env al módulo).
export const accessDeps = {
  prod: Boolean(import.meta.env.PROD),
  navegar: (url: string) => window.location.assign(url),
}

async function reautenticarSiAccessExpiro(url: string) {
  if (!accessDeps.prod) return
  if (typeof window === "undefined" || !navigator.onLine) return

  let origin: string
  try {
    origin = new URL(url, window.location.href).origin
  } catch {
    return
  }
  if (origin === window.location.origin) return

  // Si el API responde (aunque sea con error), el problema no fue Access.
  try {
    await fetch(`${origin}/access/ping`, { credentials: "include", cache: "no-store" })
    return
  } catch {
    // Tampoco responde: Access redirigió al login (o el API está caído).
  }

  // Evita un ciclo de redirecciones si el API está caído de verdad.
  const clave = `access-reauth:${origin}`
  const ultimo = Number(sessionStorage.getItem(clave) || 0)
  if (Date.now() - ultimo < REAUTH_INTERVALO_MS) return
  sessionStorage.setItem(clave, String(Date.now()))

  accessDeps.navegar(`${origin}/access/return?to=${encodeURIComponent(window.location.href)}`)
}

export { reautenticarSiAccessExpiro }

// fetch hacia nuestras APIs, siempre con cookies: si msabackend/fastapimsa están detrás
// de Cloudflare Access, el navegador debe mandar la cookie CF_Authorization.
export async function apiFetch(url: string, init: RequestInit = {}) {
  try {
    return await fetch(url, { credentials: "include", ...init })
  } catch (error) {
    // fetch lanza TypeError ante fallas de red/CORS (un AbortError no entra aquí)
    if (error instanceof TypeError) void reautenticarSiAccessExpiro(url)
    throw error
  }
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && !error.response && error.code === "ERR_NETWORK") {
      void reautenticarSiAccessExpiro(error.config?.baseURL || API_URL)
    }
    return Promise.reject(error)
  },
)

/** Mensaje legible de un error: el que mandó el backend, el del Error o el texto por defecto. */
export function mensajeError(e: unknown, porDefecto = "Ocurrió un error") {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data as { message?: unknown } | undefined
    if (typeof data?.message === "string") return data.message
  }
  return e instanceof Error && e.message ? e.message : porDefecto
}
