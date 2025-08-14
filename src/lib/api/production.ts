// src/lib/api/production.ts
// 挖矿生产系统 API
//
// 文件说明：
// 1. 本文件包含所有挖矿生产相关的 API 接口
// 2. 包括自主挖矿、招募挖矿、打工挖矿、合成系统等
// 3. 使用 JWT 认证，自动处理 token
//
// 关联文件：
// - src/lib/api/index.ts: 基础请求函数和认证管理
// - src/types/production.ts: 生产系统类型定义
// - src/hooks/useProduction.ts: 生产系统 Hook

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
      request<StartMiningResponse>('/production/mining/self/start/', {
        method: 'POST',
        body: data,
      }),

    // 添加工具到挖矿
    addTools: (data: AddToolToMiningRequest) =>
      request<AddToolResponse>('/production/mining/self/add-tools/', {
        method: 'POST',
        body: data,
      }),

    // 从挖矿移除工具
    removeTools: (data: RemoveToolFromMiningRequest) =>
      request<RemoveToolResponse>('/production/mining/self/remove-tools/', {
        method: 'POST',
        body: data,
      }),

    // 获取我的挖矿会话列表
    getMySessions: (params?: {
      status?: 'active' | 'paused' | 'completed'
      page?: number
      page_size?: number
    }) =>
      request<MiningSessionListResponse>('/production/sessions/', { params }),

    // 收取产出
    collectOutput: (data: CollectOutputRequest) =>
      request<CollectOutputResponse>('/production/collect/', {
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
        }
      }>('/production/stop/', {
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
      }>('/production/mining/recruit/deposit-tools/', {
        method: 'POST',
        body: data,
      }),

    // 带工具打工
    startWithTools: (data: StartHiredMiningWithToolRequest) =>
      request<StartMiningResponse>('/production/mining/work/with-tools/', {
        method: 'POST',
        body: data,
      }),

    // 无工具打工（借用工具）
    startWithoutTools: (data: StartHiredMiningWithoutToolRequest) =>
      request<StartMiningResponse>('/production/mining/work/without-tools/', {
        method: 'POST',
        body: data,
      }),
  },

  // ==================== 合成系统 ====================
  synthesis: {
    // 合成工具
    synthesizeTool: (data: SynthesizeToolRequest) =>
      request<SynthesisResponse>('/production/synthesis/tool/', {
        method: 'POST',
        body: data,
      }),

    // 合成砖头
    synthesizeBricks: (data: SynthesizeBrickRequest) =>
      request<SynthesisResponse>('/production/synthesis/bricks/', {
        method: 'POST',
        body: data,
      }),

    // 获取合成配方
    getRecipes: () =>
      request<{
        success: boolean
        data: {
          tools: {
            pickaxe: { iron: number; wood: number; yld: number; durability: number }
            axe: { iron: number; wood: number; yld: number; durability: number }
            hoe: { iron: number; wood: number; yld: number; durability: number }
          }
          materials: {
            brick: { stone: number; wood: number; yld: number; output: number }
          }
        }
      }>('/production/synthesis/recipes/'),
  },

  // ==================== 工具管理 ====================
  tools: {
    // 获取我的工具列表
    getMyTools: (params?: {
      tool_type?: 'pickaxe' | 'axe' | 'hoe'
      status?: 'idle' | 'working' | 'damaged'
      page?: number
      page_size?: number
    }) =>
      request<ToolListResponse>('/production/tools/', { params }),
  },

  // ==================== 资源管理 ====================
  resources: {
    // 获取用户资源
    getMyResources: () =>
      request<{
        success: boolean
        data: {
          resources: UserResource[]
          balance: ResourceBalance
        }
      }>('/production/resources/'),
  },

  // ==================== 统计与分析 ====================
  stats: {
    // 获取生产统计
    getProductionStats: () =>
      request<ProductionStatsResponse>('/production/stats/'),

    // 获取生产记录
    getProductionRecords: (params?: {
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
      }>('/production/records/', { params }),

    // 检查粮食状态
    checkFoodStatus: () =>
      request<{
        success: boolean
        data: {
          current_amount: number
          consumption_rate: number  // 每小时消耗
          hours_remaining: number
          active_tools_count: number
          warning: boolean
          message?: string
        }
      }>('/production/food-status/'),
  },

  // ==================== 可用土地查询 ====================
  lands: {
    // 获取可用于挖矿的土地（自己的或可打工的）
    getAvailableLands: (params?: {
      ownership?: 'mine' | 'others' | 'all'
      land_type?: string
      has_tools?: boolean
      page?: number
      page_size?: number
    }) =>
      request<{
        count: number
        results: Array<{
          id: number
          land_id: string
          land_type: string
          land_type_display: string
          owner: number
          owner_username: string
          is_mine: boolean
          daily_output: number
          current_reserves: number
          has_active_session: boolean
          deposited_tools_count: number
          available_for_hiring: boolean
          worker_share_rate?: number
        }>
      }>('/production/lands/available/', { params }),

    // 获取土地挖矿详情
    getLandMiningInfo: (landId: number) =>
      request<{
        success: boolean
        data: {
          land: {
            id: number
            land_id: string
            land_type: string
            owner_username: string
            daily_output: number
            current_reserves: number
          }
          active_sessions: MiningSession[]
          deposited_tools: Tool[]
          can_mine: boolean
          can_hire: boolean
          mining_requirements: {
            required_tool_type: string
            min_tools: number
            max_tools: number
          }
        }
      }>(`/production/lands/${landId}/mining-info/`),
  },
}
