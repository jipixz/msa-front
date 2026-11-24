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
import { API_URL, apiFetch } from "@/lib/api"
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
  Download,
  Package,
  TrendingUp,
  DollarSign,
  Weight,
  Loader2,
  AlertTriangle,
  CheckCircle,
  FileText,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

// Tipos para los datos de producción
interface ProductionRecord {
  _id: string
  fecha_cosecha: string
  parcela: 'Parcela Norte' | 'Parcela Sur'
  variedad_cacao: 'Criollo' | 'Forastero' | 'Trinitario' | 'Nacional'
  cantidad_kg: number
  calidad: 'Premium' | 'Estándar' | 'Baja' | 'Orgánico'
  humedad_porcentaje: number
  precio_kg: number
  metodo_secado: 'Natural' | 'Secador solar' | 'Secador mecánico' | 'Secado al sol'
  tiempo_secado_horas?: number
  temperatura_secado?: number
  humedad_final?: number
  peso_final?: number
  observaciones?: string
  fecha_registro: string
  imagenes?: string[] // Array de imágenes en base64
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
const API_BASE_URL = API_URL

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

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(50)

  // Estados para imágenes
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Estados para los datos
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>([])
  const [stats, setStats] = useState<ProductionStats | null>(null)

  // Estados para el formulario
  const [formData, setFormData] = useState({
    fecha_cosecha: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    parcela: "Parcela Norte" as 'Parcela Norte' | 'Parcela Sur',
    variedad_cacao: "Trinitario" as 'Criollo' | 'Forastero' | 'Trinitario' | 'Nacional',
    cantidad_kg: "",
    calidad: "Orgánico" as const,
    humedad_porcentaje: "",
    precio_kg: "",
    metodo_secado: "Secado al sol" as const,
    tiempo_secado_horas: "",
    temperatura_secado: "",
    humedad_final: "",
    peso_final: "",
    observaciones: "",
  })

  // Función para cargar registros de producción
  const loadProductionRecords = async () => {
    try {
      setLoading(true)
      const response = await apiFetch(`${API_BASE_URL}/api/production`)
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
      const response = await apiFetch(`${API_BASE_URL}/api/production/stats`)
      if (!response.ok) {
        throw new Error("Error al cargar estadísticas")
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error("Error cargando estadísticas:", err)
    }
  }

  // Función para manejar selección de imágenes
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length + selectedImages.length > 5) {
      setError("Máximo 5 imágenes permitidas")
      return
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError("Cada imagen debe ser menor a 5MB")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setSelectedImages(prev => [...prev, result])
      }
      reader.readAsDataURL(file)
    })
  }

  // Función para eliminar imagen
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  // Función para previsualizar imagen
  const handlePreviewImage = (image: string) => {
    setPreviewImage(image)
  }

  // Función para previsualizar múltiples imágenes
  const handlePreviewImages = (images: string[], startIndex: number = 0) => {
    setPreviewImages(images)
    setCurrentImageIndex(startIndex)
    setPreviewImage(images[startIndex])
  }

  // Función para descargar imagen
  const downloadImage = (image: string, index: number) => {
    const link = document.createElement('a')
    link.href = image
    link.download = `imagen_cacao_${index + 1}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Función para navegar a la siguiente imagen
  const nextImage = () => {
    if (previewImages.length > 0) {
      const nextIndex = (currentImageIndex + 1) % previewImages.length
      setCurrentImageIndex(nextIndex)
      setPreviewImage(previewImages[nextIndex])
    }
  }

  // Función para navegar a la imagen anterior
  const prevImage = () => {
    if (previewImages.length > 0) {
      const prevIndex = currentImageIndex === 0 ? previewImages.length - 1 : currentImageIndex - 1
      setCurrentImageIndex(prevIndex)
      setPreviewImage(previewImages[prevIndex])
    }
  }

  // Función para crear nuevo registro
  const createProductionRecord = async () => {
    try {
      setSubmitting(true)
      setError(null)
      
      const dataToSend = {
        ...formData,
        imagenes: selectedImages
      }
      
      const response = await apiFetch(`${API_BASE_URL}/api/production`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
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
        fecha_cosecha: new Date().toISOString().split('T')[0], // Fecha actual
        parcela: "Parcela Norte" as 'Parcela Norte' | 'Parcela Sur',
        variedad_cacao: "Criollo" as 'Criollo' | 'Forastero' | 'Trinitario' | 'Nacional',
        cantidad_kg: "",
        calidad: "Orgánico",
        humedad_porcentaje: "",
        precio_kg: "",
        metodo_secado: "Secado al sol",
        tiempo_secado_horas: "",
        temperatura_secado: "",
        humedad_final: "",
        peso_final: "",
        observaciones: "",
      })
      
      setSelectedImages([])
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

  // Función para obtener datos del mes actual
  const getCurrentMonthData = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    return productionRecords.filter(record => {
      const recordDate = new Date(record.fecha_cosecha)
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear
    })
  }

  // Función para calcular estadísticas de datos filtrados
  const getFilteredStats = () => {
    const filtered = registrosFiltradosYOrdenados
    const totalProduccion = filtered.reduce((sum, record) => sum + record.cantidad_kg, 0)
    const totalIngresos = filtered.reduce((sum, record) => sum + (record.cantidad_kg * record.precio_kg), 0)
    const precioPromedio = filtered.length > 0 ? totalIngresos / totalProduccion : 0
    const porcentajePremium = filtered.length > 0 
      ? (filtered.filter(r => r.calidad === 'Premium').length / filtered.length) * 100 
      : 0

    return {
      total_produccion: totalProduccion,
      total_ingresos: totalIngresos,
      precio_promedio: precioPromedio,
      porcentaje_premium: porcentajePremium,
      total_registros: filtered.length
    }
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
      let valorA: number | string, valorB: number | string
      
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
          valorA = String(a[ordenarPor as keyof ProductionRecord] ?? "")
          valorB = String(b[ordenarPor as keyof ProductionRecord] ?? "")
      }

      if (ordenDescendente) {
        return valorB > valorA ? 1 : -1
      } else {
        return valorA > valorB ? 1 : -1
      }
    })

    return registros
  }, [productionRecords, filtroParcela, filtroVariedad, filtroCalidad, ordenarPor, ordenDescendente])

  // Función para obtener registros paginados
  const getPaginatedRecords = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return registrosFiltradosYOrdenados.slice(startIndex, endIndex)
  }

  // Calcular total de páginas
  const totalPages = Math.ceil(registrosFiltradosYOrdenados.length / itemsPerPage)

  // Obtener datos del mes actual
  const currentMonthData = getCurrentMonthData()
  const currentMonthStats = {
    total_produccion: currentMonthData.reduce((sum, record) => sum + record.cantidad_kg, 0),
    total_ingresos: currentMonthData.reduce((sum, record) => sum + (record.cantidad_kg * record.precio_kg), 0),
    precio_promedio: currentMonthData.length > 0 
      ? currentMonthData.reduce((sum, record) => sum + (record.cantidad_kg * record.precio_kg), 0) / currentMonthData.reduce((sum, record) => sum + record.cantidad_kg, 0)
      : 0,
    porcentaje_premium: currentMonthData.length > 0 
      ? (currentMonthData.filter(r => r.calidad === 'Premium').length / currentMonthData.length) * 100 
      : 0,
    total_registros: currentMonthData.length
  }

  // Obtener estadísticas de datos filtrados
  const filteredStats = getFilteredStats()

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
      <div className="flex min-h-[70vh] w-full items-center justify-center" role="status">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando datos de producción...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <div className="w-full h-full p-4 px-8">
        {/* Header con botón de agregar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-foreground">Producción de Cacao</h1>
            <p className="text-foreground">Gestión y seguimiento de la producción artesanal</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-ok hover:bg-ok/15">
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
                <Alert className="border-bad/40 bg-bad/10">
                  <AlertTriangle className="h-4 w-4 text-bad" />
                  <AlertDescription className="text-bad">{error}</AlertDescription>
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
                  <Select value={formData.calidad} onValueChange={(value) => setFormData(prev => ({ ...prev, calidad: value as typeof prev.calidad }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Premium">Premium</SelectItem>
                        <SelectItem value="Estándar">Estándar</SelectItem>
                        <SelectItem value="Baja">Baja</SelectItem>
                        <SelectItem value="Orgánico">Orgánico</SelectItem>
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
                  <Select value={formData.metodo_secado} onValueChange={(value) => setFormData(prev => ({ ...prev, metodo_secado: value as typeof prev.metodo_secado }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Natural">Natural</SelectItem>
                      <SelectItem value="Secado al sol">Secado al sol</SelectItem>
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

                 {/* Peso final */}
                 <div className="space-y-2">
                   <Label htmlFor="peso_final">Peso Final (kg)</Label>
                   <Input
                     id="peso_final"
                     type="number"
                     step="0.1"
                     placeholder="Opcional"
                     value={formData.peso_final}
                     onChange={(e) => setFormData(prev => ({ ...prev, peso_final: e.target.value }))}
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

              {/* Campo de imágenes */}
              <div className="space-y-2">
                <Label htmlFor="imagenes">Imágenes (máximo 5, 5MB cada una)</Label>
                <Input
                  id="imagenes"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="cursor-pointer"
                />
                
                {/* Mostrar imágenes seleccionadas */}
                {selectedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {selectedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handlePreviewImage(image)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeImage(index)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Imagen {index + 1}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={createProductionRecord} 
                  disabled={submitting}
                  className="bg-ok hover:bg-ok/15"
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
          <Alert className="mb-6 border-ok/40 bg-ok/10">
            <CheckCircle className="h-4 w-4 text-ok" />
            <AlertDescription className="text-ok">{success}</AlertDescription>
          </Alert>
        )}

        {/* Cards de estadísticas del mes actual */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-info">Producción del Mes</p>
                  <p className="text-2xl font-bold font-mono text-foreground">
                    {currentMonthStats.total_produccion.toFixed(1)} kg
                  </p>
                </div>
                <Weight className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>

          <Card className="">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ok">Ingresos del Mes</p>
                  <p className="text-2xl font-bold font-mono text-foreground">
                    {formatCurrency(currentMonthStats.total_ingresos)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-ok" />
              </div>
            </CardContent>
          </Card>

          <Card className="">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-warn">Precio Promedio</p>
                  <p className="text-2xl font-bold font-mono text-foreground">
                    {formatCurrency(currentMonthStats.precio_promedio)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-warn" />
              </div>
            </CardContent>
          </Card>

          <Card className="">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-chart-4">Cacao Orgánico</p>
                  <p className="text-2xl font-bold font-mono text-foreground">
                    {currentMonthData.filter(r => r.calidad === 'Orgánico').reduce((sum, r) => sum + r.cantidad_kg, 0).toFixed(1)} kg
                  </p>
                </div>
                <Package className="h-8 w-8 text-chart-4" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="mx-auto grid w-full max-w-2xl grid-cols-2 md:grid-cols-4">
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
                    <TrendingUp className="h-5 w-5 text-info" />
                    Producción Mensual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.produccion_mensual || []}>
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip formatter={(value: number | string) => [`${value} kg`, 'Producción']} />
                        <Bar dataKey="cantidad" fill="hsl(var(--chart-1))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Distribución por calidad */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-chart-4" />
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
                            { name: 'Orgánico', value: productionRecords.filter(r => r.calidad === 'Orgánico').length },
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
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  Historial de Producción
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Cards de estadísticas filtradas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card className="">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-info">Registros Filtrados</p>
                          <p className="text-2xl font-bold font-mono text-foreground">
                            {filteredStats.total_registros}
                          </p>
                        </div>
                        <FileText className="h-8 w-8 text-info" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-ok">Producción Filtrada</p>
                          <p className="text-2xl font-bold font-mono text-foreground">
                            {filteredStats.total_produccion.toFixed(1)} kg
                          </p>
                        </div>
                        <Weight className="h-8 w-8 text-ok" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-warn">Ingresos Filtrados</p>
                          <p className="text-2xl font-bold font-mono text-foreground">
                            {formatCurrency(filteredStats.total_ingresos)}
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-warn" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-chart-4">Orgánico Filtrado</p>
                          <p className="text-2xl font-bold font-mono text-foreground">
                            {registrosFiltradosYOrdenados.filter(r => r.calidad === 'Orgánico').reduce((sum, r) => sum + r.cantidad_kg, 0).toFixed(1)} kg
                          </p>
                        </div>
                        <Package className="h-8 w-8 text-chart-4" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

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
                        <SelectItem value="Orgánico">Orgánico</SelectItem>
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

                {/* Controles de paginación */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="items-per-page">Elementos por página:</Label>
                    <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                      setItemsPerPage(Number(value))
                      setCurrentPage(1)
                    }}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="200">200</SelectItem>
                        <SelectItem value="500">500</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => cambiarOrdenamiento("fecha_cosecha")}
                        >
                          Fecha Cosecha {ordenarPor === "fecha_cosecha" && (ordenDescendente ? "↓" : "↑")}
                        </TableHead>
                        <TableHead>Parcela</TableHead>
                        <TableHead>Variedad</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => cambiarOrdenamiento("cantidad_kg")}
                        >
                          Cantidad (kg) {ordenarPor === "cantidad_kg" && (ordenDescendente ? "↓" : "↑")}
                        </TableHead>
                        <TableHead>Calidad</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => cambiarOrdenamiento("humedad_porcentaje")}
                        >
                          Humedad (%) {ordenarPor === "humedad_porcentaje" && (ordenDescendente ? "↓" : "↑")}
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => cambiarOrdenamiento("precio_kg")}
                        >
                          Precio/kg {ordenarPor === "precio_kg" && (ordenDescendente ? "↓" : "↑")}
                        </TableHead>
                        <TableHead>Método Secado</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Imágenes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPaginatedRecords().map((record) => (
                        <TableRow key={record._id}>
                          <TableCell>{formatDate(record.fecha_cosecha)}</TableCell>
                          <TableCell>{record.parcela}</TableCell>
                          <TableCell>{record.variedad_cacao}</TableCell>
                          <TableCell>{record.cantidad_kg.toFixed(1)}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                record.calidad === 'Premium' ? 'default' : 
                                record.calidad === 'Estándar' ? 'secondary' : 
                                record.calidad === 'Orgánico' ? 'default' : 
                                'destructive'
                              }
                              className={record.calidad === 'Orgánico' ? 'bg-ok/10 text-ok border-ok/40' : ''}
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
                          <TableCell>
                            {record.imagenes && record.imagenes.length > 0 ? (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlePreviewImages(record.imagenes || [], 0)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => downloadImage(record.imagenes?.[0] || '', 0)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                {record.imagenes.length > 1 && (
                                  <span className="text-xs text-muted-foreground ml-1">
                                    +{record.imagenes.length - 1}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Sin imágenes</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {registrosFiltradosYOrdenados.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
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
                        <Tooltip formatter={(value: number | string) => [formatCurrency(Number(value)), 'Precio/kg']} />
                        <Line type="monotone" dataKey="precio_kg" stroke="hsl(var(--warn))" strokeWidth={2} />
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
                        <Tooltip formatter={(value: number | string) => [`${value}%`, 'Humedad']} />
                        <Line type="monotone" dataKey="humedad_porcentaje" stroke="hsl(var(--info))" strokeWidth={2} />
                        {productionRecords[0]?.humedad_final && (
                          <Line type="monotone" dataKey="humedad_final" stroke="hsl(var(--ok))" strokeWidth={2} strokeDasharray="5 5" />
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
                            { name: 'Secado al sol', value: productionRecords.filter(r => r.metodo_secado === 'Secado al sol').length },
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
                        <Tooltip formatter={(value: number | string) => [`${value} kg`, 'Producción']} />
                        <Bar dataKey="cantidad" fill="hsl(var(--ok))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal de previsualización de imágenes */}
        {previewImage && (
          <Dialog open={!!previewImage} onOpenChange={() => {
            setPreviewImage(null)
            setPreviewImages([])
            setCurrentImageIndex(0)
          }}>
            <DialogContent className="max-w-6xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>
                  Galería de Imágenes 
                  {previewImages.length > 1 && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({currentImageIndex + 1} de {previewImages.length})
                    </span>
                  )}
                </DialogTitle>
              </DialogHeader>
              
              <div className="relative">
                {/* Imagen principal */}
                <div className="flex justify-center mb-4">
                  <img
                    src={previewImage}
                    alt={`Imagen ${currentImageIndex + 1}`}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                  />
                </div>

                {/* Controles de navegación */}
                {previewImages.length > 1 && (
                  <div className="flex justify-center gap-4 mb-4">
                    <Button
                      variant="outline"
                      onClick={prevImage}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      onClick={nextImage}
                      className="flex items-center gap-2"
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Miniaturas */}
                {previewImages.length > 1 && (
                  <div className="flex justify-center gap-2 mb-4 overflow-x-auto">
                    {previewImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentImageIndex(index)
                          setPreviewImage(image)
                        }}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden ${
                          index === currentImageIndex 
                            ? 'border-info/40 ring-2 ring-info' 
                            : 'border-border hover:border-border'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Miniatura ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = previewImage
                      link.download = `imagen_cacao_${currentImageIndex + 1}.jpg`
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                  {previewImages.length > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        previewImages.forEach((image, index) => {
                          setTimeout(() => {
                            const link = document.createElement('a')
                            link.href = image
                            link.download = `imagen_cacao_${index + 1}.jpg`
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                          }, index * 100)
                        })
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar Todas
                    </Button>
                  )}
                </div>
                <Button onClick={() => {
                  setPreviewImage(null)
                  setPreviewImages([])
                  setCurrentImageIndex(0)
                }}>
                  Cerrar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
