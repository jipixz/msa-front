import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
//import { useSession } from "@/lib/auth-client"
import { HumidityChart } from "@/components/humidity-chart"
import { Droplet, ThermometerSun, Calendar } from "lucide-react"

export default function DashboardPage() {
  //const { data: session } = useSession()

  /* if (!session) {
    return <Navigate to="/login" replace />
  } */

  return (
    <Layout>
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Producción Total</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M10 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z" />
                <path d="M2 8h3M2 12h3M2 16h3M22 8h-3M22 12h-3M22 16h-3M8 2v3M12 2v3M16 2v3M8 22v-3M12 22v-3M16 22v-3" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234 kg</div>
              <p className="text-xs text-muted-foreground">+2.1% respecto al mes anterior</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Humedad Promedio</CardTitle>
              <Droplet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">65%</div>
              <p className="text-xs text-muted-foreground">Rango óptimo: 60-70%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temperatura</CardTitle>
              <ThermometerSun className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28°C</div>
              <p className="text-xs text-muted-foreground">+1.2°C respecto a la semana pasada</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próxima Cosecha</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18 días</div>
              <p className="text-xs text-muted-foreground">Parcela Norte: 500kg estimados</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Gráfica de humedad */}
        <HumidityChart />
        
        {/* Más contenido del dashboard aquí */}
      </div>
    </Layout>
  )
} 