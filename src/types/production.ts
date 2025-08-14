// src/types/production.ts
// 挖矿生产系统类型定义
//
// 文件说明：
// 1. 本文件包含所有挖矿生产相关的类型定义
// 2. 包括工具、资源、挖矿会话等
// 3. 与后端 API 返回的数据结构保持一致
//
// 关联文件：
// - src/lib/api/production.ts: 生产系统 API 接口
// - src/hooks/useProduction.ts: 生产系统 Hook
// - src/app/mining/page.tsx: 挖矿页面

// ==================== 工具相关类型 ====================

export interface Tool {
  id: number
  tool_id: string  // 工具编号，如 GT-20251212-00000001
  tool_type: 'pickaxe' | 'axe' | 'hoe'  // 镐头、斧头、锄头
  tool_type_display: string
  owner: number
  owner_username: string
  durability: number  // 当前耐久度
  max_durability: number  // 最大耐久度（1500）
  status: 'idle' | 'working' | 'damaged'  // 闲置、工作中、已损坏
  status_display: string
  created_at: string
  last_used_at: string | null
  metadata: Record<string, any>
}

// ==================== 资源相关类型 ====================

export interface UserResource {
  user: number
  resource_type: 'wood' | 'iron' | 'stone' | 'yld' | 'grain' | 'seed' | 'brick'
  amount: string  // 数量
  frozen_amount: string  // 冻结数量
  available_amount: string  // 可用数量
  updated_at: string
}

export interface ResourceBalance {
  wood: number
  iron: number
  stone: number
  yld: number
  grain: number
  seed: number
  brick: number
}

// ==================== 挖矿会话相关类型 ====================

export interface MiningSession {
  id: number
  session_id: string
  land: number
  land_info: {
    land_id: string
    land_type: string
    region_name: string
    daily_output: number
  }
  user: number
  user_username: string
  mining_type: 'self' | 'hired_with_tool' | 'hired_without_tool'  // 自主挖矿、带工具打工、无工具打工
  mining_type_display: string
  status: 'active' | 'paused' | 'completed'
  status_display: string
  output_rate: string  // 产出速率/小时
  tax_rate: string  // 税率
  user_share_rate: string  // 用户分成比例
  accumulated_output: string  // 累积产出
  accumulated_tax: string  // 累积税收
  start_time: string
  end_time: string | null
  last_settlement_time: string | null
  tools: Array<{
    id: number
    tool_id: string
    tool_type: string
    durability: number
  }>
  grain_consumption_rate: string  // 粮食消耗速率
  is_grain_sufficient: boolean  // 粮食是否充足
}

// ==================== 合成相关类型 ====================

export interface SynthesisRecipe {
  tool_type: 'pickaxe' | 'axe' | 'hoe' | 'brick'
  iron_ratio: number  // 铁矿比例
  wood_ratio: number  // 木头比例
  stone_ratio?: number  // 石头比例（仅砖头）
  yld_cost: number  // YLD消耗
  output_quantity: number  // 产出数量
  success_rate: number  // 成功率
  durability?: number  // 工具耐久度
}

// ==================== API 请求类型 ====================

// 开始自主挖矿
export interface StartSelfMiningRequest {
  land_id: number
  tool_ids: number[]
}

// 添加工具到挖矿
export interface AddToolToMiningRequest {
  session_id: number
  tool_id: number
}

// 从挖矿移除工具
export interface RemoveToolFromMiningRequest {
  session_id: number
  tool_id: number
}

// 存入工具供招募
export interface DepositToolsRequest {
  land_id: number
  tool_ids: number[]
}

// 带工具打工
export interface StartHiredMiningWithToolRequest {
  land_id: number
  tool_ids: number[]
}

// 无工具打工
export interface StartHiredMiningWithoutToolRequest {
  land_id: number
}

// 合成工具
export interface SynthesizeToolRequest {
  tool_type: 'pickaxe' | 'axe' | 'hoe'
  quantity: number
}

// 合成砖头
export interface SynthesizeBrickRequest {
  quantity: number  // 批次数量
}

// 收取产出
export interface CollectOutputRequest {
  session_id: number
}

// 停止生产
export interface StopProductionRequest {
  session_id: number
}

// ==================== API 响应类型 ====================

export interface StartMiningResponse {
  success: boolean
  message: string
  data: {
    session: MiningSession
    warning?: string  // 粮食不足警告等
  }
}

export interface AddToolResponse {
  success: boolean
  message: string
  data: {
    session: MiningSession
    new_output_rate: string
  }
}

export interface RemoveToolResponse {
  success: boolean
  message: string
  data: {
    tool_id: string
    durability_consumed: number
    remaining_durability: number
  }
}

export interface SynthesisResponse {
  success: boolean
  message: string
  data: {
    items_created: Array<{
      id: number
      item_id: string
      item_type: string
    }>
    resources_consumed: {
      wood?: number
      iron?: number
      stone?: number
      yld?: number
    }
  }
}

export interface CollectOutputResponse {
  success: boolean
  message: string
  data: {
    collected_amount: number
    resource_type: string
    new_balance: number
  }
}

export interface ProductionStatsResponse {
  success: boolean
  data: {
    active_sessions: number
    total_output_24h: number
    total_tax_24h: number
    resource_balance: ResourceBalance
    tool_stats: {
      total_tools: number
      idle_tools: number
      working_tools: number
      damaged_tools: number
    }
    grain_status: {
      current_amount: number
      consumption_rate: number
      hours_remaining: number
    }
  }
}

// ==================== 挖矿列表响应 ====================

export interface MiningSessionListResponse {
  count: number
  next: string | null
  previous: string | null
  results: MiningSession[]
  stats?: {
    total_sessions: number
    active_sessions: number
    total_output: number
    total_tax: number
  }
}

// ==================== 工具列表响应 ====================

export interface ToolListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Tool[]
  stats?: {
    total_tools: number
    by_type: {
      pickaxe: number
      axe: number
      hoe: number
    }
    by_status: {
      idle: number
      working: number
      damaged: number
    }
  }
}
