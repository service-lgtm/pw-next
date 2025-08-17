// src/app/mining/SessionCard.tsx
// 挖矿会话卡片组件
// 
// 文件说明：
// 本组件负责显示单个挖矿会话的详细信息，包括待收取收益、结算状态、运行时长等
// 从 MiningSessions.tsx 中的 SessionCardV2 组件拆分出来
// 
// 创建原因：
// - SessionCard 是一个独立的展示组件，应该单独管理
// - 支持移动端和桌面端两种显示模式
// - 便于未来添加更多会话展示功能
// 
// 功能特性：
// 1. 显示会话基本信息（ID、土地、资源类型）
// 2. 显示新算法v2的结算状态
// 3. 实时显示当前小时挖矿进度
// 4. 显示待收取收益和已结算时段
// 5. 支持移动端紧凑显示
// 
// 使用方式：
// <SessionCard
//   session={sessionData}
//   onStop={() => handleStop(session.id)}
//   onViewHistory={() => handleViewHistory(session.id)}
//   isMobile={isMobile}
// />
// 
// 关联文件：
// - 被 MiningSessions.tsx 使用（主挖矿会话组件）
// - 使用 miningUtils.ts 中的格式化函数
// - 使用 @/components/shared 中的 UI 组件
// 
// 更新历史：
// - 2025-01: 从 MiningSessions.tsx 拆分出来
// - 2025-01: 优化移动端显示效果

'use client'

import React, { useState, useEffect, memo } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { cn } from '@/lib/utils'
import { 
  formatNumber, 
  formatDuration, 
  getNextSettlementInfo 
} from './miningUtils'

interface SessionCardProps {
  session: any                    // 会话数据
  onStop: () => void              // 停止回调
  onViewHistory: () => void       // 查看历史回调
  isMobile?: boolean              // 是否移动端
  className?: string              // 自定义样式
}

/**
 * 挖矿会话卡片组件
 * 显示单个挖矿会话的详细信息
 */
export const SessionCard = memo(({ 
  session, 
  onStop,
  onViewHistory,
  isMobile = false,
  className
}: SessionCardProps) => {
  // 定时更新当前时间，用于刷新显示
  const [currentTime, setCurrentTime] = useState(Date.now())
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 60000) // 每分钟更新一次
    
    return () => clearInterval(timer)
  }, [])
  
  // 解析会话数据（兼容不同的数据格式）
  const sessionId = session.session_id || `Session-${session.id}`
  const landName = session.land_name || session.land_id || '未知土地'
  const startTime = session.started_at
  const toolCount = session.tool_count || 0
  const foodConsumption = session.food_consumption_rate || session.food_consumption || 0
  const resourceType = session.resource_type || 'yld'
  const algorithmVersion = session.algorithm_version || 'v2'
  
  // 核心数据 - 新算法v2字段
  const pendingOutput = session.pending_output || session.pending_rewards || 0
  const settledHours = session.settled_hours || session.hours_settled || 0
  const totalHoursWorked = session.total_hours_worked || session.hours_worked || 0
  const currentHourMinutes = session.current_hour_minutes || 0
  const currentHourStatus = session.current_hour_status || `累积中(${currentHourMinutes}/60)`
  const lastSettlementHour = session.last_settlement_hour || null
  
  // 获取下次结算信息
  const nextSettlement = getNextSettlementInfo()
  
  // 移动端紧凑显示
  if (isMobile) {
    return (
      <div className={cn("bg-gray-800 rounded-lg p-3", className)}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-bold text-sm text-gold-500">
              {sessionId}
            </p>
            <p className="text-[10px] text-gray-400">
              {landName} · {formatDuration(startTime)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <span className="bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded text-[10px]">
              {algorithmVersion.toUpperCase()}
            </span>
            <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded text-[10px]">
              挖矿中
            </span>
          </div>
        </div>
        
        {/* 核心数据 */}
        <div className="grid grid-cols-3 gap-2 mb-2 text-[11px]">
          <div>
            <p className="text-gray-500">待收取</p>
            <p className="font-bold text-green-400">{formatNumber(pendingOutput, 4)}</p>
          </div>
          <div>
            <p className="text-gray-500">已结算</p>
            <p className="font-bold text-blue-400">{settledHours}小时</p>
          </div>
          <div>
            <p className="text-gray-500">当前小时</p>
            <p className="font-bold text-yellow-400">{currentHourMinutes}分钟</p>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="grid grid-cols-2 gap-1.5">
          <PixelButton
            size="xs"
            variant="secondary"
            onClick={onStop}
            className="text-[11px]"
          >
            结束挖矿
          </PixelButton>
          <PixelButton
            size="xs"
            variant="secondary"
            onClick={onViewHistory}
            className="text-[11px]"
          >
            历史
          </PixelButton>
        </div>
      </div>
    )
  }
  
  // 桌面端完整显示
  return (
    <PixelCard className={cn("overflow-hidden", className)}>
      {/* 头部信息 */}
      <div className="bg-gray-800/50 px-4 py-3 border-b border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-gold-500">
              {sessionId}
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              {landName} · {resourceType.toUpperCase()}矿山
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">
              {algorithmVersion.toUpperCase()}
            </span>
            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
              挖矿中
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {/* 新算法v2状态 */}
        <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-purple-400">新算法v2 状态</span>
            <span className="text-xs text-gray-400">整点结算</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400">待收取净收益</p>
              <p className="text-lg font-bold text-green-400">
                {formatNumber(pendingOutput, 6)}
              </p>
              <p className="text-xs text-gray-500">停止时发放</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">已结算时段</p>
              <p className="text-lg font-bold text-blue-400">{settledHours} 小时</p>
              <p className="text-xs text-gray-500">每小时整点结算</p>
            </div>
          </div>
        </div>
        
        {/* 当前小时进度 */}
        <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">当前小时挖矿进度</p>
              <p className="text-sm font-bold text-yellow-400">
                {currentHourMinutes} / 60 分钟
              </p>
              <p className="text-xs text-gray-500 mt-1">{currentHourStatus}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">下次结算</p>
              <p className="text-sm font-bold text-yellow-400">{nextSettlement.time}</p>
              <p className="text-xs text-gray-500">{nextSettlement.minutes}分钟后</p>
            </div>
          </div>
          
          {/* 进度条 */}
          {currentHourMinutes < 60 && (
            <div className="mt-2">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 rounded-full transition-all"
                  style={{ width: `${(currentHourMinutes / 60) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                累积中，满60分钟才参与结算
              </p>
            </div>
          )}
        </div>
        
        {/* 基本信息 */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-gray-400 text-xs">挖矿时长</p>
            <p className="font-bold text-blue-400">{formatDuration(startTime)}</p>
            <p className="text-xs text-gray-500">({totalHoursWorked.toFixed(2)}小时)</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">工具数量</p>
            <p className="font-bold text-yellow-400">{toolCount} 个</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">粮食消耗</p>
            <p className="font-bold text-orange-400">{foodConsumption}/小时</p>
          </div>
        </div>
        
        {/* 最后结算时间 */}
        {lastSettlementHour && (
          <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
            <span className="text-xs text-gray-400">最后结算时间</span>
            <span className="text-sm text-gray-300">{lastSettlementHour}</span>
          </div>
        )}
        
        {/* 提示信息 */}
        <div className="p-2 bg-red-900/20 border border-red-500/30 rounded">
          {pendingOutput > 0 ? (
            <p className="text-xs text-yellow-400">
              💰 您有 {formatNumber(pendingOutput, 4)} {resourceType.toUpperCase()} 待收取，停止挖矿即可获得
            </p>
          ) : (
            <p className="text-xs text-red-400">
              ⚠️ 重要：收益在整点结算但不发放，需要停止挖矿才能收取所有待收取收益
            </p>
          )}
        </div>
        
        {/* 操作按钮 */}
        <div className="grid grid-cols-2 gap-2">
          <PixelButton
            size="sm"
            variant="primary"
            onClick={onStop}
            className="w-full"
          >
            <span className="flex items-center justify-center gap-1">
              <span>💰</span>
              <span>结束并收取</span>
            </span>
          </PixelButton>
          <PixelButton
            size="sm"
            variant="secondary"
            onClick={onViewHistory}
            className="w-full"
          >
            <span className="flex items-center justify-center gap-1">
              <span>📊</span>
              <span>历史</span>
            </span>
          </PixelButton>
        </div>
      </div>
    </PixelCard>
  )
})

SessionCard.displayName = 'SessionCard'

export default SessionCard
