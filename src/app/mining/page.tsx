// src/app/mining/page.tsx
// 挖矿中心页面 - 生产系统集成版
// 
// 文件说明：
// 1. 本文件是挖矿中心的主页面组件
// 2. 集成了完整的挖矿生产系统（自主挖矿、打工、合成等）
// 3. 同时保留了 YLD 矿山展示功能
// 4. 优化了移动端响应式布局
// 5. 使用内测密码验证（888888）保护生产功能
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
// - 生产系统需要内测密码（888888）
// - 移动端自适应布局，支持触摸操作
// - 自动每5分钟刷新数据

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
import { useMyLands } from '@/hooks/useLands'
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
  useProductionStats
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
  // 标签页状态
  const [activeTab, setActiveTab] = useState<'yldMines' | 'production' | 'market' | 'hiring'>('yldMines')
  
  // 生产系统子标签
  const [productionTab, setProductionTab] = useState<'mining' | 'tools' | 'synthesis'>('mining')
  
  // YLD矿山相关
  const [selectedMineId, setSelectedMineId] = useState<number | null>(null)
  const [showYLDDetailModal, setShowYLDDetailModal] = useState(false)
  
  // 生产系统相关
  const [showBetaModal, setShowBetaModal] = useState(false)
  const [hasProductionAccess, setHasProductionAccess] = useState(false)
  const [selectedLand, setSelectedLand] = useState<Land | null>(null)
  const [selectedTools, setSelectedTools] = useState<number[]>([])
  const [showStartMiningModal, setShowStartMiningModal] = useState(false)
  const [showSynthesisModal, setShowSynthesisModal] = useState(false)
  const [synthesisType, setSynthesisType] = useState<'pickaxe' | 'axe' | 'hoe'>('pickaxe')
  const [synthesisQuantity, setSynthesisQuantity] = useState(1)
  
  // 响应式状态
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileStats, setShowMobileStats] = useState(false)
  
  // ========== 数据获取 ==========
  const shouldFetchData = !authLoading && isAuthenticated
  
  // YLD 矿山数据
  const { 
    mines: yldMines, 
    loading: yldMinesLoading, 
    error: yldMinesError, 
    stats: yldStats,
    totalCount: yldTotalCount,
    refetch: refetchYLDMines
  } = useMyYLDMines(shouldFetchData ? {
    page: 1,
    page_size: 50,
    ordering: '-created_at'
  } : null)
  
  // YLD 矿山详情
  const { 
    mine: selectedYLDMine, 
    loading: yldDetailLoading, 
    error: yldDetailError 
  } = useYLDMineDetail(shouldFetchData ? selectedMineId : null)
  
  // 用户土地数据
  const { 
    lands: userLands, 
    loading: landsLoading, 
    error: landsError,
    refetch: refetchLands
  } = useMyLands()
  
  // 生产系统数据（仅在有权限时获取）
  const shouldFetchProduction = hasProductionAccess && shouldFetchData
  
  const { sessions, loading: sessionsLoading, refetch: refetchSessions } = useMiningSessions(
    shouldFetchProduction ? 'active' : undefined
  )
  
  const { tools, loading: toolsLoading, stats: toolStats, refetch: refetchTools } = useMyTools(
    shouldFetchProduction ? { status: 'idle' } : undefined
  )
  
  const { resources, loading: resourcesLoading, refetch: refetchResources } = useMyResources()
  const { status: grainStatus } = useGrainStatus()
  const { stats: productionStats } = useProductionStats()
  
  // 生产操作 Hooks
  const { startMining, loading: startMiningLoading } = useStartSelfMining()
  const { startWithTools, startWithoutTools, loading: hiredMiningLoading } = useStartHiredMining()
  const { synthesize, loading: synthesizeLoading } = useSynthesizeTool()
  const { stopProduction } = useStopProduction()
  const { collectOutput } = useCollectOutput()
  
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
      toast.error('请先登录查看挖矿数据')
      router.push('/login?redirect=/mining')
    }
  }, [authLoading, isAuthenticated, router])
  
  // 检查生产系统内测权限
  useEffect(() => {
    if (activeTab === 'production') {
      const access = hasBetaAccess()
      setHasProductionAccess(access)
      if (!access) {
        setShowBetaModal(true)
      }
    }
  }, [activeTab])
  
  // 自动刷新数据（每5分钟）
  useEffect(() => {
    if (!shouldFetchData) return
    
    const interval = setInterval(() => {
      console.log('[MiningPage] 自动刷新数据')
      refetchYLDMines()
      refetchLands()
      if (hasProductionAccess) {
        refetchSessions()
        refetchTools()
        refetchResources()
      }
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [shouldFetchData, hasProductionAccess])
  
  // ========== 工具函数 ==========
  
  // 格式化数量
  const formatAmount = (value: string | number, decimals = 2): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return '0.00'
    return num.toFixed(decimals)
  }
  
  // 格式化日期
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '未知'
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN')
  }
  
  // ========== YLD矿山操作 ==========
  
  const handleViewYLDDetail = (mine: YLDMine) => {
    setSelectedMineId(mine.id)
    setShowYLDDetailModal(true)
  }
  
  const handleStartYLDProduction = (mineId: number) => {
    toast('YLD矿山生产功能即将开放', { icon: '🚧' })
  }
  
  const handleCollectYLDOutput = (mineId: number) => {
    toast('YLD收取功能即将开放', { icon: '🚧' })
  }
  
  // ========== 生产系统操作 ==========
  
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
  
  // ========== 渲染：加载状态 ==========
  
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
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-gray-400 mb-4">请登录后查看挖矿数据</p>
          <PixelButton onClick={() => router.push('/login?redirect=/mining')}>
            立即登录
          </PixelButton>
        </div>
      </div>
    )
  }
  
  // ========== 主渲染 ==========
  
  return (
    <div className="min-h-screen bg-gray-900">
      {/* 顶部状态栏 - 移动端优化 */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* 用户信息 */}
            <div className="flex items-center gap-2 text-center sm:text-left">
              <span className="text-sm text-gray-400">矿主：</span>
              <span className="text-sm text-gold-500 font-bold">{user?.nickname || user?.username}</span>
            </div>
            
            {/* 快速统计 - 根据当前标签显示不同内容 */}
            <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto">
              {activeTab === 'yldMines' && yldStats && (
                <>
                  <div className="text-center min-w-[80px]">
                    <div className="text-xs text-gray-400">YLD矿山</div>
                    <div className="text-sm font-bold text-gold-500">{yldTotalCount || 0}</div>
                  </div>
                  <div className="text-center min-w-[100px]">
                    <div className="text-xs text-gray-400">YLD总量</div>
                    <div className="text-sm font-bold text-purple-500">
                      {formatAmount(yldStats.total_yld_capacity || 0, 4)}
                    </div>
                  </div>
                </>
              )}
              
              {activeTab === 'production' && resources && (
                <>
                  <div className="text-center min-w-[60px]">
                    <div className="text-xs text-gray-400">木头</div>
                    <div className="text-sm font-bold text-green-400">
                      {formatAmount(resources.wood)}
                    </div>
                  </div>
                  <div className="text-center min-w-[60px]">
                    <div className="text-xs text-gray-400">铁矿</div>
                    <div className="text-sm font-bold text-gray-400">
                      {formatAmount(resources.iron)}
                    </div>
                  </div>
                  <div className="text-center min-w-[60px]">
                    <div className="text-xs text-gray-400">石头</div>
                    <div className="text-sm font-bold text-blue-400">
                      {formatAmount(resources.stone)}
                    </div>
                  </div>
                  <div className="text-center min-w-[60px]">
                    <div className="text-xs text-gray-400">粮食</div>
                    <div className="text-sm font-bold text-yellow-400">
                      {formatAmount(resources.grain)}
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
        {/* 主标签切换 - 移动端优化，支持滑动 */}
        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('yldMines')}
            className={cn(
              "px-3 sm:px-6 py-2 rounded-lg font-bold transition-all whitespace-nowrap text-sm sm:text-base",
              activeTab === 'yldMines' 
                ? "bg-purple-500 text-white shadow-lg" 
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            )}
          >
            YLD矿山
          </button>
          <button
            onClick={() => setActiveTab('production')}
            className={cn(
              "px-3 sm:px-6 py-2 rounded-lg font-bold transition-all whitespace-nowrap text-sm sm:text-base",
              activeTab === 'production' 
                ? "bg-green-500 text-white shadow-lg" 
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            )}
          >
            挖矿生产
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={cn(
              "px-3 sm:px-6 py-2 rounded-lg font-bold transition-all whitespace-nowrap text-sm sm:text-base",
              activeTab === 'market' 
                ? "bg-blue-500 text-white shadow-lg" 
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
                ? "bg-orange-500 text-white shadow-lg" 
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            )}
          >
            招聘市场
          </button>
        </div>

        {/* 内容区域 - 根据标签显示不同内容 */}
        <AnimatePresence mode="wait">
          {/* ==================== YLD矿山标签 ==================== */}
          {activeTab === 'yldMines' && (
            <motion.div
              key="yldMines"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* 移动端：可折叠的统计面板 */}
              {isMobile && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowMobileStats(!showMobileStats)}
                    className="w-full px-4 py-3 bg-purple-900/20 rounded-lg flex items-center justify-between text-white border border-purple-500/30"
                  >
                    <span className="font-bold">YLD矿山统计</span>
                    <span className="text-xl">{showMobileStats ? '📊' : '📈'}</span>
                  </button>
                  
                  {showMobileStats && yldStats && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2"
                    >
                      <PixelCard className="p-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-2 bg-gray-800 rounded">
                            <p className="text-xs text-gray-400">总矿山</p>
                            <p className="text-lg font-bold text-gold-500">{yldStats.total_mines}</p>
                          </div>
                          <div className="text-center p-2 bg-gray-800 rounded">
                            <p className="text-xs text-gray-400">YLD总量</p>
                            <p className="text-lg font-bold text-purple-500">
                              {formatAmount(yldStats.total_yld_capacity, 4)}
                            </p>
                          </div>
                          <div className="text-center p-2 bg-gray-800 rounded">
                            <p className="text-xs text-gray-400">累计产出</p>
                            <p className="text-lg font-bold text-green-500">
                              {formatAmount(yldStats.total_accumulated_output, 4)}
                            </p>
                          </div>
                          <div className="text-center p-2 bg-gray-800 rounded">
                            <p className="text-xs text-gray-400">生产中</p>
                            <p className="text-lg font-bold text-blue-500">{yldStats.producing_count}</p>
                          </div>
                        </div>
                      </PixelCard>
                    </motion.div>
                  )}
                </div>
              )}
              
              {/* YLD矿山列表 */}
              {yldMinesLoading ? (
                <PixelCard className="text-center py-12">
                  <div className="animate-spin text-6xl mb-4">⏳</div>
                  <p className="text-gray-400">加载YLD矿山数据...</p>
                </PixelCard>
              ) : yldMinesError ? (
                <PixelCard className="text-center py-12">
                  <span className="text-6xl block mb-4">❌</span>
                  <p className="text-red-400 mb-4">{yldMinesError}</p>
                  <PixelButton onClick={refetchYLDMines}>重新加载</PixelButton>
                </PixelCard>
              ) : yldMines && yldMines.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {yldMines.map((mine) => (
                    <PixelCard 
                      key={mine.id} 
                      className="cursor-pointer hover:border-purple-500 transition-all"
                      onClick={() => handleViewYLDDetail(mine)}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-lg text-purple-500">
                              {mine.land_id}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {mine.region_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs font-bold",
                              mine.is_producing 
                                ? "bg-green-500/20 text-green-400"
                                : "bg-gray-700 text-gray-400"
                            )}>
                              {mine.is_producing ? '生产中' : '闲置'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-400 text-xs">YLD数量</p>
                            <p className="font-bold text-purple-400">
                              {formatAmount(mine.initial_price, 4)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">累计产出</p>
                            <p className="font-bold text-green-400">
                              {formatAmount(mine.accumulated_output, 4)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex gap-2">
                          <PixelButton 
                            size="sm" 
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStartYLDProduction(mine.id)
                            }}
                            disabled
                          >
                            {mine.is_producing ? '收取' : '生产'}
                          </PixelButton>
                        </div>
                      </div>
                    </PixelCard>
                  ))}
                </div>
              ) : (
                <PixelCard className="text-center py-12">
                  <span className="text-6xl block mb-4">🏔️</span>
                  <p className="text-gray-400 mb-4">您还没有YLD矿山</p>
                  <p className="text-sm text-gray-500">YLD矿山由YLD代币转换而来</p>
                </PixelCard>
              )}
            </motion.div>
          )}

          {/* ==================== 挖矿生产标签 ==================== */}
          {activeTab === 'production' && (
            <motion.div
              key="production"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* 内测验证 */}
              {!hasProductionAccess ? (
                <>
                  <BetaPasswordModal
                    isOpen={showBetaModal}
                    onClose={() => setShowBetaModal(false)}
                    onSuccess={() => {
                      setHasProductionAccess(true)
                      setShowBetaModal(false)
                      toast.success('验证成功！欢迎进入生产系统')
                    }}
                  />
                  <PixelCard className="text-center py-12">
                    <div className="text-6xl mb-4">🔒</div>
                    <p className="text-gray-400 mb-4">生产系统需要内测权限</p>
                    <PixelButton onClick={() => setShowBetaModal(true)}>
                      输入内测密码
                    </PixelButton>
                  </PixelCard>
                </>
              ) : (
                <>
                  {/* 生产系统子标签 */}
                  <div className="flex gap-2 overflow-x-auto">
                    <button
                      onClick={() => setProductionTab('mining')}
                      className={cn(
                        "px-4 py-2 rounded font-bold transition-all text-sm",
                        productionTab === 'mining' 
                          ? "bg-green-600 text-white" 
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      )}
                    >
                      挖矿会话
                    </button>
                    <button
                      onClick={() => setProductionTab('tools')}
                      className={cn(
                        "px-4 py-2 rounded font-bold transition-all text-sm",
                        productionTab === 'tools' 
                          ? "bg-blue-600 text-white" 
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      )}
                    >
                      我的工具
                    </button>
                    <button
                      onClick={() => setProductionTab('synthesis')}
                      className={cn(
                        "px-4 py-2 rounded font-bold transition-all text-sm",
                        productionTab === 'synthesis' 
                          ? "bg-yellow-600 text-white" 
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      )}
                    >
                      合成系统
                    </button>
                  </div>
                  
                  {/* 资源显示栏 - 移动端优化 */}
                  {resources && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                      <PixelCard className="p-3 text-center">
                        <p className="text-xs text-gray-400">木头</p>
                        <p className="text-lg font-bold text-green-400">
                          {formatAmount(resources.wood)}
                        </p>
                      </PixelCard>
                      <PixelCard className="p-3 text-center">
                        <p className="text-xs text-gray-400">铁矿</p>
                        <p className="text-lg font-bold text-gray-400">
                          {formatAmount(resources.iron)}
                        </p>
                      </PixelCard>
                      <PixelCard className="p-3 text-center">
                        <p className="text-xs text-gray-400">石头</p>
                        <p className="text-lg font-bold text-blue-400">
                          {formatAmount(resources.stone)}
                        </p>
                      </PixelCard>
                      <PixelCard className="p-3 text-center">
                        <p className="text-xs text-gray-400">粮食</p>
                        <p className="text-lg font-bold text-yellow-400">
                          {formatAmount(resources.grain)}
                        </p>
                        {grainStatus && grainStatus.warning && (
                          <p className="text-xs text-red-400 mt-1">
                            剩余{grainStatus.hours_remaining.toFixed(1)}小时
                          </p>
                        )}
                      </PixelCard>
                    </div>
                  )}
                  
                  {/* 生产系统内容 */}
                  <AnimatePresence mode="wait">
                    {/* 挖矿会话 */}
                    {productionTab === 'mining' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-bold">活跃挖矿</h3>
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
                                <div className="flex flex-col sm:flex-row justify-between gap-3">
                                  <div className="flex-1">
                                    <h4 className="font-bold text-gold-500">
                                      {session.land_info.land_id}
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                      {session.land_info.land_type} · {session.land_info.region_name}
                                    </p>
                                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                                      <div>
                                        <span className="text-gray-400">产出速率:</span>
                                        <span className="text-green-400 ml-1">{session.output_rate}/h</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">累积:</span>
                                        <span className="text-yellow-400 ml-1">{session.accumulated_output}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">工具:</span>
                                        <span className="text-blue-400 ml-1">{session.tools.length}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-row sm:flex-col gap-2">
                                    <PixelButton
                                      size="sm"
                                      className="flex-1"
                                      onClick={() => handleCollectSessionOutput(session.id)}
                                    >
                                      收取
                                    </PixelButton>
                                    <PixelButton
                                      size="sm"
                                      variant="secondary"
                                      className="flex-1"
                                      onClick={() => handleStopSession(session.id)}
                                    >
                                      停止
                                    </PixelButton>
                                  </div>
                                </div>
                              </PixelCard>
                            ))}
                          </div>
                        ) : (
                          <PixelCard className="text-center py-8">
                            <p className="text-gray-400">暂无活跃的挖矿会话</p>
                            <p className="text-sm text-gray-500 mt-2">点击"开始挖矿"创建新会话</p>
                          </PixelCard>
                        )}
                      </motion.div>
                    )}
                    
                    {/* 我的工具 */}
                    {productionTab === 'tools' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-bold">工具列表</h3>
                          {toolStats && (
                            <div className="text-sm text-gray-400">
                              总计: {toolStats.total_tools}
                            </div>
                          )}
                        </div>
                        
                        {toolsLoading ? (
                          <PixelCard className="text-center py-8">
                            <div className="animate-spin text-4xl">⏳</div>
                            <p className="text-gray-400 mt-2">加载中...</p>
                          </PixelCard>
                        ) : tools && tools.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {tools.map((tool) => (
                              <PixelCard key={tool.id} className="p-3">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-bold text-sm">{tool.tool_id}</p>
                                    <p className="text-xs text-gray-400">{tool.tool_type_display}</p>
                                    <div className="mt-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">耐久:</span>
                                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                          <div
                                            className={cn(
                                              "h-full rounded-full transition-all",
                                              tool.durability > 750 ? "bg-green-500" :
                                              tool.durability > 300 ? "bg-yellow-500" : "bg-red-500"
                                            )}
                                            style={{ width: `${(tool.durability / tool.max_durability) * 100}%` }}
                                          />
                                        </div>
                                        <span className="text-xs">{tool.durability}</span>
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
                      </motion.div>
                    )}
                    
                    {/* 合成系统 */}
                    {productionTab === 'synthesis' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-bold">合成工具</h3>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                          <PixelCard 
                            className="p-4 text-center cursor-pointer hover:border-gold-500 transition-all"
                            onClick={() => {
                              setSynthesisType('pickaxe')
                              setShowSynthesisModal(true)
                            }}
                          >
                            <div className="text-3xl sm:text-4xl mb-2">⛏️</div>
                            <p className="font-bold text-sm">镐头</p>
                            <p className="text-xs text-gray-400 mt-1">铁70%+木30%</p>
                          </PixelCard>
                          
                          <PixelCard 
                            className="p-4 text-center cursor-pointer hover:border-gold-500 transition-all"
                            onClick={() => {
                              setSynthesisType('axe')
                              setShowSynthesisModal(true)
                            }}
                          >
                            <div className="text-3xl sm:text-4xl mb-2">🪓</div>
                            <p className="font-bold text-sm">斧头</p>
                            <p className="text-xs text-gray-400 mt-1">铁60%+木40%</p>
                          </PixelCard>
                          
                          <PixelCard 
                            className="p-4 text-center cursor-pointer hover:border-gold-500 transition-all"
                            onClick={() => {
                              setSynthesisType('hoe')
                              setShowSynthesisModal(true)
                            }}
                          >
                            <div className="text-3xl sm:text-4xl mb-2">🔨</div>
                            <p className="font-bold text-sm">锄头</p>
                            <p className="text-xs text-gray-400 mt-1">铁50%+木50%</p>
                          </PixelCard>
                          
                          <PixelCard 
                            className="p-4 text-center cursor-pointer hover:border-gray-600 transition-all opacity-50"
                            onClick={() => toast('砖头合成即将开放', { icon: '🚧' })}
                          >
                            <div className="text-3xl sm:text-4xl mb-2">🧱</div>
                            <p className="font-bold text-sm">砖头</p>
                            <p className="text-xs text-gray-400 mt-1">石80%+木20%</p>
                          </PixelCard>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          )}

          {/* ==================== 矿山市场标签 ==================== */}
          {activeTab === 'market' && (
            <motion.div
              key="market"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PixelCard className="text-center py-12">
                <span className="text-6xl block mb-4">🗺️</span>
                <p className="text-gray-400 mb-2">矿山市场即将开放</p>
                <p className="text-sm text-gray-500">届时您可以在这里交易矿山NFT</p>
              </PixelCard>
            </motion.div>
          )}

          {/* ==================== 招聘市场标签 ==================== */}
          {activeTab === 'hiring' && (
            <motion.div
              key="hiring"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PixelCard className="text-center py-12">
                <span className="text-6xl block mb-4">👷</span>
                <p className="text-gray-400 mb-2">招聘市场即将开放</p>
                <p className="text-sm text-gray-500">届时您可以雇佣矿工或成为矿工赚取收益</p>
              </PixelCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 底部提示 - 移动端优化 */}
        <div className="mt-6 sm:mt-8">
          <PixelCard className="p-4 sm:p-6 bg-gold-500/10 border-gold-500/30">
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <h3 className="font-bold text-gold-400 mb-2 text-sm sm:text-base">系统提示</h3>
                <p className="text-xs sm:text-sm text-gray-300">
                  {activeTab === 'yldMines' && "YLD矿山系统正在优化中，生产和收取功能即将开放。"}
                  {activeTab === 'production' && "生产系统处于内测阶段，功能可能有所调整。记得及时收取产出！"}
                  {activeTab === 'market' && "矿山市场正在开发中，敬请期待。"}
                  {activeTab === 'hiring' && "招聘市场正在开发中，敬请期待。"}
                </p>
              </div>
            </div>
          </PixelCard>
        </div>
      </div>

      {/* ==================== 模态框 ==================== */}
      
      {/* YLD矿山详情模态框 */}
      <PixelModal
        isOpen={showYLDDetailModal}
        onClose={() => {
          setShowYLDDetailModal(false)
          setSelectedMineId(null)
        }}
        title="YLD矿山详情"
        size={isMobile ? "small" : "large"}
      >
        {yldDetailLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin text-4xl mb-2">⏳</div>
            <p className="text-gray-400">加载详情...</p>
          </div>
        ) : yldDetailError ? (
          <div className="text-center py-8">
            <span className="text-4xl block mb-2">❌</span>
            <p className="text-red-400">{yldDetailError}</p>
          </div>
        ) : selectedYLDMine ? (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold mb-3 text-gold-500">基本信息</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400">矿山编号</p>
                  <p className="font-bold">{selectedYLDMine.land_id}</p>
                </div>
                <div>
                  <p className="text-gray-400">所在区域</p>
                  <p className="font-bold">{selectedYLDMine.region_name}</p>
                </div>
                <div>
                  <p className="text-gray-400">YLD数量</p>
                  <p className="font-bold text-purple-400 text-lg">
                    {formatAmount(selectedYLDMine.initial_price, 4)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">累计产出</p>
                  <p className="font-bold text-green-400 text-lg">
                    {formatAmount(selectedYLDMine.accumulated_output, 4)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <PixelButton 
                className="flex-1"
                onClick={() => handleStartYLDProduction(selectedYLDMine.id)}
                disabled
              >
                {selectedYLDMine.is_producing ? '收取产出' : '开始生产'}（待开放）
              </PixelButton>
              <PixelButton 
                variant="secondary" 
                onClick={() => setShowYLDDetailModal(false)}
              >
                关闭
              </PixelButton>
            </div>
          </div>
        ) : null}
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
        size={isMobile ? "small" : "medium"}
      >
        <div className="space-y-4">
          {/* 选择土地 */}
          <div>
            <label className="text-sm font-bold text-gray-300">选择土地</label>
            {landsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin text-2xl">⏳</div>
              </div>
            ) : userLands && userLands.length > 0 ? (
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
                    {land.land_id} - {land.land_type_display}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-400 mt-2">您还没有土地</p>
            )}
          </div>
          
          {/* 选择工具 */}
          <div>
            <label className="text-sm font-bold text-gray-300">选择工具（可多选）</label>
            {tools && tools.filter(t => t.status === 'idle').length > 0 ? (
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {tools.filter(t => t.status === 'idle').map(tool => (
                  <label key={tool.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-800 p-2 rounded">
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
                      className="text-green-500"
                    />
                    <span className="text-sm">
                      {tool.tool_id} - {tool.tool_type_display} (耐久: {tool.durability})
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 mt-2">没有可用的工具</p>
            )}
          </div>
          
          {/* 提示信息 */}
          <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded">
            <p className="text-xs text-yellow-400">
              ⚠️ 开始挖矿需要消耗粮食（2粮食/工具/小时）
            </p>
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
