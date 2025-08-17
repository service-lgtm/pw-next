// src/app/mining/LandSelector.tsx
// 土地选择器组件 - 完整生产版（支持所有土地类型）
// 
// 文件说明：
// 这是挖矿系统中的土地选择器组件，支持所有类型的可挖矿土地
// 从 MiningSessions.tsx (2000+行) 重构拆分出来的独立组件
// 
// 创建原因：
// - 解决 React error #130 (组件返回 undefined 的问题)
// - 原 MiningSessions.tsx 文件过大，需要拆分以提高可维护性
// - 提供独立的土地选择功能，支持所有土地类型的挖矿
// 
// 数据源：
// - userLands: 来自 useUserLands Hook
// - 接口: /production/lands/available/
// - 包含用户所有土地（不仅限于YLD矿山）
// 
// 支持的可挖矿土地类型：
// - yld_mine: YLD矿山（产出YLD）
// - iron_mine: 铁矿山（产出铁矿）
// - stone_mine: 石矿山（产出石头）
// - forest: 森林（产出木材）
// - farm: 农场（产出粮食）
// 
// 不可挖矿的土地类型：
// - urban: 城市用地
// - residential: 住宅用地
// - commercial: 商业用地
// 
// 主要功能：
// 1. 下拉框展示所有土地，分组显示（可挖矿/不可挖矿）
// 2. 自动识别土地类型和产出资源
// 3. 视觉标识（绿色=可挖矿，红色=不可挖矿）
// 4. 显示土地统计信息
// 5. 支持错误提示
// 6. 响应式设计
// 
// 关联文件：
// - 被调用: ./MiningSessions.tsx (在开始挖矿模态框中使用)
// - 被调用: ./StartMiningForm.tsx (如果该文件独立存在)
// - 类型定义: @/types/assets (Land 类型)
// - 工具函数: @/lib/utils (cn 函数)
// 
// 更新历史：
// - 2025-01: 创建文件，从 MiningSessions.tsx 拆分
// - 2025-01: 修复 React error #130
// - 2025-01: 添加分组显示功能
// - 2025-01: 支持所有土地类型，不限于YLD矿山

'use client'

import React, { useState, useRef, useEffect, memo, useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { Land } from '@/types/assets'

interface LandSelectorProps {
  lands: Land[]
  selectedLand: Land | null
  onSelect: (land: Land | null) => void
  disabled?: boolean
  error?: string
  showError?: boolean
  className?: string
}

// 土地类型配置
const LAND_TYPE_CONFIG = {
  // 可挖矿的土地类型
  mineable: {
    'yld_mine': { 
      name: 'YLD矿山', 
      resource: 'YLD', 
      icon: '💎', 
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20'
    },
    'iron_mine': { 
      name: '铁矿山', 
      resource: '铁矿', 
      icon: '⚙️', 
      color: 'text-gray-400',
      bgColor: 'bg-gray-900/20'
    },
    'stone_mine': { 
      name: '石矿山', 
      resource: '石头', 
      icon: '🪨', 
      color: 'text-stone-400',
      bgColor: 'bg-stone-900/20'
    },
    'forest': { 
      name: '森林', 
      resource: '木材', 
      icon: '🌲', 
      color: 'text-green-400',
      bgColor: 'bg-green-900/20'
    },
    'farm': { 
      name: '农场', 
      resource: '粮食', 
      icon: '🌾', 
      color: 'text-amber-400',
      bgColor: 'bg-amber-900/20'
    },
    'mining': { 
      name: '矿产土地', 
      resource: '矿产', 
      icon: '⛏️', 
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20'
    },
    'special': { 
      name: '特殊土地', 
      resource: '特殊资源', 
      icon: '✨', 
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20'
    }
  },
  // 不可挖矿的土地类型
  nonMineable: {
    'urban': { name: '城市用地', icon: '🏢', reason: '城市用地不支持挖矿' },
    'residential': { name: '住宅用地', icon: '🏘️', reason: '住宅用地不支持挖矿' },
    'commercial': { name: '商业用地', icon: '🏪', reason: '商业用地不支持挖矿' }
  }
}

/**
 * 判断土地是否支持挖矿
 */
const isLandMineable = (land: Land): boolean => {
  const landType = land.blueprint?.land_type || land.land_type || ''
  return Object.keys(LAND_TYPE_CONFIG.mineable).includes(landType.toLowerCase())
}

/**
 * 获取土地类型信息
 */
const getLandTypeInfo = (land: Land) => {
  const landType = (land.blueprint?.land_type || land.land_type || '').toLowerCase()
  
  if (LAND_TYPE_CONFIG.mineable[landType]) {
    return { ...LAND_TYPE_CONFIG.mineable[landType], isMineable: true }
  }
  
  if (LAND_TYPE_CONFIG.nonMineable[landType]) {
    return { ...LAND_TYPE_CONFIG.nonMineable[landType], isMineable: false }
  }
  
  // 默认返回未知类型
  return {
    name: land.blueprint?.land_type_display || land.land_type_display || '未知类型',
    icon: '❓',
    isMineable: false,
    reason: '未知土地类型'
  }
}

/**
 * 土地选择器组件
 */
export const LandSelector = memo(({
  lands,
  selectedLand,
  onSelect,
  disabled = false,
  error = '',
  showError = false,
  className
}: LandSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // 分组土地：可挖矿和不可挖矿
  const { mineableLands, nonMineableLands, stats } = useMemo(() => {
    const mineable: Land[] = []
    const nonMineable: Land[] = []
    
    lands.forEach(land => {
      if (isLandMineable(land)) {
        mineable.push(land)
      } else {
        nonMineable.push(land)
      }
    })
    
    // 对可挖矿土地排序：YLD矿山优先
    mineable.sort((a, b) => {
      const aType = (a.blueprint?.land_type || a.land_type || '').toLowerCase()
      const bType = (b.blueprint?.land_type || b.land_type || '').toLowerCase()
      if (aType === 'yld_mine' && bType !== 'yld_mine') return -1
      if (aType !== 'yld_mine' && bType === 'yld_mine') return 1
      return 0
    })
    
    return {
      mineableLands: mineable,
      nonMineableLands: nonMineable,
      stats: {
        total: lands.length,
        mineable: mineable.length,
        nonMineable: nonMineable.length
      }
    }
  }, [lands])
  
  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen])
  
  const handleSelect = (land: Land | null) => {
    // 只允许选择可挖矿的土地
    if (land && !isLandMineable(land)) {
      return
    }
    onSelect(land)
    setIsOpen(false)
  }
  
  // 确保组件始终返回有效的 React 元素，避免 React error #130
  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* 主按钮 */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full px-3 py-2.5 bg-gray-800/70 border rounded-lg",
          "text-left text-white text-sm",
          "focus:outline-none transition-colors",
          "flex items-center justify-between",
          disabled && "opacity-50 cursor-not-allowed",
          showError && error ? "border-red-500 focus:border-red-400" : "border-gray-600 focus:border-gold-500"
        )}
      >
        <span className={selectedLand ? "text-white" : "text-gray-400"}>
          {selectedLand ? (
            <span className="flex items-center gap-2">
              <span>{getLandTypeInfo(selectedLand).icon}</span>
              <span>{selectedLand.land_id}</span>
              <span className="text-xs text-gray-400">
                {getLandTypeInfo(selectedLand).name}
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>📍</span>
              <span>请选择土地</span>
              <span className="text-xs text-gray-400">
                ({stats.mineable}/{stats.total} 可挖矿)
              </span>
            </span>
          )}
        </span>
        <span className={cn(
          "transition-transform text-gray-400",
          isOpen ? "rotate-180" : ""
        )}>
          ▼
        </span>
      </button>
      
      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {/* 统计信息 */}
          <div className="px-3 py-2 bg-gray-900/50 border-b border-gray-700 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>总土地数: {stats.total}</span>
              <span className="text-green-400">可挖矿: {stats.mineable}</span>
              <span className="text-red-400">不可挖矿: {stats.nonMineable}</span>
            </div>
          </div>
          
          {/* 清空选择 */}
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className={cn(
              "w-full px-3 py-2 text-left text-sm",
              "hover:bg-gray-700 transition-colors",
              "border-b border-gray-700",
              !selectedLand ? "bg-gray-700 text-gold-400" : "text-gray-400"
            )}
          >
            -- 清空选择 --
          </button>
          
          {/* 可挖矿土地组 */}
          {mineableLands.length > 0 && (
            <>
              <div className="px-3 py-1.5 bg-green-900/20 text-xs text-green-400 font-bold border-b border-gray-700">
                ✅ 可挖矿土地 ({mineableLands.length})
              </div>
              {mineableLands.map((land, index) => {
                const typeInfo = getLandTypeInfo(land)
                const isYldMine = (land.blueprint?.land_type || land.land_type || '').toLowerCase() === 'yld_mine'
                
                return (
                  <button
                    key={land.id}
                    type="button"
                    onClick={() => handleSelect(land)}
                    className={cn(
                      "w-full px-3 py-2.5 text-left text-sm",
                      "hover:bg-gray-700 transition-colors",
                      "flex items-center gap-2",
                      selectedLand?.id === land.id ? "bg-gray-700 text-gold-400" : "text-white",
                      index !== mineableLands.length - 1 && "border-b border-gray-700/50"
                    )}
                  >
                    <span className={typeInfo.color}>{typeInfo.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{land.land_id}</span>
                        {isYldMine && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">
                            推荐
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        <span>{typeInfo.name}</span>
                        {typeInfo.resource && (
                          <span className="ml-2">产出: {typeInfo.resource}</span>
                        )}
                        {land.region_name && (
                          <span className="ml-2">区域: {land.region_name}</span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </>
          )}
          
          {/* 不可挖矿土地组 */}
          {nonMineableLands.length > 0 && (
            <>
              <div className="px-3 py-1.5 bg-red-900/20 text-xs text-red-400 font-bold border-b border-gray-700">
                ❌ 不可挖矿土地 ({nonMineableLands.length})
              </div>
              {nonMineableLands.map((land, index) => {
                const typeInfo = getLandTypeInfo(land)
                
                return (
                  <div
                    key={land.id}
                    className={cn(
                      "w-full px-3 py-2.5 text-left text-sm",
                      "opacity-50 cursor-not-allowed",
                      "flex items-center gap-2",
                      "text-gray-500",
                      index !== nonMineableLands.length - 1 && "border-b border-gray-700/50"
                    )}
                  >
                    <span>{typeInfo.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{land.land_id}</div>
                      <div className="text-xs text-gray-600">
                        <span>{typeInfo.name}</span>
                        {typeInfo.reason && (
                          <span className="ml-2 text-red-400">{typeInfo.reason}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </>
          )}
          
          {/* 无土地提示 */}
          {lands.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-gray-400">
              暂无土地
            </div>
          )}
        </div>
      )}
      
      {/* 错误提示 */}
      {showError && error && (
        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
          <span>❌</span>
          <span>{error}</span>
        </p>
      )}
      
      {/* 无可挖矿土地提示 */}
      {mineableLands.length === 0 && lands.length > 0 && (
        <p className="text-xs text-yellow-400 mt-1">
          ⚠️ 您的所有土地都不支持挖矿，请购买矿山类型的土地
        </p>
      )}
    </div>
  )
})

LandSelector.displayName = 'LandSelector'

export default LandSelector
