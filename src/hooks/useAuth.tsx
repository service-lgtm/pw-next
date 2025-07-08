'use client'

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react'
import { User, authAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'

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

  // 清除错误
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // 检查认证状态
  const checkAuth = useCallback(async () => {
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
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 登录方法 - 添加完整的错误处理
  const login = useCallback(async (email: string, password: string) => {
    console.log('[Auth] 开始登录:', email)
    setError(null)
    setIsLoading(true)
    
    try {
      // 参数验证
      if (!email || !password) {
        throw new Error('请输入邮箱和密码')
      }
      
      // 调用 API
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
      console.log('[Auth] 登录成功，准备跳转...')
      
      // 延迟跳转，确保状态更新
      setTimeout(() => {
        router.push('/dashboard')
      }, 100)
      
    } catch (error) {
      console.error('[Auth] 登录失败:', error)
      
      // 处理不同类型的错误
      let errorMessage = '登录失败，请重试'
      
      if (error instanceof TypeError) {
        // 网络错误
        if (error.message === 'Failed to fetch') {
          errorMessage = '网络连接失败，请检查网络后重试'
        } else {
          errorMessage = '网络请求失败：' + error.message
        }
      } else if (error instanceof Error) {
        // 其他错误
        errorMessage = error.message
        
        // 特殊处理一些常见错误
        if (error.message.includes('401')) {
          errorMessage = '邮箱或密码错误'
        } else if (error.message.includes('429')) {
          errorMessage = '登录尝试次数过多，请稍后再试'
        } else if (error.message.includes('500')) {
          errorMessage = '服务器错误，请稍后重试'
        }
      }
      
      setError(errorMessage)
      // 重新抛出错误，让组件也能处理
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // 退出登录
  const logout = useCallback(async () => {
    console.log('[Auth] 开始退出登录...')
    setError(null)
    setIsLoading(true)
    
    try {
      await authAPI.logout()
      console.log('[Auth] 退出登录成功')
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('[Auth] 退出登录失败:', error)
      // 即使退出失败，也清除本地状态
      setUser(null)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // 初始化时检查认证状态
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // 监听路由变化，清除错误
  useEffect(() => {
    const handleRouteChange = () => {
      clearError()
    }
    
    // 清除错误信息当路由改变时
    window.addEventListener('popstate', handleRouteChange)
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [clearError])

  const contextValue: AuthContextType = {
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
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
