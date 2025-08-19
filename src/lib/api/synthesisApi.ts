// src/lib/api/synthesisApi.ts
// 合成系统专用 API 接口 - v2.0.0
//
// 文件说明：
// - 独立的合成系统 API 模块，从 production.ts 中分离出来
// - 专门处理工具合成、砖头合成、配方获取等功能
// - 基于最新的 API 文档（2024-12-26 v2.0.0）
//
// 关联文件：
// - src/hooks/useSynthesis.ts: 使用这些 API 的 React Hooks
// - src/app/mining/SynthesisSystem.tsx: 合成系统主组件
// - src/app/mining/ToolManagement.tsx: 工具管理组件
// - src/lib/api/index.ts: 基础 request 函数
//
// 创建时间：2024-12-26
// 最后更新：2024-12-26 - 适配新 API 响应格式

import { request } from '@/lib/api'

// API 基础路径
const API_PREFIX = '/production'

// ==================== 类型定义 ====================

// 合成工具请求
export interface SynthesizeToolRequest {
  tool_type: 'pickaxe' | 'axe' | 'hoe'
  quantity: number
}

// 合成砖头请求
export interface SynthesizeBrickRequest {
  quantity: number  // 批次数量
}

// 工具信息
export interface SynthesizedTool {
  tool_id: string
  tool_type: string
  quality: string
  max_durability: number
  current_durability: number
}

// 合成工具响应
export interface SynthesizeToolResponse {
  success: boolean
  message: string
  data: {
    tools: SynthesizedTool[]
    quantity: number
    tool_display: string
    consumed: {
      iron?: number
      wood?: number
      stone?: number
      yld?: number
    }
    remaining: {
      iron?: number
      wood?: number
      stone?: number
      yld?: number
    }
    recipe_per_tool: {
      iron?: number
      wood?: number
      stone?: number
      yld?: number
    }
  }
}

// 合成砖头响应
export interface SynthesizeBrickResponse {
  success: boolean
  message: string
  data: {
    batches: number
    consumed: {
      stone: number
      wood: number
      yld: number
    }
    produced: {
      bricks: number
    }
    current_balance: {
      stone: number
      wood: number
      yld: number
      bricks: number
    }
  }
}

// 单个配方信息
export interface RecipeInfo {
  name: string
  materials: {
    iron?: number
    wood?: number
    stone?: number
  }
  yld_cost: number
  durability?: number
  output_per_batch?: number
  usage?: string
  description?: string
  price_info?: {
    tool_price?: number
    iron_price?: number
    wood_price?: number
    stone_price?: number
    yld_price?: number
  }
  max_synthesizable?: number
  can_synthesize?: boolean
}

// 合成配方响应
export interface SynthesisRecipesResponse {
  success: boolean
  data: {
    recipes: {
      pickaxe?: RecipeInfo
      axe?: RecipeInfo
      hoe?: RecipeInfo
      brick?: RecipeInfo
    }
    user_resources?: {
      iron?: number
      stone?: number
      wood?: number
      yld?: number
      brick?: number
    }
    material_prices?: {
      materials: {
        [key: string]: {
          name: string
          price: number
          unit: string
        }
      }
    }
  }
}

// 合成错误响应
export interface SynthesisErrorResponse {
  success: false
  message: string
  required?: {
    iron?: number
    wood?: number
    stone?: number
    yld?: number
  }
  current?: {
    iron?: number
    wood?: number
    stone?: number
    yld?: number
  }
  shortage?: {
    iron?: number
    wood?: number
    stone?: number
    yld?: number
  }
}

// ==================== API 接口 ====================

export const synthesisApi = {
  /**
   * 合成工具
   * POST /api/production/synthesis/tool/
   * 
   * @param data - 合成请求参数
   * @returns 合成结果，包含新工具信息和消耗的资源
   */
  synthesizeTool: async (data: SynthesizeToolRequest): Promise<SynthesizeToolResponse> => {
    try {
      const response = await request<SynthesizeToolResponse>(`${API_PREFIX}/synthesis/tool/`, {
        method: 'POST',
        body: data,
      })
      return response
    } catch (error: any) {
      // 如果是资源不足错误，返回详细信息
      if (error?.response?.status === 400) {
        throw error.response.data
      }
      throw error
    }
  },

  /**
   * 合成砖头
   * POST /api/production/synthesis/bricks/
   * 
   * @param data - 合成批次数量
   * @returns 合成结果，包含产出的砖头数量
   */
  synthesizeBricks: async (data: SynthesizeBrickRequest): Promise<SynthesizeBrickResponse> => {
    try {
      const response = await request<SynthesizeBrickResponse>(`${API_PREFIX}/synthesis/bricks/`, {
        method: 'POST',
        body: data,
      })
      return response
    } catch (error: any) {
      if (error?.response?.status === 400) {
        throw error.response.data
      }
      throw error
    }
  },

  /**
   * 获取合成配方
   * GET /api/production/synthesis/recipes/
   * 
   * @returns 所有合成配方和用户当前资源
   */
  getRecipes: async (): Promise<SynthesisRecipesResponse> => {
    const response = await request<SynthesisRecipesResponse>(`${API_PREFIX}/synthesis/recipes/`)
    return response
  },

  /**
   * 计算可合成数量（客户端辅助函数）
   * 
   * @param recipe - 配方信息
   * @param resources - 用户资源
   * @returns 可合成的最大数量
   */
  calculateMaxSynthesizable: (
    recipe: RecipeInfo, 
    resources: { iron?: number; wood?: number; stone?: number; yld?: number }
  ): number => {
    let maxCount = Infinity

    // 检查每种材料
    if (recipe.materials.iron && resources.iron !== undefined) {
      maxCount = Math.min(maxCount, Math.floor(resources.iron / recipe.materials.iron))
    }
    if (recipe.materials.wood && resources.wood !== undefined) {
      maxCount = Math.min(maxCount, Math.floor(resources.wood / recipe.materials.wood))
    }
    if (recipe.materials.stone && resources.stone !== undefined) {
      maxCount = Math.min(maxCount, Math.floor(resources.stone / recipe.materials.stone))
    }
    
    // 检查 YLD
    if (recipe.yld_cost && resources.yld !== undefined) {
      maxCount = Math.min(maxCount, Math.floor(resources.yld / recipe.yld_cost))
    }

    return maxCount === Infinity ? 0 : maxCount
  },

  /**
   * 验证合成请求（客户端预检查）
   * 
   * @param toolType - 工具类型
   * @param quantity - 数量
   * @param recipe - 配方信息
   * @param resources - 用户资源
   * @returns 验证结果
   */
  validateSynthesis: (
    toolType: string,
    quantity: number,
    recipe: RecipeInfo,
    resources: { iron?: number; wood?: number; stone?: number; yld?: number }
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (quantity <= 0) {
      errors.push('合成数量必须大于0')
    }

    // 检查材料是否足够
    const required = {
      iron: (recipe.materials.iron || 0) * quantity,
      wood: (recipe.materials.wood || 0) * quantity,
      stone: (recipe.materials.stone || 0) * quantity,
      yld: (recipe.yld_cost || 0) * quantity
    }

    if (required.iron > (resources.iron || 0)) {
      errors.push(`铁矿不足，需要 ${required.iron.toFixed(2)}，当前只有 ${(resources.iron || 0).toFixed(2)}`)
    }
    if (required.wood > (resources.wood || 0)) {
      errors.push(`木材不足，需要 ${required.wood.toFixed(2)}，当前只有 ${(resources.wood || 0).toFixed(2)}`)
    }
    if (required.stone > (resources.stone || 0)) {
      errors.push(`石材不足，需要 ${required.stone.toFixed(2)}，当前只有 ${(resources.stone || 0).toFixed(2)}`)
    }
    if (required.yld > (resources.yld || 0)) {
      errors.push(`YLD不足，需要 ${required.yld.toFixed(2)}，当前只有 ${(resources.yld || 0).toFixed(2)}`)
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// ==================== 工具类型映射 ====================

export const TOOL_TYPE_MAP = {
  pickaxe: '镐头',
  axe: '斧头',
  hoe: '锄头'
} as const

export const TOOL_USAGE_MAP = {
  pickaxe: '用于开采铁矿和石矿',
  axe: '用于采集木材',
  hoe: '用于农业生产'
} as const

// ==================== 导出默认对象 ====================

export default synthesisApi
