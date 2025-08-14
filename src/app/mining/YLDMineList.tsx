// src/components/mining/YLDMineList.tsx
// YLD 矿山列表组件
// 
// 功能说明：
// 1. 显示用户的 YLD 矿山列表
// 2. 支持查看矿山详情
// 3. 提供生产操作入口（待开放）
// 
// 关联文件：
// - 被 @/app/mining/page.tsx 使用
// - 使用 @/types/assets 中的 YLDMine 类型
// - 使用 @/components/shared/PixelCard
// - 使用 @/components/shared/PixelButton

'use client'

import { useEffect } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { cn } from '@/lib/utils'
import type { YLDMine } from '@/types/assets'
import toast from 'react-hot-toast'

interface YLDMineListProps {
  mines: YLDMine[] | null
  loading: boolean
  error: string | null
  onViewDetail: (mine: YLDMine) => void
  onRefresh: () => void
}

/**
 * 格式化 YLD 数量
 */
function formatYLD(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0.00'
  return num.toFixed(4)
}

/**
 * 格式化日期
 */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '未知'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

/**
 * YLD 矿山列表组件
 */
export function YLDMineList({
  mines,
  loading,
  error,
  onViewDetail,
  onRefresh
}: YLDMineListProps) {
  
  // 调试：打印矿山数据结构
  useEffect(() => {
    if (mines && mines.length > 0) {
      console.log('[YLDMineList] 矿山数据:', mines[0])
    }
  }, [mines])
  
  // 开始生产（功能待开放）
  const handleStartProduction = (e: React.MouseEvent, mineId: number) => {
    e.stopPropagation()
    toast('生产功能即将开放', { icon: '🚧' })
  }
  
  // 收取产出（功能待开放）
  const handleCollectOutput = (e: React.MouseEvent, mineId: number) => {
    e.stopPropagation()
    toast('收取功能即将开放', { icon: '🚧' })
  }
  
  // 加载中状态
  if (loading) {
    return (
      <PixelCard className="text-center py-12">
        <div className="animate-spin text-6xl mb-4">⏳</div>
        <p className="text-gray-400">加载矿山数据...</p>
      </PixelCard>
    )
  }
  
  // 错误状态
  if (error) {
    return (
      <PixelCard className="text-center py-12">
        <span className="text-6xl block mb-4">❌</span>
        <p className="text-red-400 mb-4">{error}</p>
        <PixelButton onClick={onRefresh}>
          重新加载
        </PixelButton>
      </PixelCard>
    )
  }
  
  // 空数据状态
  if (!mines || mines.length === 0) {
    return (
      <PixelCard className="text-center py-12">
        <span className="text-6xl block mb-4">🏔️</span>
        <p className="text-gray-400 mb-4">您还没有 YLD 矿山</p>
        <p className="text-sm text-gray-500">
          YLD 矿山由 YLD 代币转换而来
        </p>
      </PixelCard>
    )
  }
  
  // 矿山列表
  return (
    <div className="grid gap-4">
      {mines.map((mine) => (
        <PixelCard 
          key={mine.id} 
          className="cursor-pointer hover:border-gold-500 transition-all"
          onClick={() => onViewDetail(mine)}
        >
          <div className="p-4">
            {/* 矿山头部信息 */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-lg text-gold-500">
                  {mine.land_id}
                </h4>
                <p className="text-sm text-gray-400">
                  {mine.region_name} · {mine.land_type_display}
                </p>
              </div>
              <div className="text-right">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold",
                  mine.is_producing 
                    ? "bg-green-500/20 text-green-400"
                    : "bg-gray-700 text-gray-400"
                )}>
                  {mine.is_producing ? '生产中' : '闲置'}
                </span>
              </div>
            </div>
            
            {/* 矿山数据 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs">YLD 数量</p>
                <p className="font-bold text-purple-400">
                  {formatYLD(mine.initial_price)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">累计产出</p>
                <p className="font-bold text-green-400">
                  {formatYLD(mine.accumulated_output)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">批次</p>
                <p className="font-bold text-blue-400">
                  {mine.metadata?.batch_id || '未知'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">转换日期</p>
                <p className="font-bold text-gray-300">
                  {formatDate(mine.metadata?.conversion_date || mine.created_at)}
                </p>
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="mt-4 flex gap-2">
              {mine.is_producing ? (
                <PixelButton 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => handleCollectOutput(e, mine.id)}
                  disabled
                >
                  收取产出（待开放）
                </PixelButton>
              ) : (
                <PixelButton 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => handleStartProduction(e, mine.id)}
                  disabled
                >
                  开始生产（待开放）
                </PixelButton>
              )}
              <PixelButton 
                size="sm" 
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewDetail(mine)
                }}
              >
                查看详情
              </PixelButton>
            </div>
          </div>
        </PixelCard>
      ))}
    </div>
  )
}

export default YLDMineList
