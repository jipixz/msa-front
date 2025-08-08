"use client"

import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { Home, TrendingUp, Database, Settings, User, Bell, Menu, X, Leaf, BarChart3, MapPin, LogOut, Lock, Shield } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { useNotificationsStore, initNotifications } from "@/lib/notifications-store"
import { API_URL } from "@/lib/api"

const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
    description: "Monitoreo en tiempo real",
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
  const { user, logout, initialize, initialized, loading } = useAuthStore()
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
              <div className="p-2 bg-green-100 rounded-lg">
                <Leaf className="h-6 w-6 text-green-600" />
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
                      isActive ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800" : "text-muted-foreground hover:text-foreground"
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
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 hidden sm:flex">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Sistema Activo
              </Badge>
            )}

            {/* Notifications */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center">{unreadCount}</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="px-2 py-1 text-sm font-medium">Notificaciones</div>
                  {notifications.length === 0 ? (
                    <div className="px-2 py-2 text-xs text-muted-foreground">Sin notificaciones</div>
                  ) : (
                    notifications.slice(0, 6).map(n => (
                      <div key={n.id} className={`px-2 py-2 text-sm ${n.read ? 'opacity-70' : ''}`}>
                        <div className="font-medium">{n.title}</div>
                        <div className="text-xs text-muted-foreground">{n.message}</div>
                        <div className="text-[10px] text-muted-foreground">{new Date(n.timestamp).toLocaleString('es-ES')}</div>
                      </div>
                    ))
                  )}
                  <div className="flex gap-2 px-2 py-1">
                    <Button size="sm" variant="outline" className="h-7" onClick={markAllRead}>Marcar leídas</Button>
                    <Button size="sm" variant="ghost" className="h-7" onClick={clearAll}>Limpiar</Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="h-5 w-5" />
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
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href
                const Icon = item.icon
                return (
                  <Link key={item.name} to={item.href}>
                    <div
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${
                        isActive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "text-muted-foreground hover:bg-accent hover:text-foreground"
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
