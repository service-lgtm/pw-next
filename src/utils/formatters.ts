// src/utils/formatters.ts
// 安全的格式化工具函数 - 防止 undefined/null 导致的错误
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
