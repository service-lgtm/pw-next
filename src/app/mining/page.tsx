/**
 * ===========================================
 * 文件创建/修改说明 
 * ===========================================
 * 修改原因: 优化挖矿流程，减少操作步骤，资源点击跳转市场
 * 主要功能: 挖矿中心主页面，集成快速挖矿功能
 * 依赖关系: 
 * - 使用 ./YLDMineList.tsx (矿山列表)
 * - 使用 ./QuickStartMining.tsx (快速开始)
 * - 使用 ./MiningSessions.tsx (挖矿会话)
 * 
 * 主要逻辑流程:
 * 1. 从矿山列表直接开始挖矿
 * 2. 快速选择工具数量
 * 3. 一键确认开始
 * 4. 点击资源跳转到市场页面
 * 
 * ⚠️ 重要提醒:
 * - 保持快速开始流程的简洁性
 * - 不要增加额外的确认步骤
 * - 确保数据传递的完整性
 * 
 * 最后修改: 2025-01-30 - 资源点击跳转市场
 * ===========================================
 */

// src/app/mining/page.tsx
// 挖矿中心页面 - 优化版（快速开始挖矿）

'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

// 组件导入
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { YLDMineList } from './YLDMineList'
import { MiningSessions, type MiningSessionsRef } from './MiningSessions'
import { ToolManagement } from './ToolManagement'
import { SynthesisSystem } from './SynthesisSystem'
import { QuickStartMining } from './QuickStartMining'
import { MiningPreCheck } from './MiningPreCheck'

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
  useMiningSummary,
  useMiningPreCheck
} from '@/hooks/useProduction'

// 类型导入
import type { YLDMine, MineLand } from '@/types/assets'
import type { Tool } from '@/types/production'
import { useSynthesisSystem } from '@/hooks/useSynthesis'
import { getResourceIcon, RESOURCE_TYPES } from '@/utils/resourceTool'

// ==================== 配置 ====================

// 模块配置
const MODULES = {
  mines: {
    id: 'mines',
    title: '我的矿山',
    icon: '⛰️',
    gradient: 'from-purple-600 to-purple-500',
    bgColor: 'bg-purple-900/20',
    description: '管理你的矿山资产'
  },
  sessions: {
    id: 'sessions',
    title: '挖矿生产',
    icon: '⛏️',
    gradient: 'from-green-600 to-green-500',
    bgColor: 'bg-green-900/20',
    description: '管理挖矿会话'
  },
  tools: {
    id: 'tools',
    title: '工具管理',
    icon: '🔧',
    gradient: 'from-blue-600 to-blue-500',
    bgColor: 'bg-blue-900/20',
    description: '查看和修复工具'
  },
  synthesis: {
    id: 'synthesis',
    title: '合成中心',
    icon: '⚗️',
    gradient: 'from-orange-600 to-orange-500',
    bgColor: 'bg-orange-900/20',
    description: '合成工具和材料'
  }
}

// ==================== 子组件 ====================

/**
 * 资源展示栏
 */
const ResourceBar = ({
  resources,
  grainWarning,
  onClick
}: {
  resources: Record<string, number>
  grainWarning?: string
  onClick?: (type: string) => void
}) => {
  const resourceTypes = [
    { key: 'wood', icon: RESOURCE_TYPES.WOOD, color: 'text-green-400', bgColor: 'bg-green-900/20' },
    { key: 'iron', icon: RESOURCE_TYPES.IRON_ORE, color: 'text-gray-400', bgColor: 'bg-gray-900/20' },
    { key: 'stone', icon: RESOURCE_TYPES.STONE, color: 'text-blue-400', bgColor: 'bg-blue-900/20' },
    { key: 'food', icon: RESOURCE_TYPES.GRAIN, color: grainWarning ? 'text-red-400' : 'text-yellow-400', bgColor: grainWarning ? 'bg-red-900/20' : 'bg-yellow-900/20' },
    { key: 'yld', icon: RESOURCE_TYPES.METEORITE, color: 'text-purple-400', bgColor: 'bg-purple-900/20' }
  ]

  return (
    <div className="grid grid-cols-5 gap-2 mb-4">
      {resourceTypes.map(({ key, icon, color, bgColor }) => (
        <button
          key={key}
          onClick={() => onClick?.(key)}
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-lg transition-all",
            bgColor,
            "hover:scale-105 active:scale-95"
          )}
        >
          <span className="text-xl mb-1">{getResourceIcon(icon, {
            iconSize: 32,
            haveBackgroundWarper: true,
          })}</span>
          <span className={cn("text-xs font-bold", color)}>
            {formatResource(resources[key] || 0)}
          </span>
          {key === 'food' && grainWarning && (
            <span className="text-xs text-red-400">!</span>
          )}
        </button>
      ))}
    </div>
  )
}

/**
 * 模块卡片
 */
const ModuleCard = ({
  module,
  stats,
  onClick,
  disabled = false
}: {
  module: typeof MODULES[keyof typeof MODULES]
  stats?: { value: number | string; label: string; highlight?: boolean }
  onClick: () => void
  disabled?: boolean
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-full p-6 rounded-2xl transition-all duration-200",
        "bg-gradient-to-br from-gray-800 to-gray-900",
        "border-2 border-gray-700",
        "hover:scale-105 hover:border-gold-500/50",
        "active:scale-95",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className={cn("absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r", module.gradient)} />

      {stats?.highlight && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-white text-xs font-bold">{stats.value}</span>
        </div>
      )}

      <div className="flex flex-col items-center text-center">
        <div className="text-4xl mb-3">{module.icon}</div>
        <h3 className="text-base font-bold text-white mb-1">{module.title}</h3>
        <p className="text-xs text-gray-400 mb-3">{module.description}</p>
        {stats && (
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-bold",
            module.bgColor,
            stats.highlight ? "text-yellow-400" : "text-gray-300"
          )}>
            {stats.value} {stats.label}
          </div>
        )}
      </div>
    </button>
  )
}

/**
 * 快速统计卡片
 */
const QuickStats = ({
  stats,
  onMinesClick,
  onSessionsClick,
  onToolsClick
}: {
  stats: any
  onMinesClick: () => void
  onSessionsClick: () => void
  onToolsClick: () => void
}) => {
  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      <button
        onClick={onMinesClick}
        className="bg-gray-800/50 hover:bg-gray-800 rounded-lg p-3 text-center transition-all hover:scale-105 active:scale-95"
      >
        <p className="text-2xl font-bold text-white">{stats.totalMines}</p>
        <p className="text-xs text-gray-400">矿山</p>
      </button>
      <button
        onClick={onSessionsClick}
        className="bg-gray-800/50 hover:bg-gray-800 rounded-lg p-3 text-center transition-all hover:scale-105 active:scale-95 relative"
      >
        {stats.collectibleSessions > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white text-xs font-bold">{stats.collectibleSessions}</span>
          </div>
        )}
        <p className="text-2xl font-bold text-green-400">{stats.activeSessions}</p>
        <p className="text-xs text-gray-400">生产中</p>
      </button>
      <button
        onClick={onToolsClick}
        className="bg-gray-800/50 hover:bg-gray-800 rounded-lg p-3 text-center transition-all hover:scale-105 active:scale-95 relative"
      >
        {stats.damagedTools > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{stats.damagedTools}</span>
          </div>
        )}
        <p className="text-2xl font-bold text-blue-400">{stats.totalTools}</p>
        <p className="text-xs text-gray-400">工具</p>
      </button>
    </div>
  )
}

// ==================== 工具函数 ====================

function formatResource(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toFixed(0)
}

// ==================== 主组件 ====================

export default function MiningPage() {
  // 认证状态
  const { isAuthenticated, user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // MiningSessions实例
  const MiningSessionsRef = useRef<MiningSessionsRef>(null)

  // 状态管理
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [selectedMineId, setSelectedMineId] = useState<number | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showQuickStart, setShowQuickStart] = useState(false)
  const [selectedMineForStart, setSelectedMineForStart] = useState<any>(null)
  const [isMobile, setIsMobile] = useState(false)

  // 数据获取
  const shouldFetchData = !authLoading && isAuthenticated

  const {
    mines: yldMines,
    loading: yldMinesLoading,
    error: yldMinesError,
    stats: yldStats,
    totalCount: yldTotalCount,
    refetch: refetchYLDMines
  } = useMyYLDMines(shouldFetchData ? {
    page: 1,
    page_size: 100,
    ordering: '-created_at'
  } : null)

  const {
    mine: selectedMine,
    loading: detailLoading
  } = useYLDMineDetail(shouldFetchData ? selectedMineId : null)

  const {
    lands: userLands
  } = useUserLands({
    enabled: shouldFetchData
  })
  // 使用合成系统 Hook
  const {
    loading,
    refetch
  } = useSynthesisSystem({
    enabled: true, // 直接启用，不需要权限检查
    autoRefresh: false
  })
  const {
    sessions,
    loading: sessionsLoading,
    refetch: refetchSessions
  } = useMiningSessions({
    status: 'active',
    enabled: shouldFetchData
  })

  const {
    tools,
    loading: toolsLoading,
    stats: toolStats,
    refetch: refetchTools
  } = useMyTools({
    enabled: shouldFetchData,
    page_size: 100  // 获取所有工具，避免分页问题
  })

  const {
    resources,
    refetch: refetchResources
  } = useMyResources({
    enabled: shouldFetchData,
    useStats: true
  })

  const {
    stats: resourceStats,
    refetch: refetchResourceStats
  } = useResourceStats({
    enabled: shouldFetchData
  })

  const {
    status: grainStatus
  } = useGrainStatus({
    enabled: shouldFetchData
  })

  const {
    status: yldSystemStatus,
    refetch: refetchYLDStatus
  } = useYLDStatus({
    enabled: shouldFetchData,
    autoRefresh: true,
    refreshInterval: 60000
  })

  const {
    summary: miningSummary,
    refetch: refetchMiningSummary
  } = useMiningSummary({
    enabled: shouldFetchData,
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

  const {
    checkResult: preCheckResult,
    performCheck
  } = useMiningPreCheck()

  // 计算统计数据
  const stats = useMemo(() => {
    const activeSessions = sessions?.length || 0
    const totalTools = tools?.length || 0
    const damagedTools = tools?.filter(t => t.current_durability < t.max_durability).length || 0
    const collectibleSessions = sessions?.filter(s => s.can_collect).length || 0

    return {
      activeSessions,
      totalTools,
      damagedTools,
      collectibleSessions,
      totalMines: yldTotalCount || 0,
      producingMines: yldStats?.producing_count || 0,
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

  const resourceData = useMemo(() => ({
    wood: getResourceAmount('wood'),
    iron: getResourceAmount('iron'),
    stone: getResourceAmount('stone'),
    food: getResourceAmount('food') || getResourceAmount('grain'),
    yld: getResourceAmount('yld')
  }), [getResourceAmount])

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


  const onSynthesizeTool = () => {
    setActiveModule('synthesis')
  }

  // 处理资源点击 - 跳转到市场
  const handleResourceClick = useCallback((resourceType: string) => {
    // 所有资源点击都跳转到市场页面
    router.push('/market')
  }, [router])

  // 事件处理
  const handleViewDetail = useCallback((mine: YLDMine | MineLand) => {
    setSelectedMineId(mine.id)
    setShowDetailModal(true)
  }, [])

  /**
   * 处理快速开始挖矿
   * 从矿山卡片直接开始，无需选择土地
   */
  const handleQuickStartMining = useCallback(async (mine: any) => {
    console.log('[MiningPage] 快速开始挖矿，矿山:', mine)

    // 先进行预检查
    await performCheck()

    // 检查预检查结果
    if (preCheckResult && !preCheckResult.can_mine) {
      toast.error('请先解决挖矿条件问题')
      return
    }

    // 设置选中的矿山并显示快速开始窗口
    setSelectedMineForStart(mine)
    setShowQuickStart(true)
  }, [performCheck, preCheckResult])

  /**
   * 确认开始挖矿
   * 从快速开始窗口调用
   */
  const handleConfirmStartMining = useCallback(async (landId: number, toolIds: number[]) => {
    try {
      await startMining({
        land_id: landId,
        tool_ids: toolIds
      })

      // 刷新所有相关数据
      refetchSessions()
      refetchTools()
      refetchResourceStats()
      refetchMiningSummary()
      refetchYLDStatus()
      refetchYLDMines()

      // 关闭快速开始窗口
      setShowQuickStart(false)
      setSelectedMineForStart(null)

      toast.success('开始挖矿成功！', {
        icon: '⛏️',
        duration: 3000
      })
    } catch (error) {
      console.error('[MiningPage] Start mining failed:', error)
      toast.error('开始挖矿失败')
    }
  }, [startMining, refetchSessions, refetchTools, refetchResourceStats, refetchMiningSummary, refetchYLDStatus, refetchYLDMines])

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

  const handleModuleClick = useCallback((moduleId: string) => {
    setActiveModule(moduleId)
  }, [])

  // 显示快速挖矿弹窗
  const showQuickStartModal = () => {
    MiningSessionsRef?.current?.handleOpenStartModal();
  }

  const handleCloseModule = useCallback(() => {
    setActiveModule(null)
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
      {/* 主内容区 */}
      <div className="container mx-auto px-3 py-4 pb-20 sm:pb-8">
        {/* 标题 */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-white mb-1">⛏️ 挖矿中心</h1>
          <p className="text-sm text-gray-400">
            欢迎回来，{user?.nickname || user?.username}
          </p>
        </div>

        {/* 资源展示栏 */}
        <ResourceBar
          resources={resourceData}
          grainWarning={grainStatus?.warning ? `剩${grainStatus.hours_remaining?.toFixed(1)}h` : undefined}
          onClick={handleResourceClick}
        />

        {/* 快速统计 */}
        <QuickStats
          stats={stats}
          onMinesClick={() => handleModuleClick('mines')}
          onSessionsClick={() => handleModuleClick('sessions')}
          onToolsClick={() => handleModuleClick('tools')}
        />

        {/* 模块卡片网格 */}
        <div className="grid grid-cols-2 gap-4">
          <ModuleCard
            module={MODULES.mines}
            stats={{
              value: stats.totalMines,
              label: '个矿山',
              highlight: false
            }}
            onClick={() => handleModuleClick('mines')}
          />
          <ModuleCard
            module={MODULES.sessions}
            stats={{
              value: stats.activeSessions,
              label: '生产中',
              highlight: stats.collectibleSessions > 0
            }}
            // onClick={() => handleModuleClick('sessions')}
            onClick={showQuickStartModal}
          />
          <ModuleCard
            module={MODULES.tools}
            stats={{
              value: stats.totalTools,
              label: '个工具',
              highlight: stats.damagedTools > 0
            }}
            onClick={() => handleModuleClick('tools')}
          />
          <ModuleCard
            module={MODULES.synthesis}
            onClick={() => handleModuleClick('synthesis')}
          />
        </div>

        {/* 快速提示 */}
        {stats.collectibleSessions > 0 && (
          <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
            <button
              onClick={() => handleModuleClick('sessions')}
              className="w-full text-left"
            >
              <p className="text-sm text-green-400">
                💰 你有 {stats.collectibleSessions} 个会话可以收取产出 →
              </p>
            </button>
          </div>
        )}

        {grainStatus?.warning && (
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-400">
              ⚠️ 粮食即将耗尽，剩余 {grainStatus.hours_remaining?.toFixed(1)} 小时
            </p>
          </div>
        )}
      </div>

      {/* 模块内容模态框 */}
      {activeModule && (
        <PixelModal
          isOpen={!!activeModule}
          onClose={handleCloseModule}
          title={MODULES[activeModule as keyof typeof MODULES]?.title}
          size="large"
          titleExtra={activeModule === 'synthesis' && <PixelButton
            onClick={refetch}
            disabled={loading}
            variant="secondary"
            size="sm"
          >
            {loading ? '刷新中...' : '🔄 刷新'}
          </PixelButton>}
        >
          <div className="max-h-[70vh] overflow-y-auto">
            {activeModule === 'mines' && (
              <YLDMineList
                mines={yldMines}
                loading={yldMinesLoading}
                error={yldMinesError}
                onViewDetail={handleViewDetail}
                onRefresh={refetchYLDMines}
                onStartProduction={(mineId) => {
                  // 找到对应的矿山对象
                  const mine = yldMines?.find(m => m.id === mineId)
                  if (mine) {
                    handleQuickStartMining(mine)
                  }
                }}
                tools={tools}  // 传递工具列表
                onStartMining={handleConfirmStartMining}  // 传递开始挖矿函数
              />
            )}
            {activeModule === 'sessions' && (
              <MiningSessions
                grainTotal={resourceData?.food}
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
                  router.push('/market')
                }}
                onSynthesizeTool={onSynthesizeTool}
              />
            )}
            {activeModule === 'tools' && (
              <ToolManagement
                tools={tools}
                loading={toolsLoading}
                toolStats={toolStats}
                resources={resourceData}
                onSynthesize={handleSynthesize}
                synthesizeLoading={synthesizeLoading}
                showOnlyTools={true}
              />
            )}
            {activeModule === 'synthesis' && (
              <SynthesisSystem
                className="w-full"
                isMobile={isMobile}
              />
            )}
          </div>
        </PixelModal>
      )}

      <MiningSessions
        ref={MiningSessionsRef}
        grainTotal={resourceData?.food}
        hiddenNode
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
          router.push('/market')
        }}
        onSynthesizeTool={onSynthesizeTool}
      />

      {/* 快速开始挖矿模态框 */}
      <PixelModal
        isOpen={showQuickStart}
        onClose={() => {
          setShowQuickStart(false)
          setSelectedMineForStart(null)
        }}
        title="快速开始挖矿"
        size="medium"
      >
        {selectedMineForStart && tools && (
          <QuickStartMining
            grainTotal={resourceData?.food}
            mine={selectedMineForStart}
            tools={tools}
            onConfirm={handleConfirmStartMining}
            onCancel={() => {
              setShowQuickStart(false)
              setSelectedMineForStart(null)
            }}
            loading={startMiningLoading}
            userLevel={user?.level || 6}
          />
        )}
      </PixelModal>

      {/* 矿山详情模态框 */}
      <PixelModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedMineId(null)
        }}
        title="矿山详情"
        size={isMobile ? "small" : "medium"}
      >
        {detailLoading ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">⏳</div>
            <p className="text-gray-400">加载详情...</p>
          </div>
        ) : selectedMine ? (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold mb-3 text-gold-500">基本信息</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400">矿山编号</p>
                  <p className="font-bold">{selectedMine.land_id}</p>
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
                  handleQuickStartMining(selectedMine)
                }}
                disabled={selectedMine.is_producing}
              >
                {selectedMine.is_producing ? '生产中' : '开始挖矿'}
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
