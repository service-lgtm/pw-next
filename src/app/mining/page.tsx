// src/app/mining/page.tsx
// 挖矿中心页面 - 简化重组版
// 
// 优化说明：
// 1. 拆分了独立组件（矿山市场、招聘市场、合成系统）
// 2. 合成系统提升为一级导航
// 3. 简化了页面结构，提高可维护性
// 4. 修复了 iPad 兼容性问题
// 5. 更新了按钮文字（去挖矿）
// 
// 关联组件（同目录下）：
// - ./BetaPasswordModal: 内测密码验证
// - ./BetaNotice: 内测提示组件
// - ./YLDMineList: YLD矿山列表
// - ./MiningSessions: 挖矿会话管理
// - ./ToolManagement: 工具管理
// - ./MiningStats: 统计信息
// - ./MiningMarket: 矿山市场（新拆分）
// - ./HiringMarket: 招聘市场（新拆分）
// - ./SynthesisSystem: 合成系统（新拆分）
// - ./YLDSystemStatus: YLD系统状态监控
//
// 更新历史：
// - 2024-12: 重组页面结构，拆分独立组件

'use client'

import { useState, useEffect, useCallback, useMemo, memo, Component, ReactNode, ErrorInfo } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { safeFormatYLD, safeFormatResource } from '@/utils/formatters'

// 组件导入
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { BetaPasswordModal, hasBetaAccess } from './BetaPasswordModal'
import { BetaNotice, BetaBanner } from './BetaNotice'
import { YLDMineList } from './YLDMineList'
import { MiningSessions } from './MiningSessions'
import { ToolManagement } from './ToolManagement'
import { MiningStats } from './MiningStats'
import { MiningMarket } from './MiningMarket'
import { HiringMarket } from './HiringMarket'
import { SynthesisSystem } from './SynthesisSystem'

// Hooks 导入
import { useAuth } from '@/hooks/useAuth'
import { useMyYLDMines, useYLDMineDetail } from '@/hooks/useYLDMines'
import {
  useMiningSessions,
  useMyTools,
  useMyResources,
  useResourceStats,
  useStartSelfMining,
  useSynthesizeTool,
  useStopProduction,
  useCollectOutput,
  useGrainStatus,
  useUserLands,
  useYLDStatus,
  useMiningSummary
} from '@/hooks/useProduction'

// 类型导入
import type { YLDMine } from '@/types/assets'

// 错误边界组件
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[MiningPage ErrorBoundary] Caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-xl text-white mb-2">页面加载出错</h2>
              <p className="text-gray-400 mb-4 text-sm">
                {this.state.error?.message || '发生了一个未知错误'}
              </p>
              <div className="space-y-2">
                <PixelButton
                  onClick={() => {
                    this.setState({ hasError: false, error: undefined })
                    window.location.reload()
                  }}
                  className="w-full"
                >
                  刷新页面
                </PixelButton>
                <PixelButton
                  variant="secondary"
                  onClick={() => window.history.back()}
                  className="w-full"
                >
                  返回上一页
                </PixelButton>
              </div>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

// 移动端资源显示组件
const MobileResourceBar = memo(({ resources, resourceStats, grainStatus, miningSummary }: any) => {
  const getResourceAmount = (type: string) => {
    if (miningSummary?.resources?.[type] !== undefined) {
      return miningSummary.resources[type]
    }
    if (resourceStats?.data?.resources?.[type]?.available !== undefined) {
      return resourceStats.data.resources[type].available
    }
    if (resources?.[type] !== undefined) {
      return resources[type]
    }
    return 0
  }

  const getFoodRemainingHours = () => {
    if (grainStatus?.hours_remaining != null) {
      return typeof grainStatus.hours_remaining === 'number' 
        ? grainStatus.hours_remaining 
        : parseFloat(grainStatus.hours_remaining) || 0
    }
    if (grainStatus?.hours_sustainable != null) {
      return typeof grainStatus.hours_sustainable === 'number'
        ? grainStatus.hours_sustainable
        : parseFloat(grainStatus.hours_sustainable) || 0
    }
    return 0
  }

  return (
    <div className="grid grid-cols-4 gap-1 mb-3 md:hidden">
      <div className="bg-gray-800 rounded p-2 text-center">
        <p className="text-[10px] text-gray-400">木头</p>
        <p className="text-xs font-bold text-green-400">
          {safeFormatResource(getResourceAmount('wood'))}
        </p>
      </div>
      <div className="bg-gray-800 rounded p-2 text-center">
        <p className="text-[10px] text-gray-400">铁矿</p>
        <p className="text-xs font-bold text-gray-400">
          {safeFormatResource(getResourceAmount('iron'))}
        </p>
      </div>
      <div className="bg-gray-800 rounded p-2 text-center">
        <p className="text-[10px] text-gray-400">石头</p>
        <p className="text-xs font-bold text-blue-400">
          {safeFormatResource(getResourceAmount('stone'))}
        </p>
      </div>
      <div className="bg-gray-800 rounded p-2 text-center">
        <p className="text-[10px] text-gray-400">粮食</p>
        <p className="text-xs font-bold text-yellow-400">
          {safeFormatResource(
            getResourceAmount('food') || getResourceAmount('grain')
          )}
        </p>
        {grainStatus?.warning && (
          <p className="text-[10px] text-red-400">
            {safeFormatResource(getFoodRemainingHours(), 0)}h
          </p>
        )}
      </div>
    </div>
  )
})

MobileResourceBar.displayName = 'MobileResourceBar'

// 挖矿汇总卡片组件
const MiningSummaryCard = memo(({ summary, compact = false }: any) => {
  if (!summary) return null

  if (compact) {
    return (
      <PixelCard className="p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold">挖矿概况</h4>
          <span className="text-xs text-gray-400">
            {summary.active_sessions?.count || 0} 个会话
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <p className="text-gray-500">总速率</p>
            <p className="font-bold text-green-400">
              {safeFormatYLD(summary.active_sessions?.total_hourly_output || 0, 2)}/h
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">今日产出</p>
            <p className="font-bold text-purple-400">
              {safeFormatYLD(summary.today_production?.total_output || 0, 2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">粮食剩余</p>
            <p className="font-bold text-yellow-400">
              {safeFormatResource(summary.food_sustainability_hours || 0, 1)}h
            </p>
          </div>
        </div>
      </PixelCard>
    )
  }

  return (
    <PixelCard className="p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg">挖矿汇总</h3>
        <div className="text-sm text-gray-400">
          活跃会话: {summary.active_sessions?.count || 0}
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gray-800 rounded p-3">
          <p className="text-xs text-gray-400 mb-1">总产出速率</p>
          <p className="text-lg font-bold text-green-400">
            {safeFormatYLD(summary.active_sessions?.total_hourly_output || 0, 2)}/h
          </p>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <p className="text-xs text-gray-400 mb-1">今日产出</p>
          <p className="text-lg font-bold text-purple-400">
            {safeFormatYLD(summary.today_production?.total_output || 0, 2)}
          </p>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <p className="text-xs text-gray-400 mb-1">粮食可持续</p>
          <p className="text-lg font-bold text-yellow-400">
            {safeFormatResource(summary.food_sustainability_hours || 0, 1)} 小时
          </p>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <p className="text-xs text-gray-400 mb-1">工具状态</p>
          <p className="text-sm">
            <span className="text-green-400">{summary.tools?.idle || 0} 闲置</span>
            <span className="text-gray-400 mx-1">/</span>
            <span className="text-blue-400">{summary.tools?.in_use || 0} 使用中</span>
          </p>
        </div>
      </div>
      
      {summary.yld_status && summary.yld_status.percentage_used > 80 && (
        <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-500/30 rounded">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">⚠️</span>
            <p className="text-xs text-yellow-400">
              YLD 今日产量已使用 {summary.yld_status.percentage_used.toFixed(1)}%，
              剩余 {safeFormatYLD(summary.yld_status.remaining, 2)} YLD
            </p>
          </div>
        </div>
      )}
    </PixelCard>
  )
})

MiningSummaryCard.displayName = 'MiningSummaryCard'

// 主页面组件
function MiningPage() {
  // 认证状态
  const { isAuthenticated, user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  // 状态管理
  const [activeTab, setActiveTab] = useState<'myMines' | 'market' | 'hiring' | 'synthesis'>('myMines')
  const [miningSubTab, setMiningSubTab] = useState<'overview' | 'sessions' | 'tools'>('overview')
  const [showBetaModal, setShowBetaModal] = useState(false)
  const [hasMiningAccess, setHasMiningAccess] = useState(false)
  const [selectedMineId, setSelectedMineId] = useState<number | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [pendingMiningTab, setPendingMiningTab] = useState<string | null>(null)
  
  // 数据获取
  const shouldFetchData = !authLoading && isAuthenticated
  const shouldFetchMiningData = shouldFetchData && hasMiningAccess
  
  const { 
    mines: yldMines, 
    loading: yldMinesLoading, 
    error: yldMinesError, 
    stats: yldStats,
    totalCount: yldTotalCount,
    refetch: refetchYLDMines
  } = useMyYLDMines(shouldFetchData ? {
    page: 1,
    page_size: isMobile ? 20 : 50,
    ordering: '-created_at'
  } : null)
  
  const { 
    mine: selectedMine, 
    loading: detailLoading
  } = useYLDMineDetail(shouldFetchData ? selectedMineId : null)
  
  const { 
    lands: userLands
  } = useUserLands({
    enabled: shouldFetchMiningData
  })
  
  const { 
    sessions, 
    loading: sessionsLoading, 
    refetch: refetchSessions
  } = useMiningSessions({
    status: 'active',
    enabled: shouldFetchMiningData
  })
  
  const { 
    tools, 
    loading: toolsLoading, 
    stats: toolStats, 
    refetch: refetchTools
  } = useMyTools({
    enabled: shouldFetchMiningData
  })
  
  const { 
    resources, 
    refetch: refetchResources
  } = useMyResources({
    enabled: shouldFetchMiningData,
    useStats: true
  })
  
  const {
    stats: resourceStats,
    refetch: refetchResourceStats
  } = useResourceStats({
    enabled: shouldFetchMiningData,
    autoRefresh: false
  })
  
  const { 
    status: grainStatus 
  } = useGrainStatus({
    enabled: shouldFetchMiningData
  })
  
  const { 
    status: yldSystemStatus,
    refetch: refetchYLDStatus
  } = useYLDStatus({
    enabled: shouldFetchMiningData && miningSubTab === 'sessions',
    autoRefresh: true,
    refreshInterval: 60000
  })
  
  const { 
    summary: miningSummary,
    refetch: refetchMiningSummary
  } = useMiningSummary({
    enabled: shouldFetchMiningData && miningSubTab === 'sessions',
    autoRefresh: true,
    refreshInterval: 30000
  })
  
  const { 
    startMining, 
    loading: startMiningLoading
  } = useStartSelfMining()
  
  const { 
    synthesize, 
    loading: synthesizeLoading
  } = useSynthesizeTool()
  
  const { 
    stopProduction
  } = useStopProduction()
  
  const { 
    collectOutput
  } = useCollectOutput()
  
  // 副作用
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('[MiningPage] Global error:', event.error)
      if (event.error?.message?.includes('localStorage')) {
        console.warn('[MiningPage] localStorage error detected, using fallback')
        event.preventDefault()
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[MiningPage] Unhandled promise rejection:', event.reason)
      if (event.reason?.message) {
        toast.error(`操作失败: ${event.reason.message}`, {
          duration: 4000,
          position: 'top-center'
        })
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      toast.error('请先登录查看矿山数据')
      router.push('/login?redirect=/mining')
    }
  }, [authLoading, isAuthenticated, router])
  
  useEffect(() => {
    const access = hasBetaAccess()
    setHasMiningAccess(access)
  }, [])
  
  useEffect(() => {
    if (hasMiningAccess && pendingMiningTab) {
      setMiningSubTab(pendingMiningTab as any)
      setPendingMiningTab(null)
    }
  }, [hasMiningAccess, pendingMiningTab])
  
  // 事件处理
  const handleViewDetail = useCallback((mine: YLDMine) => {
    setSelectedMineId(mine.id)
    setShowDetailModal(true)
  }, [])
  
  const handleOpenMiningFeature = useCallback(() => {
    if (!hasMiningAccess) {
      setShowBetaModal(true)
    } else {
      setMiningSubTab('sessions')
    }
  }, [hasMiningAccess])
  
  const handleStartSelfMining = useCallback(async (landId: number, toolIds: number[]) => {
    try {
      await startMining({
        land_id: landId,
        tool_ids: toolIds
      })
      refetchSessions()
      refetchTools()
      refetchResourceStats()
      refetchMiningSummary()
      refetchYLDStatus()
    } catch (error) {
      console.error('[MiningPage] Start mining failed:', error)
    }
  }, [startMining, refetchSessions, refetchTools, refetchResourceStats, refetchMiningSummary, refetchYLDStatus])
  
  const handleStopSession = useCallback(async (sessionId: number) => {
    try {
      await stopProduction(sessionId)
      toast.success('已停止生产')
      refetchSessions()
      refetchTools()
      refetchResources()
      refetchResourceStats()
      refetchMiningSummary()
      refetchYLDStatus()
    } catch (error) {
      console.error('[MiningPage] Stop session failed:', error)
    }
  }, [stopProduction, refetchSessions, refetchTools, refetchResources, refetchResourceStats, refetchMiningSummary, refetchYLDStatus])
  
  const handleCollectSessionOutput = useCallback(async (sessionId: number) => {
    try {
      await collectOutput(sessionId)
      toast.success('收取成功！')
      refetchSessions()
      refetchResources()
      refetchResourceStats()
      refetchMiningSummary()
    } catch (error) {
      console.error('[MiningPage] Collect output failed:', error)
    }
  }, [collectOutput, refetchSessions, refetchResources, refetchResourceStats, refetchMiningSummary])
  
  const handleSynthesize = useCallback(async (toolType: string, quantity: number) => {
    try {
      await synthesize({
        tool_type: toolType as 'pickaxe' | 'axe' | 'hoe',
        quantity: quantity
      })
      refetchTools()
      refetchResources()
      refetchResourceStats()
    } catch (error) {
      console.error('[MiningPage] Synthesize failed:', error)
    }
  }, [synthesize, refetchTools, refetchResources, refetchResourceStats])
  
  const handleTabClick = useCallback((tab: string) => {
    if (!hasMiningAccess) {
      setPendingMiningTab(tab)
      setShowBetaModal(true)
    } else {
      setMiningSubTab(tab as any)
    }
  }, [hasMiningAccess])
  
  // 渲染逻辑
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-400">验证登录状态...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-gray-400 mb-4">请登录后查看矿山数据</p>
          <PixelButton onClick={() => router.push('/login?redirect=/mining')}>
            立即登录
          </PixelButton>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-900">
      {/* 内测横幅提醒 */}
      {hasMiningAccess && <BetaBanner />}
      
      {/* 顶部状态栏 */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-3 py-2 md:px-4 md:py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <span className="text-xs sm:text-sm text-gray-400">矿主：</span>
              <span className="text-xs sm:text-sm text-gold-500 font-bold">
                {user?.nickname || user?.username}
              </span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-center min-w-[60px]">
                <div className="text-[10px] sm:text-xs text-gray-400">矿山</div>
                <div className="text-xs sm:text-sm font-bold text-gold-500">{yldTotalCount || 0}</div>
              </div>
              {yldStats && (
                <>
                  <div className="text-center min-w-[80px]">
                    <div className="text-[10px] sm:text-xs text-gray-400">YLD总量</div>
                    <div className="text-xs sm:text-sm font-bold text-purple-500">
                      {safeFormatYLD(yldStats.total_yld_capacity)}
                    </div>
                  </div>
                  <div className="text-center min-w-[60px]">
                    <div className="text-[10px] sm:text-xs text-gray-400">生产中</div>
                    <div className="text-xs sm:text-sm font-bold text-green-500">
                      {yldStats.producing_count}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-3 py-3 sm:px-4 sm:py-6">
        {/* 主标签切换 - 添加合成系统 */}
        <div className="flex gap-1 mb-3 sm:gap-2 sm:mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('myMines')}
            className={cn(
              "px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg font-bold transition-colors whitespace-nowrap text-xs sm:text-base",
              activeTab === 'myMines' 
                ? "bg-green-500 text-white" 
                : "bg-gray-800 text-gray-400"
            )}
          >
            我的矿山
          </button>
          <button
            onClick={() => setActiveTab('synthesis')}
            className={cn(
              "px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg font-bold transition-colors whitespace-nowrap text-xs sm:text-base",
              activeTab === 'synthesis' 
                ? "bg-green-500 text-white" 
                : "bg-gray-800 text-gray-400"
            )}
          >
            合成系统
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={cn(
              "px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg font-bold transition-colors whitespace-nowrap text-xs sm:text-base",
              activeTab === 'market' 
                ? "bg-green-500 text-white" 
                : "bg-gray-800 text-gray-400"
            )}
          >
            矿山市场
          </button>
          <button
            onClick={() => setActiveTab('hiring')}
            className={cn(
              "px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg font-bold transition-colors whitespace-nowrap text-xs sm:text-base",
              activeTab === 'hiring' 
                ? "bg-green-500 text-white" 
                : "bg-gray-800 text-gray-400"
            )}
          >
            招聘市场
          </button>
        </div>

        {/* 内容区域 */}
        <div className={cn(
          "space-y-4",
          !isMobile && activeTab === 'myMines' && "lg:grid lg:grid-cols-12 lg:gap-6 lg:space-y-0"
        )}>
          {/* 左侧统计信息 - 桌面端显示 */}
          {!isMobile && activeTab === 'myMines' && (
            <div className="lg:col-span-4">
              <MiningStats
                yldStats={yldStats}
                resources={resources}
                resourceStats={resourceStats?.data}
                grainStatus={grainStatus}
                hasMiningAccess={hasMiningAccess}
                sessions={sessions}
                onRefresh={() => {
                  refetchYLDMines()
                  refetchResourceStats()
                }}
                onOpenMining={handleOpenMiningFeature}
              />
            </div>
          )}

          {/* 右侧主内容 */}
          <div className={cn(
            !isMobile && activeTab === 'myMines' && "lg:col-span-8"
          )}>
            {/* 我的矿山内容 */}
            {activeTab === 'myMines' && (
              <div className="space-y-3 sm:space-y-4">
                {/* 子标签切换 */}
                <div className="flex gap-1 sm:gap-2 overflow-x-auto">
                  <button
                    onClick={() => setMiningSubTab('overview')}
                    className={cn(
                      "px-2 py-1 sm:px-3 sm:py-1.5 rounded text-[11px] sm:text-sm font-bold transition-colors whitespace-nowrap",
                      miningSubTab === 'overview' 
                        ? "bg-gray-700 text-white" 
                        : "bg-gray-800 text-gray-400"
                    )}
                  >
                    YLD矿山
                  </button>
                  <button
                    onClick={() => handleTabClick('sessions')}
                    className={cn(
                      "px-2 py-1 sm:px-3 sm:py-1.5 rounded text-[11px] sm:text-sm font-bold transition-colors whitespace-nowrap",
                      miningSubTab === 'sessions' 
                        ? "bg-gray-700 text-white" 
                        : "bg-gray-800 text-gray-400"
                    )}
                  >
                    挖矿会话
                  </button>
                  <button
                    onClick={() => handleTabClick('tools')}
                    className={cn(
                      "px-2 py-1 sm:px-3 sm:py-1.5 rounded text-[11px] sm:text-sm font-bold transition-colors whitespace-nowrap",
                      miningSubTab === 'tools' 
                        ? "bg-gray-700 text-white" 
                        : "bg-gray-800 text-gray-400"
                    )}
                  >
                    我的工具
                  </button>
                </div>

                {/* 移动端资源显示栏 */}
                {isMobile && hasMiningAccess && (resources || resourceStats || miningSummary) && miningSubTab !== 'overview' && (
                  <MobileResourceBar 
                    resources={resources} 
                    resourceStats={resourceStats}
                    grainStatus={grainStatus}
                    miningSummary={miningSummary}
                  />
                )}

                {/* 桌面端资源显示栏 */}
                {!isMobile && hasMiningAccess && (resources || resourceStats || miningSummary) && miningSubTab !== 'overview' && (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <PixelCard className="p-2 text-center">
                      <p className="text-xs text-gray-400">木头</p>
                      <p className="text-sm font-bold text-green-400">
                        {safeFormatResource(
                          miningSummary?.resources?.wood ||
                          resourceStats?.data?.resources?.wood?.available || 
                          resources?.wood || 0
                        )}
                      </p>
                    </PixelCard>
                    <PixelCard className="p-2 text-center">
                      <p className="text-xs text-gray-400">铁矿</p>
                      <p className="text-sm font-bold text-gray-400">
                        {safeFormatResource(
                          miningSummary?.resources?.iron ||
                          resourceStats?.data?.resources?.iron?.available || 
                          resources?.iron || 0
                        )}
                      </p>
                    </PixelCard>
                    <PixelCard className="p-2 text-center">
                      <p className="text-xs text-gray-400">石头</p>
                      <p className="text-sm font-bold text-blue-400">
                        {safeFormatResource(
                          miningSummary?.resources?.stone ||
                          resourceStats?.data?.resources?.stone?.available || 
                          resources?.stone || 0
                        )}
                      </p>
                    </PixelCard>
                    <PixelCard className="p-2 text-center">
                      <p className="text-xs text-gray-400">粮食</p>
                      <p className="text-sm font-bold text-yellow-400">
                        {safeFormatResource(
                          miningSummary?.resources?.food || miningSummary?.resources?.grain ||
                          resourceStats?.data?.resources?.food?.available || 
                          resourceStats?.data?.resources?.grain?.available || 
                          resources?.grain || 
                          resources?.food || 0
                        )}
                      </p>
                      {grainStatus?.warning && grainStatus?.hours_remaining != null && (
                        <p className="text-xs text-red-400">
                          剩{typeof grainStatus.hours_remaining === 'number' ? grainStatus.hours_remaining.toFixed(1) : '0'}h
                        </p>
                      )}
                    </PixelCard>
                  </div>
                )}

                {/* 子标签内容 */}
                {miningSubTab === 'overview' && (
                  <YLDMineList
                    mines={yldMines}
                    loading={yldMinesLoading}
                    error={yldMinesError}
                    onViewDetail={handleViewDetail}
                    onRefresh={refetchYLDMines}
                    onSwitchToSessions={() => {
                      if (!hasMiningAccess) {
                        return
                      }
                      setMiningSubTab('sessions')
                    }}
                    onStartProduction={(mineId) => {
                      console.log('开始生产矿山:', mineId)
                    }}
                  />
                )}

                {miningSubTab === 'sessions' && (
                  hasMiningAccess ? (
                    <div className="space-y-4">
                      {/* 挖矿汇总卡片 */}
                      {miningSummary && (
                        <MiningSummaryCard 
                          summary={miningSummary} 
                          compact={isMobile}
                        />
                      )}
                      
                      {/* YLD 系统状态监控 - 暂时隐藏 */}
                      {/* <YLDSystemStatus 
                        compact={isMobile}
                        onRefresh={() => {
                          refetchSessions()
                          refetchResourceStats()
                          refetchMiningSummary()
                          refetchYLDStatus()
                        }}
                      /> */}
                      
                      {/* 挖矿会话管理 */}
                      <MiningSessions
                        sessions={sessions}
                        loading={sessionsLoading}
                        userLands={userLands}
                        tools={tools}
                        onStartMining={handleStartSelfMining}
                        onStopSession={handleStopSession}
                        onCollectOutput={handleCollectSessionOutput}
                        startMiningLoading={startMiningLoading}
                        onBuyFood={() => {
                          toast('购买粮食功能即将开放', { icon: '🌾' })
                        }}
                        onSynthesizeTool={() => {
                          setActiveTab('synthesis')
                        }}
                      />
                    </div>
                  ) : (
                    <PixelCard className="text-center py-8 sm:py-12">
                      <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔒</div>
                      <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4">需要内测权限访问此功能</p>
                      <PixelButton size={isMobile ? "sm" : "md"} onClick={() => setShowBetaModal(true)}>
                        输入内测密码
                      </PixelButton>
                    </PixelCard>
                  )
                )}

                {miningSubTab === 'tools' && (
                  hasMiningAccess ? (
                    <ToolManagement
                      tools={tools}
                      loading={toolsLoading}
                      toolStats={toolStats}
                      resources={resources || resourceStats?.data?.resources || miningSummary?.resources}
                      onSynthesize={handleSynthesize}
                      synthesizeLoading={synthesizeLoading}
                      showOnlyTools={true}
                    />
                  ) : (
                    <PixelCard className="text-center py-8 sm:py-12">
                      <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔒</div>
                      <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4">需要内测权限访问此功能</p>
                      <PixelButton size={isMobile ? "sm" : "md"} onClick={() => setShowBetaModal(true)}>
                        输入内测密码
                      </PixelButton>
                    </PixelCard>
                  )
                )}
              </div>
            )}

            {/* 合成系统 - 独立组件 */}
            {activeTab === 'synthesis' && (
              <SynthesisSystem 
                className="w-full"
                isMobile={isMobile}
              />
            )}

            {/* 矿山市场 - 独立组件 */}
            {activeTab === 'market' && (
              <MiningMarket className="w-full" />
            )}

            {/* 招聘市场 - 独立组件 */}
            {activeTab === 'hiring' && (
              <HiringMarket 
                className="w-full"
                showGuide={false} // 暂时隐藏招募说明
              />
            )}
          </div>
        </div>

        {/* 移动端显示统计信息 */}
        {isMobile && activeTab === 'myMines' && miningSubTab === 'overview' && (
          <div className="mt-4">
            <MiningStats
              yldStats={yldStats}
              resources={resources}
              resourceStats={resourceStats?.data}
              grainStatus={grainStatus}
              hasMiningAccess={hasMiningAccess}
              sessions={sessions}
              onRefresh={() => {
                refetchYLDMines()
                refetchResourceStats()
              }}
              onOpenMining={handleOpenMiningFeature}
            />
          </div>
        )}

        {/* 底部提示 */}
        <div className="mt-4 sm:mt-8">
          <PixelCard className="p-3 sm:p-6 bg-gold-500/10 border-gold-500/30">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">💡</span>
              <p className="text-[11px] sm:text-sm text-gray-300">
                YLD 矿山系统和挖矿生产系统正在持续优化中，更多功能即将开放。
              </p>
            </div>
          </PixelCard>
        </div>
      </div>

      {/* 内测密码模态框 */}
      <BetaPasswordModal
        isOpen={showBetaModal}
        onClose={() => {
          setShowBetaModal(false)
          setPendingMiningTab(null)
        }}
        onSuccess={() => {
          setHasMiningAccess(true)
          setShowBetaModal(false)
          
          if (pendingMiningTab && pendingMiningTab !== 'overview') {
            setMiningSubTab(pendingMiningTab as any)
            setPendingMiningTab(null)
          } else {
            setMiningSubTab('sessions')
          }
          
          toast.success('验证成功！欢迎进入挖矿系统')
          refetchResourceStats()
          refetchMiningSummary()
          refetchYLDStatus()
        }}
      />
      
      {/* 内测提示弹窗 */}
      {hasMiningAccess && <BetaNotice compact={isMobile} />}
      
      {/* 矿山详情模态框 */}
      <PixelModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedMineId(null)
        }}
        title="矿山详情"
        size={isMobile ? "small" : "large"}
      >
        {detailLoading ? (
          <div className="text-center py-6 sm:py-8">
            <div className="text-3xl sm:text-4xl mb-2">⏳</div>
            <p className="text-sm sm:text-base text-gray-400">加载详情...</p>
          </div>
        ) : selectedMine ? (
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
              <h3 className="font-bold mb-2 sm:mb-3 text-gold-500 text-sm sm:text-base">基本信息</h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div>
                  <p className="text-gray-400">矿山编号</p>
                  <p className="font-bold">{selectedMine.land_id || `矿山#${selectedMine.id}`}</p>
                </div>
                <div>
                  <p className="text-gray-400">所在区域</p>
                  <p className="font-bold">{selectedMine.region_info?.name || '中国'}</p>
                </div>
                <div>
                  <p className="text-gray-400">矿山类型</p>
                  <p className="font-bold">{selectedMine.blueprint_info?.name || 'YLD矿山'}</p>
                </div>
                <div>
                  <p className="text-gray-400">坐标</p>
                  <p className="font-bold text-[10px] sm:text-xs">
                    ({selectedMine.coordinate_x || 0}, {selectedMine.coordinate_y || 0})
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-900/20 rounded-lg p-3 sm:p-4">
              <h3 className="font-bold mb-2 sm:mb-3 text-purple-400 text-sm sm:text-base">YLD 信息</h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div>
                  <p className="text-gray-400">YLD 数量</p>
                  <p className="font-bold text-purple-400 text-base sm:text-lg">
                    {safeFormatYLD(selectedMine.yld_capacity || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">累计产出</p>
                  <p className="font-bold text-green-400 text-base sm:text-lg">
                    {safeFormatYLD(selectedMine.accumulated_output || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">批次</p>
                  <p className="font-bold text-blue-400 text-[10px] sm:text-xs truncate" 
                     title={selectedMine.batch_id}>
                    {selectedMine.batch_id || '未知'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
              <PixelButton className="flex-1" size={isMobile ? "sm" : "md"} disabled>
                生产功能待开放
              </PixelButton>
              <PixelButton 
                variant="secondary" 
                size={isMobile ? "sm" : "md"}
                onClick={() => setShowDetailModal(false)}
              >
                关闭
              </PixelButton>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <p className="text-sm sm:text-base text-gray-400">无法加载矿山详情</p>
          </div>
        )}
      </PixelModal>
    </div>
  )
}

// 导出带错误边界的组件
export default function MiningPageWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <MiningPage />
    </ErrorBoundary>
  )
}
