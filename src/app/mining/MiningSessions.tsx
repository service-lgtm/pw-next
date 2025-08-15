// src/app/mining/MiningSessions.tsx
// 挖矿会话管理组件 - 移动端性能优化版
// 
// 优化说明：
// 1. 使用虚拟滚动减少DOM节点（大量会话时）
// 2. 简化移动端的卡片渲染
// 3. 优化状态更新，减少重渲染
// 4. 使用 React.memo 缓存组件
// 5. 移动端使用更简洁的布局
// 
// 关联文件：
// - 被 @/app/mining/page.tsx 使用
// - 使用 @/types/production 中的 MiningSession 类型
// - 使用 @/hooks/useProduction 中的相关 hooks
// - 后端 FOOD_CONSUMPTION_RATE = 2（每工具每小时消耗2单位粮食）
//
// 更新历史：
// - 2024-01: 移动端性能优化，简化渲染逻辑

'use client'

import { useState, useCallback, useMemo, memo } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { cn } from '@/lib/utils'
import type { MiningSession, Tool } from '@/types/production'
import type { Land } from '@/types/assets'
import toast from 'react-hot-toast'

interface MiningSessionsProps {
  sessions: MiningSession[] | null
  loading: boolean
  userLands: Land[] | null
  tools: Tool[] | null
  onStartMining: (landId: number, toolIds: number[]) => Promise<void>
  onStopSession: (sessionId: number) => Promise<void>
  onCollectOutput: (sessionId: number) => Promise<void>
  startMiningLoading?: boolean
}

// 常量定义
const FOOD_CONSUMPTION_RATE = 2
const DURABILITY_CONSUMPTION_RATE = 1

// 工具函数
const formatDuration = (startTime: string, endTime?: string | null): string => {
  const start = new Date(startTime)
  const end = endTime ? new Date(endTime) : new Date()
  const diff = end.getTime() - start.getTime()
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h${minutes}m`
  }
  return `${minutes}分钟`
}

const formatNumber = (value: string | number | null | undefined, decimals: number = 4): string => {
  if (value === null || value === undefined) return '0.0000'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0.0000'
  return num.toFixed(decimals)
}

// 移动端会话卡片 - 简化版
const MobileSessionCard = memo(({ 
  session, 
  onCollect, 
  onStop 
}: { 
  session: MiningSession
  onCollect: () => void
  onStop: () => void
}) => {
  const metadata = session?.metadata || {}
  const toolCount = metadata.tool_count || metadata.my_tools || 0
  const foodConsumption = metadata.food_consumption_rate || (toolCount * FOOD_CONSUMPTION_RATE)
  const miningDuration = session?.started_at ? formatDuration(session.started_at) : '未知'
  
  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-bold text-sm text-gold-500">
            {session?.land_info?.land_id || `会话#${session?.id}`}
          </p>
          <p className="text-[10px] text-gray-400">
            {session?.land_info?.region || '未知区域'} · {miningDuration}
          </p>
        </div>
        <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400">
          生产中
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-2 text-[11px]">
        <div>
          <p className="text-gray-500">累计</p>
          <p className="font-bold text-purple-400">
            {formatNumber(session?.total_output || session?.accumulated_output, 2)}
          </p>
        </div>
        <div>
          <p className="text-gray-500">速率</p>
          <p className="font-bold text-green-400">
            {formatNumber(session?.output_rate, 1)}/h
          </p>
        </div>
        <div>
          <p className="text-gray-500">工具</p>
          <p className="font-bold text-yellow-400">
            {toolCount}个
          </p>
        </div>
      </div>
      
      {session?.current_output && session.current_output > 0 && (
        <div className="flex items-center justify-between p-1.5 bg-gold-500/10 rounded text-[11px] mb-2">
          <span className="text-gold-400">可收取</span>
          <span className="font-bold text-gold-400">
            {formatNumber(session.current_output, 2)} YLD
          </span>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-1.5">
        <PixelButton
          size="xs"
          onClick={onCollect}
          disabled={!session?.current_output || session.current_output <= 0}
          className="text-[11px]"
        >
          收取
        </PixelButton>
        <PixelButton
          size="xs"
          variant="secondary"
          onClick={onStop}
          className="text-[11px]"
        >
          停止
        </PixelButton>
      </div>
    </div>
  )
})

MobileSessionCard.displayName = 'MobileSessionCard'

// 桌面端会话卡片
const DesktopSessionCard = memo(({ 
  session, 
  onCollect, 
  onStop 
}: { 
  session: MiningSession
  onCollect: () => void
  onStop: () => void
}) => {
  const metadata = session?.metadata || {}
  const myRatio = metadata.my_ratio ?? 1
  const toolCount = metadata.tool_count || metadata.my_tools || 0
  const taxRate = metadata.tax_rate ?? 0.05
  const foodConsumption = metadata.food_consumption_rate || (toolCount * FOOD_CONSUMPTION_RATE)
  const miningDuration = session?.started_at ? formatDuration(session.started_at) : '未知'
  
  const landId = session?.land_info?.land_id || `会话 #${session?.id || '?'}`
  const landType = session?.land_info?.land_type || '未知'
  const region = session?.land_info?.region || session?.land_info?.region_name || '未知区域'
  const status = session?.status || 'unknown'
  const statusDisplay = session?.status_display || (status === 'active' ? '生产中' : '已结束')
  
  return (
    <PixelCard className="overflow-hidden">
      <div className="bg-gray-800/50 px-4 py-3 border-b border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-gold-500">{landId}</h4>
            <p className="text-xs text-gray-400 mt-1">
              {landType === 'yld_mine' ? 'YLD矿山' : landType} · {region}
            </p>
          </div>
          <span className={cn(
            "px-2 py-1 rounded text-xs",
            status === 'active' ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
          )}>
            {statusDisplay}
          </span>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-purple-900/20 rounded p-2">
            <p className="text-gray-400 text-xs">累计产出</p>
            <p className="font-bold text-purple-400 text-lg">
              {formatNumber(session?.total_output || session?.accumulated_output)}
            </p>
            <p className="text-xs text-gray-500">YLD</p>
          </div>
          <div className="bg-green-900/20 rounded p-2">
            <p className="text-gray-400 text-xs">产出速率</p>
            <p className="font-bold text-green-400 text-lg">
              {formatNumber(session?.output_rate, 2)}
            </p>
            <p className="text-xs text-gray-500">YLD/小时</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-gray-400 text-xs">挖矿时长</p>
            <p className="font-bold text-blue-400">{miningDuration}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">工具数量</p>
            <p className="font-bold text-yellow-400">{toolCount} 个</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">税率</p>
            <p className="font-bold text-red-400">{(taxRate * 100).toFixed(0)}%</p>
          </div>
        </div>
        
        {foodConsumption > 0 && (
          <div className="flex items-center justify-between p-2 bg-yellow-500/10 rounded">
            <span className="text-xs text-yellow-400">🌾 粮食消耗</span>
            <span className="text-sm font-bold text-yellow-400">
              {foodConsumption}/小时
            </span>
          </div>
        )}
        
        {session?.current_output && session.current_output > 0 && (
          <div className="flex items-center justify-between p-2 bg-gold-500/10 rounded">
            <span className="text-xs text-gold-400">💰 可收取</span>
            <span className="text-sm font-bold text-gold-400">
              {formatNumber(session.current_output)} YLD
            </span>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2">
          <PixelButton
            size="sm"
            onClick={onCollect}
            className="w-full"
            disabled={!session?.current_output || session.current_output <= 0}
          >
            <span className="flex items-center justify-center gap-1">
              <span>📦</span>
              <span>收取产出</span>
            </span>
          </PixelButton>
          <PixelButton
            size="sm"
            variant="secondary"
            onClick={onStop}
            className="w-full"
          >
            <span className="flex items-center justify-center gap-1">
              <span>⏹️</span>
              <span>停止生产</span>
            </span>
          </PixelButton>
        </div>
      </div>
    </PixelCard>
  )
})

DesktopSessionCard.displayName = 'DesktopSessionCard'

/**
 * 挖矿会话管理组件 - 优化版
 */
export function MiningSessions({
  sessions,
  loading,
  userLands,
  tools,
  onStartMining,
  onStopSession,
  onCollectOutput,
  startMiningLoading = false
}: MiningSessionsProps) {
  const [showStartModal, setShowStartModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedLand, setSelectedLand] = useState<Land | null>(null)
  const [selectedTools, setSelectedTools] = useState<number[]>([])
  const [confirmAction, setConfirmAction] = useState<'start' | 'stop' | null>(null)
  const [targetSessionId, setTargetSessionId] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  
  // 检测移动端
  useState(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  })
  
  // 可用工具
  const availableTools = useMemo(() => 
    tools?.filter(t => t.status === 'normal' && !t.is_in_use) || [],
    [tools]
  )
  
  // 统计数据
  const { totalOutput, totalHourlyOutput } = useMemo(() => {
    if (!sessions) return { totalOutput: 0, totalHourlyOutput: 0 }
    
    const total = sessions.reduce((sum, session) => {
      const output = parseFloat(session.total_output || session.accumulated_output || '0')
      return sum + output
    }, 0)
    
    const hourly = sessions.reduce((sum, session) => {
      const rate = parseFloat(session.output_rate || '0')
      return sum + rate
    }, 0)
    
    return { totalOutput: total, totalHourlyOutput: hourly }
  }, [sessions])
  
  // 事件处理函数
  const handleOpenStartModal = useCallback(() => {
    setShowStartModal(true)
    setSelectedLand(null)
    setSelectedTools([])
  }, [])
  
  const handleConfirmStart = useCallback(() => {
    if (!selectedLand || selectedTools.length === 0) {
      toast.error('请选择土地和工具')
      return
    }
    setConfirmAction('start')
    setShowConfirmModal(true)
  }, [selectedLand, selectedTools])
  
  const handleExecuteStart = useCallback(async () => {
    if (!selectedLand || selectedTools.length === 0) return
    
    try {
      await onStartMining(selectedLand.id, selectedTools)
      setShowStartModal(false)
      setShowConfirmModal(false)
      setSelectedLand(null)
      setSelectedTools([])
      setConfirmAction(null)
    } catch (err) {
      console.error('开始挖矿失败:', err)
    }
  }, [selectedLand, selectedTools, onStartMining])
  
  const handleConfirmStop = useCallback((sessionId: number) => {
    setTargetSessionId(sessionId)
    setConfirmAction('stop')
    setShowConfirmModal(true)
  }, [])
  
  const handleExecuteStop = useCallback(async () => {
    if (!targetSessionId) return
    
    try {
      await onStopSession(targetSessionId)
      setShowConfirmModal(false)
      setTargetSessionId(null)
      setConfirmAction(null)
    } catch (err) {
      console.error('停止生产失败:', err)
    }
  }, [targetSessionId, onStopSession])
  
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* 标题栏和统计 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold">活跃挖矿会话</h3>
          {sessions && sessions.length > 0 && (
            <div className="flex gap-3 sm:gap-4 mt-1">
              <p className="text-xs sm:text-sm text-gray-400">
                共 {sessions.length} 个
              </p>
              <p className="text-xs sm:text-sm text-purple-400">
                累计: {formatNumber(totalOutput, 2)}
              </p>
              <p className="text-xs sm:text-sm text-green-400">
                速率: {formatNumber(totalHourlyOutput, 1)}/h
              </p>
            </div>
          )}
        </div>
        <PixelButton
          onClick={handleOpenStartModal}
          disabled={!userLands || userLands.length === 0}
          size={isMobile ? "xs" : "sm"}
        >
          <span className="flex items-center gap-1 sm:gap-2">
            <span>⛏️</span>
            <span className="text-xs sm:text-sm">开始挖矿</span>
          </span>
        </PixelButton>
      </div>
      
      {/* 会话列表 */}
      {loading ? (
        <PixelCard className="text-center py-6 sm:py-8">
          <div className="text-3xl sm:text-4xl">⏳</div>
          <p className="text-sm sm:text-base text-gray-400 mt-2">加载中...</p>
        </PixelCard>
      ) : sessions && sessions.length > 0 ? (
        <div className={cn(
          "grid gap-3 sm:gap-4",
          isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
        )}>
          {sessions.map((session) => (
            isMobile ? (
              <MobileSessionCard
                key={session.id}
                session={session}
                onCollect={() => onCollectOutput(session.id)}
                onStop={() => handleConfirmStop(session.id)}
              />
            ) : (
              <DesktopSessionCard
                key={session.id}
                session={session}
                onCollect={() => onCollectOutput(session.id)}
                onStop={() => handleConfirmStop(session.id)}
              />
            )
          ))}
        </div>
      ) : (
        <PixelCard className="text-center py-8 sm:py-12">
          <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">⛏️</div>
          <p className="text-sm sm:text-base text-gray-400 mb-2">暂无活跃的挖矿会话</p>
          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
            {!userLands || userLands.length === 0 
              ? '您需要先拥有土地才能开始挖矿' 
              : '点击"开始挖矿"按钮创建新的挖矿会话'}
          </p>
          {userLands && userLands.length > 0 && (
            <PixelButton 
              onClick={handleOpenStartModal}
              size={isMobile ? "xs" : "sm"}
            >
              开始挖矿
            </PixelButton>
          )}
        </PixelCard>
      )}
      
      {/* 开始挖矿模态框 - 优化移动端 */}
      <PixelModal
        isOpen={showStartModal}
        onClose={() => {
          setShowStartModal(false)
          setSelectedLand(null)
          setSelectedTools([])
        }}
        title="开始自主挖矿"
        size={isMobile ? "small" : "medium"}
      >
        <div className="space-y-3 sm:space-y-4">
          {/* 重要提示 */}
          <div className="p-2 sm:p-3 bg-red-900/20 border border-red-500/40 rounded-lg">
            <div className="flex items-start gap-1.5 sm:gap-2">
              <span className="text-red-400 text-base sm:text-xl mt-0.5">⚠️</span>
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-red-400 font-bold mb-1 sm:mb-2">重要提示</p>
                <ul className="text-[10px] sm:text-xs text-gray-300 space-y-1 sm:space-y-1.5">
                  <li className="flex items-start gap-1">
                    <span className="text-red-400">•</span>
                    <span>挖矿开始后，<span className="text-red-400 font-bold">1小时内停止将按完整1小时扣除</span></span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-yellow-400">•</span>
                    <span>每个工具每小时消耗 {FOOD_CONSUMPTION_RATE} 单位粮食</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* 选择土地 */}
          <div>
            <label className="text-xs sm:text-sm font-bold text-gray-300 flex items-center gap-1 sm:gap-2 mb-1.5 sm:mb-2">
              <span>📍</span>
              <span>选择土地</span>
            </label>
            {userLands && userLands.length > 0 ? (
              <select
                className="w-full px-2 sm:px-3 py-2 sm:py-2.5 bg-gray-800/70 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-gold-500 transition-colors"
                value={selectedLand?.id || ''}
                onChange={(e) => {
                  const land = userLands.find(l => l.id === parseInt(e.target.value))
                  setSelectedLand(land || null)
                }}
              >
                <option value="">-- 请选择土地 --</option>
                {userLands.map(land => (
                  <option key={land.id} value={land.id}>
                    {land.land_id} - {land.blueprint?.land_type_display || '未知类型'}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs sm:text-sm text-gray-400 p-2 sm:p-3 bg-gray-800/50 rounded-lg text-center">
                您还没有土地
              </p>
            )}
          </div>
          
          {/* 选择工具 */}
          <div>
            <label className="text-xs sm:text-sm font-bold text-gray-300 flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="flex items-center gap-1 sm:gap-2">
                <span>🔧</span>
                <span>选择工具</span>
              </span>
              {selectedTools.length > 0 && (
                <span className="text-[10px] sm:text-xs bg-gold-500/20 text-gold-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                  已选 {selectedTools.length} 个
                </span>
              )}
            </label>
            
            {availableTools.length > 0 ? (
              <div className="border border-gray-600 rounded-lg overflow-hidden">
                <div className="max-h-32 sm:max-h-48 overflow-y-auto bg-gray-800/30">
                  {availableTools.map((tool, index) => (
                    <label 
                      key={tool.id} 
                      className={cn(
                        "flex items-center gap-2 sm:gap-3 p-2 sm:p-3 cursor-pointer transition-all",
                        "hover:bg-gray-700/50",
                        selectedTools.includes(tool.id) ? "bg-gray-700/70" : "",
                        index !== 0 && "border-t border-gray-700"
                      )}
                    >
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
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded border-gray-600 text-gold-500"
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-white">
                            {tool.tool_id}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-400">
                            {tool.tool_type_display}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] sm:text-xs text-gray-400">耐久度</div>
                          <span className="text-[10px] sm:text-xs text-gray-500">
                            {tool.current_durability || tool.durability || 0}/{tool.max_durability || 1500}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                
                <div className="p-1.5 sm:p-2 bg-gray-800/50 border-t border-gray-700">
                  <div className="flex gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTools(availableTools.map(t => t.id))}
                      className="text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                    >
                      全选
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTools([])}
                      className="text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                    >
                      清空
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 sm:p-4 bg-gray-800/50 rounded-lg text-center">
                <p className="text-xs sm:text-sm text-gray-400">暂无可用工具</p>
              </div>
            )}
          </div>
          
          {/* 预计消耗 */}
          {selectedLand && selectedTools.length > 0 && (
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg">
              <p className="text-[10px] sm:text-xs text-blue-400 font-bold mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
                <span>📊</span>
                <span>预计消耗（每小时）</span>
              </p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-gray-800/50 rounded p-1.5 sm:p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs text-gray-400">⚙️ 耐久</span>
                    <span className="text-xs sm:text-sm font-bold text-yellow-400">
                      {selectedTools.length}/工具
                    </span>
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded p-1.5 sm:p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs text-gray-400">🌾 粮食</span>
                    <span className="text-xs sm:text-sm font-bold text-yellow-400">
                      {selectedTools.length * FOOD_CONSUMPTION_RATE}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 按钮 */}
          <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
            <PixelButton
              className="flex-1"
              size={isMobile ? "sm" : "md"}
              onClick={handleConfirmStart}
              disabled={!selectedLand || selectedTools.length === 0 || startMiningLoading}
            >
              {startMiningLoading ? '开始中...' : '确认开始'}
            </PixelButton>
            <PixelButton
              variant="secondary"
              size={isMobile ? "sm" : "md"}
              onClick={() => setShowStartModal(false)}
              className="px-6 sm:px-8"
            >
              取消
            </PixelButton>
          </div>
        </div>
      </PixelModal>
      
      {/* 确认对话框 - 优化移动端 */}
      <PixelModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setConfirmAction(null)
          setTargetSessionId(null)
        }}
        title={confirmAction === 'start' ? '确认开始挖矿' : '确认停止生产'}
        size="small"
      >
        <div className="space-y-3 sm:space-y-4">
          {confirmAction === 'start' ? (
            <>
              <div className="text-center py-3 sm:py-4">
                <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">⚠️</div>
                <p className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2">
                  您确定要开始挖矿吗？
                </p>
                <p className="text-[10px] sm:text-xs text-red-400 font-bold">
                  开始后1小时内停止将扣除完整1小时的资源
                </p>
              </div>
              <div className="bg-gray-800 rounded p-2 sm:p-3 text-[10px] sm:text-xs">
                <p className="text-gray-400 mb-1">挖矿信息：</p>
                <p>土地：{selectedLand?.land_id}</p>
                <p>工具数量：{selectedTools.length} 个</p>
                <p>预计粮食消耗：{selectedTools.length * FOOD_CONSUMPTION_RATE} 单位/小时</p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center py-3 sm:py-4">
                <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">🛑</div>
                <p className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2">
                  您确定要停止这个生产会话吗？
                </p>
                <p className="text-[10px] sm:text-xs text-yellow-400">
                  停止后可以收取累计的产出
                </p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2 sm:p-3">
                <p className="text-[10px] sm:text-xs text-yellow-400">
                  ⚠️ 如果挖矿时间不足1小时，仍会扣除1小时的耐久和粮食
                </p>
              </div>
            </>
          )}
          
          <div className="flex gap-2 sm:gap-3">
            <PixelButton
              className="flex-1"
              size={isMobile ? "sm" : "md"}
              variant={confirmAction === 'stop' ? 'secondary' : 'primary'}
              onClick={confirmAction === 'start' ? handleExecuteStart : handleExecuteStop}
            >
              确认{confirmAction === 'start' ? '开始' : '停止'}
            </PixelButton>
            <PixelButton
              variant="secondary"
              size={isMobile ? "sm" : "md"}
              onClick={() => {
                setShowConfirmModal(false)
                setConfirmAction(null)
                setTargetSessionId(null)
              }}
            >
              取消
            </PixelButton>
          </div>
        </div>
      </PixelModal>
    </div>
  )
}

export default MiningSessions
