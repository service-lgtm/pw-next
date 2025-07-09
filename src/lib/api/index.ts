// lib/api/index.ts
// 统一的 API 层

// ========== 配置 ==========
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mg.pxsj.net.cn/api/v1'

// ========== 类型定义 ==========
// 请求类型
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

export interface LoginRequest {
  email: string
  password: string
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

// 响应类型
export interface User {
  id: number
  username: string
  email: string
  nickname: string
  level?: number
  is_verified?: boolean
  energy?: number
  referral_code?: string
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
async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
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
        } else {
          // 处理字段级错误
          const fieldErrors = []
          for (const field of ['email', 'password', 'verification_code', 'non_field_errors']) {
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

// ========== API 方法 ==========
export const api = {
  auth: {
    sendEmailCode: (data: EmailCodeRequest) => 
      request('/auth/email-code/', {
        method: 'POST',
        body: data as any,
      }),
    
    register: (data: RegisterRequest) =>
      request('/auth/register/', {
        method: 'POST',
        body: data as any,
      }),
    
    login: (data: LoginRequest) =>
      request<{ message: string; user: User }>('/auth/login/', {
        method: 'POST',
        credentials: 'include',
        body: data as any,
      }),
    
    logout: () =>
      request('/auth/logout/', {
        method: 'POST',
        credentials: 'include',
      }),
    
    checkStatus: () =>
      request<AuthStatus>('/auth/status/', {
        method: 'GET',
        credentials: 'include',
      }),
    
    passwordReset: (data: PasswordResetRequest) =>
      request('/auth/password-reset/', {
        method: 'POST',
        body: data as any,
      }),
    
    passwordResetConfirm: (data: PasswordResetConfirmRequest) =>
      request('/auth/password-reset-confirm/', {
        method: 'POST',
        body: data as any,
      }),
  },
}

// ========== 工具函数 ==========
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return '未知错误'
}

export function isApiError(error: unknown, status?: number): error is ApiError {
  if (!(error instanceof ApiError)) {
    return false
  }
  
  if (status !== undefined) {
    return error.status === status
  }
  
  return true
}
