// src/app/mining/MiningSessions.tsx
// 挖矿会话管理组件 - 优化版
// 
// 功能说明：
// 1. 显示活跃的挖矿会话列表
// 2. 支持开始新的挖矿会话（带重要提示）
// 3. 支持停止会话和收取产出
// 4. 显示详细的挖矿数据（累计产出、挖矿时间等）
// 5. 优化的用户交互体验和提示
// 
// 关联文件：
// - 被 @/app/mining/page.tsx 使用
// - 使用 @/types/production 中的 MiningSession 类型
// - 使用 @/hooks/useProduction 中的相关 hooks
// - 后端 FOOD_CONSUMPTION_RATE = 2（每工具每小时消耗2单位粮食）
//
// 更新历史：
// - 2024-01: 添加挖矿规则提示
// - 2024-01: 优化开始挖矿的交互流程
// - 2024-01: 添加确认对话框
// - 2024-01: 修正粮食消耗为2单位/工具/小时

'use client'

import { useState } from 'react'
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

// 常量定义 - 匹配后端设置
const FOOD_CONSUMPTION_RATE = 2  // 每工具每小时消耗粮食
const DURABILITY_CONSUMPTION_RATE = 1  // 每工具每小时消耗耐久

/**
 * 格式化时间差
 */
function formatDuration(startTime: string, endTime?: string | null): string {
  const start = new Date(startTime)
  const end = endTime ? new Date(endTime) : new Date()
  const diff = end.getTime() - start.getTime()
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分钟`
}

/**
 * 格式化数字
 */
function formatNumber(value: string | number | null | undefined, decimals: number = 4): string {
  if (value === null || value === undefined) return '0.0000'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0.0000'
  return num.toFixed(decimals)
}

/**
 * 挖矿会话管理组件
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
  
  // 可用工具（正常状态且未使用）
  const availableTools = tools?.filter(t => t.status === 'normal' && !t.is_in_use) || []
  
  // 计算总累计产出
  const totalOutput = sessions?.reduce((sum, session) => {
    const output = parseFloat(session.total_output || session.accumulated_output || '0')
    return sum + output
  }, 0) || 0
  
  // 计算总小时产出
  const totalHourlyOutput = sessions?.reduce((sum, session) => {
    const rate = parseFloat(session.output_rate || '0')
    return sum + rate
  }, 0) || 0
  
  // 打开开始挖矿模态框
  const handleOpenStartModal = () => {
    setShowStartModal(true)
    setSelectedLand(null)
    setSelectedTools([])
  }
  
  // 确认开始挖矿
  const handleConfirmStart = () => {
    if (!selectedLand || selectedTools.length === 0) {
      toast.error('请选择土地和工具')
      return
    }
    
    setConfirmAction('start')
    setShowConfirmModal(true)
  }
  
  // 执行开始挖矿
  const handleExecuteStart = async () => {
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
  }
  
  // 确认停止会话
  const handleConfirmStop = (sessionId: number) => {
    setTargetSessionId(sessionId)
    setConfirmAction('stop')
    setShowConfirmModal(true)
  }
  
  // 执行停止会话
  const handleExecuteStop = async () => {
    if (!targetSessionId) return
    
    try {
      await onStopSession(targetSessionId)
      setShowConfirmModal(false)
      setTargetSessionId(null)
      setConfirmAction(null)
    } catch (err) {
      console.error('停止生产失败:', err)
    }
  }
  
  // 会话卡片组件
  const SessionCard = ({ session }: { session: MiningSession }) => {
    // 安全地获取metadata
    const metadata = session?.metadata || {}
    const myRatio = metadata.my_ratio ?? 1
    const toolCount = metadata.tool_count || metadata.my_tools || 0
    const taxRate = metadata.tax_rate ?? 0.05
    
    // 粮食消耗率 - 使用常量计算或从后端获取
    const foodConsumption = metadata.food_consumption_rate || 
                            metadata.grain_consumption_rate || 
                            session?.grain_consumption_rate || 
                            (toolCount * FOOD_CONSUMPTION_RATE)
    
    // 安全地计算挖矿时长
    const miningDuration = session?.started_at ? formatDuration(session.started_at) : '未知'
    
    // 获取最近一次结算信息
    const lastSettlement = metadata.last_settlement || null
    
    // 安全地获取会话信息
    const sessionId = session?.session_id || session?.id || '未知'
    const landId = session?.land_info?.land_id || `会话 #${session?.id || '?'}`
    const landType = session?.land_info?.land_type || '未知'
    const region = session?.land_info?.region || session?.land_info?.region_name || '未知区域'
    const status = session?.status || 'unknown'
    const statusDisplay = session?.status_display || (status === 'active' ? '生产中' : '已结束')
    
    return (
      <PixelCard className="overflow-hidden">
        {/* 会话头部 */}
        <div className="bg-gray-800/50 px-4 py-3 border-b border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-gold-500">
                {landId}
              </h4>
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
        
        {/* 会话内容 */}
        <div className="p-4 space-y-3">
          {/* 主要数据 - 2列布局 */}
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
          
          {/* 详细信息 */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-gray-400 text-xs">挖矿时长</p>
              <p className="font-bold text-blue-400">
                {miningDuration}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">工具数量</p>
              <p className="font-bold text-yellow-400">
                {toolCount} 个
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">税率</p>
              <p className="font-bold text-red-400">
                {(taxRate * 100).toFixed(0)}%
              </p>
            </div>
          </div>
          
          {/* 粮食消耗 */}
          {foodConsumption > 0 && (
            <div className="flex items-center justify-between p-2 bg-yellow-500/10 rounded">
              <span className="text-xs text-yellow-400">🌾 粮食消耗</span>
              <span className="text-sm font-bold text-yellow-400">
                {foodConsumption}/小时
              </span>
            </div>
          )}
          
          {/* 当前可收取产出 */}
          {session?.current_output && session.current_output > 0 && (
            <div className="flex items-center justify-between p-2 bg-gold-500/10 rounded">
              <span className="text-xs text-gold-400">💰 可收取</span>
              <span className="text-sm font-bold text-gold-400">
                {formatNumber(session.current_output)} YLD
              </span>
            </div>
          )}
          
          {/* 操作按钮 */}
          <div className="grid grid-cols-2 gap-2">
            <PixelButton
              size="sm"
              onClick={() => onCollectOutput(session.id)}
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
              onClick={() => handleConfirmStop(session.id)}
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
  }
  
  return (
    <div className="space-y-4">
      {/* 标题栏和统计 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-lg font-bold">活跃挖矿会话</h3>
          {sessions && sessions.length > 0 && (
            <div className="flex gap-4 mt-1">
              <p className="text-sm text-gray-400">
                共 {sessions.length} 个会话
              </p>
              <p className="text-sm text-purple-400">
                累计: {formatNumber(totalOutput)} YLD
              </p>
              <p className="text-sm text-green-400">
                速率: {formatNumber(totalHourlyOutput, 2)} YLD/h
              </p>
            </div>
          )}
        </div>
        <PixelButton
          onClick={handleOpenStartModal}
          disabled={!userLands || userLands.length === 0}
          size="sm"
        >
          <span className="flex items-center gap-2">
            <span>⛏️</span>
            <span>开始挖矿</span>
          </span>
        </PixelButton>
      </div>
      
      {/* 会话列表 */}
      {loading ? (
        <PixelCard className="text-center py-8">
          <div className="animate-spin text-4xl">⏳</div>
          <p className="text-gray-400 mt-2">加载中...</p>
        </PixelCard>
      ) : sessions && sessions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <PixelCard className="text-center py-12">
          <div className="text-6xl mb-4">⛏️</div>
          <p className="text-gray-400 mb-2">暂无活跃的挖矿会话</p>
          <p className="text-sm text-gray-500 mb-4">
            {!userLands || userLands.length === 0 
              ? '您需要先拥有土地才能开始挖矿' 
              : '点击"开始挖矿"按钮创建新的挖矿会话'}
          </p>
          {userLands && userLands.length > 0 && (
            <PixelButton 
              onClick={handleOpenStartModal}
              size="sm"
            >
              开始挖矿
            </PixelButton>
          )}
        </PixelCard>
      )}
      
      {/* 开始挖矿模态框 */}
      <PixelModal
        isOpen={showStartModal}
        onClose={() => {
          setShowStartModal(false)
          setSelectedLand(null)
          setSelectedTools([])
        }}
        title="开始自主挖矿"
        size="medium"
      >
        <div className="space-y-4">
          {/* 重要提示 */}
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
            <div className="flex items-start gap-2">
              <span className="text-red-500 text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-sm text-red-400 font-bold mb-1">重要提示</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• 挖矿开始后，<span className="text-red-400 font-bold">1小时内停止将按完整1小时扣除耐久和粮食</span></li>
                  <li>• 工具耐久度会持续消耗，耐久度为0时工具损坏</li>
                  <li>• 粮食不足时生产会自动暂停</li>
                  <li>• 请确保有足够的粮食储备再开始挖矿</li>
                  <li>• 每个工具每小时消耗 {FOOD_CONSUMPTION_RATE} 单位粮食</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* 选择土地 */}
          <div>
            <label className="text-sm font-bold text-gray-300">选择土地</label>
            {userLands && userLands.length > 0 ? (
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
            <label className="text-sm font-bold text-gray-300">
              选择工具 {selectedTools.length > 0 && `(已选 ${selectedTools.length})`}
            </label>
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto bg-gray-800/50 rounded p-2">
              {availableTools.length > 0 ? (
                availableTools.map(tool => (
                  <label key={tool.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 p-2 rounded">
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
                      className="rounded text-gold-500"
                    />
                    <span className="text-sm flex-1">
                      {tool.tool_id} - {tool.tool_type_display}
                    </span>
                    <span className="text-xs text-gray-400">
                      耐久: {tool.current_durability || tool.durability || 0}/{tool.max_durability || 1500}
                    </span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  暂无可用工具，请先合成工具
                </p>
              )}
            </div>
          </div>
          
          {/* 预计消耗 */}
          {selectedLand && selectedTools.length > 0 && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
              <p className="text-xs text-blue-400 font-bold mb-2">预计消耗（每小时）</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">工具耐久:</span>
                  <span className="text-yellow-400">{selectedTools.length * DURABILITY_CONSUMPTION_RATE} 点/工具</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">粮食消耗:</span>
                  <span className="text-yellow-400">{selectedTools.length * FOOD_CONSUMPTION_RATE} 单位</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                注：实际消耗根据土地类型和工具效率会有所不同
              </p>
            </div>
          )}
          
          {/* 按钮 */}
          <div className="flex gap-3">
            <PixelButton
              className="flex-1"
              onClick={handleConfirmStart}
              disabled={!selectedLand || selectedTools.length === 0 || startMiningLoading}
            >
              {startMiningLoading ? '开始中...' : '确认开始'}
            </PixelButton>
            <PixelButton
              variant="secondary"
              onClick={() => setShowStartModal(false)}
            >
              取消
            </PixelButton>
          </div>
        </div>
      </PixelModal>
      
      {/* 确认对话框 */}
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
        <div className="space-y-4">
          {confirmAction === 'start' ? (
            <>
              <div className="text-center py-4">
                <div className="text-5xl mb-3">⚠️</div>
                <p className="text-sm text-gray-300 mb-2">
                  您确定要开始挖矿吗？
                </p>
                <p className="text-xs text-red-400 font-bold">
                  开始后1小时内停止将扣除完整1小时的资源消耗
                </p>
              </div>
              <div className="bg-gray-800 rounded p-3 text-xs">
                <p className="text-gray-400 mb-1">挖矿信息：</p>
                <p>土地：{selectedLand?.land_id}</p>
                <p>工具数量：{selectedTools.length} 个</p>
                <p>预计粮食消耗：{selectedTools.length * FOOD_CONSUMPTION_RATE} 单位/小时</p>
                <p className="text-yellow-400 mt-1">
                  注：实际消耗根据土地类型可能不同
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center py-4">
                <div className="text-5xl mb-3">🛑</div>
                <p className="text-sm text-gray-300 mb-2">
                  您确定要停止这个生产会话吗？
                </p>
                <p className="text-xs text-yellow-400">
                  停止后可以收取累计的产出
                </p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
                <p className="text-xs text-yellow-400">
                  ⚠️ 如果挖矿时间不足1小时，仍会扣除1小时的耐久和粮食
                </p>
              </div>
            </>
          )}
          
          <div className="flex gap-3">
            <PixelButton
              className="flex-1"
              variant={confirmAction === 'stop' ? 'secondary' : 'primary'}
              onClick={confirmAction === 'start' ? handleExecuteStart : handleExecuteStop}
            >
              确认{confirmAction === 'start' ? '开始' : '停止'}
            </PixelButton>
            <PixelButton
              variant="secondary"
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
