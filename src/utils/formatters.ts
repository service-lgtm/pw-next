// src/utils/formatters.ts
// 安全的格式化工具函数 - 生产级版本
//
// 文件说明：
// 1. 提供安全的数字格式化函数，避免 toFixed 错误
// 2. 处理 null、undefined、NaN 等边界情况
// 3. 统一格式化规则，确保显示一致性
// 4. 特别处理粮食等资源的显示问题
//
// 关联文件：
// - 被 @/app/mining/MiningStats.tsx 使用（统计组件）
// - 被 @/app/mining/MiningSessions.tsx 使用（会话组件）
// - 被 @/app/mining/page.tsx 使用（主页面）
// - 被 @/app/assets/page.tsx 使用（资产页面）
//
// 更新历史：
// - 2024-12: 创建安全格式化函数，修复 toFixed 错误
// - 2024-12: 添加粮食显示特殊处理

/**
 * 安全的数字转换
 * @param value 输入值
 * @param defaultValue 默认值
 * @returns 数字
 */
export function safeNumber(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined) return defaultValue

  const num = typeof value === 'string' ? parseFloat(value) : Number(value)

  if (isNaN(num) || !isFinite(num)) return defaultValue

  return num
}

/**
 * 安全的格式化 YLD 数量
 * @param value YLD 数量
 * @param decimals 小数位数（默认4位）
 * @returns 格式化的字符串
 */
export function safeFormatYLD(value: any, decimals: number = 4): string {
  const num = safeNumber(value, 0)

  try {
    return num.toFixed(decimals)
  } catch (error) {
    console.error('[safeFormatYLD] Format error:', error, 'Value:', value)
    return '0.0000'
  }
}

/**
 * 安全的格式化资源数量
 * @param value 资源数量
 * @param decimals 小数位数（默认2位）
 * @returns 格式化的字符串
 */
export function safeFormatResource(value: any, decimals: number = 2): string {
  const num = safeNumber(value, 0)

  try {
    // 如果数值很小但不为0，至少显示最小值
    if (num > 0 && num < Math.pow(10, -decimals)) {
      return `<0.${'0'.repeat(decimals - 1)}1`
    }

    return num.toFixed(decimals)
  } catch (error) {
    console.error('[safeFormatResource] Format error:', error, 'Value:', value)
    return '0.00'
  }
}

/**
 * 安全的格式化粮食数量（特殊处理）
 * @param value 粮食数量
 * @param showUnit 是否显示单位
 * @returns 格式化的字符串
 */
export function safeFormatFood(value: any, showUnit: boolean = false): string {
  const num = safeNumber(value, 0)

  // 粮食通常是整数或一位小数
  let formatted: string

  try {
    if (num === Math.floor(num)) {
      // 整数
      formatted = num.toString()
    } else {
      // 保留一位小数
      formatted = num.toFixed(1)
    }
  } catch (error) {
    console.error('[safeFormatFood] Format error:', error, 'Value:', value)
    formatted = '0'
  }

  return showUnit ? `${formatted} 单位` : formatted
}

/**
 * 安全的格式化小时数
 * @param hours 小时数
 * @returns 格式化的字符串
 */
export function safeFormatHours(hours: any): string {
  const num = safeNumber(hours, 0)

  try {
    if (num < 1) {
      const minutes = Math.round(num * 60)
      return `${minutes}分钟`
    } else if (num < 24) {
      return `${num.toFixed(1)}小时`
    } else {
      const days = Math.floor(num / 24)
      const remainingHours = Math.round(num % 24)
      return `${days}天${remainingHours}小时`
    }
  } catch (error) {
    console.error('[safeFormatHours] Format error:', error, 'Value:', hours)
    return '0小时'
  }
}

/**
 * 安全的格式化百分比
 * @param value 数值（0-1 或 0-100）
 * @param isDecimal 是否为小数形式（0-1）
 * @returns 格式化的字符串
 */
export function safeFormatPercent(value: any, isDecimal: boolean = true): string {
  let num = safeNumber(value, 0)

  if (isDecimal) {
    num = num * 100
  }

  try {
    return `${num.toFixed(1)}%`
  } catch (error) {
    console.error('[safeFormatPercent] Format error:', error, 'Value:', value)
    return '0.0%'
  }
}

/**
 * 安全的格式化货币
 * @param value 金额
 * @param currency 货币类型
 * @returns 格式化的字符串
 */
export function safeFormatCurrency(value: any, currency: 'TDB' | 'YLD' | 'USD' | 'RMB' = 'TDB'): string {
  const num = safeNumber(value, 0)

  try {
    const symbols = {
      TDB: '',
      YLD: '',
      USD: '$',
      RMB: '¥'
    }

    const decimals = currency === 'YLD' ? 4 : 2
    const formatted = num.toFixed(decimals)
    const symbol = symbols[currency]

    if (currency === 'TDB' || currency === 'YLD') {
      return `${formatted} ${currency}`
    } else {
      return `${symbol}${formatted}`
    }
  } catch (error) {
    console.error('[safeFormatCurrency] Format error:', error, 'Value:', value)
    return currency === 'YLD' ? '0.0000 YLD' : '0.00'
  }
}

/**
 * 格式化大数字（带单位）
 * @param value 数值
 * @returns 格式化的字符串
 */
export function formatLargeNumber(value: any): string {
  const num = safeNumber(value, 0)

  try {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)}B`
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`
    } else {
      return num.toFixed(2)
    }
  } catch (error) {
    console.error('[formatLargeNumber] Format error:', error, 'Value:', value)
    return '0'
  }
}

/**
 * 格式化时间戳
 * @param timestamp 时间戳或日期字符串
 * @param format 格式类型
 * @returns 格式化的字符串
 */
export function formatTimestamp(
  timestamp: string | number | Date | null | undefined,
  format: 'full' | 'date' | 'time' | 'relative' = 'full'
): string {
  if (!timestamp) return '未知'

  try {
    const date = new Date(timestamp)

    if (isNaN(date.getTime())) {
      return '无效时间'
    }

    switch (format) {
      case 'date':
        return date.toLocaleDateString('zh-CN')

      case 'time':
        return date.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        })

      case 'relative':
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const seconds = Math.floor(diff / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (days > 0) return `${days}天前`
        if (hours > 0) return `${hours}小时前`
        if (minutes > 0) return `${minutes}分钟前`
        return '刚刚'

      case 'full':
      default:
        return date.toLocaleString('zh-CN')
    }
  } catch (error) {
    console.error('[formatTimestamp] Format error:', error, 'Value:', timestamp)
    return '未知'
  }
}

/**
 * 格式化持续时间
 * @param startTime 开始时间
 * @param endTime 结束时间（可选，默认为当前时间）
 * @returns 格式化的字符串
 */
export function formatDuration(
  startTime: string | number | Date | null | undefined,
  endTime?: string | number | Date | null
): string {
  if (!startTime) return '未知'

  try {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return '无效时间'
    }

    const diff = Math.abs(end.getTime() - start.getTime())
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      const remainingHours = hours % 24
      return `${days}天${remainingHours}小时`
    }
    if (hours > 0) {
      const remainingMinutes = minutes % 60
      return `${hours}小时${remainingMinutes}分钟`
    }
    if (minutes > 0) {
      return `${minutes}分钟`
    }
    return `${seconds}秒`
  } catch (error) {
    console.error('[formatDuration] Format error:', error, 'Start:', startTime, 'End:', endTime)
    return '未知'
  }
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化的字符串
 */
export function formatFileSize(bytes: any): string {
  const num = safeNumber(bytes, 0)

  try {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let index = 0
    let size = num

    while (size >= 1024 && index < units.length - 1) {
      size /= 1024
      index++
    }

    return `${size.toFixed(2)} ${units[index]}`
  } catch (error) {
    console.error('[formatFileSize] Format error:', error, 'Value:', bytes)
    return '0 B'
  }
}

/**
 * 格式化数字为千分位
 * @param value 数值
 * @param decimals 小数位数
 * @returns 格式化的字符串
 */
export function formatWithCommas(value: any, decimals: number = 0): string {
  const num = safeNumber(value, 0)

  try {
    const fixed = num.toFixed(decimals)
    const parts = fixed.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return parts.join('.')
  } catch (error) {
    console.error('[formatWithCommas] Format error:', error, 'Value:', value)
    return '0'
  }
}

/**
 * 获取资源显示名称
 * @param resourceType 资源类型
 * @returns 显示名称
 */
export function getResourceDisplayName(resourceType: string): string {
  const names: Record<string, string> = {
    wood: '木头',
    iron: '铁矿',
    stone: '石头',
    yld: 'YLD',
    grain: '粮食',
    food: '粮食',  // food 和 grain 都显示为粮食
    seed: '种子',
    brick: '砖头',
    pickaxe: '镐头',
    axe: '斧头',
    hoe: '锄头'
  }

  return names[resourceType.toLowerCase()] || resourceType
}

/**
 * 计算剩余时间
 * @param targetTime 目标时间
 * @returns 剩余时间对象
 */
export function calculateTimeRemaining(targetTime: string | number | Date | null | undefined): {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
  expired: boolean
} {
  if (!targetTime) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, expired: true }
  }

  try {
    const target = new Date(targetTime)
    const now = new Date()
    const diff = target.getTime() - now.getTime()

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, expired: true }
    }

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    return {
      days,
      hours: hours % 24,
      minutes: minutes % 60,
      seconds: seconds % 60,
      total: seconds,
      expired: false
    }
  } catch (error) {
    console.error('[calculateTimeRemaining] Error:', error, 'Target:', targetTime)
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, expired: true }
  }
}

/**
 * 验证并格式化数值输入
 * @param input 输入值
 * @param min 最小值
 * @param max 最大值
 * @param decimals 允许的小数位数
 * @returns 验证后的数值
 */
export function validateNumberInput(
  input: string | number,
  min: number = 0,
  max: number = Number.MAX_SAFE_INTEGER,
  decimals: number = 0
): number {
  let value = typeof input === 'string' ? parseFloat(input) : input

  if (isNaN(value)) value = min
  if (value < min) value = min
  if (value > max) value = max

  if (decimals === 0) {
    value = Math.floor(value)
  } else {
    const factor = Math.pow(10, decimals)
    value = Math.round(value * factor) / factor
  }

  return value
}
