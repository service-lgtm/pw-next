'use client'

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react'
import { User, authAPI } from '@/lib/api'
import { useRouter, usePathname } from 'next/navigation'

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
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // 清除错误
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // 检查认证状态 - 不再自动设置 loading
  const checkAuth = useCallback(async () => {
    // 如果是登录或注册页面，不需要检查认证状态
    if (pathname === '/login' || pathname === '/register' || pathname === '/reset-password') {
      setIsLoading(false)
      setInitialized(true)
      return
    }

    try {
      console.log('[Auth] 检查认证状态...')
      const status = await authAPI.checkStatus()
      
      if (status.authenticated && status.user) {
        console.log('[Auth] 用户已登录:', status.user.email)
        setUser(status.user)
      } else {
        console.log('[Auth] 用户未登录')
        setUser(null)
      }
    } catch (error) {
      console.error('[Auth] 检查认证状态失败:', error)
      // 初始化检查失败不应该阻止应用运行
      setUser(null)
    } finally {
      setIsLoading(false)
      setInitialized(true)
    }
  }, [pathname])

  // 登录方法
  const login = useCallback(async (email: string, password: string) => {
    console.log('[Auth] 开始登录:', email)
    setError(null)
    
    // 登录时不改变全局 loading 状态
    try {
      // 参数验证
      if (!email || !password) {
        throw new Error('请输入邮箱和密码')
      }
      
      // 直接调用 API，不依赖其他状态
      const response = await authAPI.login({ 
        email: email.trim(), 
        password 
      })
      
      console.log('[Auth] 登录响应:', response)
      
      // 验证响应
      if (!response || !response.user) {
        throw new Error('登录响应无效')
      }
      
      // 设置用户信息
      setUser(response.user)
      setIsAuthenticated(true)
      console.log('[Auth] 登录成功，准备跳转...')
      
      // 跳转到目标页面
      setTimeout(() => {
        router.push('/dashboard')
      }, 100)
      
    } catch (error) {
      console.error('[Auth] 登录失败:', error)
      
      let errorMessage = '登录失败，请重试'
      
      if (error instanceof Error) {
        errorMessage = error.message
        
        // 特殊处理网络错误
        if (error.message === 'Failed to fetch' || error.message.includes('Failed to fetch')) {
          errorMessage = '网络连接失败，请检查网络后重试'
        }
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [router])

  // 退出登录
  const logout = useCallback(async () => {
    console.log('[Auth] 开始退出登录...')
    setError(null)
    
    try {
      await authAPI.logout()
      console.log('[Auth] 退出登录成功')
    } catch (error) {
      console.error('[Auth] 退出登录失败:', error)
      // 即使退出失败，也要清除本地状态
    }
    
    // 清除用户状态
    setUser(null)
    router.push('/login')
  }, [router])

  // 延迟初始化，避免影响页面加载
  useEffect(() => {
    if (!initialized) {
      // 给页面一些时间完成渲染
      const timer = setTimeout(() => {
        checkAuth()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [initialized, checkAuth])

  // 监听路由变化
  useEffect(() => {
    clearError()
  }, [pathname, clearError])

  const contextValue: AuthContextType = {
    user,
    isLoading: isLoading && !initialized, // 只有在未初始化时才显示 loading
    isAuthenticated: !!user,
    error,
    login,
    logout,
    checkAuth,
    clearError
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

// 路由保护组件
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    // 如果不在加载中且用户未登录，跳转到登录页
    if (!isLoading && !user) {
      // 保存当前路径，登录后可以跳转回来
      const returnUrl = pathname !== '/login' ? pathname : '/dashboard'
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)
    }
  }, [user, isLoading, router, pathname])
  
  // 加载中显示
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
  
  // 未登录不显示内容
  if (!user) {
    return null
  }
  
  return <>{children}</>
}
