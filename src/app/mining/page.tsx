// src/app/mining/page.tsx
// 挖矿中心页面 - 集成生产系统版本
// 
// 文件说明：
// 1. 本文件是挖矿中心的主页面组件
// 2. 整合了完整的挖矿生产系统（自主挖矿、打工、合成等）
// 3. 保留了原有的页面结构和交互方式
// 4. 挖矿即生产，生产即挖矿，是同一个系统
// 5. 优化了移动端响应式布局
//
// 关联文件：
// - @/hooks/useYLDMines: YLD 矿山数据 Hook
// - @/hooks/useProduction: 生产系统数据 Hook
// - @/hooks/useLands: 土地数据 Hook
// - @/lib/api/assets: 资产 API 接口（包括土地、YLD矿山）
// - @/lib/api/production: 生产系统 API 接口
// - @/types/assets: 资产类型定义
// - @/types/production: 生产系统类型定义
// - @/components/mining/BetaPasswordModal: 内测密码验证组件
// - @/components/shared/PixelCard: 像素风格卡片组件
// - @/components/shared/PixelButton: 像素风格按钮组件
// - @/components/shared/PixelModal: 像素风格模态框组件
//
// 注意事项：
// - 需要用户登录才能访问
// - 挖矿功能需要内测密码（888888）
// - 移动端自适应布局，支持触摸操作

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { BetaPasswordModal, hasBetaAccess } from '@/components/mining/BetaPasswordModal'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useMyYLDMines, useYLDMineDetail } from '@/hooks/useYLDMines'
import {
  useMiningSessions,
  useMyTools,
  useMyResources,
  useStartSelfMining,
  useStartHiredMining,
  useSynthesizeTool,
  useStopProduction,
  useCollectOutput,
  useGrainStatus,
  useProductionStats,
  useUserLands  // 添加获取用户土地的 Hook
} from '@/hooks/useProduction'
import type { YLDMine, YLDMineDetail, Land } from '@/types/assets'
import type { MiningSession, Tool } from '@/types/production'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

// ==================== 主组件 ====================
export default function MiningPage() {
  // ========== 认证状态 ==========
  const { isAuthenticated, user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  // ========== 状态管理 ==========
  // 主标签页状态 - 保持原有的标签结构
  const [activeTab, setActiveTab] = useState<'myMines' | 'market' | 'hiring'>('myMines')
  
  // 我的矿山子标签 - 新增挖矿、工具、合成
  const [miningSubTab, setMiningSubTab] = useState<'overview' | 'sessions' | 'tools' | 'synthesis'>('overview')
  
  // 内测权限
  const [showBetaModal, setShowBetaModal] = useState(false)
  const [hasMiningAccess, setHasMiningAccess] = useState(false)
  
  // YLD矿山相关
  const [selectedMineId, setSelectedMineId] = useState<number | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  // 挖矿生产相关
  const [selectedLand, setSelectedLand] = useState<Land | null>(null)
  const [selectedTools, setSelectedTools] = useState<number[]>([])
  const [showStartMiningModal, setShowStartMiningModal] = useState(false)
  const [showSynthesisModal, setShowSynthesisModal] = useState(false)
  const [synthesisType, setSynthesisType] = useState<'pickaxe' | 'axe' | 'hoe'>('pickaxe')
  const [synthesisQuantity, setSynthesisQuantity] = useState(1)
  
  // 响应式状态
  const [isMobile, setIsMobile] = useState(false)
  const [showMobilePanel, setShowMobilePanel] = useState(false)
  
  // ========== 数据获取 ==========
  const shouldFetchData = !authLoading && isAuthenticated
  
  // YLD 矿山数据 - 提供默认值避免解构 undefined
  const { 
    mines: yldMines = [], 
    loading: yldMinesLoading = false, 
    error: yldMinesError = null, 
    stats: yldStats = null,
    totalCount: yldTotalCount = 0,
    refetch: refetchYLDMines = () => {}
  } = useMyYLDMines(shouldFetchData ? {
    page: 1,
    page_size: 50,
    ordering: '-created_at'
  } : null) || {}
  
  // YLD 矿山详情 - 提供默认值
  const { 
    mine: selectedMine = null, 
    loading: detailLoading = false, 
    error: detailError = null
  } = useYLDMineDetail(shouldFetchData ? selectedMineId : null) || {}
  
  // 用户土地数据 - 使用新的 Hook
  const { 
    lands: userLands, 
    loading: landsLoading, 
    error: landsError,
    refetch: refetchLands
  } = useUserLands({
    enabled: shouldFetchData
  })
  
  // 挖矿生产数据 - 使用修复后的 hooks，传递 enabled 参数控制是否获取数据
  const { 
    sessions, 
    loading: sessionsLoading, 
    refetch: refetchSessions
  } = useMiningSessions({
    status: 'active',
    enabled: hasMiningAccess && shouldFetchData
  })
  
  const { 
    tools, 
    loading: toolsLoading, 
    stats: toolStats, 
    refetch: refetchTools
  } = useMyTools({
    status: 'idle',
    enabled: hasMiningAccess && shouldFetchData
  })
  
  const { 
    resources, 
    loading: resourcesLoading, 
    refetch: refetchResources
  } = useMyResources({
    enabled: shouldFetchData
  })
  
  const { 
    status: grainStatus 
  } = useGrainStatus({
    enabled: hasMiningAccess && shouldFetchData
  })
  
  const { 
    stats: productionStats 
  } = useProductionStats({
    enabled: hasMiningAccess && shouldFetchData
  })
  
  // 生产操作 Hooks
  const { 
    startMining, 
    loading: startMiningLoading
  } = useStartSelfMining()
  
  const { 
    startWithTools, 
    startWithoutTools, 
    loading: hiredMiningLoading
  } = useStartHiredMining()
  
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
  
  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // 检查登录状态
  useEffect(() => {
    if (authLoading) return
    
    if (!isAuthenticated) {
      console.log('[MiningPage] 未登录，跳转到登录页')
      toast.error('请先登录查看矿山数据')
      router.push('/login?redirect=/mining')
    }
  }, [authLoading, isAuthenticated, router])
  
  // 检查挖矿权限 - 初始化时检查
  useEffect(() => {
    const access = hasBetaAccess()
    setHasMiningAccess(access)
  }, [])
  
  // ========== 工具函数 ==========
  
  // 格式化 YLD 数量
  const formatYLD = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return '0.00'
    return num.toFixed(4)
  }
  
  // 格式化资源数量
  const formatResource = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return '0.00'
    return num.toFixed(2)
  }
  
  // 格式化日期
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '未知'
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN')
  }
  
  // ========== 挖矿操作函数 ==========
  
  // 查看矿山详情
  const handleViewDetail = (mine: YLDMine) => {
    setSelectedMineId(mine.id)
    setShowDetailModal(true)
  }
  
  // 开始YLD生产（功能待开放）
  const handleStartProduction = (mineId: number) => {
    toast('生产功能即将开放', { icon: '🚧' })
  }
  
  // 收取YLD产出（功能待开放）
  const handleCollectYLDOutput = (mineId: number) => {
    toast('收取功能即将开放', { icon: '🚧' })
  }
  
  // 开启挖矿功能 - 需要内测密码
  const handleOpenMiningFeature = () => {
    if (!hasMiningAccess) {
      setShowBetaModal(true)
    } else {
      setMiningSubTab('sessions')
    }
  }
  
  // 开始自主挖矿
  const handleStartSelfMining = async () => {
    if (!selectedLand || selectedTools.length === 0) {
      toast.error('请选择土地和工具')
      return
    }
    
    try {
      await startMining({
        land_id: selectedLand.id,
        tool_ids: selectedTools
      })
      
      toast.success('开始挖矿成功！')
      setShowStartMiningModal(false)
      setSelectedLand(null)
      setSelectedTools([])
      refetchSessions()
      refetchTools()
    } catch (err) {
      console.error('开始挖矿失败:', err)
    }
  }
  
  // 停止挖矿会话
  const handleStopSession = async (sessionId: number) => {
    try {
      await stopProduction(sessionId)
      toast.success('已停止生产')
      refetchSessions()
      refetchTools()
      refetchResources()
    } catch (err) {
      console.error('停止生产失败:', err)
    }
  }
  
  // 收取产出
  const handleCollectSessionOutput = async (sessionId: number) => {
    try {
      await collectOutput(sessionId)
      toast.success('收取成功！')
      refetchSessions()
      refetchResources()
    } catch (err) {
      console.error('收取产出失败:', err)
    }
  }
  
  // 合成工具
  const handleSynthesize = async () => {
    try {
      await synthesize({
        tool_type: synthesisType,
        quantity: synthesisQuantity
      })
      
      toast.success(`成功合成 ${synthesisQuantity} 个工具！`)
      setShowSynthesisModal(false)
      setSynthesisQuantity(1)
      refetchTools()
      refetchResources()
    } catch (err) {
      console.error('合成失败:', err)
    }
  }
  
  // ========== 渲染 ==========
  
  // 如果正在加载认证状态，显示加载中
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-400">验证登录状态...</p>
        </div>
      </div>
    )
  }
  
  // 如果未登录，显示提示
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
      {/* 顶部状态栏 */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* 用户信息 */}
            <div className="flex items-center gap-2 text-center sm:text-left">
              <span className="text-sm text-gray-400">矿主：</span>
              <span className="text-sm text-gold-500 font-bold">{user?.nickname || user?.username}</span>
            </div>
            
            {/* 统计信息 */}
            <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto">
              <div className="text-center min-w-[80px]">
                <div className="text-xs text-gray-400">矿山数量</div>
                <div className="text-sm font-bold text-gold-500">{yldTotalCount || 0}</div>
              </div>
              {yldStats && (
                <>
                  <div className="text-center min-w-[100px]">
                    <div className="text-xs text-gray-400">YLD 总量</div>
                    <div className="text-sm font-bold text-purple-500">
                      {formatYLD(yldStats.total_yld_capacity || 0)}
                    </div>
                  </div>
                  <div className="text-center min-w-[80px]">
                    <div className="text-xs text-gray-400">生产中</div>
                    <div className="text-sm font-bold text-green-500">
                      {yldStats.producing_count || 0}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-4 sm:py-6">
        {/* 标签切换 - 保持原有的三个标签 */}
        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('myMines')}
            className={cn(
              "px-3 sm:px-6 py-2 rounded-lg font-bold transition-all whitespace-nowrap text-sm sm:text-base",
              activeTab === 'myMines' 
                ? "bg-green-500 text-white" 
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            )}
          >
            我的矿山
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={cn(
              "px-3 sm:px-6 py-2 rounded-lg font-bold transition-all whitespace-nowrap text-sm sm:text-base",
              activeTab === 'market' 
                ? "bg-green-500 text-white" 
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            )}
          >
            矿山市场
          </button>
          <button
            onClick={() => setActiveTab('hiring')}
            className={cn(
              "px-3 sm:px-6 py-2 rounded-lg font-bold transition-all whitespace-nowrap text-sm sm:text-base",
              activeTab === 'hiring' 
                ? "bg-green-500 text-white" 
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            )}
          >
            招聘市场
          </button>
        </div>

        {/* 内容区域 - 响应式网格 */}
        <div className={cn(
          "grid gap-4 sm:gap-6",
          !isMobile && "lg:grid-cols-12"
        )}>
          {/* 左侧 - 统计信息（桌面端显示） */}
          {!isMobile && activeTab === 'myMines' && (
            <div className="lg:col-span-4 space-y-6">
              {/* 矿山统计 */}
              <PixelCard>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">矿山统计</h3>
                  <PixelButton 
                    size="xs" 
                    onClick={refetchYLDMines}
                  >
                    刷新
                  </PixelButton>
                </div>
                
                {yldStats ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-gray-800 rounded">
                        <p className="text-xs text-gray-400">总矿山</p>
                        <p className="text-xl font-bold text-gold-500">{yldStats.total_mines}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-800 rounded">
                        <p className="text-xs text-gray-400">YLD 总量</p>
                        <p className="text-xl font-bold text-purple-500">
                          {formatYLD(yldStats.total_yld_capacity)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-gray-800 rounded">
                        <p className="text-xs text-gray-400">累计产出</p>
                        <p className="text-xl font-bold text-green-500">
                          {formatYLD(yldStats.total_accumulated_output)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-gray-800 rounded">
                        <p className="text-xs text-gray-400">生产中</p>
                        <p className="text-xl font-bold text-blue-500">{yldStats.producing_count}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">暂无统计数据</p>
                  </div>
                )}
              </PixelCard>

              {/* 挖矿功能入口 */}
              <PixelCard className="p-4 bg-green-900/20">
                <h3 className="font-bold mb-2 text-green-400">挖矿生产</h3>
                <div className="space-y-2 text-xs text-gray-400 mb-3">
                  <p>• 使用工具在土地上挖矿</p>
                  <p>• 消耗粮食获得资源产出</p>
                  <p>• 合成工具提高效率</p>
                </div>
                <PixelButton 
                  size="sm" 
                  className="w-full"
                  onClick={handleOpenMiningFeature}
                >
                  {hasMiningAccess ? '进入挖矿' : '开启挖矿'}
                </PixelButton>
              </PixelCard>

              {/* 操作说明 */}
              <PixelCard className="p-4 bg-blue-900/20">
                <h3 className="font-bold mb-2 text-blue-400">操作说明</h3>
                <div className="space-y-2 text-xs text-gray-400">
                  <p>• YLD 矿山可产出 YLD 代币</p>
                  <p>• 点击矿山卡片查看详情</p>
                  <p>• 挖矿功能需要内测密码</p>
                  <p>• 生产功能即将全面开放</p>
                </div>
              </PixelCard>
            </div>
          )}

          {/* 右侧 - 主内容（移动端全宽） */}
          <div className={cn(
            !isMobile && activeTab === 'myMines' && "lg:col-span-8"
          )}>
            <AnimatePresence mode="wait">
              {/* 我的矿山 */}
              {activeTab === 'myMines' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* 如果有挖矿权限，显示子标签 */}
                  {hasMiningAccess && (
                    <div className="flex gap-2 mb-4 overflow-x-auto">
                      <button
                        onClick={() => setMiningSubTab('overview')}
                        className={cn(
                          "px-3 py-1.5 rounded text-sm font-bold transition-all",
                          miningSubTab === 'overview' 
                            ? "bg-gray-700 text-white" 
                            : "bg-gray-800 text-gray-400"
                        )}
                      >
                        YLD矿山
                      </button>
                      <button
                        onClick={() => setMiningSubTab('sessions')}
                        className={cn(
                          "px-3 py-1.5 rounded text-sm font-bold transition-all",
                          miningSubTab === 'sessions' 
                            ? "bg-gray-700 text-white" 
                            : "bg-gray-800 text-gray-400"
                        )}
                      >
                        挖矿会话
                      </button>
                      <button
                        onClick={() => setMiningSubTab('tools')}
                        className={cn(
                          "px-3 py-1.5 rounded text-sm font-bold transition-all",
                          miningSubTab === 'tools' 
                            ? "bg-gray-700 text-white" 
                            : "bg-gray-800 text-gray-400"
                        )}
                      >
                        我的工具
                      </button>
                      <button
                        onClick={() => setMiningSubTab('synthesis')}
                        className={cn(
                          "px-3 py-1.5 rounded text-sm font-bold transition-all",
                          miningSubTab === 'synthesis' 
                            ? "bg-gray-700 text-white" 
                            : "bg-gray-800 text-gray-400"
                        )}
                      >
                        合成系统
                      </button>
                    </div>
                  )}

                  {/* 资源显示栏 - 仅在挖矿功能开启后显示 */}
                  {hasMiningAccess && resources && miningSubTab !== 'overview' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                      <PixelCard className="p-2 text-center">
                        <p className="text-xs text-gray-400">木头</p>
                        <p className="text-sm font-bold text-green-400">
                          {formatResource(resources.wood)}
                        </p>
                      </PixelCard>
                      <PixelCard className="p-2 text-center">
                        <p className="text-xs text-gray-400">铁矿</p>
                        <p className="text-sm font-bold text-gray-400">
                          {formatResource(resources.iron)}
                        </p>
                      </PixelCard>
                      <PixelCard className="p-2 text-center">
                        <p className="text-xs text-gray-400">石头</p>
                        <p className="text-sm font-bold text-blue-400">
                          {formatResource(resources.stone)}
                        </p>
                      </PixelCard>
                      <PixelCard className="p-2 text-center">
                        <p className="text-xs text-gray-400">粮食</p>
                        <p className="text-sm font-bold text-yellow-400">
                          {formatResource(resources.grain)}
                        </p>
                        {grainStatus && grainStatus.warning && (
                          <p className="text-xs text-red-400">
                            剩{grainStatus.hours_remaining.toFixed(1)}h
                          </p>
                        )}
                      </PixelCard>
                    </div>
                  )}

                  {/* 子标签内容 */}
                  {(!hasMiningAccess || miningSubTab === 'overview') && (
                    // YLD矿山列表 - 默认显示
                    yldMinesLoading ? (
                      <PixelCard className="text-center py-12">
                        <div className="animate-spin text-6xl mb-4">⏳</div>
                        <p className="text-gray-400">加载矿山数据...</p>
                      </PixelCard>
                    ) : yldMinesError ? (
                      <PixelCard className="text-center py-12">
                        <span className="text-6xl block mb-4">❌</span>
                        <p className="text-red-400 mb-4">{yldMinesError}</p>
                        <PixelButton onClick={refetchYLDMines}>
                          重新加载
                        </PixelButton>
                      </PixelCard>
                    ) : yldMines && yldMines.length > 0 ? (
                      <div className="grid gap-4">
                        {yldMines.map((mine) => (
                          <PixelCard 
                            key={mine.id} 
                            className="cursor-pointer hover:border-gold-500 transition-all"
                            onClick={() => handleViewDetail(mine)}
                          >
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-bold text-lg text-gold-500">
                                    {mine.land_id}
                                  </h4>
                                  <p className="text-sm text-gray-400">
                                    {mine.region_name} · {mine.land_type_display}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold",
                                    mine.is_producing 
                                      ? "bg-green-500/20 text-green-400"
                                      : "bg-gray-700 text-gray-400"
                                  )}>
                                    {mine.is_producing ? '生产中' : '闲置'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                <div>
                                  <p className="text-gray-400 text-xs">YLD 数量</p>
                                  <p className="font-bold text-purple-400">
                                    {formatYLD(mine.initial_price)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs">累计产出</p>
                                  <p className="font-bold text-green-400">
                                    {formatYLD(mine.accumulated_output)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs">批次</p>
                                  <p className="font-bold text-blue-400">
                                    {mine.metadata?.batch_id || '未知'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs">转换日期</p>
                                  <p className="font-bold text-gray-300">
                                    {formatDate(mine.metadata?.conversion_date || mine.created_at)}
                                  </p>
                                </div>
                              </div>
                              
                              {/* 操作按钮 */}
                              <div className="mt-4 flex gap-2">
                                {mine.is_producing ? (
                                  <PixelButton 
                                    size="sm" 
                                    className="flex-1"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleCollectYLDOutput(mine.id)
                                    }}
                                    disabled
                                  >
                                    收取产出（待开放）
                                  </PixelButton>
                                ) : (
                                  <PixelButton 
                                    size="sm" 
                                    className="flex-1"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleStartProduction(mine.id)
                                    }}
                                    disabled
                                  >
                                    开始生产（待开放）
                                  </PixelButton>
                                )}
                                <PixelButton 
                                  size="sm" 
                                  variant="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleViewDetail(mine)
                                  }}
                                >
                                  查看详情
                                </PixelButton>
                              </div>
                            </div>
                          </PixelCard>
                        ))}
                      </div>
                    ) : (
                      <PixelCard className="text-center py-12">
                        <span className="text-6xl block mb-4">🏔️</span>
                        <p className="text-gray-400 mb-4">您还没有 YLD 矿山</p>
                        <p className="text-sm text-gray-500">
                          YLD 矿山由 YLD 代币转换而来
                        </p>
                      </PixelCard>
                    )
                  )}

                  {/* 挖矿会话 */}
                  {hasMiningAccess && miningSubTab === 'sessions' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold">活跃挖矿会话</h3>
                        <PixelButton
                          onClick={() => setShowStartMiningModal(true)}
                          disabled={!userLands || userLands.length === 0}
                        >
                          开始挖矿
                        </PixelButton>
                      </div>
                      
                      {sessionsLoading ? (
                        <PixelCard className="text-center py-8">
                          <div className="animate-spin text-4xl">⏳</div>
                          <p className="text-gray-400 mt-2">加载中...</p>
                        </PixelCard>
                      ) : sessions && sessions.length > 0 ? (
                        <div className="space-y-3">
                          {sessions.map((session) => (
                            <PixelCard key={session.id} className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-bold text-gold-500">
                                    {session.land_info.land_id}
                                  </h4>
                                  <p className="text-sm text-gray-400">
                                    {session.land_info.land_type} · {session.land_info.region_name}
                                  </p>
                                  <div className="mt-2 text-sm">
                                    <p>产出速率: <span className="text-green-400">{session.output_rate}/小时</span></p>
                                    <p>累积产出: <span className="text-yellow-400">{session.accumulated_output}</span></p>
                                    <p>工具数量: <span className="text-blue-400">{session.tools?.length || 0}</span></p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <PixelButton
                                    size="xs"
                                    onClick={() => handleCollectSessionOutput(session.id)}
                                  >
                                    收取产出
                                  </PixelButton>
                                  <PixelButton
                                    size="xs"
                                    variant="secondary"
                                    onClick={() => handleStopSession(session.id)}
                                  >
                                    停止生产
                                  </PixelButton>
                                </div>
                              </div>
                            </PixelCard>
                          ))}
                        </div>
                      ) : (
                        <PixelCard className="text-center py-8">
                          <p className="text-gray-400">暂无活跃的挖矿会话</p>
                        </PixelCard>
                      )}
                    </div>
                  )}

                  {/* 我的工具 */}
                  {hasMiningAccess && miningSubTab === 'tools' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold">工具列表</h3>
                        {toolStats && (
                          <div className="text-sm text-gray-400">
                            总计: {toolStats.total_tools} | 
                            闲置: {toolStats.by_status?.idle || 0} | 
                            工作中: {toolStats.by_status?.working || 0}
                          </div>
                        )}
                      </div>
                      
                      {toolsLoading ? (
                        <PixelCard className="text-center py-8">
                          <div className="animate-spin text-4xl">⏳</div>
                          <p className="text-gray-400 mt-2">加载中...</p>
                        </PixelCard>
                      ) : tools && tools.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {tools.map((tool) => (
                            <PixelCard key={tool.id} className="p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-bold">{tool.tool_id}</p>
                                  <p className="text-sm text-gray-400">{tool.tool_type_display}</p>
                                  <div className="mt-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-400">耐久度:</span>
                                      <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                          className={cn(
                                            "h-full rounded-full",
                                            tool.durability > 750 ? "bg-green-500" :
                                            tool.durability > 300 ? "bg-yellow-500" : "bg-red-500"
                                          )}
                                          style={{ width: `${(tool.durability / tool.max_durability) * 100}%` }}
                                        />
                                      </div>
                                      <span className="text-xs">{tool.durability}/{tool.max_durability}</span>
                                    </div>
                                  </div>
                                </div>
                                <span className={cn(
                                  "px-2 py-1 rounded text-xs",
                                  tool.status === 'idle' ? "bg-green-500/20 text-green-400" :
                                  tool.status === 'working' ? "bg-blue-500/20 text-blue-400" :
                                  "bg-red-500/20 text-red-400"
                                )}>
                                  {tool.status_display}
                                </span>
                              </div>
                            </PixelCard>
                          ))}
                        </div>
                      ) : (
                        <PixelCard className="text-center py-8">
                          <p className="text-gray-400">暂无工具</p>
                          <p className="text-sm text-gray-500 mt-2">请先合成工具</p>
                        </PixelCard>
                      )}
                    </div>
                  )}

                  {/* 合成系统 */}
                  {hasMiningAccess && miningSubTab === 'synthesis' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold">合成工具</h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <PixelCard className="p-4 text-center cursor-pointer hover:border-gold-500"
                          onClick={() => {
                            setSynthesisType('pickaxe')
                            setShowSynthesisModal(true)
                          }}
                        >
                          <div className="text-4xl mb-2">⛏️</div>
                          <p className="font-bold">镐头</p>
                          <p className="text-xs text-gray-400 mt-1">铁70% + 木30%</p>
                        </PixelCard>
                        
                        <PixelCard className="p-4 text-center cursor-pointer hover:border-gold-500"
                          onClick={() => {
                            setSynthesisType('axe')
                            setShowSynthesisModal(true)
                          }}
                        >
                          <div className="text-4xl mb-2">🪓</div>
                          <p className="font-bold">斧头</p>
                          <p className="text-xs text-gray-400 mt-1">铁60% + 木40%</p>
                        </PixelCard>
                        
                        <PixelCard className="p-4 text-center cursor-pointer hover:border-gold-500"
                          onClick={() => {
                            setSynthesisType('hoe')
                            setShowSynthesisModal(true)
                          }}
                        >
                          <div className="text-4xl mb-2">🔨</div>
                          <p className="font-bold">锄头</p>
                          <p className="text-xs text-gray-400 mt-1">铁50% + 木50%</p>
                        </PixelCard>
                        
                        <PixelCard className="p-4 text-center cursor-pointer hover:border-gold-500"
                          onClick={() => {
                            toast('砖头合成即将开放', { icon: '🚧' })
                          }}
                        >
                          <div className="text-4xl mb-2">🧱</div>
                          <p className="font-bold">砖头</p>
                          <p className="text-xs text-gray-400 mt-1">石80% + 木20%</p>
                        </PixelCard>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* 矿山市场 */}
              {activeTab === 'market' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <PixelCard className="text-center py-12">
                    <span className="text-6xl block mb-4">🗺️</span>
                    <p className="text-gray-400 mb-2">矿山市场即将开放</p>
                    <p className="text-sm text-gray-500">
                      届时您可以在这里交易矿山 NFT
                    </p>
                  </PixelCard>
                </motion.div>
              )}

              {/* 招聘市场 */}
              {activeTab === 'hiring' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <PixelCard className="text-center py-12">
                    <span className="text-6xl block mb-4">👷</span>
                    <p className="text-gray-400 mb-2">招聘市场即将开放</p>
                    <p className="text-sm text-gray-500">
                      届时您可以雇佣矿工或成为矿工赚取收益
                    </p>
                  </PixelCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 底部提示 - 移动端优化 */}
        <div className="mt-6 sm:mt-8">
          <PixelCard className="p-4 sm:p-6 bg-gold-500/10 border-gold-500/30">
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <h3 className="font-bold text-gold-400 mb-2 text-sm sm:text-base">系统提示</h3>
                <p className="text-xs sm:text-sm text-gray-300">
                  YLD 矿山系统和挖矿生产系统正在优化中，部分功能即将开放。
                  挖矿功能需要内测密码验证。
                </p>
              </div>
            </div>
          </PixelCard>
        </div>
      </div>

      {/* ==================== 模态框 ==================== */}
      
      {/* 内测密码模态框 */}
      <BetaPasswordModal
        isOpen={showBetaModal}
        onClose={() => setShowBetaModal(false)}
        onSuccess={() => {
          setHasMiningAccess(true)
          setShowBetaModal(false)
          setMiningSubTab('sessions')
          toast.success('验证成功！欢迎进入挖矿系统')
        }}
      />
      
      {/* YLD矿山详情模态框 */}
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
            <div className="animate-spin text-4xl mb-2">⏳</div>
            <p className="text-gray-400">加载详情...</p>
          </div>
        ) : detailError ? (
          <div className="text-center py-8">
            <span className="text-4xl block mb-2">❌</span>
            <p className="text-red-400">{detailError}</p>
          </div>
        ) : selectedMine ? (
          <div className="space-y-4">
            {/* 基本信息 */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold mb-3 text-gold-500">基本信息</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400">矿山编号</p>
                  <p className="font-bold">{selectedMine.land_id}</p>
                </div>
                <div>
                  <p className="text-gray-400">所在区域</p>
                  <p className="font-bold">{selectedMine.region_name}</p>
                </div>
                <div>
                  <p className="text-gray-400">矿山类型</p>
                  <p className="font-bold">{selectedMine.land_type_display}</p>
                </div>
                <div>
                  <p className="text-gray-400">占地面积</p>
                  <p className="font-bold">{selectedMine.size_sqm} m²</p>
                </div>
                <div>
                  <p className="text-gray-400">坐标</p>
                  <p className="font-bold text-xs">
                    ({selectedMine.coordinate_x}, {selectedMine.coordinate_y})
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">状态</p>
                  <p className={cn(
                    "font-bold",
                    selectedMine.is_producing ? "text-green-400" : "text-gray-400"
                  )}>
                    {selectedMine.is_producing ? '生产中' : '闲置'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* YLD 信息 */}
            <div className="bg-purple-900/20 rounded-lg p-4">
              <h3 className="font-bold mb-3 text-purple-400">YLD 信息</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400">YLD 数量</p>
                  <p className="font-bold text-purple-400 text-lg">
                    {formatYLD(selectedMine.initial_price)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">累计产出</p>
                  <p className="font-bold text-green-400 text-lg">
                    {formatYLD(selectedMine.accumulated_output)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">日产量</p>
                  <p className="font-bold text-yellow-400">
                    待开放
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">批次编号</p>
                  <p className="font-bold text-blue-400">
                    {selectedMine.metadata?.batch_id || '未知'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex gap-3 pt-4">
              {selectedMine.is_producing ? (
                <PixelButton 
                  className="flex-1"
                  onClick={() => handleCollectYLDOutput(selectedMine.id)}
                  disabled
                >
                  收取产出（待开放）
                </PixelButton>
              ) : (
                <PixelButton 
                  className="flex-1"
                  onClick={() => handleStartProduction(selectedMine.id)}
                  disabled
                >
                  开始生产（待开放）
                </PixelButton>
              )}
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
      
      {/* 开始挖矿模态框 */}
      <PixelModal
        isOpen={showStartMiningModal}
        onClose={() => {
          setShowStartMiningModal(false)
          setSelectedLand(null)
          setSelectedTools([])
        }}
        title="开始自主挖矿"
        size="medium"
      >
        <div className="space-y-4">
          {/* 选择土地 */}
          <div>
            <label className="text-sm font-bold text-gray-300">选择土地</label>
            {userLands.length > 0 ? (
              <select
                className="w-full mt-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                value={selectedLand?.id || ''}
                onChange={(e) => {
                  const land = userLands.find(l => l.id === parseInt(e.target.value))
                  setSelectedLand(land || null)
                }}
              >
                <option value="">请选择土地</option>
                {userLands.map(land => (
                  <option key={land.id} value={land.id}>
                    {land.land_id} - {land.blueprint?.land_type_display || '未知类型'}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-400 mt-2">您还没有土地</p>
            )}
          </div>
          
          {/* 选择工具 */}
          <div>
            <label className="text-sm font-bold text-gray-300">选择工具</label>
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
              {tools?.filter(t => t.status === 'normal' && !t.is_in_use).map(tool => (
                <label key={tool.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTools.includes(tool.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTools([...selectedTools, tool.id])
                      } else {
                        setSelectedTools(selectedTools.filter(id => id !== tool.id))
                      }
                    }}
                  />
                  <span className="text-sm">
                    {tool.tool_id} - {tool.tool_type_display} (耐久: {tool.durability || tool.current_durability})
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          {/* 按钮 */}
          <div className="flex gap-3">
            <PixelButton
              className="flex-1"
              onClick={handleStartSelfMining}
              disabled={!selectedLand || selectedTools.length === 0 || startMiningLoading}
            >
              {startMiningLoading ? '开始中...' : '开始挖矿'}
            </PixelButton>
            <PixelButton
              variant="secondary"
              onClick={() => setShowStartMiningModal(false)}
            >
              取消
            </PixelButton>
          </div>
        </div>
      </PixelModal>
      
      {/* 合成模态框 */}
      <PixelModal
        isOpen={showSynthesisModal}
        onClose={() => setShowSynthesisModal(false)}
        title={`合成${synthesisType === 'pickaxe' ? '镐头' : synthesisType === 'axe' ? '斧头' : '锄头'}`}
        size="small"
      >
        <div className="space-y-4">
          {/* 合成配方 */}
          <div className="p-3 bg-gray-800 rounded">
            <p className="text-sm font-bold mb-2">所需材料：</p>
            <div className="text-sm text-gray-400 space-y-1">
              {synthesisType === 'pickaxe' && (
                <>
                  <p>铁矿: 70%</p>
                  <p>木头: 30%</p>
                  <p>YLD: 0.08</p>
                </>
              )}
              {synthesisType === 'axe' && (
                <>
                  <p>铁矿: 60%</p>
                  <p>木头: 40%</p>
                  <p>YLD: 0.08</p>
                </>
              )}
              {synthesisType === 'hoe' && (
                <>
                  <p>铁矿: 50%</p>
                  <p>木头: 50%</p>
                  <p>YLD: 0.08</p>
                </>
              )}
            </div>
          </div>
          
          {/* 数量选择 */}
          <div>
            <label className="text-sm font-bold text-gray-300">合成数量</label>
            <input
              type="number"
              min="1"
              max="10"
              value={synthesisQuantity}
              onChange={(e) => setSynthesisQuantity(parseInt(e.target.value) || 1)}
              className="w-full mt-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-center"
            />
          </div>
          
          {/* 按钮 */}
          <div className="flex gap-3">
            <PixelButton
              className="flex-1"
              onClick={handleSynthesize}
              disabled={synthesizeLoading}
            >
              {synthesizeLoading ? '合成中...' : '确认合成'}
            </PixelButton>
            <PixelButton
              variant="secondary"
              onClick={() => setShowSynthesisModal(false)}
            >
              取消
            </PixelButton>
          </div>
        </div>
      </PixelModal>
    </div>
  )
}
