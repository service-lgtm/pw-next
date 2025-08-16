// src/lib/api/production.ts
// 挖矿生产系统 API - 增强完整版
//
// 文件说明：
// 1. 本文件包含所有挖矿生产相关的 API 接口
// 2. 新增：YLD状态、挖矿预检查、产出率历史、批量操作等接口
// 3. 使用 JWT 认证，自动处理 token
// 4. 修复了资源统计接口，新增 getResourceStats 方法
//
// 关联文件：
// - src/lib/api/index.ts: 基础请求函数和认证管理
// - src/types/production.ts: 生产系统类型定义
// - src/hooks/useProduction.ts: 生产系统 Hook
// - backend/production/urls.py: 后端路由定义
// - backend/production/views.py: 后端视图
//
// 更新历史：
// - 2024-12: 新增YLD系统监控、挖矿汇总、批量操作等接口
// - 2024-12: 修复文件结尾问题，添加缺失的闭合括号

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
      is_active?: boolean
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
          total_output?: number
          total_hours?: number
          auto_collected?: number
        }
      }>('/production/stop/', {
        method: 'POST',
        body: data,
      }),

    // 新增：挖矿预检查
    preCheck: () =>
      request<{
        success: boolean
        data: {
          can_mine: boolean
          warnings: string[]
          errors: string[]
          idle_tools: number
          food_amount: number
          yld_status: {
            remaining: number
            percentage_used: number
          }
          active_sessions: number
        }
      }>('/production/mining/pre-check/'),

    // 新增：获取挖矿汇总
    getSummary: () =>
      request<{
        success: boolean
        data: {
          active_sessions: {
            count: number
            sessions: Array<{
              session_id: string
              resource_type: string
              land_id: number
              output_rate: number
              tool_count: number
              started_at: string
              hours_worked: number
              hours_collected: number
              uncollected_hours: number
              pending_output: number
              can_collect: boolean
            }>
            total_hourly_output: number
            total_food_consumption: number
          }
          resources: {
            iron: number
            stone: number
            wood: number
            food: number
            brick: number
            yld: number
          }
          tools: {
            total: number
            in_use: number
            idle: number
            damaged: number
          }
          food_sustainability_hours: number
          today_production: {
            total_output: number
            collection_count: number
          }
          yld_status: {
            daily_limit: number
            remaining: number
            percentage_used: number
            is_exhausted: boolean
          }
        }
      }>('/production/mining/summary/'),

    // 新增：获取会话产出率历史
    getSessionRateHistory: (sessionId: number) =>
      request<{
        success: boolean
        data: {
          session_id: string
          resource_type: string
          current_rate: number
          rate_history: Array<{
            time: string
            start_hour: number
            rate: number
            tools: number
            total_tools: number
            ratio: number
          }>
          output_segments: Array<{
            period: string
            hours: number
            rate: number
            output: number
            tools: number
            ratio: number
          }>
        }
      }>(`/production/sessions/${sessionId}/rate-history/`),

    // 新增：批量停止所有会话
    stopAllSessions: () =>
      request<{
        success: boolean
        message: string
        data: {
          stopped_count: number
          total_collected: number
          sessions: Array<{
            session_id: string
            resource_type: string
            status: string
            output_collected: number
          }>
        }
      }>('/production/stop-all/', {
        method: 'POST',
      }),
  },

  // ==================== YLD系统监控（新增） ====================
  yld: {
    // 获取YLD系统状态
    getSystemStatus: () =>
      request<{
        success: boolean
        data: {
          daily_limit: number
          produced_today: number
          remaining: number
          percentage_used: number
          is_exhausted: boolean
          active_sessions: number
          total_tools: number
          theoretical_hourly: number
          actual_hourly: number
          user_session?: {
            session_id: string
            output_rate: number
            tool_count: number
            started_at: string
          }
          warning?: string
        }
      }>('/production/yld/status/'),

    // 检查挖矿前YLD状态
    checkBeforeMining: () =>
      request<{
        can_mine: boolean
        daily_limit: number
        remaining: number
        percentage_used: number
        message: string
      }>('/production/yld/check-before-mining/'),

    // 处理YLD耗尽
    handleExhausted: () =>
      request<{
        success: boolean
        data: {
          message: string
          sessions_stopped: number
          total_settled: number
          settlement_details: Array<{
            session_id: string
            user: string
            hours: number
            should_get: number
            actual_get: number
          }>
        }
      }>('/production/yld/handle-exhausted/', {
        method: 'POST',
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
          pickaxe?: { name: string; materials: any; yld_cost: number; durability: number }
          axe?: { name: string; materials: any; yld_cost: number; durability: number }
          hoe?: { name: string; materials: any; yld_cost: number; durability: number }
          brick?: { name: string; materials: any; yld_cost: number; output: number }
        }
      }>('/production/synthesis/recipes/'),
  },

  // ==================== 工具管理 ====================
  tools: {
    // 获取我的工具列表
    getMyTools: (params?: {
      tool_type?: 'pickaxe' | 'axe' | 'hoe'
      status?: 'normal' | 'damaged' | 'repairing'
      is_in_use?: boolean
      page?: number
      page_size?: number
      ordering?: string
    }) =>
      request<ToolListResponse>('/production/tools/', { params }),
  },

  // ==================== 资源管理 ====================
  resources: {
    // 获取用户资源（旧接口，保留兼容性）
    getMyResources: () =>
      request<{
        results: UserResource[]
        stats?: {
          total_types: number
          total_value: number
          total_amount: { [key: string]: number }
        }
      }>('/production/resources/'),

    // 获取资源统计（增强版）
    // 对应后端 ResourceStatsView: /production/resources/stats/
    // 返回用户所有资源的当前库存、价值和统计信息
    getResourceStats: () =>
      request<{
        success: boolean
        data: {
          // 资源库存信息
          resources: {
            [key: string]: {
              display_name: string      // 显示名称
              amount: number            // 总数量
              frozen: number            // 冻结数量
              available: number         // 可用数量
              total_produced: number    // 累计生产
              total_consumed: number    // 累计消耗
              value?: number           // 总价值
              unit_price?: number      // 单价
            }
          }
          // 钱包信息（YLD 和 TDB）
          wallet: {
            yld_balance: number         // YLD 余额
            tdb_balance: number         // TDB 余额
            yld_value?: number         // YLD 价值
            yld_unit_price?: number    // YLD 单价
            tdb_value?: number         // TDB 价值
          }
          // 价格信息
          prices: {
            [key: string]: number       // 各资源的当前价格
          }
          // 总价值
          total_value: number
          // 摘要信息
          summary: {
            total_resources: number     // 资源总量
            total_in_wallet: number    // 钱包总额
            total_value: number        // 总价值
            resource_types: number     // 资源种类数
          }
          // 资源分布
          distribution: Array<{
            type: string               // 资源类型
            name: string               // 资源名称
            value: number              // 价值
            percentage: number         // 占比
          }>
        }
      }>('/production/resources/stats/'),

    // 新增：购买粮食
    buyFood: (data: { amount: number }) =>
      request<{
        success: boolean
        message: string
        data: {
          amount_purchased: number
          yld_spent: number
          new_food_balance: number
          new_yld_balance: number
        }
      }>('/production/food/buy/', {
        method: 'POST',
        body: data,
      }),

    // 新增：获取粮食购买状态
    getFoodPurchaseStatus: () =>
      request<{
        success: boolean
        data: {
          food_price: number
          yld_balance: number
          food_balance: number
          can_purchase: boolean
          max_purchasable: number
        }
      }>('/production/food/purchase-status/'),
  },

  // ==================== 土地管理 ====================
  lands: {
    // 获取用户土地列表
    getUserLands: () =>
      request<{
        success: boolean
        data: {
          count: number
          results: any[]
        }
      }>('/production/lands/user/'),

    // 获取可用土地列表（招募挖矿）
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
          results: any[]
          total_pages?: number
          current_page?: number
          page_size?: number
        }
      }>('/production/lands/available/', { params }),

    // 获取土地挖矿详情
    getLandMiningInfo: (landId: number) =>
      request<{
        success: boolean
        data: any
      }>(`/production/lands/${landId}/mining-info/`),
  },

  // ==================== 统计数据 ====================
  stats: {
    // 获取生产统计
    getProductionStats: () =>
      request<ProductionStatsResponse>('/production/stats/'),

    // 检查粮食状态
    checkFoodStatus: () =>
      request<{
        success: boolean
        data: {
          current_food: number
          consumption_rate: number
          hours_sustainable: number
          hours_sustainable_display: string
          warning: boolean
          warning_message: string | null
          active_sessions_count: number
        }
      }>('/production/food-status/'),
  },
}

// ==================== 辅助函数 ====================

/**
 * 格式化资源余额（从旧接口响应）
 * @param resources - 用户资源数组
 * @returns 格式化后的资源余额对象
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
    const amount = parseFloat(resource.available_amount || resource.amount || '0')
    
    // 处理粮食字段映射（food/grain 兼容性处理）
    if (resource.resource_type === 'food' || resource.resource_type === 'grain') {
      balance.grain = amount
      balance.food = amount  // 同时设置 food 字段保持向后兼容
    } else if (resource.resource_type in balance) {
      balance[resource.resource_type as keyof ResourceBalance] = amount
    }
  })
  
  return balance
}

/**
 * 格式化资源统计到余额（从新接口响应）
 * @param stats - 资源统计数据
 * @returns 格式化后的资源余额对象
 */
export function formatResourceStatsToBalance(stats: any): ResourceBalance {
  const balance: ResourceBalance = {
    wood: 0,
    iron: 0,
    stone: 0,
    yld: 0,
    grain: 0,
    seed: 0,
    brick: 0
  }
  
  if (stats?.resources) {
    Object.entries(stats.resources).forEach(([key, resource]: [string, any]) => {
      const amount = parseFloat(resource.available ?? resource.amount ?? '0')
      
      // 特别处理粮食字段（food/grain 兼容性处理）
      if (key === 'food' || key === 'grain') {
        balance.grain = amount
        balance.food = amount  // 同时设置 food 字段保持向后兼容
      } else if (key in balance) {
        balance[key as keyof ResourceBalance] = amount
      }
    })
  }
  
  // 如果有钱包数据，添加 YLD
  if (stats?.wallet?.yld_balance !== undefined) {
    balance.yld = parseFloat(stats.wallet.yld_balance)
  }
  
  return balance
}
