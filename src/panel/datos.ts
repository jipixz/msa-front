// Capa de datos del panel: funciones puras (probadas en datos.test.ts) que convierten las
// lecturas crudas de Mongo en nodos, promedios, alertas y pronóstico.

export type Lectura = {
  nodo: number
  fecha: Date
  humedadSuelo?: number
  temperaturaDS?: number
  temperaturaBME?: number
  presion?: number
  humedadAire?: number
  luminosidad?: number
  lluvia?: number
  rainDigital?: boolean
  bateria?: number // V (firmware con cableado 2)
}

export type EstadoNodo = "ok" | "seco" | "encharcado" | "sin-senal" | "fuera-de-rango"

export type Nodo = {
  id: number
  nombre: string // "N3"
  lote: string // "Lote 3"
  ultima: Lectura | null
  serie: Lectura[] // últimas 24 h, de la más vieja a la más nueva
  estado: EstadoNodo
  minutosDesdeUltima: number | null
}

export type Alerta = { nivel: "warn" | "bad" | "info"; titulo: string; detalle: string; nodo?: number }
export type DiaPronostico = { etiqueta: string; fecha: string; tMax: number | null; lluviaMm: number | null }

export type Panel = {
  nodos: Nodo[]
  enLinea: number
  promedios: Record<CampoNumerico, number | null>
  alertas: Alerta[]
  serieFinca: { fecha: Date; valor: number }[] // humedad del suelo promedio por hora
  ultimaLectura: Date | null
}

export type CampoNumerico = "humedadSuelo" | "temperaturaDS" | "temperaturaBME" | "presion" | "humedadAire" | "luminosidad" | "lluvia" | "bateria"

// Umbrales (los mismos que las reglas por defecto del notifier en msa-back)
export const UMBRAL_SECO = 30
export const UMBRAL_ENCHARCADO = 90
export const MINUTOS_SIN_SENAL = 120

/** Rango físico válido de cada sensor; fuera de él el valor se descarta (p. ej. 700 % de un ADC al aire). */
export const RANGOS: Record<CampoNumerico, [number, number]> = {
  humedadSuelo: [0, 100],
  temperaturaDS: [-10, 60],
  temperaturaBME: [-10, 60],
  presion: [800, 1100],
  humedadAire: [0, 100],
  luminosidad: [0, 200000],
  lluvia: [0, 100],
  bateria: [2.5, 4.5],
}

const CAMPOS = Object.keys(RANGOS) as CampoNumerico[]

export function enRango(campo: CampoNumerico, v: unknown): v is number {
  if (typeof v !== "number" || !Number.isFinite(v)) return false
  const [min, max] = RANGOS[campo]
  return v >= min && v <= max
}

/** Normaliza un documento de Mongo: nodo por defecto 0, fecha como Date y valores fuera de rango descartados. */
export function normalizarLectura(doc: Record<string, unknown>): { lectura: Lectura | null; fueraDeRango: CampoNumerico[] } {
  const fecha = new Date(String(doc.fecha ?? ""))
  if (Number.isNaN(fecha.getTime())) return { lectura: null, fueraDeRango: [] }
  const lectura: Lectura = { nodo: typeof doc.nodo === "number" ? doc.nodo : 0, fecha }
  const fueraDeRango: CampoNumerico[] = []
  for (const c of CAMPOS) {
    const v = doc[c]
    if (v === undefined || v === null) continue
    if (enRango(c, v)) lectura[c] = v
    else fueraDeRango.push(c)
  }
  if (typeof doc.rainDigital === "boolean") lectura.rainDigital = doc.rainDigital
  return { lectura, fueraDeRango }
}

export function minutosEntre(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 60000)
}

/** "hace 41 s", "hace 12 min", "hace 2 h", "hace 5 meses". */
export function haceCuanto(min: number | null): string {
  if (min === null) return "sin datos"
  if (min < 1) return "hace segundos"
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 48) return `hace ${h} h`
  const d = Math.round(h / 24)
  if (d < 60) return `hace ${d} días`
  return `hace ${Math.round(d / 30)} meses`
}

function promedio(xs: number[]) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null
}

export function construirPanel(docs: Record<string, unknown>[], ahora = new Date()): Panel {
  const porNodo = new Map<number, Lectura[]>()
  const fueraPorNodo = new Map<number, boolean>()
  for (const d of docs) {
    const { lectura, fueraDeRango } = normalizarLectura(d)
    if (!lectura) continue
    if (!porNodo.has(lectura.nodo)) porNodo.set(lectura.nodo, [])
    porNodo.get(lectura.nodo)!.push(lectura)
    if (fueraDeRango.includes("humedadSuelo")) fueraPorNodo.set(lectura.nodo, true)
  }

  const nodos: Nodo[] = [...porNodo.entries()].sort((a, b) => a[0] - b[0]).map(([id, ls]) => {
    ls.sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
    const ultima = ls[ls.length - 1] ?? null
    const min = ultima ? minutosEntre(ultima.fecha, ahora) : null
    const desde = ultima ? ultima.fecha.getTime() - 24 * 3600e3 : 0
    let estado: EstadoNodo = "ok"
    if (min === null || min > MINUTOS_SIN_SENAL) estado = "sin-senal"
    else if (ultima?.humedadSuelo === undefined && fueraPorNodo.get(id)) estado = "fuera-de-rango"
    else if ((ultima?.humedadSuelo ?? 100) < UMBRAL_SECO) estado = "seco"
    else if ((ultima?.humedadSuelo ?? 0) > UMBRAL_ENCHARCADO) estado = "encharcado"
    return { id, nombre: `N${id}`, lote: `Lote ${id}`, ultima, serie: ls.filter((l) => l.fecha.getTime() >= desde), estado, minutosDesdeUltima: min }
  })

  const conDatos = nodos.filter((n) => n.ultima)
  const promedios = Object.fromEntries(CAMPOS.map((c) => [
    c, promedio(conDatos.map((n) => n.ultima![c]).filter((v): v is number => typeof v === "number")),
  ])) as Panel["promedios"]

  const alertas: Alerta[] = []
  for (const n of nodos) {
    if (n.estado === "seco") alertas.push({ nivel: "warn", nodo: n.id, titulo: `${n.nombre} · suelo seco`, detalle: `${n.ultima?.humedadSuelo} % de humedad, bajo el umbral de ${UMBRAL_SECO} %` })
    if (n.estado === "encharcado") alertas.push({ nivel: "warn", nodo: n.id, titulo: `${n.nombre} · suelo encharcado`, detalle: `${n.ultima?.humedadSuelo} %: revisar drenaje` })
    if (n.estado === "sin-senal") alertas.push({ nivel: "bad", nodo: n.id, titulo: `${n.nombre} · sin señal`, detalle: `Último paquete ${haceCuanto(n.minutosDesdeUltima)}` })
    if (n.estado === "fuera-de-rango") alertas.push({ nivel: "bad", nodo: n.id, titulo: `${n.nombre} · lectura imposible`, detalle: "La humedad reportada está fuera de 0–100 %: revisar el sensor" })
  }

  // Serie de la finca: promedio por hora de la humedad del suelo de todos los nodos (últimas 24 h con datos)
  const todas = nodos.flatMap((n) => n.serie).filter((l) => typeof l.humedadSuelo === "number")
  const porHora = new Map<number, number[]>()
  for (const l of todas) {
    const h = Math.floor(l.fecha.getTime() / 3600e3)
    if (!porHora.has(h)) porHora.set(h, [])
    porHora.get(h)!.push(l.humedadSuelo!)
  }
  const serieFinca = [...porHora.entries()].sort((a, b) => a[0] - b[0]).map(([h, vs]) => ({ fecha: new Date(h * 3600e3), valor: promedio(vs)! }))

  const ultimas = conDatos.map((n) => n.ultima!.fecha.getTime())
  return {
    nodos,
    enLinea: nodos.filter((n) => n.estado !== "sin-senal").length,
    promedios,
    alertas,
    serieFinca,
    ultimaLectura: ultimas.length ? new Date(Math.max(...ultimas)) : null,
  }
}

type PrediccionPunto = { predicted: number | null; day: string; day_label?: string }

/** Agrupa las predicciones horarias de fastapimsa por día: temperatura máxima y lluvia total. */
export function pronosticoPorDia(temperatura: PrediccionPunto[] = [], lluvia: PrediccionPunto[] = []): DiaPronostico[] {
  const dias = new Map<string, DiaPronostico>()
  // La etiqueta sale de la fecha (el "Hoy/Mañana" del modelo es relativo a cuando se generó)
  const etiqueta = (dia: string) => {
    const f = new Date(`${dia}T12:00:00`)
    if (Number.isNaN(f.getTime())) return dia
    const txt = f.toLocaleDateString("es-MX", { weekday: "short", day: "numeric" })
    return txt.charAt(0).toUpperCase() + txt.slice(1)
  }
  const dia = (p: PrediccionPunto) => {
    if (!dias.has(p.day)) dias.set(p.day, { fecha: p.day, etiqueta: etiqueta(p.day), tMax: null, lluviaMm: null })
    return dias.get(p.day)!
  }
  for (const p of temperatura) {
    if (typeof p.predicted !== "number") continue
    const d = dia(p)
    d.tMax = d.tMax === null ? p.predicted : Math.max(d.tMax, p.predicted)
  }
  for (const p of lluvia) {
    if (typeof p.predicted !== "number") continue
    const d = dia(p)
    d.lluviaMm = (d.lluviaMm ?? 0) + Math.max(0, p.predicted)
  }
  return [...dias.values()].sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(0, 7)
}

/** Formato de número con unidad; "—" si no hay dato. */
export function fmt(v: number | null | undefined, decimales = 1, unidad = "") {
  if (v === null || v === undefined || !Number.isFinite(v)) return "—"
  return `${v.toFixed(decimales)}${unidad ? ` ${unidad}` : ""}`
}
