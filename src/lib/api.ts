import axios from "axios"

// Sin "/" final: las rutas se concatenan como `${API_URL}/api/...` y una doble barra da 404.
export const API_URL = ((import.meta as any).env?.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "")

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})




