// src/app/mining/StartMiningForm.tsx
// 开始挖矿表单组件
// 
// 文件说明：
// 本组件提供开始挖矿的表单界面，包括土地选择、工具选择、消耗预览等功能
// 从 MiningSessions.tsx 中拆分出来
// 
// 创建原因：
// - 开始挖矿表单是独立的功能模块，应该单独管理
// - 表单逻辑复杂，包含验证、选择、预览等多个步骤
// - 便于后续添加更多挖矿配置选项
// 
// 功能特性：
// 1. 土地选择（使用 LandSelector 组件）
// 2. 工具多选（支持全选/清空）
// 3. 资源消耗预览
// 4. 新算法v2规则说明
// 5. 表单验证和错误提示
// 
// 使用方式：
// <StartMiningForm
//   userLands={userLands}
//   tools={tools}
//   selectedLand={selectedLand}
//   selectedTools={selectedTools}
//   onLandSelect={setSelectedLand}
//   onToolsSelect={setSelectedTools}
//   onConfirm={handleConfirm}
//   onCancel={handleCancel}
//   loading={loading}
// />
// 
// 关联文件：
// - 被 MiningSessions.tsx 使用（主挖矿会话组件）
// - 使用 LandSelector.tsx（土地选择器）
// - 使用 miningConstants.ts 中的常量
// - 使用 @/components/shared 中的 UI 组件
// 
// 更新历史：
// - 2025-01: 从 MiningSessions.tsx 拆分出来
// - 2025-01: 集成 LandSelector 组件

'use client'

import React, { useState, useMemo, memo } from 'react'
import { PixelButton } from '@/components/shared/PixelButton'
import { cn } from '@/lib/utils'
import type { Tool } from '@/types/production'
import type { Land } from '@/types/assets'
import { LandSelector } from './LandSelector'
import { 
  FOOD_CONSUMPTION_RATE, 
  DURABILITY_CONSUMPTION_RATE 
} from './miningConstants'

interface StartMiningFormProps {
  userLands: Land[]                                     // 用户土地列表
  tools: Tool[]                                         // 工具列表
  selectedLand: Land | null                             // 选中的土地
  selectedTools: number[]                               // 选中的工具ID列表
  onLandSelect: (land: Land | null) => void            // 土地选择回调
  onToolsSelect: (toolIds: number[]) => void           // 工具选择回调
  onConfirm: () => void                                // 确认回调
  onCancel: () => void                                 // 取消回调
  loading?: boolean                                     // 加载状态
}

/**
 * 开始挖矿表单组件
 * 提供土地和工具选择界面
 */
export const StartMiningForm = memo(({
  userLands,
  tools,
  selectedLand,
  selectedTools,
  onLandSelect,
  onToolsSelect,
  onConfirm,
  onCancel,
  loading = false
}: StartMiningFormProps) => {
  // 表单验证状态
  const [landError, setLandError] = useState('')
  const [toolError, setToolError] = useState('')
  const [showLandError, setShowLandError] = useState(false)
  const [showToolError, setShowToolError] = useState(false)
  
  // 筛选可用工具（正常状态、未使用、有耐久度）
  const availableTools = useMemo(() => 
    tools.filter(t => 
      t.status === 'normal' && 
      !t.is_in_use && 
      (t.current_durability || 0) > 0
    ),
    [tools]
  )
  
  // 处理确认点击
  const handleConfirmClick = () => {
    let hasError = false
    
    // 验证土地选择
    if (!selectedLand) {
      setLandError('请选择土地')
      setShowLandError(true)
      hasError = true
    } else {
      setShowLandError(false)
    }
    
    // 验证工具选择
    if (selectedTools.length === 0) {
      setToolError('请至少选择一个工具')
      setShowToolError(true)
      hasError = true
    } else {
      setShowToolError(false)
    }
    
    // 如果没有错误，调用确认回调
    if (!hasError) {
      onConfirm()
    }
  }
  
  // 计算预估消耗
  const estimatedConsumption = {
    food: selectedTools.length * FOOD_CONSUMPTION_RATE,
    durability: selectedTools.length * DURABILITY_CONSUMPTION_RATE
  }
  
  // 处理工具选择变化
  const handleToolToggle = (toolId: number, checked: boolean) => {
    if (checked) {
      onToolsSelect([...selectedTools, toolId])
    } else {
      onToolsSelect(selectedTools.filter(id => id !== toolId))
    }
  }
  
  // 全选工具
  const handleSelectAll = () => {
    onToolsSelect(availableTools.map(t => t.id))
  }
  
  // 清空选择
  const handleClearSelection = () => {
    onToolsSelect([])
  }
  
  return (
    <div className="space-y-4">
      {/* 新算法v2规则说明 */}
      <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded">
        <div className="flex items-start gap-2">
          <span className="text-purple-400">💎</span>
          <div>
            <p className="text-sm font-bold text-purple-400 mb-1">新算法v2规则</p>
            <ul className="text-xs text-gray-300 space-y-0.5">
              <li>• 每小时整点结算上一小时收益</li>
              <li>• 收益暂存不发放，停止时一次性收取</li>
              <li>• 不足60分钟的时间累积到下小时</li>
              <li>• 停止时当前小时不足60分钟部分作废</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* 土地选择 */}
      <div>
        <label className="text-sm font-bold text-gray-300 flex items-center gap-2 mb-2">
          <span>📍</span>
          <span>选择土地</span>
        </label>
        <LandSelector
          lands={userLands}
          selectedLand={selectedLand}
          onSelect={onLandSelect}
          error={landError}
          showError={showLandError}
          placeholder="-- 请选择土地 --"
          disabled={loading}
        />
      </div>
      
      {/* 工具选择 */}
      <div>
        <label className="text-sm font-bold text-gray-300 flex items-center justify-between mb-2">
          <span className="flex items-center gap-2">
            <span>🔧</span>
            <span>选择工具</span>
          </span>
          {selectedTools.length > 0 && (
            <span className="text-xs bg-gold-500/20 text-gold-400 px-2 py-1 rounded">
              已选 {selectedTools.length} 个
            </span>
          )}
        </label>
        
        {availableTools.length > 0 ? (
          <div className="border border-gray-600 rounded-lg overflow-hidden">
            {/* 工具列表 */}
            <div className="max-h-48 overflow-y-auto bg-gray-800/30">
              {availableTools.map((tool, index) => (
                <label 
                  key={tool.id}
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer transition-all hover:bg-gray-700/50",
                    selectedTools.includes(tool.id) && "bg-gray-700/70",
                    index !== 0 && "border-t border-gray-700"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedTools.includes(tool.id)}
                    onChange={(e) => handleToolToggle(tool.id, e.target.checked)}
                    disabled={loading}
                    className="w-4 h-4 rounded border-gray-600 text-gold-500 bg-gray-800 focus:ring-gold-500 focus:ring-offset-0"
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{tool.tool_id}</p>
                      <p className="text-xs text-gray-400">{tool.tool_type_display}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">耐久度</p>
                      <p className="text-xs">
                        <span className={cn(
                          tool.current_durability < 100 ? "text-red-400" :
                          tool.current_durability < 500 ? "text-yellow-400" :
                          "text-green-400"
                        )}>
                          {tool.current_durability}
                        </span>
                        <span className="text-gray-500">/{tool.max_durability || 1500}</span>
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            
            {/* 操作按钮 */}
            <div className="p-2 bg-gray-800/50 border-t border-gray-700 flex gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                disabled={loading}
                className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors disabled:opacity-50"
              >
                全选
              </button>
              <button
                type="button"
                onClick={handleClearSelection}
                disabled={loading}
                className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors disabled:opacity-50"
              >
                清空
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-800/50 rounded-lg text-center">
            <p className="text-sm text-gray-400">暂无可用工具</p>
            <p className="text-xs text-gray-500 mt-1">请先合成工具或等待工具修复</p>
          </div>
        )}
        
        {/* 工具选择错误提示 */}
        {showToolError && toolError && (
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <span>❌</span>
            <span>{toolError}</span>
          </p>
        )}
      </div>
      
      {/* 消耗预览 */}
      {selectedTools.length > 0 && (
        <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded">
          <p className="text-xs text-blue-400 font-bold mb-2">预计消耗（每小时）</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-800/50 rounded p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">🌾 粮食</span>
                <span className="text-sm font-bold text-yellow-400">
                  {estimatedConsumption.food} 单位
                </span>
              </div>
            </div>
            <div className="bg-gray-800/50 rounded p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">⚙️ 耐久</span>
                <span className="text-sm font-bold text-gray-400">
                  {estimatedConsumption.durability} 点/工具
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 操作按钮 */}
      <div className="flex gap-3">
        <PixelButton
          className="flex-1"
          onClick={handleConfirmClick}
          disabled={loading}
        >
          {loading ? '处理中...' : '确认开始'}
        </PixelButton>
        <PixelButton
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          取消
        </PixelButton>
      </div>
    </div>
  )
})

StartMiningForm.displayName = 'StartMiningForm'

export default StartMiningForm
