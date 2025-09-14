// src/hooks/useWallet.ts
// 钱包相关 Hook - 获取用户余额信息
// 版本：1.0.1 - 使用用户profile接口获取余额

/**
 * ============================================
 * 文件修改说明
 * ============================================
 * 修改原因：使用 /auth/profile/ 接口获取钱包余额
 * 修改内容：
 * 1. 从用户信息中提取 tdb_balance 和 yld_balance
 * 2. 移除独立的钱包余额接口
 * 
 * API说明：
 * - 接口路径：/auth/profile/
 * - 返回数据包含：yld_balance, tdb_balance
 * - 同时包含用户其他信息（等级、推荐码等）
 * 
 * ⚠️ 重要说明：
 * - 余额数据来自用户profile接口
 * - 返回的余额是字符串格式，需要转换为数字
 * ============================================
 */

import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { request } from '@/lib/api'

// 用户信息响应类型
interface UserProfileResponse {
  success: boolean
  data: {
    id: number
    username: string
    nickname: string
    masked_email: string
    masked_phone: string | null
    level: number
    level_name: string
    level_color: string
    energy: number
    referral_code: string
    direct_referrals_count: number
    total_referrals_count: number
    community_performance: string
    yld_balance: string  // 字符串格式的YLD余额
    tdb_balance: string  // 字符串格式的TDB余额
    is_verified: boolean
    email_verified: boolean
    is_activated: boolean
    created_at: string
    last_login: string
  }
  cached: boolean
}

// 钱包余额类型
export interface WalletBalance {
  tdb_balance: number
  yld_balance: number
  frozen_tdb: number
  frozen_yld: number
  updated_at: string
}

// 钱包 API
const walletApi = {
  // 获取用户信息（包含余额）
  getUserProfile: () => request<UserProfileResponse>('/auth/profile/'),
  
  // 获取交易历史
  getTransactions: (params?: {
    type?: string
    page?: number
    page_size?: number
  }) => request('/wallet/transactions/', { params })
}

// 钱包余额 Hook
export function useWallet() {
  const { isAuthenticated } = useAuth()
  
  // 获取用户信息（包含余额）
  const { 
    data: profileData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const response = await walletApi.getUserProfile()
      return response
    },
    enabled: isAuthenticated,
    refetchInterval: 30000, // 30秒自动刷新
    staleTime: 10000 // 10秒内认为数据是新鲜的
  })
  
  // 从用户信息中提取余额数据
  const balance: WalletBalance | null = profileData?.data ? {
    tdb_balance: parseFloat(profileData.data.tdb_balance) || 0,
    yld_balance: parseFloat(profileData.data.yld_balance) || 0,
    frozen_tdb: 0, // 用户信息中没有冻结金额，默认为0
    frozen_yld: 0, // 用户信息中没有冻结金额，默认为0
    updated_at: new Date().toISOString()
  } : null
  
  return {
    balance,
    userProfile: profileData?.data, // 同时返回完整的用户信息
    loading: isLoading,
    error,
    refetch
  }
}

// 钱包交易记录 Hook
export function useWalletTransactions(params?: {
  type?: string
  page?: number
  page_size?: number
}) {
  const { isAuthenticated } = useAuth()
  
  const { 
    data, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['wallet', 'transactions', params],
    queryFn: () => walletApi.getTransactions(params),
    enabled: isAuthenticated,
    keepPreviousData: true
  })
  
  return {
    transactions: data?.results || [],
    totalCount: data?.count || 0,
    loading: isLoading,
    error,
    refetch
  }
}
