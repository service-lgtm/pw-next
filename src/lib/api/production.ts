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
      request<StartMiningResponse>('/production/mining/start-self/', {
        method: 'POST',
        body: data,
      }),

    // 添加工具到挖矿
    addTool: (data: AddToolToMiningRequest) =>
      request<AddToolResponse>('/production/mining/add-tool/', {
        method: 'POST',
        body: data,
      }),

    // 从挖矿移除工具
    removeTool: (data: RemoveToolFromMiningRequest) =>
      request<RemoveToolResponse>('/production/mining/remove-tool/', {
        method: 'POST',
        body: data,
      }),

    // 获取我的挖矿会话列表
    getMySessions: (params?: {
      status?: 'active' | 'paused' | 'completed'
      page?: number
      page_size?: number
    }) =>
      request<MiningSessionListResponse>('/production/mining/sessions/', { params }),

    // 获取挖矿会话详情
    getSessionDetail: (sessionId: number) =>
      request<MiningSession>(`/production/mining/sessions/${sessionId}/`),

    // 收取产出
    collectOutput: (data: CollectOutputRequest) =>
      request<CollectOutputResponse>('/production/mining/collect/', {
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
      }>('/production/mining/stop/', {
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
      }>('/production/hiring/deposit-tools/', {
        method: 'POST',
        body: data,
      }),

    // 带工具打工
    startWithTool: (data: StartHiredMiningWithToolRequest) =>
      request<StartMiningResponse>('/production/hiring/start-with-tool/', {
        method: 'POST',
        body: data,
      }),

    // 无工具打工（借用工具）
    startWithoutTool: (data: StartHiredMiningWithoutToolRequest) =>
      request<StartMiningResponse>('/production/hiring/start-without-tool/', {
        method: 'POST',
        body: data,
      }),

    // 获取可打工的土地列表
    getAvailableLands: (params?: {
      has_tools?: boolean  // 是否有存放工具
      land_type?: string
      page?: number
      page_size?: number
    }) =>
      request<{
        count: number
        results: Array<{
          land_id: number
          land_id_str: string
          land_type: string
          owner_username: string
          deposited_tools: number
          daily_output: number
          worker_share_rate: number  // 打工者分成比例
        }>
      }>('/production/hiring/available-lands/', { params }),
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
    synthesizeBrick: (data: SynthesizeBrickRequest) =>
      request<SynthesisResponse>('/production/synthesis/brick/', {
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

    // 获取工具详情
    getToolDetail: (toolId: number) =>
      request<Tool>(`/production/tools/${toolId}/`),

    // 修复工具
    repairTool: (toolId: number) =>
      request<{
        success: boolean
        message: string
        data: {
          tool_id: string
          new_durability: number
          repair_cost: {
            iron?: number
            wood?: number
          }
        }
      }>(`/production/tools/${toolId}/repair/`, {
        method: 'POST',
      }),
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

    // 获取资源历史记录
    getResourceHistory: (params?: {
      resource_type?: string
      transaction_type?: string
      start_date?: string
      end_date?: string
      page?: number
      page_size?: number
    }) =>
      request<{
        count: number
        results: Array<{
          id: number
          resource_type: string
          amount: string
          transaction_type: string
          description: string
          created_at: string
        }>
      }>('/production/resources/history/', { params }),

    // 检查粮食状态
    checkGrainStatus: () =>
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
      }>('/production/resources/grain-status/'),
  },

  // ==================== 统计与分析 ====================
  stats: {
    // 获取生产统计
    getProductionStats: () =>
      request<ProductionStatsResponse>('/production/stats/'),

    // 获取历史产出统计
    getOutputHistory: (params?: {
      days?: number  // 最近N天
      group_by?: 'day' | 'hour'
    }) =>
      request<{
        success: boolean
        data: Array<{
          date: string
          wood: number
          iron: number
          stone: number
          yld: number
          grain: number
        }>
      }>('/production/stats/output-history/', { params }),

    // 获取工具使用统计
    getToolUsageStats: () =>
      request<{
        success: boolean
        data: {
          most_used_tools: Array<{
            tool_id: string
            tool_type: string
            total_hours: number
            total_output: number
          }>
          efficiency_by_type: {
            pickaxe: number
            axe: number
            hoe: number
          }
          average_durability: number
        }
      }>('/production/stats/tool-usage/'),
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
