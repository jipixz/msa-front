import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Edit, Upload, X } from "lucide-react"

type AdminUser = { _id: string; email: string; name?: string; role: string; isActive: boolean; provider: string; avatarUrl?: string; createdAt?: string }

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [form, setForm] = useState({ email: "", name: "", password: "", role: "user" })
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [editForm, setEditForm] = useState({ email: "", name: "", role: "user", isActive: true, avatarUrl: "none", password: "" })
  const [loading, setLoading] = useState(false)
  const [customAvatar, setCustomAvatar] = useState<File | null>(null)

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

  const updateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setLoading(true)
    try {
      let avatarUrl = editForm.avatarUrl === "none" ? "" : editForm.avatarUrl
      if (customAvatar) {
        const formData = new FormData()
        formData.append('avatar', customAvatar)
        const uploadRes = await api.post('/admin/upload-avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        avatarUrl = uploadRes.data.avatarUrl
      }
      
      await api.put(`/admin/users/${editingUser._id}`, { 
        ...editForm, 
        avatarUrl: avatarUrl || undefined,
        password: editForm.password || undefined 
      })
      setEditingUser(null)
      setEditForm({ email: "", name: "", role: "user", isActive: true, avatarUrl: "none", password: "" })
      setCustomAvatar(null)
      await load()
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (user: AdminUser) => {
    setEditingUser(user)
    setEditForm({
      email: user.email,
      name: user.name || "",
      role: user.role,
      isActive: user.isActive,
      avatarUrl: user.avatarUrl || "none",
      password: ""
    })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCustomAvatar(file)
      setEditForm(prev => ({ ...prev, avatarUrl: "none" }))
    }
  }

  return (
    <div className="p-4 grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {users.map(u => (
              <div key={u._id} className="flex items-center gap-3 border rounded p-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover" /> : <div className="text-xs">N/A</div>}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{u.name || 'Sin nombre'} <span className="text-xs text-muted-foreground">({u.email})</span></div>
                  <div className="text-xs text-muted-foreground">Rol: {u.role} · Proveedor: {u.provider} · Estado: {u.isActive ? 'activo' : 'inactivo'} {u.createdAt && `· Creado: ${new Date(u.createdAt).toLocaleDateString('es-ES')}`}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => startEdit(u)}>
                  <Edit className="h-4 w-4" />
                </Button>
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

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
          </DialogHeader>
          <form onSubmit={updateUser} className="space-y-3">
            <div className="grid gap-2">
              <Label>Correo</Label>
              <Input value={editForm.email} onChange={(e)=>setEditForm(v=>({...v,email:e.target.value}))} required type="email" pattern="[^\s@]+@[^\s@]+\.[^\s@]+" />
            </div>
            <div className="grid gap-2">
              <Label>Nombre</Label>
              <Input value={editForm.name} onChange={(e)=>setEditForm(v=>({...v,name:e.target.value}))} />
            </div>
            <div className="grid gap-2">
              <Label>Contraseña (dejar vacío para no cambiar)</Label>
              <Input value={editForm.password} onChange={(e)=>setEditForm(v=>({...v,password:e.target.value}))} type="password" />
            </div>
            <div className="grid gap-2">
              <Label>Rol</Label>
              <Select value={editForm.role} onValueChange={(value)=>setEditForm(v=>({...v,role:value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuario</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Estado</Label>
              <Select value={editForm.isActive ? "true" : "false"} onValueChange={(value)=>setEditForm(v=>({...v,isActive:value==="true"}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Avatar</Label>
              <div className="flex gap-2">
                <Select value={editForm.avatarUrl} onValueChange={(value)=>setEditForm(v=>({...v,avatarUrl:value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar avatar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin avatar</SelectItem>
                    <SelectItem value="/avatars/a1.svg">Avatar 1</SelectItem>
                    <SelectItem value="/avatars/a2.svg">Avatar 2</SelectItem>
                    <SelectItem value="/avatars/a3.svg">Avatar 3</SelectItem>
                    <SelectItem value="/avatars/a4.svg">Avatar 4</SelectItem>
                    <SelectItem value="/avatars/a5.svg">Avatar 5</SelectItem>
                    <SelectItem value="/avatars/a6.svg">Avatar 6</SelectItem>
                    <SelectItem value="/avatars/a7.svg">Avatar 7</SelectItem>
                    <SelectItem value="/avatars/a8.svg">Avatar 8</SelectItem>
                    <SelectItem value="/avatars/a9.svg">Avatar 9</SelectItem>
                    <SelectItem value="/avatars/a10.svg">Avatar 10</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('avatar-upload')?.click()}>
                  <Upload className="h-4 w-4" />
                </Button>
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              {customAvatar && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <span>Imagen seleccionada: {customAvatar.name}</span>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setCustomAvatar(null)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>Cancelar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}


