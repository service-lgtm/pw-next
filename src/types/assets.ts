// src/types/assets.ts
// 资产相关类型定义 - 支持新的 API 结构
// 
// 文件说明：
// 1. 本文件包含所有资产相关的类型定义
// 2. 包括区域、土地蓝图、土地、YLD矿山等
// 3. 支持新的 API 结构（YLD转换矿山和普通矿山）
// 4. 保持向后兼容性
//
// 更新历史：
// - 2025-01-19: 更新支持新的矿山 API 结构
//   - 添加 MineLand 类型（所有可挖矿土地）
//   - 区分 YLD 转换矿山和普通 YLD 矿山
//   - 更新字段映射（yld_capacity, yld_reserves等）
//
// 关联文件：
// - src/lib/api/assets.ts: 资产相关的 API 接口
// - src/hooks/useLands.ts: 土地相关的 Hook
// - src/hooks/useYLDMines.ts: YLD矿山相关的 Hook
// - src/app/mining/page.tsx: 挖矿页面

export interface Region {
  id: number
  name: string
  code: string
  region_type: 'world' | 'continent' | 'country' | 'province' | 'city' | 'district' | 'area'
  parent: number | null
  parent_name: string | null
  level: number
  latitude: string | null
  longitude: string | null
  is_active: boolean
  is_open_for_sale: boolean
  total_lands: number
  available_lands: number
  children_count: number
  metadata: Record<string, any>
}

export interface LandBlueprint {
  id: number
  name: string
  code: string
  land_type: 'urban' | 'farm' | 'iron_mine' | 'stone_mine' | 'forest' | 'yld_mine'
  land_type_display: string
  size_sqm: number
  min_units: number
  max_units: number
  base_price: string
  price_increase_rate: string
  daily_output: string
  output_resource: string
  max_floors: number
  construction_cost_per_floor: string
  energy_consumption_rate: string
  tool_requirement: string
  is_active: boolean
  description: string
  features: string[]
}

export interface Land {
  id: number
  land_id: string
  blueprint_name: string
  land_type: string
  land_type_display: string
  size_sqm: number
  region_name: string
  region_id?: number
  coordinate_x: number
  coordinate_y: number
  owner: number | null
  owner_username: string | null
  status: 'unowned' | 'owned' | 'locked' | 'frozen'
  status_display: string
  current_price: string
  initial_price?: string
  transaction_count: number
  is_special: boolean
  created_at: string
}

export interface LandDetail extends Land {
  blueprint: LandBlueprint
  region: Region
  initial_price: string
  last_transaction_price: string
  total_transaction_volume: string
  owned_at: string | null
  last_transaction_at: string | null
  construction_level: number
  is_under_construction: boolean
  construction_started_at: string | null
  is_producing: boolean
  production_started_at: string | null
  accumulated_output: string
  is_rented: boolean
  tenant: number | null
  tenant_info: any
  rental_price: string | null
  special_type: string
  metadata: Record<string, any>
  recent_transactions: LandTransaction[]
  can_build: boolean
  can_produce: boolean
}

export interface LandTransaction {
  id: number
  land: number
  transaction_type: 'purchase' | 'sale' | 'transfer' | 'rent'
  transaction_type_display: string
  from_user: number | null
  from_username: string | null
  to_user: number | null
  to_username: string | null
  price: string
  fee: string
  wallet_transaction: number | null
  created_at: string
}

// ==================== 新的矿山类型定义 ====================

// 通用的可挖矿土地（包括所有类型的矿山）
export interface MineLand {
  id: number
  land_id: string
  blueprint_id: number
  blueprint_name: string
  blueprint_info?: LandBlueprint
  land_type: string  // 'yld_mine' | 'iron_mine' | 'stone_mine' | 'forest'
  land_type_display: string
  size_sqm: number
  region_id: number
  region_name: string
  region_info?: Region
  coordinate_x: number
  coordinate_y: number
  owner: number
  owner_username: string
  status: string
  status_display: string
  current_price: string
  initial_price?: string  // YLD转换矿山的储量在这里
  is_special: boolean
  special_type?: string  // 'yld_converted' 表示是转换来的
  is_producing: boolean
  production_started_at: string | null
  accumulated_output: string
  metadata: {
    batch_id?: string
    conversion_date?: string
    converted_at?: string  // 新API使用这个字段
    yld_amount?: string
    yld_reserves?: string  // 普通YLD矿山的储量在这里
    daily_output?: string
    [key: string]: any
  }
  created_at: string
  owned_at: string
}

// YLD 矿山（兼容旧版本）
export interface YLDMine extends MineLand {
  // YLD 储量的统一访问器（兼容两种类型）
  yld_capacity?: string | number  // 向后兼容字段

  // 批次信息（转换矿山特有）
  batch_id?: string
  converted_at?: string
}

// YLD 矿山详情
export interface YLDMineDetail extends YLDMine {
  blueprint: LandBlueprint
  region: Region
  transaction_count: number
  last_transaction_price: string
  total_transaction_volume: string
  last_transaction_at: string | null
  construction_level: number
  is_under_construction: boolean
  construction_started_at: string | null
  is_rented: boolean
  tenant: number | null
  tenant_info: any
  rental_price: string | null
  recent_transactions: LandTransaction[]
}

// 矿山统计信息
export interface MineStats {
  total_mines: number
  total_yld_capacity?: number  // YLD矿山特有
  total_accumulated_output: number
  producing_count: number
  by_type?: {
    [key: string]: {
      count: number
      producing: number
      total_output: number
    }
  }
  by_batch?: Array<{
    batch_id: string
    count: number
    total_yld: number
  }>
}

// YLD 矿山统计信息（向后兼容）
export interface YLDMineStats {
  total_stats: {
    total_mines: number
    total_yld_capacity: number
    total_users: number
    producing_count: number
  }
  batch_stats: Array<{
    batch_id: string
    created_at: string
    mines_count: number
    yld_converted: number
    users_processed: number
  }>
  top_users: Array<{
    user_id: number
    username: string
    mines_count: number
    total_yld: number
  }>
}

// 矿山列表响应
export interface MineListResponse extends PaginatedResponse<MineLand> {
  stats?: MineStats
}

// YLD 矿山列表响应（向后兼容）
export interface YLDMineListResponse extends PaginatedResponse<YLDMine> {
  stats: {
    total_mines: number
    total_yld_capacity: number
    total_accumulated_output: number
    producing_count: number
    by_batch: Array<{
      batch_id: string
      count: number
      total_yld: number
    }>
  },
  pre_stats?: MineStats
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
  stats?: Record<string, any>
}

export interface FilterState {
  land_type: string
  status: string
  priceRange: {
    min?: number
    max?: number
  }
  search: string
  ordering: string
  page: number
  page_size: number
  region_id?: number
}

// ==================== 辅助函数类型 ====================

// 获取 YLD 储量的辅助函数类型
export type GetYLDCapacity = (mine: MineLand | YLDMine) => number

// 判断是否为 YLD 矿山
export type IsYLDMine = (mine: MineLand) => boolean

// 判断是否为转换矿山
export type IsConvertedMine = (mine: MineLand) => boolean
