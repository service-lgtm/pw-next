// src/app/ai-mining/page.tsx
// AI智能挖矿独立测试页面
// 
// 文件说明：
// 这是AI挖矿的独立测试页面，用于测试AI挖矿功能
// 独立路由 /ai-mining，不影响原有的 /mining 页面
// 
// 创建原因：
// - 独立测试AI挖矿功能，不影响现有系统
// - 验证AI模式的可行性
// - 收集用户反馈后再集成到主系统
// 
// 功能：
// 1. AI挖矿模式的完整体验
// 2. 模式切换（未来可以切换到专业模式）
// 3. 数据分析展示
// 4. AI建议展示
// 
// 测试方式：
// 访问 /ai-mining 即可看到AI挖矿界面
// 
// 关联文件：
// - 使用 @/app/mining/AIMiningMode.tsx（AI挖矿组件）
// - 使用 @/hooks/useAIMining（AI挖矿Hooks）
// - 使用 @/hooks/useProduction（获取资源数据）
// - 使用 @/hooks/useAuth（认证）

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

// 组件导入
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { AIMiningMode } from '@/app/mining/AIMiningMode'
import type { AIStrategy } from '@/app/mining/AIMiningMode'

// Hooks导入
import { useAuth } from '@/hooks/useAuth'
import { useMyResources, useResourceStats } from '@/hooks/useProduction'
import { 
  useAIMining,
  useAIMiningAnalytics
} from '@/hooks/useAIMining'

// 顶部导航栏组件
function AIMiningHeader({ 
  mode, 
  onModeChange 
}: { 
  mode: 'ai' | 'pro'
  onModeChange: (mode: 'ai' | 'pro') => void 
}) {
  return (
    <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo和标题 */}
          <div className="flex items-center gap-4">
            <Link href="/mining" className="text-gray-400 hover:text-white transition-colors">
              ← 返回
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <h1 className="text-lg font-bold text-white">AI智能挖矿</h1>
                <p className="text-xs text-gray-400">测试版本</p>
              </div>
            </div>
          </div>
          
          {/* 模式切换 */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => onModeChange('ai')}
              className={cn(
                "px-4 py-2 rounded transition-all text-sm font-bold",
                mode === 'ai'
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white"
              )}
            >
              AI模式
            </button>
            <button
              onClick={() => onModeChange('pro')}
              className={cn(
                "px-4 py-2 rounded transition-all text-sm font-bold",
                mode === 'pro'
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white"
              )}
            >
              专业模式
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 数据分析卡片
function AnalyticsCard({ 
  analytics, 
  timeRange, 
  onTimeRangeChange 
}: {
  analytics: any
  timeRange: 'today' | 'week' | 'month'
  onTimeRangeChange: (range: 'today' | 'week' | 'month') => void
}) {
  return (
    <PixelCard className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">数据分析</h3>
        <div className="flex gap-1">
          {(['today', 'week', 'month'] as const).map(range => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={cn(
                "px-3 py-1 text-xs rounded transition-all",
                timeRange === range
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              {range === 'today' ? '今日' : range === 'week' ? '本周' : '本月'}
            </button>
          ))}
        </div>
      </div>
      
      {analytics ? (
        <div className="space-y-3">
          {/* 收益统计 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-800/50 rounded p-2">
              <p className="text-xs text-gray-400">总收益</p>
              <p className="text-lg font-bold text-green-400">
                {analytics.performance?.total_earnings.toFixed(2)} YLD
              </p>
            </div>
            <div className="bg-gray-800/50 rounded p-2">
              <p className="text-xs text-gray-400">日均</p>
              <p className="text-lg font-bold text-blue-400">
                {analytics.performance?.average_daily.toFixed(2)} YLD
              </p>
            </div>
          </div>
          
          {/* 效率评分 */}
          <div className="bg-gray-800/50 rounded p-3">
            <p className="text-xs text-gray-400 mb-2">资源效率</p>
            <div className="space-y-2">
              {Object.entries(analytics.resource_efficiency || {}).map(([key, value]: [string, any]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {key === 'food_usage' ? '粮食利用' :
                     key === 'tool_durability' ? '工具耐久' :
                     key === 'land_utilization' ? '土地利用' :
                     key === 'overall_score' ? '综合评分' : key}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          value > 0.8 ? "bg-green-500" :
                          value > 0.6 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: `${value * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-10 text-right">
                      {(value * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* AI优化统计 */}
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded p-3">
            <p className="text-xs text-purple-400 font-bold mb-2">AI优化成果</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">决策次数</span>
                <p className="font-bold text-white">{analytics.ai_optimization?.decisions_made}</p>
              </div>
              <div>
                <span className="text-gray-500">成功率</span>
                <p className="font-bold text-green-400">
                  {((analytics.ai_optimization?.successful_optimizations / analytics.ai_optimization?.decisions_made) * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <span className="text-gray-500">效率提升</span>
                <p className="font-bold text-blue-400">{analytics.ai_optimization?.efficiency_gain}</p>
              </div>
              <div>
                <span className="text-gray-500">节省操作</span>
                <p className="font-bold text-yellow-400">{analytics.ai_optimization?.saved_operations}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">暂无数据</p>
        </div>
      )}
    </PixelCard>
  )
}

// AI建议卡片
function AIAdviceCard({ advice }: { advice: string[] }) {
  return (
    <PixelCard className="p-4 bg-gradient-to-br from-blue-900/20 to-purple-900/20">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">💡</span>
        <h3 className="font-bold text-blue-400">AI建议</h3>
      </div>
      
      {advice && advice.length > 0 ? (
        <div className="space-y-2">
          {advice.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span>
              <p className="text-xs text-gray-300">{item}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500">AI正在分析中...</p>
      )}
    </PixelCard>
  )
}

// 主页面组件
export default function AIMiningPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  
  // 状态管理
  const [mode, setMode] = useState<'ai' | 'pro'>('ai')
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<'today' | 'week' | 'month'>('today')
  
  // 获取资源数据
  const { resources: rawResources } = useMyResources({ 
    enabled: !authLoading && isAuthenticated,
    useStats: true 
  })
  const { stats: resourceStats } = useResourceStats({ 
    enabled: !authLoading && isAuthenticated 
  })
  
  // 使用AI挖矿Hook
  const {
    status,
    analytics: rawAnalytics,
    advice,
    isRunning,
    start,
    stop,
    refresh,
    loading: aiLoading
  } = useAIMining()
  
  // 获取指定时间范围的分析数据
  const { analytics } = useAIMiningAnalytics({
    enabled: true,
    timeRange: analyticsTimeRange
  })
  
  // 处理资源数据
  const resources = {
    wood: rawResources?.wood || resourceStats?.data?.resources?.wood?.available || 100,
    iron: rawResources?.iron || resourceStats?.data?.resources?.iron?.available || 80,
    stone: rawResources?.stone || resourceStats?.data?.resources?.stone?.available || 120,
    food: rawResources?.food || rawResources?.grain || resourceStats?.data?.resources?.food?.available || 150,
    yld: rawResources?.yld || resourceStats?.data?.wallet?.yld_balance || 10
  }
  
  // 处理AI启动
  const handleAIStart = async (strategy: AIStrategy, percentage: number) => {
    try {
      await start(strategy, percentage)
      refresh()
    } catch (error) {
      console.error('[AIMiningPage] Start failed:', error)
    }
  }
  
  // 处理AI停止
  const handleAIStop = async () => {
    try {
      await stop()
      refresh()
    } catch (error) {
      console.error('[AIMiningPage] Stop failed:', error)
    }
  }
  
  // 认证检查
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录')
      router.push('/login?redirect=/ai-mining')
    }
  }, [authLoading, isAuthenticated, router])
  
  // 处理模式切换
  const handleModeChange = (newMode: 'ai' | 'pro') => {
    if (newMode === 'pro') {
      // 切换到专业模式，跳转到原挖矿页面
      router.push('/mining')
    } else {
      setMode(newMode)
    }
  }
  
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⏳</div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return null
  }
  
  return (
    <div className="min-h-screen bg-gray-900">
      {/* 顶部导航 */}
      <AIMiningHeader mode={mode} onModeChange={handleModeChange} />
      
      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧 - AI挖矿主界面 */}
          <div className="lg:col-span-2">
            <AIMiningMode
              resources={resources}
              onStart={handleAIStart}
              onStop={handleAIStop}
              onRefresh={refresh}
              isRunning={isRunning}
              loading={aiLoading}
            />
          </div>
          
          {/* 右侧 - 数据和建议 */}
          <div className="space-y-4">
            {/* 快速统计 */}
            <PixelCard className="p-4">
              <h3 className="font-bold mb-3">快速统计</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">状态</span>
                  <span className={cn(
                    "text-sm font-bold",
                    isRunning ? "text-green-400" : "text-gray-400"
                  )}>
                    {isRunning ? '运行中' : '未启动'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">今日收益</span>
                  <span className="text-sm font-bold text-green-400">
                    {status?.today_earnings.toFixed(2) || '0.00'} YLD
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">管理会话</span>
                  <span className="text-sm font-bold text-blue-400">
                    {status?.sessions_managed || 0} 个
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">运行效率</span>
                  <span className="text-sm font-bold text-purple-400">
                    {status?.efficiency.toFixed(0) || 0}%
                  </span>
                </div>
              </div>
            </PixelCard>
            
            {/* 数据分析 */}
            <AnalyticsCard
              analytics={analytics || rawAnalytics}
              timeRange={analyticsTimeRange}
              onTimeRangeChange={setAnalyticsTimeRange}
            />
            
            {/* AI建议 */}
            <AIAdviceCard advice={advice || []} />
            
            {/* 帮助信息 */}
            <PixelCard className="p-4 bg-yellow-900/20 border border-yellow-500/30">
              <div className="flex items-start gap-2">
                <span className="text-yellow-400">ℹ️</span>
                <div className="text-xs text-gray-300">
                  <p className="font-bold text-yellow-400 mb-1">使用说明</p>
                  <ul className="space-y-1">
                    <li>• AI会自动管理您的挖矿操作</li>
                    <li>• 选择策略影响收益和资源消耗</li>
                    <li>• 可以随时停止并收回资源</li>
                    <li>• 收益每小时自动结算</li>
                  </ul>
                </div>
              </div>
            </PixelCard>
          </div>
        </div>
        
        {/* 底部信息 */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>AI挖矿测试版 v0.1.0 | 仅供测试使用</p>
          <p className="mt-1">
            如遇问题请 
            <Link href="/mining" className="text-blue-400 hover:text-blue-300 mx-1">
              返回专业模式
            </Link>
            或联系客服
          </p>
        </div>
      </div>
    </div>
  )
}
