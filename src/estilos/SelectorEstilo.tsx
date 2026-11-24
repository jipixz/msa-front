import { useEffect, useMemo, useState, type CSSProperties } from "react"
import { Palette, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cargarFuentes, useTheme, varianteParaModo } from "@/components/theme-provider"
import { ACOMODOS } from "@/panel/PanelFinca"
import { datosEjemplo } from "@/panel/ejemplo"
import { ACENTOS_SUGERIDOS, FONDOS, SIN_PERSONALIZAR, aplicarPersonalizacion, contraste, variablesCss, type Estilo, type FondoId, type Personalizacion, type Variante } from "@/estilos/registro"

/** Muestra de colores de una variante (sin depender del estilo activo). */
function Muestra({ estilo, variante }: { estilo: Estilo; variante: Variante }) {
  const p = variante.paleta
  return (
    <span
      aria-hidden="true"
      style={{ background: p.fondo, borderColor: p.borde, fontFamily: `${estilo.fuentes.sans}, sans-serif` }}
      className="flex h-12 w-full items-end gap-1 overflow-hidden border p-1.5"
    >
      <span style={{ background: p.superficie, borderColor: p.borde, color: p.texto }} className="flex h-full flex-1 items-center justify-center border text-xs font-semibold">
        <span style={{ fontFamily: `${estilo.fuentes.mono}, monospace` }}>42%</span>
      </span>
      <span style={{ background: p.acento }} className="h-full w-2.5" />
      <span style={{ background: p.ok }} className="h-2/3 w-2.5" />
      <span style={{ background: p.warn }} className="h-1/2 w-2.5" />
      <span style={{ background: p.bad }} className="h-1/3 w-2.5" />
    </span>
  )
}

/** El panel real (con datos de ejemplo) dibujado con el estilo y la variante indicados. */
function VistaPrevia({ estilo, variante, per }: { estilo: Estilo; variante: Variante; per: Personalizacion }) {
  const datos = useMemo(() => datosEjemplo(), [])
  useEffect(() => { cargarFuentes(estilo) }, [estilo])
  const vars = variablesCss(estilo, variante, per) as CSSProperties
  const oscuro = aplicarPersonalizacion(estilo, variante, per).oscuro
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="text-xs text-muted-foreground">Vista previa · {estilo.nombre} · {variante.nombre} (datos de ejemplo)</div>
      <div className="relative h-[420px] overflow-hidden border border-border" style={{ borderRadius: "var(--radius)" }}>
        <div
          inert
          aria-hidden="true"
          data-efectos={estilo.efectos.join(" ")}
          style={vars}
          className={`vista-estilo absolute inset-0 overflow-hidden bg-background font-sans text-foreground ${oscuro ? "dark" : ""}`}
        >
          <div className="flex w-[250%] origin-top-left scale-[0.4] flex-col gap-5 p-6">
            {ACOMODOS[estilo.acomodo](datos)}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Fondo y acentos del estilo actual (se guardan por estilo). */
function Personalizar() {
  const { estilo, personalizacionDe, setPersonalizacion, paleta } = useTheme()
  const per = personalizacionDe()
  const cambiar = (cambio: Partial<Personalizacion>) => setPersonalizacion(estilo.id, { ...per, ...cambio })
  const personalizado = per.fondo !== "estilo" || per.acento || per.acento2
  const fondos: { id: FondoId; nombre: string; muestra: string[] }[] = [
    { id: "estilo", nombre: "Del estilo", muestra: [] },
    ...FONDOS.map((f) => ({ id: f.id, nombre: f.nombre, muestra: [f.colores.fondo, f.colores.superficie, f.colores.texto] })),
  ]
  const Chip = ({ activo, onClick, children, etiqueta }: { activo: boolean; onClick: () => void; children: React.ReactNode; etiqueta: string }) => (
    <button type="button" aria-pressed={activo} aria-label={etiqueta} title={etiqueta} onClick={onClick}
      className={`flex min-h-9 items-center gap-1.5 border px-2 text-xs ${activo ? "border-primary ring-2 ring-primary" : "border-border hover:bg-accent"}`}>
      {children}
    </button>
  )
  const FilaAcento = ({ campo, titulo }: { campo: "acento" | "acento2"; titulo: string }) => (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-36 text-xs text-muted-foreground">{titulo}</span>
      <Chip activo={!per[campo]} onClick={() => cambiar({ [campo]: null })} etiqueta="Del estilo">Del estilo</Chip>
      {ACENTOS_SUGERIDOS.map((c) => (
        <button key={c} type="button" aria-pressed={per[campo] === c} aria-label={`${titulo} ${c}`} title={c} onClick={() => cambiar({ [campo]: c })}
          className={`h-8 w-8 border ${per[campo] === c ? "border-foreground ring-2 ring-primary" : "border-border"}`} style={{ background: c, borderRadius: 999 }} />
      ))}
      <label className="flex min-h-9 cursor-pointer items-center gap-1 border border-border px-2 text-xs hover:bg-accent">
        <input type="color" value={per[campo] ?? "#31adff"} onChange={(ev) => cambiar({ [campo]: ev.target.value })} className="h-6 w-7 cursor-pointer border-0 bg-transparent p-0" />
        Otro
      </label>
    </div>
  )
  return (
    <section aria-label={`Personalizar ${estilo.nombre}`} className="flex flex-col gap-2 border border-border p-3" style={{ borderRadius: "var(--radius)" }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Personalizar «{estilo.nombre}»</h3>
        {personalizado && <button type="button" onClick={() => setPersonalizacion(estilo.id, SIN_PERSONALIZAR)} className="min-h-9 text-xs text-primary underline underline-offset-4">Restablecer</button>}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="w-36 text-xs text-muted-foreground">Fondo</span>
        {fondos.map((f) => (
          <Chip key={f.id} activo={per.fondo === f.id} onClick={() => cambiar({ fondo: f.id })} etiqueta={f.nombre}>
            {f.muestra.length > 0 && (
              <span aria-hidden="true" className="flex h-4 overflow-hidden border border-border" style={{ borderRadius: 3 }}>
                {f.muestra.map((c, i) => <span key={i} className="h-full w-2" style={{ background: c }} />)}
              </span>
            )}
            {f.nombre}
          </Chip>
        ))}
      </div>
      <FilaAcento campo="acento" titulo="Acento" />
      <FilaAcento campo="acento2" titulo="Acento secundario" />
      {per.acento && paleta.acento.toLowerCase() !== per.acento.toLowerCase() && (
        <p className="text-xs text-muted-foreground">
          El acento se ajustó a <span className="font-mono" style={{ color: paleta.acento }}>{paleta.acento}</span> para que se lea sobre este fondo (contraste {contraste(paleta.acento, paleta.superficie).toFixed(1)}:1).
        </p>
      )}
    </section>
  )
}

export function SelectorEstilo() {
  const { estilo, variante, estilos, setEstilo, modo, personalizacionDe } = useTheme()
  const [abierto, setAbierto] = useState(false)
  const [previo, setPrevio] = useState<{ e: Estilo; v: Variante } | null>(null)
  const grupos: [string, Estilo[]][] = [
    ["Conservadoras", estilos.filter((e) => e.grupo === "conservadora")],
    ["Creativas", estilos.filter((e) => e.grupo === "creativa")],
  ]
  // Variante que se usaría al elegir el estilo sin variante: la de tu modo preferido
  const varianteDe = (e: Estilo) => varianteParaModo(e, modo)
  const muestra = previo ?? { e: estilo, v: variante }

  return (
    <Dialog open={abierto} onOpenChange={(o) => { setAbierto(o); if (!o) setPrevio(null) }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label={`Estilo: ${estilo.nombre}. Cambiar estilo`}>
          <Palette className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto text-left">
        <DialogHeader>
          <DialogTitle>Estilo de la interfaz</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Actual: <b>{estilo.nombre}</b> · {variante.nombre}. Pasa el cursor sobre un estilo para verlo; al elegirlo se conserva tu modo {modo} si el estilo lo tiene.
          </p>
        </DialogHeader>
        <Personalizar />
        <div className="flex flex-col-reverse gap-4 md:flex-row">
          <div className="flex min-w-0 flex-[3] flex-col gap-4">
            {grupos.map(([titulo, lista]) => (
              <section key={titulo} className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-muted-foreground">{titulo}</h3>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
                  {lista.map((e) => {
                    const activo = e.id === estilo.id
                    return (
                      <div
                        key={e.id}
                        onMouseEnter={() => setPrevio({ e, v: varianteDe(e) })}
                        className={`flex flex-col gap-2 border p-2 ${activo ? "border-primary" : "border-border"}`}
                        style={{ borderRadius: "var(--radius)" }}
                      >
                        <button
                          type="button"
                          aria-pressed={activo}
                          onFocus={() => setPrevio({ e, v: varianteDe(e) })}
                          onClick={() => setEstilo(e.id)}
                          className="flex min-h-11 flex-col gap-1 rounded p-1 text-left hover:bg-accent"
                        >
                          <span className="flex items-center justify-between gap-2 font-semibold">
                            {e.nombre}
                            {activo && <Check className="h-4 w-4 text-primary" aria-label="estilo actual" />}
                          </span>
                          <span className="text-xs text-muted-foreground">{e.descripcion}</span>
                          <Muestra estilo={e} variante={varianteDe(e)} />
                        </button>
                        {e.variantes.length > 1 && (
                          <div className="flex flex-wrap gap-1" role="group" aria-label={`Variantes de ${e.nombre}`}>
                            {e.variantes.map((v) => {
                              const sel = activo && v.id === variante.id
                              return (
                                <button
                                  key={v.id}
                                  type="button"
                                  aria-pressed={sel}
                                  onMouseEnter={() => setPrevio({ e, v })}
                                  onFocus={() => setPrevio({ e, v })}
                                  onClick={() => setEstilo(e.id, v.id)}
                                  className={`min-h-9 flex-1 basis-[70px] border px-2 text-xs ${sel ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent"}`}
                                >
                                  {v.nombre}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
          <div className="min-w-0 flex-[2] md:sticky md:top-0 md:self-start">
            <VistaPrevia estilo={muestra.e} variante={muestra.v} per={personalizacionDe(muestra.e.id)} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
