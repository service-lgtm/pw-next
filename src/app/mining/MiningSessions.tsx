// src/app/mining/MiningSessions.tsx
// 挖矿会话管理主组件 - 现代化设计版本（添加快速开始功能）
// 
// 文件说明：
// 优化后的挖矿会话管理，采用卡片式设计，简化信息展示
// 
// 修改历史：
// - 2025-01-18: 修复 yldSystemStatus 未定义错误
// - 2025-01-29: 全新卡片式设计
// - 2025-01-30: 添加快速开始挖矿功能，与"我的矿山"页面体验一致

'use client'

import React, { useState, useCallback, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { MiningPreCheck } from './MiningPreCheck'
import { SessionRateHistory } from './SessionRateHistory'
import { StartMiningForm } from './StartMiningForm'
import { QuickStartMining } from './QuickStartMining'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { MiningSession, Tool } from '@/types/production'
import type { Land } from '@/types/assets'
import { useStopAllSessions } from '@/hooks/useProduction'
import { getResourceIcon, RESOURCE_TYPES } from '@/utils/resourceTool'

// ==================== 工具函数 ====================

/**
 * 格式化数字
 */
function formatNumber(value: number, decimals: number = 2): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toFixed(decimals)
}

/**
 * 格式化时长
 */
function formatDuration(startTime: string): string {
  const start = new Date(startTime).getTime()
  const now = Date.now()
  const diff = now - start

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}天${hours % 24}小时`
  }
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分钟`
}

/**
 * 获取下次结算信息
 */
function getNextSettlementInfo(): { time: string; minutes: number } {
  const now = new Date()
  const nextHour = new Date(now)
  nextHour.setHours(now.getHours() + 1, 0, 0, 0)

  const minutes = Math.floor((nextHour.getTime() - now.getTime()) / (1000 * 60))
  const time = nextHour.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return { time, minutes }
}

// ==================== 配置 ====================

const RESOURCE_TYPES_MAP = {
  'yld': { label: 'YLD', icon: RESOURCE_TYPES.METEORITE, color: 'text-purple-400', bgColor: 'bg-purple-900/20' },
  'iron': { label: '铁矿', icon: RESOURCE_TYPES.IRON_ORE, color: 'text-gray-400', bgColor: 'bg-gray-900/20' },
  'stone': { label: '石头', icon: RESOURCE_TYPES.STONE, color: 'text-blue-400', bgColor: 'bg-blue-900/20' },
  'wood': { label: '木材', icon: RESOURCE_TYPES.WOOD, color: 'text-green-400', bgColor: 'bg-green-900/20' },
  'food': { label: '粮食', icon: RESOURCE_TYPES.GRAIN, color: 'text-yellow-400', bgColor: 'bg-yellow-900/20' }
}

// ==================== 子组件 ====================

/**
 * 会话统计卡片
 */
const SessionStats = ({
  summary,
  yldStatus,
  onStartNew
}: {
  summary: any
  yldStatus: any
  onStartNew: () => void
}) => {
  const nextSettlement = getNextSettlementInfo()

  const stats = {
    activeCount: summary?.active_sessions?.count || 0,
    totalPending: summary?.active_sessions?.total_pending_rewards || 0,
    foodConsumption: summary?.active_sessions?.total_food_consumption || 0,
    foodHours: summary?.food_sustainability_hours || 0,
    yldRemaining: yldStatus?.data?.remaining || yldStatus?.remaining || 0,
    yldPercentage: yldStatus?.data?.percentage_used || yldStatus?.percentage_used || 0
  }

  return (
    <div className="space-y-3 mb-4">
      {/* 主要统计 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">{stats.activeCount}</p>
          <p className="text-xs text-gray-400">活跃会话</p>
        </div>
        {/* <div className="bg-green-900/20 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-400">
            {formatNumber(stats.totalPending, 2)}
          </p>
          <p className="text-xs text-gray-400">待收取</p>
        </div> */}
        <div className="bg-yellow-900/20 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {stats.foodHours.toFixed(1)}h
          </p>
          <p className="text-xs text-gray-400">粮食剩余</p>
        </div>
        {/* <div className="bg-purple-900/20 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-purple-400">
            {formatNumber(stats.yldRemaining, 1)}
          </p>
          <p className="text-xs text-gray-400">YLD剩余</p>
        </div> */}
      </div>

      {/* 下次结算倒计时 */}
      {stats.activeCount > 0 && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-400">⏰</span>
            <span className="text-sm text-gray-300">下次结算</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-blue-400">{nextSettlement.time}</p>
            <p className="text-xs text-gray-400">{nextSettlement.minutes}分钟后</p>
          </div>
        </div>
      )}

      {/* 快速开始按钮 */}
      <button
        onClick={onStartNew}
        className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold py-3 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <span className="flex items-center justify-center gap-2">
          <span className="text-xl">⛏️</span>
          <span>开始新的挖矿</span>
        </span>
      </button>
    </div>
  )
}

/**
 * 会话卡片 - 简化版
 */
const SessionCardSimple = ({
  session,
  onStop,
  onViewHistory
}: {
  session: any
  onStop: () => void
  onViewHistory: () => void
}) => {
  const sessionId = session.session_id || `Session-${session.id}`
  const landName = session.land_name || session.land_id || '未知土地'
  const resourceType = session.resource_type || 'yld'
  const resourceConfig = RESOURCE_TYPES_MAP[resourceType as keyof typeof RESOURCE_TYPES_MAP] || RESOURCE_TYPES_MAP.yld

  const pendingOutput = session.pending_output || session.pending_rewards || 0
  const settledHours = session.settled_hours || session.hours_settled || 0
  const currentHourMinutes = session.current_hour_minutes || 0
  const startTime = session.started_at

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 border-gray-700 overflow-hidden hover:border-gold-500/50 transition-all">
      {/* 顶部状态条 */}
      <div className={cn("h-1 bg-gradient-to-r from-green-600 to-green-500")} />

      <div className="p-4">
        {/* 头部信息 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl shrink-0">{getResourceIcon(resourceConfig.icon, {
              iconSize: 32,
              haveBackgroundWarper: true,
            })}</span>
            <div>
              <p className="font-bold text-sm text-white">{sessionId}</p>
              <p className="text-xs text-gray-400">{landName}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              生产中
            </div>
            <p className="text-xs text-gray-500 mt-1">{formatDuration(startTime)}</p>
          </div>
        </div>

        {/* 核心数据 - 只显示最重要的 */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <p className="text-xs text-gray-400">待收取</p>
            <p className="text-lg font-bold text-green-400">
              {formatNumber(pendingOutput, 2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">已结算</p>
            <p className="text-lg font-bold text-blue-400">
              {settledHours}h
            </p>
          </div>
          {/* <div className="text-center">
            <p className="text-xs text-gray-400">当前进度</p>
            <p className="text-lg font-bold text-yellow-400">
              {currentHourMinutes}/60
            </p>
          </div> */}
        </div>

        {/* 当前小时进度条 */}
        <div className="mb-3">
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all"
              style={{ width: `${(currentHourMinutes / 60) * 100}%` }}
            />
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={onStop}
            className="bg-red-900/50 hover:bg-red-900/70 text-red-400 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105 active:scale-95"
          >
            停止挖矿
          </button>
          {/* <button
            onClick={onViewHistory}
            className="bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105 active:scale-95"
          >
            查看历史
          </button> */}
        </div>
      </div>
    </div>
  )
}

/**
 * 空状态
 */
const EmptyState = ({ onStart }: { onStart: () => void }) => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">⛏️</div>
    <h3 className="text-lg font-bold text-white mb-2">暂无活跃的挖矿会话</h3>
    <p className="text-sm text-gray-400 mb-6">
      点击下方按钮开始您的第一个挖矿会话
    </p>
    <PixelButton onClick={onStart} size="md">
      开始挖矿
    </PixelButton>
  </div>
)

// ==================== 主组件 ====================

interface MiningSessionsProps {
  hiddenNode?: boolean
  sessions: MiningSession[] | null
  loading: boolean
  userLands: Land[] | null
  tools: Tool[] | null
  onStartMining: (landId: number, toolIds: number[]) => Promise<any>
  onStopSession: (sessionId: number) => Promise<any>
  onCollectOutput: (sessionId: number) => Promise<any>
  onBuyFood?: () => void
  onSynthesizeTool?: () => void
  startMiningLoading?: boolean
  miningSummary?: any
  yldStatus?: any
  onRefresh?: () => void
}
export interface MiningSessionsRef {
  handleOpenStartModal: () => void
}

export const MiningSessions = forwardRef<MiningSessionsRef, MiningSessionsProps>(({
  hiddenNode = false,
  sessions,
  loading,
  userLands,
  tools,
  onStartMining,
  onStopSession,
  onCollectOutput,
  onBuyFood,
  onSynthesizeTool,
  startMiningLoading = false,
  miningSummary,
  yldStatus,
  onRefresh
}, ref) => {

  // 状态管理
  const [showStartModal, setShowStartModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showPreCheck, setShowPreCheck] = useState(false)
  const [showQuickStart, setShowQuickStart] = useState(false)
  const [showRateHistory, setShowRateHistory] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)
  const [selectedLand, setSelectedLand] = useState<Land | null>(null)
  const [selectedTools, setSelectedTools] = useState<number[]>([])
  const [confirmAction, setConfirmAction] = useState<'start' | 'stop' | 'stopAll' | null>(null)
  const [targetSessionId, setTargetSessionId] = useState<number | null>(null)
  const [quickStartLand, setQuickStartLand] = useState<Land | null>(null)

  const { stopAll, loading: stopAllLoading } = useStopAllSessions()

  // 合并会话数据
  const displaySessions = useMemo(() => {
    if (miningSummary?.active_sessions?.sessions?.length > 0) {
      return miningSummary.active_sessions.sessions
    }
    return sessions || []
  }, [miningSummary, sessions])

  // 筛选可用工具
  const availableTools = useMemo(() =>
    tools?.filter(t => t.status === 'normal' && !t.is_in_use && (t.current_durability || 0) > 0) || [],
    [tools]
  )

  // 筛选可用土地（新增）
  const availableLands = useMemo(() => {
    if (!userLands) return []
    return userLands.filter(land =>
      !land.is_producing &&
      land.blueprint?.land_type &&
      ['yld_mine', 'iron_mine', 'stone_mine', 'forest', 'farm'].includes(land.blueprint.land_type)
    )
  }, [userLands])

  // 事件处理 - 修改为快速开始流程
  const handleOpenStartModal = useCallback(() => {
    // 如果有可用土地和工具，直接使用快速开始
    if (availableLands.length > 0 && availableTools.length > 0) {
      // 优先选择 YLD 矿山，否则选择第一个可用土地
      const preferredLand = availableLands.find(land =>
        land.blueprint?.land_type === 'yld_mine'
      ) || availableLands[0]

      setQuickStartLand(preferredLand)
      setShowQuickStart(true)
    } else if (availableLands.length === 0) {
      toast.error('没有可用的土地，请先获取土地')
    } else if (availableTools.length === 0) {
      toast.error('没有可用的工具，请先合成工具')
      if (onSynthesizeTool) {
        setTimeout(() => onSynthesizeTool(), 1500)
      }
    } else {
      // 如果条件不满足，走原流程
      setShowPreCheck(true)
    }
  }, [availableLands, availableTools, onSynthesizeTool])

  const handlePreCheckProceed = useCallback(() => {
    setShowPreCheck(false)
    setShowStartModal(true)
    setSelectedLand(null)
    setSelectedTools([])
  }, [])

  const handleConfirmStart = useCallback(() => {
    if (!selectedLand || selectedTools.length === 0) {
      toast.error('请选择土地和工具')
      return
    }

    setConfirmAction('start')
    setShowConfirmModal(true)
  }, [selectedLand, selectedTools])

  const handleExecuteStart = useCallback(async () => {
    if (!selectedLand || selectedTools.length === 0) return

    try {
      await onStartMining(selectedLand.id, selectedTools)

      toast.success('挖矿已开始！', {
        duration: 3000,
        position: 'top-center',
        icon: '⛏️'
      })

      setShowStartModal(false)
      setShowConfirmModal(false)
      setSelectedLand(null)
      setSelectedTools([])
      setConfirmAction(null)
      onRefresh?.()
    } catch (err: any) {
      console.error('开始挖矿失败:', err)
    }
  }, [selectedLand, selectedTools, onStartMining, onRefresh])

  // 快速开始确认（新增）
  const handleQuickStartConfirm = useCallback(async (landId: number, toolIds: number[]) => {
    try {
      await onStartMining(landId, toolIds)

      toast.success('挖矿已开始！', {
        duration: 3000,
        position: 'top-center',
        icon: '⛏️'
      })

      setShowQuickStart(false)
      setQuickStartLand(null)
      onRefresh?.()
    } catch (err: any) {
      console.error('开始挖矿失败:', err)
    }
  }, [onStartMining, onRefresh])

  const handleConfirmStop = useCallback((sessionPk: number) => {
    setTargetSessionId(sessionPk)
    setConfirmAction('stop')
    setShowConfirmModal(true)
  }, [])

  const handleExecuteStop = useCallback(async () => {
    if (!targetSessionId) return

    try {
      await onStopSession(targetSessionId)

      toast.success('挖矿已结束，产出已收取！', {
        duration: 3000,
        position: 'top-center',
        icon: '💰'
      })

      setShowConfirmModal(false)
      setTargetSessionId(null)
      setConfirmAction(null)
      onRefresh?.()
    } catch (err: any) {
      console.error('停止生产失败:', err)
    }
  }, [targetSessionId, onStopSession, onRefresh])

  const handleStopAll = useCallback(async () => {
    try {
      await stopAll()

      toast.success('已停止所有会话', {
        duration: 3000,
        position: 'top-center',
        icon: '✅'
      })

      setShowConfirmModal(false)
      setConfirmAction(null)

      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('批量停止失败:', error)
    }
  }, [stopAll])

  const handleViewHistory = useCallback((sessionPk: number) => {
    setSelectedSessionId(sessionPk)
    setShowRateHistory(true)
  }, [])

  useImperativeHandle(ref, () => ({
    handleOpenStartModal
  }))

  // 渲染
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl animate-spin mb-2">⏳</div>
        <p className="text-gray-400">加载中...</p>
      </div>
    )
  }

  // 粮食剩余
  const foodHours = miningSummary?.food_sustainability_hours || 0;

  return (
    <div className="space-y-4">
      {
        !hiddenNode && <>
          {/* 统计概览 */}
          <SessionStats
            summary={miningSummary}
            yldStatus={yldStatus}
            onStartNew={handleOpenStartModal}
          />

          {/* 会话列表或空状态 */}
          {displaySessions.length > 0 ? (
            <>
              {/* 批量操作栏 */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  活跃会话 ({displaySessions.length})
                </h3>
                <PixelButton
                  onClick={() => {
                    setConfirmAction('stopAll')
                    setShowConfirmModal(true)
                  }}
                  variant="secondary"
                  size="sm"
                >
                  全部停止
                </PixelButton>
              </div>

              {/* 会话网格 */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {displaySessions.map((session: any) => (
                  <SessionCardSimple
                    key={session.session_pk || session.id}
                    session={session}
                    onStop={() => handleConfirmStop(session.session_pk || session.id)}
                    onViewHistory={() => handleViewHistory(session.session_pk || session.id)}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyState onStart={handleOpenStartModal} />
          )}
        </>
      }


      {/* ==================== 模态框 ==================== */}

      {/* 快速开始挖矿（新增） */}
      <PixelModal
        isOpen={showQuickStart}
        onClose={() => {
          setShowQuickStart(false)
          setQuickStartLand(null)
        }}
        title="快速开始挖矿"
        size="medium"
      >
        {quickStartLand && tools && (
          <QuickStartMining
            foodHours={foodHours}
            mine={quickStartLand}
            tools={tools}
            onConfirm={handleQuickStartConfirm}
            onCancel={() => {
              setShowQuickStart(false)
              setQuickStartLand(null)
            }}
            loading={startMiningLoading}
            userLevel={6}
          />
        )}
      </PixelModal>

      {/* 挖矿预检查 */}
      {showPreCheck && (
        <PixelModal
          isOpen={showPreCheck}
          onClose={() => setShowPreCheck(false)}
          title="挖矿条件检查"
          size="medium"
        >
          <MiningPreCheck
            onProceed={handlePreCheckProceed}
            onCancel={() => setShowPreCheck(false)}
            onBuyFood={onBuyFood}
            onSynthesizeTool={onSynthesizeTool}
          />
        </PixelModal>
      )}

      {/* 开始挖矿 */}
      <PixelModal
        isOpen={showStartModal}
        onClose={() => {
          setShowStartModal(false)
          setSelectedLand(null)
          setSelectedTools([])
        }}
        title="开始挖矿"
        size="medium"
      >
        {userLands && tools && (
          <StartMiningForm
            userLands={userLands}
            tools={tools}
            selectedLand={selectedLand}
            selectedTools={selectedTools}
            onLandSelect={setSelectedLand}
            onToolsSelect={setSelectedTools}
            onConfirm={handleConfirmStart}
            onCancel={() => {
              setShowStartModal(false)
              setSelectedLand(null)
              setSelectedTools([])
            }}
            loading={startMiningLoading}
            activeSessions={displaySessions}
            userLevel={6}
            maxToolsPerLand={60}
          />
        )}
      </PixelModal>

      {/* 确认操作 */}
      <PixelModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setConfirmAction(null)
          setTargetSessionId(null)
        }}
        title={
          confirmAction === 'start' ? '确认开始挖矿' :
            confirmAction === 'stopAll' ? '确认结束所有会话' :
              '确认结束挖矿'
        }
        size="small"
      >
        <div className="space-y-4">
          {confirmAction === 'start' && (
            <div className="text-center py-4">
              <div className="text-5xl mb-3">⛏️</div>
              <p className="text-sm text-gray-300">确定要开始挖矿吗？</p>
            </div>
          )}

          {confirmAction === 'stop' && targetSessionId && (
            <div className="text-center py-4">
              <div className="text-5xl mb-3">💰</div>
              <p className="text-sm text-gray-300">确定要结束挖矿并收取产出吗？</p>
            </div>
          )}

          {confirmAction === 'stopAll' && (
            <div className="text-center py-4">
              <div className="text-5xl mb-3">⏹️</div>
              <p className="text-sm text-gray-300">
                确定要结束所有 {displaySessions.length} 个挖矿会话吗？
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <PixelButton
              className="flex-1"
              onClick={
                confirmAction === 'start' ? handleExecuteStart :
                  confirmAction === 'stopAll' ? handleStopAll :
                    handleExecuteStop
              }
              disabled={confirmAction === 'stopAll' && stopAllLoading}
            >
              {confirmAction === 'stopAll' && stopAllLoading ? '处理中...' : '确认'}
            </PixelButton>
            <PixelButton
              variant="secondary"
              onClick={() => {
                setShowConfirmModal(false)
                setConfirmAction(null)
                setTargetSessionId(null)
              }}
            >
              取消
            </PixelButton>
          </div>
        </div>
      </PixelModal>

      {/* 历史记录 */}
      {showRateHistory && selectedSessionId && (
        <PixelModal
          isOpen={showRateHistory}
          onClose={() => {
            setShowRateHistory(false)
            setSelectedSessionId(null)
          }}
          title="产出率历史"
          size="large"
        >
          <SessionRateHistory
            sessionId={selectedSessionId}
            sessionInfo={(() => {
              const session = displaySessions.find((s: any) =>
                s.session_pk === selectedSessionId || s.id === selectedSessionId
              )
              return session ? {
                session_id: session.session_id,
                resource_type: session.resource_type || 'yld',
                land_id: session.land_id
              } : undefined
            })()}
            onClose={() => {
              setShowRateHistory(false)
              setSelectedSessionId(null)
            }}
            compact={false}
          />
        </PixelModal>
      )}
    </div>
  )
})

export default MiningSessions
