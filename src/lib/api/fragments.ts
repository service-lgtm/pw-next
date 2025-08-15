// src/lib/api/fragments.ts
// 土地碎片 API 接口

import { request } from './index'

// ========== 类型定义 ==========
export interface Fragment {
  id: number
  fragment_id: string
  batch: number
  batch_name: string
  batch_code: string
  size_sqm: number
  status: 'claimed' | 'used'
  claimed_at: string
  used_at: string | null
  expire_at: string | null
  can_use: boolean
}

export interface Batch {
  id: number
  batch_code: string
  batch_name: string
  description: string
  total_fragments: number
  claimed_count: number
  max_claims_per_user: number
  start_time: string
  end_time: string | null
  status: 'active' | 'inactive' | 'ended'
  is_active: boolean
  can_claim: boolean
  stats: {
    total: number
    available: number
    claimed: number
    used: number
  }
}

export interface FragmentStats {
  user: number
  username: string
  total_claimed: number
  total_used: number
  current_fragments: number
  current_area_sqm: number
  lands_combined: number
  today_claimed: number
  last_claim_date: string | null
  can_combine: boolean
  batch_details: Array<{
    batch_id: number
    batch_code: string
    batch_name: string
    claimed: number
    used: number
    available: number
    can_combine: boolean
    fragments_per_land: number
  }>
}

export interface ClaimResponse {
  success: boolean
  message: string
  data: {
    fragment_id: string
    size_sqm: number
    batch_name: string
    has_claimed: boolean
  }
}

export interface BatchProgress {
  batch: Batch
  user_progress: {
    claimed: number
    used: number
    total: number
    can_combine: boolean
    lands_combined: number
  }
  overall_progress: {
    claimed_percent: number
    used_percent: number
    available: number
    claimed: number
    used: number
    total: number
  }
}

// ========== API 接口 ==========
export const fragmentsApi = {
  // 快速领取碎片 - 特殊处理400错误
  quickClaim: async (password: string): Promise<ClaimResponse> => {
    try {
      const response = await request<ClaimResponse>('/assets/fragments/quick-claim/', {
        method: 'POST',
        body: { password }
      })
      return response
    } catch (error: any) {
      // 处理 400 错误 - API 返回的业务错误
      if (error?.status === 400 && error?.details) {
        // 返回错误信息，保持与成功响应相同的结构
        return {
          success: false,
          message: error.details.message || error.message || '领取失败',
          data: null as any
        }
      }
      // 其他错误继续抛出
      throw error
    }
  },
  
  // 获取批次列表
  getBatches: (params?: {
    page?: number
    page_size?: number
  }) =>
    request<{
      count: number
      next: string | null
      previous: string | null
      results: Batch[]
    }>('/assets/fragments/batches/', { params }),
  
  // 获取批次进度
  getBatchProgress: (batchId: number) =>
    request<{
      success: boolean
      data: BatchProgress
    }>(`/assets/fragments/batches/${batchId}/progress/`),
  
  // 获取我的碎片列表
  getMyFragments: (params?: {
    page?: number
    page_size?: number
    status?: 'claimed' | 'used'
    batch_id?: number
  }) =>
    request<{
      count: number
      next: string | null
      previous: string | null
      results: Fragment[]
      stats: {
        total_claimed: number
        total_used: number
        current_fragments: number
        current_area_sqm: number
        lands_combined: number
      }
    }>('/assets/fragments/my-fragments/', { params }),
  
  // 获取我的统计
  getMyStats: () =>
    request<{
      success: boolean
      data: FragmentStats
    }>('/assets/fragments/my-stats/')
}
