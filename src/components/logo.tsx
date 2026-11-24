// Logo de AgroMonitor: un brote (sirve para cualquier cultivo) que transmite (ondas LoRa).
// Trazo con currentColor: toma el color del estilo activo.
export function Logo({ className = "h-6 w-6", titulo }: { className?: string; titulo?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
    >
      {/* tallo y suelo */}
      <path d="M13 29V15" />
      <path d="M6 29h14" />
      {/* hoja izquierda */}
      <path d="M13 19C7.5 19 4.5 15.5 4.5 11 9.5 11 13 14 13 19z" />
      {/* hoja derecha */}
      <path d="M13 15c0-5 3-8.5 8.5-8.5 0 5-3.5 8.5-8.5 8.5z" />
      {/* señal LoRa */}
      <path d="M24.5 12a3.5 3.5 0 0 1 0 5" />
      <path d="M27.5 9a8 8 0 0 1 0 11" />
    </svg>
  )
}
