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

  // ==================== 粮食购买相关类型 ====================
export interface BuyFoodRequest {
  quantity: number
  payment_password?: string
}

export interface BuyFoodResponse {
  success: boolean
  message: string
  data: {
    quantity: number
    total_cost: number
    tdb_balance_before: number
    tdb_balance_after: number
    food_balance_before: number
    food_balance_after: number
    daily_purchased: number
    daily_remaining: number
    transaction_id: string
  }
}

export interface FoodPriceInfo {
  unit_price: number
  currency: string
  daily_limit: number
  user_purchased_today: number
  remaining_today: number
  next_reset_time: string
  can_buy: boolean
}

// 添加到 productionApi 对象中
export const productionApi = {
  // ... 现有接口 ...
  
  // ==================== 粮食购买 ====================
  food: {
    // 购买粮食
    buy: (data: BuyFoodRequest) =>
      request<BuyFoodResponse>('/production/buy-food/', {
        method: 'POST',
        body: data,
      }),
    
    // 获取粮食价格信息
    getPrice: () =>
      request<{
        success: boolean
        data: FoodPriceInfo
      }>('/production/food-price/'),
  },
}

// ========== src/hooks/useBuyFood.ts ==========
// 购买粮食 Hook

import { useState, useEffect, useCallback } from 'react'
import { productionApi } from '@/lib/api/production'
import type { FoodPriceInfo } from '@/lib/api/production'
import toast from 'react-hot-toast'

// 获取粮食价格信息
export function useFoodPrice() {
  const [priceInfo, setPriceInfo] = useState<FoodPriceInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPriceInfo = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await productionApi.food.getPrice()
      
      if (response.success && response.data) {
        setPriceInfo(response.data)
      }
    } catch (err) {
      console.error('[useFoodPrice] Error:', err)
      setError(err instanceof Error ? err.message : '获取价格失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPriceInfo()
  }, [fetchPriceInfo])

  return {
    priceInfo,
    loading,
    error,
    refetch: fetchPriceInfo
  }
}

// 购买粮食
export function useBuyFood() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buyFood = useCallback(async (quantity: number, paymentPassword?: string) => {
    if (quantity < 1) {
      toast.error('购买数量至少为1个')
      return null
    }

    if (quantity > 48) {
      toast.error('单次购买不能超过48个')
      return null
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await productionApi.food.buy({
        quantity,
        payment_password: paymentPassword
      })
      
      if (response.success) {
        toast.success(response.message || `成功购买${quantity}个粮食`)
        
        // 显示详细信息
        const data = response.data
        toast.success(
          `花费 ${data.total_cost} TDB，当前粮食：${data.food_balance_after}个`,
          { duration: 4000 }
        )
        
        // 如果达到每日限额，提醒
        if (data.daily_remaining === 0) {
          toast('今日购买额度已用完，明天0点重置', { 
            icon: '⏰',
            duration: 5000 
          })
        }
        
        return response.data
      } else {
        throw new Error(response.message || '购买失败')
      }
    } catch (err: any) {
      const message = err?.message || '购买失败'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    buyFood,
    loading,
    error
  }
}

// ========== 购买粮食组件示例 ==========
// src/components/production/BuyFoodModal.tsx

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useFoodPrice, useBuyFood } from '@/hooks/useBuyFood'
import { cn } from '@/lib/utils'

interface BuyFoodModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function BuyFoodModal({ isOpen, onClose, onSuccess }: BuyFoodModalProps) {
  const { priceInfo, loading: priceLoading, refetch: refetchPrice } = useFoodPrice()
  const { buyFood, loading: buying } = useBuyFood()
  
  const [quantity, setQuantity] = useState(10)
  const [paymentPassword, setPaymentPassword] = useState('')
  
  const totalCost = quantity * (priceInfo?.unit_price || 0.01)
  
  const handleBuy = async () => {
    const result = await buyFood(quantity, paymentPassword)
    
    if (result) {
      // 刷新价格信息（更新今日已购买数量）
      await refetchPrice()
      
      // 重置输入
      setQuantity(10)
      setPaymentPassword('')
      
      // 回调
      onSuccess?.()
      onClose()
    }
  }
  
  // 快速选择数量
  const quickAmounts = [1, 10, 20, 48]
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 标题 */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">购买粮食</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            {priceLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <p className="text-gray-400">加载价格信息...</p>
              </div>
            ) : priceInfo ? (
              <div className="space-y-4">
                {/* 价格信息 */}
                <PixelCard className="p-4 bg-gray-800/50">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">单价：</span>
                      <span className="font-bold">{priceInfo.unit_price} TDB/个</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">每日限购：</span>
                      <span>{priceInfo.daily_limit}个</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">今日已购：</span>
                      <span className={cn(
                        priceInfo.user_purchased_today >= priceInfo.daily_limit
                          ? "text-red-500"
                          : "text-green-500"
                      )}>
                        {priceInfo.user_purchased_today}/{priceInfo.daily_limit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">剩余额度：</span>
                      <span className="font-bold text-gold-500">
                        {priceInfo.remaining_today}个
                      </span>
                    </div>
                  </div>
                </PixelCard>
                
                {/* 购买数量 */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    购买数量
                  </label>
                  <div className="flex gap-2 mb-2">
                    {quickAmounts.map(amount => (
                      <button
                        key={amount}
                        onClick={() => setQuantity(Math.min(amount, priceInfo.remaining_today))}
                        disabled={amount > priceInfo.remaining_today}
                        className={cn(
                          "flex-1 py-2 rounded border transition-all",
                          amount === quantity
                            ? "bg-gold-500/20 border-gold-500 text-white"
                            : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white",
                          amount > priceInfo.remaining_today && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={priceInfo.remaining_today}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0
                      setQuantity(Math.min(Math.max(1, val), priceInfo.remaining_today))
                    }}
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 focus:border-gold-500 rounded outline-none"
                  />
                </div>
                
                {/* 支付密码（如果需要） */}
                {false && ( // 根据后端配置决定是否显示
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      支付密码
                    </label>
                    <input
                      type="password"
                      value={paymentPassword}
                      onChange={(e) => setPaymentPassword(e.target.value)}
                      placeholder="请输入支付密码"
                      className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 focus:border-gold-500 rounded outline-none"
                    />
                  </div>
                )}
                
                {/* 费用汇总 */}
                <PixelCard className="p-4 bg-green-500/10 border-green-500">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>数量：</span>
                      <span className="font-bold">{quantity}个</span>
                    </div>
                    <div className="flex justify-between">
                      <span>单价：</span>
                      <span>{priceInfo.unit_price} TDB</span>
                    </div>
                    <div className="border-t border-gray-700 pt-2 mt-2">
                      <div className="flex justify-between text-lg">
                        <span>总计：</span>
                        <span className="font-bold text-gold-500">
                          {totalCost.toFixed(2)} TDB
                        </span>
                      </div>
                    </div>
                  </div>
                </PixelCard>
                
                {/* 提示信息 */}
                {!priceInfo.can_buy && (
                  <div className="p-3 bg-red-500/10 border border-red-500 rounded">
                    <p className="text-sm text-red-400">
                      今日购买额度已用完，请明天再来
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      重置时间：{new Date(priceInfo.next_reset_time).toLocaleString()}
                    </p>
                  </div>
                )}
                
                {/* 操作按钮 */}
                <div className="flex gap-3">
                  <PixelButton
                    variant="secondary"
                    onClick={onClose}
                    className="flex-1"
                  >
                    取消
                  </PixelButton>
                  <PixelButton
                    onClick={handleBuy}
                    disabled={!priceInfo.can_buy || buying || quantity <= 0}
                    className="flex-1"
                  >
                    {buying ? '购买中...' : `确认购买 (${totalCost.toFixed(2)} TDB)`}
                  </PixelButton>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-red-500">加载价格信息失败</p>
                <PixelButton onClick={() => refetchPrice()} className="mt-4">
                  重试
                </PixelButton>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

  
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
