import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RANGOS, enRango, haceCuanto, type CampoNumerico } from "@/panel/datos"
import { io } from "socket.io-client"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from "recharts"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Bell } from "lucide-react"
import { API_URL, apiFetch } from "@/lib/api"

// URL del servidor backend
//const BACKEND_URL = "http://192.168.0.64:5000"
const BACKEND_URL = API_URL
const INACTIVITY_TIMEOUT = 30000; // 30 segundos sin recibir datos
const MAX_DATA_POINTS = 20; // Máximo número de puntos a mostrar en gráficas

type SensorData = {
  humedadSuelo: number
  temperaturaDS: number
  temperaturaBME: number
  presion: number
  humedadAire: number
  luminosidad: number
  lluvia: number
  alerta: boolean
  fecha: string
}

type ChartConfig = {
  title: string
  description: string
  dataKey: keyof SensorData
  unit: string
  color: string
  domain: [number, number]
  chartType: 'area' | 'line' | 'bar'
  status?: (value: number | null) => { color: string; text: string }
}

export function SensorDashboard() {
  const [data, setData] = useState<SensorData[]>([])
  // Para graficar, los valores fuera del rango físico se vuelven null (hueco en vez de un pico de 700 %)
  const datosGrafica = useMemo(() => data.map((d) => {
    const limpio: Record<string, unknown> = { ...d }
    for (const campo of Object.keys(RANGOS) as CampoNumerico[]) {
      const v = limpio[campo]
      if (v !== undefined && v !== null && !enRango(campo, v)) limpio[campo] = null
    }
    return limpio as SensorData
  }), [data])
  const [currentData, setCurrentData] = useState<SensorData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [lastReadingTime, setLastReadingTime] = useState<number | null>(null)
  const [isDataStale, setIsDataStale] = useState(false)

  const chartConfigs: ChartConfig[] = [
    {
      title: "Humedad del Suelo",
      description: "Porcentaje de humedad en el suelo",
      dataKey: "humedadSuelo",
      unit: "%",
      color: "hsl(var(--chart-1))", // Azul
      domain: [0, 100],
      chartType: 'area',
      status: (value) => {
        if (value === null) return { color: "gray", text: "Sin datos" }
        if (value < 30) return { color: "hsl(var(--bad))", text: "Muy seco" }
        if (value < 50) return { color: "hsl(var(--warn))", text: "Seco" }
        if (value < 70) return { color: "hsl(var(--ok))", text: "Óptimo" }
        return { color: "hsl(var(--chart-1))", text: "Húmedo" }
      }
    },
    {
      title: "Temperatura DS",
      description: "Temperatura del sensor DS18B20",
      dataKey: "temperaturaDS",
      unit: "°C",
      color: "hsl(var(--warn))", // Naranja
      domain: [0, 50],
      chartType: 'line',
      status: (value) => {
        if (value === null) return { color: "gray", text: "Sin datos" }
        if (value < 15) return { color: "hsl(var(--chart-1))", text: "Frío" }
        if (value < 25) return { color: "hsl(var(--ok))", text: "Óptimo" }
        if (value < 35) return { color: "hsl(var(--warn))", text: "Caluroso" }
        return { color: "hsl(var(--bad))", text: "Muy caluroso" }
      }
    },
    {
      title: "Temperatura BME",
      description: "Temperatura del sensor BME280",
      dataKey: "temperaturaBME",
      unit: "°C",
      color: "hsl(var(--bad))", // Rojo
      domain: [0, 50],
      chartType: 'line',
      status: (value) => {
        if (value === null) return { color: "gray", text: "Sin datos" }
        if (value < 15) return { color: "hsl(var(--chart-1))", text: "Frío" }
        if (value < 25) return { color: "hsl(var(--ok))", text: "Óptimo" }
        if (value < 35) return { color: "hsl(var(--warn))", text: "Caluroso" }
        return { color: "hsl(var(--bad))", text: "Muy caluroso" }
      }
    },
    {
      title: "Presión Atmosférica",
      description: "Presión atmosférica en hPa",
      dataKey: "presion",
      unit: "hPa",
      color: "hsl(var(--chart-4))", // Púrpura
      domain: [980, 1040],
      chartType: 'line'
    },
    {
      title: "Humedad del Aire",
      description: "Porcentaje de humedad en el aire",
      dataKey: "humedadAire",
      unit: "%",
      color: "hsl(var(--info))", // Celeste
      domain: [0, 100],
      chartType: 'area',
      status: (value) => {
        if (value === null) return { color: "gray", text: "Sin datos" }
        if (value < 30) return { color: "hsl(var(--bad))", text: "Muy seco" }
        if (value < 40) return { color: "hsl(var(--warn))", text: "Seco" }
        if (value < 60) return { color: "hsl(var(--ok))", text: "Óptimo" }
        return { color: "hsl(var(--chart-1))", text: "Húmedo" }
      }
    },
    {
      title: "Luminosidad",
      description: "Nivel de luz ambiental",
      dataKey: "luminosidad",
      unit: "",
      color: "hsl(var(--warn))", // Amarillo
      domain: [0, 10],
      chartType: 'bar'
    },
    {
      title: "Lluvia",
      description: "Detección de lluvia",
      dataKey: "lluvia",
      unit: "",
      color: "hsl(var(--info))", // Cian
      domain: [0, 1],
      chartType: 'bar'
    }
  ]

  useEffect(() => {
    console.log("Intentando conectar al socket en:", BACKEND_URL)
    
    // Conectar al WebSocket
    const socket = io(BACKEND_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      withCredentials: true,
      timeout: 20000
    })

    // Eventos de conexión
    socket.on("connect", () => {
      console.log("Conectado al servidor WebSocket")
      setIsConnected(true)
      setConnectionError(null)
    })

    socket.on("disconnect", () => {
      console.log("Desconectado del servidor WebSocket")
      setIsConnected(false)
    })

    socket.on("connect_error", (error) => {
      console.error("Error de conexión al WebSocket:", error.message)
      setConnectionError(error.message)
      setIsConnected(false)
    })

    // Escuchar nuevas lecturas
    socket.on("nueva-lectura", (lectura: SensorData) => {
      console.log("Nueva lectura recibida:", lectura)
      setCurrentData(lectura)
      setLastReadingTime(Date.now())
      setIsDataStale(false)
      setData(prev => {
        const newData = [lectura, ...prev].slice(0, MAX_DATA_POINTS) // Mantener solo los últimos puntos
        return newData
      })
    })

    // Obtener datos históricos al cargar
    apiFetch(`${BACKEND_URL}/api/datos-sensores`)
      .then(res => res.json())
      .then(historicalData => {
        console.log("Datos históricos recibidos:", historicalData.length)
        if (Array.isArray(historicalData) && historicalData.length > 0) {
          setData(historicalData.slice(0, MAX_DATA_POINTS))
          setCurrentData(historicalData[0] || null)
          setLastReadingTime(Date.now())
        }
      })
      .catch(err => {
        console.error("Error al cargar datos históricos:", err)
        setConnectionError("Error al cargar datos históricos")
      })

    // Limpiar al desmontar
    return () => {
      console.log("Desconectando socket")
      socket.disconnect()
    }
  }, [])

  // Verificar si los datos están obsoletos
  useEffect(() => {
    if (!lastReadingTime || !isConnected) return;
    
    const checkDataFreshness = () => {
      const now = Date.now();
      if (now - lastReadingTime > INACTIVITY_TIMEOUT) {
        setIsDataStale(true);
      }
    };
    
    const interval = setInterval(checkDataFreshness, 5000); // Verificar cada 5 segundos
    
    return () => clearInterval(interval);
  }, [lastReadingTime, isConnected]);

  // Renderizar una gráfica individual basada en la configuración
  const renderChart = (config: ChartConfig) => {
    const crudo = currentData ? currentData[config.dataKey] : null;
    // Sin dato o fuera de rango físico (p. ej. 700 % de un ADC al aire) se muestra "—", nunca "°C · Muy caluroso"
    const valido = typeof crudo === "number" && Number.isFinite(crudo) && (!(config.dataKey in RANGOS) || enRango(config.dataKey as CampoNumerico, crudo));
    const value = valido ? (crudo as number) : null;
    const status = value !== null && config.status ? config.status(value) : { color: config.color, text: "" };

    return (
      <Card className="overflow-hidden">
        {/* Altura fija del encabezado: así todas las gráficas quedan alineadas entre tarjetas */}
        <CardHeader className="flex min-h-[124px] flex-col items-center gap-1 pb-2 text-center">
          <CardTitle>{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
          <div className="mt-1 flex items-baseline justify-center gap-2">
            <span className="font-mono text-2xl font-bold">{value === null ? "—" : `${value}${config.unit}`}</span>
            <span className="text-sm font-medium" style={{ color: status.color }}>
              {value === null ? (crudo === null || crudo === undefined ? "sin dato" : "lectura fuera de rango") : status.text}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[200px]">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {config.chartType === 'area' ? (
                  <AreaChart
                    data={datosGrafica}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id={`color${config.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={status.color || config.color} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={status.color || config.color} stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="fecha" 
                      tickFormatter={(value) => {
                        if (!value) return "";
                        return format(new Date(value), "HH:mm", { locale: es });
                      }}
                      stroke="currentColor"
                      className="text-xs"
                    />
                    <YAxis 
                      domain={config.domain} 
                      stroke="currentColor"
                      className="text-xs"
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}${config.unit}`, config.title]}
                      labelFormatter={(value) => {
                        if (!value) return "";
                        return format(new Date(value), "dd/MM/yyyy HH:mm:ss", { locale: es });
                      }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.5rem",
                        color: "hsl(var(--foreground))"
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={config.dataKey} 
                      stroke={status.color || config.color} 
                      fillOpacity={1}
                      fill={`url(#color${config.dataKey})`} 
                    />
                  </AreaChart>
                ) : config.chartType === 'line' ? (
                  <LineChart
                    data={datosGrafica}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="fecha" 
                      tickFormatter={(value) => {
                        if (!value) return "";
                        return format(new Date(value), "HH:mm", { locale: es });
                      }}
                      stroke="currentColor"
                      className="text-xs"
                    />
                    <YAxis 
                      domain={config.domain} 
                      stroke="currentColor"
                      className="text-xs"
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}${config.unit}`, config.title]}
                      labelFormatter={(value) => {
                        if (!value) return "";
                        return format(new Date(value), "dd/MM/yyyy HH:mm:ss", { locale: es });
                      }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.5rem",
                        color: "hsl(var(--foreground))"
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey={config.dataKey} 
                      stroke={status.color || config.color} 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                ) : (
                  <BarChart
                    data={datosGrafica}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="fecha" 
                      tickFormatter={(value) => {
                        if (!value) return "";
                        return format(new Date(value), "HH:mm", { locale: es });
                      }}
                      stroke="currentColor"
                      className="text-xs"
                    />
                    <YAxis 
                      domain={config.domain} 
                      stroke="currentColor"
                      className="text-xs"
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}${config.unit}`, config.title]}
                      labelFormatter={(value) => {
                        if (!value) return "";
                        return format(new Date(value), "dd/MM/yyyy HH:mm:ss", { locale: es });
                      }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.5rem",
                        color: "hsl(var(--foreground))"
                      }}
                    />
                    <Bar 
                      dataKey={config.dataKey} 
                      fill={status.color || config.color} 
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No hay datos disponibles</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full h-full space-y-4 overflow-auto p-4 px-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gráficas por variable</h2>
          <p className="text-sm text-muted-foreground">
            {data.length
              ? `${data.length} lecturas recientes de ${new Set(data.map((d) => (d as { nodo?: number }).nodo ?? 0)).size} nodo(s) · último dato ${haceCuanto(Math.round((Date.now() - Math.max(...data.map((d) => Date.parse(d.fecha) || 0))) / 60000))}`
              : "Sin lecturas todavía"}
            {" · "}valores imposibles (fuera de rango) se ocultan
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <span className="inline-flex items-center rounded-full bg-ok/10 px-2.5 py-0.5 text-sm font-medium text-ok">
              <span className="mr-1 h-1.5 w-1.5 rounded-full bg-ok"></span>
              Conectado
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-bad/10 px-2.5 py-0.5 text-sm font-medium text-bad">
              <span className="mr-1 h-1.5 w-1.5 rounded-full bg-bad"></span>
              <span title={connectionError ?? undefined}>Sin conexión en vivo</span>
            </span>
          )}
          {isDataStale && isConnected && (
            <span className="inline-flex items-center rounded-full bg-warn/10 px-2.5 py-0.5 text-sm font-medium text-warn">
              <span className="mr-1 h-1.5 w-1.5 rounded-full bg-warn"></span>
              Sin lecturas nuevas
            </span>
          )}
        </div>
      </div>

      {currentData?.alerta && (
        <Alert variant="destructive" className="mb-4">
          <Bell className="h-4 w-4" />
          <AlertTitle>¡Alerta del sistema!</AlertTitle>
          <AlertDescription>
            Se ha detectado una condición de alerta en el sistema. Verifique los valores de los sensores.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="temperatura">Temperatura</TabsTrigger>
          <TabsTrigger value="humedad">Humedad</TabsTrigger>
          <TabsTrigger value="ambiente">Ambiente</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {chartConfigs.slice(0, 6).map((config, index) => (
              <div key={index} className="col-span-1">
                {renderChart(config)}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="temperatura" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {chartConfigs.filter(c => c.dataKey.includes('temperatura')).map((config, index) => (
              <div key={index} className="col-span-1">
                {renderChart(config)}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="humedad" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {chartConfigs.filter(c => c.dataKey.includes('humedad')).map((config, index) => (
              <div key={index} className="col-span-1">
                {renderChart(config)}
              </div>
            ))}
            {renderChart(chartConfigs.find(c => c.dataKey === 'lluvia')!)}
          </div>
        </TabsContent>

        <TabsContent value="ambiente" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {chartConfigs.filter(c => ['presion', 'luminosidad'].includes(c.dataKey)).map((config, index) => (
              <div key={index} className="col-span-1">
                {renderChart(config)}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 