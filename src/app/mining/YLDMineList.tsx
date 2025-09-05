/**
 * ===========================================
 * 文件创建/修改说明 (AI协作标记)
 * ===========================================
 * 修改原因: 修复储量显示逻辑、生产状态兼容性和UI问题
 * 主要功能: 显示用户的所有矿山列表（包括YLD矿山和其他资源矿山）
 * 依赖关系: 
 * - 使用 @/types/assets 中的 MineLand 类型
 * - 被 @/app/mining/page.tsx 调用
 * 
 * 主要逻辑流程:
 * 1. 从API获取矿山数据
 * 2. 根据矿山类型处理不同的储量字段
 * 3. 显示矿山卡片和统计信息
 * 
 * ⚠️ 重要提醒给下一个AI:
 * - YLD矿山的储量逻辑特殊，需要区分converted和普通类型
 * - resource_reserves字段只对非YLD矿山有效
 * - 保持向后兼容，支持旧的数据结构
 * - 不使用backdrop-blur避免兼容性问题
 * 
 * 最后修改: 2025-01-30 - 修复生产状态判断和UI兼容性
 * ===========================================
 */

// src/app/mining/YLDMineList.tsx
// YLD 矿山列表组件 - 卡片收集式设计
// 
// 文件说明：
// 优化后的矿山列表，采用卡片收集式设计，简化信息展示，优化移动端体验
// 
// 修改历史：
// - 2025-01-19: 支持新的矿山 API 结构
// - 2025-01-29: 全新卡片收集式设计
// - 2025-01-30: 修复储量显示和生产状态兼容性
//   * 修复YLD矿山储量显示逻辑
//   * 支持resource_reserves字段
//   * 修复is_producing状态判断
//   * 移除backdrop-blur避免兼容性问题
//   * 移除详情按钮简化操作
// 
// 关联文件：
// - 被 @/app/mining/page.tsx 使用
// - 使用 @/types/assets 中的 MineLand 类型
// - 使用 @/components/shared 中的组件

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { cn } from '@/lib/utils'
import type { YLDMine, MineLand } from '@/types/assets'
import toast from 'react-hot-toast'

interface YLDMineListProps {
  mines: (YLDMine | MineLand)[] | null
  loading: boolean
  error: string | null
  onViewDetail: (mine: YLDMine | MineLand) => void
  onRefresh: () => void
  onStartProduction?: (mineId: number) => void
  onSwitchToSessions?: () => void
}

// ==================== 配置 ====================

// 矿山类型配置
const MINE_TYPES = {
  'yld_mine': {
    label: 'YLD矿山',
    icon: '💎',
    gradient: 'from-purple-600 to-purple-500',
    bgColor: 'bg-purple-900/20',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
    accentColor: 'purple'
  },
  'yld_converted': {
    label: 'YLD转换矿山',
    icon: '💎',
    gradient: 'from-purple-700 to-purple-600',
    bgColor: 'bg-purple-900/30',
    borderColor: 'border-purple-600/40',
    textColor: 'text-purple-500',
    accentColor: 'purple'
  },
  'iron_mine': {
    label: '铁矿',
    icon: '⛏️',
    gradient: 'from-gray-600 to-gray-500',
    bgColor: 'bg-gray-900/20',
    borderColor: 'border-gray-500/30',
    textColor: 'text-gray-400',
    accentColor: 'gray'
  },
  'stone_mine': {
    label: '石矿',
    icon: '🪨',
    gradient: 'from-blue-600 to-blue-500',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    accentColor: 'blue'
  },
  'forest': {
    label: '森林',
    icon: '🌲',
    gradient: 'from-green-600 to-green-500',
    bgColor: 'bg-green-900/20',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-400',
    accentColor: 'green'
  },
  'farm': {
    label: '农场',
    icon: '🌾',
    gradient: 'from-yellow-600 to-yellow-500',
    bgColor: 'bg-yellow-900/20',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-400',
    accentColor: 'yellow'
  }
}

// ==================== 工具函数 ====================

/**
 * 获取矿山类型
 * 增强版：区分YLD转换矿山和普通YLD矿山
 */
function getMineType(mine: YLDMine | MineLand | any): string {
  // 优先检查special_type
  if (mine.special_type === 'yld_converted') {
    return 'yld_converted'
  }
  
  // 检查mine_type字段（新API返回）
  if (mine.mine_type) {
    return mine.mine_type
  }
  
  // 检查blueprint_info
  if (mine.blueprint_info?.land_type) {
    return mine.blueprint_info.land_type
  }
  
  // 检查land_type
  if (mine.land_type) {
    return mine.land_type
  }
  
  // 默认返回YLD矿山
  return 'yld_mine'
}

/**
 * 获取剩余储量
 * 支持所有矿山类型，包括新的API字段
 */
function getRemainingReserves(mine: YLDMine | MineLand | any): number {
  // 1. 优先使用remaining_reserves字段（新API）
  if (mine.remaining_reserves !== undefined && mine.remaining_reserves !== null) {
    return typeof mine.remaining_reserves === 'string' 
      ? parseFloat(mine.remaining_reserves) 
      : mine.remaining_reserves
  }
  
  // 2. 对于非YLD矿山，使用resource_reserves
  const mineType = getMineType(mine)
  if (!['yld_mine', 'yld_converted'].includes(mineType)) {
    if (mine.resource_reserves !== undefined && mine.resource_reserves !== null) {
      const reserves = typeof mine.resource_reserves === 'string' 
        ? parseFloat(mine.resource_reserves) 
        : mine.resource_reserves
      return isNaN(reserves) ? 0 : reserves
    }
  }
  
  // 3. 对于YLD转换矿山，计算剩余储量
  if (mine.special_type === 'yld_converted' || mine.mine_type === 'yld_converted') {
    const initial = parseFloat(mine.initial_price || '0')
    const accumulated = parseFloat(mine.accumulated_output || '0')
    return initial - accumulated
  }
  
  // 4. 对于普通YLD矿山，从metadata获取
  if (mineType === 'yld_mine') {
    if (mine.metadata?.yld_reserves !== undefined) {
      return parseFloat(mine.metadata.yld_reserves)
    }
    if (mine.metadata?.remaining_reserves !== undefined) {
      return parseFloat(mine.metadata.remaining_reserves)
    }
  }
  
  // 5. 使用yld_capacity字段（向后兼容）
  if (mine.yld_capacity !== undefined) {
    return typeof mine.yld_capacity === 'string' 
      ? parseFloat(mine.yld_capacity) 
      : mine.yld_capacity
  }
  
  return 0
}

/**
 * 获取初始储量
 * 支持所有矿山类型
 * 修复：对于YLD矿山，如果没有初始储量数据，使用当前initial_price
 */
function getInitialReserves(mine: YLDMine | MineLand | any): number {
  // 1. 使用initial_reserves_display（新API）
  if (mine.initial_reserves_display !== undefined && mine.initial_reserves_display !== null) {
    return typeof mine.initial_reserves_display === 'string' 
      ? parseFloat(mine.initial_reserves_display) 
      : mine.initial_reserves_display
  }
  
  // 2. 使用initial_reserves字段
  if (mine.initial_reserves !== undefined && mine.initial_reserves !== null) {
    const reserves = typeof mine.initial_reserves === 'string' 
      ? parseFloat(mine.initial_reserves) 
      : mine.initial_reserves
    if (!isNaN(reserves) && reserves > 0) {
      return reserves
    }
  }
  
  // 3. 对于YLD转换矿山，使用initial_price
  if (mine.special_type === 'yld_converted' || mine.mine_type === 'yld_converted') {
    return parseFloat(mine.initial_price || '0')
  }
  
  // 4. 对于普通YLD矿山
  const mineType = getMineType(mine)
  if (mineType === 'yld_mine') {
    // 从metadata获取
    if (mine.metadata?.initial_reserves !== undefined) {
      return parseFloat(mine.metadata.initial_reserves)
    }
    if (mine.metadata?.yld_capacity !== undefined) {
      return parseFloat(mine.metadata.yld_capacity)
    }
    // 使用initial_price作为后备（对于YLD矿山，这通常是初始储量）
    if (mine.initial_price) {
      return parseFloat(mine.initial_price)
    }
  }
  
  // 5. 对于其他矿山，initial_price可能代表不同的含义
  // 返回0以避免误导
  return 0
}

/**
 * 格式化数字
 */
function formatAmount(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '0'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'
  
  // 大数字简化显示
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toFixed(1)
}

/**
 * 计算产出效率（百分比）
 */
function calculateEfficiency(mine: YLDMine | MineLand | any): number {
  const initial = getInitialReserves(mine)
  const remaining = getRemainingReserves(mine)
  
  if (initial === 0) return 0
  
  // 使用reserves_percentage字段（如果存在）
  if (mine.reserves_percentage !== undefined && mine.reserves_percentage !== null) {
    return mine.reserves_percentage
  }
  
  // 计算剩余百分比
  return Math.min((remaining / initial) * 100, 100)
}

/**
 * 检查是否正在生产
 * 重要：检查多个可能的情况
 */
function isProducing(mine: YLDMine | MineLand | any): boolean {
  // 1. 明确的生产状态字段
  if (mine.is_producing === true) return true
  if (mine.isProducing === true) return true
  if (mine.production_status === 'active') return true
  if (mine.status === 'producing') return true
  
  // 2. 根据累计产出判断（如果有产出且储量未耗尽，可能在生产）
  // 注意：这个判断不够准确，因为可能是历史产出
  // 但在某些情况下可以作为补充判断
  const accumulated = parseFloat(mine.accumulated_output || '0')
  const remaining = getRemainingReserves(mine)
  
  // 特殊处理：对于YLD转换矿山，如果有产出记录，可能表示正在生产
  // 但这需要结合其他信息判断，这里暂时不使用这个逻辑
  
  // 3. 默认返回false
  return false
}

// ==================== 子组件 ====================

/**
 * 矿山统计卡片
 */
const MineStatsCard = ({ 
  mines,
  onFilter
}: {
  mines: (YLDMine | MineLand | any)[]
  onFilter: (type: string) => void
}) => {
  const stats = useMemo(() => {
    const typeCount: Record<string, number> = {}
    let totalProducing = 0
    let totalOutput = 0
    let totalReserves = 0
    
    mines.forEach(mine => {
      const type = getMineType(mine)
      typeCount[type] = (typeCount[type] || 0) + 1
      if (isProducing(mine)) totalProducing++
      totalOutput += parseFloat(mine.accumulated_output || '0')
      totalReserves += getRemainingReserves(mine)
    })
    
    return { typeCount, totalProducing, totalOutput, totalReserves }
  }, [mines])
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-3 text-center">
        <p className="text-2xl font-bold text-white">{mines.length}</p>
        <p className="text-xs text-gray-400">总矿山</p>
      </div>
      <div className="bg-gradient-to-br from-green-900/50 to-gray-900 rounded-lg p-3 text-center">
        <p className="text-2xl font-bold text-green-400">{stats.totalProducing}</p>
        <p className="text-xs text-gray-400">生产中</p>
      </div>
      <div className="bg-gradient-to-br from-purple-900/50 to-gray-900 rounded-lg p-3 text-center">
        <p className="text-2xl font-bold text-purple-400">{formatAmount(stats.totalOutput)}</p>
        <p className="text-xs text-gray-400">总产出</p>
      </div>
      <div className="bg-gradient-to-br from-gold-900/50 to-gray-900 rounded-lg p-3 text-center">
        <p className="text-2xl font-bold text-gold-400">{formatAmount(stats.totalReserves)}</p>
        <p className="text-xs text-gray-400">总储量</p>
      </div>
    </div>
  )
}

/**
 * 矿山卡片组件 - 全新设计
 */
const MineCard = ({
  mine,
  onStart,
  onViewDetail,
  isMobile
}: {
  mine: YLDMine | MineLand | any
  onStart: () => void
  onViewDetail: () => void
  isMobile: boolean
}) => {
  const mineType = getMineType(mine)
  const config = MINE_TYPES[mineType as keyof typeof MINE_TYPES] || MINE_TYPES['yld_mine']
  const producing = isProducing(mine)
  const efficiency = calculateEfficiency(mine)
  
  // 关键数据
  const landId = mine.land_id || `矿山#${mine.id}`
  const remaining = getRemainingReserves(mine)
  const initial = getInitialReserves(mine)
  const accumulated = mine.accumulated_output || '0'
  
  // 显示储量信息的条件
  const showReserves = initial > 0 || remaining > 0
  
  // 调试：打印生产状态
  console.log(`[MineCard] ${landId} 生产状态:`, {
    is_producing: mine.is_producing,
    producing: producing,
    accumulated: accumulated,
    mine_type: mineType
  })
  
  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden transition-all duration-200",
        "hover:scale-[1.02] hover:shadow-xl",
        "bg-gradient-to-br from-gray-800 to-gray-900",
        "border-2",
        producing ? "border-green-500/50" : config.borderColor
      )}
      onClick={() => onViewDetail(mine)}
      style={{ cursor: 'pointer' }}
    >
      {/* 顶部彩条 */}
      <div className={cn("h-2 bg-gradient-to-r", config.gradient)} />
      
      {/* 生产状态标签 - 移除backdrop-blur */}
      {producing && (
        <div className="absolute top-4 right-4">
          <div className="bg-green-500/30 text-green-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            生产中
          </div>
        </div>
      )}
      
      {/* 主体内容 */}
      <div className="p-4">
        {/* 图标和标题 */}
        <div className="flex items-start gap-3 mb-3">
          <div className="text-4xl">{config.icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-sm truncate">
              {landId}
            </h3>
            <p className={cn("text-xs", config.textColor)}>
              {config.label}
            </p>
          </div>
        </div>
        
        {/* 核心数据 - 简化显示 */}
        <div className="space-y-2 mb-4">
          {/* 储量信息 */}
          {showReserves && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">剩余储量</span>
              <span className="text-sm font-bold text-white">
                {formatAmount(remaining)}
                {initial > 0 && (
                  <span className="text-xs text-gray-500 ml-1">
                    / {formatAmount(initial)}
                  </span>
                )}
              </span>
            </div>
          )}
          
          {/* 累计产出 */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">累计产出</span>
            <span className="text-sm font-bold text-green-400">
              {formatAmount(accumulated)}
            </span>
          </div>
          
          {/* 效率进度条 */}
          {showReserves && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">储量剩余</span>
                <span className="text-xs text-gray-400">{efficiency.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    "bg-gradient-to-r",
                    efficiency > 80 ? "from-green-600 to-green-500" :
                    efficiency > 50 ? "from-yellow-600 to-yellow-500" :
                    efficiency > 20 ? "from-orange-600 to-orange-500" :
                    "from-red-600 to-red-500"
                  )}
                  style={{ width: `${efficiency}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* 操作按钮 - 根据生产状态显示 */}
        <div className="flex gap-2">
          {producing ? (
            // 生产中状态 - 显示禁用的按钮
            <button
              className="flex-1 py-2 bg-gray-700/50 text-gray-400 rounded-lg text-sm font-bold cursor-not-allowed"
              disabled
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              生产中
            </button>
          ) : (
            // 未生产状态 - 显示开始挖矿按钮
            <button
              onClick={(e) => {
                e.stopPropagation()
                onStart()
              }}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                "bg-gradient-to-r",
                config.gradient,
                "text-white hover:shadow-lg active:scale-95"
              )}
            >
              开始挖矿
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * 空状态组件
 */
const EmptyState = ({ onRefresh }: { onRefresh: () => void }) => (
  <div className="text-center py-16">
    <div className="text-6xl mb-4">🏔️</div>
    <h3 className="text-lg font-bold text-white mb-2">还没有矿山</h3>
    <p className="text-sm text-gray-400 mb-6">
      获得矿山后就可以开始挖矿生产了
    </p>
    <PixelButton onClick={onRefresh} size="sm">
      刷新
    </PixelButton>
  </div>
)

/**
 * 加载状态组件
 */
const LoadingState = () => (
  <div className="text-center py-16">
    <div className="text-6xl mb-4 animate-pulse">⏳</div>
    <p className="text-gray-400">加载矿山数据...</p>
  </div>
)

/**
 * 错误状态组件
 */
const ErrorState = ({ error, onRefresh }: { error: string; onRefresh: () => void }) => (
  <div className="text-center py-16">
    <div className="text-6xl mb-4">❌</div>
    <p className="text-red-400 mb-4">{error}</p>
    <PixelButton onClick={onRefresh} size="sm">
      重新加载
    </PixelButton>
  </div>
)

// ==================== 主组件 ====================

export function YLDMineList({
  mines,
  loading,
  error,
  onViewDetail,
  onRefresh,
  onStartProduction,
  onSwitchToSessions
}: YLDMineListProps) {
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'default' | 'output' | 'status' | 'reserves'>('default')
  const [isMobile, setIsMobile] = useState(false)
  
  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // 筛选和排序矿山
  const displayMines = useMemo(() => {
    if (!mines) return []
    
    let filtered = [...mines]
    
    // 筛选
    if (filterType !== 'all') {
      filtered = filtered.filter(mine => {
        const mineType = getMineType(mine)
        return mineType === filterType
      })
    }
    
    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'output':
          return parseFloat(b.accumulated_output || '0') - parseFloat(a.accumulated_output || '0')
        case 'status':
          const aProducing = isProducing(a) ? 1 : 0
          const bProducing = isProducing(b) ? 1 : 0
          return bProducing - aProducing
        case 'reserves':
          return getRemainingReserves(b) - getRemainingReserves(a)
        default:
          // 默认：生产中的优先，然后按ID
          const aProducingDefault = isProducing(a) ? 1 : 0
          const bProducingDefault = isProducing(b) ? 1 : 0
          if (aProducingDefault !== bProducingDefault) {
            return bProducingDefault - aProducingDefault
          }
          return a.id - b.id
      }
    })
    
    return filtered
  }, [mines, filterType, sortBy])
  
  // 获取可用的矿山类型
  const availableTypes = useMemo(() => {
    if (!mines) return []
    const types = new Set<string>()
    mines.forEach(mine => {
      types.add(getMineType(mine))
    })
    return Array.from(types)
  }, [mines])
  
  // 处理开始生产
  const handleStartProduction = useCallback((mineId: number) => {
    if (onSwitchToSessions) {
      onSwitchToSessions()
      toast.success('已切换到挖矿会话')
    }
    if (onStartProduction) {
      onStartProduction(mineId)
    }
  }, [onSwitchToSessions, onStartProduction])
  
  // 渲染状态
  if (loading) return <LoadingState />
  if (error) return <ErrorState error={error} onRefresh={onRefresh} />
  if (!mines || mines.length === 0) return <EmptyState onRefresh={onRefresh} />
  
  return (
    <div className="space-y-4">
      {/* 统计概览 */}
      <MineStatsCard mines={mines} onFilter={setFilterType} />
      
      {/* 筛选和排序栏 */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        {/* 类型筛选 */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => setFilterType('all')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all",
              filterType === 'all'
                ? "bg-gold-500 text-gray-900"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            )}
          >
            全部 ({mines.length})
          </button>
          {availableTypes.map(type => {
            const config = MINE_TYPES[type as keyof typeof MINE_TYPES]
            const count = mines.filter(m => getMineType(m) === type).length
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1",
                  filterType === type
                    ? "bg-gold-500 text-gray-900"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                )}
              >
                <span>{config?.icon}</span>
                <span>{config?.label} ({count})</span>
              </button>
            )
          })}
        </div>
        
        {/* 排序选项 */}
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg border border-gray-700 focus:border-gold-500 focus:outline-none"
          >
            <option value="default">默认排序</option>
            <option value="output">按产出排序</option>
            <option value="status">按状态排序</option>
            <option value="reserves">按储量排序</option>
          </select>
          <PixelButton size="xs" variant="secondary" onClick={onRefresh}>
            🔄 刷新
          </PixelButton>
        </div>
      </div>
      
      {/* 矿山网格 */}
      <div className={cn(
        "grid gap-3",
        isMobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      )}>
        {displayMines.map((mine) => (
          <MineCard
            key={mine.id}
            mine={mine}
            onStart={() => handleStartProduction(mine.id)}
            onViewDetail={() => onViewDetail(mine)}
            isMobile={isMobile}
          />
        ))}
      </div>
      
      {/* 筛选结果为空 */}
      {filterType !== 'all' && displayMines.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">
            没有找到{MINE_TYPES[filterType as keyof typeof MINE_TYPES]?.label}
          </p>
          <button
            onClick={() => setFilterType('all')}
            className="text-gold-500 hover:text-gold-400 text-sm mt-2"
          >
            查看全部矿山
          </button>
        </div>
      )}
    </div>
  )
}

export default YLDMineList
