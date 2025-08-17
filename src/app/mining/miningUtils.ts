// src/app/mining/miningUtils.ts
// 挖矿系统工具函数文件
// 
// 文件说明：
// 本文件包含挖矿系统中常用的工具函数，如数字格式化、时间格式化、数据处理等
// 从 MiningSessions.tsx 中拆分出来，提供给多个组件使用
// 
// 创建原因：
// - 多个组件需要使用相同的格式化和计算函数
// - 集中管理工具函数，避免重复代码
// - 便于单元测试和维护
// 
// 使用方式：
// import { formatNumber, formatDuration } from './miningUtils'
// 
// 关联文件：
// - 被 MiningSessions.tsx 使用（主挖矿会话组件）
// - 被 SessionCard.tsx 使用（会话卡片组件）
// - 被 SessionSummary.tsx 使用（会话汇总组件）
// - 被 StartMiningForm.tsx 使用（开始挖矿表单）
// 
// 更新历史：
// - 2025-01: 从 MiningSessions.tsx 拆分出来
// - 2025-01: 添加类型定义和错误处理

import type { Land } from '@/types/assets'
import { MINABLE_LAND_TYPES, LAND_TYPE_MAP, LAND_RESOURCE_MAP } from './miningConstants'

/**
 * 格式化数字显示
 * 根据数字大小自动选择合适的格式（K/M后缀）
 * @param value - 要格式化的数值
 * @param decimals - 小数位数（默认4位）
 * @returns 格式化后的字符串
 * 
 * 示例：
 * formatNumber(1234567) => "1.23M"
 * formatNumber(1234) => "1.23K"
 * formatNumber(12.3456) => "12.3456"
 */
export function formatNumber(
  value: string | number | null | undefined, 
  decimals: number = 4
): string {
  if (value === null || value === undefined) return '0'
  
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'
  
  // 百万级别
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M'
  } 
  // 千级别
  else if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K'
  } 
  // 百级别
  else if (num >= 100) {
    return num.toFixed(2)
  } 
  // 十级别
  else if (num >= 10) {
    return num.toFixed(3)
  } 
  // 个位数
  else if (num >= 1) {
    return num.toFixed(4)
  } 
  // 小于1的数
  else {
    return num.toFixed(Math.min(decimals, 6))
  }
}

/**
 * 格式化时长显示
 * 将开始时间和结束时间转换为可读的时长格式
 * @param startTime - 开始时间字符串
 * @param endTime - 结束时间字符串（可选，默认为当前时间）
 * @returns 格式化的时长字符串
 * 
 * 示例：
 * formatDuration("2024-01-01T10:00:00") => "2天5小时"
 * formatDuration("2024-01-01T10:00:00", "2024-01-01T11:30:00") => "1小时30分钟"
 */
export function formatDuration(
  startTime: string, 
  endTime?: string | null
): string {
  if (!startTime) return '未知'
  
  try {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const diff = end.getTime() - start.getTime()
    
    if (diff < 0) return '0分钟'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) {
      return `${days}天${hours}小时`
    }
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`
    }
    return `${minutes}分钟`
  } catch (error) {
    console.error('[formatDuration] Error:', error)
    return '未知'
  }
}

/**
 * 获取下次整点结算信息
 * @returns 包含时间和剩余分钟数的对象
 * 
 * 示例：
 * getNextSettlementInfo() => { time: "15:00", minutes: 23 }
 */
export function getNextSettlementInfo(): { time: string, minutes: number } {
  const now = new Date()
  const minutes = now.getMinutes()
  const nextHour = new Date(now)
  nextHour.setHours(now.getHours() + 1, 0, 0, 0)
  
  return {
    time: nextHour.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    minutes: 60 - minutes
  }
}

/**
 * 计算当前小时内的挖矿分钟数
 * 用于新算法v2的小时结算计算
 * @param session - 会话对象
 * @returns 当前小时内的分钟数
 */
export function calculateCurrentHourMinutes(session: any): number {
  if (!session.started_at) return 0
  
  const now = new Date()
  const startTime = new Date(session.started_at)
  const currentMinutes = now.getMinutes()
  
  // 如果是同一小时内开始的
  if (startTime.getHours() === now.getHours() && 
      startTime.getDate() === now.getDate() &&
      startTime.getMonth() === now.getMonth()) {
    return currentMinutes - startTime.getMinutes()
  }
  
  // 跨小时的情况，需要考虑累积的分钟数
  const carriedMinutes = session.carried_minutes || 0
  return currentMinutes + carriedMinutes
}

/**
 * 检查土地是否支持挖矿
 * @param land - 土地对象
 * @returns 是否支持挖矿
 */
export function isMinableLand(land: Land): boolean {
  const landType = land.blueprint?.land_type || land.land_type || ''
  return MINABLE_LAND_TYPES.includes(landType)
}

/**
 * 获取土地类型的显示文本
 * @param land - 土地对象
 * @returns 土地类型的中文名称
 */
export function getLandTypeDisplay(land: Land): string {
  const landType = land.blueprint?.land_type || land.land_type || ''
  if (landType && LAND_TYPE_MAP[landType]) {
    return LAND_TYPE_MAP[landType]
  }
  return land.blueprint?.land_type_display || land.land_type_display || '未知类型'
}

/**
 * 获取土地的产出资源类型
 * @param land - 土地对象
 * @returns 资源类型名称
 */
export function getLandResource(land: Land): string {
  const landType = land.blueprint?.land_type || land.land_type || ''
  return LAND_RESOURCE_MAP[landType] || '未知'
}

/**
 * 格式化百分比
 * @param value - 数值（0-1之间）
 * @param showSign - 是否显示百分号
 * @returns 格式化的百分比字符串
 */
export function formatPercent(value: number, showSign: boolean = true): string {
  const percent = (value * 100).toFixed(1)
  return showSign ? `${percent}%` : percent
}

/**
 * 格式化日期时间
 * @param dateStr - 日期字符串
 * @param format - 格式类型（'date' | 'time' | 'datetime'）
 * @returns 格式化的日期时间字符串
 */
export function formatDateTime(
  dateStr: string | null | undefined, 
  format: 'date' | 'time' | 'datetime' = 'datetime'
): string {
  if (!dateStr) return '未知'
  
  try {
    const date = new Date(dateStr)
    const options: Intl.DateTimeFormatOptions = {}
    
    if (format === 'date' || format === 'datetime') {
      options.year = 'numeric'
      options.month = '2-digit'
      options.day = '2-digit'
    }
    
    if (format === 'time' || format === 'datetime') {
      options.hour = '2-digit'
      options.minute = '2-digit'
      options.second = '2-digit'
    }
    
    return date.toLocaleString('zh-CN', options)
  } catch {
    return '未知'
  }
}

/**
 * 计算粮食可持续时间
 * @param foodAmount - 当前粮食数量
 * @param consumptionRate - 消耗速率（每小时）
 * @returns 可持续小时数
 */
export function calculateFoodSustainability(
  foodAmount: number, 
  consumptionRate: number
): number {
  if (consumptionRate <= 0) return Infinity
  return foodAmount / consumptionRate
}

/**
 * 判断是否刚过整点（用于触发结算检查）
 * @param minutesThreshold - 整点后多少分钟内算作刚过整点（默认1分钟）
 * @returns 是否刚过整点
 */
export function isJustPastHour(minutesThreshold: number = 1): boolean {
  const minutes = new Date().getMinutes()
  return minutes >= 0 && minutes <= minutesThreshold
}

/**
 * 获取距离下一个整点的毫秒数
 * @returns 毫秒数
 */
export function getMillisecondsToNextHour(): number {
  const now = new Date()
  const nextHour = new Date(now)
  nextHour.setHours(now.getHours() + 1, 0, 0, 0)
  return nextHour.getTime() - now.getTime()
}

/**
 * 安全地解析JSON字符串
 * @param jsonStr - JSON字符串
 * @param defaultValue - 解析失败时的默认值
 * @returns 解析后的对象或默认值
 */
export function safeJSONParse<T = any>(jsonStr: string, defaultValue: T): T {
  try {
    return JSON.parse(jsonStr)
  } catch {
    return defaultValue
  }
}

/**
 * 深度合并对象
 * @param target - 目标对象
 * @param source - 源对象
 * @returns 合并后的对象
 */
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target }
  
  Object.keys(source).forEach(key => {
    const targetValue = result[key as keyof T]
    const sourceValue = source[key as keyof T]
    
    if (sourceValue === undefined) return
    
    if (typeof targetValue === 'object' && typeof sourceValue === 'object' && 
        targetValue !== null && sourceValue !== null &&
        !Array.isArray(targetValue) && !Array.isArray(sourceValue)) {
      result[key as keyof T] = deepMerge(targetValue, sourceValue) as any
    } else {
      result[key as keyof T] = sourceValue as any
    }
  })
  
  return result
}

/**
 * 防抖函数
 * @param fn - 要防抖的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * 节流函数
 * @param fn - 要节流的函数
 * @param limit - 时间限制（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}
