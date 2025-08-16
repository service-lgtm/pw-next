// src/utils/safeStorage.ts
// 安全存储工具类 - 解决安卓设备 localStorage 兼容性问题
// 
// 功能说明：
// 1. 自动检测 localStorage 是否可用
// 2. 不可用时降级到内存存储
// 3. 提供统一的存储接口
// 4. 防止存储异常导致应用崩溃
// 
// 使用方式：
// import { safeStorage } from '@/utils/safeStorage'
// safeStorage.setItem('key', 'value')
// safeStorage.getItem('key')
// 
// 关联文件：
// - 被 @/app/mining/BetaPasswordModal.tsx 使用（替代 localStorage）
// - 被 @/app/mining/page.tsx 使用（存储临时状态）
// 
// 创建时间：2024-01
// 更新历史：
// - 2024-01: 创建此文件解决安卓 WebView localStorage 不可用问题

'use client'

/**
 * 安全存储类
 * 自动降级处理不支持 localStorage 的环境
 */
class SafeStorage {
  // 内存存储备份（当 localStorage 不可用时使用）
  private memoryStorage: Map<string, string> = new Map()
  
  // 缓存存储可用性检测结果
  private storageAvailable: boolean | null = null
  
  /**
   * 检测存储是否可用
   * @param type - 存储类型 'localStorage' 或 'sessionStorage'
   * @returns 是否可用
   */
  private isStorageAvailable(type: 'localStorage' | 'sessionStorage' = 'localStorage'): boolean {
    // 如果已经检测过，直接返回缓存结果
    if (this.storageAvailable !== null && type === 'localStorage') {
      return this.storageAvailable
    }
    
    try {
      // 服务端渲染时返回 false
      if (typeof window === 'undefined') {
        return false
      }
      
      const storage = window[type]
      
      // 检查 storage 对象是否存在
      if (!storage) {
        console.warn(`[SafeStorage] ${type} is not available`)
        if (type === 'localStorage') {
          this.storageAvailable = false
        }
        return false
      }
      
      // 测试读写功能
      const testKey = '__storage_test__'
      const testValue = 'test'
      
      storage.setItem(testKey, testValue)
      const retrievedValue = storage.getItem(testKey)
      storage.removeItem(testKey)
      
      const isAvailable = retrievedValue === testValue
      
      // 缓存 localStorage 的检测结果
      if (type === 'localStorage') {
        this.storageAvailable = isAvailable
        if (!isAvailable) {
          console.warn('[SafeStorage] localStorage test failed, falling back to memory storage')
        }
      }
      
      return isAvailable
    } catch (e) {
      // 可能的错误：
      // - SecurityError: 隐私模式
      // - QuotaExceededError: 存储已满
      // - TypeError: storage 不是对象
      console.warn(`[SafeStorage] ${type} availability check failed:`, e)
      
      if (type === 'localStorage') {
        this.storageAvailable = false
      }
      
      return false
    }
  }
  
  /**
   * 获取存储项
   * @param key - 存储键名
   * @returns 存储的值，不存在则返回 null
   */
  getItem(key: string): string | null {
    if (!key) {
      console.warn('[SafeStorage] getItem called with empty key')
      return null
    }
    
    try {
      // 优先使用 localStorage
      if (this.isStorageAvailable('localStorage')) {
        const value = localStorage.getItem(key)
        
        // 如果 localStorage 中没有，但内存中有，同步到 localStorage
        if (value === null && this.memoryStorage.has(key)) {
          const memValue = this.memoryStorage.get(key)!
          try {
            localStorage.setItem(key, memValue)
          } catch (e) {
            console.warn('[SafeStorage] Failed to sync to localStorage:', e)
          }
          return memValue
        }
        
        return value
      }
      
      // 降级到内存存储
      return this.memoryStorage.get(key) || null
    } catch (e) {
      console.error('[SafeStorage] getItem error:', e)
      // 出错时尝试从内存获取
      return this.memoryStorage.get(key) || null
    }
  }
  
  /**
   * 设置存储项
   * @param key - 存储键名
   * @param value - 要存储的值
   */
  setItem(key: string, value: string): void {
    if (!key) {
      console.warn('[SafeStorage] setItem called with empty key')
      return
    }
    
    // 确保 value 是字符串
    const stringValue = String(value)
    
    // 总是先存储到内存，确保数据不丢失
    this.memoryStorage.set(key, stringValue)
    
    try {
      // 尝试存储到 localStorage
      if (this.isStorageAvailable('localStorage')) {
        localStorage.setItem(key, stringValue)
      }
    } catch (e) {
      // 可能是存储配额已满或其他错误
      console.warn('[SafeStorage] setItem localStorage failed:', e)
      
      // 尝试清理一些旧数据后重试（可选）
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        this.handleQuotaExceeded(key, stringValue)
      }
    }
  }
  
  /**
   * 移除存储项
   * @param key - 存储键名
   */
  removeItem(key: string): void {
    if (!key) {
      console.warn('[SafeStorage] removeItem called with empty key')
      return
    }
    
    // 从内存中移除
    this.memoryStorage.delete(key)
    
    try {
      // 从 localStorage 中移除
      if (this.isStorageAvailable('localStorage')) {
        localStorage.removeItem(key)
      }
    } catch (e) {
      console.warn('[SafeStorage] removeItem localStorage failed:', e)
    }
  }
  
  /**
   * 清空所有存储
   */
  clear(): void {
    // 清空内存存储
    this.memoryStorage.clear()
    
    try {
      // 清空 localStorage
      if (this.isStorageAvailable('localStorage')) {
        localStorage.clear()
      }
    } catch (e) {
      console.warn('[SafeStorage] clear localStorage failed:', e)
    }
  }
  
  /**
   * 获取所有键名
   * @returns 键名数组
   */
  keys(): string[] {
    const memKeys = Array.from(this.memoryStorage.keys())
    
    try {
      if (this.isStorageAvailable('localStorage')) {
        const localKeys = Object.keys(localStorage)
        // 合并去重
        const allKeys = new Set([...memKeys, ...localKeys])
        return Array.from(allKeys)
      }
    } catch (e) {
      console.warn('[SafeStorage] keys localStorage failed:', e)
    }
    
    return memKeys
  }
  
  /**
   * 获取存储项数量
   * @returns 存储项数量
   */
  get length(): number {
    return this.keys().length
  }
  
  /**
   * 处理存储配额超出的情况
   * @param key - 要存储的键名
   * @param value - 要存储的值
   */
  private handleQuotaExceeded(key: string, value: string): void {
    console.warn('[SafeStorage] Storage quota exceeded, attempting cleanup...')
    
    try {
      // 清理过期的内测权限数据
      const betaKey = 'mining_beta_access'
      const betaData = localStorage.getItem(betaKey)
      if (betaData) {
        try {
          const parsed = JSON.parse(betaData)
          if (parsed.expiry && Date.now() > parsed.expiry) {
            localStorage.removeItem(betaKey)
            console.log('[SafeStorage] Removed expired beta access data')
          }
        } catch (e) {
          // 解析失败，直接删除
          localStorage.removeItem(betaKey)
        }
      }
      
      // 重试存储
      localStorage.setItem(key, value)
    } catch (e) {
      console.error('[SafeStorage] Cleanup and retry failed:', e)
    }
  }
  
  /**
   * 调试方法：获取存储状态信息
   */
  getStorageInfo(): {
    localStorageAvailable: boolean
    memoryStorageSize: number
    localStorageSize: number
  } {
    return {
      localStorageAvailable: this.isStorageAvailable('localStorage'),
      memoryStorageSize: this.memoryStorage.size,
      localStorageSize: this.isStorageAvailable('localStorage') ? localStorage.length : 0
    }
  }
}

// 导出单例实例
export const safeStorage = new SafeStorage()

// 导出类型定义（如果需要在其他地方使用）
export type { SafeStorage }

// 工具函数：安全地解析 JSON
export function safeJSONParse<T = any>(text: string | null, defaultValue: T): T {
  if (!text) return defaultValue
  
  try {
    return JSON.parse(text) as T
  } catch (e) {
    console.warn('[SafeStorage] JSON parse failed:', e)
    return defaultValue
  }
}

// 工具函数：安全地序列化 JSON
export function safeJSONStringify(value: any): string | null {
  try {
    return JSON.stringify(value)
  } catch (e) {
    console.error('[SafeStorage] JSON stringify failed:', e)
    return null
  }
}

// 导出检测函数
export function isStorageAvailable(): boolean {
  return safeStorage.getStorageInfo().localStorageAvailable
}

// 在开发环境下，将 safeStorage 暴露到 window 对象方便调试
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__safeStorage = safeStorage
  console.log('[SafeStorage] Debug mode enabled. Access via window.__safeStorage')
}
