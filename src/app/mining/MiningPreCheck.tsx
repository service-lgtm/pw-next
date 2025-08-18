// src/app/mining/MiningPreCheck.tsx
// 挖矿预检查组件 - 修复 YLD 耗尽提示版本
// 
// 功能说明：
// 1. 开始挖矿前的综合检查
// 2. 检查工具、粮食、YLD限额等条件
// 3. 显示警告和错误信息
// 4. 提供快速解决方案
// 
// 修复历史：
// - 2025-01-18: 优化 YLD 耗尽时的提示，明确告知用户挖矿无收益
// - 2025-01-18: 修复百分比显示，耗尽时显示为 100%
// 
// 关联文件：
// - 被 @/app/mining/MiningSessions.tsx 使用（挖矿会话组件）
// - 使用 @/hooks/useProduction 中的 useMiningPreCheck Hook
// - 使用 @/components/shared 中的 UI 组件
// - 调用后端 /production/mining/pre-check/ 接口

'use client'

import { useState, useEffect } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useMiningPreCheck } from '@/hooks/useProduction'
import { cn } from '@/lib/utils'

// 安全的格式化函数
const safeFormatNumber = (value: any, decimals: number = 2): string => {
  const num = parseFloat(value)
  if (isNaN(num)) return '0'
  return num.toFixed(decimals)
}

interface MiningPreCheckProps {
  onProceed: () => void
  onCancel?: () => void
  onBuyFood?: () => void
  onSynthesizeTool?: () => void
  className?: string
  autoCheck?: boolean
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
  const [userConfirmedYLDExhausted, setUserConfirmedYLDExhausted] = useState(false)
  
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
    setUserConfirmedYLDExhausted(false)
  }
  
  // 处理继续操作
  const handleProceed = () => {
    // 检查 YLD 是否耗尽
    const yldExhausted = checkResult?.yld_status?.remaining <= 0 || 
                         checkResult?.yld_status?.percentage_used >= 100 ||
                         checkResult?.warnings?.some(w => w.includes('YLD产量已耗尽'))
    
    // 如果 YLD 耗尽且用户未确认，显示特殊提示
    if (yldExhausted && !userConfirmedYLDExhausted) {
      setUserConfirmedYLDExhausted(true)
      return
    }
    
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
  
  // 检查 YLD 状态
  const yldStatus = checkResult.yld_status || {}
  const yldPercentageUsed = yldStatus.percentage_used >= 100 ? 100 : (yldStatus.percentage_used || 0)
  const yldRemaining = Math.max(0, yldStatus.remaining || 0)
  const yldExhausted = yldRemaining <= 0 || yldPercentageUsed >= 100
  
  // 如果用户已确认 YLD 耗尽，显示特殊确认界面
  if (userConfirmedYLDExhausted && yldExhausted) {
    return (
      <PixelCard className={cn("p-4", className)}>
        <div className="space-y-4">
          <div className="text-center py-4">
            <span className="text-5xl block mb-3">⚠️</span>
            <h3 className="font-bold text-lg text-yellow-400 mb-2">YLD已耗尽提醒</h3>
          </div>
          
          <div className="p-3 bg-red-900/20 border border-red-500/30 rounded">
            <p className="text-sm text-red-400 font-bold mb-2">重要提示：</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>• 今日YLD产量已用完（已使用 100%）</li>
              <li>• 继续挖矿将<span className="text-yellow-400 font-bold">正常消耗粮食</span></li>
              <li>• 但<span className="text-red-400 font-bold">不会产出任何YLD收益</span></li>
              <li>• 建议选择挖矿其他资源（石头、木头、铁矿）</li>
              <li>• 或等待明日0点后YLD额度恢复</li>
            </ul>
          </div>
          
          <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded">
            <p className="text-xs text-blue-400">
              💡 提示：您可以选择挖矿其他资源类型，它们不受YLD限额影响
            </p>
          </div>
          
          <div className="flex gap-3">
            <PixelButton
              className="flex-1"
              variant="secondary"
              onClick={onProceed}
            >
              <span className="flex items-center justify-center gap-2">
                <span>⛏️</span>
                <span>仍要继续</span>
              </span>
            </PixelButton>
            <PixelButton
              variant="primary"
              onClick={() => setUserConfirmedYLDExhausted(false)}
            >
              返回查看
            </PixelButton>
          </div>
        </div>
      </PixelCard>
    )
  }
  
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
          canMine && !yldExhausted ? "bg-green-900/20 border-green-500/30" :
          hasErrors ? "bg-red-900/20 border-red-500/30" :
          "bg-yellow-900/20 border-yellow-500/30"
        )}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {canMine && !yldExhausted ? '✅' : hasErrors ? '❌' : '⚠️'}
            </span>
            <div className="flex-1">
              <p className={cn(
                "font-bold",
                canMine && !yldExhausted ? "text-green-400" :
                hasErrors ? "text-red-400" :
                "text-yellow-400"
              )}>
                {canMine && !yldExhausted ? '可以开始挖矿' :
                 hasErrors ? '无法开始挖矿' :
                 yldExhausted ? 'YLD已耗尽，挖矿无YLD收益' :
                 '可以挖矿，但有警告'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {canMine && !yldExhausted ? '所有条件已满足' :
                 hasErrors ? '请先解决以下问题' :
                 yldExhausted ? '建议挖矿其他资源或等待明日' :
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
              {safeFormatNumber(checkResult.food_amount, 0)} 单位
            </p>
            <p className="text-xs text-gray-500 mt-1">
              可持续 {safeFormatNumber(checkResult.food_hours_available, 1)} 小时
            </p>
          </div>
        </div>
        
        {/* YLD状态 - 修复显示 */}
        {yldStatus && (
          <div className={cn(
            "rounded p-3",
            yldExhausted ? "bg-red-900/20" : "bg-purple-900/20"
          )}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">YLD今日状态</span>
              {yldExhausted ? (
                <span className="text-xs text-red-400 font-bold">已耗尽 100%</span>
              ) : (
                <span className="text-xs text-purple-400">
                  已使用 {yldPercentageUsed.toFixed(1)}%
                </span>
              )}
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  yldExhausted ? "bg-red-500" :
                  yldPercentageUsed >= 90 ? "bg-red-500" :
                  yldPercentageUsed >= 70 ? "bg-yellow-500" :
                  "bg-green-500"
                )}
                style={{ width: `${yldPercentageUsed}%` }}
              />
            </div>
            <p className={cn(
              "text-xs mt-2",
              yldExhausted ? "text-red-400" : "text-gray-400"
            )}>
              剩余: {safeFormatNumber(yldRemaining, 2)} YLD
              {yldExhausted && " - 挖矿将无YLD收益"}
            </p>
          </div>
        )}
        
        {/* 错误列表 */}
        {hasErrors && (
          <div className="space-y-2">
            <p className="text-sm font-bold text-red-400">错误：</p>
            <ul className="space-y-1">
              {checkResult.errors.map((error: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-xs">
                  <span className="text-red-400">❌</span>
                  <div className="flex-1">
                    <span className="text-gray-300">{error}</span>
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
        
        {/* 警告列表 - 特殊处理YLD耗尽 */}
        {hasWarnings && (
          <div className="space-y-2">
            <p className="text-sm font-bold text-yellow-400">警告：</p>
            <ul className="space-y-1">
              {checkResult.warnings.map((warning: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-xs">
                  <span className="text-yellow-400">⚠️</span>
                  <span className={cn(
                    "text-gray-300",
                    warning.includes('YLD产量已耗尽') && "text-yellow-400 font-bold"
                  )}>
                    {warning}
                    {warning.includes('YLD产量已耗尽') && (
                      <span className="block text-red-400 mt-1">
                        继续挖矿将消耗粮食但无YLD收益
                      </span>
                    )}
                  </span>
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
                variant={yldExhausted ? "secondary" : "primary"}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>⛏️</span>
                  <span>{yldExhausted ? '继续挖矿（无YLD收益）' : '开始挖矿'}</span>
                </span>
              </PixelButton>
              {onCancel && (
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
