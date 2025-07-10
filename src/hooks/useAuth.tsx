// src/hooks/useAuth.tsx
// 修改 AuthProvider 以更好地处理公开页面和认证

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

// 定义公开页面列表
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/reset-password',
  '/explore',           // 添加explore为公开页面
  '/explore/regions',   // 允许浏览区域
  '/explore/lands',     // 允许浏览土地
]

// 检查路径是否为公开页面
function isPublicPath(pathname: string): boolean {
  // 完全匹配
  if (PUBLIC_PATHS.includes(pathname)) {
    return true
  }
  
  // 前缀匹配（如 /explore/regions/123）
  return PUBLIC_PATHS.some(publicPath => 
    pathname.startsWith(publicPath + '/') || pathname === publicPath
  )
}

// 需要认证的操作
const AUTH_REQUIRED_ACTIONS = [
  'buy',
  'transfer',
  'build',
  'rent',
]

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
    try {
      const status = await api.auth.checkStatus()
      
      if (status.authenticated && status.user) {
        setUser(status.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      // 如果是403错误，说明未登录，这在公开页面是正常的
      if (isApiError(error, 403)) {
        console.log('[Auth] 用户未登录')
        setUser(null)
      } else {
        console.error('[Auth] 检查认证状态失败:', error)
        setUser(null)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

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

// 修改 ProtectedRoute 组件
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    // 如果是公开页面，直接渲染
    if (isPublicPath(pathname)) {
      return
    }
    
    // 非公开页面需要登录
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
  
  // 公开页面不需要登录即可访问
  if (isPublicPath(pathname)) {
    return <>{children}</>
  }
  
  // 需要登录的页面
  if (!user) {
    return null
  }
  
  return <>{children}</>
}

// 导出工具函数
export function useRequireAuth(action?: string) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  const requireAuth = useCallback(() => {
    if (!isAuthenticated) {
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
      router.push(loginUrl)
      return false
    }
    return true
  }, [isAuthenticated, router, pathname])
  
  return { requireAuth, isAuthenticated, user }
}
