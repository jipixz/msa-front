"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"
import Navigation from "./components/navigation"

// Tipos para los datos de la API
interface ProductionRecord {
  id: string
  date: string
  parcel: string
  cacao_type: string
  quantity: number
  quality: string
  humidity: number
  price: number
  notes?: string
}

interface Parcel {
  id: string
  name: string
  area: number
  location?: string
  main_variety: string
}

interface ProductionStats {
  total_production: number
  total_revenue: number
  average_price: number
  premium_quality_percentage: number
  monthly_production: Array<{
    month: string
    quantity: number
    revenue: number
  }>
  parcel_production: Array<{
    name: string
    value: number
    color: string
  }>
  cacao_type_distribution: Array<{
    name: string
    value: number
    color: string
  }>
}

// Configuración de la API
const API_BASE_URL = "http://localhost:8000"

export default function ProductionPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isParcelDialogOpen, setIsParcelDialogOpen] = useState(false)
  const [filterParcel, setFilterParcel] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estados para los datos
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>([])
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [stats, setStats] = useState<ProductionStats | null>(null)

  // Estados para formularios
  const [newRecord, setNewRecord] = useState({
    date: "",
    parcel: "",
    cacao_type: "",
    quantity: "",
    quality: "",
    humidity: "",
    price: "",
    notes: "",
  })

  const [newParcel, setNewParcel] = useState({
    name: "",
    area: "",
    location: "",
    main_variety: "",
  })

  // Función para cargar datos de producción
  const loadProductionRecords = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/production/records`)
      if (!response.ok) throw new Error("Error al cargar registros de producción")
      const data = await response.json()
      setProductionRecords(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  // Función para cargar parcelas
  const loadParcels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/production/parcels`)
      if (!response.ok) throw new Error("Error al cargar parcelas")
      const data = await response.json()
      setParcels(data)
    } catch (err) {
      console.error("Error cargando parcelas:", err)
    }
  }

  // Función para cargar estadísticas
  const loadStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/production/stats`)
      if (!response.ok) throw new Error("Error al cargar estadísticas")
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error("Error cargando estadísticas:", err)
    }
  }

  // Función para crear nuevo registro
  const createProductionRecord = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/production/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: newRecord.date,
          parcel: newRecord.parcel,
          cacao_type: newRecord.cacao_type,
          quantity: parseFloat(newRecord.quantity),
          quality: newRecord.quality,
          humidity: parseFloat(newRecord.humidity),
          price: parseFloat(newRecord.price),
          notes: newRecord.notes,
        }),
      })

      if (!response.ok) throw new Error("Error al crear registro")
      
      // Recargar datos
      await loadProductionRecords()
      await loadStats()
      
      // Limpiar formulario y cerrar diálogo
      setNewRecord({
        date: "",
        parcel: "",
        cacao_type: "",
        quantity: "",
        quality: "",
        humidity: "",
        price: "",
        notes: "",
      })
      setIsAddDialogOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear registro")
    }
  }

  // Función para crear nueva parcela
  const createParcel = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/production/parcels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newParcel.name,
          area: parseFloat(newParcel.area),
          location: newParcel.location,
          main_variety: newParcel.main_variety,
        }),
      })

      if (!response.ok) throw new Error("Error al crear parcela")
      
      // Recargar parcelas
      await loadParcels()
      
      // Limpiar formulario y cerrar diálogo
      setNewParcel({
        name: "",
        area: "",
        location: "",
        main_variety: "",
      })
      setIsParcelDialogOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear parcela")
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    loadProductionRecords()
    loadParcels()
    loadStats()
  }, [])

  // Filtrar registros
  const filteredRecords = productionRecords.filter((record) => {
    const matchesParcel = filterParcel === "all" || record.parcel === filterParcel
    const matchesType = filterType === "all" || record.cacao_type === filterType
    const matchesSearch =
      (record.notes?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      record.parcel.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesParcel && matchesType && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando datos de producción...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Producción de Cacao</h1>
            <p className="text-gray-600">Gestión y análisis de datos de producción</p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={isParcelDialogOpen} onOpenChange={setIsParcelDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <MapPin className="h-4 w-4 mr-2" />
                  Nueva Parcela
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Nueva Parcela</DialogTitle>
                  <DialogDescription>Registre una nueva parcela para el seguimiento de producción</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="parcel-name">Nombre de la Parcela</Label>
                    <Input 
                      id="parcel-name" 
                      placeholder="Ej: Parcela Central"
                      value={newParcel.name}
                      onChange={(e) => setNewParcel({...newParcel, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="parcel-area">Área (hectáreas)</Label>
                    <Input 
                      id="parcel-area" 
                      type="number" 
                      placeholder="2.5"
                      value={newParcel.area}
                      onChange={(e) => setNewParcel({...newParcel, area: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="parcel-location">Ubicación GPS</Label>
                    <Input 
                      id="parcel-location" 
                      placeholder="Lat, Lng"
                      value={newParcel.location}
                      onChange={(e) => setNewParcel({...newParcel, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="parcel-variety">Variedad Principal</Label>
                    <Select value={newParcel.main_variety} onValueChange={(value) => setNewParcel({...newParcel, main_variety: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar variedad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Trinitario">Trinitario</SelectItem>
                        <SelectItem value="Forastero">Forastero</SelectItem>
                        <SelectItem value="Criollo">Criollo</SelectItem>
                        <SelectItem value="Nacional">Nacional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" onClick={createParcel}>Agregar Parcela</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Producción
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Registrar Nueva Producción</DialogTitle>
                  <DialogDescription>Ingrese los datos de la nueva cosecha de cacao</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Fecha de Cosecha</Label>
                    <Input 
                      id="date" 
                      type="date"
                      value={newRecord.date}
                      onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="parcel">Parcela</Label>
                    <Select value={newRecord.parcel} onValueChange={(value) => setNewRecord({...newRecord, parcel: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar parcela" />
                      </SelectTrigger>
                      <SelectContent>
                        {parcels.map((parcel) => (
                          <SelectItem key={parcel.id} value={parcel.name}>
                            {parcel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cacao-type">Tipo de Cacao</Label>
                    <Select value={newRecord.cacao_type} onValueChange={(value) => setNewRecord({...newRecord, cacao_type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Trinitario">Trinitario</SelectItem>
                        <SelectItem value="Forastero">Forastero</SelectItem>
                        <SelectItem value="Criollo">Criollo</SelectItem>
                        <SelectItem value="Nacional">Nacional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Cantidad (kg)</Label>
                    <Input 
                      id="quantity" 
                      type="number" 
                      placeholder="125.5"
                      value={newRecord.quantity}
                      onChange={(e) => setNewRecord({...newRecord, quantity: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quality">Calidad</Label>
                    <Select value={newRecord.quality} onValueChange={(value) => setNewRecord({...newRecord, quality: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar calidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Premium">Premium</SelectItem>
                        <SelectItem value="Estándar">Estándar</SelectItem>
                        <SelectItem value="Segunda">Segunda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="humidity">Humedad (%)</Label>
                    <Input 
                      id="humidity" 
                      type="number" 
                      placeholder="7.2"
                      value={newRecord.humidity}
                      onChange={(e) => setNewRecord({...newRecord, humidity: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Precio por kg ($)</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      placeholder="4.50"
                      value={newRecord.price}
                      onChange={(e) => setNewRecord({...newRecord, price: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="notes">Notas</Label>
                    <Input 
                      id="notes" 
                      placeholder="Observaciones sobre la cosecha..."
                      value={newRecord.notes}
                      onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                    />
                  </div>
                </div>
                <Button className="w-full mt-4" onClick={createProductionRecord}>Registrar Producción</Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Producción Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats ? `${stats.total_production.toFixed(1)} kg` : "0 kg"}
                  </p>
                  <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.5% vs mes anterior
                  </p>
                </div>
                <Weight className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats ? `$${stats.total_revenue.toFixed(0)}` : "$0"}
                  </p>
                  <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8.3% vs mes anterior
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Precio Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats ? `$${stats.average_price.toFixed(2)}/kg` : "$0.00/kg"}
                  </p>
                  <p className="text-xs text-red-600 flex items-center">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -2.1% vs mes anterior
                  </p>
                </div>
                <Package className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Calidad Premium</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats ? `${stats.premium_quality_percentage.toFixed(0)}%` : "0%"}
                  </p>
                  <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +5.2% vs mes anterior
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="records">Registros</TabsTrigger>
            <TabsTrigger value="analytics">Análisis</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Production Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Producción Mensual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.monthly_production || []}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="quantity" fill="#10b981" name="Cantidad (kg)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Ingresos Mensuales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats?.monthly_production || []}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} name="Ingresos ($)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Parcel Production */}
              <Card>
                <CardHeader>
                  <CardTitle>Producción por Parcela</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats?.parcel_production || []}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}kg`}
                        >
                          {(stats?.parcel_production || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Cacao Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Tipo de Cacao</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats?.cacao_type_distribution || []}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {(stats?.cacao_type_distribution || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="records" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Registros de Producción
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  <Select value={filterParcel} onValueChange={setFilterParcel}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por parcela" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las parcelas</SelectItem>
                      {parcels.map((parcel) => (
                        <SelectItem key={parcel.id} value={parcel.name}>
                          {parcel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="Trinitario">Trinitario</SelectItem>
                      <SelectItem value="Forastero">Forastero</SelectItem>
                      <SelectItem value="Criollo">Criollo</SelectItem>
                      <SelectItem value="Nacional">Nacional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Records Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Parcela</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Cantidad (kg)</TableHead>
                        <TableHead>Calidad</TableHead>
                        <TableHead>Humedad (%)</TableHead>
                        <TableHead>Precio ($/kg)</TableHead>
                        <TableHead>Total ($)</TableHead>
                        <TableHead>Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.parcel}</Badge>
                          </TableCell>
                          <TableCell>{record.cacao_type}</TableCell>
                          <TableCell className="font-medium">{record.quantity}</TableCell>
                          <TableCell>
                            <Badge variant={record.quality === "Premium" ? "default" : "secondary"}>
                              {record.quality}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.humidity}%</TableCell>
                          <TableCell>${record.price}</TableCell>
                          <TableCell className="font-medium">${(record.quantity * record.price).toFixed(2)}</TableCell>
                          <TableCell className="max-w-xs truncate">{record.notes || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tendencia de Precios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats?.monthly_production || []}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          name="Precio Promedio"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Calidad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Premium</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${stats?.premium_quality_percentage || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats?.premium_quality_percentage.toFixed(0) || 0}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Estándar</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-600 h-2 rounded-full" 
                            style={{ width: `${100 - (stats?.premium_quality_percentage || 0)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{100 - (stats?.premium_quality_percentage || 0)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Rendimiento por Parcela</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.parcel_production || []}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8b5cf6" name="Producción (kg)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reporte Mensual</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Resumen completo de la producción del mes actual</p>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generar PDF
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Rentabilidad</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Análisis detallado de costos y ganancias por parcela</p>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generar Excel
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Certificación de Calidad</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Reporte para certificaciones y auditorías</p>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generar Reporte
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
