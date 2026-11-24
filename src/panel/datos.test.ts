import { describe, expect, it } from "vitest"
import { construirPanel, enRango, fmt, haceCuanto, normalizarLectura, pronosticoPorDia, MINUTOS_SIN_SENAL } from "./datos"

const AHORA = new Date("2026-11-24T12:00:00Z")
const hace = (min: number) => new Date(AHORA.getTime() - min * 60000).toISOString()

describe("normalizarLectura", () => {
  it("documentos viejos sin nodo cuentan como nodo 0", () => {
    expect(normalizarLectura({ fecha: hace(5), humedadSuelo: 40 }).lectura?.nodo).toBe(0)
  })

  it("descarta valores imposibles (el 700 % de un ADC al aire) y avisa cuáles", () => {
    const { lectura, fueraDeRango } = normalizarLectura({ fecha: hace(5), humedadSuelo: 700, temperaturaDS: 26.4, presion: 99 })
    expect(lectura?.humedadSuelo).toBeUndefined()
    expect(lectura?.temperaturaDS).toBe(26.4)
    expect(fueraDeRango).toEqual(["humedadSuelo", "presion"])
  })

  it("una fecha inválida descarta la lectura", () => {
    expect(normalizarLectura({ fecha: "no-es-fecha", humedadSuelo: 40 }).lectura).toBeNull()
  })

  it("enRango rechaza NaN, texto y extremos", () => {
    expect(enRango("humedadSuelo", NaN)).toBe(false)
    expect(enRango("humedadSuelo", "40")).toBe(false)
    expect(enRango("humedadSuelo", 100)).toBe(true)
    expect(enRango("humedadSuelo", 100.1)).toBe(false)
  })
})

describe("construirPanel", () => {
  const docs = [
    { nodo: 1, fecha: hace(3), humedadSuelo: 46, temperaturaBME: 29 },
    { nodo: 1, fecha: hace(60), humedadSuelo: 47 },
    { nodo: 4, fecha: hace(12), humedadSuelo: 21 },
    { nodo: 7, fecha: hace(MINUTOS_SIN_SENAL + 30), humedadSuelo: 44 },
    { nodo: 9, fecha: hace(2), humedadSuelo: 700 },
    { nodo: 5, fecha: hace(8), humedadSuelo: 95 },
  ]
  const p = construirPanel(docs, AHORA)
  const estado = (id: number) => p.nodos.find((n) => n.id === id)?.estado

  it("clasifica cada nodo por su última lectura", () => {
    expect(estado(1)).toBe("ok")
    expect(estado(4)).toBe("seco")
    expect(estado(7)).toBe("sin-senal")
    expect(estado(9)).toBe("fuera-de-rango")
    expect(estado(5)).toBe("encharcado")
  })

  it("los nodos van ordenados por id y cuentan los que están en línea", () => {
    expect(p.nodos.map((n) => n.id)).toEqual([1, 4, 5, 7, 9])
    expect(p.enLinea).toBe(4)
  })

  it("el promedio ignora valores imposibles", () => {
    // 46 (N1), 21 (N4), 95 (N5), 44 (N7); N9 no tiene humedad válida
    expect(p.promedios.humedadSuelo).toBeCloseTo((46 + 21 + 95 + 44) / 4)
  })

  it("genera una alerta por cada nodo con problema", () => {
    expect(p.alertas.map((a) => a.nodo).sort()).toEqual([4, 5, 7, 9])
    expect(p.alertas.find((a) => a.nodo === 7)?.nivel).toBe("bad")
  })

  it("sin documentos: panel vacío sin errores", () => {
    const vacio = construirPanel([], AHORA)
    expect(vacio.nodos).toEqual([])
    expect(vacio.promedios.humedadSuelo).toBeNull()
    expect(vacio.ultimaLectura).toBeNull()
  })
})

describe("pronosticoPorDia", () => {
  it("agrupa por día: máxima de temperatura y suma de lluvia", () => {
    const t = [{ day: "2026-11-24", predicted: 30 }, { day: "2026-11-24", predicted: 33 }, { day: "2026-11-25", predicted: 35 }]
    const r = [{ day: "2026-11-24", predicted: 0.5 }, { day: "2026-11-24", predicted: 1.5 }, { day: "2026-11-25", predicted: -1 }]
    const dias = pronosticoPorDia(t, r)
    expect(dias.map((d) => [d.fecha, d.tMax, d.lluviaMm])).toEqual([["2026-11-24", 33, 2], ["2026-11-25", 35, 0]])
    expect(dias[0].etiqueta).not.toMatch(/hoy/i)
  })
})

describe("formatos", () => {
  it("haceCuanto", () => {
    expect(haceCuanto(null)).toBe("sin datos")
    expect(haceCuanto(12)).toBe("hace 12 min")
    expect(haceCuanto(120)).toBe("hace 2 h")
    expect(haceCuanto(60 * 24 * 150)).toBe("hace 5 meses")
  })
  it("fmt usa — sin dato (nunca '°C' suelto)", () => {
    expect(fmt(undefined, 1, "°C")).toBe("—")
    expect(fmt(26.44, 1, "°C")).toBe("26.4 °C")
  })
})
