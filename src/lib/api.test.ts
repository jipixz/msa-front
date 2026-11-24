// Pruebas de src/lib/api.ts: URL del backend y renovación de la cookie de Cloudflare Access.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const API = "https://msabackend.jipixz.com"
const PRED = "https://fastapimsa.jipixz.com"

async function cargar({ prod = true } = {}) {
  vi.resetModules()
  const mod = await import("./api")
  const navegar = vi.fn()
  mod.accessDeps.navegar = navegar
  mod.accessDeps.prod = prod
  mod.api.defaults.baseURL = API
  return { ...mod, navegar }
}

// Espera a que terminen las promesas encadenadas de reautenticación (ping + navegación).
const esperar = () => new Promise((r) => setTimeout(r, 0))

beforeEach(() => sessionStorage.clear())
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("API_URL", () => {
  it("quita la barra final de VITE_API_URL (decisión de ae25f42: evita //api → 404)", async () => {
    const { normalizarApiUrl } = await cargar()
    expect(normalizarApiUrl(`${API}/`)).toBe(API)
    expect(normalizarApiUrl(`${API}///`)).toBe(API)
    expect(normalizarApiUrl(API)).toBe(API)
  })

  it("usa localhost:5000 si no hay VITE_API_URL", async () => {
    const { normalizarApiUrl } = await cargar()
    expect(normalizarApiUrl(undefined)).toBe("http://localhost:5000")
    expect(normalizarApiUrl("")).toBe("http://localhost:5000")
  })
})

describe("apiFetch", () => {
  it("manda credenciales (cookie de Access) en cada petición", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)
    const { apiFetch } = await cargar()
    await apiFetch(`${PRED}/predictions/alerts`)
    expect(fetchMock).toHaveBeenCalledWith(`${PRED}/predictions/alerts`, expect.objectContaining({ credentials: "include" }))
  })

  it("si falla la red y el ping también, navega a <api>/access/return con la página actual", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")))
    const { apiFetch, navegar } = await cargar()
    await expect(apiFetch(`${PRED}/predictions/alerts`)).rejects.toThrow("Failed to fetch")
    await esperar()
    expect(navegar).toHaveBeenCalledWith(
      `${PRED}/access/return?to=${encodeURIComponent("https://msafront.jipixz.com/predictions?x=1")}`,
    )
  })

  it("si el ping responde, el error no era de Access: no navega", async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(new Response("{}", { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)
    const { apiFetch, navegar } = await cargar()
    await expect(apiFetch(`${PRED}/predictions/alerts`)).rejects.toThrow()
    await esperar()
    expect(fetchMock).toHaveBeenLastCalledWith(`${PRED}/access/ping`, expect.anything())
    expect(navegar).not.toHaveBeenCalled()
  })

  it("no redirige dos veces en menos de un minuto (API caída de verdad)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")))
    const { apiFetch, navegar } = await cargar()
    await apiFetch(`${PRED}/a`).catch(() => {})
    await esperar()
    await apiFetch(`${PRED}/b`).catch(() => {})
    await esperar()
    expect(navegar).toHaveBeenCalledTimes(1)
  })

  it("un AbortError (petición cancelada) no dispara la reautenticación", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new DOMException("aborted", "AbortError")))
    const { apiFetch, navegar } = await cargar()
    await apiFetch(`${PRED}/a`).catch(() => {})
    await esperar()
    expect(navegar).not.toHaveBeenCalled()
  })

  it("en desarrollo (no PROD) nunca navega", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")))
    const { apiFetch, navegar } = await cargar({ prod: false })
    await apiFetch(`${PRED}/a`).catch(() => {})
    await esperar()
    expect(navegar).not.toHaveBeenCalled()
  })
})

describe("axios api", () => {
  it("un ERR_NETWORK sin respuesta reautentica contra el backend", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")))
    const { api, navegar } = await cargar()
    const { AxiosError } = await import("axios")
    api.defaults.adapter = (config) => Promise.reject(new AxiosError("Network Error", "ERR_NETWORK", config))
    await expect(api.get("/api/datos-sensores")).rejects.toThrow("Network Error")
    await esperar()
    expect(navegar).toHaveBeenCalledWith(expect.stringMatching(/^https:\/\/msabackend\.jipixz\.com\/access\/return\?to=/))
  })

  it("una respuesta HTTP con error (p. ej. 500) no reautentica", async () => {
    const { api, navegar } = await cargar()
    const { AxiosError } = await import("axios")
    api.defaults.adapter = (config) =>
      Promise.reject(new AxiosError("500", "ERR_BAD_RESPONSE", config, null, { status: 500, data: {}, headers: {}, statusText: "", config } as never))
    await expect(api.get("/api/x")).rejects.toThrow()
    await esperar()
    expect(navegar).not.toHaveBeenCalled()
  })
})
