// src/app/mining/SessionSummary.tsx
// 挖矿会话汇总组件
// 
// 文件说明：
// 本组件显示挖矿会话的汇总统计信息，包括待收取收益、今日产出、资源状态等
// 从 MiningSessions.tsx 中的 MiningSummaryCard 组件拆分出来
// 
// 创建原因：
// - 汇总信息展示是独立功能，应该单独管理
// - 支持紧凑和完整两种显示模式
// - 便于添加更多统计功能
// 
// 功能特性：
// 1. 显示活跃会话统计
// 2. 显示待收取收益总额
// 3. 显示今日产出统计
// 4. 显示资源库存和消耗
// 5. 显示YLD限额状态
// 6. 显示最近结算记录
// 
// 使用方式：
// <SessionSummary
//   summary={miningSummary}
//   compact={isMobile}
// />
// 
// 关联文件：
// - 被 MiningSessions.tsx 使用（主挖矿会话组件）
// - 使用 miningUtils.ts 中的格式化函数
// - 使用 @/components/shared 中的 UI 组件
// 
// 更新历史：
// - 2025-01: 从 MiningSessions.tsx 拆分出来
// - 2025-01: 添加实时倒计时组件

'use client'

import React, { useState, useEffect, memo } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { cn } from '@/lib/utils'
import { formatNumber, getNextSettlementInfo } from './miningUtils'

interface SessionSummaryProps {
  summary: any              // 汇总数据
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
  compact = false,
  className
}: SessionSummaryProps) => {
  if (!summary) return null
  
  // 解析汇总数据
  const activeSessions = summary.active_sessions || {}
  const resources = summary.resources || {}
  const tools = summary.tools || {}
  const yldStatus = summary.yld_status || {}
  const todayProduction = summary.today_production || {}
  const foodSustainability = summary.food_sustainability_hours || 0
  const recentSettlements = summary.recent_settlements || []
  const algorithmVersion = summary.algorithm_version || 'v2'
  
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
            <span className="text-gray-400">
              {formatNumber(yldStatus.remaining || 0, 0)}/{formatNumber(yldStatus.daily_limit || 208, 0)}
            </span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full",
                yldStatus.percentage_used >= 90 ? "bg-red-500" :
                yldStatus.percentage_used >= 70 ? "bg-yellow-500" :
                "bg-green-500"
              )}
              style={{ width: `${100 - (yldStatus.percentage_used || 0)}%` }}
            />
          </div>
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
            {formatNumber(todayProduction.total || 0, 4)}
          </p>
          <div className="text-xs text-gray-500">
            <p>已发放: {formatNumber(todayProduction.distributed?.amount || 0, 2)}</p>
            <p>待发放: {formatNumber(todayProduction.pending?.amount || 0, 2)}</p>
          </div>
        </div>
        
        <div className="bg-yellow-900/20 rounded p-3">
          <p className="text-xs text-gray-400 mb-1">粮食可持续</p>
          <p className="text-lg font-bold text-yellow-400">
            {foodSustainability.toFixed(1)} 小时
          </p>
          <p className="text-xs text-gray-500">
            消耗 {totalFoodConsumption}/小时
          </p>
          <p className="text-xs text-orange-400">
            库存 {formatNumber(resources.food || 0, 0)} 单位
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
      
      {/* YLD状态 */}
      <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-purple-400">YLD 今日状态</span>
          <span className="text-xs text-gray-400">
            速率: {formatNumber(yldStatus.current_hourly_rate || 0, 2)}/h
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">已使用</span>
              <span className="text-gray-400">
                {formatNumber(yldStatus.daily_limit - yldStatus.remaining, 2)} / {formatNumber(yldStatus.daily_limit || 208, 0)}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all",
                  yldStatus.percentage_used >= 90 ? "bg-red-500" :
                  yldStatus.percentage_used >= 70 ? "bg-yellow-500" :
                  "bg-green-500"
                )}
                style={{ width: `${yldStatus.percentage_used || 0}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">剩余</p>
            <p className="text-sm font-bold text-yellow-400">
              {formatNumber(yldStatus.remaining || 0, 2)}
            </p>
          </div>
        </div>
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
                      待收 {formatNumber(session.pending_output, 4)}
                    </p>
                    <p className="text-xs text-gray-500">
                      已结算 {session.settled_hours} 小时
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
            {recentSettlements.map((settlement: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="text-gray-400">{settlement.hour}</span>
                <span className="font-bold text-green-400">
                  {formatNumber(settlement.net_output, 4)} {settlement.resource_type?.toUpperCase()}
                </span>
                <span className="text-gray-500">
                  {settlement.tool_count}工具/{settlement.settled_minutes}分钟
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
