/**
 * ===========================================
 * 文件创建/修改说明
 * ===========================================
 * 创建原因: 简化挖矿流程，减少操作步骤
 * 主要功能: 快速选择工具并开始挖矿
 * 依赖关系: 
 * - 被 YLDMineList.tsx 调用
 * - 使用 @/hooks/useProduction
 * 
 * 主要逻辑流程:
 * 1. 接收选中的土地信息
 * 2. 根据土地类型筛选对应工具
 * 3. 快速选择并开始挖矿
 * 
 * ⚠️ 重要提醒
 * - 这是优化用户体验的核心组件
 * - 保持简洁，避免增加复杂度
 * - 确保一键操作的流畅性
 * - 不同土地类型需要不同的工具类型
 * 
 * 创建时间: 2025-01-30
 * 更新时间: 2025-01-30 - 添加工具类型筛选
 * ===========================================
 */

// src/app/mining/QuickStartMining.tsx
// 快速开始挖矿组件 - 简化操作流程

'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { PixelButton } from '@/components/shared/PixelButton'
import { cn } from '@/lib/utils'
import type { Tool } from '@/types/production'
import type { MineLand, YLDMine } from '@/types/assets'
import toast from 'react-hot-toast'
import { ERROR_TYPES } from './miningConstants'
import { getResourceIcon, RESOURCE_TYPES } from '@/utils/resourceTool'

interface QuickStartMiningProps {
  foodHours: number; //粮食剩余
  mine: MineLand | YLDMine | any  // 选中的矿山
  tools: Tool[] | null  // 可用工具列表
  onConfirm: (landId: number, toolIds: number[]) => Promise<void>
  onCancel: () => void
  loading?: boolean
  userLevel?: number
}

// 等级限制
const LEVEL_TOOL_LIMITS: Record<number, number> = {
  1: 10, 2: 20, 3: 30, 4: 40, 5: 50, 6: 60, 7: 70
}

export function QuickStartMining({
  foodHours,
  mine,
  tools,
  onConfirm,
  onCancel,
  loading = false,
  userLevel = 6
}: QuickStartMiningProps) {
  const [selectedCount, setSelectedCount] = useState(10)  // 默认选择10个
  const [isConfirming, setIsConfirming] = useState(false)

  // 最大工具数
  const maxTools = LEVEL_TOOL_LIMITS[userLevel] || 60;

  // 计算资源消耗
  const foodConsumption = selectedCount * 2  // 每个工具2粮食/小时

  // 获取矿山类型对应的工具类型
  const getRequiredToolType = (mine: any): string => {
    const mineType = mine.land_type || mine.mine_type || 'yld_mine'

    // 根据矿山类型返回对应的工具类型
    switch (mineType) {
      case 'forest':
        return 'axe'  // 森林使用斧头
      case 'farm':
        return 'hoe'  // 农场使用锄头
      case 'yld_mine':
      case 'yld_converted':
      case 'iron_mine':
      case 'stone_mine':
        return 'pickaxe'  // 矿山使用镐
      default:
        return 'pickaxe'  // 默认使用镐
    }
  }

  // 筛选可用工具（只选择对应类型的工具）
  const availableTools = useMemo(() => {
    if (!tools || !mine) return []

    const requiredToolType = getRequiredToolType(mine)

    return tools.filter(tool =>
      tool.tool_type === requiredToolType &&  // 只选择对应类型的工具
      tool.status === 'normal' &&
      !tool.is_in_use &&
      tool.current_durability > 0
    ).sort((a, b) => (b.current_durability || 0) - (a.current_durability || 0))
  }, [tools, mine])

  // 快速选择预设
  const quickSelectOptions = useMemo(() => {
    const options = []
    if (availableTools.length >= 10) options.push(10)
    if (availableTools.length >= 30 && maxTools >= 30) options.push(30)
    if (availableTools.length >= 60 && maxTools >= 60) options.push(60)
    if (availableTools.length > 0 && !options.includes(availableTools.length)) {
      options.push(availableTools.length)
    }
    return options
  }, [availableTools.length, maxTools])

  // 自动调整选择数量
  useEffect(() => {
    if (selectedCount > availableTools.length) {
      setSelectedCount(Math.min(10, availableTools.length))
    }
  }, [availableTools.length, selectedCount])

  // 处理确认
  const handleConfirm = async () => {
    if (!mine || availableTools.length === 0) {
      toast.error('无法开始挖矿')
      return
    }

    // 粮食不足
    if (foodHours < foodConsumption) {
      toast.error(ERROR_TYPES.INSUFFICIENT_FOOD)
      return
    }

    setIsConfirming(true)

    try {
      // 选择工具
      const selectedTools = availableTools
        .slice(0, selectedCount)
        .map(tool => tool.id)

      // 开始挖矿
      await onConfirm(mine.id, selectedTools)

      toast.success(`已在 ${mine.land_id} 开始挖矿！`, {
        icon: '⛏️',
        duration: 3000
      })

      onCancel()  // 关闭窗口
    } catch (error: any) {
      console.error('开始挖矿失败:', error)
      toast.error(error.message || '开始挖矿失败')
    } finally {
      setIsConfirming(false)
    }
  }

  // 获取工具类型名称
  const getToolTypeName = (toolType: string): string => {
    switch (toolType) {
      case 'axe':
        return '斧头'
      case 'hoe':
        return '锄头'
      case 'pickaxe':
        return '镐'
      default:
        return '工具'
    }
  }

  // 获取矿山类型显示
  const getMineTypeDisplay = () => {
    const mineType = mine.land_type || mine.mine_type || 'yld_mine'

    // 直接根据实际的 land_type 判断
    switch (mineType) {
      case 'yld_mine':
        return { icon: RESOURCE_TYPES.METEORITE, name: 'YLD矿山', color: 'text-purple-400' }
      case 'yld_converted':
        return { icon: RESOURCE_TYPES.METEORITE, name: 'YLD转换矿山', color: 'text-purple-400' }
      case 'iron_mine':
        return { icon: RESOURCE_TYPES.PICKAXE, name: '铁矿山', color: 'text-gray-400' }
      case 'stone_mine':
        return { icon: RESOURCE_TYPES.PICKAXE, name: '石矿山', color: 'text-blue-400' }
      case 'forest':
        return { icon: RESOURCE_TYPES.WOOD, name: '森林', color: 'text-green-400' }
      case 'farm':
        return { icon: RESOURCE_TYPES.GRAIN, name: '农场', color: 'text-yellow-400' }
      default:
        // 对于 special_type 的处理
        if (mine.special_type === 'yld_converted') {
          return { icon: RESOURCE_TYPES.METEORITE, name: 'YLD转换矿山', color: 'text-purple-400' }
        }
        return { icon: RESOURCE_TYPES.PICKAXE, name: '矿山', color: 'text-gray-400' }
    }
  }

  const mineType = getMineTypeDisplay()

  return (
    <div className="space-y-4">
      {/* 矿山信息 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{getResourceIcon(mineType.icon, {
            iconSize: 44,
            haveBackgroundWarper: true,
          })}</span>
          <div>
            <h3 className="font-bold text-white">{mine.land_id}</h3>
            <p className={cn("text-sm", mineType.color)}>{mineType.name}</p>
          </div>
        </div>
        {mine.region_name && (
          <p className="text-xs text-gray-400">📍 {mine.region_name}</p>
        )}
      </div>

      {/* 工具选择 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-gray-300">
            选择{getToolTypeName(getRequiredToolType(mine))}数量
          </label>
          <span className="text-xs text-gray-400">
            可用: {availableTools.length} / 最多: {maxTools}
          </span>
        </div>

        {/* 快速选择按钮 */}
        <div className="grid grid-cols-3 gap-2">
          {quickSelectOptions.map(count => (
            <button
              key={count}
              onClick={() => setSelectedCount(count)}
              className={cn(
                "py-2 rounded-lg text-sm font-bold transition-all",
                selectedCount === count
                  ? "bg-gold-500 text-gray-900"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              )}
            >
              {count === availableTools.length ? `全部(${count})` : `${count}个`}
            </button>
          ))}
        </div>

        {/* 自定义数量滑块 */}
        <div className="space-y-2">
          <input
            type="range"
            min="1"
            max={Math.min(availableTools.length, maxTools)}
            value={selectedCount}
            onChange={(e) => setSelectedCount(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1</span>
            <span className="font-bold text-white">{selectedCount}</span>
            <span>{Math.min(availableTools.length, maxTools)}</span>
          </div>
        </div>

        {/* 消耗提示 */}
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center text-sm text-yellow-400">
              {getResourceIcon(RESOURCE_TYPES.GRAIN, {
                iconSize: 20
              })} 粮食消耗
            </span>
            <span className="text-sm font-bold text-yellow-400">
              {foodConsumption} / 小时
            </span>
          </div>
        </div>
      </div>

      {/* 工具不足提示 */}
      {availableTools.length === 0 && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
          <p className="text-sm text-red-400">
            ❌ 没有可用的{getToolTypeName(getRequiredToolType(mine))}，请先合成{getToolTypeName(getRequiredToolType(mine))}
          </p>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <PixelButton
          className="flex-1"
          onClick={handleConfirm}
          disabled={loading || isConfirming || availableTools.length === 0}
        >
          {isConfirming ? '启动中...' : availableTools.length === 0 ?
            `需要${getToolTypeName(getRequiredToolType(mine))}` :
            `开始挖矿 (${selectedCount}个${getToolTypeName(getRequiredToolType(mine))})`}
        </PixelButton>
        <PixelButton
          variant="secondary"
          onClick={onCancel}
          disabled={loading || isConfirming}
        >
          取消
        </PixelButton>
      </div>
    </div>
  )
}

export default QuickStartMining
