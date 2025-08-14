// src/app/mining/page.tsx
// 挖矿中心页面 - 生产版本（对接真实 YLD 矿山数据）
// 
// 文件说明：
// 1. 本文件是挖矿中心的主页面组件
// 2. 对接真实的 YLD 矿山后端 API
// 3. 展示用户的 YLD 矿山列表和详情
// 4. 支持开始生产和收取产出功能（按钮预留）
// 5. 优化了移动端响应式布局
//
// 关联文件：
// - @/hooks/useYLDMines: YLD 矿山数据 Hook
// - @/lib/api/assets: YLD 矿山 API 接口
// - @/types/assets: YLD 矿山类型定义
// - @/components/shared/PixelCard: 像素风格卡片组件
// - @/components/shared/PixelButton: 像素风格按钮组件
// - @/components/shared/PixelModal: 像素风格模态框组件
//
// 注意事项：
// - 需要用户登录才能查看数据
// - 开始生产和收取产出功能暂未开放
// - 材料和工具系统暂未开放

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useMyYLDMines, useYLDMineDetail } from '@/hooks/useYLDMines'
import type { YLDMine, YLDMineDetail } from '@/types/assets'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

// ==================== 主组件 ====================
export default function MiningPage() {
  // ========== 状态管理 ==========
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'myMines' | 'market' | 'hiring'>('myMines')
  const [selectedMineId, setSelectedMineId] = useState<number | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobilePanel, setShowMobilePanel] = useState(false)
  
  // 获取 YLD 矿山数据
  const { 
    mines, 
    loading: minesLoading, 
    error: minesError, 
    stats,
    totalCount,
    refetch: refetchMines
  } = useMyYLDMines({
    page: 1,
    page_size: 50, // 获取更多数据
    ordering: '-created_at'
  })
  
  // 获取选中矿山的详情
  const { 
    mine: selectedMine, 
    loading: detailLoading, 
    error: detailError 
  } = useYLDMineDetail(selectedMineId)
  
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
    if (!isAuthenticated) {
      toast.error('请先登录查看矿山数据')
      router.push('/login?redirect=/mining')
    }
  }, [isAuthenticated, router])
  
  // ========== 功能函数 ==========
  
  // 格式化 YLD 数量
  const formatYLD = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return '0.00'
    return num.toFixed(4)
  }
  
  // 格式化日期
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '未知'
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN')
  }
  
  // 查看矿山详情
  const handleViewDetail = (mine: YLDMine) => {
    setSelectedMineId(mine.id)
    setShowDetailModal(true)
  }
  
  // 开始生产（功能待开放）
  const handleStartProduction = (mineId: number) => {
    toast('生产功能即将开放', { icon: '🚧' })
  }
  
  // 收取产出（功能待开放）
  const handleCollectOutput = (mineId: number) => {
    toast('收取功能即将开放', { icon: '🚧' })
  }
  
  // ========== 渲染 ==========
  
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
                <div className="text-sm font-bold text-gold-500">{totalCount || 0}</div>
              </div>
              {stats && (
                <>
                  <div className="text-center min-w-[100px]">
                    <div className="text-xs text-gray-400">YLD 总量</div>
                    <div className="text-sm font-bold text-purple-500">
                      {formatYLD(stats.total_yld_capacity || 0)}
                    </div>
                  </div>
                  <div className="text-center min-w-[80px]">
                    <div className="text-xs text-gray-400">生产中</div>
                    <div className="text-sm font-bold text-green-500">
                      {stats.producing_count || 0}
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
        {/* 标签切换 */}
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

        {/* 移动端：材料面板按钮 */}
        {isMobile && (
          <div className="mb-4">
            <button
              onClick={() => setShowMobilePanel(!showMobilePanel)}
              className="w-full px-4 py-3 bg-gray-800 rounded-lg flex items-center justify-between text-white"
            >
              <span className="font-bold">统计信息</span>
              <span className="text-xl">{showMobilePanel ? '📊' : '📈'}</span>
            </button>
          </div>
        )}

        {/* 移动端：可折叠的统计面板 */}
        {isMobile && showMobilePanel && stats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <PixelCard className="p-4">
              <h3 className="font-bold text-sm mb-3">矿山统计</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-gray-800 rounded">
                  <p className="text-xs text-gray-400">总矿山</p>
                  <p className="text-lg font-bold text-gold-500">{stats.total_mines}</p>
                </div>
                <div className="text-center p-2 bg-gray-800 rounded">
                  <p className="text-xs text-gray-400">YLD 总量</p>
                  <p className="text-lg font-bold text-purple-500">
                    {formatYLD(stats.total_yld_capacity)}
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-800 rounded">
                  <p className="text-xs text-gray-400">累计产出</p>
                  <p className="text-lg font-bold text-green-500">
                    {formatYLD(stats.total_accumulated_output)}
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-800 rounded">
                  <p className="text-xs text-gray-400">生产中</p>
                  <p className="text-lg font-bold text-blue-500">{stats.producing_count}</p>
                </div>
              </div>
              
              {/* 批次统计 */}
              {stats.by_batch && stats.by_batch.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-gray-400 mb-2">批次分布</h4>
                  <div className="space-y-1">
                    {stats.by_batch.slice(0, 3).map((batch) => (
                      <div key={batch.batch_id} className="flex justify-between text-xs">
                        <span className="text-gray-400">{batch.batch_id}</span>
                        <span className="text-gold-500">{batch.count} 个</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </PixelCard>
          </motion.div>
        )}

        {/* 内容区域 - 响应式网格 */}
        <div className={cn(
          "grid gap-4 sm:gap-6",
          !isMobile && "lg:grid-cols-12"
        )}>
          {/* 左侧 - 统计信息（桌面端显示） */}
          {!isMobile && (
            <div className="lg:col-span-4 space-y-6">
              {/* 矿山统计 */}
              <PixelCard>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">矿山统计</h3>
                  <PixelButton 
                    size="xs" 
                    onClick={refetchMines}
                  >
                    刷新
                  </PixelButton>
                </div>
                
                {stats ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-gray-800 rounded">
                        <p className="text-xs text-gray-400">总矿山</p>
                        <p className="text-xl font-bold text-gold-500">{stats.total_mines}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-800 rounded">
                        <p className="text-xs text-gray-400">YLD 总量</p>
                        <p className="text-xl font-bold text-purple-500">
                          {formatYLD(stats.total_yld_capacity)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-gray-800 rounded">
                        <p className="text-xs text-gray-400">累计产出</p>
                        <p className="text-xl font-bold text-green-500">
                          {formatYLD(stats.total_accumulated_output)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-gray-800 rounded">
                        <p className="text-xs text-gray-400">生产中</p>
                        <p className="text-xl font-bold text-blue-500">{stats.producing_count}</p>
                      </div>
                    </div>
                    
                    {/* 批次统计 */}
                    {stats.by_batch && stats.by_batch.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-400 mb-2">批次分布</h4>
                        <div className="space-y-2">
                          {stats.by_batch.map((batch) => (
                            <div key={batch.batch_id} className="flex justify-between text-sm">
                              <span className="text-gray-400">{batch.batch_id}</span>
                              <div className="text-right">
                                <span className="text-gold-500 mr-2">{batch.count} 个</span>
                                <span className="text-purple-400">{formatYLD(batch.total_yld)} YLD</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">暂无统计数据</p>
                  </div>
                )}
              </PixelCard>

              {/* 操作说明 */}
              <PixelCard className="p-4 bg-blue-900/20">
                <h3 className="font-bold mb-2 text-blue-400">操作说明</h3>
                <div className="space-y-2 text-xs text-gray-400">
                  <p>• YLD 矿山由 YLD 代币转换而来</p>
                  <p>• 每个矿山可产出 YLD 代币</p>
                  <p>• 点击矿山卡片查看详情</p>
                  <p>• 生产功能即将开放</p>
                </div>
              </PixelCard>
            </div>
          )}

          {/* 右侧 - 矿山列表（移动端全宽） */}
          <div className={cn(
            !isMobile && "lg:col-span-8"
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
                  {minesLoading ? (
                    <PixelCard className="text-center py-12">
                      <div className="animate-spin text-6xl mb-4">⏳</div>
                      <p className="text-gray-400">加载矿山数据...</p>
                    </PixelCard>
                  ) : minesError ? (
                    <PixelCard className="text-center py-12">
                      <span className="text-6xl block mb-4">❌</span>
                      <p className="text-red-400 mb-4">{minesError}</p>
                      <PixelButton onClick={refetchMines}>
                        重新加载
                      </PixelButton>
                    </PixelCard>
                  ) : mines && mines.length > 0 ? (
                    <div className="grid gap-4">
                      {mines.map((mine) => (
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
                                    handleCollectOutput(mine.id)
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
                    </PixelCard>
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
                  YLD 矿山系统正在优化中，生产和收取功能即将开放。
                  请耐心等待系统升级完成。
                </p>
              </div>
            </div>
          </PixelCard>
        </div>
      </div>

      {/* ==================== 矿山详情模态框 ==================== */}
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
            
            {/* 生产信息 */}
            {selectedMine.is_producing && selectedMine.production_started_at && (
              <div className="bg-green-900/20 rounded-lg p-4">
                <h3 className="font-bold mb-3 text-green-400">生产信息</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">开始时间</span>
                    <span>{new Date(selectedMine.production_started_at).toLocaleString('zh-CN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">已生产时间</span>
                    <span>计算中...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">待收取产出</span>
                    <span className="text-green-400 font-bold">计算中...</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* 操作按钮 */}
            <div className="flex gap-3 pt-4">
              {selectedMine.is_producing ? (
                <PixelButton 
                  className="flex-1"
                  onClick={() => handleCollectOutput(selectedMine.id)}
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
    </div>
  )
}
