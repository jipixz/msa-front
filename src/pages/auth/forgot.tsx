import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await api.post('/auth/forgot', { email })
      setSent(true)
    } catch (e: any) {
      setSent(true)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Recuperar contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-sm">Si el correo existe, te enviamos instrucciones.</div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Correo</Label>
                <Input id="email" value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required pattern="[^\s@]+@[^\s@]+\.[^\s@]+" />
                {!emailValid && email.length>0 && <div className="text-xs text-red-500">Correo inválido</div>}
              </div>
              {error && <div className="text-sm text-red-500">{error}</div>}
              <Button type="submit" disabled={!emailValid}>Enviar</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}




