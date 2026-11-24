// Revisa el build (dist/) antes de desplegar: decisiones que no deben romperse.
// Uso: npm run build && node scripts/check-build.mjs
import fs from "node:fs"
import path from "node:path"

const dir = path.resolve("dist/assets")
const js = fs.readdirSync(dir).filter((f) => f.endsWith(".js")).map((f) => fs.readFileSync(path.join(dir, f), "utf8")).join("\n")

const reglas = [
  ["contiene la URL del backend", () => js.includes("msabackend.jipixz.com")],
  ["contiene la URL de predicciones", () => js.includes("fastapimsa.jipixz.com")],
  ["no apunta al puerto viejo de predicciones (localhost:23457)", () => !js.includes("localhost:23457")],
  ["no tiene placeholders tu-dominio", () => !js.includes("tu-dominio")],
  ["usa apiFetch con credenciales (cookies de Access)", () => js.includes('credentials:"include"')],
  ["incluye la renovación de Access (/access/return)", () => js.includes("/access/return")],
]

let fallas = 0
for (const [nombre, ok] of reglas) {
  const pasa = ok()
  if (!pasa) fallas++
  console.log(`${pasa ? "ok  " : "FALLA"} ${nombre}`)
}
process.exit(fallas ? 1 : 0)
