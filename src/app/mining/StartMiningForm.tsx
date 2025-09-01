// src/app/mining/StartMiningForm.tsx
// 开始挖矿表单组件 - 保持原有交互的修复版
// 
// 文件说明：
// 这是开始挖矿的表单组件，用于选择土地和工具，开始新的挖矿会话
// 
// 修改历史：
// - 2025-01-30: 仅修复分页问题，保持原有交互方式
//   * 修复工具只显示20个的问题
//   * 修复等级限制计算问题
//   * 添加调试日志帮助定位问题
//   * 保持原有的上下布局，不改变交互方式
// 
// 关联文件：
// - 被 MiningSessions.tsx 使用（主挖矿会话组件）
// - 使用 LandSelector.tsx（土地选择器）
// - 使用 miningConstants.ts（挖矿常量定义）

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
  // 使用传入的或默认的等级和限制
  const actualUserLevel = userLevel ?? 6
  // 强制使用等级计算的值，忽略传入的 maxToolsPerLand
  const actualMaxTools = getMaxToolsForLevel(actualUserLevel)  // 直接使用等级计算
  
  // 调试日志 - 帮助定位问题
  useEffect(() => {
    console.log('[StartMiningForm] 调试信息:', {
      传入的userLevel: userLevel,
      传入的maxToolsPerLand: maxToolsPerLand,
      实际使用的等级: actualUserLevel,
      实际最大工具数: actualMaxTools,
      总工具数: tools?.length || 0,
      可用工具数: availableTools.length
    })
  }, [userLevel, maxToolsPerLand, actualUserLevel, actualMaxTools, tools, availableTools])
  
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
      {/* 土地选择 */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-300">选择土地</label>
        <LandSelector
          lands={userLands || []}
          selectedLand={selectedLand}
          onSelect={onLandSelect}
          activeSessions={activeSessions}
          showError={false}
          className="w-full"
        />
      </div>
      
      {/* 工具选择 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-gray-300">
            选择工具（最多 {actualMaxTools} 个，L{actualUserLevel}等级）
          </label>
          {tools && availableTools.length < tools.length && (
            <span className="text-xs text-gray-400">
              （{availableTools.length}/{tools.length} 个可用）
            </span>
          )}
        </div>
        
        {/* 快捷选择按钮 */}
        <div className="flex gap-2 flex-wrap">
          <PixelButton size="xs" variant="secondary" onClick={() => handleQuickSelect(10)}>
            选10个
          </PixelButton>
          <PixelButton size="xs" variant="secondary" onClick={() => handleQuickSelect(30)}>
            选30个
          </PixelButton>
          <PixelButton size="xs" variant="secondary" onClick={() => handleQuickSelect(actualMaxTools)}>
            选最多({actualMaxTools})
          </PixelButton>
          <PixelButton size="xs" variant="secondary" onClick={() => onToolsSelect([])}>
            清空
          </PixelButton>
        </div>
        
        {/* 选择状态 */}
        <div className="flex justify-between items-center p-2 bg-gray-800 rounded text-sm">
          <span>已选择: {selectedTools.length} / {actualMaxTools}</span>
          <span className="text-yellow-400">消耗: {foodConsumption} 粮食/小时</span>
        </div>
        
        {/* 工具列表 */}
        <div className="max-h-64 overflow-y-auto space-y-1 border border-gray-700 rounded p-2">
          {availableTools.length > 0 ? (
            availableTools.map(tool => (
              <div
                key={tool.id}
                onClick={() => handleToolSelection(tool.id)}
                className={cn(
                  "p-2 rounded cursor-pointer transition-all text-sm",
                  "hover:bg-gray-700",
                  selectedTools.includes(tool.id) 
                    ? "bg-gold-900/30 border border-gold-500/50" 
                    : "bg-gray-800"
                )}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTools.includes(tool.id)}
                    onChange={() => {}}
                    className="pointer-events-none"
                  />
                  <span className="flex-1">{tool.tool_id}</span>
                  <span className="text-xs text-gray-400">
                    {tool.tool_type_display} · 耐久: {tool.current_durability}/{tool.max_durability}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-400 text-sm">
              没有可用的工具
            </div>
          )}
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div className="flex gap-3 pt-2">
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
