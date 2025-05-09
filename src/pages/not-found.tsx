import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Página no encontrada
        </p>
        <Button onClick={() => navigate('/')}>
          Volver al inicio
        </Button>
      </div>
    </Layout>
  )
} 