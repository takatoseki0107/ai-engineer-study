import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import api from '../api/client'

interface AuthState {
  token: string | null
  username: string | null
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'auth_token'
const USERNAME_KEY = 'auth_username'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => ({
    token: localStorage.getItem(TOKEN_KEY),
    username: localStorage.getItem(USERNAME_KEY),
  }))

  useEffect(() => {
    if (auth.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [auth.token])

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.post<{ token: string; username: string }>('/auth/login', {
      username,
      password,
    })
    const { token, username: name } = res.data
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USERNAME_KEY, name)
    setAuth({ token, username: name })
  }, [])

  const register = useCallback(async (username: string, password: string) => {
    const res = await api.post<{ token: string; username: string }>('/auth/register', {
      username,
      password,
    })
    const { token, username: name } = res.data
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USERNAME_KEY, name)
    setAuth({ token, username: name })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USERNAME_KEY)
    setAuth({ token: null, username: null })
  }, [])

  return (
    <AuthContext.Provider value={{ ...auth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
