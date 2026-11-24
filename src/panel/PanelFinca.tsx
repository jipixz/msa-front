// Panel de la finca: el estilo activo decide el acomodo (src/estilos/registro.ts → acomodo).
import type { ReactNode } from "react"
import { useTheme } from "@/components/theme-provider"
import type { Acomodo } from "@/estilos/registro"
import { usePanel, type DatosPanel } from "./usePanel"
import {
  Alertas, Bitacora, Boletin, Caja, EnlaceGraficas, Encabezado, EstadoConexion, Fila, FraseEstado, Indicadores, Kpis,
  ListaNodos, MapaCalor, MapaParcelas, MosaicoLotes, NumeroGrande, Pronostico, Radar, SerieHumedad, SeriesPorNodo,
  TablaNodos, Terminal, resumenFinca,
} from "./secciones"

export const ACOMODOS: Record<Acomodo, (d: DatosPanel) => ReactNode> = {
  senal: (d) => (
    <>
      <Encabezado d={d} />
      <Kpis d={d} />
      <Fila>
        <Caja className="flex-[2_1_460px]" titulo="Humedad del suelo · promedio" extra="umbral de riego 30 %"><SerieHumedad d={d} /></Caja>
        <Caja className="flex-[1_1_280px]" titulo="Requiere atención"><Alertas d={d} /></Caja>
      </Fila>
      <Caja titulo="Nodos"><TablaNodos d={d} /></Caja>
      <Pronostico d={d} />
    </>
  ),
  primer: (d) => (
    <Fila>
      <div className="flex flex-[999_1_560px] flex-col gap-4">
        <ListaNodos d={d} />
        <Caja titulo="Humedad del suelo" extra="promedio · últimas 24 h"><SerieHumedad d={d} /></Caja>
        <Caja titulo="Alertas abiertas"><Alertas d={d} variante="issues" /></Caja>
      </div>
      <aside className="flex flex-[1_1_260px] flex-col gap-4">
        <div><h2 className="mb-2 font-semibold">Promedios</h2><Kpis d={d} variante="lista" /></div>
        <div><h2 className="mb-2 font-semibold">Próximos días</h2><Pronostico d={d} variante="tabla" /></div>
      </aside>
    </Fila>
  ),
  tabla: (d) => (
    <>
      <Kpis d={d} variante="tira" />
      <div className="flex flex-wrap items-baseline justify-between gap-2"><h1 className="text-lg font-semibold">Nodos <span className="font-normal text-muted-foreground">{d.panel.nodos.length}</span></h1><EstadoConexion d={d} /></div>
      <TablaNodos d={d} minigraficas />
      <Fila>
        <Caja className="flex-[1_1_320px]" titulo="Actividad"><Bitacora d={d} cuantas={6} /></Caja>
        <Caja className="flex-[1_1_320px]" titulo="Pronóstico"><Pronostico d={d} variante="tabla" /></Caja>
      </Fila>
    </>
  ),
  mosaico: (d) => (
    <>
      <Fila className="items-end">
        <NumeroGrande d={d} className="flex-[1_1_260px]" />
        <div className="flex-[3_1_420px]"><SerieHumedad d={d} /></div>
      </Fila>
      <Kpis d={d} variante="tira" sinHumedad />
      <section><h2 className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Lotes · 1 nodo por hectárea</h2><MosaicoLotes d={d} /></section>
      <Fila>
        <div className="flex-[1_1_320px]"><h2 className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Avisos</h2><Alertas d={d} /></div>
        <div className="flex-[1_1_320px]"><h2 className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Próximos días</h2><Pronostico d={d} variante="tabla" /></div>
      </Fila>
    </>
  ),
  parcelas: (d) => (
    <Fila>
      <div className="flex flex-[999_1_560px] flex-col gap-4">
        <h1 className="text-xl font-bold">Humedad del suelo por lote</h1>
        <Caja><MapaParcelas d={d} /></Caja>
        <Kpis d={d} />
      </div>
      <aside className="flex flex-[1_1_300px] flex-col gap-4">
        <Caja titulo="Atención"><Alertas d={d} /></Caja>
        <Caja titulo="Próximos días"><Pronostico d={d} variante="tabla" /></Caja>
      </aside>
    </Fila>
  ),
  suizo: (d) => (
    <>
      <Fila className="items-end border-b border-border pb-6">
        <div className="flex-[2_1_340px]"><div className="text-sm text-muted-foreground">Humedad del suelo, promedio de la finca</div><div className="font-display text-[clamp(5rem,12vw,9rem)] font-bold leading-[0.9] tracking-tighter">{d.panel.promedios.humedadSuelo === null ? "—" : `${Math.round(d.panel.promedios.humedadSuelo)}%`}</div></div>
        <div className="flex-[1_1_260px]"><Alertas d={d} variante="bloques" /></div>
      </Fila>
      <Kpis d={d} variante="grande" sinHumedad />
      <MosaicoLotes d={d} />
      <Pronostico d={d} variante="barras" />
    </>
  ),
  bento: (d) => (
    <>
      <Fila>
        <Caja className="flex-[2_1_480px]"><NumeroGrande d={d} /><div className="mt-3"><SerieHumedad d={d} /></div></Caja>
        <Caja className="flex-[1_1_280px]" titulo="Para hoy"><Alertas d={d} /></Caja>
      </Fila>
      <Kpis d={d} sinHumedad />
      <Fila>
        <Caja className="flex-[3_1_520px]" titulo="Nodos"><MosaicoLotes d={d} /></Caja>
        <Caja className="flex-[1_1_260px]" titulo="Pronóstico"><Pronostico d={d} variante="tabla" /></Caja>
      </Fila>
    </>
  ),
  estado: (d) => (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <FraseEstado d={d} />
      <Alertas d={d} variante="tareas" />
      <details open className="border-t border-border pt-3"><summary className="min-h-8 cursor-pointer font-semibold">Ahora en la finca</summary><div className="pt-3"><Kpis d={d} /></div></details>
      <details className="border-t border-border pt-3"><summary className="min-h-8 cursor-pointer font-semibold">Nodos</summary><div className="pt-3"><TablaNodos d={d} /></div></details>
      <details className="border-t border-border pt-3"><summary className="min-h-8 cursor-pointer font-semibold">Esta semana</summary><div className="pt-3"><Pronostico d={d} variante="tabla" /></div></details>
      <details className="border-y border-border py-3"><summary className="min-h-8 cursor-pointer font-semibold">Gráfica de 24 h</summary><div className="pt-3"><SerieHumedad d={d} /></div></details>
    </div>
  ),
  instrumentos: (d) => (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2"><h1 className="font-semibold">Finca / Sensores en campo</h1><EstadoConexion d={d} /></div>
      <Indicadores d={d} />
      <Fila>
        <Caja className="flex-[3_1_520px]" titulo="Humedad del suelo por nodo (%)"><SeriesPorNodo d={d} /></Caja>
        <Caja className="flex-[1_1_260px]" titulo="Próximos días"><Pronostico d={d} variante="tabla" /></Caja>
      </Fila>
      <Caja titulo="Paquetes LoRa recibidos"><Bitacora d={d} /></Caja>
    </>
  ),
  pulgar: (d) => (
    <Fila className="justify-center">
      <div className="flex max-w-xl flex-[1_1_340px] flex-col gap-4">
        <Caja><NumeroGrande d={d} /></Caja>
        <section><h2 className="mb-2 font-semibold text-muted-foreground">Atiende primero</h2><Alertas d={d} variante="tareas" /></section>
        <section><h2 className="mb-2 font-semibold text-muted-foreground">Lotes</h2><MosaicoLotes d={d} columnas="2" /></section>
      </div>
      <div className="flex max-w-xl flex-[1_1_340px] flex-col gap-4">
        <Caja titulo="Últimas 24 h"><SerieHumedad d={d} /></Caja>
        <Caja titulo="Ahora"><Kpis d={d} variante="lista" sinHumedad /></Caja>
        <Caja titulo="Esta semana"><Pronostico d={d} /></Caja>
      </div>
    </Fila>
  ),
  terminal: (d) => <Caja><Terminal d={d} /></Caja>,
  neon: (d) => (
    <>
      <Fila>
        <Caja className="flex-[2_1_460px]"><div className="font-mono text-xs text-primary">&gt; HUMEDAD_SUELO.AVG · T−24H</div><NumeroGrande d={d} etiqueta="" /><SerieHumedad d={d} /></Caja>
        <Caja className="flex-[1_1_280px]" titulo={`!! ALERTAS [${d.panel.alertas.length + d.alertasModelo.length}]`}><Alertas d={d} /></Caja>
      </Fila>
      <Kpis d={d} sinHumedad />
      <Caja titulo={`NODOS // ${d.panel.nodos.length}`}><MosaicoLotes d={d} /></Caja>
    </>
  ),
  plano: (d) => (
    <div className="flex flex-col gap-4 border-2 border-foreground p-4">
      <h1 className="border-b border-foreground pb-2 text-xl tracking-widest">AGROMONITOR — PLANTA GENERAL</h1>
      <Fila>
        <div className="flex-[3_1_520px]"><MapaParcelas d={d} /></div>
        <div className="flex flex-[1_1_260px] flex-col gap-3"><div className="font-semibold">TABLA 1 · CONDICIONES PROMEDIO</div><Kpis d={d} variante="lista" /><div className="border border-foreground p-3"><div className="mb-2 font-semibold">NOTAS</div><Alertas d={d} /></div></div>
      </Fila>
      <div><div className="mb-2 font-semibold">FIG. 1 · HUMEDAD DEL SUELO, 24 H (%)</div><SerieHumedad d={d} /></div>
    </div>
  ),
  libreta: (d) => (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <h1 className="border-b-4 border-double border-foreground pb-2 text-3xl">Libreta de campo</h1>
      <section><h2 className="mb-2 text-xl">Por hacer</h2><Alertas d={d} variante="tareas" /></section>
      <section><h2 className="mb-2 text-xl">Humedad por lote</h2><MosaicoLotes d={d} /></section>
      <Fila>
        <section className="flex-[1_1_300px]"><h2 className="mb-2 text-xl">Condiciones</h2><Kpis d={d} variante="lista" /></section>
        <section className="flex-[1_1_300px]"><h2 className="mb-2 text-xl">Semana</h2><Pronostico d={d} variante="tabla" /></section>
      </Fila>
    </div>
  ),
  radar: (d) => (
    <Fila>
      <Caja className="flex-[3_1_460px]" titulo="RADAR LORA 905.2 MHZ" extra="posición ilustrativa: el RSSI aún no se guarda"><Radar d={d} /></Caja>
      <div className="flex flex-[1_1_300px] flex-col gap-4">
        <Caja titulo={`CONTACTOS ${d.panel.enLinea}/${d.panel.nodos.length}`}><Kpis d={d} variante="lista" /></Caja>
        <Caja titulo="ALERTAS"><Alertas d={d} /></Caja>
      </div>
    </Fila>
  ),
  boletin: (d) => <Boletin d={d} />,
  brutal: (d) => (
    <>
      <Fila>
        <Caja className="flex-[2_1_420px]"><div className="font-mono uppercase">Humedad del suelo / finca</div><div className="font-display text-[clamp(5rem,12vw,9rem)] leading-none">{d.panel.promedios.humedadSuelo === null ? "—" : `${Math.round(d.panel.promedios.humedadSuelo)}%`}</div><SerieHumedad d={d} /></Caja>
        <div className="flex-[1_1_300px]"><Alertas d={d} variante="bloques" /></div>
      </Fila>
      <Kpis d={d} variante="grande" sinHumedad />
      <MosaicoLotes d={d} />
    </>
  ),
  control: (d) => (
    <>
      <div className="flex flex-wrap items-center gap-4 border border-border bg-card px-3 py-2 font-mono text-xs">
        <span className="font-display text-lg tracking-widest text-primary">CONTROL DE FINCA</span>
        <span className={d.panel.alertas.length ? "text-warn" : "text-ok"}>● {d.panel.alertas.length ? `ALERTA · ${d.panel.alertas.length}` : "NOMINAL"}</span>
        <span className="ml-auto"><EstadoConexion d={d} /></span>
      </div>
      <Indicadores d={d} />
      <Fila>
        <Caja className="flex-[3_1_460px]" titulo="HUMEDAD · CANALES · 24 H"><SeriesPorNodo d={d} /></Caja>
        <Caja className="flex-[1_1_300px]" titulo="NODOS"><TablaNodos d={d} /></Caja>
      </Fila>
      <Fila>
        <Caja className="flex-[2_1_380px]" titulo="BITÁCORA"><Bitacora d={d} /></Caja>
        <Caja className="flex-[1_1_260px]" titulo="PRONÓSTICO"><Pronostico d={d} variante="tabla" /></Caja>
      </Fila>
      <div className="overflow-hidden whitespace-nowrap border border-border bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground">{resumenFinca(d)} ▸ {d.alertasModelo.map((a) => a.titulo).join(" ▸ ")}</div>
    </>
  ),
  lcd: (d) => (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-inner">
      <div className="flex flex-wrap items-center gap-3 tracking-widest"><b>AGROMONITOR</b><span className="text-muted-foreground">ESTACIÓN DE CAMPO</span><span className="ml-auto"><EstadoConexion d={d} /></span></div>
      <Fila>
        <div className="flex-[2_1_420px] rounded-md border-4 border-background bg-secondary p-4"><NumeroGrande d={d} /><SerieHumedad d={d} alto={120} /></div>
        <div className="flex-[1_1_260px] rounded-md border-4 border-background bg-secondary p-3"><Kpis d={d} variante="lista" sinHumedad /></div>
      </Fila>
      <MosaicoLotes d={d} />
    </div>
  ),
  heatmap: (d) => (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-2"><h1 className="text-xl font-semibold">finca <span className="font-normal text-muted-foreground">/ humedad</span></h1><EstadoConexion d={d} /></div>
      <Caja titulo="Humedad del suelo, últimas 24 h con datos"><MapaCalor d={d} /></Caja>
      <Fila>
        <Caja className="flex-[2_1_460px]" titulo="Alertas"><Alertas d={d} variante="issues" /></Caja>
        <Caja className="flex-[1_1_260px]" titulo="Ahora"><Kpis d={d} variante="lista" /></Caja>
      </Fila>
    </>
  ),
}

export default function PanelFinca() {
  const { estilo } = useTheme()
  const d = usePanel()
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-4 py-6 sm:px-6" data-acomodo={estilo.acomodo}>
      {d.error && <p role="alert" className="rounded-lg border border-bad p-3 text-sm text-bad">{d.error}. Se muestran los últimos datos disponibles.</p>}
      {d.cargando ? <p className="text-muted-foreground">Cargando datos de la finca…</p> : ACOMODOS[estilo.acomodo](d)}
      <EnlaceGraficas />
    </div>
  )
}
