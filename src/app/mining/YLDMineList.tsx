// src/app/mining/YLDMineList.tsx
// YLD 矿山列表组件
// 
// 功能说明：
// 1. 显示用户的 YLD 矿山列表
// 2. 支持查看矿山详情
// 3. 开始生产功能（内测）- 需要密码验证
// 4. 验证成功后跳转到挖矿会话
//
// 关联文件：
// - 被 @/app/mining/page.tsx 使用
// - 使用 @/types/assets 中的 YLDMine 类型
// - 使用 @/components/shared 中的组件
// - 使用 ./BetaPasswordModal 进行密码验证
//
// 更新历史：
// - 2024-01: 完全移除日产出显示
// - 2024-01: 开始生产改为内测功能，需要密码验证

'use client'

import { useState, useEffect } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { BetaPasswordModal, hasBetaAccess } from './BetaPasswordModal'
import { cn } from '@/lib/utils'
import type { YLDMine } from '@/types/assets'
import toast from 'react-hot-toast'

interface YLDMineListProps {
  mines: YLDMine[] | null
  loading: boolean
  error: string | null
  onViewDetail: (mine: YLDMine) => void
  onRefresh: () => void
  onStartProduction?: (mineId: number) => void  // 新增：开始生产回调
  onSwitchToSessions?: () => void  // 新增：切换到挖矿会话标签
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
  
  // 检查是否有内测权限
  useEffect(() => {
    const access = hasBetaAccess()
    setHasMiningAccess(access)
  }, [])
  
  // 调试：打印矿山数据结构
  useEffect(() => {
    if (mines && mines.length > 0) {
      console.log('[YLDMineList] 矿山数据示例:', mines[0])
    }
  }, [mines])
  
  // 开始生产（内测功能）
  const handleStartProduction = (e: React.MouseEvent, mineId: number) => {
    e.stopPropagation()
    
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
  }
  
  // 密码验证成功后的处理
  const handleBetaSuccess = () => {
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
    <>
      <div className="grid gap-4">
        {mines.map((mine) => {
          // 使用实际的字段名
          const landId = mine.land_id || `矿山#${mine.id}`
          const regionName = mine.region_info?.name || mine.region_name || '中国'
          const landType = mine.blueprint_info?.name || mine.land_type_display || 'YLD矿山'
          const isProducing = mine.is_producing || false
          
          // YLD数量 - 使用 yld_capacity 字段
          const yldAmount = mine.yld_capacity || mine.current_price || 0
          
          // 累计产出
          const accumulatedOutput = mine.accumulated_output || 0
          
          // 批次ID
          const batchId = mine.batch_id || mine.metadata?.batch_id || '未知'
          
          // 转换日期 - 使用 converted_at
          const conversionDate = mine.converted_at || mine.metadata?.converted_at || mine.created_at
          
          return (
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
                      {landId}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {regionName} · {landType}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold",
                      isProducing 
                        ? "bg-green-500/20 text-green-400"
                        : "bg-gray-700 text-gray-400"
                    )}>
                      {isProducing ? '生产中' : '闲置'}
                    </span>
                  </div>
                </div>
                
                {/* 矿山数据 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">YLD 数量</p>
                    <p className="font-bold text-purple-400">
                      {formatYLD(yldAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">累计产出</p>
                    <p className="font-bold text-green-400">
                      {formatYLD(accumulatedOutput)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">批次</p>
                    <p className="font-bold text-blue-400 text-xs truncate" title={batchId}>
                      {batchId}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">转换日期</p>
                    <p className="font-bold text-gray-300">
                      {formatDate(conversionDate)}
                    </p>
                  </div>
                </div>
                
                {/* 操作按钮 */}
                <div className="mt-4 flex gap-2">
                  {isProducing ? (
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
                    >
                      <span className="flex items-center justify-center gap-1">
                        <span>⛏️</span>
                        <span>开始生产（内测）</span>
                      </span>
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
