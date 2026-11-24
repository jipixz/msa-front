// Los 20 estilos del panel: cada uno carga sin errores, aplica su acomodo y no desborda.
import { expect, test, type Page } from "@playwright/test"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const DIR = path.dirname(fileURLToPath(import.meta.url))
const registro = fs.readFileSync(path.join(DIR, "..", "src", "estilos", "registro.ts"), "utf8")
const ESTILOS = [...registro.matchAll(/id: "([ck]\d\d-[a-z]+)", nombre: "[^"]+", grupo: "\w+", acomodo: "(\w+)"/g)].map((m) => ({ id: m[1], acomodo: m[2] }))
const ADMIN = { _id: "u1", email: "admin@example.com", name: "Admin Prueba", role: "admin", isActive: true, provider: "local" }

// 8 nodos sintéticos recientes: N4 seco, N7 sin señal
function lecturas() {
  const ahora = Date.now(), out: Record<string, unknown>[] = []
  for (let nodo = 1; nodo <= 8; nodo++) for (let i = 0; i < 24; i++) {
    if (nodo === 7 && i > 18) continue
    out.push({ nodo, fecha: new Date(ahora - (23 - i) * 3600e3).toISOString(), humedadSuelo: nodo === 4 ? 33 - i * 0.5 : 40 + nodo, temperaturaDS: 26, temperaturaBME: 29, presion: 1009, humedadAire: 80 })
  }
  return out
}

async function simular(page: Page) {
  await page.route(/msabackend\.jipixz\.com|fastapimsa\.jipixz\.com/, (route) => {
    const p = new URL(route.request().url()).pathname
    const json = (b: unknown) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(b) })
    if (p.startsWith("/socket.io")) return route.abort()
    if (p === "/auth/me") return json({ user: ADMIN })
    if (p === "/api/datos-sensores") return json(lecturas())
    if (p.startsWith("/predictions/")) return json({ predictions: [], alerts: [] })
    return json({})
  })
}

test("el registro expone 20 estilos", () => {
  expect(ESTILOS).toHaveLength(20)
})

for (const e of ESTILOS) {
  test(`estilo ${e.id}: panel sin errores, con su acomodo y sin desborde`, async ({ page }) => {
    const errores: string[] = []
    page.on("pageerror", (err) => errores.push(err.message))
    await page.addInitScript((id) => localStorage.setItem("msa-estilo", JSON.stringify({ estilo: id, variante: "" })), e.id)
    await simular(page)
    await page.goto("/")
    await expect(page.locator(`[data-acomodo="${e.acomodo}"]`)).toBeVisible()
    await expect(page.locator("html")).toHaveAttribute("data-estilo", e.id)
    await expect(page.getByText(/N4/).first()).toBeVisible()
    const desborda = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
    expect(desborda, "desborde horizontal").toBe(false)
    expect(errores, errores.join("\n")).toEqual([])
  })
}

test("el selector cambia el estilo y lo recuerda al recargar", async ({ page }) => {
  await simular(page)
  await page.goto("/")
  await page.getByRole("button", { name: /cambiar estilo/i }).click()
  const tarjeta = page.getByRole("dialog").locator("div", { hasText: /^Modo dev \/ Termux/ }).first()
  await tarjeta.getByRole("button", { name: /GitHub/ }).click()
  await expect(page.locator("html")).toHaveAttribute("data-estilo", "k01-termux")
  await expect(page.locator("html")).toHaveAttribute("data-variante", "github")
  await page.keyboard.press("Escape")
  await page.reload()
  await expect(page.locator("html")).toHaveAttribute("data-estilo", "k01-termux")
  await expect(page.locator('[data-acomodo="terminal"]')).toBeVisible()
})
