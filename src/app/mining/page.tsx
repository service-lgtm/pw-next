// src/app/mining/page.tsx
// 挖矿中心页面 - 模块化重构版本
// 
// 文件说明：
// 1. 本文件是挖矿中心的主页面组件
// 2. 已拆分为多个子组件，提高可维护性
// 3. 集成内测密码验证功能（密码：888888）
// 4. 保留原有功能的同时优化了代码结构
// 
// 关联组件（同目录下）：
// - ./BetaPasswordModal: 内测密码验证
// - ./YLDMineList: YLD矿山列表
// - ./MiningSessions: 挖矿会话管理
// - ./ToolManagement: 工具管理
// - ./MiningStats: 统计信息

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

// 组件导入 - 从同目录导入
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { BetaPasswordModal, hasBetaAccess } from './BetaPasswordModal'
import { YLDMineList } from './YLDMineList'
import { MiningSessions } from './MiningSessions'
import { ToolManagement } from './ToolManagement'
import { MiningStats } from './MiningStats'

// Hooks 导入
import { useAuth } from '@/hooks/useAuth'
import { useMyYLDMines, useYLDMineDetail } from '@/hooks/useYLDMines'
import {
  useMiningSessions,
  useMyTools,
  useMyResources,
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

export default function MiningPage() {
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
  
  // ========== 数据获取 ==========
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
    page_size: 50,
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
  
  const { 
    sessions, 
    loading: sessionsLoading, 
    refetch: refetchSessions
  } = useMiningSessions({
    status: 'active',
    enabled: shouldFetchData  // 修改：始终获取会话数据，不依赖hasMiningAccess
  })
  
  const { 
    tools, 
    loading: toolsLoading, 
    stats: toolStats, 
    refetch: refetchTools
  } = useMyTools({
    enabled: shouldFetchData  // 修改：始终获取工具数据
  })
  
  const { 
    resources, 
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
  
  // ========== 事件处理函数 ==========
  const formatYLD = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return '0.00'
    return num.toFixed(4)
  }
  
  const formatResource = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return '0.00'
    return num.toFixed(2)
  }
  
  const handleViewDetail = (mine: YLDMine) => {
    setSelectedMineId(mine.id)
    setShowDetailModal(true)
  }
  
  const handleOpenMiningFeature = () => {
    if (!hasMiningAccess) {
      setShowBetaModal(true)
    } else {
      setMiningSubTab('sessions')
    }
  }
  
  const handleStartSelfMining = async (landId: number, toolIds: number[]) => {
    await startMining({
      land_id: landId,
      tool_ids: toolIds
    })
    refetchSessions()
    refetchTools()
  }
  
  const handleStopSession = async (sessionId: number) => {
    await stopProduction(sessionId)
    toast.success('已停止生产')
    refetchSessions()
    refetchTools()
    refetchResources()
  }
  
  const handleCollectSessionOutput = async (sessionId: number) => {
    await collectOutput(sessionId)
    toast.success('收取成功！')
    refetchSessions()
    refetchResources()
  }
  
  const handleSynthesize = async (toolType: string, quantity: number) => {
    await synthesize({
      tool_type: toolType,
      quantity: quantity
    })
    refetchTools()
    refetchResources()
  }
  
  // ========== 渲染逻辑 ==========
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
            <div className="flex items-center gap-2 text-center sm:text-left">
              <span className="text-sm text-gray-400">矿主：</span>
              <span className="text-sm text-gold-500 font-bold">
                {user?.nickname || user?.username}
              </span>
            </div>
            
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
                      {formatYLD(yldStats.total_yld_capacity)}
                    </div>
                  </div>
                  <div className="text-center min-w-[80px]">
                    <div className="text-xs text-gray-400">生产中</div>
                    <div className="text-sm font-bold text-green-500">
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
      <div className="container mx-auto px-4 py-4 sm:py-6">
        {/* 主标签切换 */}
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

        {/* 内容区域 */}
        <div className={cn(
          "grid gap-4 sm:gap-6",
          !isMobile && "lg:grid-cols-12"
        )}>
          {/* 左侧统计信息 */}
          {!isMobile && activeTab === 'myMines' && (
            <div className="lg:col-span-4 space-y-6">
              <MiningStats
                yldStats={yldStats}
                resources={resources}
                grainStatus={grainStatus}
                hasMiningAccess={hasMiningAccess}
                sessions={sessions}  // 传递挖矿会话数据
                onRefresh={refetchYLDMines}
                onOpenMining={handleOpenMiningFeature}
              />
            </div>
          )}

          {/* 右侧主内容 */}
          <div className={cn(
            !isMobile && activeTab === 'myMines' && "lg:col-span-8"
          )}>
            <AnimatePresence mode="wait">
              {/* 我的矿山内容 */}
              {activeTab === 'myMines' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* 子标签切换 - 始终显示4个标签 */}
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
                      onClick={() => {
                        if (!hasMiningAccess) {
                          sessionStorage.setItem('pendingMiningTab', 'sessions')
                          setShowBetaModal(true)
                        } else {
                          setMiningSubTab('sessions')
                        }
                      }}
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
                      onClick={() => {
                        if (!hasMiningAccess) {
                          sessionStorage.setItem('pendingMiningTab', 'tools')
                          setShowBetaModal(true)
                        } else {
                          setMiningSubTab('tools')
                        }
                      }}
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
                      onClick={() => {
                        if (!hasMiningAccess) {
                          sessionStorage.setItem('pendingMiningTab', 'synthesis')
                          setShowBetaModal(true)
                        } else {
                          setMiningSubTab('synthesis')
                        }
                      }}
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

                  {/* 资源显示栏 */}
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
                  {miningSubTab === 'overview' && (
                    <YLDMineList
                      mines={yldMines}
                      loading={yldMinesLoading}
                      error={yldMinesError}
                      onViewDetail={handleViewDetail}
                      onRefresh={refetchYLDMines}
                    />
                  )}

                  {miningSubTab === 'sessions' && hasMiningAccess && (
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
                  )}

                  {miningSubTab === 'tools' && hasMiningAccess && (
                    <ToolManagement
                      tools={tools}
                      loading={toolsLoading}
                      toolStats={toolStats}
                      resources={resources}
                      onSynthesize={handleSynthesize}
                      synthesizeLoading={synthesizeLoading}
                      showOnlyTools={true}
                    />
                  )}

                  {miningSubTab === 'synthesis' && hasMiningAccess && (
                    <ToolManagement
                      tools={tools}
                      loading={toolsLoading}
                      toolStats={toolStats}
                      resources={resources}
                      onSynthesize={handleSynthesize}
                      synthesizeLoading={synthesizeLoading}
                      showOnlySynthesis={true}
                    />
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

        {/* 底部提示 - 简化版本 */}
        <div className="mt-6 sm:mt-8">
          <PixelCard className="p-4 sm:p-6 bg-gold-500/10 border-gold-500/30">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💡</span>
              <p className="text-xs sm:text-sm text-gray-300">
                YLD 矿山系统和挖矿生产系统正在优化中，部分功能即将开放。
                挖矿功能需要内测密码验证（密码：888888）。
              </p>
            </div>
          </PixelCard>
        </div>
      </div>

      {/* 内测密码模态框 */}
      <BetaPasswordModal
        isOpen={showBetaModal}
        onClose={() => setShowBetaModal(false)}
        onSuccess={() => {
          setHasMiningAccess(true)
          setShowBetaModal(false)
          // 根据用户点击的标签切换
          const targetTab = sessionStorage.getItem('pendingMiningTab')
          if (targetTab && targetTab !== 'overview') {
            setMiningSubTab(targetTab as any)
            sessionStorage.removeItem('pendingMiningTab')
          } else {
            setMiningSubTab('sessions')
          }
          toast.success('验证成功！欢迎进入挖矿系统')
        }}
      />
      
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
                  <p className="font-bold">{selectedMine.region_name || selectedMine.region || '中国'}</p>
                </div>
                <div>
                  <p className="text-gray-400">矿山类型</p>
                  <p className="font-bold">{selectedMine.land_type_display || selectedMine.land_type || 'YLD矿山'}</p>
                </div>
                <div>
                  <p className="text-gray-400">占地面积</p>
                  <p className="font-bold">{selectedMine.size_sqm || selectedMine.size || 100} m²</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-900/20 rounded-lg p-4">
              <h3 className="font-bold mb-3 text-purple-400">YLD 信息</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400">YLD 数量</p>
                  <p className="font-bold text-purple-400 text-lg">
                    {formatYLD(selectedMine.yld_amount || selectedMine.yld_capacity || selectedMine.initial_price || 49999.5)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">累计产出</p>
                  <p className="font-bold text-green-400 text-lg">
                    {formatYLD(selectedMine.accumulated_output || selectedMine.total_output || 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <PixelButton className="flex-1" disabled>
                生产功能待开放
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
