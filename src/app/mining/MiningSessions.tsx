// src/app/mining/MiningSessions.tsx
// 挖矿会话管理主组件 - 精简重构版
// 
// 文件说明：
// 这是挖矿会话管理的主组件，负责协调各个子组件，处理业务逻辑
// 经过重构，将展示组件和工具函数拆分到独立文件中
// 
// 重构说明：
// - 原文件2000+行，现在精简到800行左右
// - 拆分出的组件：LandSelector, SessionCard, SessionSummary, StartMiningForm
// - 拆分出的工具：miningConstants, miningUtils
// - 保持所有原有功能不变，完全向后兼容
// 
// 主要功能：
// 1. 管理挖矿会话的生命周期（开始、停止、收取）
// 2. 处理用户交互和业务逻辑
// 3. 协调各个子组件的数据流
// 4. 处理错误和显示提示
// 
// 关联文件：
// - 子组件: ./LandSelector, ./SessionCard, ./SessionSummary, ./StartMiningForm
// - 工具函数: ./miningUtils, ./miningConstants
// - 其他组件: ./MiningPreCheck, ./SessionRateHistory
// - 被调用: @/app/mining/page.tsx
// 
// 更新历史：
// - 2025-01: 重构拆分，从2000+行精简到800行
// - 2025-01: 保持所有功能不变，完全向后兼容

'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { MiningPreCheck } from './MiningPreCheck'
import { SessionRateHistory } from './SessionRateHistory'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { MiningSession, Tool } from '@/types/production'
import type { Land } from '@/types/assets'
import { useStopAllSessions } from '@/hooks/useProduction'

// 导入拆分的组件
import { LandSelector } from './LandSelector'
import { SessionCard } from './SessionCard'
import { SessionSummary, SettlementCountdown } from './SessionSummary'
import { StartMiningForm } from './StartMiningForm'

// 导入工具函数和常量
import { formatNumber, formatDuration } from './miningUtils'
import { 
  FOOD_CONSUMPTION_RATE, 
  LAND_TYPE_MAP,
  ERROR_TYPES,
  TOAST_DURATION
} from './miningConstants'

interface MiningSessionsProps {
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
  onRefresh?: () => void
}

/**
 * 挖矿会话管理主组件
 * 负责协调各个子组件，处理业务逻辑
 */
export function MiningSessions({
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
  onRefresh
}: MiningSessionsProps) {
  // ==================== 状态管理 ====================
  const [showStartModal, setShowStartModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showPreCheck, setShowPreCheck] = useState(false)
  const [showRateHistory, setShowRateHistory] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)
  const [selectedLand, setSelectedLand] = useState<Land | null>(null)
  const [selectedTools, setSelectedTools] = useState<number[]>([])
  const [confirmAction, setConfirmAction] = useState<'start' | 'stop' | 'stopAll' | null>(null)
  const [targetSessionId, setTargetSessionId] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  
  const { stopAll, loading: stopAllLoading } = useStopAllSessions()
  
  // ==================== 副作用 ====================
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // ==================== 数据处理 ====================
  // 合并会话数据（优先使用 miningSummary 中的完整数据）
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
  
  // ==================== 业务逻辑处理 ====================
  
  /**
   * 处理其他类型错误
   */
  const handleOtherErrors = useCallback((errorData: any) => {
    const errorMessage = errorData?.message || errorData?.detail || '请求参数错误'
    
    if (errorMessage.includes(ERROR_TYPES.INSUFFICIENT_FOOD)) {
      toast.error(
        <div>
          <p className="font-bold">粮食不足！</p>
          <p className="text-sm">建议先购买粮食</p>
        </div>,
        {
          duration: TOAST_DURATION.MEDIUM,
          position: 'top-center',
          icon: '🌾'
        }
      )
    } else {
      toast.error(errorMessage, {
        duration: TOAST_DURATION.MEDIUM,
        position: 'top-center'
      })
    }
  }, [])
  
  /**
   * 处理开始挖矿错误
   */
  const handleStartMiningError = useCallback((err: any) => {
    console.error('[handleExecuteStart] 开始挖矿失败:', err)
    
    const errorResponse = err?.response
    const errorData = errorResponse?.data
    const statusCode = errorResponse?.status
    
    // 处理400错误 - 土地类型不支持挖矿
    if (statusCode === 400 && errorData) {
      if (errorData.message?.includes(ERROR_TYPES.LAND_NOT_SUPPORTED)) {
        const landType = errorData.data?.land_type || '未知'
        const landName = errorData.data?.land_name || selectedLand?.land_id || '未知土地'
        const supportedTypes = errorData.data?.supported_types || []
        
        toast.error(
          <div>
            <p className="font-bold mb-2">⚠️ 该土地不支持挖矿</p>
            <div className="text-xs space-y-1">
              <p>土地编号: {landName}</p>
              <p>土地类型: {LAND_TYPE_MAP[landType] || landType}</p>
              {supportedTypes.length > 0 && (
                <>
                  <p className="mt-2">支持挖矿的土地类型：</p>
                  <ul className="ml-2">
                    {supportedTypes.map((type: string) => (
                      <li key={type}>• {LAND_TYPE_MAP[type] || type}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>,
          {
            duration: TOAST_DURATION.LONG,
            position: 'top-center',
            icon: '🚫'
          }
        )
        return // 不关闭模态框，让用户重新选择
      }
      
      // 其他400错误
      handleOtherErrors(errorData)
    } else if (statusCode === 401) {
      toast.error('登录已过期，请重新登录', {
        duration: TOAST_DURATION.MEDIUM,
        position: 'top-center',
        icon: '🔒'
      })
    } else if (statusCode === 403) {
      toast.error('没有权限执行此操作', {
        duration: TOAST_DURATION.MEDIUM,
        position: 'top-center',
        icon: '🚫'
      })
    } else if (statusCode >= 500) {
      toast.error('服务器错误，请稍后重试', {
        duration: TOAST_DURATION.MEDIUM,
        position: 'top-center',
        icon: '⚠️'
      })
    } else {
      const errorMessage = errorData?.message || errorData?.detail || err?.message || '开始挖矿失败'
      toast.error(errorMessage, {
        duration: TOAST_DURATION.MEDIUM,
        position: 'top-center'
      })
    }
  }, [selectedLand, handleOtherErrors])
  
  /**
   * 执行开始挖矿
   */
  const handleExecuteStart = useCallback(async () => {
    if (!selectedLand || selectedTools.length === 0) return
    
    try {
      const response = await onStartMining(selectedLand.id, selectedTools)
      
      // 成功提示
      if (response?.data) {
        const data = response.data
        toast.success(
          <div>
            <p className="font-bold">挖矿已开始！</p>
            <p className="text-sm">会话ID: {data.session_id}</p>
            <p className="text-sm">算法版本: {data.algorithm_version}</p>
            <p className="text-sm">资源类型: {data.resource_type?.toUpperCase()}</p>
          </div>,
          {
            duration: TOAST_DURATION.LONG,
            position: 'top-center',
            icon: '⛏️'
          }
        )
      } else {
        toast.success('挖矿已开始！', {
          duration: TOAST_DURATION.SHORT,
          position: 'top-center',
          icon: '⛏️'
        })
      }
      
      // 关闭模态框并刷新
      setShowStartModal(false)
      setShowConfirmModal(false)
      setSelectedLand(null)
      setSelectedTools([])
      setConfirmAction(null)
      onRefresh?.()
    } catch (err: any) {
      handleStartMiningError(err)
    }
  }, [selectedLand, selectedTools, onStartMining, onRefresh, handleStartMiningError])
  
  /**
   * 执行停止会话
   */
  const handleExecuteStop = useCallback(async () => {
    if (!targetSessionId) return
    
    try {
      const session = displaySessions.find((s: any) => 
        s.session_pk === targetSessionId || s.id === targetSessionId
      )
      const response = await onStopSession(targetSessionId)
      
      if (response?.data) {
        const data = response.data
        toast.success(
          <div>
            <p className="font-bold">挖矿已结束！</p>
            <p className="text-sm">总净收益: {formatNumber(data.total_collected || 0, 4)} YLD</p>
            <p className="text-sm">结算小时数: {data.hours_settled || 0}</p>
          </div>,
          {
            duration: TOAST_DURATION.MEDIUM,
            position: 'top-center',
            icon: '💰'
          }
        )
      } else {
        toast.success('挖矿已结束，产出已自动收取！', {
          duration: TOAST_DURATION.SHORT,
          position: 'top-center',
          icon: '💰'
        })
      }
      
      setShowConfirmModal(false)
      setTargetSessionId(null)
      setConfirmAction(null)
      onRefresh?.()
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || '停止生产失败'
      toast.error(errorMessage, {
        duration: TOAST_DURATION.MEDIUM,
        position: 'top-center',
        icon: '❌'
      })
    }
  }, [targetSessionId, displaySessions, onStopSession, onRefresh])
  
  /**
   * 停止所有会话
   */
  const handleStopAll = useCallback(async () => {
    try {
      const result = await stopAll()
      
      if (result?.data) {
        toast.success('批量停止成功！', {
          duration: TOAST_DURATION.MEDIUM,
          position: 'top-center',
          icon: '✅'
        })
      }
      
      setShowConfirmModal(false)
      setConfirmAction(null)
      
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('批量停止失败:', error)
    }
  }, [stopAll])
  
  // ==================== UI 事件处理 ====================
  
  const handleOpenStartModal = useCallback(() => {
    setShowPreCheck(true)
  }, [])
  
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
  
  const handleConfirmStop = useCallback((sessionPk: number) => {
    setTargetSessionId(sessionPk)
    setConfirmAction('stop')
    setShowConfirmModal(true)
  }, [])
  
  const handleViewHistory = useCallback((sessionPk: number) => {
    setSelectedSessionId(sessionPk)
    setShowRateHistory(true)
  }, [])
  
  // ==================== 渲染 ====================
  
  return (
    <div className="space-y-4">
      {/* 头部操作栏 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold">活跃挖矿会话</h3>
          {displaySessions.length > 0 && <SettlementCountdown />}
        </div>
        <div className="flex gap-2">
          {displaySessions.length > 0 && (
            <PixelButton
              onClick={() => {
                setConfirmAction('stopAll')
                setShowConfirmModal(true)
              }}
              variant="secondary"
              size={isMobile ? "xs" : "sm"}
            >
              <span className="flex items-center gap-2">
                <span>⏹️</span>
                <span>全部停止</span>
              </span>
            </PixelButton>
          )}
          <PixelButton
            onClick={handleOpenStartModal}
            disabled={!userLands || userLands.length === 0 || !tools || tools.length === 0}
            size={isMobile ? "xs" : "sm"}
          >
            <span className="flex items-center gap-2">
              <span>⛏️</span>
              <span>开始挖矿</span>
            </span>
          </PixelButton>
        </div>
      </div>
      
      {/* 挖矿汇总信息 */}
      {miningSummary && (
        <SessionSummary 
          summary={miningSummary} 
          yldStatus={yldSystemStatus}  // 添加这一行
          compact={isMobile} 
        />
      )}
      
      {/* 会话列表或空状态 */}
      {loading ? (
        <PixelCard className="text-center py-8">
          <div className="text-4xl animate-spin">⏳</div>
          <p className="text-gray-400 mt-2">加载中...</p>
        </PixelCard>
      ) : displaySessions.length > 0 ? (
        <div className={cn(
          "grid gap-4",
          isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
        )}>
          {displaySessions.map((session: any) => (
            <SessionCard
              key={session.session_pk || session.id}
              session={session}
              onStop={() => handleConfirmStop(session.session_pk || session.id)}
              onViewHistory={() => handleViewHistory(session.session_pk || session.id)}
              isMobile={isMobile}
            />
          ))}
        </div>
      ) : (
        <PixelCard className="text-center py-12">
          <div className="text-6xl mb-4">⛏️</div>
          <p className="text-gray-400 mb-2">暂无活跃的挖矿会话</p>
          <p className="text-sm text-gray-500 mb-4">
            {!userLands || userLands.length === 0 
              ? '您需要先拥有土地才能开始挖矿'
              : !tools || tools.length === 0
              ? '您需要先合成工具才能开始挖矿' 
              : '点击"开始挖矿"按钮创建新的挖矿会话'}
          </p>
          {userLands && userLands.length > 0 && tools && tools.length > 0 && (
            <PixelButton onClick={handleOpenStartModal} size="sm">
              开始挖矿
            </PixelButton>
          )}
        </PixelCard>
      )}
      
      {/* ==================== 模态框 ==================== */}
      
      {/* 挖矿预检查模态框 */}
      {showPreCheck && (
        <PixelModal
          isOpen={showPreCheck}
          onClose={() => setShowPreCheck(false)}
          title="挖矿条件检查"
          size={isMobile ? "small" : "medium"}
        >
          <MiningPreCheck
            onProceed={handlePreCheckProceed}
            onCancel={() => setShowPreCheck(false)}
            onBuyFood={onBuyFood}
            onSynthesizeTool={onSynthesizeTool}
          />
        </PixelModal>
      )}
      
      {/* 开始挖矿模态框 */}
      <PixelModal
        isOpen={showStartModal}
        onClose={() => {
          setShowStartModal(false)
          setSelectedLand(null)
          setSelectedTools([])
        }}
        title="开始自主挖矿"
        size={isMobile ? "small" : "medium"}
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
          />
        )}
      </PixelModal>
      
      {/* 确认操作模态框 */}
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
          {/* 开始挖矿确认 */}
          {confirmAction === 'start' && (
            <>
              <div className="text-center py-4">
                <div className="text-5xl mb-3">⛏️</div>
                <p className="text-sm text-gray-300 mb-2">
                  您确定要开始挖矿吗？
                </p>
              </div>
              
              {selectedLand && (
                <div className="bg-gray-800 rounded p-3 text-xs space-y-1">
                  <p>土地：{selectedLand.land_id}</p>
                  <p>工具数量：{selectedTools.length} 个</p>
                  <p className="text-yellow-400">
                    粮食消耗：{selectedTools.length * FOOD_CONSUMPTION_RATE} 单位/小时
                  </p>
                </div>
              )}
            </>
          )}
          
          {/* 停止会话确认 */}
          {confirmAction === 'stop' && targetSessionId && (
            <>
              <div className="text-center py-4">
                <div className="text-5xl mb-3">💰</div>
                <p className="text-sm text-gray-300 mb-2">
                  您确定要结束挖矿吗？
                </p>
              </div>
              
              {(() => {
                const session = displaySessions.find((s: any) => 
                  s.session_pk === targetSessionId || s.id === targetSessionId
                )
                if (!session) return null
                
                return (
                  <div className="bg-gray-800 rounded p-3 text-xs">
                    <p>会话ID：{session.session_id}</p>
                    <p className="text-green-400 font-bold">
                      待收取净收益：{formatNumber(session.pending_output || 0, 4)} YLD
                    </p>
                    <p className="text-blue-400">
                      已结算：{session.settled_hours || 0} 小时
                    </p>
                  </div>
                )
              })()}
            </>
          )}
          
          {/* 停止所有会话确认 */}
          {confirmAction === 'stopAll' && (
            <>
              <div className="text-center py-4">
                <div className="text-5xl mb-3">⏹️</div>
                <p className="text-sm text-gray-300 mb-2">
                  您确定要结束所有 {displaySessions.length} 个挖矿会话吗？
                </p>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3">
                <p className="text-xs text-yellow-400">
                  ⚠️ 所有会话的待收取收益将被自动收取
                </p>
              </div>
            </>
          )}
          
          {/* 操作按钮 */}
          <div className="flex gap-3">
            <PixelButton
              className="flex-1"
              variant={confirmAction === 'stop' || confirmAction === 'stopAll' ? 'secondary' : 'primary'}
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
      
      {/* 历史记录模态框 */}
      {showRateHistory && selectedSessionId && (
        <PixelModal
          isOpen={showRateHistory}
          onClose={() => {
            setShowRateHistory(false)
            setSelectedSessionId(null)
          }}
          title="产出率历史"
          size={isMobile ? "small" : "large"}
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
            compact={isMobile}
          />
        </PixelModal>
      )}
    </div>
  )
}

export default MiningSessions
