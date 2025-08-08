//import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/lib/auth-store"
import { API_URL } from "@/lib/api"
import { useNavigate } from "react-router-dom"

export default function LoginForm({ /*className,  ...props */ }: React.ComponentProps<"div">) {
  const { login, loading, error } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password)
    navigate('/', { replace: true })
  }
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <Card className="overflow-hidden">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form className="p-6 md:p-8" onSubmit={onSubmit}>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Bienvenido</h1>
                  <p className="text-balance text-muted-foreground">Inicia sesión para continuar</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Correo</Label>
                  <Input id="email" type="email" placeholder="m@example.com" required pattern="[^\s@]+@[^\s@]+\.[^\s@]+" value={email} onChange={(e)=>setEmail(e.target.value)} />
                  {!emailValid && email.length>0 && <div className="text-xs text-red-500">Correo inválido</div>}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Contraseña</Label>
                  </div>
                  <Input id="password" type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} />
                </div>
                {error && <div className="text-sm text-red-500">{error}</div>}
                <Button type="submit" className="w-full" disabled={loading || !emailValid}>
                  {loading ? 'Ingresando...' : 'Iniciar sesión'}
                </Button>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-background px-2 text-muted-foreground">O continúa con</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div />
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`${API_URL}/auth/google`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="sr-only">Google</span>
                    </a>
                  </Button>
                  <div />
                </div>
                <div className="text-center text-sm">¿Olvidaste tu contraseña? <a className="underline" href="/forgot">Recupérala</a></div>
              </div>
            </form>
            <div className="relative hidden bg-muted md:block">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent dark:from-white/10 dark:to-transparent z-10"></div>
              <img
                src="/login.png"
                alt="Image"
                className="absolute inset-0 h-full w-full object-cover filter blur-[.7px] contrast-[0.95] saturate-[0.9] dark:brightness-[0.2] dark:grayscale"
              />
            </div>
          </CardContent>
        </Card>
        <div className="text-balance text-center text-xs text-muted-foreground">Uso interno</div>
      </div>
    </div>

  )
}

