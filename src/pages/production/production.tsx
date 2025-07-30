import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"
import {
  Plus,
  Filter,
  Download,
  MapPin,
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Weight,
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Thermometer,
  Droplets,
  Clock,
  FileText,
} from "lucide-react"

// Tipos para los datos de producción
interface ProductionRecord {
  _id: string
  fecha_cosecha: string
  parcela: 'Parcela Norte' | 'Parcela Sur'
  variedad_cacao: 'Criollo' | 'Forastero' | 'Trinitario' | 'Nacional'
  cantidad_kg: number
  calidad: 'Premium' | 'Estándar' | 'Baja'
  humedad_porcentaje: number
  precio_kg: number
  metodo_secado: 'Natural' | 'Secador solar' | 'Secador mecánico'
  tiempo_secado_horas?: number
  temperatura_secado?: number
  humedad_final?: number
  observaciones?: string
  fecha_registro: string
}

interface ProductionStats {
  total_produccion: number
  total_ingresos: number
  precio_promedio: number
  porcentaje_premium: number
  total_registros: number
  produccion_mensual: Array<{
    mes: string
    cantidad: number
    ingresos: number
  }>
}

// Configuración de la API
const API_BASE_URL = "http://localhost:5000"

export default function ProductionPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Estados para filtros y ordenamiento
  const [filtroParcela, setFiltroParcela] = useState<string>("all")
  const [filtroVariedad, setFiltroVariedad] = useState<string>("all")
  const [filtroCalidad, setFiltroCalidad] = useState<string>("all")
  const [ordenarPor, setOrdenarPor] = useState<string>("fecha_cosecha")
  const [ordenDescendente, setOrdenDescendente] = useState<boolean>(true)

  // Estados para los datos
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>([])
  const [stats, setStats] = useState<ProductionStats | null>(null)

  // Estados para el formulario
  const [formData, setFormData] = useState({
    fecha_cosecha: "",
    parcela: "Parcela Norte" as 'Parcela Norte' | 'Parcela Sur',
    variedad_cacao: "Criollo" as 'Criollo' | 'Forastero' | 'Trinitario' | 'Nacional',
    cantidad_kg: "",
    calidad: "Estándar" as const,
    humedad_porcentaje: "",
    precio_kg: "",
    metodo_secado: "Natural" as const,
    tiempo_secado_horas: "",
    temperatura_secado: "",
    humedad_final: "",
    observaciones: "",
  })

  // Función para cargar registros de producción
  const loadProductionRecords = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/production`)
      if (!response.ok) {
        throw new Error("Error al cargar registros de producción")
      }
      const data = await response.json()
      setProductionRecords(data)
    } catch (err) {
      console.error("Error cargando registros:", err)
      setError("Error al cargar registros de producción")
    } finally {
      setLoading(false)
    }
  }

  // Función para cargar estadísticas
  const loadStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/production/stats`)
      if (!response.ok) {
        throw new Error("Error al cargar estadísticas")
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error("Error cargando estadísticas:", err)
    }
  }

  // Función para crear nuevo registro
  const createProductionRecord = async () => {
    try {
      setSubmitting(true)
      setError(null)
      
      const response = await fetch(`${API_BASE_URL}/api/production`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al crear registro")
      }
      
      const newRecord = await response.json()
      setProductionRecords(prev => [newRecord, ...prev])
      
      // Recargar estadísticas
      await loadStats()
      
             // Limpiar formulario y mostrar éxito
       setFormData({
         fecha_cosecha: "",
         parcela: "Parcela Norte" as 'Parcela Norte' | 'Parcela Sur',
         variedad_cacao: "Criollo" as 'Criollo' | 'Forastero' | 'Trinitario' | 'Nacional',
         cantidad_kg: "",
         calidad: "Estándar",
         humedad_porcentaje: "",
         precio_kg: "",
         metodo_secado: "Natural",
         tiempo_secado_horas: "",
         temperatura_secado: "",
         humedad_final: "",
         observaciones: "",
       })
      
      setSuccess("Registro de producción creado exitosamente")
      setIsAddDialogOpen(false)
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setSubmitting(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    loadProductionRecords()
    loadStats()
  }, [])

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount)
  }

  // Colores para las gráficas
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  // Función para ordenar y filtrar registros
  const registrosFiltradosYOrdenados = useMemo(() => {
    let registros = [...productionRecords]

    // Aplicar filtros
    if (filtroParcela !== "all") {
      registros = registros.filter(reg => reg.parcela === filtroParcela)
    }
    if (filtroVariedad !== "all") {
      registros = registros.filter(reg => reg.variedad_cacao === filtroVariedad)
    }
    if (filtroCalidad !== "all") {
      registros = registros.filter(reg => reg.calidad === filtroCalidad)
    }

    // Aplicar ordenamiento
    registros.sort((a, b) => {
      let valorA: any, valorB: any
      
      switch (ordenarPor) {
        case "fecha_cosecha":
          valorA = new Date(a.fecha_cosecha).getTime()
          valorB = new Date(b.fecha_cosecha).getTime()
          break
        case "cantidad_kg":
          valorA = a.cantidad_kg
          valorB = b.cantidad_kg
          break
        case "precio_kg":
          valorA = a.precio_kg
          valorB = b.precio_kg
          break
        case "humedad_porcentaje":
          valorA = a.humedad_porcentaje
          valorB = b.humedad_porcentaje
          break
        default:
          valorA = a[ordenarPor as keyof ProductionRecord]
          valorB = b[ordenarPor as keyof ProductionRecord]
      }

      if (ordenDescendente) {
        return valorB > valorA ? 1 : -1
      } else {
        return valorA > valorB ? 1 : -1
      }
    })

    return registros
  }, [productionRecords, filtroParcela, filtroVariedad, filtroCalidad, ordenarPor, ordenDescendente])

  // Función para cambiar ordenamiento
  const cambiarOrdenamiento = (campo: string) => {
    if (ordenarPor === campo) {
      setOrdenDescendente(!ordenDescendente)
    } else {
      setOrdenarPor(campo)
      setOrdenDescendente(true)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-green-50 to-amber-50 dark:from-green-950 dark:to-amber-950 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando datos de producción...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-green-50 to-amber-50 dark:from-green-950 dark:to-amber-950">
      <div className="w-full h-full p-4 px-8">
        {/* Header con botón de agregar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Producción de Cacao</h1>
            <p className="text-gray-600 dark:text-gray-300">Gestión y seguimiento de la producción artesanal</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nueva Producción</DialogTitle>
                <DialogDescription>
                  Ingresa los datos de la cosecha de cacao para mantener un historial detallado.
                </DialogDescription>
              </DialogHeader>
              
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fecha de cosecha */}
                <div className="space-y-2">
                  <Label htmlFor="fecha_cosecha">Fecha de Cosecha *</Label>
                  <Input
                    id="fecha_cosecha"
                    type="date"
                    value={formData.fecha_cosecha}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha_cosecha: e.target.value }))}
                    required
                  />
                </div>

                {/* Parcela */}
                <div className="space-y-2">
                  <Label htmlFor="parcela">Parcela *</Label>
                  <Select value={formData.parcela} onValueChange={(value) => setFormData(prev => ({ ...prev, parcela: value as 'Parcela Norte' | 'Parcela Sur' }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Parcela Norte">Parcela Norte</SelectItem>
                      <SelectItem value="Parcela Sur">Parcela Sur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Variedad de cacao */}
                <div className="space-y-2">
                  <Label htmlFor="variedad_cacao">Variedad de Cacao *</Label>
                  <Select value={formData.variedad_cacao} onValueChange={(value) => setFormData(prev => ({ ...prev, variedad_cacao: value as 'Criollo' | 'Forastero' | 'Trinitario' | 'Nacional' }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Criollo">Criollo</SelectItem>
                      <SelectItem value="Forastero">Forastero</SelectItem>
                      <SelectItem value="Trinitario">Trinitario</SelectItem>
                      <SelectItem value="Nacional">Nacional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cantidad */}
                <div className="space-y-2">
                  <Label htmlFor="cantidad_kg">Cantidad (kg) *</Label>
                  <Input
                    id="cantidad_kg"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={formData.cantidad_kg}
                    onChange={(e) => setFormData(prev => ({ ...prev, cantidad_kg: e.target.value }))}
                    required
                  />
                </div>

                {/* Calidad */}
                <div className="space-y-2">
                  <Label htmlFor="calidad">Calidad *</Label>
                  <Select value={formData.calidad} onValueChange={(value) => setFormData(prev => ({ ...prev, calidad: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Estándar">Estándar</SelectItem>
                      <SelectItem value="Baja">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Humedad inicial */}
                <div className="space-y-2">
                  <Label htmlFor="humedad_porcentaje">Humedad Inicial (%) *</Label>
                  <Input
                    id="humedad_porcentaje"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={formData.humedad_porcentaje}
                    onChange={(e) => setFormData(prev => ({ ...prev, humedad_porcentaje: e.target.value }))}
                    required
                  />
                </div>

                {/* Precio por kg */}
                <div className="space-y-2">
                  <Label htmlFor="precio_kg">Precio por kg (COP) *</Label>
                  <Input
                    id="precio_kg"
                    type="number"
                    step="100"
                    placeholder="0"
                    value={formData.precio_kg}
                    onChange={(e) => setFormData(prev => ({ ...prev, precio_kg: e.target.value }))}
                    required
                  />
                </div>

                {/* Método de secado */}
                <div className="space-y-2">
                  <Label htmlFor="metodo_secado">Método de Secado *</Label>
                  <Select value={formData.metodo_secado} onValueChange={(value) => setFormData(prev => ({ ...prev, metodo_secado: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Natural">Natural</SelectItem>
                      <SelectItem value="Secador solar">Secador solar</SelectItem>
                      <SelectItem value="Secador mecánico">Secador mecánico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tiempo de secado */}
                <div className="space-y-2">
                  <Label htmlFor="tiempo_secado_horas">Tiempo de Secado (horas)</Label>
                  <Input
                    id="tiempo_secado_horas"
                    type="number"
                    step="0.5"
                    placeholder="Opcional"
                    value={formData.tiempo_secado_horas}
                    onChange={(e) => setFormData(prev => ({ ...prev, tiempo_secado_horas: e.target.value }))}
                  />
                </div>

                {/* Temperatura de secado */}
                <div className="space-y-2">
                  <Label htmlFor="temperatura_secado">Temperatura de Secado (°C)</Label>
                  <Input
                    id="temperatura_secado"
                    type="number"
                    step="0.1"
                    placeholder="Opcional"
                    value={formData.temperatura_secado}
                    onChange={(e) => setFormData(prev => ({ ...prev, temperatura_secado: e.target.value }))}
                  />
                </div>

                {/* Humedad final */}
                <div className="space-y-2">
                  <Label htmlFor="humedad_final">Humedad Final (%)</Label>
                  <Input
                    id="humedad_final"
                    type="number"
                    step="0.1"
                    placeholder="Opcional"
                    value={formData.humedad_final}
                    onChange={(e) => setFormData(prev => ({ ...prev, humedad_final: e.target.value }))}
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Notas adicionales sobre la cosecha, condiciones climáticas, etc."
                  value={formData.observaciones}
                  onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={createProductionRecord} 
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Registro'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Mensaje de éxito */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Cards de estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Producción Total</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {stats.total_produccion.toFixed(1)} kg
                    </p>
                  </div>
                  <Weight className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Ingresos Totales</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {formatCurrency(stats.total_ingresos)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Precio Promedio</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {formatCurrency(stats.precio_promedio)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Calidad Premium</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {stats.porcentaje_premium.toFixed(1)}%
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 max-w-2xl">
            <TabsTrigger value="overview" className="text-xs md:text-sm">Resumen</TabsTrigger>
            <TabsTrigger value="history" className="text-xs md:text-sm">Historial</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs md:text-sm">Análisis</TabsTrigger>
            <TabsTrigger value="charts" className="text-xs md:text-sm">Gráficas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Producción mensual */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Producción Mensual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.produccion_mensual || []}>
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip formatter={(value: any) => [`${value} kg`, 'Producción']} />
                        <Bar dataKey="cantidad" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Distribución por calidad */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-500" />
                    Distribución por Calidad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Premium', value: productionRecords.filter(r => r.calidad === 'Premium').length },
                            { name: 'Estándar', value: productionRecords.filter(r => r.calidad === 'Estándar').length },
                            { name: 'Baja', value: productionRecords.filter(r => r.calidad === 'Baja').length },
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-500" />
                  Historial de Producción
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <Label htmlFor="filtro-parcela">Filtrar por Parcela</Label>
                    <Select value={filtroParcela} onValueChange={setFiltroParcela}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las parcelas</SelectItem>
                        <SelectItem value="Parcela Norte">Parcela Norte</SelectItem>
                        <SelectItem value="Parcela Sur">Parcela Sur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="filtro-variedad">Filtrar por Variedad</Label>
                    <Select value={filtroVariedad} onValueChange={setFiltroVariedad}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las variedades</SelectItem>
                        <SelectItem value="Criollo">Criollo</SelectItem>
                        <SelectItem value="Forastero">Forastero</SelectItem>
                        <SelectItem value="Trinitario">Trinitario</SelectItem>
                        <SelectItem value="Nacional">Nacional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="filtro-calidad">Filtrar por Calidad</Label>
                    <Select value={filtroCalidad} onValueChange={setFiltroCalidad}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las calidades</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                        <SelectItem value="Estándar">Estándar</SelectItem>
                        <SelectItem value="Baja">Baja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="ordenar-por">Ordenar por</Label>
                    <Select value={ordenarPor} onValueChange={setOrdenarPor}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fecha_cosecha">Fecha de Cosecha</SelectItem>
                        <SelectItem value="cantidad_kg">Cantidad (kg)</SelectItem>
                        <SelectItem value="precio_kg">Precio/kg</SelectItem>
                        <SelectItem value="humedad_porcentaje">Humedad (%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => cambiarOrdenamiento("fecha_cosecha")}
                        >
                          Fecha Cosecha {ordenarPor === "fecha_cosecha" && (ordenDescendente ? "↓" : "↑")}
                        </TableHead>
                        <TableHead>Parcela</TableHead>
                        <TableHead>Variedad</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => cambiarOrdenamiento("cantidad_kg")}
                        >
                          Cantidad (kg) {ordenarPor === "cantidad_kg" && (ordenDescendente ? "↓" : "↑")}
                        </TableHead>
                        <TableHead>Calidad</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => cambiarOrdenamiento("humedad_porcentaje")}
                        >
                          Humedad (%) {ordenarPor === "humedad_porcentaje" && (ordenDescendente ? "↓" : "↑")}
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => cambiarOrdenamiento("precio_kg")}
                        >
                          Precio/kg {ordenarPor === "precio_kg" && (ordenDescendente ? "↓" : "↑")}
                        </TableHead>
                        <TableHead>Método Secado</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrosFiltradosYOrdenados.map((record) => (
                        <TableRow key={record._id}>
                          <TableCell>{formatDate(record.fecha_cosecha)}</TableCell>
                          <TableCell>{record.parcela}</TableCell>
                          <TableCell>{record.variedad_cacao}</TableCell>
                          <TableCell>{record.cantidad_kg.toFixed(1)}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={record.calidad === 'Premium' ? 'default' : record.calidad === 'Estándar' ? 'secondary' : 'destructive'}
                            >
                              {record.calidad}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.humedad_porcentaje.toFixed(1)}%</TableCell>
                          <TableCell>{formatCurrency(record.precio_kg)}</TableCell>
                          <TableCell>{record.metodo_secado}</TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(record.cantidad_kg * record.precio_kg)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {registrosFiltradosYOrdenados.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron registros con los filtros aplicados
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Análisis de precios */}
              <Card>
                <CardHeader>
                  <CardTitle>Evolución de Precios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={productionRecords.slice(0, 20)}>
                        <XAxis dataKey="fecha_cosecha" tickFormatter={formatDate} />
                        <YAxis />
                        <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), 'Precio/kg']} />
                        <Line type="monotone" dataKey="precio_kg" stroke="#f97316" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Análisis de humedad */}
              <Card>
                <CardHeader>
                  <CardTitle>Control de Humedad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={productionRecords.slice(0, 20)}>
                        <XAxis dataKey="fecha_cosecha" tickFormatter={formatDate} />
                        <YAxis />
                        <Tooltip formatter={(value: any) => [`${value}%`, 'Humedad']} />
                        <Line type="monotone" dataKey="humedad_porcentaje" stroke="#06b6d4" strokeWidth={2} />
                        {productionRecords[0]?.humedad_final && (
                          <Line type="monotone" dataKey="humedad_final" stroke="#84cc16" strokeWidth={2} strokeDasharray="5 5" />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="charts" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Métodos de secado */}
              <Card>
                <CardHeader>
                  <CardTitle>Métodos de Secado Utilizados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Natural', value: productionRecords.filter(r => r.metodo_secado === 'Natural').length },
                            { name: 'Secador solar', value: productionRecords.filter(r => r.metodo_secado === 'Secador solar').length },
                            { name: 'Secador mecánico', value: productionRecords.filter(r => r.metodo_secado === 'Secador mecánico').length },
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Producción por parcela */}
              <Card>
                <CardHeader>
                  <CardTitle>Producción por Parcela</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Object.entries(
                        productionRecords.reduce((acc, record) => {
                          acc[record.parcela] = (acc[record.parcela] || 0) + record.cantidad_kg;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([parcela, cantidad]) => ({ parcela, cantidad }))}>
                        <XAxis dataKey="parcela" />
                        <YAxis />
                        <Tooltip formatter={(value: any) => [`${value} kg`, 'Producción']} />
                        <Bar dataKey="cantidad" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
