// app/explore/china/[province]/utils.ts
import { CITY_CONFIGS, SHOP_CONFIGS, FAMOUS_BRANDS, PLOT_TYPES } from './constants'
import type { Plot, CityConfig } from './types'

// 样式类名组合工具
export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

// 格式化货币
export function formatCurrency(amount: number, currency: 'TDB' | 'CNY' = 'CNY'): string {
  if (currency === 'TDB') {
    return `${amount.toLocaleString()} TDB`
  }
  
  if (amount >= 10000) {
    return `¥${(amount / 10000).toFixed(1)}万`
  }
  return `¥${amount.toLocaleString()}`
}

// 格式化大数字
export function formatNumber(num: number): string {
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(1)}亿`
  }
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`
  }
  return num.toLocaleString()
}

// 计算两点距离
export function calculateDistance(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

// 生成城市地块数据
export function generateCityPlots(cityId: string): Plot[] {
  const config = CITY_CONFIGS[cityId] || CITY_CONFIGS.beijing
  const plots: Plot[] = []
  const occupiedCells = new Set<string>()
  
  const userNames = ['张伟', '李娜', '王强', '刘洋', '陈静', '杨帆', '赵敏', '黄磊', '周婷', '吴昊']
  
  // 先放置地标建筑
  config.landmarks.forEach(landmark => {
    const plot: Plot = {
      id: landmark.id,
      districtId: 'special',
      name: landmark.name,
      type: landmark.type as any,
      coordinates: landmark.coordinates,
      size: landmark.size,
      price: landmark.type === 'protected' ? 0 : 1000000 + Math.random() * 2000000,
      monthlyYield: landmark.type === 'protected' ? 0 : 80000 + Math.random() * 40000,
      owned: true,
      ownerId: 'system',
      ownerName: '系统',
      building: landmark.building as any,
      status: landmark.type === 'protected' ? 'protected' : 'owned',
      features: ['知名地标', '人流密集', landmark.type === 'protected' ? '历史保护' : '收益稳定'],
      trafficFlow: 5,
      appreciationRate: 0.15,
      rentYield: 0.08
    }
    plots.push(plot)
    
    // 标记占用的格子
    for (let dx = 0; dx < landmark.size.width; dx++) {
      for (let dy = 0; dy < landmark.size.height; dy++) {
        occupiedCells.add(`${landmark.coordinates.x + dx},${landmark.coordinates.y + dy}`)
      }
    }
  })
  
  // 生成普通地块
  for (let y = 0; y < config.gridSize.height; y++) {
    for (let x = 0; x < config.gridSize.width; x++) {
      if (occupiedCells.has(`${x},${y}`)) continue
      
      // 计算地块属性
      const { type, features } = calculatePlotType(x, y, config)
      const nearSubway = isNearSubway(x, y, config.subwayStations)
      const nearWater = isNearWater(x, y, config.waterBodies)
      const inBusinessDistrict = getBusinessDistrict(x, y, config.businessDistricts)
      
      // 根据位置计算价格
      const basePrice = PLOT_TYPES[type].baseYield * 1000000
      const locationMultiplier = calculateLocationMultiplier(
        { x, y },
        config,
        nearSubway,
        nearWater,
        inBusinessDistrict
      )
      
      const price = Math.floor(basePrice * locationMultiplier * (0.8 + Math.random() * 0.4))
      const baseYield = PLOT_TYPES[type].baseYield
      
      // 决定是否有建筑
      const hasBuilding = Math.random() > 0.3
      const isOwned = hasBuilding || Math.random() > 0.6
      
      let building = undefined
      if (hasBuilding) {
        building = generateBuilding(type, nearSubway, locationMultiplier > 1.3)
      }
      
      // 组合特性标签
      const plotFeatures = [...features]
      if (nearSubway) plotFeatures.push('地铁沿线')
      if (nearWater) plotFeatures.push('临水景观')
      if (inBusinessDistrict) plotFeatures.push(`${inBusinessDistrict}商圈`)
      
      const plot: Plot = {
        id: `plot-${x}-${y}`,
        districtId: x < config.gridSize.width / 2 ? 'west' : 'east',
        name: `地块${String(y * config.gridSize.width + x + 1).padStart(3, '0')}`,
        type,
        coordinates: { x, y },
        size: { width: 1, height: 1 },
        price,
        monthlyYield: Math.floor(
          price * baseYield * 
          (nearSubway ? 1.3 : 1) * 
          (building ? 1.2 : 1) * 
          (inBusinessDistrict ? 1.15 : 1)
        ),
        owned: isOwned,
        ownerId: isOwned ? `user${Math.floor(Math.random() * 1000)}` : undefined,
        ownerName: isOwned ? userNames[Math.floor(Math.random() * userNames.length)] : undefined,
        building,
        status: isOwned ? 'owned' : 'available',
        features: plotFeatures.slice(0, 3), // 最多3个特性
        nearSubway,
        trafficFlow: calculateTrafficFlow(nearSubway, type, inBusinessDistrict),
        appreciationRate: 0.05 + (nearSubway ? 0.05 : 0) + (type === 'commercial' ? 0.03 : 0),
        rentYield: baseYield + (building ? 0.02 : 0) + (nearSubway ? 0.01 : 0)
      }
      
      plots.push(plot)
    }
  }
  
  return plots
}

// 计算地块类型
function calculatePlotType(x: number, y: number, config: CityConfig) {
  const centerX = config.gridSize.width / 2
  const centerY = config.gridSize.height / 2
  const distanceFromCenter = calculateDistance({ x, y }, { x: centerX, y: centerY })
  
  // 市中心多商业
  if (distanceFromCenter < 4) {
    const rand = Math.random()
    if (rand > 0.7) return { type: 'commercial' as const, features: ['市中心'] }
    if (rand > 0.3) return { type: 'residential' as const, features: ['市中心'] }
    return { type: 'special' as const, features: ['黄金地段'] }
  }
  
  // 郊区多工业和农业
  if (distanceFromCenter > 8) {
    const rand = Math.random()
    if (rand > 0.6) return { type: 'industrial' as const, features: ['郊区'] }
    if (rand > 0.3) return { type: 'agricultural' as const, features: ['郊区'] }
    return { type: 'residential' as const, features: ['郊区'] }
  }
  
  // 中间地带混合
  const rand = Math.random()
  if (rand > 0.7) return { type: 'commercial' as const, features: [] }
  if (rand > 0.4) return { type: 'residential' as const, features: [] }
  if (rand > 0.2) return { type: 'industrial' as const, features: [] }
  return { type: 'agricultural' as const, features: [] }
}

// 检查是否靠近地铁
function isNearSubway(x: number, y: number, stations: CityConfig['subwayStations']) {
  return stations.some(station => 
    Math.abs(station.x - x) <= 1 && Math.abs(station.y - y) <= 1
  )
}

// 检查是否靠近水体
function isNearWater(x: number, y: number, waterBodies?: CityConfig['waterBodies']) {
  if (!waterBodies) return false
  return waterBodies.some(water => {
    if (water.type === 'lake') {
      return x >= water.x - 1 && x <= water.x + water.width &&
             y >= water.y - 1 && y <= water.y + water.height
    }
    // 河流逻辑
    return Math.abs(x - water.x) <= 1 && y >= water.y && y <= water.y + water.height
  })
}

// 获取所在商圈
function getBusinessDistrict(
  x: number, 
  y: number, 
  districts?: CityConfig['businessDistricts']
): string | null {
  if (!districts) return null
  
  for (const district of districts) {
    const distance = calculateDistance({ x, y }, district.center)
    if (distance <= district.radius) {
      return district.name
    }
  }
  return null
}

// 计算位置加成
function calculateLocationMultiplier(
  coords: { x: number; y: number },
  config: CityConfig,
  nearSubway: boolean,
  nearWater: boolean,
  inBusinessDistrict: string | null
): number {
  let multiplier = 1
  
  // 距离市中心
  const centerX = config.gridSize.width / 2
  const centerY = config.gridSize.height / 2
  const distanceFromCenter = calculateDistance(coords, { x: centerX, y: centerY })
  multiplier *= (1.5 - distanceFromCenter * 0.03)
  
  // 地铁加成
  if (nearSubway) multiplier *= 1.5
  
  // 水景加成
  if (nearWater) multiplier *= 1.2
  
  // 商圈加成
  if (inBusinessDistrict) {
    if (inBusinessDistrict.includes('CBD')) multiplier *= 1.8
    else if (inBusinessDistrict.includes('科技')) multiplier *= 1.6
    else multiplier *= 1.4
  }
  
  return Math.max(0.5, Math.min(3, multiplier))
}

// 生成建筑
function generateBuilding(
  plotType: Plot['type'], 
  isPopular: boolean,
  isPremium: boolean
): Plot['building'] {
  if (plotType === 'landmark' || plotType === 'protected') return undefined
  
  const shopOptions = SHOP_CONFIGS[plotType] || SHOP_CONFIGS.commercial
  
  // 高端地段可能有品牌店
  if (isPremium && plotType === 'commercial' && Math.random() > 0.7) {
    const brand = FAMOUS_BRANDS[Math.floor(Math.random() * FAMOUS_BRANDS.length)]
    return {
      ...brand,
      type: brand.type as any,
      level: Math.floor(Math.random() * 2) + 4, // 4-5级
      openTime: '10:00-22:00',
      category: '品牌旗舰店'
    }
  }
  
  // 普通商店
  const selectedShop = shopOptions[Math.floor(Math.random() * shopOptions.length)]
  const popularityBonus = isPopular ? 10 : 0
  const levelBonus = isPremium ? 1 : 0
  
  return {
    ...selectedShop,
    type: selectedShop.type as any,
    level: Math.min(5, Math.floor(Math.random() * 3) + 1 + levelBonus),
    floors: plotType === 'commercial' ? Math.floor(Math.random() * 3) + 1 : undefined,
    popularity: Math.min(100, selectedShop.popularity + popularityBonus + Math.floor(Math.random() * 10) - 5)
  }
}

// 计算人流量
function calculateTrafficFlow(
  nearSubway: boolean,
  type: Plot['type'],
  inBusinessDistrict: string | null
): number {
  let base = 2
  
  if (type === 'commercial') base = 3
  if (type === 'landmark') base = 5
  if (nearSubway) base += 1
  if (inBusinessDistrict) base += 1
  
  return Math.min(5, base + Math.floor(Math.random() * 2) - 1)
}

// 生成模拟交易数据
export function generateMockTransactions(userId: string, count: number = 10) {
  const types = ['买入', '卖出', '租金收入', '商店升级', '建设费用']
  const transactions = []
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const amount = Math.floor(Math.random() * 100000) + 10000
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 30))
    
    transactions.push({
      id: `tx-${Date.now()}-${i}`,
      type,
      amount: type === '买入' || type === '建设费用' || type === '商店升级' ? -amount : amount,
      date: date.toISOString(),
      description: `${type} - 地块${Math.floor(Math.random() * 300).toString().padStart(3, '0')}`,
      status: 'completed'
    })
  }
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// PWA 相关工具
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return false
  }
  
  if (Notification.permission === 'granted') {
    return true
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  
  return false
}

export function sendNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      ...options
    })
  }
}

// 性能优化：节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

// 振动反馈（移动端）
export function vibrate(pattern: number | number[] = 50) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}
