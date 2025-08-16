// src/app/mining/YLDSystemStatus.tsx
// YLD系统状态监控组件 - 生产级版本
// 
// 功能说明：
// 1. 实时显示YLD全网挖矿状态
// 2. 显示今日产量限额和剩余量
// 3. 显示活跃会话和工具统计
// 4. 提供YLD耗尽处理功能
// 5. 自动刷新数据（每分钟）
// 
// 关联文件：
// - 被 @/app/mining/page.tsx 使用（挖矿主页面）
// - 使用 @/hooks/useProduction 中的 useYLDStatus Hook
// - 使用 @/components/shared 中的 UI 组件
// - 调用后端 /production/yld/status/ 接口
//
// 更新历史：
// - 2024-12: 创建YLD系统状态监控组件

'use client'

import { useState, useEffect, useMemo } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { useYLDStatus, useHandleYLDExhausted } from '@/hooks/useProduction'
import { cn } from '@/lib/utils'
import { safeFormatYLD, safeFormatPercent, formatDuration } from '@/utils/formatters'
import toast from 'react-hot-toast'

interface YLDSystemStatusProps {
  className?: string
  compact?: boolean // 紧凑模式（移动端）
  onRefresh?: () => void // 刷新回调
}

/**
 * YLD系统状态监控组件
 */
export function YLDSystemStatus({ 
  className, 
  compact = false,
  onRefresh 
}: YLDSystemStatusProps) {
  const [showExhaustedModal, setShowExhaustedModal] = useState(false)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  
  // 获取YLD系统状态
  const { 
    status, 
    loading, 
    error, 
    refetch 
  } = useYLDStatus({
    enabled: true,
    autoRefresh: autoRefreshEnabled,
    refreshInterval: 60000 // 1分钟
  })
  
  // YLD耗尽处理
  const { 
    handleExhausted, 
    loading: exhaustedLoading 
  } = useHandleYLDExhausted()
  
  // 计算进度条颜色
  const progressColor = useMemo(() => {
    if (!status) return 'bg-gray-500'
    const percentage = status.percentage_used
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    if (percentage >= 50) return 'bg-blue-500'
    return 'bg-green-500'
  }, [status])
  
  // 计算预计耗尽时间
  const estimatedExhaustTime = useMemo(() => {
    if (!status || status.is_exhausted) return null
    if (status.actual_hourly <= 0) return null
    
    const hoursRemaining = status.remaining / status.actual_hourly
    if (hoursRemaining > 24) return null // 超过24小时不显示
    
    const now = new Date()
    const exhaustTime = new Date(now.getTime() + hoursRemaining * 60 * 60 * 1000)
    return exhaustTime.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }, [status])
  
  // 处理刷新
  const handleRefresh = () => {
    refetch()
    if (onRefresh) onRefresh()
    toast.success('状态已刷新', { duration: 2000, icon: '🔄' })
  }
  
  // 处理YLD耗尽
  const handleYLDExhausted = async () => {
    try {
      const result = await handleExhausted()
      setShowExhaustedModal(false)
      
      // 刷新状态
      setTimeout(() => {
        refetch()
        if (onRefresh) onRefresh()
      }, 1000)
    } catch (error) {
      console.error('处理YLD耗尽失败:', error)
    }
  }
  
  // 如果加载中
  if (loading && !status) {
    return (
      <PixelCard className={cn("p-4", className)}>
        <div className="text-center">
          <div className="animate-spin text-2xl">⏳</div>
          <p className="text-xs text-gray-400 mt-2">加载YLD状态...</p>
        </div>
      </PixelCard>
    )
  }
  
  // 如果有错误
  if (error && !status) {
    return (
      <PixelCard className={cn("p-4", className)}>
        <div className="text-center">
          <span className="text-2xl">❌</span>
          <p className="text-xs text-red-400 mt-2">加载失败</p>
          <PixelButton size="xs" onClick={handleRefresh} className="mt-2">
            重试
          </PixelButton>
        </div>
      </PixelCard>
    )
  }
  
  // 如果没有数据
  if (!status) {
    return null
  }
  
  // 紧凑模式（移动端）
  if (compact) {
    return (
      <PixelCard className={cn("p-3", className)}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-purple-400">YLD全网状态</h4>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <span className={cn("text-sm", loading && "animate-spin")}>🔄</span>
          </button>
        </div>
        
        {/* 进度条 */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>今日产出</span>
            <span>{safeFormatPercent(status.percentage_used / 100, false)}</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", progressColor)}
              style={{ width: `${Math.min(status.percentage_used, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-500">
              {safeFormatYLD(status.produced_today, 0)}/{safeFormatYLD(status.daily_limit, 0)}
            </span>
            <span className="text-yellow-400">
              剩余: {safeFormatYLD(status.remaining, 0)}
            </span>
          </div>
        </div>
        
        {/* 统计信息 */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <p className="text-gray-500">会话</p>
            <p className="font-bold text-blue-400">{status.active_sessions}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">工具</p>
            <p className="font-bold text-green-400">{status.total_tools}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">速率/h</p>
            <p className="font-bold text-purple-400">{safeFormatYLD(status.actual_hourly, 2)}</p>
          </div>
        </div>
        
        {/* 警告或耗尽状态 */}
        {status.is_exhausted ? (
          <div className="mt-2 p-2 bg-red-900/50 rounded text-xs text-center">
            <span className="text-red-400">⚠️ 今日YLD产量已耗尽</span>
          </div>
        ) : status.percentage_used >= 90 ? (
          <div className="mt-2 p-2 bg-yellow-900/50 rounded text-xs text-center">
            <span className="text-yellow-400">⚠️ YLD即将耗尽</span>
          </div>
        ) : null}
      </PixelCard>
    )
  }
  
  // 完整模式（桌面端）
  return (
    <>
      <PixelCard className={cn("p-4", className)}>
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">💎</span>
            <h3 className="font-bold text-purple-400">YLD 全网挖矿状态</h3>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={autoRefreshEnabled}
                onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                className="w-3 h-3"
              />
              <span className="text-gray-400">自动刷新</span>
            </label>
            <PixelButton
              size="xs"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? '刷新中...' : '刷新'}
            </PixelButton>
          </div>
        </div>
        
        {/* 主要进度条 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">今日产量进度</span>
            <span className={cn(
              "font-bold",
              status.percentage_used >= 90 ? "text-red-400" :
              status.percentage_used >= 70 ? "text-yellow-400" :
              "text-green-400"
            )}>
              {safeFormatPercent(status.percentage_used / 100, false)}
            </span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", progressColor)}
              style={{ width: `${Math.min(status.percentage_used, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-2">
            <span className="text-gray-500">
              已产出: {safeFormatYLD(status.produced_today)}
            </span>
            <span className="text-gray-500">
              限额: {safeFormatYLD(status.daily_limit)}
            </span>
          </div>
        </div>
        
        {/* 详细数据 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-800 rounded p-3">
            <p className="text-xs text-gray-400 mb-1">剩余产量</p>
            <p className="text-lg font-bold text-yellow-400">
              {safeFormatYLD(status.remaining)}
            </p>
            {estimatedExhaustTime && (
              <p className="text-xs text-gray-500 mt-1">
                预计 {estimatedExhaustTime} 耗尽
              </p>
            )}
          </div>
          <div className="bg-gray-800 rounded p-3">
            <p className="text-xs text-gray-400 mb-1">实时产出速率</p>
            <p className="text-lg font-bold text-purple-400">
              {safeFormatYLD(status.actual_hourly, 2)}/h
            </p>
            {status.theoretical_hourly !== status.actual_hourly && (
              <p className="text-xs text-gray-500 mt-1">
                理论: {safeFormatYLD(status.theoretical_hourly, 2)}/h
              </p>
            )}
          </div>
        </div>
        
        {/* 活跃统计 */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-gray-800/50 rounded">
            <p className="text-xs text-gray-400">活跃会话</p>
            <p className="text-lg font-bold text-blue-400">{status.active_sessions}</p>
          </div>
          <div className="text-center p-2 bg-gray-800/50 rounded">
            <p className="text-xs text-gray-400">工作工具</p>
            <p className="text-lg font-bold text-green-400">{status.total_tools}</p>
          </div>
          <div className="text-center p-2 bg-gray-800/50 rounded">
            <p className="text-xs text-gray-400">平均效率</p>
            <p className="text-lg font-bold text-orange-400">
              {status.total_tools > 0 
                ? safeFormatPercent((status.actual_hourly / status.theoretical_hourly), true)
                : '0.0%'}
            </p>
          </div>
        </div>
        
        {/* 用户会话信息 */}
        {status.user_session && (
          <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded mb-4">
            <p className="text-xs text-blue-400 font-bold mb-2">我的挖矿会话</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-gray-400">会话ID</p>
                <p className="text-white truncate" title={status.user_session.session_id}>
                  {status.user_session.session_id}
                </p>
              </div>
              <div>
                <p className="text-gray-400">产出速率</p>
                <p className="text-green-400 font-bold">
                  {safeFormatYLD(status.user_session.output_rate, 2)}/h
                </p>
              </div>
              <div>
                <p className="text-gray-400">运行时长</p>
                <p className="text-yellow-400">
                  {formatDuration(status.user_session.started_at)}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* 状态提示 */}
        {status.is_exhausted ? (
          <div className="p-3 bg-red-900/50 border border-red-500/30 rounded">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-red-400 text-xl">🛑</span>
                <div>
                  <p className="text-sm font-bold text-red-400">今日YLD产量已耗尽</p>
                  <p className="text-xs text-gray-400">所有YLD挖矿会话已自动停止</p>
                </div>
              </div>
              <PixelButton
                size="xs"
                variant="secondary"
                onClick={() => setShowExhaustedModal(true)}
              >
                处理详情
              </PixelButton>
            </div>
          </div>
        ) : status.percentage_used >= 90 ? (
          <div className="p-3 bg-yellow-900/50 border border-yellow-500/30 rounded">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-xl animate-pulse">⚠️</span>
              <div>
                <p className="text-sm font-bold text-yellow-400">YLD产量即将耗尽</p>
                <p className="text-xs text-gray-400">
                  剩余 {safeFormatYLD(status.remaining)} YLD，请合理安排挖矿计划
                </p>
              </div>
            </div>
          </div>
        ) : status.warning ? (
          <div className="p-3 bg-orange-900/50 border border-orange-500/30 rounded">
            <div className="flex items-center gap-2">
              <span className="text-orange-400">ℹ️</span>
              <p className="text-xs text-orange-400">{status.warning}</p>
            </div>
          </div>
        ) : null}
      </PixelCard>
      
      {/* YLD耗尽处理模态框 */}
      <PixelModal
        isOpen={showExhaustedModal}
        onClose={() => setShowExhaustedModal(false)}
        title="YLD产量耗尽处理"
        size="medium"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded">
            <div className="flex items-start gap-2">
              <span className="text-red-400 text-xl">🛑</span>
              <div>
                <p className="text-sm font-bold text-red-400 mb-2">今日YLD产量已耗尽</p>
                <p className="text-xs text-gray-300">
                  系统将自动停止所有YLD挖矿会话，并按实际工作时间结算产出。
                  其他资源类型的挖矿不受影响。
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-300">处理说明：</p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• 所有YLD挖矿会话将被停止</li>
              <li>• 未收取的产出将自动结算</li>
              <li>• 工具将返回到闲置状态</li>
              <li>• 明天0点后可重新开始YLD挖矿</li>
            </ul>
          </div>
          
          <div className="flex gap-3">
            <PixelButton
              className="flex-1"
              onClick={handleYLDExhausted}
              disabled={exhaustedLoading}
            >
              {exhaustedLoading ? '处理中...' : '确认处理'}
            </PixelButton>
            <PixelButton
              variant="secondary"
              onClick={() => setShowExhaustedModal(false)}
            >
              关闭
            </PixelButton>
          </div>
        </div>
      </PixelModal>
    </>
  )
}

export default YLDSystemStatus
