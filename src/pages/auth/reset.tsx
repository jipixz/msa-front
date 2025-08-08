import { useSearchParams, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string|null>(null)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres')
    if (password !== confirm) return setError('Las contraseñas no coinciden')
    setError(null)
    try {
      await api.post('/auth/reset', { token, password })
      setDone(true)
      setTimeout(() => navigate('/', { replace: true }), 1200)
    } catch (e: any) {
      setError(e?.response?.data?.message || 'No se pudo restablecer la contraseña')
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Restablecer contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="text-sm">Contraseña actualizada. Redirigiendo...</div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-2">
                <Label>Nueva contraseña</Label>
                <Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label>Confirmar contraseña</Label>
                <Input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} required />
              </div>
              {error && <div className="text-sm text-red-500">{error}</div>}
              <Button type="submit">Actualizar</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}




