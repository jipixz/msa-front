import { createAuthClient } from "better-auth/react"

// URL del servidor de auth. En producción usar VITE_BETTER_AUTH_URL o el mismo origen que el front.
const authBaseUrl = (import.meta as any).env?.VITE_BETTER_AUTH_URL
  || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")

export const { signIn, signUp, useSession } = createAuthClient({
    baseURL: authBaseUrl,
})