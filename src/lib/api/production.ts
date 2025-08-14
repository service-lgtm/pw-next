// src/lib/api/production.ts
// 挖矿生产系统 API - 修复版本
//
// 文件说明：
// 1. 本文件包含所有挖矿生产相关的 API 接口
// 2. 包括自主挖矿、招募挖矿、打工挖矿、合成系统等
// 3. 使用 JWT 认证，自动处理 token
// 4. 修复了 API 路径以匹配后端 urls.py 定义
//
// 关联文件：
// - src/lib/api/index.ts: 基础请求函数和认证管理
// - src/types/production.ts: 生产系统类型定义
// - src/hooks/useProduction.ts: 生产系统 Hook
// - backend/production/urls.py: 后端路由定义

import { request } from './index'
import type {
  Tool,
  UserResource,
  MiningSession,
  StartSelfMiningRequest,
  AddToolToMiningRequest,
  RemoveToolFromMiningRequest,
  DepositToolsRequest,
  StartHiredMiningWithToolRequest,
  StartHiredMiningWithoutToolRequest,
  SynthesizeToolRequest,
  SynthesizeBrickRequest,
  CollectOutputRequest,
  StopProductionRequest,
  StartMiningResponse,
  AddToolResponse,
  RemoveToolResponse,
  SynthesisResponse,
  CollectOutputResponse,
  ProductionStatsResponse,
  MiningSessionListResponse,
  ToolListResponse,
  ResourceBalance
} from '@/types/production'

export const productionApi = {
  // ==================== 自主挖矿 ====================
  mining: {
    // 开始自主挖矿
    startSelfMining: (data: StartSelfMiningRequest) =>
      request<StartMiningResponse>('/api/production/mining/self/start/', {
        method: 'POST',
        body: data,
      }),

    // 添加工具到挖矿
    addTools: (data: AddToolToMiningRequest) =>
      request<AddToolResponse>('/api/production/mining/self/add-tools/', {
        method: 'POST',
        body: data,
      }),

    // 从挖矿移除工具
    removeTools: (data: RemoveToolFromMiningRequest) =>
      request<RemoveToolResponse>('/api/production/mining/self/remove-tools/', {
        method: 'POST',
        body: data,
      }),

    // 获取我的挖矿会话列表
    getMySessions: (params?: {
      status?: 'active' | 'paused' | 'completed'
      page?: number
      page_size?: number
    }) =>
      request<MiningSessionListResponse>('/api/production/sessions/', { params }),

    // 收取产出
    collectOutput: (data: CollectOutputRequest) =>
      request<CollectOutputResponse>('/api/production/collect/', {
        method: 'POST',
        body: data,
      }),

    // 停止生产
    stopProduction: (data: StopProductionRequest) =>
      request<{
        success: boolean
        message: string
        data: {
          final_output: number
          tools_released: number
          total_output?: number
          total_hours?: number
          auto_collected?: number
        }
      }>('/api/production/stop/', {
        method: 'POST',
        body: data,
      }),
  },

  // ==================== 招募与打工 ====================
  hiring: {
    // 存入工具供招募
    depositTools: (data: DepositToolsRequest) =>
      request<{
        success: boolean
        message: string
        data: {
          deposited_tools: number
          land_id: string
        }
      }>('/api/production/mining/recruit/deposit-tools/', {
        method: 'POST',
        body: data,
      }),

    // 带工具打工
    startWithTools: (data: StartHiredMiningWithToolRequest) =>
      request<StartMiningResponse>('/api/production/mining/work/with-tools/', {
        method: 'POST',
        body: data,
      }),

    // 无工具打工（借用工具）
    startWithoutTools: (data: StartHiredMiningWithoutToolRequest) =>
      request<StartMiningResponse>('/api/production/mining/work/without-tools/', {
        method: 'POST',
        body: data,
      }),
  },

  // ==================== 合成系统 ====================
  synthesis: {
    // 合成工具
    synthesizeTool: (data: SynthesizeToolRequest) =>
      request<SynthesisResponse>('/api/production/synthesis/tool/', {
        method: 'POST',
        body: data,
      }),

    // 合成砖头
    synthesizeBricks: (data: SynthesizeBrickRequest) =>
      request<SynthesisResponse>('/api/production/synthesis/bricks/', {
        method: 'POST',
        body: data,
      }),

    // 获取合成配方
    getRecipes: () =>
      request<{
        success: boolean
        data: {
          pickaxe?: { name: string; materials: any; yld_cost: number; durability: number }
          axe?: { name: string; materials: any; yld_cost: number; durability: number }
          hoe?: { name: string; materials: any; yld_cost: number; durability: number }
          brick?: { name: string; materials: any; yld_cost: number; output: number }
        }
      }>('/api/production/synthesis/recipes/'),
  },

  // ==================== 工具管理 ====================
  tools: {
    // 获取我的工具列表
    getMyTools: (params?: {
      tool_type?: 'pickaxe' | 'axe' | 'hoe'
      status?: 'normal' | 'damaged' | 'repairing'  // 修正：使用后端定义的状态值
      is_in_use?: boolean
      page?: number
      page_size?: number
    }) =>
      request<ToolListResponse>('/api/production/tools/', { params }),
  },

  // ==================== 资源管理 ====================
  resources: {
    // 获取用户资源
    getMyResources: () =>
      request<{
        results: UserResource[]
        stats?: {
          total_types: number
          total_value: number
          total_amount: { [key: string]: number }
        }
      }>('/api/production/resources/'),
  },

  // ==================== 统计与分析 ====================
  stats: {
    // 获取生产统计
    getProductionStats: () =>
      request<ProductionStatsResponse>('/api/production/stats/'),

    // 获取生产记录
    getProductionRecords: (params?: {
      resource_type?: string
      session?: number
      page?: number
      page_size?: number
    }) =>
      request<{
        count: number
        results: Array<{
          id: number
          session_id: string
          resource_type: string
          amount: string
          created_at: string
        }>
        stats?: {
          total_collected: number
          total_tax: number
          total_hours: number
          total_energy: number
        }
      }>('/api/production/records/', { params }),

    // 检查粮食状态
    checkFoodStatus: () =>
      request<{
        success: boolean
        data: {
          current_food: number
          consumption_rate: number  // 每小时消耗
          hours_sustainable: number
          warning: boolean
          warning_message?: string
          active_sessions_count: number
        }
      }>('/api/production/food-status/'),
  },

  // ==================== 土地相关 ====================
  lands: {
    // 获取可用于挖矿的土地
    getAvailableLands: (params?: {
      ownership?: 'mine' | 'others' | 'all'
      land_type?: string
      has_tools?: boolean
      page?: number
      page_size?: number
    }) =>
      request<{
        success: boolean
        data: {
          count: number
          total_pages: number
          current_page: number
          page_size: number
          results: Array<{
            id: number
            land_id: string
            owner: {
              id: number
              username: string
              nickname: string
            }
            is_mine: boolean
            blueprint: {
              id: number | null
              land_type: string | null
              land_type_display: string
              output_resource: string | null
              daily_output: number
              size_sqm: number
              remaining_reserves: number | null
            }
            region: {
              id: number | null
              name: string
              display_name: string
            }
            is_producing: boolean
            is_recruiting: boolean
            deposited_tools: {
              count: number
              available: number
              types: string[]
            }
            active_sessions: number
            mining_options: Array<{
              type: string
              name: string
              description: string
            }>
            created_at: string | null
          }>
        }
      }>('/api/production/lands/available/', { params }),

    // 获取土地挖矿详情
    getLandMiningInfo: (landId: number) =>
      request<{
        success: boolean
        data: {
          land: {
            id: number
            land_id: string
            owner: {
              id: number
              username: string
              is_me: boolean
            }
            blueprint: {
              land_type: string | null
              land_type_display: string
              output_resource: string | null
              daily_output: number
              size_sqm: number
              energy_consumption_rate: number
            }
            region: {
              name: string
            }
            is_producing: boolean
            production_started_at: string | null
          }
          tools: {
            total: number
            available: number
            in_use: number
            details: Array<{
              id: number
              tool_id: string
              owner_id: number
              owner_username: string
              is_mine: boolean
              tool_type: string
              tool_type_display: string
              status: string
              is_in_use: boolean
              current_durability: number
              max_durability: number
              durability_percentage: number
            }>
          }
          active_sessions: {
            count: number
            total_output_rate: number
            total_food_consumption: number
            sessions: Array<{
              id: number
              session_id: string
              user: {
                id: number
                username: string
                is_me: boolean
              }
              mining_type: string
              resource_type: string
              output_rate: number
              started_at: string
              total_output: number
              tool_count: number
              food_consumption_rate: number
            }>
          }
          history: {
            total_output: number
            total_hours: number
            total_sessions: number
            total_workers: number
            recent_records: Array<{
              resource_type: string
              amount: number
              net_amount: number
              tax_amount: number
              created_at: string
            }>
          }
          available_actions: Array<{
            action: string
            name: string
            enabled: boolean
          }>
        }
      }>(`/api/production/lands/${landId}/mining-info/`),

    // 获取用户的土地列表
    getUserLands: () =>
      request<{
        success: boolean
        data: {
          count: number
          results: Array<{
            id: number
            land_id: string
            blueprint: {
              land_type: string | null
              land_type_display: string
              output_resource: string | null
              daily_output: number
            }
            region: {
              name: string
            }
            is_producing: boolean
            deposited_tools_count: number
            active_session: {
              session_id: string
              resource_type: string
              output_rate: number
              started_at: string
              total_output: number
            } | null
          }>
        }
      }>('/api/production/lands/mine/'),
  },
}

// ==================== 辅助函数 ====================

/**
 * 格式化资源返回数据为 ResourceBalance
 */
export function formatResourceBalance(resources: UserResource[]): ResourceBalance {
  const balance: ResourceBalance = {
    wood: 0,
    iron: 0,
    stone: 0,
    yld: 0,
    grain: 0,
    seed: 0,
    brick: 0
  }

  resources.forEach(resource => {
    const key = resource.resource_type as keyof ResourceBalance
    if (key in balance) {
      balance[key] = parseFloat(resource.available_amount || resource.amount)
    }
  })

  return balance
}
