import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { io } from "socket.io-client"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// URL del servidor backend (cambia esto para que coincida con la dirección de tu servidor)
const BACKEND_URL = "http://localhost:5000" // O usa "http://192.168.0.64:5000" si es tu servidor

type HumidityData = {
  valor: number
  fecha: string
}

export function HumidityChart() {
  const [data, setData] = useState<HumidityData[]>([])
  const [currentValue, setCurrentValue] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

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
    socket.on("nueva-lectura", (lectura: HumidityData) => {
      console.log("Nueva lectura recibida:", lectura)
      setCurrentValue(lectura.valor)
      setData(prev => {
        const newData = [lectura, ...prev].slice(0, 20) // Mantener solo los últimos 20 registros
        return newData
      })
    })

    // Obtener datos históricos al cargar
    fetch(`${BACKEND_URL}/api/humedad`)
      .then(res => res.json())
      .then(historicalData => {
        console.log("Datos históricos recibidos:", historicalData.length)
        if (Array.isArray(historicalData) && historicalData.length > 0) {
          setData(historicalData.slice(0, 20))
          setCurrentValue(historicalData[0]?.valor || null)
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

  // Determinar el color y mensaje basado en el nivel de humedad
  const getHumidityStatus = () => {
    if (currentValue === null) return { color: "gray", text: "Sin datos" }
    if (currentValue < 30) return { color: "#ef4444", text: "Muy seco" }
    if (currentValue < 50) return { color: "#f97316", text: "Seco" }
    if (currentValue < 70) return { color: "#22c55e", text: "Óptimo" }
    return { color: "#3b82f6", text: "Húmedo" }
  }

  const status = getHumidityStatus()

  return (
    <Card className="col-span-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Monitoreo de Humedad</CardTitle>
          <CardDescription>
            Lecturas de humedad en tiempo real
            {isConnected ? (
              <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                Conectado
              </span>
            ) : (
              <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-100">
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-red-500"></span>
                Desconectado {connectionError ? `(${connectionError})` : ''}
              </span>
            )}
          </CardDescription>
        </div>
        {currentValue !== null && (
          <div className="flex flex-col items-end">
            <div className="text-3xl font-bold">{currentValue}%</div>
            <div 
              className="text-sm font-medium"
              style={{ color: status.color }}
            >
              {status.text}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={status.color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={status.color} stopOpacity={0.1} />
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
                  domain={[0, 100]} 
                  stroke="currentColor"
                  className="text-xs"
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Humedad']}
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
                  dataKey="valor" 
                  stroke={status.color} 
                  fillOpacity={1}
                  fill="url(#colorHumidity)" 
                />
              </AreaChart>
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