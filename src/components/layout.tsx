import { ThemeToggle } from "./theme-toggle"
import { useSession } from "@/lib/auth-client"
import { Button } from "./ui/button"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { LogoIcon } from "./icons"

export function Layout({ children }: { children: React.ReactNode }) {
  const { session, signOut } = useSession()
  const navigate = useNavigate()
  const location = useLocation()

  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
    const isActive = location.pathname === to
    return (
      <Link
        to={to}
        className={cn(
          "px-3 py-2 text-sm font-medium rounded-md transition-colors",
          "hover:bg-accent/50 hover:text-accent-foreground",
          isActive 
            ? "bg-accent/80 text-accent-foreground font-semibold" 
            : "text-muted-foreground"
        )}
      >
        {children}
      </Link>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <LogoIcon className="h-8 w-8 text-primary" />
                <span className="hidden font-bold text-xl md:inline-block">Cacao App</span>
              </Link>
              
              <nav className="ml-8 hidden space-x-1 md:flex">
                <NavLink to="/">Inicio</NavLink>
                <NavLink to="/about">Acerca de</NavLink>
                {session && (
                  <NavLink to="/dashboard">Dashboard</NavLink>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              {session ? (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    signOut()
                    navigate('/')
                  }}
                  size="sm"
                  className="font-medium"
                >
                  Cerrar Sesión
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate('/login')}
                  size="sm"
                  className="font-medium"
                >
                  Iniciar Sesión
                </Button>
              )}
            </div>
          </div>
          
          {/* Navegación móvil */}
          <div className="flex justify-center space-x-1 py-2 md:hidden border-t">
            <NavLink to="/">Inicio</NavLink>
            <NavLink to="/about">Acerca de</NavLink>
            {session && (
              <NavLink to="/dashboard">Dashboard</NavLink>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      
      <footer className="border-t py-6 md:py-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
            <p className="text-center text-sm text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} Cacao App. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/about" className="text-sm text-muted-foreground hover:underline">
                Acerca de
              </Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:underline">
                Privacidad
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:underline">
                Términos
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 