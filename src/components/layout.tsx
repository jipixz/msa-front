import { ReactNode } from "react"

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen w-screen bg-background flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-4 flex-shrink-0">
        <div className="px-4 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Sistema de Monitoreo Ambiental. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
} 