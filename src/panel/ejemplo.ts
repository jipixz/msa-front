// Datos de ejemplo para la vista previa del selector de estilos: 8 nodos de las últimas
// 24 h (N4 se seca, N7 deja de transmitir), pronóstico y una alerta del modelo.
import { construirPanel, pronosticoPorDia } from "./datos"
import type { DatosPanel } from "./usePanel"

export function datosEjemplo(ahora = new Date()): DatosPanel {
  const base: Record<number, number> = { 1: 46, 2: 44, 3: 41, 4: 33, 5: 49, 6: 38, 7: 44, 8: 52 }
  const docs: Record<string, unknown>[] = []
  for (let nodo = 1; nodo <= 8; nodo++) {
    for (let i = 0; i < 24; i++) {
      if (nodo === 7 && i > 20) continue
      docs.push({
        nodo,
        fecha: new Date(ahora.getTime() - (23 - i) * 3600e3).toISOString(),
        humedadSuelo: Math.round(nodo === 4 ? 33 - i * 0.5 : base[nodo] + Math.sin(i / 4) * 2),
        temperaturaDS: 25.5 + Math.sin(i / 6),
        temperaturaBME: 27 + Math.sin(i / 6) * 3,
        presion: 1009,
        humedadAire: 80,
        luminosidad: 18400,
        lluvia: 0,
      })
    }
  }
  const dia = (n: number) => new Date(ahora.getTime() + n * 86400e3).toISOString().slice(0, 10)
  const temps = [31, 33, 35, 32, 29]
  const lluvia = [0.4, 0.2, 0, 3.1, 8.5]
  return {
    panel: construirPanel(docs, ahora),
    pronostico: pronosticoPorDia(
      temps.map((t, i) => ({ day: dia(i), predicted: t })),
      lluvia.map((l, i) => ({ day: dia(i), predicted: l })),
    ),
    alertasModelo: [{ nivel: "warn", titulo: "Temperatura alta", detalle: "El jueves llegará a 35 °C" }],
    cargando: false,
    error: null,
    enVivo: true,
    ahora,
  }
}
