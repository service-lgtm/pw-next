'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { User, authAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const checkAuth = async () => {
    try {
      const status = await authAPI.checkStatus()
      if (status.authenticated && status.user) {
        setUser(status.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password })
    setUser(response.user)
    router.push('/dashboard')
  }

  const logout = async () => {
    await authAPI.logout()
    setUser(null)
    router.push('/login')
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
