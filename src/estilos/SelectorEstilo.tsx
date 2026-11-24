import { useState } from "react"
import { Palette, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useTheme } from "@/components/theme-provider"
import type { Estilo, Variante } from "@/estilos/registro"

/** Muestra de colores de una variante (sin depender del estilo activo). */
function Muestra({ estilo, variante }: { estilo: Estilo; variante: Variante }) {
  const p = variante.paleta
  return (
    <span
      aria-hidden="true"
      style={{ background: p.fondo, borderColor: p.borde, fontFamily: `${estilo.fuentes.sans}, sans-serif` }}
      className="flex h-16 w-full items-end gap-1 overflow-hidden border p-2"
    >
      <span style={{ background: p.superficie, borderColor: p.borde, color: p.texto }} className="flex h-full flex-1 items-center justify-center border text-xs font-semibold">
        <span style={{ fontFamily: `${estilo.fuentes.mono}, monospace` }}>42%</span>
      </span>
      <span style={{ background: p.acento }} className="h-full w-3" />
      <span style={{ background: p.ok }} className="h-2/3 w-3" />
      <span style={{ background: p.warn }} className="h-1/2 w-3" />
      <span style={{ background: p.bad }} className="h-1/3 w-3" />
    </span>
  )
}

export function SelectorEstilo() {
  const { estilo, variante, estilos, setEstilo } = useTheme()
  const [abierto, setAbierto] = useState(false)
  const grupos: [string, Estilo[]][] = [
    ["Conservadoras", estilos.filter((e) => e.grupo === "conservadora")],
    ["Creativas", estilos.filter((e) => e.grupo === "creativa")],
  ]

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label={`Estilo: ${estilo.nombre}. Cambiar estilo`}>
          <Palette className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Estilo de la interfaz</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Actual: <b>{estilo.nombre}</b> · {variante.nombre}. Se guarda en este navegador.
          </p>
        </DialogHeader>
        {grupos.map(([titulo, lista]) => (
          <section key={titulo} className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-muted-foreground">{titulo}</h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
              {lista.map((e) => {
                const activo = e.id === estilo.id
                return (
                  <div key={e.id} className={`flex flex-col gap-2 border p-3 ${activo ? "border-primary" : "border-border"}`} style={{ borderRadius: "var(--radius)" }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{e.nombre}</span>
                      {activo && <Check className="h-4 w-4 text-primary" aria-label="estilo actual" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{e.descripcion}</p>
                    <div className="flex flex-wrap gap-2">
                      {e.variantes.map((v) => {
                        const sel = activo && v.id === variante.id
                        return (
                          <button
                            key={v.id}
                            type="button"
                            aria-pressed={sel}
                            onClick={() => setEstilo(e.id, v.id)}
                            className={`flex min-h-11 flex-1 basis-[90px] flex-col gap-1 border p-1 text-left text-xs ${sel ? "border-primary ring-2 ring-primary" : "border-border"}`}
                          >
                            <Muestra estilo={e} variante={v} />
                            <span className="px-1">{v.nombre}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </DialogContent>
    </Dialog>
  )
}
