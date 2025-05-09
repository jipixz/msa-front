import { Layout } from "@/components/layout"

export default function HomePage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">
          Sistema de Trazabilidad de Cacao
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Gestiona y monitorea la producción de cacao en tiempo real
        </p>
        <img 
          src="/cacao.jpg" 
          alt="Cacao" 
          className="rounded-lg shadow-lg"
        />
      </div>
    </Layout>
  )
} 