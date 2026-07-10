import { createContext, useContext, useState, ReactNode } from 'react'
import { api } from '../api/client'

interface User {
  userId: number
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage so a page refresh doesn't log you out
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const saveSession = (data: { token: string; userId: number; name: string; email: string }) => {
    localStorage.setItem('token', data.token)
    const userData = { userId: data.userId, name: data.name, email: data.email }
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    saveSession(res.data)
  }

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { name, email, password })
    saveSession(res.data)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
