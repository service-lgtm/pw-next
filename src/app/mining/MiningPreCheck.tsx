// src/app/mining/MiningPreCheck.tsx
// 挖矿预检查组件 - 生产级版本
// 
// 功能说明：
// 1. 开始挖矿前的综合检查
// 2. 检查工具、粮食、YLD限额等条件
// 3. 显示警告和错误信息
// 4. 提供快速解决方案
// 
// 关联文件：
// - 被 @/app/mining/MiningSessions.tsx 使用（挖矿会话组件）
// - 使用 @/hooks/useProduction 中的 useMiningPreCheck Hook
// - 使用 @/components/shared 中的 UI 组件
// - 调用后端 /production/mining/pre-check/ 接口
//
// 更新历史：
// - 2024-12: 创建挖矿预检查组件

'use client'

import { useState, useEffect } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useMiningPreCheck } from '@/hooks/useProduction'
import { cn } from '@/lib/utils'
import { safeFormatYLD, safeFormatResource, safeFormatPercent } from '@/utils/formatters'

interface MiningPreCheckProps {
  onProceed: () => void // 继续操作回调
  onCancel?: () => void // 取消操作回调
  onBuyFood?: () => void // 购买粮食回调
  onSynthesizeTool?: () => void // 合成工具回调
  className?: string
  autoCheck?: boolean // 是否自动检查
}

/**
 * 挖矿预检查组件
 */
export function MiningPreCheck({
  onProceed,
  onCancel,
  onBuyFood,
  onSynthesizeTool,
  className,
  autoCheck = true
}: MiningPreCheckProps) {
  const [hasChecked, setHasChecked] = useState(false)
  
  // 执行预检查
  const { 
    checkResult, 
    loading, 
    error, 
    performCheck 
  } = useMiningPreCheck()
  
  // 自动执行检查
  useEffect(() => {
    if (autoCheck && !hasChecked) {
      performCheck()
      setHasChecked(true)
    }
  }, [autoCheck, hasChecked, performCheck])
  
  // 手动重新检查
  const handleRecheck = () => {
    performCheck()
  }
  
  // 处理继续操作
  const handleProceed = () => {
    if (checkResult?.can_mine) {
      onProceed()
    }
  }
  
  // 如果正在加载
  if (loading && !checkResult) {
    return (
      <PixelCard className={cn("p-4", className)}>
        <div className="text-center">
          <div className="animate-spin text-3xl mb-2">⏳</div>
          <p className="text-sm text-gray-400">正在检查挖矿条件...</p>
        </div>
      </PixelCard>
    )
  }
  
  // 如果有错误
  if (error && !checkResult) {
    return (
      <PixelCard className={cn("p-4", className)}>
        <div className="text-center">
          <span className="text-3xl block mb-2">❌</span>
          <p className="text-sm text-red-400 mb-3">检查失败: {error}</p>
          <PixelButton size="sm" onClick={handleRecheck}>
            重新检查
          </PixelButton>
        </div>
      </PixelCard>
    )
  }
  
  // 如果没有数据
  if (!checkResult) {
    return null
  }
  
  // 计算状态
  const hasErrors = checkResult.errors && checkResult.errors.length > 0
  const hasWarnings = checkResult.warnings && checkResult.warnings.length > 0
  const canMine = checkResult.can_mine && !hasErrors
  
  return (
    <PixelCard className={cn("p-4", className)}>
      <div className="space-y-4">
        {/* 标题 */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">挖矿条件检查</h3>
          <button
            onClick={handleRecheck}
            disabled={loading}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title="重新检查"
          >
            <span className={cn("text-lg", loading && "animate-spin")}>🔄</span>
          </button>
        </div>
        
        {/* 检查结果汇总 */}
        <div className={cn(
          "p-3 rounded-lg border",
          canMine ? "bg-green-900/20 border-green-500/30" :
          hasErrors ? "bg-red-900/20 border-red-500/30" :
          "bg-yellow-900/20 border-yellow-500/30"
        )}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {canMine ? '✅' : hasErrors ? '❌' : '⚠️'}
            </span>
            <div className="flex-1">
              <p className={cn(
                "font-bold",
                canMine ? "text-green-400" :
                hasErrors ? "text-red-400" :
                "text-yellow-400"
              )}>
                {canMine ? '可以开始挖矿' :
                 hasErrors ? '无法开始挖矿' :
                 '可以挖矿，但有警告'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {canMine ? '所有条件已满足' :
                 hasErrors ? '请先解决以下问题' :
                 '建议先处理警告信息'}
              </p>
            </div>
          </div>
        </div>
        
        {/* 资源状态 */}
        <div className="grid grid-cols-2 gap-3">
          {/* 工具状态 */}
          <div className="bg-gray-800 rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">可用工具</span>
              <span className="text-xs">🔧</span>
            </div>
            <p className={cn(
              "text-lg font-bold",
              checkResult.idle_tools > 0 ? "text-green-400" : "text-red-400"
            )}>
              {checkResult.idle_tools} 个
            </p>
            {checkResult.idle_tools === 0 && (
              <p className="text-xs text-red-400 mt-1">需要闲置工具</p>
            )}
          </div>
          
          {/* 粮食状态 */}
          <div className="bg-gray-800 rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">粮食储备</span>
              <span className="text-xs">🌾</span>
            </div>
            <p className={cn(
              "text-lg font-bold",
              checkResult.food_amount >= 10 ? "text-green-400" :
              checkResult.food_amount > 0 ? "text-yellow-400" :
              "text-red-400"
            )}>
              {safeFormatResource(checkResult.food_amount, 0)} 单位
            </p>
            {checkResult.food_amount < 10 && (
              <p className="text-xs text-yellow-400 mt-1">
                {checkResult.food_amount === 0 ? '需要粮食' : '储备较低'}
              </p>
            )}
          </div>
        </div>
        
        {/* YLD状态 */}
        {checkResult.yld_status && (
          <div className="bg-purple-900/20 rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">YLD今日剩余</span>
              <span className="text-xs text-purple-400">
                {safeFormatPercent(1 - checkResult.yld_status.percentage_used / 100, true)}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  checkResult.yld_status.percentage_used >= 90 ? "bg-red-500" :
                  checkResult.yld_status.percentage_used >= 70 ? "bg-yellow-500" :
                  "bg-green-500"
                )}
                style={{ width: `${100 - checkResult.yld_status.percentage_used}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              剩余: {safeFormatYLD(checkResult.yld_status.remaining, 2)} YLD
            </p>
          </div>
        )}
        
        {/* 错误列表 */}
        {hasErrors && (
          <div className="space-y-2">
            <p className="text-sm font-bold text-red-400">错误：</p>
            <ul className="space-y-1">
              {checkResult.errors.map((error, index) => (
                <li key={index} className="flex items-start gap-2 text-xs">
                  <span className="text-red-400">❌</span>
                  <div className="flex-1">
                    <span className="text-gray-300">{error}</span>
                    {/* 提供快速解决方案 */}
                    {error.includes('工具') && onSynthesizeTool && (
                      <button
                        onClick={onSynthesizeTool}
                        className="ml-2 text-blue-400 hover:text-blue-300 underline"
                      >
                        合成工具
                      </button>
                    )}
                    {error.includes('粮食') && onBuyFood && (
                      <button
                        onClick={onBuyFood}
                        className="ml-2 text-blue-400 hover:text-blue-300 underline"
                      >
                        购买粮食
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* 警告列表 */}
        {hasWarnings && (
          <div className="space-y-2">
            <p className="text-sm font-bold text-yellow-400">警告：</p>
            <ul className="space-y-1">
              {checkResult.warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2 text-xs">
                  <span className="text-yellow-400">⚠️</span>
                  <span className="text-gray-300">{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* 活跃会话提示 */}
        {checkResult.active_sessions > 0 && (
          <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded">
            <div className="flex items-center gap-2">
              <span className="text-blue-400">ℹ️</span>
              <p className="text-xs text-blue-400">
                当前有 {checkResult.active_sessions} 个活跃会话正在运行
              </p>
            </div>
          </div>
        )}
        
        {/* 操作按钮 */}
        <div className="flex gap-3">
          {canMine ? (
            <>
              <PixelButton
                className="flex-1"
                onClick={handleProceed}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>⛏️</span>
                  <span>开始挖矿</span>
                </span>
              </PixelButton>
              {hasWarnings && onCancel && (
                <PixelButton
                  variant="secondary"
                  onClick={onCancel}
                >
                  取消
                </PixelButton>
              )}
            </>
          ) : (
            <>
              <PixelButton
                className="flex-1"
                disabled
              >
                无法开始挖矿
              </PixelButton>
              {onCancel && (
                <PixelButton
                  variant="secondary"
                  onClick={onCancel}
                >
                  返回
                </PixelButton>
              )}
            </>
          )}
        </div>
      </div>
    </PixelCard>
  )
}

export default MiningPreCheck
