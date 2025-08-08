import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

type AdminUser = { email: string; name?: string; role: string; isActive: boolean; provider: string }

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [form, setForm] = useState({ email: "", name: "", password: "", role: "user" })
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const { data } = await api.get("/admin/users")
    setUsers(data.users)
  }

  useEffect(() => { load() }, [])

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/admin/users', { email: form.email, name: form.name, password: form.password, role: form.role, provider: 'local', isActive: true })
      setForm({ email: "", name: "", password: "", role: "user" })
      await load()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.email} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="font-medium">{u.email}</div>
                  <div className="text-xs text-muted-foreground">{u.role} · {u.provider} · {u.isActive ? 'activo' : 'inactivo'}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Crear usuario local</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createUser} className="space-y-3">
            <div className="grid gap-2">
              <Label>Correo</Label>
              <Input value={form.email} onChange={(e)=>setForm(v=>({...v,email:e.target.value}))} required type="email" pattern="[^\s@]+@[^\s@]+\.[^\s@]+" />
            </div>
            <div className="grid gap-2">
              <Label>Nombre</Label>
              <Input value={form.name} onChange={(e)=>setForm(v=>({...v,name:e.target.value}))} />
            </div>
            <div className="grid gap-2">
              <Label>Contraseña</Label>
              <Input value={form.password} onChange={(e)=>setForm(v=>({...v,password:e.target.value}))} type="password" required />
            </div>
            <div className="grid gap-2">
              <Label>Rol</Label>
              <Select value={form.role} onValueChange={(value)=>setForm(v=>({...v,role:value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuario</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={loading}>{loading ? 'Creando...' : 'Crear'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


