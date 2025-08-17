// src/app/mining/miningUtils.ts
// 挖矿相关工具函数
// 从 MiningSessions.tsx 中拆分出来的工具函数

/**
 * 格式化数字
 * @param value 数值
 * @param decimals 小数位数
 * @returns 格式化后的字符串
 */
export const formatNumber = (value: string | number | null | undefined, decimals: number = 4): string => {
  if (value === null || value === undefined) return '0'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K'
  } else if (num >= 100) {
    return num.toFixed(2)
  } else if (num >= 10) {
    return num.toFixed(3)
  } else if (num >= 1) {
    return num.toFixed(4)
  } else {
    return num.toFixed(Math.min(decimals, 6))
  }
}

/**
 * 格式化持续时间
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @returns 格式化后的时间字符串
 */
export const formatDuration = (startTime: string, endTime?: string | null): string => {
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
 * 获取下次结算信息
 * @returns 下次结算时间和剩余分钟数
 */
export const getNextSettlementInfo = (): { time: string, minutes: number } => {
  const now = new Date()
  const minutes = now.getMinutes()
  const nextHour = new Date(now)
  nextHour.setHours(now.getHours() + 1, 0, 0, 0)
  
  return {
    time: nextHour.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    minutes: 60 - minutes
  }
}

/**
 * 计算当前小时的分钟数
 * @param session 会话对象
 * @returns 当前小时已经过的分钟数
 */
export const calculateCurrentHourMinutes = (session: any): number => {
  if (!session.started_at) return 0
  
  const now = new Date()
  const startTime = new Date(session.started_at)
  const currentMinutes = now.getMinutes()
  
  if (startTime.getHours() === now.getHours() && 
      startTime.getDate() === now.getDate() &&
      startTime.getMonth() === now.getMonth()) {
    return currentMinutes - startTime.getMinutes()
  }
  
  const carriedMinutes = session.carried_minutes || 0
  return currentMinutes + carriedMinutes
}

/**
 * 格式化时间戳
 * @param timestamp 时间戳（毫秒或秒）
 * @returns 格式化后的时间字符串
 */
export function formatTimestamp(timestamp: number | string): string {
  if (!timestamp) return '-'
  
  const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp
  // 判断是秒还是毫秒（假设2000年后的时间戳）
  const date = new Date(ts < 1e10 ? ts * 1000 : ts)
  
  if (isNaN(date.getTime())) return '-'
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hour}:${minute}`
}

/**
 * 计算时间差
 * @param startTime 开始时间
 * @param endTime 结束时间（默认当前时间）
 * @returns 时间差（秒）
 */
export function getTimeDiff(startTime: number | string, endTime?: number | string): number {
  const start = typeof startTime === 'string' ? new Date(startTime).getTime() : startTime
  const end = endTime 
    ? (typeof endTime === 'string' ? new Date(endTime).getTime() : endTime)
    : Date.now()
  
  return Math.floor((end - start) / 1000)
}

/**
 * 计算产出率
 * @param output 产出量
 * @param hours 小时数
 * @returns 每小时产出率
 */
export function calculateRate(output: number, hours: number): number {
  if (hours <= 0) return 0
  return output / hours
}

/**
 * 计算粮食消耗
 * @param toolCount 工具数量
 * @param hours 小时数
 * @param rate 消耗率（默认2单位/小时/工具）
 * @returns 总消耗量
 */
export function calculateFoodConsumption(
  toolCount: number, 
  hours: number, 
  rate: number = 2
): number {
  return toolCount * hours * rate
}

/**
 * 计算净收益
 * @param grossOutput 总产出
 * @param foodCost 粮食成本
 * @returns 净收益
 */
export function calculateNetProfit(grossOutput: number, foodCost: number): number {
  return grossOutput - foodCost
}

/**
 * 获取工具耐久度百分比
 * @param current 当前耐久度
 * @param max 最大耐久度
 * @returns 百分比（0-100）
 */
export function getDurabilityPercentage(current: number, max: number): number {
  if (max <= 0) return 0
  return Math.min(100, Math.max(0, (current / max) * 100))
}

/**
 * 获取工具耐久度状态
 * @param percentage 耐久度百分比
 * @returns 状态描述
 */
export function getDurabilityStatus(percentage: number): {
  status: 'good' | 'warning' | 'danger'
  color: string
  text: string
} {
  if (percentage >= 60) {
    return { status: 'good', color: 'text-green-400', text: '良好' }
  }
  if (percentage >= 30) {
    return { status: 'warning', color: 'text-yellow-400', text: '警告' }
  }
  return { status: 'danger', color: 'text-red-400', text: '危险' }
}

/**
 * 验证土地是否支持挖矿
 * @param landType 土地类型
 * @returns 是否支持
 */
export function isLandSupportMining(landType: string): boolean {
  const supportedTypes = ['yld_mine', 'iron_mine', 'stone_mine', 'mining', 'special']
  return supportedTypes.includes(landType.toLowerCase())
}

/**
 * 获取资源类型图标
 * @param resourceType 资源类型
 * @returns 图标
 */
export function getResourceIcon(resourceType: string): string {
  const icons: Record<string, string> = {
    yld: '💎',
    gold: '🪙',
    silver: '🥈',
    copper: '🥉',
    iron: '⚙️',
    default: '📦'
  }
  return icons[resourceType.toLowerCase()] || icons.default
}

/**
 * 排序会话列表
 * @param sessions 会话列表
 * @param sortBy 排序字段
 * @param order 排序顺序
 * @returns 排序后的列表
 */
export function sortSessions(
  sessions: any[], 
  sortBy: 'id' | 'output' | 'time' = 'time',
  order: 'asc' | 'desc' = 'desc'
): any[] {
  const sorted = [...sessions].sort((a, b) => {
    let compareValue = 0
    
    switch (sortBy) {
      case 'id':
        compareValue = (a.session_id || '').localeCompare(b.session_id || '')
        break
      case 'output':
        compareValue = (a.pending_output || 0) - (b.pending_output || 0)
        break
      case 'time':
        compareValue = new Date(a.start_time || 0).getTime() - new Date(b.start_time || 0).getTime()
        break
    }
    
    return order === 'asc' ? compareValue : -compareValue
  })
  
  return sorted
}
