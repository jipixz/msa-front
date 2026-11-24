import { describe, expect, it } from "vitest"
import { preferenciasDesdeServidor } from "./theme-provider"

describe("preferenciasDesdeServidor", () => {
  it("convierte las preferencias guardadas en el usuario", () => {
    const p = preferenciasDesdeServidor({ estilo: "k01-termux", variante: "github", modo: "oscuro", per: { "k01-termux": { fondo: "oled", acento: null, acento2: null } } })
    expect(p).toEqual({ estilo: "k01-termux", variante: "github", modo: "oscuro", per: { "k01-termux": { fondo: "oled", acento: null, acento2: null } } })
  })
  it("un estilo que ya no existe cae en el predeterminado", () => {
    expect(preferenciasDesdeServidor({ estilo: "z99-borrado", variante: "x", modo: "claro" })?.estilo).toBe("c01-senal")
  })
  it("sin preferencias o con forma inválida devuelve null (se usan las del navegador)", () => {
    expect(preferenciasDesdeServidor(undefined)).toBeNull()
    expect(preferenciasDesdeServidor({ estilo: "c01-senal" })).toBeNull()
    expect(preferenciasDesdeServidor({ estilo: "c01-senal", variante: "claro", modo: "sepia" })).toBeNull()
  })
})
