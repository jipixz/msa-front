// Secciones del panel de la finca. Todas usan solo tokens del estilo activo (bg-card, text-ok,
// border-border, font-mono...), así que cualquier acomodo funciona con cualquier estilo.
import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import type { DatosPanel } from "./usePanel"
import { fmt, haceCuanto, UMBRAL_SECO, type Alerta, type EstadoNodo, type Nodo } from "./datos"

// ---------- utilidades de presentación ----------

export const TEXTO_ESTADO: Record<EstadoNodo, string> = {
  ok: "Normal", seco: "Suelo seco", encharcado: "Encharcado", "sin-senal": "Sin señal", "fuera-de-rango": "Lectura imposible",
}
export const CLASE_ESTADO: Record<EstadoNodo, string> = {
  ok: "text-ok", seco: "text-warn", encharcado: "text-warn", "sin-senal": "text-bad", "fuera-de-rango": "text-bad",
}
const CLASE_NIVEL: Record<Alerta["nivel"], string> = { warn: "text-warn", bad: "text-bad", info: "text-info" }

export function Caja({ children, className = "", titulo, extra }: { children: ReactNode; className?: string; titulo?: string; extra?: ReactNode }) {
  return (
    <section className={`min-w-0 rounded-lg border border-border bg-card p-4 text-card-foreground ${className}`}>
      {(titulo || extra) && (
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          {titulo && <h2 className="text-sm font-semibold">{titulo}</h2>}
          {extra && <span className="text-xs text-muted-foreground">{extra}</span>}
        </div>
      )}
      {children}
    </section>
  )
}

/** Fila que se apila en pantallas angostas. */
export function Fila({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-wrap gap-4 [&>*]:min-w-0 ${className}`}>{children}</div>
}

export function PuntoEstado({ estado }: { estado: EstadoNodo }) {
  return <span aria-hidden="true" className={`inline-block h-2 w-2 shrink-0 rounded-full bg-current ${CLASE_ESTADO[estado]}`} />
}

function todasLasAlertas(d: DatosPanel) {
  return [...d.panel.alertas, ...d.alertasModelo]
}

// ---------- encabezados ----------

export function resumenFinca(d: DatosPanel) {
  const { nodos, enLinea } = d.panel
  const secos = nodos.filter((n) => n.estado === "seco").length
  const sinSenal = nodos.filter((n) => n.estado === "sin-senal").length
  const partes = [`${enLinea} de ${nodos.length} nodo${nodos.length === 1 ? "" : "s"} en línea`]
  if (secos) partes.push(`${secos} con suelo seco`)
  if (sinSenal) partes.push(`${sinSenal} sin señal`)
  return partes.join(" · ")
}

export function Encabezado({ d, titulo = "Panel de la finca" }: { d: DatosPanel; titulo?: string }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">{titulo}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{resumenFinca(d)}</p>
      </div>
      <EstadoConexion d={d} />
    </header>
  )
}

export function EstadoConexion({ d }: { d: DatosPanel }) {
  const min = d.panel.ultimaLectura ? Math.round((d.ahora.getTime() - d.panel.ultimaLectura.getTime()) / 60000) : null
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground">
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${d.enVivo ? "bg-ok" : "bg-muted-foreground"}`} />
      {d.enVivo ? "en vivo" : "sin conexión en vivo"} · último dato {haceCuanto(min)}
    </span>
  )
}

export function FraseEstado({ d }: { d: DatosPanel }) {
  const n = todasLasAlertas(d).filter((a) => a.nivel !== "info").length
  return (
    <section>
      <p className="font-mono text-xs text-muted-foreground">{d.ahora.toLocaleString("es-MX", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</p>
      <h1 className="mt-2 text-3xl font-bold leading-tight">
        {n === 0 ? "La finca está bien." : <>La finca está bien, <span className="text-warn">salvo {n} {n === 1 ? "cosa" : "cosas"}</span>.</>}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {resumenFinca(d)}. Humedad promedio {fmt(d.panel.promedios.humedadSuelo, 0, "%")}, aire {fmt(d.panel.promedios.temperaturaBME, 1, "°C")}.
      </p>
    </section>
  )
}

// ---------- números ----------

const KPIS: { campo: keyof DatosPanel["panel"]["promedios"]; etiqueta: string; unidad: string; dec: number }[] = [
  { campo: "humedadSuelo", etiqueta: "Humedad del suelo", unidad: "%", dec: 0 },
  { campo: "temperaturaDS", etiqueta: "Temp. del suelo", unidad: "°C", dec: 1 },
  { campo: "temperaturaBME", etiqueta: "Temp. del aire", unidad: "°C", dec: 1 },
  { campo: "humedadAire", etiqueta: "Humedad del aire", unidad: "%", dec: 0 },
  { campo: "lluvia", etiqueta: "Lluvia", unidad: "%", dec: 0 },
  { campo: "luminosidad", etiqueta: "Luz", unidad: "lx", dec: 0 },
  { campo: "presion", etiqueta: "Presión", unidad: "hPa", dec: 0 },
]

export function Kpis({ d, variante = "rejilla", sinHumedad = false }: { d: DatosPanel; variante?: "rejilla" | "lista" | "tira" | "grande"; sinHumedad?: boolean }) {
  const items = KPIS.filter((k) => !(sinHumedad && k.campo === "humedadSuelo")).map((k) => ({ ...k, valor: d.panel.promedios[k.campo] }))
  if (variante === "lista") {
    return (
      <dl className="flex flex-col">
        {items.map((k) => (
          <div key={k.campo} className="flex justify-between gap-4 border-b border-border py-1.5 text-sm">
            <dt className="text-muted-foreground">{k.etiqueta}</dt>
            <dd className="font-mono">{fmt(k.valor, k.dec, k.unidad)}</dd>
          </div>
        ))}
      </dl>
    )
  }
  if (variante === "tira") {
    return (
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border py-3 text-sm">
        {items.map((k) => (
          <span key={k.campo}><span className="text-muted-foreground">{k.etiqueta}</span> <span className="font-mono font-medium">{fmt(k.valor, k.dec, k.unidad)}</span></span>
        ))}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
      {items.map((k) => (
        <div key={k.campo} className="rounded-lg border border-border bg-card p-3">
          <div className="text-xs text-muted-foreground">{k.etiqueta}</div>
          <div className={`font-mono font-semibold ${variante === "grande" ? "text-4xl" : "text-2xl"}`}>
            {k.valor === null ? "—" : k.valor.toFixed(k.dec)}<span className="text-sm font-normal text-muted-foreground"> {k.valor === null ? "" : k.unidad}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function NumeroGrande({ d, etiqueta = "Humedad del suelo · promedio", className = "" }: { d: DatosPanel; etiqueta?: string; className?: string }) {
  const v = d.panel.promedios.humedadSuelo
  return (
    <div className={className}>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{etiqueta}</div>
      <div className="font-mono text-7xl font-semibold leading-none tracking-tight">
        {v === null ? "—" : Math.round(v)}<span className="text-3xl text-muted-foreground">{v === null ? "" : "%"}</span>
      </div>
      <div className="mt-2 text-sm text-muted-foreground">{resumenFinca(d)}</div>
    </div>
  )
}

// ---------- gráficas (SVG propio, colores del estilo) ----------

const ANCHO = 600

function puntos(valores: { t: number; v: number }[], alto: number, min = 0, max = 100) {
  if (valores.length === 0) return ""
  const t0 = valores[0].t, t1 = valores[valores.length - 1].t || t0 + 1
  return valores.map(({ t, v }) => {
    const x = t1 === t0 ? ANCHO : ((t - t0) / (t1 - t0)) * ANCHO
    const y = alto - ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * alto
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(" ")
}

export function SerieHumedad({ d, alto = 170 }: { d: DatosPanel; alto?: number }) {
  const serie = d.panel.serieFinca.map((p) => ({ t: p.fecha.getTime(), v: p.valor }))
  const yUmbral = alto - (UMBRAL_SECO / 100) * alto
  if (serie.length < 2) return <p className="text-sm text-muted-foreground">Aún no hay suficientes lecturas para graficar las últimas 24 h.</p>
  return (
    <svg viewBox={`0 0 ${ANCHO} ${alto}`} className="h-auto w-full" role="img" aria-label="Humedad del suelo promedio de las últimas 24 horas con datos">
      <line x1="0" y1={yUmbral} x2={ANCHO} y2={yUmbral} stroke="hsl(var(--warn))" strokeDasharray="4 5" />
      <text x={ANCHO} y={yUmbral - 5} textAnchor="end" fontSize="11" fill="hsl(var(--warn))" className="font-mono">riego &lt; {UMBRAL_SECO} %</text>
      <polygon points={`0,${alto} ${puntos(serie, alto)} ${ANCHO},${alto}`} fill="hsl(var(--primary))" fillOpacity="0.12" />
      <polyline points={puntos(serie, alto)} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" />
    </svg>
  )
}

export function SeriesPorNodo({ d, alto = 200 }: { d: DatosPanel; alto?: number }) {
  const conSerie = d.panel.nodos.filter((n) => n.serie.filter((l) => typeof l.humedadSuelo === "number").length >= 2)
  if (!conSerie.length) return <p className="text-sm text-muted-foreground">Sin series de 24 h todavía.</p>
  return (
    <>
      <svg viewBox={`0 0 ${ANCHO} ${alto}`} className="h-auto w-full" role="img" aria-label="Humedad del suelo por nodo en las últimas 24 horas">
        <line x1="0" y1={alto - (UMBRAL_SECO / 100) * alto} x2={ANCHO} y2={alto - (UMBRAL_SECO / 100) * alto} stroke="hsl(var(--bad))" strokeDasharray="4 4" />
        {conSerie.map((n, i) => (
          <polyline key={n.id} fill="none" strokeWidth={n.estado === "seco" ? 3 : 1.5} stroke={`hsl(var(--chart-${(i % 5) + 1}))`}
            points={puntos(n.serie.filter((l) => typeof l.humedadSuelo === "number").map((l) => ({ t: l.fecha.getTime(), v: l.humedadSuelo! })), alto)} />
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {conSerie.map((n, i) => (
          <span key={n.id} className="inline-flex items-center gap-1.5"><span className="h-0.5 w-3" style={{ background: `hsl(var(--chart-${(i % 5) + 1}))` }} />{n.nombre}</span>
        ))}
      </div>
    </>
  )
}

export function MiniSerie({ n }: { n: Nodo }) {
  const s = n.serie.filter((l) => typeof l.humedadSuelo === "number").map((l) => ({ t: l.fecha.getTime(), v: l.humedadSuelo! }))
  if (s.length < 2) return <span className="text-xs text-muted-foreground">—</span>
  return (
    <svg viewBox={`0 0 ${ANCHO} 60`} className="h-6 w-28" aria-hidden="true">
      <polyline points={puntos(s, 60)} fill="none" stroke="currentColor" strokeWidth="5" className={CLASE_ESTADO[n.estado]} />
    </svg>
  )
}

export function Indicadores({ d }: { d: DatosPanel }) {
  const p = d.panel.promedios
  const items = [
    { e: "Suelo %", v: p.humedadSuelo, max: 100, dec: 0 },
    { e: "T. suelo °C", v: p.temperaturaDS, max: 50, dec: 1 },
    { e: "T. aire °C", v: p.temperaturaBME, max: 50, dec: 1 },
    { e: "Hum. aire %", v: p.humedadAire, max: 100, dec: 0 },
    { e: "Nodos", v: d.panel.nodos.length ? (d.panel.enLinea / d.panel.nodos.length) * 100 : null, max: 100, dec: 0, txt: `${d.panel.enLinea}/${d.panel.nodos.length}` },
  ]
  const arco = 157
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
      {items.map((g) => (
        <Caja key={g.e} className="text-center">
          <div className="text-xs text-muted-foreground">{g.e}</div>
          <svg viewBox="0 0 120 70" className="mx-auto h-auto w-full max-w-[150px]" role="img" aria-label={`${g.e}: ${g.v === null ? "sin dato" : g.v.toFixed(g.dec)}`}>
            <path d="M10,62 A50,50 0 0,1 110,62" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
            <path d="M10,62 A50,50 0 0,1 110,62" fill="none" stroke="hsl(var(--primary))" strokeWidth="10"
              strokeDasharray={`${g.v === null ? 0 : (arco * Math.min(1, g.v / g.max)).toFixed(1)} ${arco}`} />
            <text x="60" y="58" textAnchor="middle" fontSize="18" fill="hsl(var(--foreground))" className="font-mono">{g.txt ?? (g.v === null ? "—" : g.v.toFixed(g.dec))}</text>
          </svg>
        </Caja>
      ))}
    </div>
  )
}

// ---------- nodos ----------

export function TablaNodos({ d, minigraficas = false }: { d: DatosPanel; minigraficas?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th className="py-2 pr-3 font-medium">Nodo</th>
            <th className="px-3 py-2 font-medium">Estado</th>
            {minigraficas && <th className="px-3 py-2 font-medium">24 h</th>}
            <th className="px-3 py-2 text-right font-medium">Suelo</th>
            <th className="px-3 py-2 text-right font-medium">T. suelo</th>
            <th className="px-3 py-2 text-right font-medium">T. aire</th>
            <th className="py-2 pl-3 text-right font-medium">Último dato</th>
          </tr>
        </thead>
        <tbody>
          {d.panel.nodos.map((n) => (
            <tr key={n.id} className="border-t border-border">
              <td className="py-2 pr-3 font-semibold">{n.nombre} <span className="font-normal text-muted-foreground">{n.lote}</span></td>
              <td className="px-3 py-2"><span className={`inline-flex items-center gap-2 ${CLASE_ESTADO[n.estado]}`}><PuntoEstado estado={n.estado} />{TEXTO_ESTADO[n.estado]}</span></td>
              {minigraficas && <td className="px-3 py-2"><MiniSerie n={n} /></td>}
              <td className="px-3 py-2 text-right font-mono">{fmt(n.ultima?.humedadSuelo, 0, "%")}</td>
              <td className="px-3 py-2 text-right font-mono">{fmt(n.ultima?.temperaturaDS, 1, "°C")}</td>
              <td className="px-3 py-2 text-right font-mono">{fmt(n.ultima?.temperaturaBME, 1, "°C")}</td>
              <td className="py-2 pl-3 text-right text-muted-foreground">{haceCuanto(n.minutosDesdeUltima)}</td>
            </tr>
          ))}
          {d.panel.nodos.length === 0 && <tr><td colSpan={7} className="py-4 text-muted-foreground">Sin nodos reportando todavía.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

/** Nodos como lista de archivos (estilo GitHub). */
export function ListaNodos({ d }: { d: DatosPanel }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted px-4 py-2 text-sm">
        <span className="font-semibold">gateway</span>
        <span className="text-muted-foreground">{resumenFinca(d)}</span>
      </div>
      {d.panel.nodos.map((n) => (
        <div key={n.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-4 py-2 text-sm first:border-t-0">
          <span className="inline-flex min-w-[130px] items-center gap-2"><PuntoEstado estado={n.estado} /><b>{n.nombre}</b><span className="text-muted-foreground">{n.lote}</span></span>
          <span className={`rounded-full border border-current px-2 text-xs ${CLASE_ESTADO[n.estado]}`}>{TEXTO_ESTADO[n.estado].toLowerCase().replace(/ /g, "-")}</span>
          <span className="ml-auto font-mono text-xs text-muted-foreground">suelo {fmt(n.ultima?.humedadSuelo, 0, "%")} · {fmt(n.ultima?.temperaturaDS, 1, "°C")} · {haceCuanto(n.minutosDesdeUltima)}</span>
        </div>
      ))}
    </div>
  )
}

export function MosaicoLotes({ d, columnas = "auto" }: { d: DatosPanel; columnas?: "auto" | "2" }) {
  const grid = columnas === "2" ? "grid-cols-2" : "grid-cols-[repeat(auto-fill,minmax(140px,1fr))]"
  return (
    <div className={`grid ${grid} gap-3`}>
      {d.panel.nodos.map((n) => {
        const v = n.ultima?.humedadSuelo
        return (
          <div key={n.id} className={`flex flex-col gap-1.5 rounded-lg border bg-card p-3 ${n.estado === "ok" ? "border-border" : "border-current " + CLASE_ESTADO[n.estado]}`}>
            <span className="flex justify-between text-xs text-muted-foreground"><span>{n.lote}</span><span>{n.nombre}</span></span>
            <span className="font-mono text-3xl font-semibold text-foreground">{fmt(v, 0, "%")}</span>
            <span className="h-1 overflow-hidden rounded bg-muted"><span className="block h-full bg-current" style={{ width: `${v ?? 0}%` }} /></span>
            <span className={`text-xs ${CLASE_ESTADO[n.estado]}`}>{TEXTO_ESTADO[n.estado]}</span>
          </div>
        )
      })}
    </div>
  )
}

/** Lotes como mapa (rejilla de 4 columnas) coloreados por humedad con la opacidad del acento. */
export function MapaParcelas({ d }: { d: DatosPanel }) {
  return (
    <div>
      <div className="grid grid-cols-4 gap-1.5">
        {d.panel.nodos.map((n) => {
          const v = n.ultima?.humedadSuelo
          const opacidad = v === undefined ? 0.05 : 0.15 + (Math.min(60, v) / 60) * 0.75
          return (
            <div key={n.id} aria-label={`${n.lote}: ${fmt(v, 0, "por ciento")}, ${TEXTO_ESTADO[n.estado]}`}
              className={`relative flex min-h-[110px] flex-col justify-between overflow-hidden rounded-md border-2 p-2 ${n.estado === "ok" ? "border-transparent" : n.estado === "sin-senal" ? "border-dashed border-bad" : "border-warn"}`}>
              <span aria-hidden="true" className="absolute inset-0 bg-primary" style={{ opacity: opacidad }} />
              <span className="relative text-xs font-semibold">{n.lote}</span>
              <span className="relative font-mono text-2xl font-semibold">{fmt(v, 0, "%")}</span>
              <span className={`relative text-xs ${CLASE_ESTADO[n.estado]}`}>{TEXTO_ESTADO[n.estado]}</span>
            </div>
          )
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Más intenso = más húmedo · contorno = requiere atención</p>
    </div>
  )
}

/** Radar: nodos repartidos alrededor del gateway. La distancia es ilustrativa hasta que se guarde el RSSI. */
export function Radar({ d }: { d: DatosPanel }) {
  const ns = d.panel.nodos
  return (
    <svg viewBox="0 0 500 500" className="mx-auto h-auto w-full max-w-[560px]" role="img" aria-label={`Radar con ${ns.length} nodos alrededor del gateway`}>
      {[240, 180, 120, 60].map((r) => <circle key={r} cx="250" cy="250" r={r} fill="none" stroke="hsl(var(--border))" />)}
      <line x1="10" y1="250" x2="490" y2="250" stroke="hsl(var(--border))" />
      <line x1="250" y1="10" x2="250" y2="490" stroke="hsl(var(--border))" />
      <path d="M250,250 L250,10 A240,240 0 0,1 420,80 Z" fill="hsl(var(--primary))" fillOpacity="0.12" />
      <rect x="244" y="244" width="12" height="12" fill="hsl(var(--primary))" />
      <text x="262" y="270" fontSize="12" fill="hsl(var(--primary))" className="font-mono">GW</text>
      {ns.map((n, i) => {
        const a = (i / Math.max(1, ns.length)) * 2 * Math.PI - Math.PI / 2
        const r = 110 + (i % 3) * 40
        const x = 250 + r * Math.cos(a), y = 250 + r * Math.sin(a)
        const color = n.estado === "ok" ? "hsl(var(--ok))" : n.estado === "sin-senal" ? "hsl(var(--bad))" : "hsl(var(--warn))"
        return (
          <g key={n.id}>
            <circle cx={x} cy={y} r="7" fill={n.estado === "sin-senal" ? "none" : color} stroke={color} strokeDasharray={n.estado === "sin-senal" ? "2 2" : undefined} />
            <text x={x + 11} y={y - 8} fontSize="13" fill={color} className="font-mono">{n.nombre} {n.estado === "ok" ? "" : TEXTO_ESTADO[n.estado].toUpperCase()}</text>
          </g>
        )
      })}
    </svg>
  )
}

/** Mapa de calor tipo contribuciones: filas = nodos, columnas = horas de las últimas 24 h con datos. */
export function MapaCalor({ d }: { d: DatosPanel }) {
  const ultima = d.panel.ultimaLectura?.getTime()
  if (!ultima) return <p className="text-sm text-muted-foreground">Sin lecturas.</p>
  const horaFin = Math.floor(ultima / 3600e3)
  return (
    <div className="flex flex-col gap-1">
      {d.panel.nodos.map((n) => {
        const porHora = new Map<number, number>()
        for (const l of n.serie) if (typeof l.humedadSuelo === "number") porHora.set(Math.floor(l.fecha.getTime() / 3600e3), l.humedadSuelo)
        return (
          <div key={n.id} className="grid grid-cols-[36px_repeat(24,minmax(0,1fr))] items-center gap-[3px]">
            <span className="font-mono text-xs text-muted-foreground">{n.nombre}</span>
            {Array.from({ length: 24 }, (_, i) => {
              const v = porHora.get(horaFin - 23 + i)
              const clase = v === undefined ? "bg-muted" : v < UMBRAL_SECO ? "bg-warn" : "bg-primary"
              const op = v === undefined || v < UMBRAL_SECO ? 1 : 0.25 + (Math.min(60, v) / 60) * 0.75
              return <span key={i} title={`${n.nombre} · ${v === undefined ? "sin dato" : v + " %"}`} className={`aspect-square rounded-[2px] ${clase}`} style={{ opacity: op }} />
            })}
          </div>
        )
      })}
      <p className="mt-2 text-xs text-muted-foreground">Cada cuadro es una hora · naranja = bajo {UMBRAL_SECO} % · gris = sin dato</p>
    </div>
  )
}

// ---------- alertas y pronóstico ----------

export function Alertas({ d, variante = "lista" }: { d: DatosPanel; variante?: "lista" | "issues" | "tareas" | "bloques" }) {
  const lista = todasLasAlertas(d)
  if (!lista.length) return <p className="text-sm text-ok">Sin pendientes. Todo en orden.</p>
  if (variante === "tareas") {
    return (
      <div className="flex flex-col gap-2">
        {lista.map((a, i) => (
          <label key={i} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-3">
            <input type="checkbox" className="mt-1 h-5 w-5 accent-[hsl(var(--primary))]" />
            <span><b className={CLASE_NIVEL[a.nivel]}>{a.titulo}</b><span className="block text-sm text-muted-foreground">{a.detalle}</span></span>
          </label>
        ))}
      </div>
    )
  }
  if (variante === "bloques") {
    return (
      <div className="flex flex-col gap-3">
        {lista.map((a, i) => (
          <div key={i} className={`border-2 p-3 ${i === 0 ? "border-primary bg-primary text-primary-foreground" : "border-foreground"}`}>
            <div className="text-lg font-bold">{a.titulo}</div>
            <div className="text-sm">{a.detalle}</div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <ul className="flex flex-col">
      {lista.map((a, i) => (
        <li key={i} className="flex gap-3 border-t border-border py-2.5 first:border-t-0">
          <span aria-hidden="true" className={`mt-1.5 h-2 w-2 shrink-0 rounded-full bg-current ${CLASE_NIVEL[a.nivel]}`} />
          <span className="min-w-0">
            <span className="font-semibold">{a.titulo}</span>
            {variante === "issues" && <span className={`ml-2 rounded-full border border-current px-2 text-xs ${CLASE_NIVEL[a.nivel]}`}>{a.nivel === "bad" ? "crítica" : a.nivel === "warn" ? "atención" : "modelo"}</span>}
            <span className="block text-sm text-muted-foreground">{a.detalle}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

export function Pronostico({ d, variante = "tarjetas" }: { d: DatosPanel; variante?: "tarjetas" | "tabla" | "barras" }) {
  const dias = d.pronostico
  if (!dias.length) return <p className="text-sm text-muted-foreground">Sin pronóstico disponible.</p>
  if (variante === "tabla") {
    return (
      <div className="flex flex-col">
        {dias.map((x) => (
          <div key={x.fecha} className="flex justify-between gap-3 border-t border-border py-2 font-mono text-sm first:border-t-0">
            <span className="font-sans">{x.etiqueta}</span>
            <span className={x.tMax !== null && x.tMax >= 35 ? "text-warn" : ""}>{fmt(x.tMax, 0, "°")}</span>
            <span className="text-muted-foreground">lluvia {fmt(x.lluviaMm, 1, "mm")}</span>
          </div>
        ))}
      </div>
    )
  }
  if (variante === "barras") {
    return (
      <div className="flex h-40 items-end gap-2">
        {dias.map((x) => (
          <div key={x.fecha} className="flex h-full flex-1 flex-col justify-end gap-1 text-center">
            <span className="font-mono text-xs">{fmt(x.tMax, 0, "°")}</span>
            <span className={`w-full ${x.tMax !== null && x.tMax >= 35 ? "bg-warn" : "bg-primary"}`} style={{ height: `${x.tMax === null ? 0 : Math.max(4, (x.tMax - 20) * 6)}px` }} />
            <span className="truncate text-xs text-muted-foreground">{x.etiqueta}</span>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-3">
      {dias.map((x) => (
        <div key={x.fecha} className="rounded-lg border border-border bg-card p-3">
          <div className="text-xs text-muted-foreground">{x.etiqueta}</div>
          <div className={`font-mono text-lg font-semibold ${x.tMax !== null && x.tMax >= 35 ? "text-warn" : ""}`}>{fmt(x.tMax, 0, "°")}</div>
          <div className="text-xs text-muted-foreground">lluvia {fmt(x.lluviaMm, 1, "mm")}</div>
        </div>
      ))}
    </div>
  )
}

// ---------- formatos especiales ----------

/** Las lecturas recientes en el formato crudo del gateway LoRa. */
export function Bitacora({ d, cuantas = 8 }: { d: DatosPanel; cuantas?: number }) {
  const ultimas = d.panel.nodos.flatMap((n) => n.serie.slice(-3)).sort((a, b) => b.fecha.getTime() - a.fecha.getTime()).slice(0, cuantas)
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[520px] font-mono text-xs leading-7">
        {ultimas.map((l, i) => (
          <div key={i} className="whitespace-nowrap">
            <span className="text-muted-foreground">{l.fecha.toLocaleTimeString("es-MX", { hour12: false })}</span>{" "}
            <span className={typeof l.humedadSuelo === "number" && l.humedadSuelo < UMBRAL_SECO ? "text-warn" : "text-ok"}>RX</span>{" "}
            HS:{fmt(l.humedadSuelo, 0)}% | T1:{fmt(l.temperaturaDS, 1)}C | T2:{fmt(l.temperaturaBME, 1)}C | P:{fmt(l.presion, 0)}hPa | HA:{fmt(l.humedadAire, 1)}% | RainBool:{l.rainDigital ? "SI" : "NO"} | Nodo:{l.nodo}
          </div>
        ))}
        {!ultimas.length && <span className="text-muted-foreground">sin paquetes recientes</span>}
      </div>
    </div>
  )
}

export function Terminal({ d }: { d: DatosPanel }) {
  const p = d.panel.promedios
  const fila = (k: string, v: string, nota: string) => `│ ${k.padEnd(15)} │ ${v.padStart(9)} │ ${nota.padEnd(24)} │`
  const tabla = [
    "┌─────────────────┬───────────┬──────────────────────────┐",
    fila("humedad suelo", fmt(p.humedadSuelo, 0, "%"), `${d.panel.enLinea}/${d.panel.nodos.length} nodos en línea`),
    fila("temp suelo", fmt(p.temperaturaDS, 1, "°C"), "DS18B20"),
    fila("temp aire", fmt(p.temperaturaBME, 1, "°C"), "BME280"),
    fila("humedad aire", fmt(p.humedadAire, 0, "%"), "BME280"),
    fila("presión", fmt(p.presion, 0, "hPa"), ""),
    "└─────────────────┴───────────┴──────────────────────────┘",
  ].join("\n")
  const prompt = <><span className="text-ok">jipixz@pi</span>:<span className="text-info">~/finca</span>$ </>
  return (
    <div className="flex flex-col gap-4 overflow-x-auto font-mono text-sm leading-relaxed">
      <div>{prompt}agromonitor status</div>
      <pre className="m-0 whitespace-pre">{tabla}</pre>
      <div>
        <div className="text-muted-foreground"># humedad del suelo por lote (umbral {UMBRAL_SECO} %)</div>
        {d.panel.nodos.map((n) => {
          const v = n.ultima?.humedadSuelo
          const barra = v === undefined ? "·".repeat(30) : "█".repeat(Math.round((Math.min(60, v) * 30) / 60)).padEnd(30, "░")
          return (
            <div key={n.id} className="whitespace-pre">
              <span className="text-muted-foreground">{n.nombre.padEnd(3)}</span> <span className={CLASE_ESTADO[n.estado]}>{barra}</span> {fmt(v, 0, "%").padStart(5)} <span className={CLASE_ESTADO[n.estado]}>{n.estado === "ok" ? "" : TEXTO_ESTADO[n.estado].toLowerCase()}</span>
            </div>
          )
        })}
      </div>
      <div>
        <div>{prompt}agromonitor alertas</div>
        {todasLasAlertas(d).map((a, i) => (
          <div key={i}><span className={CLASE_NIVEL[a.nivel]}>[{a.nivel === "bad" ? "ERROR" : a.nivel === "warn" ? "WARN " : "INFO "}]</span> {a.titulo}: {a.detalle}</div>
        ))}
      </div>
      <div>
        <div>{prompt}tail -n 5 /dev/ttyUSB0</div>
        <Bitacora d={d} cuantas={5} />
      </div>
      <div>{prompt}<span className="animate-pulse bg-foreground text-background">&nbsp;</span></div>
    </div>
  )
}

export function Boletin({ d }: { d: DatosPanel }) {
  const seco = d.panel.nodos.find((n) => n.estado === "seco")
  const sinSenal = d.panel.nodos.filter((n) => n.estado === "sin-senal")
  const titular = seco
    ? `El ${seco.lote.toLowerCase()} se está secando mientras el resto de la finca aguanta`
    : sinSenal.length === d.panel.nodos.length && d.panel.nodos.length
      ? "Los nodos guardan silencio: la finca no reporta desde hace tiempo"
      : "Jornada tranquila en la finca"
  return (
    <article className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-between gap-2 border-b-4 border-double border-foreground pb-2 text-xs text-muted-foreground">
        <span>{d.ahora.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
        <span>{resumenFinca(d)}</span>
      </div>
      <div className="text-center font-display text-4xl font-extrabold">El Boletín del Cacao</div>
      <Fila>
        <div className="flex-[3_1_480px]">
          <h1 className="text-4xl font-extrabold leading-tight">{titular}</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Humedad promedio {fmt(d.panel.promedios.humedadSuelo, 0, "%")}, aire a {fmt(d.panel.promedios.temperaturaBME, 1, "°C")}. {seco ? `${seco.nombre} reporta ${fmt(seco.ultima?.humedadSuelo, 0, "%")}, bajo el umbral de riego.` : ""}
          </p>
          <figure className="mt-4 border-y border-foreground py-3">
            <SerieHumedad d={d} />
            <figcaption className="text-xs text-muted-foreground">Humedad del suelo, últimas 24 h con datos. Fuente: nodos de la finca.</figcaption>
          </figure>
        </div>
        <aside className="flex flex-[1_1_260px] flex-col gap-4">
          <div className="border-t-4 border-foreground pt-2"><h2 className="mb-2 text-xl font-extrabold">El clima</h2><Pronostico d={d} variante="tabla" /></div>
          <div className="border-t-4 border-foreground pt-2"><h2 className="mb-2 text-xl font-extrabold">Los lotes, en cifras</h2><Kpis d={d} variante="lista" /></div>
        </aside>
      </Fila>
    </article>
  )
}

export function EnlaceGraficas() {
  return (
    <p className="text-sm text-muted-foreground">
      ¿Necesitas el detalle por variable? <Link to="/graficas" className="text-primary underline underline-offset-4">Ver gráficas detalladas</Link>
    </p>
  )
}
