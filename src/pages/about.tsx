import { Layout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Coffee, Leaf, LineChart, Sprout, Users } from "lucide-react"

export default function AboutPage() {
  const features = [
    {
      icon: <LineChart className="h-8 w-8 text-primary" />,
      title: "Monitoreo en tiempo real",
      description: "Visualiza datos de sensores IoT para controlar temperatura, humedad y otras variables críticas en el cultivo de cacao."
    },
    {
      icon: <Coffee className="h-8 w-8 text-primary" />,
      title: "Trazabilidad completa",
      description: "Sigue el recorrido del cacao desde la plantación hasta el producto final, garantizando calidad y transparencia."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Gestión de productores",
      description: "Administra perfiles de productores, parcelas y certificaciones para mejorar la coordinación."
    },
    {
      icon: <Sprout className="h-8 w-8 text-primary" />,
      title: "Prácticas sostenibles",
      description: "Promueve y registra prácticas agrícolas sostenibles que benefician al medio ambiente y mejoran la calidad del cacao."
    }
  ]

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Sección de encabezado */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Acerca del Proyecto</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transformando la producción de cacao en Tacotalpa, Tabasco, a través de tecnología 
            innovadora y prácticas sostenibles.
          </p>
        </section>

        {/* Sección de características */}
        <section className="grid gap-6 md:grid-cols-2">
          {features.map((feature, index) => (
            <Card key={index} className="overflow-hidden border-none shadow-md">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                {feature.icon}
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Sección de pestañas */}
        <section>
          <Tabs defaultValue="mission" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mission">Misión</TabsTrigger>
              <TabsTrigger value="vision">Visión</TabsTrigger>
              <TabsTrigger value="impact">Impacto</TabsTrigger>
            </TabsList>
            <TabsContent value="mission" className="mt-6 space-y-4">
              <h3 className="text-2xl font-semibold">Nuestra Misión</h3>
              <p className="text-muted-foreground">
                Proporcionar a los productores de cacao herramientas tecnológicas accesibles 
                que mejoren la eficiencia, calidad y sostenibilidad de sus cultivos, 
                fortaleciendo la economía local y preservando las tradiciones agrícolas.
              </p>
            </TabsContent>
            <TabsContent value="vision" className="mt-6 space-y-4">
              <h3 className="text-2xl font-semibold">Nuestra Visión</h3>
              <p className="text-muted-foreground">
                Ser el referente en sistemas de trazabilidad para cacao en México, 
                impulsando la transformación digital del sector agrícola y posicionando 
                el cacao de Tabasco como producto premium en mercados nacionales e internacionales.
              </p>
            </TabsContent>
            <TabsContent value="impact" className="mt-6 space-y-4">
              <h3 className="text-2xl font-semibold">Nuestro Impacto</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Económico</h4>
                    <p className="text-sm text-muted-foreground">
                      Incremento del 35% en ingresos para productores que implementan el sistema.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Ambiental</h4>
                    <p className="text-sm text-muted-foreground">
                      Reducción del 40% en uso de agua y 25% en uso de agroquímicos.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Social</h4>
                    <p className="text-sm text-muted-foreground">
                      Creación de 120 empleos directos y fortalecimiento de 15 comunidades rurales.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Sección de tecnologías */}
        <section className="rounded-lg bg-muted/50 p-6">
          <h2 className="text-2xl font-bold mb-6">Tecnologías Utilizadas</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-background p-4">
              <Leaf className="h-10 w-10 text-primary" />
              <h3 className="text-lg font-medium">IoT Sostenible</h3>
              <p className="text-center text-sm text-muted-foreground">
                Sensores de bajo consumo energético alimentados por energía solar.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-background p-4">
              <svg className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.93 19.07L9.17 14.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14.83 14.83L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14.83 9.17L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14.83 9.17L18.36 5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.93 4.93L9.17 9.17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3 className="text-lg font-medium">Blockchain</h3>
              <p className="text-center text-sm text-muted-foreground">
                Registro inmutable de cada etapa del proceso productivo.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg bg-background p-4">
              <svg className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 16V8.00002C20.9996 7.6493 20.9071 7.30483 20.7315 7.00119C20.556 6.69754 20.3037 6.44539 20 6.27002L13 2.27002C12.696 2.09449 12.3511 2.00208 12 2.00208C11.6489 2.00208 11.304 2.09449 11 2.27002L4 6.27002C3.69626 6.44539 3.44398 6.69754 3.26846 7.00119C3.09294 7.30483 3.00036 7.6493 3 8.00002V16C3.00036 16.3508 3.09294 16.6952 3.26846 16.9989C3.44398 17.3025 3.69626 17.5547 4 17.73L11 21.73C11.304 21.9056 11.6489 21.998 12 21.998C12.3511 21.998 12.696 21.9056 13 21.73L20 17.73C20.3037 17.5547 20.556 17.3025 20.7315 16.9989C20.9071 16.6952 20.9996 16.3508 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.27002 6.96002L12 12L20.73 6.96002" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3 className="text-lg font-medium">Análisis de Datos</h3>
              <p className="text-center text-sm text-muted-foreground">
                Algoritmos predictivos para optimizar cultivos y prevenir enfermedades.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
} 