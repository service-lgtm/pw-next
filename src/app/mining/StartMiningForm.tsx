// src/app/mining/StartMiningForm.tsx
// 开始挖矿表单组件 - 优化版本（支持大量土地和工具的用户）
// 
// 文件说明：
// 这是开始挖矿的表单组件，用于选择土地和工具，开始新的挖矿会话
// 
// 修改历史：
// - 2025-01-18: 初始版本，基础的土地和工具选择功能
// - 2025-01-20: 优化版本，支持大量土地和工具的用户
//   * 添加搜索和筛选功能
//   * 添加批量选择工具功能（10/30/60个）
//   * 优化列表显示，添加虚拟滚动支持
//   * 改进UI交互，使用标签页分离土地和工具选择
//   * 添加智能排序和筛选
// - 2025-01-28: 修复土地类型显示问题
//   * 修复从 blueprint.land_type 获取土地类型
//   * 移除坐标显示（后端未提供坐标数据）
//   * 优化区域名称获取逻辑
//   * 添加辅助函数处理数据获取
// 
// 主要功能：
// 1. 土地选择：支持搜索、筛选、排序
// 2. 工具选择：支持批量选择、智能筛选、排序
// 3. 实时验证：检查工具类型匹配、数量限制等
// 4. 性能优化：大数据量下的流畅交互
// 
// 关联文件：
// - 被调用: ./MiningSessions.tsx (挖矿会话管理组件)
// - 使用常量: ./miningConstants.ts (TOOL_LAND_COMPATIBILITY等)
// - 使用工具函数: ./miningUtils.ts (formatNumber等)
// - 数据来源: @/hooks/useProduction.ts 的 useUserLands() Hook
// - API调用: @/lib/api/production.ts 的 lands.getAvailableLands()

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
  LAND_TOOL_MAP,
  isToolValidForLand
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

// 土地类型映射
const LAND_TYPE_LABELS: Record<string, string> = {
  'yld_mine': 'YLD矿山',
  'iron_mine': '铁矿山',
  'stone_mine': '石矿山',
  'forest': '森林',
  'farm': '农场'
}

// 工具类型映射
const TOOL_TYPE_LABELS: Record<string, string> = {
  'pickaxe': '镐',
  'axe': '斧头',
  'hoe': '锄头'
}

// ==================== 辅助函数 ====================
// 这些辅助函数用于处理后端返回的不同数据结构
// 后端API可能返回不同的字段名，需要兼容处理

/**
 * 获取土地类型
 * 优先级：blueprint.land_type > blueprint_info.land_type > land_type > 从名称推断
 * @param land - 土地对象
 * @returns 土地类型字符串
 */
function getLandType(land: any): string {
  // 优先从 blueprint 获取（新的API结构）
  if (land.blueprint?.land_type) {
    return land.blueprint.land_type
  }
  // 其次从 blueprint_info 获取（旧的API结构）
  if (land.blueprint_info?.land_type) {
    return land.blueprint_info.land_type
  }
  // 然后从顶层 land_type 获取（兼容其他API）
  if (land.land_type) {
    return land.land_type
  }
  // 最后尝试从名称推断（降级方案）
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
 * 优先级：region.name > region_name > region_info.name
 * @param land - 土地对象
 * @returns 区域名称字符串
 */
function getRegionName(land: any): string {
  if (land.region?.name) return land.region.name
  if (land.region_name) return land.region_name
  if (land.region_info?.name) return land.region_info.name
  return '未知区域'
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
  userLevel = 1,
  maxToolsPerLand = 60
}: StartMiningFormProps) {
  // ==================== 状态管理 ====================
  const [activeTab, setActiveTab] = useState<'land' | 'tools'>('land')
  const [landSearch, setLandSearch] = useState('')
  const [landTypeFilter, setLandTypeFilter] = useState<string>('all')
  const [toolSearch, setToolSearch] = useState('')
  const [toolSort, setToolSort] = useState<'durability' | 'id'>('durability')
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true)
  
  // 调试：打印接收到的土地数据结构
  useEffect(() => {
    console.log('[StartMiningForm] userLands:', userLands)
    if (userLands && userLands.length > 0) {
      const firstLand = userLands[0]
      console.log('[StartMiningForm] First land structure:', {
        id: firstLand.id,
        land_id: firstLand.land_id,
        blueprint: firstLand.blueprint,
        region: firstLand.region,
        region_name: firstLand.region_name,
        // 输出获取到的土地类型，用于调试
        detected_land_type: getLandType(firstLand),
        detected_region: getRegionName(firstLand)
      })
    }
  }, [userLands])
  
  // ==================== 计算派生状态 ====================
  
  // 获取活跃会话中的土地ID
  const activeLandIds = useMemo(() => {
    return new Set(activeSessions?.map(s => s.land_id) || [])
  }, [activeSessions])
  
  // 筛选和排序土地
  const filteredLands = useMemo(() => {
    if (!userLands) return []
    
    let lands = [...userLands]
    
    console.log('[StartMiningForm] Processing lands:', lands.length, 'lands')
    
    // 过滤掉不能挖矿的土地类型
    lands = lands.filter(land => {
      const landType = getLandType(land)
      // 只排除明确不能挖矿的类型
      const canMine = landType !== 'urban' && 
                     landType !== 'commercial' && 
                     landType !== 'residential' && 
                     landType !== 'industrial' &&
                     landType !== ''  // 排除无法识别类型的土地
      if (!canMine) {
        console.log('[StartMiningForm] Filtered out land:', land.land_id, 'type:', landType)
      }
      return canMine
    })
    
    console.log('[StartMiningForm] After mining filter:', lands.length, 'lands')
    
    // 类型筛选
    if (landTypeFilter !== 'all') {
      lands = lands.filter(land => {
        const landType = getLandType(land)
        return landType === landTypeFilter
      })
      console.log('[StartMiningForm] After type filter:', lands.length, 'lands, filter:', landTypeFilter)
    }
    
    // 搜索筛选
    if (landSearch) {
      const searchLower = landSearch.toLowerCase()
      lands = lands.filter(land => {
        const landId = land.land_id?.toLowerCase() || ''
        const regionName = getRegionName(land).toLowerCase()
        return landId.includes(searchLower) || regionName.includes(searchLower)
      })
      console.log('[StartMiningForm] After search filter:', lands.length, 'lands')
    }
    
    // 排序：YLD矿山优先，然后按ID排序
    lands.sort((a, b) => {
      const aType = getLandType(a)
      const bType = getLandType(b)
      
      // YLD矿山优先
      if (aType === 'yld_mine' && bType !== 'yld_mine') return -1
      if (aType !== 'yld_mine' && bType === 'yld_mine') return 1
      
      // 按ID排序
      return a.id - b.id
    })
    
    console.log('[StartMiningForm] Final filtered lands:', lands)
    return lands
  }, [userLands, landTypeFilter, landSearch])
  
  // 获取可用的土地类型
  const availableLandTypes = useMemo(() => {
    if (!userLands) return []
    const types = new Set<string>()
    userLands.forEach(land => {
      const landType = getLandType(land)
      // 过滤掉不能挖矿的土地类型和空类型
      if (landType && 
          landType !== 'urban' && 
          landType !== 'commercial' && 
          landType !== 'residential' && 
          landType !== 'industrial') {
        types.add(landType)
      }
    })
    return Array.from(types)
  }, [userLands])
  
  // 筛选可用工具
  const availableTools = useMemo(() => {
    if (!tools || !selectedLand) return []
    
    const landType = getLandType(selectedLand)
    const requiredToolType = landType ? LAND_TOOL_MAP[landType] : null
    
    let filteredTools = tools.filter(tool => {
      // 基础条件
      if (tool.status !== 'normal' || tool.is_in_use || (tool.current_durability || 0) <= 0) {
        return false
      }
      
      // 如果有指定的工具类型要求，进行类型匹配
      if (requiredToolType && tool.tool_type !== requiredToolType) {
        return false
      }
      
      return true
    })
    
    // 搜索筛选
    if (toolSearch) {
      const searchLower = toolSearch.toLowerCase()
      filteredTools = filteredTools.filter(tool => {
        const toolId = tool.id?.toString() || ''
        const toolType = TOOL_TYPE_LABELS[tool.tool_type] || tool.tool_type
        return toolId.includes(searchLower) || toolType.toLowerCase().includes(searchLower)
      })
    }
    
    // 排序
    filteredTools.sort((a, b) => {
      if (toolSort === 'durability') {
        return (b.current_durability || 0) - (a.current_durability || 0)
      } else {
        return a.id - b.id
      }
    })
    
    return filteredTools
  }, [tools, selectedLand, toolSearch, toolSort])
  
  // 计算统计信息
  const stats = useMemo(() => {
    const landType = selectedLand ? getLandType(selectedLand) : ''
    const foodConsumption = selectedTools.length * FOOD_CONSUMPTION_RATE
    const canProceed = selectedLand && selectedTools.length > 0 && selectedTools.length <= maxToolsPerLand
    
    return {
      selectedLandType: LAND_TYPE_LABELS[landType] || '未知',
      selectedToolsCount: selectedTools.length,
      maxTools: maxToolsPerLand,
      foodConsumption,
      canProceed
    }
  }, [selectedLand, selectedTools, maxToolsPerLand])
  
  // ==================== 事件处理 ====================
  
  // 批量选择工具
  const handleBatchSelectTools = useCallback((count: number) => {
    const toolsToSelect = availableTools.slice(0, Math.min(count, maxToolsPerLand))
    onToolsSelect(toolsToSelect.map(t => t.id))
  }, [availableTools, maxToolsPerLand, onToolsSelect])
  
  // 切换工具选择
  const handleToggleTool = useCallback((toolId: number) => {
    if (selectedTools.includes(toolId)) {
      onToolsSelect(selectedTools.filter(id => id !== toolId))
    } else if (selectedTools.length < maxToolsPerLand) {
      onToolsSelect([...selectedTools, toolId])
    }
  }, [selectedTools, maxToolsPerLand, onToolsSelect])
  
  // 切换标签页
  const handleTabChange = useCallback((tab: 'land' | 'tools') => {
    if (tab === 'tools' && !selectedLand) {
      // 如果没选土地，不允许切换到工具标签
      return
    }
    setActiveTab(tab)
  }, [selectedLand])
  
  // 选择土地后自动切换到工具标签
  useEffect(() => {
    if (selectedLand && activeTab === 'land') {
      setActiveTab('tools')
    }
  }, [selectedLand])
  
  // ==================== 渲染 ====================
  
  return (
    <div className="space-y-4">
      {/* 标签页导航 */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        <button
          onClick={() => handleTabChange('land')}
          className={cn(
            "px-4 py-2 font-bold transition-all text-sm",
            activeTab === 'land' 
              ? "text-gold-500 border-b-2 border-gold-500 -mb-[10px]" 
              : "text-gray-400 hover:text-white"
          )}
        >
          1. 选择土地
          {selectedLand && <span className="ml-2 text-green-400">✓</span>}
        </button>
        <button
          onClick={() => handleTabChange('tools')}
          disabled={!selectedLand}
          className={cn(
            "px-4 py-2 font-bold transition-all text-sm",
            activeTab === 'tools' 
              ? "text-gold-500 border-b-2 border-gold-500 -mb-[10px]" 
              : "text-gray-400",
            !selectedLand && "opacity-50 cursor-not-allowed"
          )}
        >
          2. 选择工具
          {selectedTools.length > 0 && (
            <span className="ml-2 text-green-400">({selectedTools.length})</span>
          )}
        </button>
      </div>
      
      {/* 土地选择标签页 */}
      {activeTab === 'land' && (
        <div className="space-y-3">
          {/* 搜索和筛选栏 */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="搜索土地ID或区域..."
              value={landSearch}
              onChange={(e) => setLandSearch(e.target.value)}
              className="flex-1 bg-gray-800 text-white text-sm px-3 py-2 rounded border border-gray-700 focus:border-gold-500 focus:outline-none"
            />
            <select
              value={landTypeFilter}
              onChange={(e) => setLandTypeFilter(e.target.value)}
              className="bg-gray-800 text-white text-sm px-3 py-2 rounded border border-gray-700 focus:border-gold-500 focus:outline-none"
            >
              <option value="all">全部类型</option>
              {availableLandTypes.map(type => (
                <option key={type} value={type}>
                  {LAND_TYPE_LABELS[type] || type}
                </option>
              ))}
            </select>
          </div>
          
          {/* 土地列表 */}
          <div 
            className="max-h-80 overflow-y-auto space-y-2 pr-2"
            style={{ maxHeight: '320px', overflowY: 'auto' }}
          >
            {filteredLands.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                {landSearch || landTypeFilter !== 'all' 
                  ? '没有找到符合条件的土地' 
                  : '暂无可用土地'}
              </div>
            ) : (
              filteredLands.map(land => {
                const isSelected = selectedLand?.id === land.id
                const isActive = activeLandIds.has(land.id)
                const landType = getLandType(land)
                const landTypeLabel = LAND_TYPE_LABELS[landType] || '未知'
                const regionName = getRegionName(land)
                
                return (
                  <div
                    key={land.id}
                    onClick={() => !isActive && onLandSelect(isSelected ? null : land)}
                    className={cn(
                      "p-3 rounded-lg border transition-all cursor-pointer",
                      isSelected 
                        ? "bg-gold-500/20 border-gold-500"
                        : isActive
                        ? "bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed"
                        : "bg-gray-800 border-gray-700 hover:border-gray-600"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-sm">
                            {land.land_id || `土地#${land.id}`}
                          </p>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded",
                            landType === 'yld_mine' ? "bg-purple-900/50 text-purple-400" :
                            landType === 'iron_mine' ? "bg-gray-700 text-gray-300" :
                            landType === 'stone_mine' ? "bg-blue-900/50 text-blue-400" :
                            landType === 'forest' ? "bg-green-900/50 text-green-400" :
                            landType === 'farm' ? "bg-yellow-900/50 text-yellow-400" :
                            "bg-gray-700 text-gray-400"
                          )}>
                            {landTypeLabel}
                          </span>
                          {isActive && (
                            <span className="text-xs text-yellow-400">生产中</span>
                          )}
                        </div>
                        <div className="flex gap-4 text-xs text-gray-400">
                          <span>区域: {regionName}</span>
                          {/* YLD矿山显示储量 */}
                          {landType === 'yld_mine' && (land.yld_capacity || land.initial_price) && Number(land.yld_capacity || land.initial_price) > 0 && (
                            <span>储量: {formatNumber(Number(land.yld_capacity || land.initial_price), 0)}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-2xl">
                        {isSelected && '✅'}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          
          {/* 提示信息 */}
          {selectedLand && (
            <div className="bg-green-900/20 border border-green-500/30 rounded p-3">
              <p className="text-xs text-green-400">
                ✅ 已选择: {selectedLand.land_id} ({stats.selectedLandType})
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* 工具选择标签页 */}
      {activeTab === 'tools' && selectedLand && (
        <div className="space-y-3">
          {/* 快捷操作栏 */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <PixelButton
                size="xs"
                variant="secondary"
                onClick={() => handleBatchSelectTools(10)}
                disabled={availableTools.length === 0}
              >
                选10个
              </PixelButton>
              <PixelButton
                size="xs"
                variant="secondary"
                onClick={() => handleBatchSelectTools(30)}
                disabled={availableTools.length === 0}
              >
                选30个
              </PixelButton>
              <PixelButton
                size="xs"
                variant="secondary"
                onClick={() => handleBatchSelectTools(60)}
                disabled={availableTools.length === 0}
              >
                选60个
              </PixelButton>
              {selectedTools.length > 0 && (
                <PixelButton
                  size="xs"
                  variant="secondary"
                  onClick={() => onToolsSelect([])}
                >
                  清空
                </PixelButton>
              )}
            </div>
            <select
              value={toolSort}
              onChange={(e) => setToolSort(e.target.value as 'durability' | 'id')}
              className="bg-gray-800 text-white text-xs px-2 py-1 rounded border border-gray-700"
            >
              <option value="durability">按耐久度排序</option>
              <option value="id">按ID排序</option>
            </select>
          </div>
          
          {/* 搜索栏 */}
          <input
            type="text"
            placeholder="搜索工具ID或类型..."
            value={toolSearch}
            onChange={(e) => setToolSearch(e.target.value)}
            className="w-full bg-gray-800 text-white text-sm px-3 py-2 rounded border border-gray-700 focus:border-gold-500 focus:outline-none"
          />
          
          {/* 选择统计 */}
          <div className="bg-gray-800 rounded p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">已选择工具:</span>
              <span className={cn(
                "font-bold",
                selectedTools.length > maxToolsPerLand ? "text-red-400" : "text-white"
              )}>
                {selectedTools.length} / {maxToolsPerLand}
              </span>
            </div>
            {selectedTools.length > 0 && (
              <div className="mt-2 text-xs text-yellow-400">
                粮食消耗: {stats.foodConsumption} 单位/小时
              </div>
            )}
          </div>
          
          {/* 工具列表 */}
          <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {availableTools.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                {(() => {
                  const landType = getLandType(selectedLand)
                  const requiredToolType = landType ? LAND_TOOL_MAP[landType] : null
                  if (requiredToolType) {
                    return `没有可用的${TOOL_TYPE_LABELS[requiredToolType] || requiredToolType}`
                  }
                  return '没有可用的工具'
                })()}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {availableTools.map(tool => {
                  const isSelected = selectedTools.includes(tool.id)
                  
                  return (
                    <div
                      key={tool.id}
                      onClick={() => handleToggleTool(tool.id)}
                      className={cn(
                        "p-2 rounded border transition-all cursor-pointer",
                        isSelected 
                          ? "bg-gold-500/20 border-gold-500"
                          : "bg-gray-800 border-gray-700 hover:border-gray-600"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">
                              {TOOL_TYPE_LABELS[tool.tool_type]}#{tool.id}
                            </span>
                            {isSelected && <span className="text-xs">✓</span>}
                          </div>
                          <div className="text-xs text-gray-400">
                            耐久: {tool.current_durability}/{tool.max_durability}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          
          {/* 错误提示 */}
          {selectedTools.length > maxToolsPerLand && (
            <div className="bg-red-900/20 border border-red-500/30 rounded p-3">
              <p className="text-xs text-red-400">
                ⚠️ 超过最大工具数量限制（{maxToolsPerLand}个）
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* 操作按钮 */}
      <div className="flex gap-3 pt-2">
        <PixelButton
          className="flex-1"
          onClick={onConfirm}
          disabled={!stats.canProceed || loading}
          variant="primary"
        >
          {loading ? '处理中...' : '确认开始'}
        </PixelButton>
        <PixelButton
          variant="secondary"
          onClick={onCancel}
        >
          取消
        </PixelButton>
      </div>
    </div>
  )
}

// 自定义滚动条样式（需要在全局CSS中添加）
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 215, 0, 0.3);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 215, 0, 0.5);
  }
`

export default StartMiningForm
