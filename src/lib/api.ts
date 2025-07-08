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
      throw new Error(data.message || data.detail || `请求失败: ${response.status}`)
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('网络请求失败')
  }
}

// Auth API 类型定义（保持不变）
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
  // 发送邮箱验证码
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

  // 注册 - 也使用直接的 fetch
  register: async (data: RegisterRequest) => {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      // 处理具体的错误信息
      if (result.email) {
        throw new Error(result.email[0] || '邮箱错误')
      }
      if (result.password) {
        throw new Error(result.password[0] || '密码错误')
      }
      if (result.verification_code) {
        throw new Error(result.verification_code[0] || '验证码错误')
      }
      if (result.referral_code) {
        throw new Error(result.referral_code[0] || '邀请码错误')
      }
      throw new Error(result.message || result.detail || '注册失败')
    }
    
    return result
  },

  // 登录 - 也使用直接的 fetch
  login: async (data: LoginRequest) => {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || result.detail || '登录失败')
    }
    
    return result
  },

  // 退出登录
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || '退出失败')
    }
    
    return result
  },

  // 请求密码重置
  passwordReset: async (data: PasswordResetRequest) => {
    const response = await fetch(`${API_BASE_URL}/auth/password-reset/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || '请求失败')
    }
    
    return result
  },

  // 确认密码重置
  passwordResetConfirm: async (data: PasswordResetConfirmRequest) => {
    const response = await fetch(`${API_BASE_URL}/auth/password-reset-confirm/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || '重置失败')
    }
    
    return result
  },

  // 检查认证状态
  checkStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/status/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || '获取状态失败')
    }
    
    return result
  },
}
