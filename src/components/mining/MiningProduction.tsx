// src/components/mining/MiningProduction.tsx
// 挖矿生产系统组件
//
// 文件说明：
// 1. 包含自主挖矿、打工挖矿、合成系统等功能
// 2. 集成内测密码验证
// 3. 实时显示资源、工具、会话状态
//
// 关联文件：
// - src/hooks/useProduction.ts: 生产系统 Hook
// - src/lib/api/production.ts: 生产系统 API
// - src/components/mining/BetaPasswordModal.tsx: 内测密码验证

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { BetaPasswordModal, hasBetaAccess } from './BetaPasswordModal'
import { cn } from '@/lib/utils'
import {
  useMiningSessions,
  useMyTools,
  useMyResources,
  useAvailableLands,
  useStartSelfMining,
  useStartHiredMining,
  useSynthesizeTool,
  useStopProduction,
  useCollectOutput,
  useGrainStatus,
  useProductionStats
} from '@/hooks/useProduction'
import type { MiningSession, Tool } from '@/types/production'
import toast from 'react-hot-toast'

interface MiningProductionProps {
  userLands?: any[] // 用户的土地列表
}

export function MiningProduction({ userLands = [] }: MiningProductionProps) {
  // ========== 状态管理 ==========
  const [showBetaModal, setShowBetaModal] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [activeTab, setActiveTab] = useState<'mining' | 'tools' | 'synthesis'>('mining')
  const [selectedLand, setSelectedLand] = useState<any>(null)
  const [selectedTools, setSelectedTools] = useState<number[]>([])
  const [showStartMiningModal, setShowStartMiningModal] = useState(false)
  const [showSynthesisModal, setShowSynthesisModal] = useState(false)
  const [synthesisType, setSynthesisType] = useState<'pickaxe' | 'axe' | 'hoe' | 'brick'>('pickaxe')
  const [synthesisQuantity, setSynthesisQuantity] = useState(1)
  
  // ========== 数据获取 ==========
  const { sessions, loading: sessionsLoading, refetch: refetchSessions } = useMiningSessions('active')
  const { tools, loading: toolsLoading, stats: toolStats, refetch: refetchTools } = useMyTools({ status: 'idle' })
  const { resources, loading: resourcesLoading, refetch: refetchResources } = useMyResources()
  const { lands: availableLands, loading: landsLoading } = useAvailableLands('mine')
  const { status: grainStatus } = useGrainStatus()
  const { stats: productionStats } = useProductionStats()
  
  // ========== 操作 Hooks ==========
  const { startMining, loading: startMiningLoading } = useStartSelfMining()
  const { startWithTools, startWithoutTools, loading: hiredMiningLoading } = useStartHiredMining()
  const { synthesize, loading: synthesizeLoading } = useSynthesizeTool()
  const { stopProduction } = useStopProduction()
  const { collectOutput } = useCollectOutput()
  
  // ========== 副作用 ==========
  
  // 检查内测权限
  useEffect(() => {
    const access = hasBetaAccess()
    setHasAccess(access)
    if (!access) {
      setShowBetaModal(true)
    }
  }, [])
  
  // ========== 功能函数 ==========
  
  // 格式化资源数量
  const formatResource = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return '0'
    return num.toFixed(2)
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
      refetchSessions()
      refetchTools()
      refetchResources()
    } catch (err) {
      console.error('停止生产失败:', err)
    }
  }
  
  // 收取产出
  const handleCollectOutput = async (sessionId: number) => {
    try {
      await collectOutput(sessionId)
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
        tool_type: synthesisType as 'pickaxe' | 'axe' | 'hoe',
        quantity: synthesisQuantity
      })
      
      setShowSynthesisModal(false)
      setSynthesisQuantity(1)
      refetchTools()
      refetchResources()
    } catch (err) {
      console.error('合成失败:', err)
    }
  }
  
  // ========== 渲染 ==========
  
  // 如果没有权限，只显示密码验证
  if (!hasAccess) {
    return (
      <>
        <BetaPasswordModal
          isOpen={showBetaModal}
          onClose={() => setShowBetaModal(false)}
          onSuccess={() => {
            setHasAccess(true)
            setShowBetaModal(false)
          }}
        />
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-gray-400 mb-4">请先验证内测权限</p>
          <PixelButton onClick={() => setShowBetaModal(true)}>
            输入内测密码
          </PixelButton>
        </div>
      </>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* 顶部统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 资源显示 */}
        {resources && (
          <>
            <PixelCard className="p-3 text-center">
              <p className="text-xs text-gray-400">木头</p>
              <p className="text-lg font-bold text-green-400">
                {formatResource(resources.wood)}
              </p>
            </PixelCard>
            <PixelCard className="p-3 text-center">
              <p className="text-xs text-gray-400">铁矿</p>
              <p className="text-lg font-bold text-gray-400">
                {formatResource(resources.iron)}
              </p>
            </PixelCard>
            <PixelCard className="p-3 text-center">
              <p className="text-xs text-gray-400">石头</p>
              <p className="text-lg font-bold text-blue-400">
                {formatResource(resources.stone)}
              </p>
            </PixelCard>
            <PixelCard className="p-3 text-center">
              <p className="text-xs text-gray-400">粮食</p>
              <p className="text-lg font-bold text-yellow-400">
                {formatResource(resources.grain)}
              </p>
              {grainStatus && grainStatus.warning && (
                <p className="text-xs text-red-400 mt-1">
                  仅剩 {grainStatus.hours_remaining.toFixed(1)} 小时
                </p>
              )}
            </PixelCard>
          </>
        )}
      </div>
      
      {/* 标签切换 */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('mining')}
          className={cn(
            "px-4 py-2 rounded font-bold transition-all",
            activeTab === 'mining' 
              ? "bg-green-500 text-white" 
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          )}
        >
          挖矿生产
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={cn(
            "px-4 py-2 rounded font-bold transition-all",
            activeTab === 'tools' 
              ? "bg-green-500 text-white" 
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          )}
        >
          我的工具
        </button>
        <button
          onClick={() => setActiveTab('synthesis')}
          className={cn(
            "px-4 py-2 rounded font-bold transition-all",
            activeTab === 'synthesis' 
              ? "bg-green-500 text-white" 
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          )}
        >
          合成系统
        </button>
      </div>
      
      {/* 内容区域 */}
      <AnimatePresence mode="wait">
        {/* 挖矿生产 */}
        {activeTab === 'mining' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* 开始挖矿按钮 */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">活跃挖矿会话</h3>
              <PixelButton
                onClick={() => setShowStartMiningModal(true)}
                disabled={!userLands || userLands.length === 0}
              >
                开始新的挖矿
              </PixelButton>
            </div>
            
            {/* 挖矿会话列表 */}
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
                          <p>工具数量: <span className="text-blue-400">{session.tools.length}</span></p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <PixelButton
                          size="xs"
                          onClick={() => handleCollectOutput(session.id)}
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
          </motion.div>
        )}
        
        {/* 我的工具 */}
        {activeTab === 'tools' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">工具列表</h3>
              {toolStats && (
                <div className="text-sm text-gray-400">
                  总计: {toolStats.total_tools} | 
                  闲置: {toolStats.by_status.idle} | 
                  工作中: {toolStats.by_status.working}
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
          </motion.div>
        )}
        
        {/* 合成系统 */}
        {activeTab === 'synthesis' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-bold">合成工具</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* 镐头 */}
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
              
              {/* 斧头 */}
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
              
              {/* 锄头 */}
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
              
              {/* 砖头 */}
              <PixelCard className="p-4 text-center cursor-pointer hover:border-gold-500"
                onClick={() => {
                  setSynthesisType('brick')
                  toast('砖头合成即将开放', { icon: '🚧' })
                }}
              >
                <div className="text-4xl mb-2">🧱</div>
                <p className="font-bold">砖头</p>
                <p className="text-xs text-gray-400 mt-1">石80% + 木20%</p>
              </PixelCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ========== 模态框 ========== */}
      
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
            <select
              className="w-full mt-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              value={selectedLand?.id || ''}
              onChange={(e) => {
                const land = availableLands.find(l => l.id === parseInt(e.target.value))
                setSelectedLand(land)
              }}
            >
              <option value="">请选择土地</option>
              {availableLands.map(land => (
                <option key={land.id} value={land.id}>
                  {land.land_id} - {land.land_type_display}
                </option>
              ))}
            </select>
          </div>
          
          {/* 选择工具 */}
          <div>
            <label className="text-sm font-bold text-gray-300">选择工具</label>
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
              {tools.filter(t => t.status === 'idle').map(tool => (
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
                    {tool.tool_id} - {tool.tool_type_display} (耐久: {tool.durability})
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
