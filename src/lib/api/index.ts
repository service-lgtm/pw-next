// lib/api/index.ts
// 统一的 API 层

// ========== 重要说明 ==========
// 注意：由于某些第三方库或框架可能会修改全局 fetch 函数，
// 并且在处理 credentials: 'include' 选项时存在 bug，
// 导致请求失败（错误信息：网络连接失败）。
// 
// 问题表现：
// - 使用 credentials: 'include' 的请求会失败
// - 错误信息为 "Failed to fetch" 或 "网络连接失败"
// - 移除 credentials: 'include' 后请求正常
// 
// 解决方案：
// 已从所有 API 请求中移除 credentials: 'include' 选项。
// 如果未来需要使用 cookie 认证，请先测试确认 fetch 未被篡改。
// ========== 重要说明结束 ==========


// ========== 配置 ==========
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mg.pxsj.net.cn/api/v1'

// ========== JWT Token 管理 ==========
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_INFO_KEY = 'user_info'

export class TokenManager {
  // 保存 Tokens
  static setTokens(access: string, refresh: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, access)
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
    }
  }
  
  // 获取 Access Token
  static getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ACCESS_TOKEN_KEY)
    }
    return null
  }
  
  // 获取 Refresh Token
  static getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REFRESH_TOKEN_KEY)
    }
    return null
  }
  
  // 清除 Tokens
  static clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(USER_INFO_KEY)
    }
  }
  
  // 保存用户信息
  static setUser(user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(user))
    }
  }
  
  // 获取用户信息
  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(USER_INFO_KEY)
      if (userStr) {
        try {
          return JSON.parse(userStr)
        } catch {
          return null
        }
      }
    }
    return null
  }
  
  // 检查是否已认证
  static isAuthenticated(): boolean {
    return !!TokenManager.getAccessToken()
  }
}

// ========== 类型定义 ==========
export interface User {
  id: number
  username: string
  email: string
  nickname: string
  phone?: string
  level?: number
  is_verified?: boolean
  energy?: number
  referral_code?: string
  tdbBalance?: number  // TDB积分余额
  yldBalance?: number  // YLD积分余额
}

export interface TokenLoginRequest {
  username: string  // 邮箱或用户名
  password: string
}

export interface TokenLoginResponse {
  success: boolean
  message: string
  data: {
    access: string
    refresh: string
    user: User
    permissions: {
      is_staff: boolean
      is_superuser: boolean
      permission_level: number
    }
  }
}

export interface TokenRefreshResponse {
  success: boolean
  message: string
  data: {
    access: string
  }
}

export interface TokenVerifyResponse {
  success: boolean
  message: string
  data: {
    valid: boolean
    user_id: number
    username: string
    exp: number
  }
}

export interface EmailCodeRequest {
  email: string
  type: 'register' | 'reset'
}

export interface RegisterRequest {
  email: string
  password: string
  password_confirm: string
  verification_code: string
  referral_code?: string
}

export interface PasswordResetRequest {
  email: string
  verification_code: string
}

export interface PasswordResetConfirmRequest {
  email: string
  token: string
  new_password: string
  new_password_confirm: string
}

export interface AuthStatus {
  authenticated: boolean
  user?: User
}

// ========== 错误处理 ==========
export class ApiError extends Error {
  constructor(
    public status: number,
    public code?: string,
    message?: string,
    public details?: any
  ) {
    super(message || '请求失败')
    this.name = 'ApiError'
  }
}

// ========== 基础请求函数 ==========
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token))
  refreshSubscribers = []
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit & { params?: Record<string, any>; skipAuth?: boolean } = {}
): Promise<T> {
  const { params, skipAuth = false, ...init } = options
  
  let url = `${API_BASE_URL}${endpoint}`
  
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }
  
  const config: RequestInit = {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...init.headers,
    },
  }
  
  // 添加认证头（除非明确跳过）
  if (!skipAuth) {
    const accessToken = TokenManager.getAccessToken()
    if (accessToken) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${accessToken}`
      }
    }
  }
  
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }
  
  try {
    console.log(`[API] ${config.method || 'GET'} ${endpoint}`)
    
    const response = await fetch(url, config)
    
    const contentType = response.headers.get('content-type')
    let data: any
    
    if (contentType?.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }
    
    // 处理 401 错误 - Token 过期
    if (response.status === 401 && !skipAuth && !endpoint.includes('/token/')) {
      // 如果已经在刷新，等待刷新完成
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken: string) => {
            // 使用新 token 重试请求
            config.headers = {
              ...config.headers,
              'Authorization': `Bearer ${newToken}`
            }
            fetch(url, config)
              .then(res => res.json())
              .then(resolve)
              .catch(reject)
          })
        })
      }
      
      // 尝试刷新 token
      isRefreshing = true
      
      try {
        const refreshToken = TokenManager.getRefreshToken()
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken })
          })
          
          const refreshData = await refreshResponse.json()
          
          if (refreshResponse.ok && refreshData.success) {
            // 保存新的 access token
            const newAccessToken = refreshData.data.access
            const currentRefreshToken = TokenManager.getRefreshToken()
            if (currentRefreshToken) {
              TokenManager.setTokens(newAccessToken, currentRefreshToken)
            }
            
            // 通知所有等待的请求
            onTokenRefreshed(newAccessToken)
            
            // 使用新 token 重试原请求
            config.headers = {
              ...config.headers,
              'Authorization': `Bearer ${newAccessToken}`
            }
            
            const retryResponse = await fetch(url, config)
            const retryData = await retryResponse.json()
            
            if (!retryResponse.ok) {
              throw new ApiError(retryResponse.status, 'API_ERROR', retryData.message || '请求失败', retryData)
            }
            
            return retryData
          }
        }
        
        // 刷新失败，清除认证信息
        TokenManager.clearTokens()
        throw new ApiError(401, 'TOKEN_EXPIRED', '登录已过期，请重新登录')
      } finally {
        isRefreshing = false
      }
    }
    
    if (!response.ok) {
      console.error(`[API] Error ${response.status}:`, data)
      
      let errorMessage = '请求失败'
      
      if (data) {
        if (typeof data === 'string') {
          errorMessage = data
        } else if (data.message) {
          errorMessage = data.message
        } else if (data.detail) {
          errorMessage = data.detail
        } else if (data.non_field_errors) {
          errorMessage = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors
        } else {
          const fieldErrors = []
          for (const field of ['email', 'password', 'verification_code', 'username']) {
            if (data[field]) {
              const error = Array.isArray(data[field]) ? data[field][0] : data[field]
              fieldErrors.push(error)
            }
          }
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors[0]
          }
        }
      }
      
      throw new ApiError(response.status, 'API_ERROR', errorMessage, data)
    }
    
    console.log(`[API] Success:`, data)
    return data
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new ApiError(0, 'NETWORK_ERROR', '网络连接失败，请检查网络后重试')
    }
    
    if (error instanceof ApiError) {
      throw error
    }
    
    console.error('[API] Unexpected error:', error)
    throw new ApiError(0, 'UNKNOWN_ERROR', '请求失败，请稍后重试')
  }
}

// ========== API 对象 ==========
const api = {
  auth: {
    // JWT 登录
    login: async (data: TokenLoginRequest): Promise<TokenLoginResponse> => {
      const response = await request<TokenLoginResponse>('/auth/token/', {
        method: 'POST',
        body: data as any,
        skipAuth: true,
      })
      
      if (response.success && response.data) {
        // 保存 tokens 和用户信息
        TokenManager.setTokens(response.data.access, response.data.refresh)
        TokenManager.setUser(response.data.user)
      }
      
      return response
    },
    
    // 刷新 Token
    refreshToken: async (): Promise<boolean> => {
      const refreshToken = TokenManager.getRefreshToken()
      if (!refreshToken) return false
      
      try {
        const response = await request<TokenRefreshResponse>('/auth/token/refresh/', {
          method: 'POST',
          body: { refresh: refreshToken } as any,
          skipAuth: true,
        })
        
        if (response.success && response.data) {
          const currentRefreshToken = TokenManager.getRefreshToken()
          if (currentRefreshToken) {
            TokenManager.setTokens(response.data.access, currentRefreshToken)
          }
          return true
        }
      } catch (error) {
        console.error('[API] Token refresh failed:', error)
      }
      
      return false
    },
    
    // 验证 Token
    verifyToken: async (token?: string): Promise<TokenVerifyResponse | null> => {
      const tokenToVerify = token || TokenManager.getAccessToken()
      if (!tokenToVerify) return null
      
      try {
        const response = await request<TokenVerifyResponse>('/auth/token/verify/', {
          method: 'POST',
          body: { token: tokenToVerify } as any,
          skipAuth: true,
        })
        
        return response
      } catch (error) {
        console.error('[API] Token verify failed:', error)
        return null
      }
    },
    
    // 登出
    logout: async () => {
      try {
        // 尝试调用服务器登出接口
        await request('/auth/token/logout/', {
          method: 'POST',
        })
      } catch (error) {
        console.error('[API] Logout request failed:', error)
      } finally {
        // 无论是否成功，都清除本地认证信息
        TokenManager.clearTokens()
      }
    },
    
    // 检查认证状态
    checkStatus: async (): Promise<AuthStatus> => {
      const token = TokenManager.getAccessToken()
      const user = TokenManager.getUser()
      
      if (!token) {
        return { authenticated: false }
      }
      
      // 验证 token
      const verifyResult = await api.auth.verifyToken()
      
      if (verifyResult && verifyResult.success && verifyResult.data.valid) {
        return {
          authenticated: true,
          user: user || undefined
        }
      }
      
      // Token 无效，清除本地数据
      TokenManager.clearTokens()
      return { authenticated: false }
    },
    
    // 注册相关
    sendEmailCode: (data: EmailCodeRequest) => 
      request('/auth/email-code/', {
        method: 'POST',
        body: data as any,
        skipAuth: true,
      }),
    
    register: (data: RegisterRequest) =>
      request('/auth/register/', {
        method: 'POST',
        body: data as any,
        skipAuth: true,
      }),
    
    passwordReset: (data: PasswordResetRequest) =>
      request('/auth/password-reset/', {
        method: 'POST',
        body: data as any,
        skipAuth: true,
      }),
    
    passwordResetConfirm: (data: PasswordResetConfirmRequest) =>
      request('/auth/password-reset-confirm/', {
        method: 'POST',
        body: data as any,
        skipAuth: true,
      }),
  },
  
  // 用户相关
  accounts: {
    profile: () => request('/auth/profile/'),
    updateProfile: (data: Partial<User>) => 
      request('/auth/profile/', {
        method: 'PATCH',
        body: data as any,
      }),
  }
}

// ========== 工具函数 ==========
const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return '未知错误'
}

const isApiError = (error: unknown, status?: number): error is ApiError => {
  if (!(error instanceof ApiError)) {
    return false
  }
  
  if (status !== undefined) {
    return error.status === status
  }
  
  return true
}

// ========== 导出 ==========
export { api, getErrorMessage, isApiError, request, API_BASE_URL }
export default api
