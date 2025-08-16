// src/types/production.ts
// 挖矿生产系统类型定义 - 完整生产版本
//
// 文件说明：
// 1. 本文件包含所有挖矿生产相关的类型定义
// 2. 包括工具、资源、挖矿会话等核心数据结构
// 3. 与后端 API 返回的数据结构保持一致
// 4. 处理了字段兼容性问题（如 total_output vs accumulated_output）
//
// 关联文件：
// - src/lib/api/production.ts: 生产系统 API 接口调用
// - src/hooks/useProduction.ts: 生产系统 React Hook
// - src/app/mining/page.tsx: 挖矿页面主组件
// - src/app/mining/MiningSessions.tsx: 挖矿会话管理组件
// - backend/production/models.py: 后端数据模型
// - backend/production/serializers.py: 后端序列化器
//
// 更新历史：
// - 2024-12: 添加字段兼容性处理
// - 2024-12: 完善错误类型定义
// - 2024-12: 添加详细注释说明

// ==================== 工具相关类型 ====================

/**
 * 工具数据结构
 * 对应后端 Tool 模型
 */
export interface Tool {
  id: number
  tool_id: string  // 工具编号，格式：GT-20251212-00000001
  tool_type: 'pickaxe' | 'axe' | 'hoe'  // 工具类型：镐头、斧头、锄头
  tool_type_display: string  // 工具类型显示名称
  owner: number  // 所有者ID
  owner_username: string  // 所有者用户名
  
  // 耐久度相关 - 注意兼容性
  durability?: number  // 当前耐久度（旧字段）
  current_durability?: number  // 当前耐久度（新字段）
  max_durability: number  // 最大耐久度（默认1500）
  
  // 状态相关
  status: 'normal' | 'damaged' | 'repairing' | 'idle' | 'working'  // 状态（注意兼容多种值）
  status_display: string  // 状态显示文本
  is_in_use?: boolean  // 是否使用中
  
  // 效率相关
  efficiency_rate?: number  // 效率率（0-100）
  
  // 时间戳
  created_at: string
  last_used_at?: string | null
  updated_at?: string
  
  // 扩展数据
  metadata?: Record<string, any>
}

// ==================== 资源相关类型 ====================

/**
 * 用户资源数据结构
 * 对应后端 UserResource 模型
 */
export interface UserResource {
  id?: number
  user: number
  resource_type: 'wood' | 'iron' | 'stone' | 'yld' | 'grain' | 'food' | 'seed' | 'brick'
  resource_type_display?: string  // 资源类型显示名称
  amount: string  // 总数量
  frozen_amount: string  // 冻结数量
  available_amount: string  // 可用数量
  total_produced?: string  // 累计生产
  total_consumed?: string  // 累计消耗
  updated_at: string
}

/**
 * 资源余额简化结构
 * 用于前端快速访问
 */
export interface ResourceBalance {
  wood: number
  iron: number
  stone: number
  yld: number
  grain: number  // 粮食（兼容 food）
  food?: number  // 粮食（别名）
  seed: number
  brick: number
}

// ==================== 挖矿会话相关类型 ====================

/**
 * 挖矿会话数据结构
 * 对应后端 ProductionSession 模型
 * 注意：处理了多个字段的兼容性问题
 */
export interface MiningSession {
  id: number
  session_id: string  // 会话唯一标识
  
  // 用户相关
  user: number
  user_username?: string
  
  // 土地相关
  land: number
  land_info?: {
    land_id: string
    land_type: string
    land_type_display?: string
    region_name?: string
    region?: string  // 兼容不同的字段名
    daily_output?: number
  }
  
  // 挖矿类型
  mining_type?: 'SELF_MINING' | 'WORK_WITH_TOOLS' | 'WORK_WITHOUT_TOOLS'  // 新格式
  type?: 'self' | 'hired_with_tool' | 'hired_without_tool'  // 旧格式
  mining_type_display?: string
  
  // 状态相关
  status: 'active' | 'paused' | 'completed' | 'stopped'
  status_display?: string
  
  // 产出相关 - 重要：处理字段兼容性
  output_rate: string  // 产出速率/小时
  total_output?: string  // 总产出（某些接口返回）
  accumulated_output?: string  // 累积产出（某些接口返回）
  current_output?: number  // 当前可收取产出
  
  // 资源类型
  resource_type?: string  // 产出的资源类型
  
  // 税收相关
  tax_rate?: string | number  // 税率
  accumulated_tax?: string  // 累积税收
  user_share_rate?: string  // 用户分成比例
  
  // 时间相关
  started_at?: string  // 开始时间（新字段）
  start_time?: string  // 开始时间（旧字段）
  ended_at?: string | null  // 结束时间（新字段）
  end_time?: string | null  // 结束时间（旧字段）
  last_settlement_time?: string | null  // 最后结算时间
  total_hours?: string  // 总工作小时数
  
  // 工具相关
  tools?: Array<{
    id: number
    tool_id: string
    tool_type: string
    durability?: number
    current_durability?: number
  }>
  
  // 元数据 - 包含各种额外信息
  metadata?: {
    tool_count?: number  // 工具数量
    my_tools?: number  // 我的工具数量
    borrowed_tools?: number  // 借用的工具数量
    food_consumption_rate?: number  // 粮食消耗率
    tax_rate?: number  // 税率
    owner_rate?: number  // 土地主收益率
    worker_rate?: number  // 工人收益率
    [key: string]: any
  }
  
  // 粮食相关
  grain_consumption_rate?: string  // 粮食消耗速率
  food_consumption_rate?: number  // 粮食消耗速率（数字）
  is_grain_sufficient?: boolean  // 粮食是否充足
  current_food?: number  // 当前粮食数量
  hours_sustainable?: number  // 可持续小时数
}

// ==================== 合成相关类型 ====================

/**
 * 合成配方数据结构
 */
export interface SynthesisRecipe {
  tool_type: 'pickaxe' | 'axe' | 'hoe' | 'brick'
  name: string  // 显示名称
  icon?: string  // 图标
  materials: {
    iron?: number  // 铁矿数量/比例
    wood?: number  // 木头数量/比例
    stone?: number  // 石头数量/比例
    yld?: number  // YLD消耗
  }
  output_quantity?: number  // 产出数量
  success_rate?: number  // 成功率
  durability?: number  // 工具耐久度
  description?: string  // 描述
  can_synthesize?: boolean  // 是否可以合成
}

// ==================== API 请求类型 ====================

/**
 * 开始自主挖矿请求
 */
export interface StartSelfMiningRequest {
  land_id: number
  tool_ids: number[]
}

/**
 * 添加工具到挖矿请求
 */
export interface AddToolToMiningRequest {
  session_id: number
  tool_ids: number[]  // 支持批量添加
}

/**
 * 从挖矿移除工具请求
 */
export interface RemoveToolFromMiningRequest {
  session_id: number
  tool_ids: number[]  // 支持批量移除
}

/**
 * 存入工具供招募请求
 */
export interface DepositToolsRequest {
  land_id: number
  tool_ids: number[]
}

/**
 * 带工具打工请求
 */
export interface StartHiredMiningWithToolRequest {
  land_id: number
  tool_ids: number[]
}

/**
 * 无工具打工请求
 */
export interface StartHiredMiningWithoutToolRequest {
  land_id: number
  tool_count?: number  // 要借用的工具数量
}

/**
 * 合成工具请求
 */
export interface SynthesizeToolRequest {
  tool_type: 'pickaxe' | 'axe' | 'hoe'
  quantity: number  // 1-10
}

/**
 * 合成砖头请求
 */
export interface SynthesizeBrickRequest {
  quantity: number  // 批次数量，每批100个
}

/**
 * 收取产出请求
 */
export interface CollectOutputRequest {
  session_id: number
}

/**
 * 停止生产请求
 */
export interface StopProductionRequest {
  session_id: number
}

// ==================== API 响应类型 ====================

/**
 * 标准API响应格式
 */
export interface StandardResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
  code?: string
}

/**
 * 开始挖矿响应
 */
export interface StartMiningResponse extends StandardResponse {
  data: {
    session_id: string  // 会话ID
    session_pk?: number  // 会话主键
    output_rate: number  // 产出速率
    resource_type: string  // 资源类型
    tool_count: number  // 工具数量
    food_consumption_rate: number  // 粮食消耗率
    current_food?: number  // 当前粮食
    hours_sustainable?: number  // 可持续小时数
    warning?: string  // 警告信息（如粮食不足）
    session?: MiningSession  // 完整的会话信息
  }
}

/**
 * 添加工具响应
 */
export interface AddToolResponse extends StandardResponse {
  data: {
    session: MiningSession
    new_output_rate: string
    added_tools: number
  }
}

/**
 * 移除工具响应
 */
export interface RemoveToolResponse extends StandardResponse {
  data: {
    tool_id: string
    durability_consumed: number
    remaining_durability: number
    removed_tools: number
  }
}

/**
 * 合成响应
 */
export interface SynthesisResponse extends StandardResponse {
  data: {
    status: 'success' | 'failed'
    tools?: Tool[]  // 合成的工具列表
    items_created?: Array<{
      id: number
      item_id: string
      item_type: string
    }>
    quantity?: number  // 合成数量
    tool_type?: string  // 工具类型
    tool_display?: string  // 显示名称
    materials_consumed: {
      wood?: number
      iron?: number
      stone?: number
      yld?: number
    }
    yld_consumed?: number  // YLD消耗
    message?: string  // 额外消息
  }
}

/**
 * 收取产出响应
 */
export interface CollectOutputResponse extends StandardResponse {
  data: {
    hours_collected: number  // 收取的小时数
    total_hours_worked: number  // 总工作小时数
    resource_type: string  // 资源类型
    gross_output: number  // 毛产出
    tax_amount: number  // 税收
    net_output: number  // 净产出
    food_consumed: number  // 消耗的粮食
    tool_durability_consumed: number  // 消耗的耐久度
    session_active: boolean  // 会话是否仍活跃
    balance_before: number  // 收取前余额
    balance_after: number  // 收取后余额
    collected_amount?: number  // 收取的数量（简化字段）
    new_balance?: number  // 新余额（简化字段）
  }
}

/**
 * 停止生产响应
 */
export interface StopProductionResponse extends StandardResponse {
  data: {
    session_id: string
    resource_type: string
    time_worked: {
      actual_hours: number  // 实际工作时间
      actual_minutes: number  // 实际工作分钟
      charge_hours: number  // 收费小时数（向上取整）
      total_hours: number  // 总小时数
    }
    total_output: number  // 总产出
    tools_released: number  // 释放的工具数
    final_collection?: {  // 最终收取
      collected: boolean
      gross_output: number
      tax_amount: number
      net_output: number
    }
    charges?: {  // 扣费信息
      food: {
        charged: number  // 应扣粮食
        actual: number  // 实扣粮食
        shortage?: number  // 粮食不足
      }
      durability: {
        charged: number  // 扣除的耐久度
        tools_damaged: number  // 损坏的工具数
      }
    }
    land?: {  // 土地信息
      land_id: string
      land_type: string
      accumulated_output: number
    }
    warnings?: string[]  // 警告信息
    auto_collected?: number  // 自动收取的数量
  }
}

/**
 * 生产统计响应
 */
export interface ProductionStatsResponse extends StandardResponse {
  data: {
    active_sessions: {
      count: number
      by_resource: {
        [key: string]: {
          count: number
          hourly_output: number
        }
      }
      total_hourly_output: number
      total_food_consumption: number
    }
    history: {
      total_produced: number
      total_tax_paid: number
      total_hours_worked: number
      total_energy_consumed: number
      total_durability_consumed: number
    }
    resources: {
      [key: string]: {
        display_name: string
        current_amount: number
        available_amount: number
        frozen_amount: number
        total_produced: number
        total_consumed: number
      }
    }
    tools: {
      total: number
      in_use: number
      idle: number
      damaged: number
    }
  }
}

// ==================== 列表响应类型 ====================

/**
 * 分页响应基础结构
 */
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
  stats?: any  // 统计信息
}

/**
 * 挖矿会话列表响应
 */
export interface MiningSessionListResponse extends PaginatedResponse<MiningSession> {
  active_stats?: {
    count: number
    total_hourly_output: number
    total_food_consumption: number
  }
  stats?: {
    total_sessions: number
    active_sessions: number
    total_output: number
    total_tax: number
  }
}

/**
 * 工具列表响应
 */
export interface ToolListResponse extends PaginatedResponse<Tool> {
  stats?: {
    total_count?: number
    total_tools?: number  // 兼容不同字段名
    by_type?: {
      pickaxe: { count: number; display_name: string; in_use: number; damaged: number; avg_durability: number }
      axe: { count: number; display_name: string; in_use: number; damaged: number; avg_durability: number }
      hoe: { count: number; display_name: string; in_use: number; damaged: number; avg_durability: number }
    }
    by_status?: {
      normal?: number
      idle?: number  // 兼容旧状态
      working?: number  // 兼容旧状态
      damaged?: number
      repairing?: number
    }
    in_use_count?: number
    idle_count?: number
  }
}

// ==================== 错误相关类型 ====================

/**
 * API错误响应
 */
export interface ApiErrorResponse {
  success: false
  message: string
  data?: {
    current_food?: number
    food_needed?: number
    shortage?: number
    consumption_per_hour?: number
    tip?: string
    time_worked?: string
    collected_hours?: number
    next_collection_hour?: number
    minutes_to_wait?: number
    next_collection_time?: string
    [key: string]: any
  }
  error?: string
  code?: string
  details?: any
}

// ==================== 辅助函数 ====================

/**
 * 获取会话的总产出（处理字段兼容性）
 */
export function getSessionTotalOutput(session: MiningSession): number {
  const output = session.total_output || session.accumulated_output || '0'
  return typeof output === 'string' ? parseFloat(output) : output
}

/**
 * 获取会话的开始时间（处理字段兼容性）
 */
export function getSessionStartTime(session: MiningSession): string {
  return session.started_at || session.start_time || ''
}

/**
 * 获取会话的结束时间（处理字段兼容性）
 */
export function getSessionEndTime(session: MiningSession): string | null {
  return session.ended_at || session.end_time || null
}

/**
 * 获取工具的当前耐久度（处理字段兼容性）
 */
export function getToolDurability(tool: Tool): number {
  return tool.current_durability ?? tool.durability ?? 0
}

/**
 * 判断工具是否可用
 */
export function isToolAvailable(tool: Tool): boolean {
  const status = tool.status
  return (status === 'normal' || status === 'idle') && !tool.is_in_use
}

/**
 * 获取会话的工具数量
 */
export function getSessionToolCount(session: MiningSession): number {
  if (session.metadata?.tool_count !== undefined) {
    return session.metadata.tool_count
  }
  if (session.metadata?.my_tools !== undefined) {
    return session.metadata.my_tools
  }
  if (session.tools && Array.isArray(session.tools)) {
    return session.tools.length
  }
  return 0
}

/**
 * 获取会话的粮食消耗率
 */
export function getSessionFoodConsumption(session: MiningSession): number {
  if (session.metadata?.food_consumption_rate !== undefined) {
    return session.metadata.food_consumption_rate
  }
  if (session.food_consumption_rate !== undefined) {
    return session.food_consumption_rate
  }
  if (session.grain_consumption_rate) {
    return parseFloat(session.grain_consumption_rate)
  }
  // 默认每个工具消耗2粮食/小时
  return getSessionToolCount(session) * 2
}
