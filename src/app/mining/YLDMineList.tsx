// src/app/mining/YLDMineList.tsx
// YLD 矿山列表组件 - 支持新 API
// 
// 修复说明：
// 1. 修复了"开始生产（内测）"按钮在安卓手机上无法点击的问题
// 2. 使用 onTouchEnd 替代 onClick 确保移动端兼容性
// 3. 增加了按钮的点击区域
// 4. 优化了事件处理逻辑
// 5. 支持新的 API 数据结构
//
// 更新历史：
// - 2025-01-19: 支持新的矿山 API 结构
//   - 兼容 YLD 转换矿山和普通 YLD 矿山
//   - 使用 getYLDCapacity 辅助函数获取储量
//   - 支持显示所有类型的矿山（不仅仅是 YLD）
// - 2024-01: 修复安卓点击问题，优化触摸事件处理
//
// 关联文件：
// - 被 @/app/mining/page.tsx 使用
// - 使用 @/types/assets 中的 YLDMine 类型
// - 使用 @/components/shared 中的组件
// - 使用 ./BetaPasswordModal 进行密码验证
// - 使用 @/lib/api/assets 中的辅助函数

'use client'

import { useState, useEffect, useCallback } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { BetaPasswordModal, hasBetaAccess } from './BetaPasswordModal'
import { getYLDCapacity } from '@/lib/api/assets'
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

/**
 * 格式化 YLD 数量
 */
function formatYLD(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '0.0000'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0.0000'
  return num.toFixed(4)
}

/**
 * 格式化日期
 */
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '未知'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN')
  } catch {
    return '未知'
  }
}

/**
 * 获取矿山类型显示名称
 */
function getMineTypeDisplay(mine: YLDMine | MineLand): string {
  // 如果是 YLD 转换矿山
  if (mine.special_type === 'yld_converted') {
    return 'YLD转换矿山'
  }
  
  // 优先使用 blueprint_info
  if (mine.blueprint_info?.land_type) {
    switch (mine.blueprint_info.land_type) {
      case 'yld_mine':
        return mine.blueprint_info.name || 'YLD矿山'
      case 'iron_mine':
        return '铁矿'
      case 'stone_mine':
        return '石矿'
      case 'forest':
        return '森林'
      default:
        return mine.blueprint_info.name || '矿山'
    }
  }
  
  // 根据 land_type 返回显示名称
  switch (mine.land_type) {
    case 'yld_mine':
      return 'YLD矿山'
    case 'iron_mine':
      return '铁矿'
    case 'stone_mine':
      return '石矿'
    case 'forest':
      return '森林'
    default:
      return mine.land_type_display || mine.blueprint_name || '矿山'
  }
}

/**
 * 获取矿山类型颜色
 */
function getMineTypeColor(mine: YLDMine | MineLand): string {
  const landType = mine.blueprint_info?.land_type || mine.land_type
  
  switch (landType) {
    case 'yld_mine':
      return 'text-purple-400'
    case 'iron_mine':
      return 'text-gray-400'
    case 'stone_mine':
      return 'text-blue-400'
    case 'forest':
      return 'text-green-400'
    default:
      return 'text-gray-400'
  }
}

/**
 * YLD 矿山列表组件
 */
export function YLDMineList({
  mines,
  loading,
  error,
  onViewDetail,
  onRefresh,
  onStartProduction,
  onSwitchToSessions
}: YLDMineListProps) {
  const [showBetaModal, setShowBetaModal] = useState(false)
  const [pendingMineId, setPendingMineId] = useState<number | null>(null)
  const [hasMiningAccess, setHasMiningAccess] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // 检查是否有内测权限
  useEffect(() => {
    const access = hasBetaAccess()
    setHasMiningAccess(access)
  }, [])
  
  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent))
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // 调试：打印矿山数据结构
  useEffect(() => {
    if (mines && mines.length > 0) {
      console.log('[YLDMineList] 矿山数据示例:', mines[0])
      console.log('[YLDMineList] YLD储量:', getYLDCapacity(mines[0]))
    }
  }, [mines])
  
  // 开始生产 - 优化移动端点击
  const handleStartProduction = useCallback((e: React.MouseEvent | React.TouchEvent, mineId: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('[YLDMineList] 点击开始生产，矿山ID:', mineId)
    
    // 检查是否有内测权限
    if (!hasMiningAccess) {
      // 没有权限，显示密码输入框
      setPendingMineId(mineId)
      setShowBetaModal(true)
    } else {
      // 有权限，直接跳转到挖矿会话
      if (onSwitchToSessions) {
        onSwitchToSessions()
        toast.success('已切换到挖矿会话')
      }
      if (onStartProduction) {
        onStartProduction(mineId)
      }
    }
  }, [hasMiningAccess, onSwitchToSessions, onStartProduction])
  
  // 密码验证成功后的处理
  const handleBetaSuccess = useCallback(() => {
    setHasMiningAccess(true)
    setShowBetaModal(false)
    
    // 跳转到挖矿会话
    if (onSwitchToSessions) {
      onSwitchToSessions()
      toast.success('验证成功！已切换到挖矿会话')
    }
    
    // 如果有待处理的矿山ID，执行开始生产
    if (pendingMineId && onStartProduction) {
      onStartProduction(pendingMineId)
    }
    
    setPendingMineId(null)
  }, [onSwitchToSessions, onStartProduction, pendingMineId])
  
  // 收取产出（功能待开放）
  const handleCollectOutput = useCallback((e: React.MouseEvent | React.TouchEvent, mineId: number) => {
    e.preventDefault()
    e.stopPropagation()
    toast('收取功能即将开放', { icon: '🚧' })
  }, [])
  
  // 查看详情 - 优化移动端点击
  const handleViewDetailClick = useCallback((e: React.MouseEvent | React.TouchEvent, mine: YLDMine | MineLand) => {
    e.preventDefault()
    e.stopPropagation()
    onViewDetail(mine)
  }, [onViewDetail])
  
  // 加载中状态
  if (loading) {
    return (
      <PixelCard className="text-center py-8 sm:py-12">
        <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">⏳</div>
        <p className="text-sm sm:text-base text-gray-400">加载矿山数据...</p>
      </PixelCard>
    )
  }
  
  // 错误状态
  if (error) {
    return (
      <PixelCard className="text-center py-8 sm:py-12">
        <span className="text-5xl sm:text-6xl block mb-3 sm:mb-4">❌</span>
        <p className="text-sm sm:text-base text-red-400 mb-3 sm:mb-4">{error}</p>
        <PixelButton onClick={onRefresh} size={isMobile ? "sm" : "md"}>
          重新加载
        </PixelButton>
      </PixelCard>
    )
  }
  
  // 空数据状态
  if (!mines || mines.length === 0) {
    return (
      <PixelCard className="text-center py-8 sm:py-12">
        <span className="text-5xl sm:text-6xl block mb-3 sm:mb-4">🏔️</span>
        <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4">您还没有任何矿山</p>
        <p className="text-xs sm:text-sm text-gray-500">
          可以通过 YLD 代币转换获得 YLD 矿山，或在市场购买其他类型矿山
        </p>
      </PixelCard>
    )
  }
  
  // 矿山列表
  return (
    <>
      <div className="grid gap-3 sm:gap-4">
        {mines.map((mine) => {
          // 基本信息
          const landId = mine.land_id || `矿山#${mine.id}`
          
          // 获取区域名称（兼容不同数据结构）
          const regionName = mine.region_info?.name || mine.region_name || '中国'
          
          // 获取矿山类型
          const mineType = getMineTypeDisplay(mine)
          const mineTypeColor = getMineTypeColor(mine)
          const isProducing = mine.is_producing || false
          
          // YLD相关信息（仅 YLD 矿山显示）
          const isYLDMine = mine.land_type === 'yld_mine' || 
                           mine.blueprint_info?.land_type === 'yld_mine' ||
                           mine.special_type === 'yld_converted'
          
          // 获取 YLD 储量（剩余储量）
          const yldAmount = isYLDMine ? (mine.remaining_reserves || mine.yld_capacity || 0) : 0
          
          // 获取初始储量
          const initialAmount = isYLDMine ? (mine.initial_reserves || 0) : 0
          
          // 累计产出
          const accumulatedOutput = mine.accumulated_output || '0'
          
          // 批次ID（仅转换矿山有）
          const isConverted = mine.special_type === 'yld_converted'
          const batchId = mine.batch_id || mine.metadata?.batch_id || '未知'
          
          // 转换/创建日期
          const creationDate = mine.converted_at || 
                              mine.metadata?.converted_at || 
                              mine.metadata?.conversion_date || 
                              mine.created_at
          
          // 消耗百分比和预计剩余天数
          const depletionPercentage = mine.depletion_percentage || 0
          const estimatedDaysRemaining = mine.estimated_days_remaining || 0
          
          // 日产出
          const dailyOutput = mine.daily_output || mine.metadata?.daily_output || '0'
          
          return (
            <PixelCard 
              key={mine.id} 
              className="cursor-pointer hover:border-gold-500 transition-all"
              onClick={() => onViewDetail(mine)}
            >
              <div className="p-3 sm:p-4">
                {/* 矿山头部信息 */}
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div>
                    <h4 className="font-bold text-base sm:text-lg text-gold-500">
                      {landId}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-400">
                      {regionName} · <span className={mineTypeColor}>{mineType}</span>
                    </p>
                    {/* 显示拥有者信息 */}
                    {mine.owner_info && (
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                        矿主: {mine.owner_info.nickname || mine.owner_info.username}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold",
                      isProducing 
                        ? "bg-green-500/20 text-green-400"
                        : "bg-gray-700 text-gray-400"
                    )}>
                      {isProducing ? '生产中' : '闲置'}
                    </span>
                    {/* 显示消耗进度 */}
                    {isYLDMine && depletionPercentage > 0 && (
                      <div className="mt-1">
                        <span className="text-[10px] sm:text-xs text-orange-400">
                          已消耗 {depletionPercentage.toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 矿山数据 - 移动端优化 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
                  {isYLDMine && (
                    <>
                      <div>
                        <p className="text-gray-400 text-[10px] sm:text-xs">剩余储量</p>
                        <p className="font-bold text-purple-400">
                          {formatYLD(yldAmount)}
                        </p>
                      </div>
                      {initialAmount > 0 && (
                        <div>
                          <p className="text-gray-400 text-[10px] sm:text-xs">初始储量</p>
                          <p className="font-bold text-purple-300">
                            {formatYLD(initialAmount)}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  <div>
                    <p className="text-gray-400 text-[10px] sm:text-xs">累计产出</p>
                    <p className="font-bold text-green-400">
                      {formatYLD(accumulatedOutput)}
                    </p>
                  </div>
                  {isYLDMine && dailyOutput !== '0' && (
                    <div>
                      <p className="text-gray-400 text-[10px] sm:text-xs">日产出</p>
                      <p className="font-bold text-yellow-400">
                        {formatYLD(dailyOutput)}
                      </p>
                    </div>
                  )}
                  {isConverted && (
                    <div className="hidden sm:block">
                      <p className="text-gray-400 text-[10px] sm:text-xs">批次</p>
                      <p className="font-bold text-blue-400 text-[10px] sm:text-xs truncate" title={batchId}>
                        {batchId.substring(0, 12)}...
                      </p>
                    </div>
                  )}
                  <div className={isYLDMine ? "hidden sm:block" : ""}>
                    <p className="text-gray-400 text-[10px] sm:text-xs">
                      {isConverted ? '转换日期' : '创建日期'}
                    </p>
                    <p className="font-bold text-gray-300 text-xs">
                      {formatDate(creationDate)}
                    </p>
                  </div>
                </div>
                
                {/* 显示预计剩余天数 */}
                {isYLDMine && estimatedDaysRemaining > 0 && (
                  <div className="mt-2 text-[10px] sm:text-xs text-gray-400">
                    预计还可开采 <span className="text-cyan-400 font-bold">
                      {estimatedDaysRemaining.toFixed(1)}
                    </span> 天
                  </div>
                )}
                
                {/* 操作按钮 - 优化移动端触摸 */}
                <div className="mt-3 sm:mt-4 flex gap-2">
                 {isProducing ? (
                    <button
                      className="flex-1 px-3 py-2 bg-gray-700 text-gray-400 rounded-lg text-xs sm:text-sm font-bold cursor-not-allowed"
                      disabled
                      onClick={(e) => e.stopPropagation()}
                    >
                      生产中
                    </button>
                  ) : (
                    <button
                      className={cn(
                        "flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold",
                        "bg-gold-500 text-gray-900 active:bg-gold-600",
                        "transition-colors touch-manipulation",
                        "flex items-center justify-center gap-1"
                      )}
                      onClick={(e) => handleStartProduction(e, mine.id)}
                      onTouchEnd={(e) => {
                        // 移动端触摸事件处理
                        if (isMobile) {
                          handleStartProduction(e, mine.id)
                        }
                      }}
                    >
                      <span>⛏️</span>
                      <span>去挖矿（内测中）</span>
                    </button>
                  )}
                  <button
                    className={cn(
                      "px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold",
                      "bg-gray-700 text-gray-300 hover:bg-gray-600",
                      "transition-colors touch-manipulation"
                    )}
                    onClick={(e) => handleViewDetailClick(e, mine)}
                    onTouchEnd={(e) => {
                      if (isMobile) {
                        handleViewDetailClick(e, mine)
                      }
                    }}
                  >
                    查看详情
                  </button>
                </div>
              </div>
            </PixelCard>
          )
        })}
      </div>
      
      {/* 内测密码验证模态框 */}
      <BetaPasswordModal
        isOpen={showBetaModal}
        onClose={() => {
          setShowBetaModal(false)
          setPendingMineId(null)
        }}
        onSuccess={handleBetaSuccess}
        title="挖矿生产内测验证"
      />
    </>
  )
}

export default YLDMineList
