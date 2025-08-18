// src/app/mining/SessionSummary.tsx
// 挖矿会话汇总组件 - 修复 YLD 状态显示
// 
// 文件说明：
// 本组件显示挖矿会话的汇总统计信息，包括待收取收益、今日产出、资源状态等
// 
// 修复历史：
// - 2025-01-18: 修复 YLD 今日状态显示，正确处理 percentage_used
// - 2025-01-18: 优化数据结构处理，兼容不同的 API 响应格式

'use client'

import React, { useState, useEffect, memo } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { cn } from '@/lib/utils'
import { formatNumber, getNextSettlementInfo } from './miningUtils'

interface SessionSummaryProps {
  summary: any              // 汇总数据
  yldStatus?: any          // 单独的 YLD 状态数据（可选）
  compact?: boolean         // 紧凑模式
  className?: string        // 自定义样式
}

/**
 * 实时倒计时组件
 * 显示距离下次整点结算的时间
 */
export const SettlementCountdown = memo(() => {
  const [countdown, setCountdown] = useState(getNextSettlementInfo())
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getNextSettlementInfo())
    }, 1000) // 每秒更新
    
    return () => clearInterval(timer)
  }, [])
  
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-900/20 border border-purple-500/30 rounded-full">
      <span className="text-xs text-purple-400">下次结算</span>
      <span className="text-sm font-bold text-purple-300">{countdown.time}</span>
      <span className="text-xs text-gray-400">({countdown.minutes}分钟)</span>
    </div>
  )
})

SettlementCountdown.displayName = 'SettlementCountdown'

/**
 * 挖矿会话汇总组件
 * 显示所有会话的统计信息
 */
export const SessionSummary = memo(({ 
  summary, 
  yldStatus: externalYldStatus,
  compact = false,
  className
}: SessionSummaryProps) => {
  if (!summary) return null
  
  // 解析汇总数据
  const activeSessions = summary.active_sessions || {}
  const resources = summary.resources || {}
  const tools = summary.tools || {}
  const todayProduction = summary.today_production || {}
  const foodSustainability = summary.food_sustainability_hours || 0
  const recentSettlements = summary.recent_settlements || []
  const algorithmVersion = summary.algorithm_version || 'v2'
  
  // 处理 YLD 状态数据 - 优先使用外部传入的，其次使用 summary 中的
  let yldStatus = externalYldStatus || summary.yld_status || {}
  
  // 如果 yldStatus 有 data 字段，说明是完整的 API 响应
  if (yldStatus.data) {
    yldStatus = yldStatus.data
  }
  
  // 计算 YLD 使用情况
  const dailyLimit = yldStatus.daily_limit || 208
  const remaining = yldStatus.remaining != null ? yldStatus.remaining : dailyLimit
  const percentageUsed = yldStatus.percentage_used != null 
    ? yldStatus.percentage_used 
    : ((dailyLimit - remaining) / dailyLimit * 100)
  const used = dailyLimit - remaining
  
  // 调试日志
  console.log('[SessionSummary] YLD Status:', {
    yldStatus,
    dailyLimit,
    remaining,
    used,
    percentageUsed
  })
  
  const sessionsList = activeSessions.sessions || []
  const totalFoodConsumption = activeSessions.total_food_consumption || 0
  const totalPendingRewards = activeSessions.total_pending_rewards || 0
  
  // 紧凑模式（移动端）
  if (compact) {
    return (
      <PixelCard className={cn("p-3", className)}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold">挖矿概况</h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {activeSessions.count || 0} 个会话
            </span>
            <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1 py-0.5 rounded">
              {algorithmVersion}
            </span>
          </div>
        </div>
        
        {/* 核心数据 */}
        <div className="grid grid-cols-3 gap-2 text-xs mb-2">
          <div className="text-center">
            <p className="text-gray-500">待收取</p>
            <p className="font-bold text-green-400">
              {formatNumber(totalPendingRewards, 4)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">今日产出</p>
            <p className="font-bold text-purple-400">
              {formatNumber(todayProduction.total || 0, 4)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">粮食剩余</p>
            <p className="font-bold text-yellow-400">
              {foodSustainability.toFixed(1)}h
            </p>
          </div>
        </div>
        
        {/* YLD限额进度条 */}
        <div className="mt-2">
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-gray-400">YLD今日限额</span>
            <span className={cn(
              "font-bold",
              percentageUsed >= 90 ? "text-red-400" :
              percentageUsed >= 70 ? "text-yellow-400" :
              "text-green-400"
            )}>
              {formatNumber(used, 1)}/{formatNumber(dailyLimit, 0)}
            </span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all",
                percentageUsed >= 90 ? "bg-red-500" :
                percentageUsed >= 70 ? "bg-yellow-500" :
                "bg-green-500"
              )}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
          {percentageUsed > 0 && (
            <p className="text-[10px] text-gray-500 mt-1">
              已使用 {percentageUsed.toFixed(1)}%
            </p>
          )}
        </div>
      </PixelCard>
    )
  }
  
  // 完整模式（桌面端）
  return (
    <PixelCard className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg">挖矿汇总</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {activeSessions.count || 0} 个活跃会话
          </span>
          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
            {algorithmVersion}算法
          </span>
        </div>
      </div>
      
      {/* 主要统计数据 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <div className="bg-green-900/20 rounded p-3">
          <p className="text-xs text-gray-400 mb-1">待收取收益</p>
          <p className="text-lg font-bold text-green-400">
            {formatNumber(totalPendingRewards, 4)}
          </p>
          <p className="text-xs text-gray-500">
            {todayProduction.pending?.hours || 0} 小时待结算
          </p>
        </div>
        
        <div className="bg-purple-900/20 rounded p-3">
          <p className="text-xs text-gray-400 mb-1">今日产出</p>
          <p className="text-lg font-bold text-purple-400">
            {formatNumber(todayProduction.total || used, 4)}
          </p>
          <div className="text-xs text-gray-500">
            <p>已发放: {formatNumber(todayProduction.distributed?.amount || used, 2)}</p>
            <p>待发放: {formatNumber(todayProduction.pending?.amount || 0, 2)}</p>
          </div>
        </div>
        
        <div className="bg-yellow-900/20 rounded p-3">
          <p className="text-xs text-gray-400 mb-1">粮食可持续</p>
          <p className="text-lg font-bold text-yellow-400">
            {foodSustainability != null ? foodSustainability.toFixed(1) : '0.0'} 小时
          </p>
          <p className="text-xs text-gray-500">
            消耗 {totalFoodConsumption}/小时
          </p>
          <p className="text-xs text-orange-400">
            库存 {formatNumber(resources.food || resources.grain || 0, 0)} 单位
          </p>
        </div>
        
        <div className="bg-blue-900/20 rounded p-3">
          <p className="text-xs text-gray-400 mb-1">工具状态</p>
          <p className="text-sm">
            <span className="text-green-400">{tools.idle || 0} 闲置</span>
            <span className="text-gray-400 mx-1">/</span>
            <span className="text-blue-400">{tools.in_use || 0} 使用中</span>
          </p>
          <p className="text-xs text-gray-500">
            共 {tools.total || 0} 个
          </p>
        </div>
      </div>
      
      {/* YLD状态 - 修复显示逻辑 */}
      <div className={cn(
        "p-3 border rounded mb-3",
        percentageUsed >= 90 ? "bg-red-900/20 border-red-500/30" :
        percentageUsed >= 70 ? "bg-yellow-900/20 border-yellow-500/30" :
        "bg-purple-900/20 border-purple-500/30"
      )}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-purple-400">YLD 今日状态</span>
          <span className="text-xs text-gray-400">
            速率: {formatNumber(yldStatus.current_hourly_rate || 0, 2)}/h
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">
                已使用 {percentageUsed.toFixed(1)}%
              </span>
              <span className={cn(
                "font-bold",
                percentageUsed >= 90 ? "text-red-400" :
                percentageUsed >= 70 ? "text-yellow-400" :
                "text-green-400"
              )}>
                {formatNumber(used, 2)} / {formatNumber(dailyLimit, 0)}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all",
                  percentageUsed >= 90 ? "bg-red-500" :
                  percentageUsed >= 70 ? "bg-yellow-500" :
                  "bg-green-500"
                )}
                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">剩余</p>
            <p className={cn(
              "text-sm font-bold",
              remaining < 20 ? "text-red-400" :
              remaining < 50 ? "text-yellow-400" :
              "text-green-400"
            )}>
              {formatNumber(remaining, 2)}
            </p>
          </div>
        </div>
        
        {/* 警告信息 */}
        {yldStatus.warning && (
          <div className="mt-2 p-2 bg-yellow-900/30 border border-yellow-500/30 rounded">
            <p className="text-xs text-yellow-400">⚠️ {yldStatus.warning}</p>
          </div>
        )}
        
        {yldStatus.is_exhausted && (
          <div className="mt-2 p-2 bg-red-900/30 border border-red-500/30 rounded">
            <p className="text-xs text-red-400">🛑 今日YLD产量已耗尽，明日0点后恢复</p>
          </div>
        )}
      </div>
      
      {/* 活跃会话详情 */}
      {sessionsList.length > 0 && (
        <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded mb-3">
          <p className="text-sm font-bold text-blue-400 mb-2">活跃会话详情</p>
          <div className="space-y-2">
            {sessionsList.map((session: any, idx: number) => (
              <div key={idx} className="bg-gray-800/50 rounded p-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-gold-500">{session.session_id}</p>
                    <p className="text-xs text-gray-400">
                      {session.land_name} · {session.resource_type?.toUpperCase() || 'YLD'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-green-400 font-bold">
                      待收 {formatNumber(session.pending_output || 0, 4)}
                    </p>
                    <p className="text-xs text-gray-500">
                      已结算 {session.settled_hours || 0} 小时
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 最近结算记录 */}
      {recentSettlements.length > 0 && (
        <div className="p-3 bg-gray-800/50 rounded">
          <p className="text-sm font-bold text-gray-300 mb-2">最近结算记录</p>
          <div className="space-y-1">
            {recentSettlements.slice(0, 5).map((settlement: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="text-gray-400">{settlement.hour}</span>
                <span className="font-bold text-green-400">
                  {formatNumber(settlement.net_output || 0, 4)} {settlement.resource_type?.toUpperCase()}
                </span>
                <span className="text-gray-500">
                  {settlement.tool_count || 0}工具/{settlement.settled_minutes || 0}分钟
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </PixelCard>
  )
})

SessionSummary.displayName = 'SessionSummary'

export default SessionSummary
