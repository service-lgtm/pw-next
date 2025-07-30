// src/hooks/useAuth.tsx
// AuthProvider - JWT 认证实现

'use client'

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { api, getErrorMessage, isApiError, TokenManager, type User } from '@/lib/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (account: string, password: string) => Promise<void>  // 改为 account，支持多种登录方式
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
  '/explore',
  '/explore/regions',
  '/explore/lands',
]

// 检查路径是否为公开页面
function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) {
    return true
  }
  
  return PUBLIC_PATHS.some(publicPath => 
    pathname.startsWith(publicPath + '/') || pathname === publicPath
  )
}

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
      setIsLoading(true)
      
      // 首先检查本地存储的用户信息
      const localUser = TokenManager.getUser()
      const accessToken = TokenManager.getAccessToken()
      
      if (localUser && accessToken) {
        // 如果有本地数据，先设置用户状态以提供即时反馈
        setUser(localUser)
        
        // 然后验证 token 是否有效
        try {
          const status = await api.auth.checkStatus()
          
          if (status.authenticated && status.user) {
            // Token 有效，更新用户信息（如果服务器返回了）
            setUser(status.user)
            TokenManager.setUser(status.user)
          } else if (!status.authenticated) {
            // Token 无效，清除本地数据
            setUser(null)
            TokenManager.clearTokens()
          }
        } catch (error) {
          // 如果验证失败但有本地数据，暂时保持登录状态
          // 这样可以让后续请求尝试刷新 token
          console.log('[Auth] Token 验证失败，保持本地登录状态')
        }
      } else {
        // 没有本地数据，用户未登录
        setUser(null)
      }
    } catch (error) {
      console.error('[Auth] 检查认证状态失败:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (account: string, password: string) => {
    setError(null)
    
    try {
      // 使用新的通用登录接口
      await api.auth.login(account, password)
      
      // 登录成功后，从 TokenManager 获取用户信息
      const storedUser = TokenManager.getUser()
      if (storedUser) {
        setUser(storedUser)
        
        // 获取重定向 URL
        const params = new URLSearchParams(window.location.search)
        const redirect = params.get('redirect') || '/dashboard'
        
        router.push(redirect)
      } else {
        throw new Error('登录成功但无法获取用户信息')
      }
    } catch (error) {
      let errorMessage = getErrorMessage(error)
      
      if (isApiError(error, 401)) {
        errorMessage = '账号或密码错误'
      } else if (isApiError(error, 400)) {
        // 处理具体的字段错误
        if (error.details?.non_field_errors) {
          errorMessage = '账号或密码错误'
        } else if (error.details?.account) {
          errorMessage = error.details.account[0] || '账号错误'
        } else if (error.details?.password) {
          errorMessage = error.details.password[0] || '密码错误'
        }
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

  // 初始化时检查认证状态
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // 路径变化时清除错误
  useEffect(() => {
    clearError()
  }, [pathname, clearError])

  // 监听存储变化（用于多标签页同步）
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token' || e.key === 'refresh_token' || e.key === 'user_info') {
        console.log('[Auth] 检测到存储变化，重新检查认证状态')
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [checkAuth])

  // 监听 401 错误事件（当 token 刷新失败时）
  useEffect(() => {
    const handleAuthError = () => {
      console.log('[Auth] 收到认证错误事件，清除登录状态')
      setUser(null)
      router.push('/login')
    }

    // 添加全局认证错误处理
    window.addEventListener('auth-error', handleAuthError)
    return () => window.removeEventListener('auth-error', handleAuthError)
  }, [router])

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

// 保护路由组件
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
