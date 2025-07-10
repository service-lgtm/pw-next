// src/types/assets.ts
// 资产相关类型定义 - 与API保持一致

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
  coordinate_x: number
  coordinate_y: number
  owner: number | null
  owner_username: string | null
  status: 'unowned' | 'owned' | 'locked' | 'frozen'
  status_display: string
  current_price: string
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
}
