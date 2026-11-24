import axios from "axios"

// Sin "/" final: las rutas se concatenan como `${API_URL}/api/...` y una doble barra da 404.
export const API_URL = ((import.meta as any).env?.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "")

// fetch hacia nuestras APIs, siempre con cookies: si msabackend/fastapimsa están detrás
// de Cloudflare Access, el navegador debe mandar la cookie CF_Authorization.
export const apiFetch = (url: string, init: RequestInit = {}) =>
  fetch(url, { credentials: "include", ...init })

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})




