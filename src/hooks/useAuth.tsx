// hooks/useAuth.tsx
'use client'

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { api, getErrorMessage, isApiError, type User } from '@/lib/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const checkAuth = useCallback(async () => {
    // 公开页面不需要检查认证
    const publicPaths = ['/login', '/register', '/reset-password']
    if (publicPaths.includes(pathname)) {
      setIsLoading(false)
      return
    }

    try {
      const status = await api.auth.checkStatus()
      
      if (status.authenticated && status.user) {
        setUser(status.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('[Auth] 检查认证状态失败:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [pathname])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    
    try {
      const response = await api.auth.login({ email, password })
      
      if (response.user) {
        setUser(response.user)
        
        // 获取重定向 URL
        const params = new URLSearchParams(window.location.search)
        const redirect = params.get('redirect') || '/dashboard'
        
        router.push(redirect)
      }
    } catch (error) {
      let errorMessage = getErrorMessage(error)
      
      if (isApiError(error, 401)) {
        errorMessage = '邮箱或密码错误'
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [router])

  const logout = useCallback(async () => {
    try {
      await api.auth.logout()
    } catch (error) {
      console.error('[Auth] 退出登录失败:', error)
    } finally {
      setUser(null)
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    clearError()
  }, [pathname, clearError])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    logout,
    checkAuth,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
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

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    if (!isLoading && !user) {
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
      router.push(loginUrl)
    }
  }, [user, isLoading, router, pathname])
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F1E]">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }
  
  if (!user) {
    return null
  }
  
  return <>{children}</>
}
