// lib/api/index.ts
// 统一的 API 层 - 更新了字段映射

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
      // 处理字段映射，确保兼容性
      const normalizedUser = {
        ...user,
        // 将字符串的 tdb_balance 和 yld_balance 转换为数字并保存为兼容字段
        tdbBalance: user.tdb_balance ? parseFloat(user.tdb_balance) : (user.tdbBalance || 0),
        yldBalance: user.yld_balance ? parseFloat(user.yld_balance) : (user.yldBalance || 0),
      }
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(normalizedUser))
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
  // 新增字段
  masked_email?: string
  masked_phone?: string
  level_name?: string
  level_color?: string
  referrer_nickname?: string | null
  direct_referrals_count?: number
  total_referrals_count?: number
  community_performance?: string
  tdb_balance?: string  // TDB积分余额 - API返回字符串
  yld_balance?: string  // YLD积分余额 - API返回字符串
  email_verified?: boolean
  is_activated?: boolean
  created_at?: string
  last_login?: string
  // 兼容旧字段
  tdbBalance?: number
  yldBalance?: number
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

// 新增类型定义 - 账户管理相关
export interface ChangePasswordRequest {
  old_password: string
  new_password: string
  confirm_new_password: string
}

export interface SetPaymentPasswordRequest {
  password: string
  confirm_password: string
}

export interface ChangePaymentPasswordRequest {
  old_password: string
  new_password: string
  confirm_new_password: string
}

export interface ResetPaymentPasswordRequest {
  email_code: string
  new_password: string
  confirm_password: string
}

export interface ProfileUpdateRequest {
  nickname?: string
  description?: string
}

export interface TeamSummaryResponse {
  success: boolean
  data: {
    total_members: number
    total_performance: string
  }
}

export interface ProfileResponse {
  success: boolean
  data: User
}

// ========== 地址管理类型定义 ==========
export interface Address {
  id: string
  user_id: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  postcode?: string
  is_default: boolean
  full_address?: string
  create_time?: string
  update_time?: string
}

export interface AddressListResponse {
  success: boolean
  data: Address[]
}

export interface AddressDetailResponse {
  success: boolean
  data: Address
}

export interface AddressCreateRequest {
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  postcode?: string
  is_default?: boolean
}

export interface AddressUpdateRequest extends AddressCreateRequest {}

export interface AddressResponse {
  success: boolean
  message: string
  data?: Address
}

// ========== 商城类型定义 ==========
export interface Product {
  id: string
  name: string
  description?: string
  price: string
  tdb_amount: string
  images: string[]
  stock: number
  category: string
  is_hot?: boolean
  discount?: string
  final_price?: string
  payment_methods: string[]
  specifications?: Record<string, string>
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface ProductDetail extends Product {
  payment_methods: PaymentMethodInfo[]
}

export interface PaymentMethodInfo {
  method: 'alipay' | 'bank' | 'wechat'
  is_enabled: boolean
  account_info?: {
    account: string
    account_name: string
    bank?: string
    branch?: string
    qr_code?: string
  }
}

export interface CreateOrderRequest {
  product_id: string
  quantity: number
  payment_method: 'alipay' | 'bank' | 'wechat'
}

export interface CreateOrderResponse {
  success: boolean
  message: string
  data: {
    order_id: string
    payment_account: {
      method: string
      account: string
      account_name: string
      qr_code?: string
    }
    expire_time: string
    total_price: string
    tdb_amount: string
  }
}

export interface Order {
  id: string
  user: number
  user_nickname: string
  product: string
  product_name: string
  product_snapshot: {
    name: string
    price: string
    tdb_amount: string
    images: string[]
  }
  quantity: number
  unit_price: string
  total_price: string
  tdb_amount: string
  payment_method: string
  payment_method_display: string
  payment_account_info: {
    method: string
    account: string
    account_name: string
  }
  status: string
  status_display: string
  transaction_id?: string
  paid_at?: string
  payment_screenshot?: string
  confirmed_at?: string
  shipping_address?: Address
  shipping_address_detail?: string
  tracking_number?: string
  shipping_company?: string
  shipped_at?: string
  tdb_credited: boolean
  remark: string
  created_at: string
  expire_at?: string
  can_operations: {
    can_pay: boolean
    can_cancel: boolean
    can_confirm: boolean
    can_set_address: boolean
    can_ship: boolean
  }
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

// 账户管理特定错误处理
export function getAccountErrorMessage(error: ApiError): string {
  if (error.status === 400 && error.details?.errors) {
    const errors = error.details.errors
    // 处理字段级错误
    if (errors.nickname) {
      return errors.nickname[0]
    }
    if (errors.old_password) {
      return errors.old_password[0]
    }
    if (errors.new_password) {
      return errors.new_password[0]
    }
    if (errors.password) {
      return errors.password[0]
    }
    if (errors.email_code) {
      return errors.email_code[0]
    }
  }
  
  // 处理特定状态码
  switch (error.status) {
    case 429:
      return '请求过于频繁，请稍后再试'
    case 401:
      return '登录已过期，请重新登录'
    case 403:
      return '无权限执行此操作'
    default:
      return error.message || '操作失败，请稍后重试'
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
      'Accept': 'application/json',
      ...init.headers,
    },
  }
  
  // 只有在body存在且不是FormData时才设置Content-Type
  if (config.body && !(config.body instanceof FormData)) {
    config.headers = {
      ...config.headers,
      'Content-Type': 'application/json',
    }
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
  
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
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
        } else if (data.errors) {
          // 处理字段错误
          const fieldErrors = []
          for (const [field, errors] of Object.entries(data.errors)) {
            if (Array.isArray(errors) && errors.length > 0) {
              fieldErrors.push(errors[0])
            }
          }
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors[0]
          }
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
      
      throw new ApiError(response.status, data?.error_code || 'API_ERROR', errorMessage, data)
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
  
  // 用户相关 - 扩展账户管理功能
  accounts: {
    // 获取个人资料
    profile: () => request<ProfileResponse>('/auth/profile/'),
    
    // 更新个人资料
    updateProfile: (data: ProfileUpdateRequest) => 
      request<ProfileResponse>('/auth/profile/', {
        method: 'PATCH',
        body: data as any,
      }),
    
    // 修改登录密码
    changePassword: (data: ChangePasswordRequest) => 
      request<{ success: boolean; message: string }>('/auth/password/change/', {
        method: 'POST',
        body: data as any,
      }),
    
    // 设置支付密码
    setPaymentPassword: (data: SetPaymentPasswordRequest) => 
      request<{ success: boolean; message: string }>('/auth/payment-password/set/', {
        method: 'POST',
        body: data as any,
      }),
    
    // 修改支付密码
    changePaymentPassword: (data: ChangePaymentPasswordRequest) => 
      request<{ success: boolean; message: string }>('/auth/payment-password/change/', {
        method: 'POST',
        body: data as any,
      }),
    
    // 发送支付密码重置验证码
    sendPaymentPasswordResetCode: () => 
      request<{ success: boolean; message: string }>('/auth/payment-password/reset-code/', {
        method: 'POST',
      }),
    
    // 重置支付密码
    resetPaymentPassword: (data: ResetPaymentPasswordRequest) => 
      request<{ success: boolean; message: string }>('/auth/payment-password/reset/', {
        method: 'POST',
        body: data as any,
      }),
    
    // 获取团队概览
    getTeamSummary: () => request<TeamSummaryResponse>('/auth/team/summary/'),
    
    // ========== 地址管理 API ==========
    // 获取地址列表
    addresses: {
      list: () => request<AddressListResponse>('/auth/addresses/'),
      
      // 获取单个地址
      get: (addressId: string) => 
        request<AddressDetailResponse>(`/auth/addresses/${addressId}/`),
      
      // 创建地址
      create: (data: AddressCreateRequest) =>
        request<AddressResponse>('/auth/addresses/', {
          method: 'POST',
          body: data as any,
        }),
      
      // 更新地址
      update: (addressId: string, data: AddressUpdateRequest) =>
        request<AddressResponse>(`/auth/addresses/${addressId}/`, {
          method: 'PATCH',
          body: data as any,
        }),
      
      // 删除地址
      delete: (addressId: string) =>
        request<AddressResponse>(`/auth/addresses/${addressId}/`, {
          method: 'DELETE',
        }),
      
      // 设置默认地址
      setDefault: (addressId: string) =>
        request<AddressResponse>(`/auth/addresses/${addressId}/set-default/`, {
          method: 'POST',
        }),
      
      // 获取默认地址
      getDefault: () =>
        request<AddressDetailResponse>('/auth/addresses/default/'),
      
      // 验证地址
      validate: (addressId: string) =>
        request<{ success: boolean; data: { is_valid: boolean; address?: Address } }>('/auth/addresses/validate/', {
          method: 'POST',
          body: { address_id: addressId } as any,
        }),
    },
  },
  
  // ========== 商城 API ==========
  shop: {
    // 获取商品列表
    products: {
      list: (params?: {
        page?: number
        page_size?: number
        category?: string
        is_hot?: boolean
        search?: string
      }) => request<{
        count: number
        next: string | null
        previous: string | null
        results: Product[]
      }>('/shop/products/', { params }),
      
      // 获取商品详情
      get: (productId: string) =>
        request<ProductDetail>(`/shop/products/${productId}/`),
    },
    
    // 订单相关
    orders: {
      // 创建订单
      create: (data: CreateOrderRequest) =>
        request<CreateOrderResponse>('/shop/orders/create/', {
          method: 'POST',
          body: data as any,
        }),
      
      // 获取订单列表
      list: (params?: {
        status?: string
        page?: number
        page_size?: number
      }) => request<{
        count: number
        next: string | null
        previous: string | null
        results: Order[]
      }>('/shop/orders/', { params }),
      
      // 获取订单详情
      get: (orderId: string) =>
        request<Order>(`/shop/orders/${orderId}/`),
      
      // 提交支付信息
      pay: (orderId: string, formData: FormData) =>
        request<{ success: boolean; message: string }>(`/shop/orders/${orderId}/pay/`, {
          method: 'POST',
          body: formData,
        }),
      
      // 设置收货地址
      setAddress: (orderId: string, addressId: string) =>
        request<{
          success: boolean
          message: string
          data: {
            order_id: string
            status: string
            shipping_address: Address
          }
        }>(`/shop/orders/${orderId}/address/`, {
          method: 'POST',
          body: { address_id: addressId } as any,
        }),
      
      // 取消订单
      cancel: (orderId: string) =>
        request<{ success: boolean; message: string }>(`/shop/orders/${orderId}/cancel/`, {
          method: 'POST',
        }),
    },
  },
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
