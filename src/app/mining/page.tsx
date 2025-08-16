// src/app/mining/page.tsx
// 挖矿中心页面 - 安卓兼容优化版
// 
// 优化说明：
// 1. 移除 sessionStorage 使用，改用组件状态
// 2. 添加错误边界处理运行时错误
// 3. 优化移动端交互和性能
// 4. 使用 safeStorage 替代 localStorage
// 5. 添加全局错误处理
// 
// 关联组件（同目录下）：
// - ./BetaPasswordModal: 内测密码验证（已使用 safeStorage）
// - ./YLDMineList: YLD矿山列表
// - ./MiningSessions: 挖矿会话管理
// - ./ToolManagement: 工具管理
// - ./MiningStats: 统计信息
// - @/utils/safeStorage: 安全存储工具
//
// API 接口：
// - /production/resources/stats/: 新的资源统计接口
// - /production/resources/: 旧的资源接口（保留兼容）
//
// 更新历史：
// - 2024-01: 修复安卓兼容性，移除 sessionStorage
// - 2024-01: 添加错误边界和全局错误处理

'use client'

import { useState, useEffect, useCallback, useMemo, memo, Component, ReactNode, ErrorInfo } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { safeFormatYLD, safeFormatResource } from '@/utils/formatters'

// 组件导入 - 从同目录导入
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { BetaPasswordModal, hasBetaAccess } from './BetaPasswordModal'
import { BetaNotice, BetaBanner } from './BetaNotice'
import { YLDMineList } from './YLDMineList'
import { MiningSessions } from './MiningSessions'
import { ToolManagement } from './ToolManagement'
import { MiningStats } from './MiningStats'
import { RecruitmentMiningGuide } from './RecruitmentMiningGuide'

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
  useProductionStats,
  useUserLands
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
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误到错误报告服务
    console.error('[MiningPage ErrorBoundary] Caught error:', error, errorInfo)
    
    // 可以在这里发送错误到监控服务
    // sendErrorToService(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // 错误后的 fallback UI
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
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="text-xs text-gray-500 cursor-pointer">
                    错误详情 (开发模式)
                  </summary>
                  <pre className="text-xs text-red-400 mt-2 p-2 bg-gray-800 rounded overflow-auto max-h-40">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

// 移动端资源显示组件 - 使用安全格式化函数
const MobileResourceBar = memo(({ resources, resourceStats, grainStatus }: any) => {
  return (
    <div className="grid grid-cols-4 gap-1 mb-3 md:hidden">
      <div className="bg-gray-800 rounded p-2 text-center">
        <p className="text-[10px] text-gray-400">木头</p>
        <p className="text-xs font-bold text-green-400">
          {safeFormatResource(
            resourceStats?.data?.resources?.wood?.available || 
            resources?.wood
          )}
        </p>
      </div>
      <div className="bg-gray-800 rounded p-2 text-center">
        <p className="text-[10px] text-gray-400">铁矿</p>
        <p className="text-xs font-bold text-gray-400">
          {safeFormatResource(
            resourceStats?.data?.resources?.iron?.available || 
            resources?.iron
          )}
        </p>
      </div>
      <div className="bg-gray-800 rounded p-2 text-center">
        <p className="text-[10px] text-gray-400">石头</p>
        <p className="text-xs font-bold text-blue-400">
          {safeFormatResource(
            resourceStats?.data?.resources?.stone?.available || 
            resources?.stone
          )}
        </p>
      </div>
      <div className="bg-gray-800 rounded p-2 text-center">
        <p className="text-[10px] text-gray-400">粮食</p>
        <p className="text-xs font-bold text-yellow-400">
          {safeFormatResource(
            resourceStats?.data?.resources?.food?.available || 
            resourceStats?.data?.resources?.grain?.available || 
            resources?.grain || 
            resources?.food
          )}
        </p>
        {grainStatus?.warning && grainStatus?.hours_remaining != null && (
          <p className="text-[10px] text-red-400">
            {safeFormatResource(grainStatus.hours_remaining, 0)}h
          </p>
        )}
      </div>
    </div>
  )
})

MobileResourceBar.displayName = 'MobileResourceBar'

// 主页面组件
function MiningPage() {
  // ========== 认证状态 ==========
  const { isAuthenticated, user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  // ========== 状态管理 ==========
  const [activeTab, setActiveTab] = useState<'myMines' | 'market' | 'hiring'>('myMines')
  const [miningSubTab, setMiningSubTab] = useState<'overview' | 'sessions' | 'tools' | 'synthesis'>('overview')
  const [showBetaModal, setShowBetaModal] = useState(false)
  const [hasMiningAccess, setHasMiningAccess] = useState(false)
  const [selectedMineId, setSelectedMineId] = useState<number | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // 替代 sessionStorage 的状态
  const [pendingMiningTab, setPendingMiningTab] = useState<string | null>(null)
  
  // ========== 数据获取 - 优化：条件加载 ==========
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
    page_size: isMobile ? 20 : 50, // 移动端减少数据量
    ordering: '-created_at'
  } : null)
  
  const { 
    mine: selectedMine, 
    loading: detailLoading
  } = useYLDMineDetail(shouldFetchData ? selectedMineId : null)
  
  const { 
    lands: userLands
  } = useUserLands({
    enabled: shouldFetchMiningData // 只在有权限时加载
  })
  
  const { 
    sessions, 
    loading: sessionsLoading, 
    refetch: refetchSessions
  } = useMiningSessions({
    status: 'active',
    enabled: shouldFetchMiningData // 只在有权限时加载
  })
  
  const { 
    tools, 
    loading: toolsLoading, 
    stats: toolStats, 
    refetch: refetchTools
  } = useMyTools({
    enabled: shouldFetchMiningData // 只在有权限时加载
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
  
  // ========== 副作用 ==========
  
  // 全局错误处理
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('[MiningPage] Global error:', event.error)
      
      // 特殊处理某些已知错误
      if (event.error?.message?.includes('localStorage')) {
        console.warn('[MiningPage] localStorage error detected, using fallback')
        // 错误已经被 safeStorage 处理，这里不需要额外操作
        event.preventDefault()
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[MiningPage] Unhandled promise rejection:', event.reason)
      
      // 显示用户友好的错误提示
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
  
  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // 认证检查
  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      toast.error('请先登录查看矿山数据')
      router.push('/login?redirect=/mining')
    }
  }, [authLoading, isAuthenticated, router])
  
  // 检查内测权限
  useEffect(() => {
    const access = hasBetaAccess()
    setHasMiningAccess(access)
  }, [])
  
  // 处理待切换的标签页
  useEffect(() => {
    if (hasMiningAccess && pendingMiningTab) {
      setMiningSubTab(pendingMiningTab as any)
      setPendingMiningTab(null)
    }
  }, [hasMiningAccess, pendingMiningTab])
  
  // ========== 工具函数 - 使用安全格式化函数 ==========
  const formatYLD = useCallback((value: string | number | null | undefined): string => {
    return safeFormatYLD(value)
  }, [])
  
  const formatResource = useCallback((value: string | number | null | undefined): string => {
    return safeFormatResource(value)
  }, [])
  
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
    } catch (error) {
      console.error('[MiningPage] Start mining failed:', error)
      // 错误已经在 hook 中处理
    }
  }, [startMining, refetchSessions, refetchTools, refetchResourceStats])
  
  const handleStopSession = useCallback(async (sessionId: number) => {
    try {
      await stopProduction(sessionId)
      toast.success('已停止生产')
      refetchSessions()
      refetchTools()
      refetchResources()
      refetchResourceStats()
    } catch (error) {
      console.error('[MiningPage] Stop session failed:', error)
    }
  }, [stopProduction, refetchSessions, refetchTools, refetchResources, refetchResourceStats])
  
  const handleCollectSessionOutput = useCallback(async (sessionId: number) => {
    try {
      await collectOutput(sessionId)
      toast.success('收取成功！')
      refetchSessions()
      refetchResources()
      refetchResourceStats()
    } catch (error) {
      console.error('[MiningPage] Collect output failed:', error)
    }
  }, [collectOutput, refetchSessions, refetchResources, refetchResourceStats])
  
  const handleSynthesize = useCallback(async (toolType: string, quantity: number) => {
    try {
      await synthesize({
        tool_type: toolType,
        quantity: quantity
      })
      refetchTools()
      refetchResources()
      refetchResourceStats()
    } catch (error) {
      console.error('[MiningPage] Synthesize failed:', error)
    }
  }, [synthesize, refetchTools, refetchResources, refetchResourceStats])
  
  // 处理标签页点击（替代 sessionStorage）
  const handleTabClick = useCallback((tab: string) => {
    if (!hasMiningAccess) {
      setPendingMiningTab(tab)
      setShowBetaModal(true)
    } else {
      setMiningSubTab(tab as any)
    }
  }, [hasMiningAccess])
  
  // ========== 渲染逻辑 ==========
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
      
      {/* 顶部状态栏 - 优化移动端显示 */}
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
                      {formatYLD(yldStats.total_yld_capacity)}
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
        {/* 主标签切换 - 优化移动端 */}
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

        {/* 内容区域 - 优化移动端布局 */}
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
                {/* 子标签切换 - 优化移动端 */}
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
                  <button
                    onClick={() => handleTabClick('synthesis')}
                    className={cn(
                      "px-2 py-1 sm:px-3 sm:py-1.5 rounded text-[11px] sm:text-sm font-bold transition-colors whitespace-nowrap",
                      miningSubTab === 'synthesis' 
                        ? "bg-gray-700 text-white" 
                        : "bg-gray-800 text-gray-400"
                    )}
                  >
                    合成系统
                  </button>
                </div>

                {/* 移动端资源显示栏 */}
                {isMobile && hasMiningAccess && (resources || resourceStats) && miningSubTab !== 'overview' && (
                  <MobileResourceBar 
                    resources={resources} 
                    resourceStats={resourceStats}
                    grainStatus={grainStatus}
                  />
                )}

                {/* 桌面端资源显示栏 */}
                {!isMobile && hasMiningAccess && (resources || resourceStats) && miningSubTab !== 'overview' && (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <PixelCard className="p-2 text-center">
                      <p className="text-xs text-gray-400">木头</p>
                      <p className="text-sm font-bold text-green-400">
                        {formatResource(
                          resourceStats?.data?.resources?.wood?.available || 
                          resources?.wood || 0
                        )}
                      </p>
                    </PixelCard>
                    <PixelCard className="p-2 text-center">
                      <p className="text-xs text-gray-400">铁矿</p>
                      <p className="text-sm font-bold text-gray-400">
                        {formatResource(
                          resourceStats?.data?.resources?.iron?.available || 
                          resources?.iron || 0
                        )}
                      </p>
                    </PixelCard>
                    <PixelCard className="p-2 text-center">
                      <p className="text-xs text-gray-400">石头</p>
                      <p className="text-sm font-bold text-blue-400">
                        {formatResource(
                          resourceStats?.data?.resources?.stone?.available || 
                          resources?.stone || 0
                        )}
                      </p>
                    </PixelCard>
                    <PixelCard className="p-2 text-center">
                      <p className="text-xs text-gray-400">粮食</p>
                      <p className="text-sm font-bold text-yellow-400">
                        {formatResource(
                          resourceStats?.data?.resources?.food?.available || 
                          resourceStats?.data?.resources?.grain?.available || 
                          resources?.grain || 
                          resources?.food || 0
                        )}
                      </p>
                      {grainStatus?.warning && (
                        <p className="text-xs text-red-400">
                          剩{grainStatus.hours_remaining.toFixed(1)}h
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
                    <MiningSessions
                      sessions={sessions}
                      loading={sessionsLoading}
                      userLands={userLands}
                      tools={tools}
                      onStartMining={handleStartSelfMining}
                      onStopSession={handleStopSession}
                      onCollectOutput={handleCollectSessionOutput}
                      startMiningLoading={startMiningLoading}
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

                {miningSubTab === 'tools' && (
                  hasMiningAccess ? (
                    <ToolManagement
                      tools={tools}
                      loading={toolsLoading}
                      toolStats={toolStats}
                      resources={resources || resourceStats?.data?.resources}
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

                {miningSubTab === 'synthesis' && (
                  hasMiningAccess ? (
                    <ToolManagement
                      tools={tools}
                      loading={toolsLoading}
                      toolStats={toolStats}
                      resources={resources || resourceStats?.data?.resources}
                      onSynthesize={handleSynthesize}
                      synthesizeLoading={synthesizeLoading}
                      showOnlySynthesis={true}
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

            {/* 矿山市场 */}
            {activeTab === 'market' && (
              <PixelCard className="text-center py-8 sm:py-12">
                <span className="text-4xl sm:text-6xl block mb-3 sm:mb-4">🗺️</span>
                <p className="text-sm sm:text-base text-gray-400 mb-2">矿山市场即将开放</p>
                <p className="text-xs sm:text-sm text-gray-500">
                  届时您可以在这里交易矿山 NFT
                </p>
              </PixelCard>
            )}

            {/* 招聘市场 */}
            {activeTab === 'hiring' && (
              <div className="space-y-4">
                <RecruitmentMiningGuide />
                
                <PixelCard className="text-center py-8 sm:py-12">
                  <span className="text-4xl sm:text-6xl block mb-3 sm:mb-4">👷</span>
                  <p className="text-sm sm:text-base text-gray-400 mb-2">招募挖矿功能即将开放</p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    届时您可以招募矿工或成为矿工赚取收益
                  </p>
                </PixelCard>
              </div>
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
          
          // 如果有待切换的标签页，切换到对应页面
          if (pendingMiningTab && pendingMiningTab !== 'overview') {
            setMiningSubTab(pendingMiningTab as any)
            setPendingMiningTab(null)
          } else {
            setMiningSubTab('sessions')
          }
          
          toast.success('验证成功！欢迎进入挖矿系统')
          refetchResourceStats()
        }}
      />
      
      {/* 内测提示弹窗 - 只在有权限时显示 */}
      {hasMiningAccess && <BetaNotice compact={isMobile} />}
      
      {/* 矿山详情模态框 - 优化移动端 */}
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
                    {formatYLD(selectedMine.yld_capacity || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">累计产出</p>
                  <p className="font-bold text-green-400 text-base sm:text-lg">
                    {formatYLD(selectedMine.accumulated_output || 0)}
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
