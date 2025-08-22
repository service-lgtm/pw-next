// src/hooks/useAIMining.ts
// AI智能挖矿系统 Hooks
// 
// 文件说明：
// 提供AI挖矿相关的所有Hooks，包括启动、停止、状态查询等
// 这些Hooks封装了AI挖矿的业务逻辑，与后端API交互
// 
// 创建原因：
// - 为AI挖矿模式提供数据层支持
// - 封装复杂的AI决策逻辑
// - 管理AI挖矿状态
// 
// 主要功能：
// 1. useAIMiningStart - 启动AI挖矿
// 2. useAIMiningStatus - 查询AI挖矿状态  
// 3. useAIMiningStop - 停止AI挖矿
// 4. useAIMiningAnalytics - 获取AI分析数据
// 
// 关联文件：
// - 被 @/app/mining/AIMiningMode.tsx 使用
// - 被 @/app/ai-mining/page.tsx 使用
// - 调用 @/lib/api/ai-mining.ts（AI挖矿API）
// - 使用 @/types/ai-mining.ts（类型定义）

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { productionApi } from '@/lib/api/production'
import toast from 'react-hot-toast'
import type { AIStrategy } from '@/app/mining/AIMiningMode'

// AI挖矿状态类型
export interface AIMiningSummary {
  is_running: boolean
  strategy: AIStrategy
  resource_percentage: number
  start_time: string | null
  sessions_managed: number
  tools_in_use: number
  lands_active: number
  today_earnings: number
  total_earnings: number
  efficiency: number
  next_settlement_time: string
  next_settlement_minutes: number
  resource_status: {
    food_hours_remaining: number
    yld_percentage_remaining: number
    tools_health: number
  }
  alerts: Array<{
    type: 'warning' | 'error' | 'info'
    message: string
    timestamp: string
  }>
  ai_decisions: Array<{
    time: string
    action: string
    reason: string
    impact: string
  }>
}

// ==================== 启动AI挖矿 ====================
export function useAIMiningStart() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const startAIMining = useCallback(async (
    strategy: AIStrategy, 
    resourcePercentage: number
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      // 由于后端暂未实现AI接口，这里模拟调用
      // 实际应该调用: productionApi.ai.start({ strategy, resource_percentage })
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 模拟成功响应
      const mockResponse = {
        success: true,
        data: {
          message: 'AI挖矿已启动',
          strategy,
          resource_percentage: resourcePercentage,
          estimated_daily_earnings: 150 + Math.random() * 100,
          sessions_started: Math.floor(Math.random() * 3) + 1,
          tools_allocated: Math.floor(Math.random() * 10) + 5
        }
      }
      
      console.log('[useAIMiningStart] Started with:', { strategy, resourcePercentage })
      console.log('[useAIMiningStart] Mock response:', mockResponse)
      
      // 保存AI状态到localStorage（临时方案）
      localStorage.setItem('ai_mining_state', JSON.stringify({
        is_running: true,
        strategy,
        resource_percentage: resourcePercentage,
        start_time: new Date().toISOString()
      }))
      
      return mockResponse.data
    } catch (err: any) {
      const errorMessage = err?.message || '启动AI挖矿失败'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])
  
  return {
    startAIMining,
    loading,
    error
  }
}

// ==================== 查询AI挖矿状态 ====================
export function useAIMiningStatus(options?: {
  enabled?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}) {
  const { 
    enabled = true, 
    autoRefresh = false, 
    refreshInterval = 60000 
  } = options || {}
  
  const [status, setStatus] = useState<AIMiningSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)
  const fetchingRef = useRef(false)
  
  const fetchStatus = useCallback(async () => {
    if (!enabled || fetchingRef.current) return
    
    fetchingRef.current = true
    setLoading(true)
    setError(null)
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 从localStorage获取状态（临时方案）
      const savedState = localStorage.getItem('ai_mining_state')
      const aiState = savedState ? JSON.parse(savedState) : null
      
      // 计算运行时间
      const startTime = aiState?.start_time ? new Date(aiState.start_time) : null
      const runningHours = startTime 
        ? (Date.now() - startTime.getTime()) / (1000 * 60 * 60)
        : 0
      
      // 生成模拟数据
      const mockStatus: AIMiningSummary = {
        is_running: aiState?.is_running || false,
        strategy: aiState?.strategy || 'balanced',
        resource_percentage: aiState?.resource_percentage || 0,
        start_time: aiState?.start_time || null,
        sessions_managed: aiState?.is_running ? Math.floor(Math.random() * 5) + 1 : 0,
        tools_in_use: aiState?.is_running ? Math.floor(Math.random() * 15) + 5 : 0,
        lands_active: aiState?.is_running ? Math.floor(Math.random() * 3) + 1 : 0,
        today_earnings: aiState?.is_running ? 50 + Math.random() * 200 : 0,
        total_earnings: aiState?.is_running ? runningHours * 20 + Math.random() * 50 : 0,
        efficiency: aiState?.is_running ? 80 + Math.random() * 20 : 0,
        next_settlement_time: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
        next_settlement_minutes: 45,
        resource_status: {
          food_hours_remaining: 24 + Math.random() * 48,
          yld_percentage_remaining: 30 + Math.random() * 50,
          tools_health: 70 + Math.random() * 30
        },
        alerts: aiState?.is_running ? [
          {
            type: 'info' as const,
            message: 'AI正在优化挖矿策略',
            timestamp: new Date().toISOString()
          }
        ] : [],
        ai_decisions: aiState?.is_running ? [
          {
            time: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            action: '切换土地',
            reason: '检测到更高产出率',
            impact: '+15% 效率'
          },
          {
            time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            action: '调整工具分配',
            reason: '优化资源利用',
            impact: '+8% 产出'
          }
        ] : []
      }
      
      setStatus(mockStatus)
      hasFetchedRef.current = true
    } catch (err: any) {
      console.error('[useAIMiningStatus] Error:', err)
      setError(err?.message || '获取AI状态失败')
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [enabled])
  
  // 初始加载
  useEffect(() => {
    if (enabled && !hasFetchedRef.current) {
      fetchStatus()
    }
  }, [enabled])
  
  // 自动刷新
  useEffect(() => {
    if (!autoRefresh || !enabled) return
    
    const interval = setInterval(() => {
      if (!fetchingRef.current) {
        fetchStatus()
      }
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [autoRefresh, enabled, refreshInterval, fetchStatus])
  
  return {
    status,
    loading,
    error,
    refetch: () => {
      hasFetchedRef.current = false
      return fetchStatus()
    }
  }
}

// ==================== 停止AI挖矿 ====================
export function useAIMiningStop() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const stopAIMining = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 获取当前状态计算收益
      const savedState = localStorage.getItem('ai_mining_state')
      const aiState = savedState ? JSON.parse(savedState) : null
      
      const mockResponse = {
        success: true,
        data: {
          message: 'AI挖矿已停止',
          total_earnings: aiState?.is_running ? 150 + Math.random() * 100 : 0,
          sessions_stopped: aiState?.is_running ? Math.floor(Math.random() * 3) + 1 : 0,
          tools_released: aiState?.is_running ? Math.floor(Math.random() * 10) + 5 : 0,
          final_efficiency: aiState?.is_running ? 85 + Math.random() * 15 : 0
        }
      }
      
      // 清除AI状态
      localStorage.removeItem('ai_mining_state')
      
      toast.success(
        `AI挖矿已停止\n总收益: ${mockResponse.data.total_earnings.toFixed(2)} YLD`,
        { duration: 5000 }
      )
      
      return mockResponse.data
    } catch (err: any) {
      const errorMessage = err?.message || '停止AI挖矿失败'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])
  
  return {
    stopAIMining,
    loading,
    error
  }
}

// ==================== AI分析数据 ====================
export function useAIMiningAnalytics(options?: {
  enabled?: boolean
  timeRange?: 'today' | 'week' | 'month'
}) {
  const { enabled = true, timeRange = 'today' } = options || {}
  
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchAnalytics = useCallback(async () => {
    if (!enabled) return
    
    setLoading(true)
    setError(null)
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 生成模拟分析数据
      const mockAnalytics = {
        time_range: timeRange,
        performance: {
          total_earnings: timeRange === 'today' ? 150 : timeRange === 'week' ? 1200 : 5000,
          average_daily: timeRange === 'today' ? 150 : timeRange === 'week' ? 171 : 166,
          best_day: 245,
          worst_day: 89,
          trend: '+12.5%'
        },
        resource_efficiency: {
          food_usage: 0.85,
          tool_durability: 0.72,
          land_utilization: 0.93,
          overall_score: 0.83
        },
        ai_optimization: {
          decisions_made: timeRange === 'today' ? 47 : timeRange === 'week' ? 329 : 1420,
          successful_optimizations: timeRange === 'today' ? 42 : timeRange === 'week' ? 298 : 1285,
          efficiency_gain: '+18.3%',
          saved_operations: timeRange === 'today' ? 23 : timeRange === 'week' ? 161 : 692
        },
        predictions: {
          next_24h_earnings: 165,
          recommended_strategy: 'balanced',
          risk_level: 'low',
          opportunities: [
            'YLD产量将在3小时后恢复',
            '建议增加工具投入提升效率',
            '检测到2块高产土地可用'
          ]
        }
      }
      
      setAnalytics(mockAnalytics)
    } catch (err: any) {
      console.error('[useAIMiningAnalytics] Error:', err)
      setError(err?.message || '获取分析数据失败')
    } finally {
      setLoading(false)
    }
  }, [enabled, timeRange])
  
  useEffect(() => {
    if (enabled) {
      fetchAnalytics()
    }
  }, [enabled, timeRange, fetchAnalytics])
  
  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  }
}

// ==================== AI建议 ====================
export function useAIMiningAdvice() {
  const [advice, setAdvice] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  
  const getAdvice = useCallback(async () => {
    setLoading(true)
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 600))
      
      // 生成模拟建议
      const mockAdvice = [
        '当前YLD产量较低，建议切换到保守策略',
        '检测到3个闲置工具，可以增加挖矿效率',
        '粮食储备充足，可以考虑激进策略',
        '预计2小时后有高产时段，建议保持运行',
        '工具耐久度较低，建议合成新工具'
      ]
      
      // 随机选择2-3条建议
      const selectedAdvice = mockAdvice
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 2) + 2)
      
      setAdvice(selectedAdvice)
    } catch (err) {
      console.error('[useAIMiningAdvice] Error:', err)
      setAdvice(['暂时无法获取AI建议'])
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    getAdvice()
  }, [])
  
  return {
    advice,
    loading,
    refetch: getAdvice
  }
}

// ==================== 综合Hook ====================
export function useAIMining() {
  const { startAIMining, loading: startLoading } = useAIMiningStart()
  const { stopAIMining, loading: stopLoading } = useAIMiningStop()
  const { status, loading: statusLoading, refetch: refetchStatus } = useAIMiningStatus({
    enabled: true,
    autoRefresh: true,
    refreshInterval: 30000
  })
  const { analytics, refetch: refetchAnalytics } = useAIMiningAnalytics()
  const { advice } = useAIMiningAdvice()
  
  return {
    // 状态
    status,
    analytics,
    advice,
    isRunning: status?.is_running || false,
    
    // 操作
    start: startAIMining,
    stop: stopAIMining,
    refresh: () => {
      refetchStatus()
      refetchAnalytics()
    },
    
    // 加载状态
    loading: startLoading || stopLoading || statusLoading,
    
    // 便捷数据
    summary: status ? {
      earnings: status.today_earnings,
      efficiency: status.efficiency,
      sessions: status.sessions_managed,
      nextSettlement: status.next_settlement_minutes
    } : null
  }
}
