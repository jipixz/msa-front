// Los 20 estilos: estructura completa y contraste WCAG de cada variante.
import { describe, expect, it } from "vitest"
import { ESTILOS, buscarEstilo, buscarVariante, hexAHsl, variablesCss, type Paleta } from "./registro"
import { ACOMODOS } from "@/panel/PanelFinca"

function luminancia(hex: string) {
  const c = hex.replace("#", "").match(/.{2}/g)!.map((x) => parseInt(x, 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
export function contraste(a: string, b: string) {
  const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

describe("registro de estilos", () => {
  it("tiene 10 conservadoras y 10 creativas con ids únicos", () => {
    expect(ESTILOS.filter((e) => e.grupo === "conservadora")).toHaveLength(10)
    expect(ESTILOS.filter((e) => e.grupo === "creativa")).toHaveLength(10)
    expect(new Set(ESTILOS.map((e) => e.id)).size).toBe(20)
  })

  it("cada acomodo tiene implementación en el panel", () => {
    for (const e of ESTILOS) expect(ACOMODOS[e.acomodo], e.id).toBeTypeOf("function")
  })

  it("variantes con ids únicos dentro de cada estilo", () => {
    for (const e of ESTILOS) expect(new Set(e.variantes.map((v) => v.id)).size, e.id).toBe(e.variantes.length)
  })

  it("buscar con id desconocido cae en el primero (no rompe la app)", () => {
    expect(buscarEstilo("no-existe").id).toBe("c01-senal")
    expect(buscarVariante(ESTILOS[0], "x").id).toBe(ESTILOS[0].variantes[0].id)
  })

  it("hexAHsl convierte a 'h s% l%'", () => {
    expect(hexAHsl("#ffffff")).toBe("0.0 0.0% 100.0%")
    expect(hexAHsl("#000000")).toBe("0.0 0.0% 0.0%")
    expect(hexAHsl("#ff0000")).toBe("0.0 100.0% 50.0%")
  })

  it("variablesCss define todas las variables que usa Tailwind", () => {
    const v = variablesCss(ESTILOS[0], ESTILOS[0].variantes[0])
    for (const k of ["--background", "--foreground", "--card", "--primary", "--primary-foreground", "--muted-foreground",
      "--border", "--ok", "--warn", "--bad", "--info", "--chart-1", "--chart-5", "--radius", "--font-sans", "--font-mono", "--font-display"]) {
      expect(v[k], k).toBeTruthy()
    }
  })
})

// WCAG 2.1: texto normal ≥ 4.5:1. Los estados (ok/warn/bad/info) aparecen como texto pequeño.
const PARES: [keyof Paleta, keyof Paleta, number][] = [
  ["texto", "fondo", 4.5],
  ["texto", "superficie", 4.5],
  ["texto2", "superficie", 4.5],
  ["texto2", "fondo", 4.5],
  ["textoSobreAcento", "acento", 4.5],
  ["acento", "superficie", 3],
  ["ok", "superficie", 4.5],
  ["warn", "superficie", 4.5],
  ["bad", "superficie", 4.5],
  ["info", "superficie", 4.5],
]

describe("contraste WCAG por estilo y variante", () => {
  for (const e of ESTILOS) {
    for (const v of e.variantes) {
      it(`${e.id} / ${v.id}`, () => {
        const fallas = PARES
          .map(([a, b, min]) => ({ a, b, min, r: contraste(v.paleta[a] as string, v.paleta[b] as string) }))
          .filter((x) => x.r < x.min)
          .map((x) => `${String(x.a)} sobre ${String(x.b)}: ${x.r.toFixed(2)} < ${x.min}`)
        expect(fallas).toEqual([])
      })
    }
  }
})

describe("personalización: todo lo elegible se lee", () => {
  it("cualquier estilo × variante × fondo × acento cumple contraste", async () => {
    const { FONDOS, ACENTOS_SUGERIDOS, aplicarPersonalizacion } = await import("./registro")
    const fondos = ["estilo", ...FONDOS.map((f) => f.id)] as const
    const fallas: string[] = []
    let combinaciones = 0
    for (const e of ESTILOS) for (const v of e.variantes) for (const fondo of fondos) for (const acento of [null, ...ACENTOS_SUGERIDOS]) {
      const p = aplicarPersonalizacion(e, v, { fondo, acento, acento2: acento })
      combinaciones++
      const req: [string, string, string, number][] = [
        ["texto/fondo", p.texto, p.fondo, 4.5], ["texto2/superficie", p.texto2, p.superficie, 4.5],
        ["acento/superficie", p.acento, p.superficie, 3], ["sobreAcento/acento", p.textoSobreAcento, p.acento, 4.5],
        ["ok", p.ok, p.superficie, 4.5], ["warn", p.warn, p.superficie, 4.5], ["bad", p.bad, p.superficie, 4.5], ["info", p.info, p.superficie, 4.5],
      ]
      for (const [n, a, b, min] of req) if (contraste(a, b) < min) fallas.push(`${e.id}/${v.id}/${fondo}/${acento}: ${n} ${contraste(a, b).toFixed(2)}`)
    }
    expect(combinaciones).toBeGreaterThan(4000) // 42 variantes × 7 fondos × 15 acentos
    expect(fallas.slice(0, 10)).toEqual([])
  })

  it("sin personalizar devuelve la paleta original del estilo", async () => {
    const { aplicarPersonalizacion, SIN_PERSONALIZAR } = await import("./registro")
    const e = ESTILOS[5]
    expect(aplicarPersonalizacion(e, e.variantes[0], SIN_PERSONALIZAR)).toBe(e.variantes[0].paleta)
  })

  it("un acento ilegible se ajusta (amarillo sobre fondo claro)", async () => {
    const { aplicarPersonalizacion } = await import("./registro")
    const p = aplicarPersonalizacion(ESTILOS[0], ESTILOS[0].variantes[0], { fondo: "claro", acento: "#ffe600", acento2: null })
    expect(p.acento).not.toBe("#ffe600")
    expect(contraste(p.acento, p.superficie)).toBeGreaterThanOrEqual(3)
  })
})
