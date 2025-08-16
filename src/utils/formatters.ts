// src/app/mining/MiningStats.tsx
// 矿山统计信息组件 - 使用安全格式化函数版本
// 
// 功能说明：
// 1. 显示 YLD 矿山统计数据
// 2. 显示资源统计信息（使用新的 ResourceStatsView 接口）
// 3. 提供快捷操作入口
// 4. 使用安全的格式化函数防止 toFixed 错误
// 
// 关联文件：
// - 被 @/app/mining/page.tsx 使用
// - 使用 @/components/shared/PixelCard
// - 使用 @/components/shared/PixelButton
// - 使用 @/utils/formatters（安全格式化函数）
// - 从 @/hooks/useProduction 获取资源数据
// - 调用后端 /production/resources/stats/ 接口
//
// 更新历史：
// - 2024-01: 添加 resourceStats 参数支持新的资源统计接口
// - 2024-01: 使用安全格式化函数修复 toFixed 错误

'use client'

import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { safeFormatYLD, safeFormatResource, safeFormatHours } from '@/utils/formatters'

interface MiningStatsProps {
  yldStats: any
  resources: any
  resourceStats?: any  // 新增：资源统计数据（来自 /production/resources/stats/）
  grainStatus: any
  hasMiningAccess: boolean
  sessions?: any[]  // 添加挖矿会话数据
  onRefresh: () => void
  onOpenMining: () => void
}

/**
 * 矿山统计组件
 */
export function MiningStats({
  yldStats,
  resources,
  resourceStats,  // 新增参数
  grainStatus,
  hasMiningAccess,
  sessions,
  onRefresh,
  onOpenMining
}: MiningStatsProps) {
  // 调试：打印资源数据
  console.log('[MiningStats] resourceStats:', resourceStats)
  console.log('[MiningStats] resources:', resources)
  
  // 计算挖矿会话的累计产出 - 使用安全的数值处理
  const sessionsTotalOutput = sessions?.reduce((sum, session) => {
    const output = parseFloat(session?.total_output || session?.accumulated_output || '0')
    return sum + (isNaN(output) ? 0 : output)
  }, 0) || 0
  
  // 计算总累计产出（YLD矿山 + 挖矿会话）- 使用安全的数值处理
  const yldOutput = parseFloat(yldStats?.total_accumulated_output || '0')
  const totalAccumulatedOutput = (isNaN(yldOutput) ? 0 : yldOutput) + sessionsTotalOutput
  
  return (
    <div className="space-y-6">
      {/* YLD 矿山统计 */}
      <PixelCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">矿山统计</h3>
          <PixelButton size="xs" onClick={onRefresh}>
            刷新
          </PixelButton>
        </div>
        
        {yldStats ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-gray-800 rounded">
                <p className="text-xs text-gray-400">总矿山</p>
                <p className="text-xl font-bold text-gold-500">{yldStats.total_mines || 0}</p>
              </div>
              <div className="text-center p-3 bg-gray-800 rounded">
                <p className="text-xs text-gray-400">YLD 总量</p>
                <p className="text-xl font-bold text-purple-500">
                  {safeFormatYLD(yldStats.total_yld_capacity)}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-800 rounded">
                <p className="text-xs text-gray-400">累计产出</p>
                <p className="text-xl font-bold text-green-500">
                  {safeFormatYLD(totalAccumulatedOutput)}
                </p>
                {hasMiningAccess && sessionsTotalOutput > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    挖矿: {safeFormatYLD(sessionsTotalOutput)}
                  </p>
                )}
              </div>
              <div className="text-center p-3 bg-gray-800 rounded">
                <p className="text-xs text-gray-400">生产中</p>
                <p className="text-xl font-bold text-blue-500">
                  {(yldStats.producing_count || 0) + (hasMiningAccess && sessions ? sessions.length : 0)}
                </p>
                {hasMiningAccess && sessions && sessions.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    会话: {sessions.length}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">暂无统计数据</p>
          </div>
        )}
      </PixelCard>

      {/* 资源统计 - 仅在有挖矿权限时显示 */}
      {hasMiningAccess && (resources || resourceStats) && (
        <PixelCard>
          <h3 className="font-bold mb-4">资源库存</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-800 rounded">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">木头</span>
                <span className="text-2xl">🪵</span>
              </div>
              <p className="text-lg font-bold text-green-400 mt-1">
                {safeFormatResource(
                  resourceStats?.resources?.wood?.available || 
                  resourceStats?.resources?.wood?.amount || 
                  resources?.wood
                )}
              </p>
            </div>
            
            <div className="p-3 bg-gray-800 rounded">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">铁矿</span>
                <span className="text-2xl">⛏️</span>
              </div>
              <p className="text-lg font-bold text-gray-400 mt-1">
                {safeFormatResource(
                  resourceStats?.resources?.iron?.available || 
                  resourceStats?.resources?.iron?.amount || 
                  resources?.iron
                )}
              </p>
            </div>
            
            <div className="p-3 bg-gray-800 rounded">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">石头</span>
                <span className="text-2xl">🪨</span>
              </div>
              <p className="text-lg font-bold text-blue-400 mt-1">
                {safeFormatResource(
                  resourceStats?.resources?.stone?.available || 
                  resourceStats?.resources?.stone?.amount || 
                  resources?.stone
                )}
              </p>
            </div>
            
            <div className="p-3 bg-gray-800 rounded">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">粮食</span>
                <span className="text-2xl">🌾</span>
              </div>
              <p className="text-lg font-bold text-yellow-400 mt-1">
                {safeFormatResource(
                  resourceStats?.resources?.food?.available || 
                  resourceStats?.resources?.food?.amount || 
                  resourceStats?.resources?.grain?.available || 
                  resourceStats?.resources?.grain?.amount || 
                  resources?.grain || 
                  resources?.food
                )}
              </p>
              {grainStatus && grainStatus.warning && (
                <p className="text-xs text-red-400 mt-1">
                  剩{safeFormatHours(grainStatus.hours_remaining)}
                </p>
              )}
            </div>
          </div>
          
          {/* 显示总价值（如果有） */}
          {resourceStats?.total_value !== undefined && resourceStats?.total_value !== null && (
            <div className="mt-3 p-2 bg-purple-900/20 rounded">
              <div className="flex justify-between items-center">
                <span className="text-xs text-purple-400">资源总价值</span>
                <span className="text-sm font-bold text-purple-400">
                  {safeFormatResource(resourceStats.total_value)} YLD
                </span>
              </div>
            </div>
          )}
          
          {/* 显示钱包余额（如果有） */}
          {resourceStats?.wallet && (
            <div className="mt-3 space-y-2">
              {resourceStats.wallet.yld_balance !== undefined && resourceStats.wallet.yld_balance > 0 && (
                <div className="p-2 bg-purple-900/20 rounded flex justify-between items-center">
                  <span className="text-xs text-purple-400">YLD 钱包</span>
                  <span className="text-sm font-bold text-purple-400">
                    {safeFormatYLD(resourceStats.wallet.yld_balance)}
                  </span>
                </div>
              )}
              {resourceStats.wallet.tdb_balance !== undefined && resourceStats.wallet.tdb_balance > 0 && (
                <div className="p-2 bg-gold-900/20 rounded flex justify-between items-center">
                  <span className="text-xs text-gold-400">TDB 余额</span>
                  <span className="text-sm font-bold text-gold-400">
                    {safeFormatResource(resourceStats.wallet.tdb_balance)}
                  </span>
                </div>
              )}
            </div>
          )}
        </PixelCard>
      )}

      {/* 挖矿功能入口 */}
      <PixelCard className="p-4 bg-green-900/20">
        <h3 className="font-bold mb-2 text-green-400">挖矿生产</h3>
        <div className="space-y-2 text-xs text-gray-400 mb-3">
          <p>• 使用工具在土地上挖矿</p>
          <p>• 消耗粮食获得资源产出</p>
          <p>• 合成工具提高效率</p>
        </div>
        <PixelButton 
          size="sm" 
          className="w-full"
          onClick={onOpenMining}
        >
          {hasMiningAccess ? '进入挖矿' : '开启挖矿'}
        </PixelButton>
      </PixelCard>

      {/* 操作说明 */}
      <PixelCard className="p-4 bg-blue-900/20">
        <h3 className="font-bold mb-2 text-blue-400">操作说明</h3>
        <div className="space-y-2 text-xs text-gray-400">
          <p>• YLD 矿山可产出 YLD 通证</p>
          <p>• 点击矿山卡片查看详情</p>
          <p>• 挖矿功能需要内测密码</p>
          <p>• 生产功能即将全面开放</p>
        </div>
      </PixelCard>
    </div>
  )
}

export default MiningStats
// 
// 功能说明：
// 1. 提供安全的数字格式化函数
// 2. 处理 undefined、null、NaN 等边界情况
// 3. 提供默认值机制
// 
// 使用方式：
// import { safeFormatNumber, safeFormatYLD } from '@/utils/formatters'
// 
// 关联文件：
// - 被所有需要格式化数字的组件使用
// - 替代直接使用 toFixed() 方法
// 
// 创建时间：2024-01
// 更新历史：
// - 2024-01: 创建此文件解决 toFixed 错误

'use client'

/**
 * 安全地格式化数字
 * @param value - 要格式化的值（可能是 undefined、null、字符串或数字）
 * @param decimals - 小数位数
 * @param defaultValue - 默认值
 * @returns 格式化后的字符串
 */
export function safeFormatNumber(
  value: string | number | null | undefined,
  decimals: number = 2,
  defaultValue: string = '0'
): string {
  try {
    // 处理 undefined 和 null
    if (value === undefined || value === null) {
      console.debug('[Formatters] Value is null/undefined, using default:', defaultValue)
      return defaultValue.padEnd(defaultValue.indexOf('.') > -1 ? defaultValue.length : defaultValue.length + decimals + 1, '0')
    }
    
    // 转换为数字
    let num: number
    if (typeof value === 'string') {
      // 清理字符串（移除空格、逗号等）
      const cleaned = value.replace(/[,\s]/g, '')
      num = parseFloat(cleaned)
    } else if (typeof value === 'number') {
      num = value
    } else {
      console.warn('[Formatters] Unexpected value type:', typeof value, value)
      return defaultValue
    }
    
    // 检查是否为有效数字
    if (isNaN(num) || !isFinite(num)) {
      console.debug('[Formatters] Invalid number:', value, '-> NaN/Infinity')
      return defaultValue
    }
    
    // 安全地调用 toFixed
    return num.toFixed(decimals)
  } catch (error) {
    console.error('[Formatters] Error formatting number:', error, 'Value:', value)
    return defaultValue
  }
}

/**
 * 安全地格式化 YLD 数量（4位小数）
 * @param value - YLD 值
 * @param defaultValue - 默认值
 * @returns 格式化后的 YLD 字符串
 */
export function safeFormatYLD(
  value: string | number | null | undefined,
  defaultValue: string = '0.0000'
): string {
  return safeFormatNumber(value, 4, defaultValue)
}

/**
 * 安全地格式化资源数量（2位小数）
 * @param value - 资源值
 * @param defaultValue - 默认值
 * @returns 格式化后的资源字符串
 */
export function safeFormatResource(
  value: string | number | null | undefined,
  defaultValue: string = '0.00'
): string {
  return safeFormatNumber(value, 2, defaultValue)
}

/**
 * 安全地格式化百分比
 * @param value - 百分比值（0-100 或 0-1）
 * @param isDecimal - 是否为小数形式（0-1）
 * @param decimals - 小数位数
 * @returns 格式化后的百分比字符串（不含%符号）
 */
export function safeFormatPercent(
  value: string | number | null | undefined,
  isDecimal: boolean = true,
  decimals: number = 1
): string {
  try {
    if (value === undefined || value === null) {
      return '0'
    }
    
    let num = typeof value === 'string' ? parseFloat(value) : value
    
    if (isNaN(num) || !isFinite(num)) {
      return '0'
    }
    
    // 如果是小数形式（0-1），转换为百分比（0-100）
    if (isDecimal) {
      num = num * 100
    }
    
    // 限制在 0-100 范围内
    num = Math.max(0, Math.min(100, num))
    
    return num.toFixed(decimals)
  } catch (error) {
    console.error('[Formatters] Error formatting percent:', error)
    return '0'
  }
}

/**
 * 安全地格式化整数
 * @param value - 数值
 * @param defaultValue - 默认值
 * @returns 格式化后的整数字符串
 */
export function safeFormatInt(
  value: string | number | null | undefined,
  defaultValue: string = '0'
): string {
  try {
    if (value === undefined || value === null) {
      return defaultValue
    }
    
    const num = typeof value === 'string' ? parseInt(value, 10) : Math.floor(value)
    
    if (isNaN(num) || !isFinite(num)) {
      return defaultValue
    }
    
    return num.toString()
  } catch (error) {
    console.error('[Formatters] Error formatting integer:', error)
    return defaultValue
  }
}

/**
 * 安全地格式化货币
 * @param value - 金额
 * @param currency - 货币符号
 * @param decimals - 小数位数
 * @returns 格式化后的货币字符串
 */
export function safeFormatCurrency(
  value: string | number | null | undefined,
  currency: string = '¥',
  decimals: number = 2
): string {
  const formatted = safeFormatNumber(value, decimals, '0')
  return `${currency}${formatted}`
}

/**
 * 安全地格式化大数字（添加千分位分隔符）
 * @param value - 数值
 * @param decimals - 小数位数
 * @returns 格式化后的字符串（带千分位分隔符）
 */
export function safeFormatLargeNumber(
  value: string | number | null | undefined,
  decimals: number = 2
): string {
  const formatted = safeFormatNumber(value, decimals)
  
  // 添加千分位分隔符
  const parts = formatted.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  
  return parts.join('.')
}

/**
 * 格式化时间（小时和分钟）
 * @param hours - 小时数
 * @returns 格式化后的时间字符串
 */
export function safeFormatHours(
  hours: number | null | undefined
): string {
  if (hours === undefined || hours === null || isNaN(hours)) {
    return '0小时'
  }
  
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  
  if (h === 0 && m === 0) {
    return '0小时'
  } else if (h === 0) {
    return `${m}分钟`
  } else if (m === 0) {
    return `${h}小时`
  } else {
    return `${h}小时${m}分钟`
  }
}

/**
 * 安全地获取嵌套对象的值
 * @param obj - 对象
 * @param path - 属性路径（如 'a.b.c'）
 * @param defaultValue - 默认值
 * @returns 属性值或默认值
 */
export function safeGet<T = any>(
  obj: any,
  path: string,
  defaultValue: T
): T {
  try {
    const keys = path.split('.')
    let result = obj
    
    for (const key of keys) {
      if (result === null || result === undefined) {
        return defaultValue
      }
      result = result[key]
    }
    
    return result !== undefined ? result : defaultValue
  } catch (error) {
    return defaultValue
  }
}

/**
 * 批量格式化数据
 * @param data - 数据对象
 * @param formatters - 格式化配置
 * @returns 格式化后的数据
 */
export function safeBatchFormat(
  data: any,
  formatters: Record<string, { path: string; formatter: Function; args?: any[] }>
): Record<string, string> {
  const result: Record<string, string> = {}
  
  for (const [key, config] of Object.entries(formatters)) {
    const value = safeGet(data, config.path, null)
    const args = config.args || []
    result[key] = config.formatter(value, ...args)
  }
  
  return result
}

// 导出一个调试函数，用于检查数据
export function debugFormatData(label: string, value: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`[Format Debug] ${label}`)
    console.log('Type:', typeof value)
    console.log('Value:', value)
    console.log('Is null/undefined:', value == null)
    console.log('Is NaN:', typeof value === 'number' && isNaN(value))
    console.groupEnd()
  }
}
