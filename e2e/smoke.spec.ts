// Pruebas de humo del build de producción con las APIs simuladas (sin tocar la Pi ni Mongo).
// Datos: e2e/fixtures (predicciones reales de fastapimsa y 24 lecturas sintéticas de sensores).
import { expect, test, type Page } from "@playwright/test"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const FIX = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures")
const leer = (f: string) => fs.readFileSync(path.join(FIX, f), "utf8")
const ADMIN = { _id: "u1", email: "admin@example.com", name: "Admin Prueba", role: "admin", isActive: true, provider: "local" }

async function simularApis(page: Page, { conSesion = true } = {}) {
  const pedidas: string[] = []
  await page.route(/msabackend\.jipixz\.com|fastapimsa\.jipixz\.com|localhost:5000|localhost:23457/, async (route) => {
    const url = new URL(route.request().url())
    pedidas.push(url.href)
    const p = url.pathname
    const json = (body: unknown, status = 200) =>
      route.fulfill({ status, contentType: "application/json", body: typeof body === "string" ? body : JSON.stringify(body) })
    if (p.startsWith("/socket.io")) return route.abort()
    if (p === "/auth/me") return conSesion ? json({ user: ADMIN }) : json({ message: "no autenticado" }, 401)
    if (p === "/api/datos-sensores" || p === "/api/humedad") return json(leer("datos-sensores.json"))
    if (p.startsWith("/predictions/")) {
      const f = `f_pred_${p.split("/")[2]}.json`
      return fs.existsSync(path.join(FIX, f)) ? json(leer(f)) : json({})
    }
    if (p === "/api/production") return json([])
    if (p === "/api/production/stats") return json({})
    if (p === "/api/notifier/rules") return json({ rules: [{ _id: "r1", key: "suelo_seco", name: "Suelo seco", enabled: true, nodes: [], match: "all", conditions: [{ field: "humedadSuelo", op: "<", value: 30 }], cooldownMinutes: 60, channels: [], message: { title: "Suelo seco", body: "", priority: "high" } }] })
    if (p.startsWith("/api/notifier/history")) return json({ logs: [] })
    return json({})
  })
  return pedidas
}

function erroresDePagina(page: Page) {
  const errores: string[] = []
  page.on("pageerror", (e) => errores.push(e.message))
  return errores
}

test("sin sesión, cualquier ruta protegida manda al login", async ({ page }) => {
  await simularApis(page, { conSesion: false })
  await page.goto("/predictions")
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole("button", { name: /iniciar sesión/i })).toBeVisible()
})

for (const [nombre, ruta] of [["dashboard", "/"], ["predicciones", "/predictions"], ["producción", "/production"], ["notificador", "/admin/notifier"]] as const) {
  test(`${nombre} carga sin errores de JavaScript`, async ({ page }) => {
    const errores = erroresDePagina(page)
    await simularApis(page)
    await page.goto(ruta)
    await page.waitForLoadState("networkidle")
    await expect(page).not.toHaveURL(/\/login/)
    expect(errores, errores.join("\n")).toEqual([])
  })
}

test("predicciones pide datos a fastapimsa, nunca a localhost", async ({ page }) => {
  const pedidas = await simularApis(page)
  await page.goto("/predictions")
  await page.waitForLoadState("networkidle")
  expect(pedidas.some((u) => u.startsWith("https://fastapimsa.jipixz.com/predictions/"))).toBe(true)
  expect(pedidas.filter((u) => u.includes("localhost"))).toEqual([])
})

test("ninguna petición al backend lleva doble barra (//api)", async ({ page }) => {
  const pedidas = await simularApis(page)
  for (const ruta of ["/", "/production", "/admin/notifier"]) {
    await page.goto(ruta)
    await page.waitForLoadState("networkidle")
  }
  expect(pedidas.filter((u) => /jipixz\.com\/\//.test(u))).toEqual([])
})

test("la pantalla del notificador muestra las reglas (Grupo B)", async ({ page }) => {
  await simularApis(page)
  await page.goto("/admin/notifier")
  await expect(page.getByText("Suelo seco").first()).toBeVisible()
})

test("sin desborde horizontal en ninguna página", async ({ page }) => {
  await simularApis(page)
  for (const ruta of ["/", "/predictions", "/production"]) {
    await page.goto(ruta)
    await page.waitForLoadState("networkidle")
    const desborda = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
    expect(desborda, `desborde en ${ruta}`).toBe(false)
  }
})
