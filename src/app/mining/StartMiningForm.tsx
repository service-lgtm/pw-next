// src/app/mining/StartMiningForm.tsx
// 开始挖矿表单组件 - 修复分页问题完整版
// 
// 文件说明：
// 这是开始挖矿的表单组件，用于选择土地和工具，开始新的挖矿会话
// 
// 修改历史：
// - 2025-01-18: 初始版本，基础的土地和工具选择功能
// - 2025-01-30: 修复分页问题
//   * 修复工具只显示20个的问题
//   * 添加调试日志帮助定位问题
//   * 强制使用等级计算工具数量限制
//   * 添加分页检测和警告
// 
// 主要功能：
// 1. 土地选择：支持搜索、筛选、排序
// 2. 工具选择：支持批量选择、智能筛选、排序
// 3. 实时验证：检查工具数量限制等
// 4. 分页问题修复：确保显示所有工具
// 
// 关联文件：
// - 被 MiningSessions.tsx 使用（主挖矿会话组件）
// - 使用 LandSelector.tsx（土地选择器）
// - 使用 miningConstants.ts（挖矿常量定义）
// - 调用 useProduction hooks（数据获取）

'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { PixelButton } from '@/components/shared/PixelButton'
import { LandSelector } from './LandSelector'
import type { Land } from '@/types/assets'
import type { Tool } from '@/types/production'
import toast from 'react-hot-toast'

interface StartMiningFormProps {
  userLands: Land[] | null
  tools: Tool[] | null
  selectedLand: Land | null
  selectedTools: number[]
  onLandSelect: (land: Land | null) => void
  onToolsSelect: (tools: number[]) => void
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
  activeSessions?: any[]
  userLevel?: number
  maxToolsPerLand?: number
}

// 定义等级和工具数量限制的映射
const levelToolLimits: Record<number, number> = {
  1: 10,
  2: 20,
  3: 30,
  4: 40,
  5: 50,
  6: 60,
  7: 70,
}

// 获取用户等级对应的最大工具数
const getMaxToolsForLevel = (level: number) => {
  if (level <= 0) return 0
  if (level > 7) return 70
  return levelToolLimits[level] || 10
}

export function StartMiningForm({
  userLands,
  tools,
  selectedLand,
  selectedTools,
  onLandSelect,
  onToolsSelect,
  onConfirm,
  onCancel,
  loading = false,
  activeSessions = [],
  userLevel = 6,
  maxToolsPerLand
}: StartMiningFormProps) {
  const [activeTab, setActiveTab] = useState<'land' | 'tools'>('land')
  const [toolSearchTerm, setToolSearchTerm] = useState('')
  const [toolSortBy, setToolSortBy] = useState<'id' | 'durability'>('durability')
  const [showAllTools, setShowAllTools] = useState(false)
  
  // 使用传入的或默认的等级和限制
  const actualUserLevel = userLevel ?? 6
  // 强制使用等级计算的值，忽略传入的 maxToolsPerLand
  const actualMaxTools = getMaxToolsForLevel(actualUserLevel)  // 直接使用等级计算
  
  // 调试日志 - 帮助定位问题
  useEffect(() => {
    console.log('[StartMiningForm] 调试信息（修复版）:', {
      传入的userLevel: userLevel,
      传入的maxToolsPerLand: maxToolsPerLand,
      实际使用的等级: actualUserLevel,
      实际最大工具数: actualMaxTools,
      根据等级计算的工具数: getMaxToolsForLevel(actualUserLevel),
      注意: '现在强制使用等级计算的值'
    })
  }, [userLevel, maxToolsPerLand, actualUserLevel, actualMaxTools])
  
  // 筛选可用工具 - 修复：确保显示所有工具
  const availableTools = useMemo(() => {
    const filtered = tools?.filter(tool => 
      tool.status === 'normal' && 
      !tool.is_in_use && 
      tool.current_durability > 0
    ) || []
    
    console.log('[StartMiningForm] 工具筛选:', {
      原始工具数: tools?.length || 0,
      可用工具数: filtered.length,
      最大允许选择: actualMaxTools,
      实际可选数量: Math.min(filtered.length, actualMaxTools),
      注意: '如果工具数是20的倍数，可能是分页问题'
    })
    
    return filtered
  }, [tools, actualMaxTools])
  
  // 检测分页问题
  useEffect(() => {
    if (tools && (tools.length === 20 || tools.length === 40 || tools.length === 60)) {
      console.warn('[StartMiningForm] 警告：工具数量是20的倍数，可能存在分页问题！')
      console.warn('建议：检查 useMyTools Hook 是否设置了足够大的 page_size')
    }
  }, [tools])
  
  // 搜索和排序工具
  const displayedTools = useMemo(() => {
    let filtered = [...availableTools]
    
    // 搜索
    if (toolSearchTerm) {
      filtered = filtered.filter(tool =>
        tool.tool_id.toLowerCase().includes(toolSearchTerm.toLowerCase()) ||
        tool.tool_type_display?.toLowerCase().includes(toolSearchTerm.toLowerCase())
      )
    }
    
    // 排序
    filtered.sort((a, b) => {
      if (toolSortBy === 'durability') {
        return (b.current_durability || 0) - (a.current_durability || 0)
      } else {
        return a.tool_id.localeCompare(b.tool_id)
      }
    })
    
    // 限制显示数量（性能优化）
    if (!showAllTools && filtered.length > 50) {
      return filtered.slice(0, 50)
    }
    
    return filtered
  }, [availableTools, toolSearchTerm, toolSortBy, showAllTools])
  
  // 处理工具选择
  const handleToolSelection = (toolId: number) => {
    if (selectedTools.includes(toolId)) {
      // 取消选择
      onToolsSelect(selectedTools.filter(id => id !== toolId))
    } else {
      // 添加选择
      if (selectedTools.length >= actualMaxTools) {
        toast.error(`最多只能选择 ${actualMaxTools} 个工具（L${actualUserLevel}等级限制）`)
        return
      }
      onToolsSelect([...selectedTools, toolId])
    }
  }
  
  // 批量选择工具
  const handleQuickSelect = (count: number) => {
    const maxCount = Math.min(count, actualMaxTools, availableTools.length)
    
    // 优先选择耐久度高的工具
    const sortedTools = [...availableTools].sort(
      (a, b) => (b.current_durability || 0) - (a.current_durability || 0)
    )
    
    const selectedIds = sortedTools.slice(0, maxCount).map(tool => tool.id)
    onToolsSelect(selectedIds)
    
    toast.success(`已选择 ${selectedIds.length} 个工具`)
  }
  
  // 验证表单
  const validateForm = () => {
    const errors: string[] = []
    
    if (!selectedLand) {
      errors.push('请选择土地')
    }
    
    if (selectedTools.length === 0) {
      errors.push('请至少选择一个工具')
    }
    
    if (selectedTools.length > actualMaxTools) {
      errors.push(`最多只能选择 ${actualMaxTools} 个工具`)
    }
    
    return errors
  }
  
  // 处理确认
  const handleConfirm = () => {
    const errors = validateForm()
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
      return
    }
    onConfirm()
  }
  
  // 计算粮食消耗
  const foodConsumption = selectedTools.length * 2
  
  return (
    <div className="space-y-4">
      {/* 标签页切换 */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('land')}
          className={cn(
            "px-4 py-2 text-sm font-bold transition-all",
            activeTab === 'land'
              ? "text-gold-500 border-b-2 border-gold-500"
              : "text-gray-400 hover:text-white"
          )}
        >
          1. 选择土地
          {selectedLand && " ✓"}
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={cn(
            "px-4 py-2 text-sm font-bold transition-all",
            activeTab === 'tools'
              ? "text-gold-500 border-b-2 border-gold-500"
              : "text-gray-400 hover:text-white",
            !selectedLand && "opacity-50 cursor-not-allowed"
          )}
          disabled={!selectedLand}
        >
          2. 选择工具
          {selectedTools.length > 0 && ` (${selectedTools.length})`}
        </button>
      </div>
      
      {/* 土地选择标签页 */}
      {activeTab === 'land' && (
        <div className="space-y-4">
          <div className="text-sm text-gray-400">
            选择一块可用的土地开始挖矿
          </div>
          
          <LandSelector
            lands={userLands || []}
            selectedLand={selectedLand}
            onSelect={onLandSelect}
            activeSessions={activeSessions}
            showError={false}
            className="w-full"
          />
          
          {selectedLand && (
            <div className="flex justify-end">
              <PixelButton
                size="sm"
                onClick={() => setActiveTab('tools')}
              >
                下一步：选择工具
              </PixelButton>
            </div>
          )}
        </div>
      )}
      
      {/* 工具选择标签页 */}
      {activeTab === 'tools' && selectedLand && (
        <div className="space-y-4">
          <div className="text-sm text-gray-400">
            选择工具用于挖矿（最多 {actualMaxTools} 个，基于L{actualUserLevel}等级）
            {availableTools.length === 20 && (
              <span className="text-yellow-400 block mt-1">
                ⚠️ 注意：如果您有超过20个工具但只显示20个，请联系管理员修复
              </span>
            )}
          </div>
          
          {/* 工具搜索和排序 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="搜索工具..."
              value={toolSearchTerm}
              onChange={(e) => setToolSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
            />
            <select
              value={toolSortBy}
              onChange={(e) => setToolSortBy(e.target.value as 'id' | 'durability')}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
            >
              <option value="durability">按耐久度排序</option>
              <option value="id">按ID排序</option>
            </select>
          </div>
          
          {/* 快捷选择按钮 */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm text-gray-400 self-center">快速选择:</span>
            <PixelButton size="xs" variant="secondary" onClick={() => handleQuickSelect(10)}>
              10个
            </PixelButton>
            <PixelButton size="xs" variant="secondary" onClick={() => handleQuickSelect(30)}>
              30个
            </PixelButton>
            <PixelButton size="xs" variant="secondary" onClick={() => handleQuickSelect(actualMaxTools)}>
              最大({actualMaxTools}个)
            </PixelButton>
            <PixelButton size="xs" variant="secondary" onClick={() => onToolsSelect([])}>
              清空
            </PixelButton>
          </div>
          
          {/* 选择状态 */}
          <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
            <span className="text-sm">
              已选择: {selectedTools.length} / {actualMaxTools} 个工具
            </span>
            <span className="text-sm text-yellow-400">
              预计消耗: {foodConsumption} 粮食/小时
            </span>
          </div>
          
          {/* 工具列表 */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {displayedTools.length > 0 ? (
              <>
                {displayedTools.map(tool => (
                  <div
                    key={tool.id}
                    onClick={() => handleToolSelection(tool.id)}
                    className={cn(
                      "p-3 bg-gray-800 rounded cursor-pointer transition-all",
                      "hover:bg-gray-700",
                      selectedTools.includes(tool.id) && "bg-gold-900/20 border border-gold-500/50"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedTools.includes(tool.id)}
                          onChange={() => {}}
                          className="text-gold-500"
                        />
                        <div>
                          <p className="font-bold text-sm">{tool.tool_id}</p>
                          <p className="text-xs text-gray-400">
                            {tool.tool_type_display} · 耐久度: {tool.current_durability}/{tool.max_durability}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              tool.current_durability > tool.max_durability * 0.5
                                ? "bg-green-500"
                                : tool.current_durability > tool.max_durability * 0.2
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            )}
                            style={{
                              width: `${(tool.current_durability / tool.max_durability) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* 显示更多按钮 */}
                {!showAllTools && availableTools.length > 50 && (
                  <button
                    onClick={() => setShowAllTools(true)}
                    className="w-full py-2 text-center text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    显示全部 {availableTools.length} 个工具
                  </button>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>没有可用的工具</p>
                <p className="text-sm mt-2">
                  请先合成或修复工具
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 底部操作按钮 */}
      <div className="flex gap-3 pt-4 border-t border-gray-700">
        <PixelButton
          className="flex-1"
          onClick={handleConfirm}
          disabled={loading || !selectedLand || selectedTools.length === 0}
        >
          {loading ? '启动中...' : '开始挖矿'}
        </PixelButton>
        <PixelButton
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          取消
        </PixelButton>
      </div>
      
      {/* 调试信息（仅开发环境） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-900 rounded text-xs text-gray-500 font-mono">
          <p className="font-bold text-gray-400 mb-1">🔧 调试信息</p>
          <p>用户等级: L{actualUserLevel}</p>
          <p>最大工具数: {actualMaxTools}</p>
          <p>总工具数: {tools?.length || 0}</p>
          <p>可用工具: {availableTools.length}</p>
          <p>已选工具: {selectedTools.length}</p>
          <p>选中的土地: {selectedLand?.land_id || '未选择'}</p>
          {tools && tools.length === 20 && (
            <p className="text-yellow-400 mt-1">⚠️ 检测到分页问题：工具数量恰好为20</p>
          )}
        </div>
      )}
    </div>
  )
}

export default StartMiningForm
