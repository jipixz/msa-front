import { ReactNode } from "react"
import { ThemeToggle } from "@/components/theme-toggle"

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path>
              <path d="M3 9v.01"></path>
              <path d="M21 9v.01"></path>
              <path d="M8 4v.01"></path>
              <path d="M16 4v.01"></path>
              <path d="M3 15v.01"></path>
              <path d="M21 15v.01"></path>
              <path d="M8 20v.01"></path>
              <path d="M16 20v.01"></path>
            </svg>
            <span className="font-bold">Sistema de Monitoreo Ambiental</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="container py-6">
        {children}
      </main>
      <footer className="border-t py-4">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Sistema de Monitoreo Ambiental. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
} 