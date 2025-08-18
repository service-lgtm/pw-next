// src/app/mining/page.tsx
// 挖矿中心页面 - 优化版本
// 
// 文件说明：
// 挖矿中心的主页面，管理所有矿山、挖矿会话、工具、合成等功能
// 
// 优化内容：
// - 2025-01-19: 全面优化产品体验
//   - 重新设计信息架构，突出核心数据
//   - 添加快捷操作卡片
//   - 优化移动端布局和交互
//   - 增加数据可视化展示
//   - 改进状态反馈机制
// 
// 关联文件：
// - 子组件: ./YLDMineList, ./MiningSessions, ./ToolManagement, ./SynthesisSystem 等
// - Hooks: @/hooks/useAuth, @/hooks/useProduction, @/hooks/useYLDMines
// - API: 通过 hooks 调用后端接口

'use client'

import { useState, useEffect, useCallback, useMemo, memo, Component, ReactNode, ErrorInfo } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { safeFormatYLD, safeFormatResource } from '@/utils/formatters'

// 图标组件（用于快捷操作）
const IconPickaxe = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
)

const IconCoin = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const IconTool = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

// 组件导入
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { BetaPasswordModal, hasBetaAccess } from './BetaPasswordModal'
import { BetaNotice, BetaBanner } from './BetaNotice'
import { YLDMineList } from './YLDMineList'
import { MiningSessions } from './MiningSessions'
import { ToolManagement } from './ToolManagement'
import { MiningMarket } from './MiningMarket'
import { HiringMarket } from './HiringMarket'
import { SynthesisSystem } from './SynthesisSystem'
import { AutoRefreshSystem } from './AutoRefreshSystem'

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
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
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
              </div>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

// 资源状态卡片组件（优化版）
const ResourceCard = memo(({ 
  type, 
  amount, 
  label, 
  color, 
  icon, 
  warning,
  onClick 
}: {
  type: string
  amount: number | string
  label: string
  color: string
  icon?: string
  warning?: string
  onClick?: () => void
}) => {
  return (
    <div 
      className={cn(
        "bg-gray-800 rounded-lg p-3 sm:p-4 text-center transition-all",
        onClick && "cursor-pointer hover:bg-gray-700 active:scale-95"
      )}
      onClick={onClick}
    >
      {icon && <div className="text-xl sm:text-2xl mb-1">{icon}</div>}
      <p className="text-[10px] sm:text-xs text-gray-400">{label}</p>
      <p className={cn("text-sm sm:text-lg font-bold", color)}>
        {safeFormatResource(amount)}
      </p>
      {warning && (
        <p className="text-[10px] sm:text-xs text-red-400 mt-1">
          {warning}
        </p>
      )}
    </div>
  )
})

ResourceCard.displayName = 'ResourceCard'

// 快捷操作卡片组件
const QuickActionCard = memo(({ 
  title, 
  description, 
  icon, 
  onClick, 
  disabled,
  badge 
}: {
  title: string
  description: string
  icon: ReactNode
  onClick: () => void
  disabled?: boolean
  badge?: string
}) => {
  return (
    <button
      className={cn(
        "relative w-full bg-gray-800 rounded-lg p-4 text-left",
        "transition-all duration-200",
        !disabled && "hover:bg-gray-700 hover:scale-[1.02] active:scale-[0.98]",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {badge && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
      <div className="flex items-start gap-3">
        <div className="text-gold-500 mt-1">{icon}</div>
        <div className="flex-1">
          <h4 className="font-bold text-white text-sm sm:text-base">{title}</h4>
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        </div>
      </div>
    </button>
  )
})

QuickActionCard.displayName = 'QuickActionCard'

// 数据统计卡片（优化版）
const StatsCard = memo(({ 
  title, 
  value, 
  subtitle, 
  trend,
  icon 
}: {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: string
}) => {
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'
  
  return (
    <PixelCard className="p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs sm:text-sm text-gray-400">{title}</p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <p className="text-lg sm:text-2xl font-bold text-white">{value}</p>
      {subtitle && (
        <p className={cn("text-xs sm:text-sm mt-1", trendColor)}>
          {subtitle}
        </p>
      )}
    </PixelCard>
  )
})

StatsCard.displayName = 'StatsCard'

// 主页面组件
function MiningPage() {
  // 认证状态
  const { isAuthenticated, user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  // 状态管理
  const [activeTab, setActiveTab] = useState<'overview' | 'production' | 'market'>('overview')
  const [productionSubTab, setProductionSubTab] = useState<'sessions' | 'tools' | 'synthesis'>('sessions')
  const [showBetaModal, setShowBetaModal] = useState(false)
  const [hasMiningAccess, setHasMiningAccess] = useState(false)
  const [selectedMineId, setSelectedMineId] = useState<number | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
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
    enabled: shouldFetchMiningData,
    autoRefresh: true,
    refreshInterval: 60000
  })
  
  const { 
    summary: miningSummary,
    refetch: refetchMiningSummary
  } = useMiningSummary({
    enabled: shouldFetchMiningData,
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
  
  // 计算统计数据
  const stats = useMemo(() => {
    const activeSessions = sessions?.length || 0
    const totalTools = tools?.length || 0
    const damagedTools = tools?.filter(t => t.durability < 100).length || 0
    const collectibleSessions = sessions?.filter(s => s.can_collect).length || 0
    
    return {
      activeSessions,
      totalTools,
      damagedTools,
      collectibleSessions,
      totalMines: yldTotalCount || 0,
      producingMines: yldStats?.producing_count || 0,
      totalCapacity: yldStats?.total_yld_capacity || 0,
      totalOutput: yldStats?.total_accumulated_output || 0
    }
  }, [sessions, tools, yldTotalCount, yldStats])
  
  // 获取资源数据
  const getResourceAmount = useCallback((type: string) => {
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
  }, [miningSummary, resourceStats, resources])
  
  // 副作用
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
      toast.error('请先登录')
      router.push('/login?redirect=/mining')
    }
  }, [authLoading, isAuthenticated, router])
  
  useEffect(() => {
    const access = hasBetaAccess()
    setHasMiningAccess(access)
  }, [])
  
  // 事件处理
  const handleViewDetail = useCallback((mine: YLDMine) => {
    setSelectedMineId(mine.id)
    setShowDetailModal(true)
  }, [])
  
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
      toast.success('开始挖矿成功！')
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
      toast.success('合成成功！')
      refetchTools()
      refetchResources()
      refetchResourceStats()
    } catch (error) {
      console.error('[MiningPage] Synthesize failed:', error)
    }
  }, [synthesize, refetchTools, refetchResources, refetchResourceStats])
  
  // 快捷操作处理
  const handleQuickStartMining = useCallback(() => {
    if (!hasMiningAccess) {
      setShowBetaModal(true)
    } else {
      setActiveTab('production')
      setProductionSubTab('sessions')
    }
  }, [hasMiningAccess])
  
  const handleQuickCollect = useCallback(async () => {
    if (stats.collectibleSessions > 0) {
      const collectPromises = sessions
        ?.filter(s => s.can_collect)
        .map(s => handleCollectSessionOutput(s.session_id))
      
      if (collectPromises) {
        await Promise.all(collectPromises)
        toast.success(`收取了 ${stats.collectibleSessions} 个会话的产出！`)
      }
    }
  }, [sessions, stats.collectibleSessions, handleCollectSessionOutput])
  
  const handleQuickSynthesis = useCallback(() => {
    setActiveTab('production')
    setProductionSubTab('synthesis')
  }, [])
  
  // 渲染逻辑
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
      {/* 内测横幅 */}
      {hasMiningAccess && <BetaBanner />}
      
      {/* 自动刷新系统 */}
      {hasMiningAccess && sessions && sessions.length > 0 && (
        <AutoRefreshSystem
          enabled={true}
          sessions={sessions}
          tools={tools}
          grainStatus={grainStatus}
          miningSummary={miningSummary}
          yldStatus={yldSystemStatus}
          onRefreshSessions={refetchSessions}
          onRefreshTools={refetchTools}
          onRefreshResources={() => {
            refetchResources()
            refetchResourceStats()
          }}
          onRefreshSummary={refetchMiningSummary}
          onRefreshYLDStatus={refetchYLDStatus}
          config={{
            sessionCheckInterval: 60000,
            resourceCheckInterval: 120000,
            grainWarningThreshold: 2,
            durabilityWarningThreshold: 100,
            enableNotifications: true,
            enableAutoCollect: false,
            enableHourlySettlementAlert: true,
            pendingRewardsThreshold: 100,
            yldWarningThreshold: 90
          }}
        />
      )}
      
      {/* 顶部用户信息栏（简化版） */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="container mx-auto px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gold-500 rounded-full flex items-center justify-center text-gray-900 font-bold text-sm sm:text-base">
                {user?.nickname?.[0] || user?.username?.[0] || 'U'}
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white">
                  {user?.nickname || user?.username}
                </p>
                <p className="text-xs text-gray-400">矿主等级 1</p>
              </div>
            </div>
            
            {/* 快速统计 */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-center">
                <p className="text-xs text-gray-400">矿山</p>
                <p className="text-sm sm:text-base font-bold text-gold-500">{stats.totalMines}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">生产中</p>
                <p className="text-sm sm:text-base font-bold text-green-500">{stats.producingMines}</p>
              </div>
              {!isMobile && (
                <div className="text-center">
                  <p className="text-xs text-gray-400">总产出</p>
                  <p className="text-sm sm:text-base font-bold text-purple-500">
                    {safeFormatYLD(stats.totalOutput)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6">
        {/* 资源状态栏（优化版） */}
        {hasMiningAccess && (
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
            <ResourceCard
              type="wood"
              amount={getResourceAmount('wood')}
              label="木头"
              color="text-green-400"
              icon="🌲"
            />
            <ResourceCard
              type="iron"
              amount={getResourceAmount('iron')}
              label="铁矿"
              color="text-gray-400"
              icon="⛏️"
            />
            <ResourceCard
              type="stone"
              amount={getResourceAmount('stone')}
              label="石头"
              color="text-blue-400"
              icon="🪨"
            />
            <ResourceCard
              type="food"
              amount={getResourceAmount('food') || getResourceAmount('grain')}
              label="粮食"
              color="text-yellow-400"
              icon="🌾"
              warning={grainStatus?.warning ? `剩${grainStatus.hours_remaining?.toFixed(1)}h` : undefined}
              onClick={() => toast('粮食市场即将开放', { icon: '🌾' })}
            />
          </div>
        )}
        
        {/* 快捷操作区（新增） */}
        {hasMiningAccess && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 sm:mb-6">
            <QuickActionCard
              title="快速挖矿"
              description="开始新的挖矿会话"
              icon={<IconPickaxe />}
              onClick={handleQuickStartMining}
            />
            <QuickActionCard
              title="一键收取"
              description={stats.collectibleSessions > 0 ? `${stats.collectibleSessions} 个会话可收取` : '暂无可收取'}
              icon={<IconCoin />}
              onClick={handleQuickCollect}
              disabled={stats.collectibleSessions === 0}
              badge={stats.collectibleSessions > 0 ? stats.collectibleSessions.toString() : undefined}
            />
            <QuickActionCard
              title="合成工具"
              description={stats.damagedTools > 0 ? `${stats.damagedTools} 个工具需修复` : '合成新工具'}
              icon={<IconTool />}
              onClick={handleQuickSynthesis}
              badge={stats.damagedTools > 0 ? stats.damagedTools.toString() : undefined}
            />
          </div>
        )}
        
        {/* 主标签导航（优化版） */}
        <div className="flex gap-2 mb-4 sm:mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              "px-4 py-2 sm:px-6 sm:py-3 font-bold transition-all text-sm sm:text-base",
              "border-b-2 -mb-[2px]",
              activeTab === 'overview' 
                ? "text-gold-500 border-gold-500" 
                : "text-gray-400 border-transparent hover:text-white"
            )}
          >
            总览
          </button>
          <button
            onClick={() => setActiveTab('production')}
            className={cn(
              "px-4 py-2 sm:px-6 sm:py-3 font-bold transition-all text-sm sm:text-base",
              "border-b-2 -mb-[2px] relative",
              activeTab === 'production' 
                ? "text-gold-500 border-gold-500" 
                : "text-gray-400 border-transparent hover:text-white"
            )}
          >
            生产管理
            {stats.collectibleSessions > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={cn(
              "px-4 py-2 sm:px-6 sm:py-3 font-bold transition-all text-sm sm:text-base",
              "border-b-2 -mb-[2px]",
              activeTab === 'market' 
                ? "text-gold-500 border-gold-500" 
                : "text-gray-400 border-transparent hover:text-white"
            )}
          >
            市场
          </button>
        </div>

        {/* 内容区域 */}
        <div className="space-y-4">
          {/* 总览页面 */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* 统计卡片 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatsCard
                  title="总矿山"
                  value={stats.totalMines}
                  subtitle={`${stats.producingMines} 生产中`}
                  trend="neutral"
                  icon="⛰️"
                />
                <StatsCard
                  title="活跃会话"
                  value={stats.activeSessions}
                  subtitle={`${stats.collectibleSessions} 可收取`}
                  trend={stats.collectibleSessions > 0 ? "up" : "neutral"}
                  icon="⚡"
                />
                <StatsCard
                  title="工具总数"
                  value={stats.totalTools}
                  subtitle={`${stats.damagedTools} 需修复`}
                  trend={stats.damagedTools > 0 ? "down" : "neutral"}
                  icon="🔧"
                />
                <StatsCard
                  title="YLD储量"
                  value={safeFormatYLD(stats.totalCapacity)}
                  subtitle="总储量"
                  trend="neutral"
                  icon="💎"
                />
              </div>
              
              {/* 矿山列表 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">我的矿山</h3>
                  <PixelButton 
                    size="sm" 
                    variant="secondary"
                    onClick={refetchYLDMines}
                  >
                    刷新
                  </PixelButton>
                </div>
                <YLDMineList
                  mines={yldMines}
                  loading={yldMinesLoading}
                  error={yldMinesError}
                  onViewDetail={handleViewDetail}
                  onRefresh={refetchYLDMines}
                  onSwitchToSessions={() => {
                    setActiveTab('production')
                    setProductionSubTab('sessions')
                  }}
                />
              </div>
            </div>
          )}

          {/* 生产管理页面 */}
          {activeTab === 'production' && (
            <div className="space-y-4">
              {/* 子标签 */}
              <div className="flex gap-2 overflow-x-auto">
                <button
                  onClick={() => setProductionSubTab('sessions')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-bold transition-colors whitespace-nowrap",
                    productionSubTab === 'sessions' 
                      ? "bg-gray-700 text-white" 
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  )}
                >
                  挖矿会话
                  {stats.collectibleSessions > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {stats.collectibleSessions}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setProductionSubTab('tools')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-bold transition-colors whitespace-nowrap",
                    productionSubTab === 'tools' 
                      ? "bg-gray-700 text-white" 
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  )}
                >
                  我的工具
                  {stats.damagedTools > 0 && (
                    <span className="ml-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {stats.damagedTools}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setProductionSubTab('synthesis')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-bold transition-colors whitespace-nowrap",
                    productionSubTab === 'synthesis' 
                      ? "bg-gray-700 text-white" 
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  )}
                >
                  合成系统
                </button>
              </div>

              {/* 子标签内容 */}
              {productionSubTab === 'sessions' && (
                hasMiningAccess ? (
                  <MiningSessions
                    sessions={sessions}
                    loading={sessionsLoading}
                    userLands={userLands}
                    tools={tools}
                    onStartMining={handleStartSelfMining}
                    onStopSession={handleStopSession}
                    onCollectOutput={handleCollectSessionOutput}
                    startMiningLoading={startMiningLoading}
                    miningSummary={miningSummary}
                    yldStatus={yldSystemStatus}
                    onRefresh={() => {
                      refetchSessions()
                      refetchTools()
                      refetchResourceStats()
                      refetchMiningSummary()
                      refetchYLDStatus()
                    }}
                    onBuyFood={() => {
                      toast('粮食市场即将开放', { icon: '🌾' })
                    }}
                    onSynthesizeTool={() => {
                      setProductionSubTab('synthesis')
                    }}
                  />
                ) : (
                  <PixelCard className="text-center py-12">
                    <div className="text-6xl mb-4">🔒</div>
                    <p className="text-gray-400 mb-4">需要内测权限访问此功能</p>
                    <PixelButton onClick={() => setShowBetaModal(true)}>
                      输入内测密码
                    </PixelButton>
                  </PixelCard>
                )
              )}

              {productionSubTab === 'tools' && (
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
                  <PixelCard className="text-center py-12">
                    <div className="text-6xl mb-4">🔒</div>
                    <p className="text-gray-400 mb-4">需要内测权限访问此功能</p>
                    <PixelButton onClick={() => setShowBetaModal(true)}>
                      输入内测密码
                    </PixelButton>
                  </PixelCard>
                )
              )}

              {productionSubTab === 'synthesis' && (
                <SynthesisSystem 
                  className="w-full"
                  isMobile={isMobile}
                />
              )}
            </div>
          )}

          {/* 市场页面 */}
          {activeTab === 'market' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PixelCard 
                  className="p-6 cursor-pointer hover:border-gold-500 transition-all"
                  onClick={() => toast('矿山市场即将开放', { icon: '⛰️' })}
                >
                  <h3 className="text-lg font-bold text-white mb-2">矿山市场</h3>
                  <p className="text-sm text-gray-400">购买和出售矿山</p>
                </PixelCard>
                <PixelCard 
                  className="p-6 cursor-pointer hover:border-gold-500 transition-all"
                  onClick={() => toast('招聘市场即将开放', { icon: '👥' })}
                >
                  <h3 className="text-lg font-bold text-white mb-2">招聘市场</h3>
                  <p className="text-sm text-gray-400">雇佣矿工帮助生产</p>
                </PixelCard>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 内测密码模态框 */}
      <BetaPasswordModal
        isOpen={showBetaModal}
        onClose={() => setShowBetaModal(false)}
        onSuccess={() => {
          setHasMiningAccess(true)
          setShowBetaModal(false)
          toast.success('验证成功！欢迎进入挖矿系统')
          refetchResourceStats()
          refetchMiningSummary()
          refetchYLDStatus()
        }}
      />
      
      {/* 内测提示 */}
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
          <div className="text-center py-8">
            <div className="text-4xl mb-2">⏳</div>
            <p className="text-gray-400">加载详情...</p>
          </div>
        ) : selectedMine ? (
          <div className="space-y-4">
            {/* 详情内容 */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold mb-3 text-gold-500">基本信息</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400">矿山编号</p>
                  <p className="font-bold">{selectedMine.land_id || `矿山#${selectedMine.id}`}</p>
                </div>
                <div>
                  <p className="text-gray-400">所在区域</p>
                  <p className="font-bold">{selectedMine.region_info?.name || '中国'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <PixelButton 
                className="flex-1" 
                onClick={() => {
                  setShowDetailModal(false)
                  handleQuickStartMining()
                }}
              >
                开始挖矿
              </PixelButton>
              <PixelButton 
                variant="secondary" 
                onClick={() => setShowDetailModal(false)}
              >
                关闭
              </PixelButton>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">无法加载矿山详情</p>
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
