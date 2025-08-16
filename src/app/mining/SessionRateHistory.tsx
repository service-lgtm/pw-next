// src/app/mining/SessionRateHistory.tsx
// 会话产出率历史组件 - 生产级版本
// 
// 功能说明：
// 1. 显示挖矿会话的产出率变化历史
// 2. 展示不同时段的产出率和工具占比
// 3. 计算各时段的实际产出
// 4. 支持列表展示（无需图表）
// 
// 关联文件：
// - 被 @/app/mining/MiningSessions.tsx 使用
// - 使用 @/hooks/useProduction 中的 useSessionRateHistory Hook
// - 使用 @/components/shared 中的 UI 组件
// - 调用后端 /production/sessions/{id}/rate-history/ 接口
//
// 更新历史：
// - 2024-12: 创建产出率历史组件

'use client'

import { useEffect } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useSessionRateHistory } from '@/hooks/useProduction'
import { cn } from '@/lib/utils'
import { safeFormatYLD, safeFormatPercent, formatTimestamp } from '@/utils/formatters'

interface SessionRateHistoryProps {
  sessionId: number
  sessionInfo?: {
    session_id: string
    resource_type?: string
    land_id?: string
  }
  onClose?: () => void
  className?: string
  compact?: boolean // 紧凑模式
}

/**
 * 会话产出率历史组件
 */
export function SessionRateHistory({
  sessionId,
  sessionInfo,
  onClose,
  className,
  compact = false
}: SessionRateHistoryProps) {
  // 获取产出率历史
  const { 
    history, 
    loading, 
    error, 
    refetch 
  } = useSessionRateHistory(sessionId, { enabled: true })
  
  // 自动刷新（可选）
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 60000) // 每分钟刷新
    
    return () => clearInterval(interval)
  }, [refetch])
  
  // 如果正在加载
  if (loading && !history) {
    return (
      <PixelCard className={cn("p-4", className)}>
        <div className="text-center">
          <div className="animate-spin text-3xl mb-2">⏳</div>
          <p className="text-sm text-gray-400">加载产出率历史...</p>
        </div>
      </PixelCard>
    )
  }
  
  // 如果有错误
  if (error && !history) {
    return (
      <PixelCard className={cn("p-4", className)}>
        <div className="text-center">
          <span className="text-3xl block mb-2">❌</span>
          <p className="text-sm text-red-400 mb-3">加载失败: {error}</p>
          <div className="flex justify-center gap-2">
            <PixelButton size="sm" onClick={refetch}>重试</PixelButton>
            {onClose && (
              <PixelButton size="sm" variant="secondary" onClick={onClose}>
                关闭
              </PixelButton>
            )}
          </div>
        </div>
      </PixelCard>
    )
  }
  
  // 如果没有数据
  if (!history) {
    return null
  }
  
  // 紧凑模式（移动端）
  if (compact) {
    return (
      <PixelCard className={cn("p-3", className)}>
        <div className="space-y-3">
          {/* 标题栏 */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold">产出率历史</h4>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <span className="text-sm">✕</span>
              </button>
            )}
          </div>
          
          {/* 当前状态 */}
          <div className="bg-gray-800 rounded p-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">当前速率</span>
              <span className="text-sm font-bold text-green-400">
                {safeFormatYLD(history.current_rate, 2)}/h
              </span>
            </div>
          </div>
          
          {/* 历史记录 */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {history.rate_history?.map((record, index) => (
              <div key={index} className="bg-gray-800/50 rounded p-2 text-xs">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">第{record.start_hour}小时</span>
                  <span className="text-green-400">{safeFormatYLD(record.rate, 2)}/h</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>工具: {record.tools}/{record.total_tools}</span>
                  <span>占比: {record.ratio}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PixelCard>
    )
  }
  
  // 完整模式（桌面端）
  return (
    <PixelCard className={cn("p-4", className)}>
      <div className="space-y-4">
        {/* 标题栏 */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">产出率历史</h3>
            {sessionInfo && (
              <p className="text-xs text-gray-400 mt-1">
                会话: {sessionInfo.session_id} · {sessionInfo.resource_type || 'YLD'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refetch}
              disabled={loading}
              className="text-gray-400 hover:text-white transition-colors p-1"
              title="刷新"
            >
              <span className={cn("text-lg", loading && "animate-spin")}>🔄</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <span>✕</span>
              </button>
            )}
          </div>
        </div>
        
        {/* 当前状态 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 rounded p-3">
            <p className="text-xs text-gray-400 mb-1">当前产出速率</p>
            <p className="text-xl font-bold text-green-400">
              {safeFormatYLD(history.current_rate, 2)}/h
            </p>
          </div>
          <div className="bg-gray-800 rounded p-3">
            <p className="text-xs text-gray-400 mb-1">资源类型</p>
            <p className="text-xl font-bold text-purple-400">
              {history.resource_type || 'YLD'}
            </p>
          </div>
        </div>
        
        {/* 产出分段 */}
        {history.output_segments && history.output_segments.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-gray-300 mb-2">产出分段统计</h4>
            <div className="space-y-2">
              {history.output_segments.map((segment, index) => (
                <div key={index} className="bg-gray-800/50 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-bold text-white">
                        {segment.period}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        ({segment.hours}小时)
                      </span>
                    </div>
                    <span className="text-sm font-bold text-purple-400">
                      总产出: {safeFormatYLD(segment.output, 2)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">速率: </span>
                      <span className="text-green-400">{safeFormatYLD(segment.rate, 2)}/h</span>
                    </div>
                    <div>
                      <span className="text-gray-400">工具: </span>
                      <span className="text-yellow-400">{segment.tools}个</span>
                    </div>
                    <div>
                      <span className="text-gray-400">占比: </span>
                      <span className="text-blue-400">{segment.ratio}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 详细历史记录 */}
        {history.rate_history && history.rate_history.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-gray-300 mb-2">详细变化记录</h4>
            <div className="bg-gray-800/30 rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="px-3 py-2 text-left text-xs text-gray-400">时间</th>
                    <th className="px-3 py-2 text-right text-xs text-gray-400">起始小时</th>
                    <th className="px-3 py-2 text-right text-xs text-gray-400">速率/h</th>
                    <th className="px-3 py-2 text-right text-xs text-gray-400">工具</th>
                    <th className="px-3 py-2 text-right text-xs text-gray-400">总工具</th>
                    <th className="px-3 py-2 text-right text-xs text-gray-400">占比</th>
                  </tr>
                </thead>
                <tbody>
                  {history.rate_history.map((record, index) => (
                    <tr key={index} className="border-t border-gray-700/50">
                      <td className="px-3 py-2 text-xs text-gray-300">
                        {formatTimestamp(record.time, 'time')}
                      </td>
                      <td className="px-3 py-2 text-right text-xs">
                        第{record.start_hour}小时
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="text-green-400 font-bold">
                          {safeFormatYLD(record.rate, 2)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right text-yellow-400">
                        {record.tools}
                      </td>
                      <td className="px-3 py-2 text-right text-gray-400">
                        {record.total_tools}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-xs",
                          record.ratio >= 80 ? "bg-green-500/20 text-green-400" :
                          record.ratio >= 50 ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-red-500/20 text-red-400"
                        )}>
                          {record.ratio}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* 说明 */}
        <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">ℹ️</span>
            <div className="text-xs text-gray-300 space-y-1">
              <p>• 产出率会根据全网工具数量动态调整</p>
              <p>• 占比越高，产出率越高</p>
              <p>• 历史记录保留最近的变化数据</p>
            </div>
          </div>
        </div>
      </div>
    </PixelCard>
  )
}

export default SessionRateHistory
