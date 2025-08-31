// src/app/mining/LandSelector.tsx
// 土地选择器组件 - 完整生产级版本
// 
// 文件说明：
// 本组件负责提供土地选择功能，只显示可用于挖矿的土地
// 从 MiningSessions.tsx 中的 LandSelectorV2 组件拆分出来
// 
// 创建原因：
// - 土地选择是独立的功能模块，应该单独组件化
// - 需要复杂的筛选逻辑（土地类型、生产状态等）
// - 便于复用和测试
// 
// 功能特性：
// 1. 筛选可挖矿的土地类型
// 2. 排除正在生产的土地
// 3. 按土地类型分组显示
// 4. 显示土地详细信息
// 5. 支持错误提示
// 
// 使用方式：
// <LandSelector
//   lands={userLands}
//   selectedLand={selectedLand}
//   onSelect={setSelectedLand}
//   activeSessions={activeSessions}
//   disabled={loading}
// />
// 
// 关联文件：
// - 被 StartMiningForm.tsx 使用（开始挖矿表单）
// - 使用 miningConstants.ts 中的土地类型定义
// - 使用 @/types/assets 中的 Land 类型

'use client'

import React, { useMemo, memo, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { Land } from '@/types/assets'
import { 
  isMinableLandType, 
  getLandTypeDisplayName, 
  getLandResourceType,
  LAND_TYPE_MAP,
  LAND_RESOURCE_MAP,
  MINABLE_LAND_TYPES
} from './miningConstants'

interface LandSelectorProps {
  lands: Land[]                                  // 土地列表
  selectedLand: Land | null                      // 选中的土地
  onSelect: (land: Land | null) => void         // 选择回调
  error?: string                                 // 错误信息
  showError?: boolean                            // 是否显示错误
  disabled?: boolean                             // 是否禁用
  className?: string                             // 自定义样式
  activeSessions?: any[]                         // 活跃的挖矿会话（新增）
  debug?: boolean                                // 是否显示调试信息
}

/**
 * 土地选择器组件
 * 提供土地选择下拉框，只显示可用于挖矿的土地
 */
export const LandSelector = memo(({
  lands,
  selectedLand,
  onSelect,
  error,
  showError = false,
  disabled = false,
  className,
  activeSessions = [],
  debug = false
}: LandSelectorProps) => {
  
  // 调试日志
  useEffect(() => {
    if (debug) {
      console.log('[LandSelector] Props:', {
        landsCount: lands.length,
        selectedLand: selectedLand?.land_id,
        activeSessionsCount: activeSessions.length,
        disabled
      })
    }
  }, [lands, selectedLand, activeSessions, disabled, debug])
  
  // 获取正在使用的土地ID列表
  const activeLandIds = useMemo(() => {
    const ids = new Set<number>()
    activeSessions.forEach(session => {
      // 兼容不同的数据结构
      const landId = session.land_id || session.land?.id || session.landId
      if (landId) {
        ids.add(typeof landId === 'string' ? parseInt(landId) : landId)
      }
    })
    
    if (debug) {
      console.log('[LandSelector] 活跃土地IDs:', Array.from(ids))
    }
    
    return ids
  }, [activeSessions, debug])
  
  // 筛选可挖矿的土地
  const minableLands = useMemo(() => {
    const filtered = lands.filter(land => {
      // 获取土地类型
      const landType = land.blueprint?.land_type || land.land_type || ''
      
      // 检查是否是可挖矿类型
      const isMinable = isMinableLandType(landType)
      
      if (!isMinable) {
        if (debug) {
          console.log(`[LandSelector] 土地 ${land.land_id} 不可挖矿，类型: ${landType}`)
        }
        return false
      }
      
      // 检查是否正在生产（后端字段）
      const isProducing = land.is_producing === true
      
      // 检查是否在活跃会话中（前端数据）
      const isInActiveSession = activeLandIds.has(land.id)
      
      // 检查是否正在招募
      const isRecruiting = land.is_recruiting === true
      
      // 综合判断是否可用
      const isAvailable = !isProducing && !isInActiveSession && !isRecruiting
      
      if (debug && !isAvailable) {
        console.log(`[LandSelector] 土地 ${land.land_id} 不可用:`, {
          is_producing: isProducing,
          is_in_session: isInActiveSession,
          is_recruiting: isRecruiting,
          land_id: land.id
        })
      }
      
      return isAvailable
    })
    
    // 排序：YLD矿山优先，然后按类型和ID排序
    const sorted = filtered.sort((a, b) => {
      const aType = a.blueprint?.land_type || a.land_type || ''
      const bType = b.blueprint?.land_type || b.land_type || ''
      
      // YLD矿山优先
      if (aType === 'yld_mine' && bType !== 'yld_mine') return -1
      if (bType === 'yld_mine' && aType !== 'yld_mine') return 1
      
      // 按类型排序
      if (aType !== bType) {
        return aType.localeCompare(bType)
      }
      
      // 同类型按ID排序
      return (a.land_id || '').localeCompare(b.land_id || '')
    })
    
    if (debug) {
      console.log('[LandSelector] 筛选结果:', {
        总土地数: lands.length,
        可挖矿土地数: sorted.length,
        土地列表: sorted.map(l => ({
          id: l.id,
          land_id: l.land_id,
          type: l.blueprint?.land_type,
          is_producing: l.is_producing
        }))
      })
    }
    
    return sorted
  }, [lands, activeLandIds, debug])
  
  // 将土地按类型分组
  const groupedLands = useMemo(() => {
    const groups: { [key: string]: Land[] } = {}
    
    minableLands.forEach(land => {
      const landType = land.blueprint?.land_type || land.land_type || 'unknown'
      if (!groups[landType]) {
        groups[landType] = []
      }
      groups[landType].push(land)
    })
    
    // 按特定顺序返回
    const orderedGroups: { [key: string]: Land[] } = {}
    const typeOrder = ['yld_mine', 'iron_mine', 'stone_mine', 'forest', 'farm']
    
    typeOrder.forEach(type => {
      if (groups[type]) {
        orderedGroups[type] = groups[type]
      }
    })
    
    // 添加其他未列出的类型
    Object.keys(groups).forEach(type => {
      if (!orderedGroups[type]) {
        orderedGroups[type] = groups[type]
      }
    })
    
    return orderedGroups
  }, [minableLands])
  
  // 处理选择变化
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const landId = e.target.value
    
    if (landId === '') {
      onSelect(null)
      if (debug) {
        console.log('[LandSelector] 清除选择')
      }
    } else {
      const land = minableLands.find(l => l.id.toString() === landId)
      if (land) {
        onSelect(land)
        if (debug) {
          console.log('[LandSelector] 选中土地:', {
            id: land.id,
            land_id: land.land_id,
            type: land.blueprint?.land_type,
            is_producing: land.is_producing,
            resource_reserves: land.resource_reserves
          })
        }
      }
    }
  }
  
  // 获取土地的显示文本
  const getLandDisplayText = (land: Land) => {
    const landType = land.blueprint?.land_type || land.land_type || ''
    const typeName = LAND_TYPE_MAP[landType] || '未知类型'
    const resourceType = LAND_RESOURCE_MAP[landType] || ''
    
    // 坐标信息
    const coordinates = land.coordinate_x !== undefined && land.coordinate_y !== undefined 
      ? ` (${land.coordinate_x}, ${land.coordinate_y})`
      : ''
    
    // 储量信息（如果有）
    let reservesInfo = ''
    if (land.resource_reserves !== undefined && land.resource_reserves !== null) {
      const reserves = parseFloat(land.resource_reserves.toString())
      if (reserves > 0) {
        reservesInfo = ` [储量: ${reserves.toFixed(0)}]`
      } else {
        reservesInfo = ' [储量耗尽]'
      }
    }
    
    // 特殊标记
    const specialMark = land.is_special ? ' ⭐' : ''
    
    return `${land.land_id} - ${typeName}${resourceType ? `[${resourceType}]` : ''}${coordinates}${reservesInfo}${specialMark}`
  }
  
  // 获取土地组的显示名称
  const getGroupDisplayName = (landType: string) => {
    const displayName = LAND_TYPE_MAP[landType] || '其他'
    const resourceType = LAND_RESOURCE_MAP[landType]
    return resourceType ? `${displayName} (产出${resourceType})` : displayName
  }
  
  // 检查是否没有任何土地
  const hasNoLands = lands.length === 0
  
  // 检查是否所有土地都在生产中
  const allLandsProducing = lands.length > 0 && minableLands.length === 0
  
  return (
    <div className={className}>
      <select
        value={selectedLand?.id || ''}
        onChange={handleChange}
        disabled={disabled || minableLands.length === 0}
        className={cn(
          "w-full px-3 py-2 bg-gray-800 border rounded text-white",
          "focus:outline-none focus:ring-2 focus:ring-gold-500",
          "transition-colors duration-200",
          showError && error ? "border-red-500" : "border-gray-600",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && minableLands.length > 0 && "hover:border-gray-500"
        )}
      >
        <option value="">
          {hasNoLands 
            ? '暂无土地' 
            : allLandsProducing
            ? `没有可用土地（${lands.length}个土地都在生产中）`
            : '请选择土地'
          }
        </option>
        
        {/* 分组显示土地 */}
        {Object.entries(groupedLands).map(([landType, landList]) => (
          <optgroup 
            key={landType} 
            label={`${getGroupDisplayName(landType)} (${landList.length}个)`}
          >
            {landList.map(land => (
              <option key={land.id} value={land.id}>
                {getLandDisplayText(land)}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      
      {/* 错误提示 */}
      {showError && error && (
        <p className="text-xs text-red-400 mt-1 flex items-center gap-1 animate-pulse">
          <span>❌</span>
          <span>{error}</span>
        </p>
      )}
      
      {/* 选中土地的详细信息 */}
      {selectedLand && (
        <div className="mt-2 p-3 bg-gray-800/50 rounded border border-gray-700">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-400">土地编号：</span>
              <span className="text-white font-medium">{selectedLand.land_id}</span>
            </div>
            <div>
              <span className="text-gray-400">类型：</span>
              <span className="text-white font-medium">
                {LAND_TYPE_MAP[selectedLand.blueprint?.land_type || ''] || '未知'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">产出资源：</span>
              <span className="text-yellow-400 font-medium">
                {LAND_RESOURCE_MAP[selectedLand.blueprint?.land_type || ''] || '未知'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">坐标：</span>
              <span className="text-white">
                ({selectedLand.coordinate_x || 0}, {selectedLand.coordinate_y || 0})
              </span>
            </div>
            
            {/* 面积信息 */}
            {selectedLand.blueprint?.size_sqm && (
              <div>
                <span className="text-gray-400">面积：</span>
                <span className="text-white">
                  {selectedLand.blueprint.size_sqm} 平方米
                </span>
              </div>
            )}
            
            {/* 储量信息 */}
            {selectedLand.resource_reserves !== undefined && selectedLand.resource_reserves !== null && (
              <div>
                <span className="text-gray-400">储量：</span>
                <span className={cn(
                  "font-medium",
                  parseFloat(selectedLand.resource_reserves.toString()) > 0 
                    ? "text-green-400" 
                    : "text-red-400"
                )}>
                  {parseFloat(selectedLand.resource_reserves.toString()) > 0 
                    ? `${parseFloat(selectedLand.resource_reserves.toString()).toFixed(2)} 单位`
                    : '已耗尽'
                  }
                </span>
              </div>
            )}
            
            {/* 特殊标记 */}
            {selectedLand.is_special && (
              <div className="col-span-2">
                <span className="text-purple-400">⭐ 特殊地块</span>
              </div>
            )}
            
            {/* 所有者信息（如果有） */}
            {selectedLand.owner_name && (
              <div className="col-span-2">
                <span className="text-gray-400">所有者：</span>
                <span className="text-white ml-1">{selectedLand.owner_name}</span>
              </div>
            )}
          </div>
          
          {/* 土地描述（如果有） */}
          {selectedLand.description && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <p className="text-xs text-gray-400">{selectedLand.description}</p>
            </div>
          )}
        </div>
      )}
      
      {/* 没有可用土地的提示 */}
      {allLandsProducing && (
        <div className="mt-2 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded">
          <div className="flex items-start gap-2">
            <span className="text-yellow-400">⚠️</span>
            <div className="text-xs">
              <p className="text-yellow-400 font-medium">所有土地都在生产中</p>
              <p className="text-gray-400 mt-1">
                请等待现有挖矿会话结束，或购买新的土地
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* 调试信息（仅在debug模式显示） */}
      {debug && (
        <div className="mt-2 p-2 bg-gray-900 rounded text-xs text-gray-500 font-mono">
          <p className="font-bold text-gray-400 mb-1">🔧 调试信息</p>
          <div className="space-y-0.5">
            <p>总土地数: {lands.length}</p>
            <p>可挖矿土地数: {minableLands.length}</p>
            <p>活跃会话数: {activeSessions.length}</p>
            <p>活跃土地ID: {Array.from(activeLandIds).join(', ') || '无'}</p>
            {selectedLand && (
              <>
                <p className="mt-1 pt-1 border-t border-gray-800">选中土地:</p>
                <p>  ID: {selectedLand.id}</p>
                <p>  land_id: {selectedLand.land_id}</p>
                <p>  类型: {selectedLand.blueprint?.land_type || 'unknown'}</p>
                <p>  is_producing: {String(selectedLand.is_producing)}</p>
                <p>  is_recruiting: {String(selectedLand.is_recruiting)}</p>
                <p>  resource_reserves: {selectedLand.resource_reserves?.toString() || 'null'}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
})

LandSelector.displayName = 'LandSelector'

export default LandSelector
