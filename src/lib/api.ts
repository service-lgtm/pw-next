// API 配置和请求工具
const API_BASE_URL = 'https://mg.pxsj.net.cn/api/v1'

// 通用请求方法
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body,
      credentials: 'include',
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || `请求失败: ${response.status}`)
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('网络请求失败')
  }
}

// Auth API 类型定义
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

// Auth API 方法
export const authAPI = {
  // 发送邮箱验证码 - 直接使用 fetch 避免包装问题
  sendEmailCode: async (data: EmailCodeRequest) => {
    const response = await fetch(`${API_BASE_URL}/auth/email-code/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || '发送失败')
    }
    
    return result
  },

  // 注册
  register: (data: RegisterRequest) =>
    apiRequest<{ message: string; user: User }>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 登录
  login: (data: LoginRequest) =>
    apiRequest<{ message: string; user: User }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 退出登录
  logout: () =>
    apiRequest('/auth/logout/', {
      method: 'POST',
    }),

  // 请求密码重置
  passwordReset: (data: PasswordResetRequest) =>
    apiRequest('/auth/password-reset/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 确认密码重置
  passwordResetConfirm: (data: PasswordResetConfirmRequest) =>
    apiRequest('/auth/password-reset-confirm/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 检查认证状态
  checkStatus: () =>
    apiRequest<AuthStatus>('/auth/status/', {
      method: 'GET',
    }),
}
