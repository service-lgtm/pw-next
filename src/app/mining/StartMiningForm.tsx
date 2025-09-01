// src/app/mining/StartMiningForm.tsx
// 开始挖矿表单组件 - 向导式流程版本
// 
// 文件说明：
// 向导式挖矿流程，简化操作，优化移动端体验
// 
// 修改历史：
// - 2025-01-18: 初始版本，基础的土地和工具选择功能
// - 2025-01-20: 优化版本，支持大量土地和工具的用户
// - 2025-01-28: 修复土地类型显示问题，移除坐标显示
// - 2025-01-29: 全新向导式流程设计
//   * 三步流程：选土地 → 选工具 → 确认
//   * 卡片式设计，大图标和清晰视觉
//   * 智能推荐和快速选择
//   * 移动端优化，大按钮和滑动操作
// 
// 主要功能：
// 1. 向导式流程引导
// 2. 智能工具推荐
// 3. 视觉化选择界面
// 4. 移动端手势支持
// 
// 关联文件：
// - 被调用: ./MiningSessions.tsx (挖矿会话管理组件)
// - 使用常量: ./miningConstants.ts (TOOL_LAND_COMPATIBILITY等)
// - 使用工具函数: ./miningUtils.ts (formatNumber等)
// - 数据来源: @/hooks/useProduction.ts 的 useUserLands() Hook

'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { PixelButton } from '@/components/shared/PixelButton'
import { cn } from '@/lib/utils'
import type { Land } from '@/types/assets'
import type { Tool } from '@/types/production'
import { formatNumber } from './miningUtils'
import { 
  FOOD_CONSUMPTION_RATE,
  TOOL_LAND_MAP,
  LAND_TOOL_MAP
} from './miningConstants'

interface StartMiningFormProps {
  userLands: Land[] | null
  tools: Tool[] | null
  selectedLand: Land | null
  selectedTools: number[]
  onLandSelect: (land: Land | null) => void
  onToolsSelect: (toolIds: number[]) => void
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
  activeSessions?: any[]
  userLevel?: number
  maxToolsPerLand?: number
}

// ==================== 常量定义 ====================

// 土地类型配置
const LAND_TYPES = {
  'yld_mine': {
    label: 'YLD矿山',
    icon: '💎',
    color: 'bg-purple-500',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-400',
    bgColor: 'bg-purple-900/20'
  },
  'iron_mine': {
    label: '铁矿山',
    icon: '⛏️',
    color: 'bg-gray-500',
    borderColor: 'border-gray-500',
    textColor: 'text-gray-400',
    bgColor: 'bg-gray-900/20'
  },
  'stone_mine': {
    label: '石矿山',
    icon: '🪨',
    color: 'bg-blue-500',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-400',
    bgColor: 'bg-blue-900/20'
  },
  'forest': {
    label: '森林',
    icon: '🌲',
    color: 'bg-green-500',
    borderColor: 'border-green-500',
    textColor: 'text-green-400',
    bgColor: 'bg-green-900/20'
  },
  'farm': {
    label: '农场',
    icon: '🌾',
    color: 'bg-yellow-500',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20'
  }
}

// 工具类型配置
const TOOL_TYPES = {
  'pickaxe': {
    label: '镐',
    icon: '⛏️',
    color: 'bg-gray-500',
    borderColor: 'border-gray-500',
    textColor: 'text-gray-400'
  },
  'axe': {
    label: '斧头',
    icon: '🪓',
    color: 'bg-green-500',
    borderColor: 'border-green-500',
    textColor: 'text-green-400'
  },
  'hoe': {
    label: '锄头',
    icon: '🔧',
    color: 'bg-yellow-500',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-400'
  }
}

// ==================== 辅助函数 ====================

/**
 * 获取土地类型
 */
function getLandType(land: any): string {
  if (land.blueprint?.land_type) return land.blueprint.land_type
  if (land.blueprint_info?.land_type) return land.blueprint_info.land_type
  if (land.land_type) return land.land_type
  
  // 从名称推断
  if (land.blueprint_name) {
    const name = land.blueprint_name.toLowerCase()
    if (name.includes('陨石') || name.includes('yld')) return 'yld_mine'
    if (name.includes('铁')) return 'iron_mine'
    if (name.includes('石')) return 'stone_mine'
    if (name.includes('森林')) return 'forest'
    if (name.includes('农')) return 'farm'
  }
  return ''
}

/**
 * 获取区域名称
 */
function getRegionName(land: any): string {
  if (land.region?.name) return land.region.name
  if (land.region_name) return land.region_name
  if (land.region_info?.name) return land.region_info.name
  return '未知区域'
}

// ==================== 子组件 ====================

/**
 * 步骤指示器
 */
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <React.Fragment key={step}>
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
              step === currentStep
                ? "bg-gold-500 text-gray-900 scale-110"
                : step < currentStep
                ? "bg-green-500 text-white"
                : "bg-gray-700 text-gray-400"
            )}
          >
            {step < currentStep ? '✓' : step}
          </div>
          {step < totalSteps && (
            <div
              className={cn(
                "w-12 h-0.5 transition-all",
                step < currentStep ? "bg-green-500" : "bg-gray-700"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

/**
 * 土地卡片
 */
const LandCard = ({ 
  land, 
  isSelected, 
  isActive, 
  onClick 
}: {
  land: any
  isSelected: boolean
  isActive: boolean
  onClick: () => void
}) => {
  const landType = getLandType(land)
  const typeConfig = LAND_TYPES[landType as keyof typeof LAND_TYPES] || {
    label: '未知',
    icon: '❓',
    color: 'bg-gray-500',
    borderColor: 'border-gray-500',
    textColor: 'text-gray-400',
    bgColor: 'bg-gray-900/20'
  }
  
  return (
    <div
      onClick={!isActive ? onClick : undefined}
      className={cn(
        "relative p-4 rounded-xl border-2 transition-all cursor-pointer",
        "hover:scale-105 active:scale-95",
        isSelected
          ? `${typeConfig.borderColor} ${typeConfig.bgColor} ring-2 ring-gold-500 ring-offset-2 ring-offset-gray-900`
          : isActive
          ? "border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed"
          : "border-gray-700 bg-gray-800 hover:border-gray-600"
      )}
    >
      {/* 选中标记 */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
      
      {/* 生产中标记 */}
      {isActive && (
        <div className="absolute top-2 right-2 bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded">
          生产中
        </div>
      )}
      
      {/* 图标 */}
      <div className="text-4xl mb-2 text-center">{typeConfig.icon}</div>
      
      {/* 信息 */}
      <div className="text-center">
        <p className="font-bold text-sm text-white truncate">
          {land.land_id || `土地#${land.id}`}
        </p>
        <p className={cn("text-xs mt-1", typeConfig.textColor)}>
          {typeConfig.label}
        </p>
      </div>
      
      {/* YLD储量（仅YLD矿山显示） */}
      {landType === 'yld_mine' && (land.yld_capacity || land.initial_price) && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            储量: {formatNumber(Number(land.yld_capacity || land.initial_price || 0), 0)}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * 工具卡片
 */
const ToolCard = ({
  tool,
  isSelected,
  onClick,
  disabled
}: {
  tool: Tool
  isSelected: boolean
  onClick: () => void
  disabled?: boolean
}) => {
  const typeConfig = TOOL_TYPES[tool.tool_type as keyof typeof TOOL_TYPES] || {
    label: '未知',
    icon: '❓',
    color: 'bg-gray-500',
    borderColor: 'border-gray-500',
    textColor: 'text-gray-400'
  }
  
  const durabilityPercent = (tool.current_durability / tool.max_durability) * 100
  const durabilityColor = durabilityPercent > 66 ? 'bg-green-500' : 
                          durabilityPercent > 33 ? 'bg-yellow-500' : 'bg-red-500'
  
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={cn(
        "relative p-3 rounded-lg border-2 transition-all",
        !disabled && "cursor-pointer hover:scale-105 active:scale-95",
        isSelected
          ? `${typeConfig.borderColor} bg-gray-800 ring-2 ring-gold-500 ring-offset-1 ring-offset-gray-900`
          : disabled
          ? "border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed"
          : "border-gray-700 bg-gray-800 hover:border-gray-600"
      )}
    >
      {/* 选中标记 */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        {/* 图标 */}
        <div className="text-2xl">{typeConfig.icon}</div>
        
        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs text-white">
            {typeConfig.label}#{tool.id}
          </p>
          
          {/* 耐久度条 */}
          <div className="mt-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all", durabilityColor)}
              style={{ width: `${durabilityPercent}%` }}
            />
          </div>
          
          <p className="text-xs text-gray-400 mt-0.5">
            {tool.current_durability}/{tool.max_durability}
          </p>
        </div>
      </div>
    </div>
  )
}

// ==================== 主组件 ====================

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
  userLevel = 1,
  maxToolsPerLand = 60
}: StartMiningFormProps) {
  // 状态管理
  const [currentStep, setCurrentStep] = useState(1)
  const [landTypeFilter, setLandTypeFilter] = useState<string>('all')
  const [toolBatchSize, setToolBatchSize] = useState<number>(10)
  
  // 获取活跃会话中的土地ID
  const activeLandIds = useMemo(() => {
    return new Set(activeSessions?.map(s => s.land_id) || [])
  }, [activeSessions])
  
  // 筛选土地
  const filteredLands = useMemo(() => {
    if (!userLands) return []
    
    let lands = [...userLands].filter(land => {
      const landType = getLandType(land)
      return landType && landType !== 'urban' && landType !== 'commercial'
    })
    
    if (landTypeFilter !== 'all') {
      lands = lands.filter(land => getLandType(land) === landTypeFilter)
    }
    
    // 排序：未使用的优先，YLD矿山优先
    lands.sort((a, b) => {
      const aActive = activeLandIds.has(a.id)
      const bActive = activeLandIds.has(b.id)
      if (aActive !== bActive) return aActive ? 1 : -1
      
      const aType = getLandType(a)
      const bType = getLandType(b)
      if (aType === 'yld_mine' && bType !== 'yld_mine') return -1
      if (aType !== 'yld_mine' && bType === 'yld_mine') return 1
      
      return a.id - b.id
    })
    
    return lands
  }, [userLands, landTypeFilter, activeLandIds])
  
  // 获取可用的土地类型
  const availableLandTypes = useMemo(() => {
    if (!userLands) return []
    const types = new Set<string>()
    userLands.forEach(land => {
      const landType = getLandType(land)
      if (landType && LAND_TYPES[landType as keyof typeof LAND_TYPES]) {
        types.add(landType)
      }
    })
    return Array.from(types)
  }, [userLands])
  
  // 筛选可用工具（根据选中的土地）
  const availableTools = useMemo(() => {
    if (!tools || !selectedLand) return []
    
    const landType = getLandType(selectedLand)
    const requiredToolType = landType ? LAND_TOOL_MAP[landType] : null
    
    return tools.filter(tool => {
      if (tool.status !== 'normal' || tool.is_in_use || (tool.current_durability || 0) <= 0) {
        return false
      }
      if (requiredToolType && tool.tool_type !== requiredToolType) {
        return false
      }
      return true
    }).sort((a, b) => b.current_durability - a.current_durability)
  }, [tools, selectedLand])
  
  // 事件处理
  const handleLandSelect = useCallback((land: Land) => {
    onLandSelect(selectedLand?.id === land.id ? null : land)
    if (selectedLand?.id !== land.id) {
      onToolsSelect([]) // 切换土地时清空工具选择
    }
  }, [selectedLand, onLandSelect, onToolsSelect])
  
  const handleToolToggle = useCallback((toolId: number) => {
    if (selectedTools.includes(toolId)) {
      onToolsSelect(selectedTools.filter(id => id !== toolId))
    } else if (selectedTools.length < maxToolsPerLand) {
      onToolsSelect([...selectedTools, toolId])
    }
  }, [selectedTools, maxToolsPerLand, onToolsSelect])
  
  const handleBatchSelect = useCallback(() => {
    const toolsToSelect = availableTools.slice(0, Math.min(toolBatchSize, maxToolsPerLand))
    onToolsSelect(toolsToSelect.map(t => t.id))
  }, [availableTools, toolBatchSize, maxToolsPerLand, onToolsSelect])
  
  const handleNextStep = useCallback(() => {
    if (currentStep === 1 && selectedLand) {
      setCurrentStep(2)
    } else if (currentStep === 2 && selectedTools.length > 0) {
      setCurrentStep(3)
    }
  }, [currentStep, selectedLand, selectedTools])
  
  const handlePrevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])
  
  const handleConfirmStart = useCallback(() => {
    if (selectedLand && selectedTools.length > 0) {
      onConfirm()
    }
  }, [selectedLand, selectedTools, onConfirm])
  
  // 计算统计信息
  const stats = useMemo(() => {
    const landType = selectedLand ? getLandType(selectedLand) : ''
    const landTypeConfig = LAND_TYPES[landType as keyof typeof LAND_TYPES]
    const requiredToolType = landType ? LAND_TOOL_MAP[landType] : null
    const requiredToolConfig = requiredToolType ? TOOL_TYPES[requiredToolType as keyof typeof TOOL_TYPES] : null
    
    return {
      landType,
      landTypeLabel: landTypeConfig?.label || '未知',
      landTypeIcon: landTypeConfig?.icon || '❓',
      requiredToolType,
      requiredToolLabel: requiredToolConfig?.label || '未知',
      requiredToolIcon: requiredToolConfig?.icon || '❓',
      selectedToolsCount: selectedTools.length,
      maxTools: maxToolsPerLand,
      foodConsumption: selectedTools.length * FOOD_CONSUMPTION_RATE,
      canProceed: selectedLand && selectedTools.length > 0
    }
  }, [selectedLand, selectedTools, maxToolsPerLand])
  
  // ==================== 渲染 ====================
  
  return (
    <div className="space-y-4">
      {/* 步骤指示器 */}
      <StepIndicator currentStep={currentStep} totalSteps={3} />
      
      {/* 步骤1：选择土地 */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-1">选择挖矿土地</h3>
            <p className="text-sm text-gray-400">选择一块土地开始挖矿</p>
          </div>
          
          {/* 快速筛选 */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setLandTypeFilter('all')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all",
                landTypeFilter === 'all'
                  ? "bg-gold-500 text-gray-900"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              )}
            >
              全部 ({filteredLands.length})
            </button>
            {availableLandTypes.map(type => {
              const config = LAND_TYPES[type as keyof typeof LAND_TYPES]
              const count = userLands?.filter(l => getLandType(l) === type).length || 0
              return (
                <button
                  key={type}
                  onClick={() => setLandTypeFilter(type)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1",
                    landTypeFilter === type
                      ? "bg-gold-500 text-gray-900"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  )}
                >
                  <span>{config?.icon}</span>
                  <span>{config?.label} ({count})</span>
                </button>
              )
            })}
          </div>
          
          {/* 土地列表 */}
          <div className="max-h-96 overflow-y-auto">
            {filteredLands.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-2">🏔️</div>
                <p className="text-gray-400">没有可用的土地</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredLands.map(land => (
                  <LandCard
                    key={land.id}
                    land={land}
                    isSelected={selectedLand?.id === land.id}
                    isActive={activeLandIds.has(land.id)}
                    onClick={() => handleLandSelect(land)}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* 底部操作 */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <PixelButton
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
            >
              取消
            </PixelButton>
            <PixelButton
              onClick={handleNextStep}
              disabled={!selectedLand}
              className="flex-1"
            >
              下一步
            </PixelButton>
          </div>
        </div>
      )}
      
      {/* 步骤2：选择工具 */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-1">选择挖矿工具</h3>
            <p className="text-sm text-gray-400">
              {stats.landTypeLabel}需要{stats.requiredToolLabel}
            </p>
          </div>
          
          {/* 已选土地信息 */}
          <div className="bg-gray-800 rounded-lg p-3 flex items-center gap-3">
            <div className="text-2xl">{stats.landTypeIcon}</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">
                {selectedLand?.land_id || `土地#${selectedLand?.id}`}
              </p>
              <p className="text-xs text-gray-400">{stats.landTypeLabel}</p>
            </div>
          </div>
          
          {/* 快速选择 */}
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">快速选择数量</span>
              <span className="text-sm font-bold text-white">
                {selectedTools.length} / {maxToolsPerLand} 已选
              </span>
            </div>
            <div className="flex gap-2">
              {[10, 30, 60].map(size => (
                <button
                  key={size}
                  onClick={() => {
                    setToolBatchSize(size)
                    handleBatchSelect()
                  }}
                  disabled={availableTools.length === 0}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                    toolBatchSize === size
                      ? "bg-gold-500 text-gray-900"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600",
                    availableTools.length === 0 && "opacity-50 cursor-not-allowed"
                  )}
                >
                  选{size}个
                </button>
              ))}
              {selectedTools.length > 0 && (
                <button
                  onClick={() => onToolsSelect([])}
                  className="px-3 py-2 bg-red-900/50 text-red-400 rounded-lg text-sm font-bold hover:bg-red-900/70"
                >
                  清空
                </button>
              )}
            </div>
          </div>
          
          {/* 工具列表 */}
          <div className="max-h-64 overflow-y-auto">
            {availableTools.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">{stats.requiredToolIcon}</div>
                <p className="text-gray-400">没有可用的{stats.requiredToolLabel}</p>
                <p className="text-xs text-gray-500 mt-1">请先合成工具</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableTools.map(tool => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    isSelected={selectedTools.includes(tool.id)}
                    onClick={() => handleToolToggle(tool.id)}
                    disabled={!selectedTools.includes(tool.id) && selectedTools.length >= maxToolsPerLand}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* 消耗提示 */}
          {selectedTools.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-xs text-yellow-400">
                💡 将消耗 {stats.foodConsumption} 粮食/小时
              </p>
            </div>
          )}
          
          {/* 底部操作 */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <PixelButton
              variant="secondary"
              onClick={handlePrevStep}
              className="flex-1"
            >
              上一步
            </PixelButton>
            <PixelButton
              onClick={handleNextStep}
              disabled={selectedTools.length === 0}
              className="flex-1"
            >
              下一步
            </PixelButton>
          </div>
        </div>
      )}
      
      {/* 步骤3：确认开始 */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-1">确认开始挖矿</h3>
            <p className="text-sm text-gray-400">请确认挖矿配置</p>
          </div>
          
          {/* 挖矿预览 */}
          <div className="bg-gradient-to-br from-gold-900/20 to-gray-800 rounded-lg p-4 space-y-3">
            {/* 土地信息 */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-700">
              <div className="text-3xl">{stats.landTypeIcon}</div>
              <div className="flex-1">
                <p className="text-sm text-gray-400">挖矿土地</p>
                <p className="font-bold text-white">
                  {selectedLand?.land_id || `土地#${selectedLand?.id}`}
                </p>
                <p className="text-xs text-gray-400">{stats.landTypeLabel}</p>
              </div>
            </div>
            
            {/* 工具信息 */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-700">
              <div className="text-3xl">{stats.requiredToolIcon}</div>
              <div className="flex-1">
                <p className="text-sm text-gray-400">挖矿工具</p>
                <p className="font-bold text-white">
                  {stats.selectedToolsCount} 个{stats.requiredToolLabel}
                </p>
                <p className="text-xs text-gray-400">
                  耐久度充足
                </p>
              </div>
            </div>
            
            {/* 消耗信息 */}
            <div className="flex items-center gap-3">
              <div className="text-3xl">🌾</div>
              <div className="flex-1">
                <p className="text-sm text-gray-400">粮食消耗</p>
                <p className="font-bold text-yellow-400">
                  {stats.foodConsumption} 单位/小时
                </p>
                <p className="text-xs text-gray-400">
                  请确保粮食充足
                </p>
              </div>
            </div>
          </div>
          
          {/* 重要提示 */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
            <p className="text-sm font-bold text-blue-400 mb-1">⚡ 即将开始挖矿</p>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• 挖矿将持续进行直到手动停止</li>
              <li>• 每小时整点自动结算收益</li>
              <li>• 停止挖矿时自动收取所有产出</li>
            </ul>
          </div>
          
          {/* 底部操作 */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <PixelButton
              variant="secondary"
              onClick={handlePrevStep}
              className="flex-1"
            >
              上一步
            </PixelButton>
            <PixelButton
              onClick={handleConfirmStart}
              disabled={loading || !stats.canProceed}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-500"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  <span>启动中...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>⛏️</span>
                  <span>开始挖矿</span>
                </span>
              )}
            </PixelButton>
          </div>
        </div>
      )}
    </div>
  )
}

export default StartMiningForm
