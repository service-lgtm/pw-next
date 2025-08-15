// src/lib/api/production.ts
// 挖矿生产系统 API - 修复版本
//
// 文件说明：
// 1. 本文件包含所有挖矿生产相关的 API 接口
// 2. 包括自主挖矿、招募挖矿、打工挖矿、合成系统等
// 3. 使用 JWT 认证，自动处理 token
// 4. 修复了资源统计接口，新增 getResourceStats 方法
//
// 关联文件：
// - src/lib/api/index.ts: 基础请求函数和认证管理
// - src/types/production.ts: 生产系统类型定义
// - src/hooks/useProduction.ts: 生产系统 Hook
// - backend/production/urls.py: 后端路由定义
// - backend/production/views.py: 后端视图，包含 ResourceStatsView
//
// 更新历史：
// - 2024-01: 添加 getResourceStats 接口，对应后端 /production/resources/stats/

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
          total_output?: number
          total_hours?: number
          auto_collected?: number
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

    // 获取资源统计（增强版）- 新增
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
  },

  // ==================== 统计与分析 ====================
  stats: {
    // 获取生产统计
    getProductionStats: () =>
      request<ProductionStatsResponse>('/production/stats/'),

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
      }>('/production/records/', { params }),

    // 检查粮食状态
    checkFoodStatus: () =>
      request<{
        success: boolean
        data: {
          current_food: number
          consumption_rate: number
          hours_sustainable: number
          warning: boolean
          warning_message?: string
          active_sessions_count: number
        }
      }>('/production/food-status/'),
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
      }>('/production/lands/available/', { params }),

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
      }>(`/production/lands/${landId}/mining-info/`),

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
      }>('/production/lands/mine/'),
  },
}

// ==================== 辅助函数 ====================

/**
 * 格式化资源返回数据为 ResourceBalance
 * 用于将后端返回的资源数组转换为前端使用的对象格式
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

/**
 * 从资源统计数据中提取 ResourceBalance
 * 用于新的统计接口返回数据的转换
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
      if (key in balance) {
        balance[key as keyof ResourceBalance] = resource.available || resource.amount || 0
      }
    })
  }

  // 加上钱包中的 YLD
  if (stats?.wallet?.yld_balance) {
    balance.yld += stats.wallet.yld_balance
  }

  return balance
}
