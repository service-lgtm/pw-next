// src/app/mining/miningConstants.ts
// 挖矿系统常量定义文件 - 增强版（添加工具与土地类型映射）
// 
// 文件说明：
// 本文件集中管理挖矿系统的所有常量定义，包括土地类型、资源消耗率、税率等
// 从 MiningSessions.tsx 中拆分出来，便于统一管理和维护
// 
// 创建原因：
// - MiningSessions.tsx 文件过大（2000+行），需要拆分以提高可维护性
// - 常量定义集中管理，方便修改和查找
// - 多个组件需要共享这些常量
// 
// 更新历史：
// - 2025-01: 从 MiningSessions.tsx 拆分出来
// - 2025-01: 添加所有土地类型的支持
// - 2025-01: 添加工具与土地类型映射关系，解决工具选择错误问题
// 
// 使用方式：
// import { MINABLE_LAND_TYPES, LAND_TYPE_MAP, TOOL_LAND_MAP } from './miningConstants'
// 
// 关联文件：
// - 被 MiningSessions.tsx 引用（主挖矿会话组件）
// - 被 LandSelector.tsx 引用（土地选择器组件）
// - 被 StartMiningForm.tsx 引用（开始挖矿表单）- 使用工具映射进行智能筛选
// - 被 SessionCard.tsx 引用（会话卡片组件）

/**
 * 资源消耗率定义
 */
export const FOOD_CONSUMPTION_RATE = 2        // 每个工具每小时消耗粮食数量
export const DURABILITY_CONSUMPTION_RATE = 1  // 每个工具每小时消耗耐久度

/**
 * 税率定义（不同挖矿模式的税率）
 */
export const TAX_RATES = {
  'SELF_MINING': 0.05,           // 自主挖矿税率 5%
  'RECRUIT_WITH_TOOL': 0.08,     // 招募挖矿（提供工具）税率 8%
  'RECRUIT_NO_TOOL': 0.07         // 招募挖矿（不提供工具）税率 7%
}

/**
 * 支持挖矿的土地类型列表
 * 这些土地类型可以进行挖矿操作
 */
export const MINABLE_LAND_TYPES = [
  'iron_mine',   // 铁矿山
  'stone_mine',  // 石矿山
  'forest',      // 森林
  'farm',        // 农场
  'yld_mine'     // YLD矿山
]

/**
 * 土地类型映射表（英文 -> 中文）
 * 用于界面显示土地类型的中文名称
 */
export const LAND_TYPE_MAP: { [key: string]: string } = {
  // 可挖矿的土地类型
  'iron_mine': '铁矿山',
  'stone_mine': '石矿山',
  'forest': '森林',
  'farm': '农场',
  'yld_mine': 'YLD矿山',
  
  // 不可挖矿的土地类型
  'urban': '城市用地',
  'residential': '住宅用地',
  'commercial': '商业用地',
  'industrial': '工业用地',
  
  // 其他土地类型（预留）
  'grassland': '草原',
  'desert': '沙漠',
  'mountain': '山地',
  'lake': '湖泊',
  'ocean': '海洋'
}

/**
 * 土地类型对应的产出资源映射表
 * 定义每种土地类型产出的资源类型
 */
export const LAND_RESOURCE_MAP: { [key: string]: string } = {
  'iron_mine': '铁矿',     // 铁矿山产出铁矿
  'stone_mine': '石头',    // 石矿山产出石头
  'forest': '木材',        // 森林产出木材
  'farm': '粮食',          // 农场产出粮食
  'yld_mine': 'YLD'        // YLD矿山产出YLD代币
}

/**
 * 工具类型定义
 */
export const TOOL_TYPES = {
  PICKAXE: 'pickaxe',  // 镐
  AXE: 'axe',          // 斧头
  HOE: 'hoe'           // 锄头
}

/**
 * 工具类型中文名称映射
 */
export const TOOL_TYPE_NAMES: { [key: string]: string } = {
  'pickaxe': '镐',
  'axe': '斧头',
  'hoe': '锄头'
}

/**
 * 工具类型图标映射
 */
export const TOOL_TYPE_ICONS: { [key: string]: string } = {
  'pickaxe': '⛏️',
  'axe': '🪓',
  'hoe': '🔨'
}

/**
 * 工具与土地类型映射关系
 * 定义每种工具可以用于哪些土地类型
 * 
 * 规则：
 * - 镐 → 铁矿山、石矿山、YLD矿山
 * - 斧头 → 森林
 * - 锄头 → 农场
 */
export const TOOL_LAND_MAP: { [toolType: string]: string[] } = {
  'pickaxe': ['iron_mine', 'stone_mine', 'yld_mine'],  // 镐可用于矿山类型
  'axe': ['forest'],                                    // 斧头可用于森林
  'hoe': ['farm']                                       // 锄头可用于农场
}

/**
 * 土地与工具类型映射关系（反向映射）
 * 定义每种土地类型需要使用哪种工具
 */
export const LAND_TOOL_MAP: { [landType: string]: string } = {
  'iron_mine': 'pickaxe',   // 铁矿山需要镐
  'stone_mine': 'pickaxe',  // 石矿山需要镐
  'yld_mine': 'pickaxe',    // YLD矿山需要镐
  'forest': 'axe',          // 森林需要斧头
  'farm': 'hoe'             // 农场需要锄头
}

/**
 * 检查工具是否适用于指定土地类型
 * @param toolType - 工具类型
 * @param landType - 土地类型
 * @returns 是否适用
 */
export function isToolValidForLand(toolType: string, landType: string): boolean {
  const validLandTypes = TOOL_LAND_MAP[toolType] || []
  return validLandTypes.includes(landType)
}

/**
 * 获取土地类型所需的工具类型
 * @param landType - 土地类型
 * @returns 所需的工具类型
 */
export function getRequiredToolType(landType: string): string | null {
  return LAND_TOOL_MAP[landType] || null
}

/**
 * 获取工具类型的描述信息
 * @param toolType - 工具类型
 * @returns 描述信息
 */
export function getToolTypeInfo(toolType: string): {
  name: string
  icon: string
  validLands: string[]
  description: string
} {
  const name = TOOL_TYPE_NAMES[toolType] || '未知工具'
  const icon = TOOL_TYPE_ICONS[toolType] || '🔧'
  const validLands = TOOL_LAND_MAP[toolType] || []
  
  let description = ''
  if (toolType === 'pickaxe') {
    description = '适用于开采矿石（铁矿山、石矿山、YLD矿山）'
  } else if (toolType === 'axe') {
    description = '适用于砍伐木材（森林）'
  } else if (toolType === 'hoe') {
    description = '适用于耕种土地（农场）'
  }
  
  return { name, icon, validLands, description }
}

/**
 * 资源类型的图标映射
 * 用于界面显示
 */
export const RESOURCE_ICONS: { [key: string]: string } = {
  '铁矿': '⛏️',
  '石头': '🪨',
  '木材': '🪵',
  '粮食': '🌾',
  'YLD': '💎',
  '工具': '🔧',
  '砖块': '🧱'
}

/**
 * 新算法版本定义
 */
export const ALGORITHM_VERSIONS = {
  V1: 'v1',      // 旧算法（已弃用）
  V2: 'v2'       // 新算法（当前使用）
}

/**
 * 默认算法版本
 */
export const DEFAULT_ALGORITHM_VERSION = ALGORITHM_VERSIONS.V2

/**
 * YLD系统限制
 */
export const YLD_LIMITS = {
  DAILY_LIMIT: 208,           // 每日YLD产量限制
  WARNING_THRESHOLD: 0.9,     // 警告阈值（90%）
  CRITICAL_THRESHOLD: 0.95    // 严重警告阈值（95%）
}

/**
 * 工具相关常量
 */
export const TOOL_CONSTANTS = {
  MAX_DURABILITY: 1500,        // 工具最大耐久度
  LOW_DURABILITY_THRESHOLD: 100, // 低耐久度警告阈值
  CRITICAL_DURABILITY: 50      // 严重低耐久度阈值
}

/**
 * 时间相关常量（毫秒）
 */
export const TIME_CONSTANTS = {
  HOUR: 3600000,               // 1小时的毫秒数
  MINUTE: 60000,               // 1分钟的毫秒数
  REFRESH_INTERVAL: 30000,     // 默认刷新间隔（30秒）
  SETTLEMENT_CHECK_INTERVAL: 60000 // 结算检查间隔（1分钟）
}

/**
 * 错误消息类型
 * 用于识别不同类型的错误
 */
export const ERROR_TYPES = {
  LAND_NOT_SUPPORTED: '土地类型不支持',
  INSUFFICIENT_FOOD: '粮食不足',
  NO_TOOLS: '工具',
  LAND_ISSUE: '土地',
  YLD_LIMIT: 'YLD',
  TOOL_MISMATCH: '工具类型不匹配',  // 新增：工具类型不匹配错误
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  SERVER_ERROR: 500
}

/**
 * Toast 显示时长（毫秒）
 */
export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000
}

/**
 * 模态框尺寸定义
 */
export const MODAL_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
}

/**
 * 检查土地是否支持挖矿
 * @param landType - 土地类型
 * @returns 是否支持挖矿
 */
export function isMinableLandType(landType: string): boolean {
  return MINABLE_LAND_TYPES.includes(landType)
}

/**
 * 获取土地类型的中文名称
 * @param landType - 土地类型（英文）
 * @returns 中文名称
 */
export function getLandTypeDisplayName(landType: string): string {
  return LAND_TYPE_MAP[landType] || landType
}

/**
 * 获取土地产出的资源类型
 * @param landType - 土地类型
 * @returns 资源类型名称
 */
export function getLandResourceType(landType: string): string {
  return LAND_RESOURCE_MAP[landType] || '未知'
}

/**
 * 获取资源图标
 * @param resourceType - 资源类型
 * @returns 图标emoji
 */
export function getResourceIcon(resourceType: string): string {
  return RESOURCE_ICONS[resourceType] || '📦'
}
