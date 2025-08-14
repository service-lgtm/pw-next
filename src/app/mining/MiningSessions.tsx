// src/components/mining/MiningSessions.tsx
// 挖矿会话管理组件
// 
// 功能说明：
// 1. 显示活跃的挖矿会话列表
// 2. 支持开始新的挖矿会话
// 3. 支持停止会话和收取产出
// 
// 关联文件：
// - 被 @/app/mining/page.tsx 使用
// - 使用 @/types/production 中的 MiningSession 类型
// - 使用 @/hooks/useProduction 中的相关 hooks
// - 使用 @/components/shared/PixelCard
// - 使用 @/components/shared/PixelButton

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
  const [selectedLand, setSelectedLand] = useState<Land | null>(null)
  const [selectedTools, setSelectedTools] = useState<number[]>([])
  
  // 可用工具（正常状态且未使用）
  const availableTools = tools?.filter(t => t.status === 'normal' && !t.is_in_use) || []
  
  // 开始挖矿
  const handleStartMining = async () => {
    if (!selectedLand || selectedTools.length === 0) {
      toast.error('请选择土地和工具')
      return
    }
    
    try {
      await onStartMining(selectedLand.id, selectedTools)
      toast.success('开始挖矿成功！')
      setShowStartModal(false)
      setSelectedLand(null)
      setSelectedTools([])
    } catch (err) {
      console.error('开始挖矿失败:', err)
    }
  }
  
  // 会话卡片组件
  const SessionCard = ({ session }: { session: MiningSession }) => (
    <PixelCard className="overflow-hidden">
      {/* 会话头部 */}
      <div className="bg-gray-800/50 px-4 py-3 border-b border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-gold-500">
              {session.land_info?.land_id || `会话 #${session.id}`}
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              {session.land_info?.land_type || '未知'} · {session.land_info?.region_name || '未知区域'}
            </p>
          </div>
          <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
            生产中
          </span>
        </div>
      </div>
      
      {/* 会话内容 */}
      <div className="p-4 space-y-3">
        {/* 产出信息 */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-400 text-xs">产出速率</p>
            <p className="font-bold text-green-400">
              {session.output_rate || 0}/小时
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">累积产出</p>
            <p className="font-bold text-yellow-400">
              {session.accumulated_output || 0}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">资源类型</p>
            <p className="font-bold">
              {session.resource_type || '未知'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">工具数量</p>
            <p className="font-bold text-blue-400">
              {session.tools?.length || session.tool_count || 0} 个
            </p>
          </div>
        </div>
        
        {/* 粮食消耗 */}
        {session.grain_consumption_rate && (
          <div className="flex items-center justify-between p-2 bg-yellow-500/10 rounded">
            <span className="text-xs text-yellow-400">粮食消耗</span>
            <span className="text-sm font-bold text-yellow-400">
              {session.grain_consumption_rate}/小时
            </span>
          </div>
        )}
        
        {/* 操作按钮 */}
        <div className="grid grid-cols-2 gap-2">
          <PixelButton
            size="sm"
            onClick={() => onCollectOutput(session.id)}
            className="w-full"
          >
            <span className="flex items-center justify-center gap-1">
              <span>📦</span>
              <span>收取产出</span>
            </span>
          </PixelButton>
          <PixelButton
            size="sm"
            variant="secondary"
            onClick={() => onStopSession(session.id)}
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
  
  return (
    <div className="space-y-4">
      {/* 标题栏 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-lg font-bold">活跃挖矿会话</h3>
          <p className="text-sm text-gray-400 mt-1">
            {sessions ? `共 ${sessions.length} 个活跃会话` : '加载中...'}
          </p>
        </div>
        <PixelButton
          onClick={() => setShowStartModal(true)}
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
              onClick={() => setShowStartModal(true)}
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
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
              {availableTools.length > 0 ? (
                availableTools.map(tool => (
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
                      className="rounded"
                    />
                    <span className="text-sm flex-1">
                      {tool.tool_id} - {tool.tool_type_display}
                    </span>
                    <span className="text-xs text-gray-400">
                      耐久: {tool.current_durability || 0}/{tool.max_durability || 1500}
                    </span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-400">暂无可用工具，请先合成工具</p>
              )}
            </div>
          </div>
          
          {/* 提示信息 */}
          {selectedLand && selectedTools.length > 0 && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
              <p className="text-xs text-blue-400">
                💡 即将在 {selectedLand.land_id} 使用 {selectedTools.length} 个工具开始挖矿
              </p>
            </div>
          )}
          
          {/* 按钮 */}
          <div className="flex gap-3">
            <PixelButton
              className="flex-1"
              onClick={handleStartMining}
              disabled={!selectedLand || selectedTools.length === 0 || startMiningLoading}
            >
              {startMiningLoading ? '开始中...' : '开始挖矿'}
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
    </div>
  )
}

export default MiningSessions
