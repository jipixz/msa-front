"use client"

import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"
import { SelectorEstilo } from "@/estilos/SelectorEstilo"
import { Home, TrendingUp, Database, User, Bell, Menu, X, LogOut, Lock, Shield, LineChart } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { useNotificationsStore, initNotifications } from "@/lib/notifications-store"
import { API_URL } from "@/lib/api"

const navigationItems = [
  {
    name: "Panel",
    href: "/",
    icon: Home,
    description: "Estado de la finca",
  },
  {
    name: "Gráficas",
    href: "/graficas",
    icon: LineChart,
    description: "Detalle por variable",
  },
  {
    name: "Predicciones",
    href: "/predictions",
    icon: TrendingUp,
    description: "Pronósticos agrícolas",
  },
  {
    name: "Producción",
    href: "/production",
    icon: Database,
    description: "Datos históricos de cacao",
  },
]

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { user, logout, initialize, initialized } = useAuthStore()
  const { notifications, unreadCount, markAllRead, clearAll } = useNotificationsStore()

  useEffect(() => { if (!initialized) initialize() }, [initialized])
  useEffect(() => { if (user) initNotifications(API_URL) }, [user])

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="rounded-lg border border-border p-1.5 text-primary">
                <Logo className="h-7 w-7" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground">AgroMonitor</h1>
                <p className="text-xs text-muted-foreground">Sistema de Monitoreo Agrícola</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {user && navigationItems.map((item) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon
              return (
                <Link key={item.name} to={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`flex items-center space-x-2 ${
                      isActive ? "bg-ok/10 text-ok hover:bg-ok/15 " : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Status Badge */}
            {user && (
              <Badge variant="secondary" className="bg-ok/10 text-ok border-ok/40 hidden sm:flex">
                <div className="w-2 h-2 bg-ok rounded-full mr-2 animate-pulse"></div>
                Sistema Activo
              </Badge>
            )}

            {/* Notifications */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-bad text-background rounded-full text-[10px] flex items-center justify-center">{unreadCount}</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="px-2 py-1 text-sm font-medium">Notificaciones</div>
                  {notifications.length === 0 ? (
                    <div className="px-2 py-2 text-xs text-muted-foreground">Sin notificaciones</div>
                  ) : (
                    notifications.slice(0, 8).map(n => {
                      const isAlert = n.kind === 'alert'
                      const alertColor = n.priority === 'urgent' || n.priority === 'high' ? 'text-bad' : 'text-warn'
                      return (
                        <div key={n.id} className={`px-2 py-2 text-sm ${n.read ? 'opacity-70' : ''}`}>
                          <div className="font-medium">
                            {isAlert && <span className={`mr-1 font-mono text-xs uppercase ${alertColor}`}>[{n.priority === 'urgent' ? 'urgente' : n.priority === 'high' ? 'alta' : 'alerta'}]</span>}
                            {n.title}
                          </div>
                          <div className="text-xs text-muted-foreground">{n.message}</div>
                          <div className="text-[10px] text-muted-foreground">{new Date(n.timestamp).toLocaleString('es-ES')}</div>
                        </div>
                      )
                    })
                  )}
                  <div className="flex gap-2 px-2 py-1">
                    <Button size="sm" variant="outline" className="h-7" onClick={markAllRead}>Marcar leídas</Button>
                    <Button size="sm" variant="ghost" className="h-7" onClick={clearAll}>Limpiar</Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Theme Toggle */}
            <SelectorEstilo />
            <ThemeToggle />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 rounded-full w-8 h-8 overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="avatar" className="w-8 h-8 object-cover" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!user && (
                  <Link to="/login">
                    <DropdownMenuItem>
                      <Lock className="h-4 w-4 mr-2" />
                      Iniciar sesión
                    </DropdownMenuItem>
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin">
                    <DropdownMenuItem>
                      <Shield className="h-4 w-4 mr-2" />
                      Administración
                    </DropdownMenuItem>
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin/notifier">
                    <DropdownMenuItem>
                      <Bell className="h-4 w-4 mr-2" />
                      Notificaciones
                    </DropdownMenuItem>
                  </Link>
                )}
                {user && (
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar sesión
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href
                const Icon = item.icon
                return (
                  <Link key={item.name} to={item.href}>
                    <div
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${
                        isActive ? "bg-ok/10 text-ok " : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
