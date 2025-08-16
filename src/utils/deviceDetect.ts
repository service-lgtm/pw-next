// src/utils/deviceDetect.ts
// 设备检测工具类 - 用于识别不同设备和浏览器环境
// 
// 功能说明：
// 1. 检测是否为安卓/iOS设备
// 2. 检测是否在 WebView 中运行
// 3. 检测浏览器类型和版本
// 4. 提供设备能力检测
// 
// 使用方式：
// import { isAndroidDevice, isInWebView } from '@/utils/deviceDetect'
// 
// 关联文件：
// - 被 @/app/mining/page.tsx 使用（条件渲染）
// - 被各组件使用进行兼容性处理
// 
// 创建时间：2024-01
// 更新历史：
// - 2024-01: 创建此文件用于设备检测和兼容性处理

'use client'

/**
 * 检测是否为安卓设备
 */
export function isAndroidDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  const userAgent = window.navigator.userAgent.toLowerCase()
  return /android/i.test(userAgent)
}

/**
 * 检测是否为 iOS 设备
 */
export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  const userAgent = window.navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/i.test(userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) // iPad Pro
}

/**
 * 检测是否为移动设备
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  // 检测触摸能力
  const hasTouchScreen = 'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  
  // 检测屏幕尺寸
  const isSmallScreen = window.innerWidth < 768
  
  // 检测 User Agent
  const mobileUA = isAndroidDevice() || isIOSDevice()
  
  return mobileUA || (hasTouchScreen && isSmallScreen)
}

/**
 * 检测是否在 WebView 中
 */
export function isInWebView(): boolean {
  if (typeof window === 'undefined') return false
  
  const ua = window.navigator.userAgent.toLowerCase()
  
  // 检测各种 WebView 环境
  const webViewPatterns = [
    /wv/,                    // Android WebView
    /micromessenger/i,       // 微信
    /qq/i,                   // QQ
    /alipay/i,              // 支付宝
    /dingtalk/i,            // 钉钉
    /baiduboxapp/i,         // 百度
    /twitter/i,             // Twitter
    /fb_iab/i,              // Facebook
    /fbav/i,                // Facebook
    /instagram/i,           // Instagram
    /line/i,                // Line
  ]
  
  return webViewPatterns.some(pattern => pattern.test(ua))
}

/**
 * 获取安卓版本
 */
export function getAndroidVersion(): number | null {
  if (!isAndroidDevice()) return null
  
  const match = navigator.userAgent.match(/Android\s([0-9.]*)/i)
  if (match && match[1]) {
    return parseFloat(match[1])
  }
  return null
}

/**
 * 获取 iOS 版本
 */
export function getIOSVersion(): number | null {
  if (!isIOSDevice()) return null
  
  const match = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/i)
  if (match && match[1]) {
    return parseInt(match[1], 10)
  }
  return null
}

/**
 * 检测是否为旧版安卓（低于 5.0）
 */
export function isOldAndroid(): boolean {
  const version = getAndroidVersion()
  return version !== null && version < 5
}

/**
 * 检测是否支持某个 CSS 特性
 */
export function supportsCSSFeature(property: string, value?: string): boolean {
  if (typeof window === 'undefined') return false
  
  const element = document.createElement('div')
  const style = element.style as any
  
  // 检查属性是否存在
  if (!(property in style)) {
    return false
  }
  
  // 如果提供了值，检查值是否支持
  if (value !== undefined) {
    style[property] = value
    return style[property] === value
  }
  
  return true
}

/**
 * 检测是否支持 localStorage
 */
export function supportsLocalStorage(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const test = '__localStorage_test__'
    window.localStorage.setItem(test, test)
    window.localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

/**
 * 检测是否支持 sessionStorage
 */
export function supportsSessionStorage(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const test = '__sessionStorage_test__'
    window.sessionStorage.setItem(test, test)
    window.sessionStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

/**
 * 检测是否支持 Service Worker
 */
export function supportsServiceWorker(): boolean {
  if (typeof window === 'undefined') return false
  
  return 'serviceWorker' in navigator
}

/**
 * 检测是否支持 Web Workers
 */
export function supportsWebWorker(): boolean {
  if (typeof window === 'undefined') return false
  
  return typeof Worker !== 'undefined'
}

/**
 * 检测网络连接状态
 */
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true
  
  return navigator.onLine
}

/**
 * 获取网络连接类型
 */
export function getConnectionType(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection
  
  if (connection) {
    return connection.effectiveType || connection.type || 'unknown'
  }
  
  return 'unknown'
}

/**
 * 检测是否为低速网络
 */
export function isSlowNetwork(): boolean {
  const type = getConnectionType()
  return ['slow-2g', '2g', '3g'].includes(type)
}

/**
 * 获取设备信息汇总
 */
export interface DeviceInfo {
  isAndroid: boolean
  isIOS: boolean
  isMobile: boolean
  isWebView: boolean
  androidVersion: number | null
  iosVersion: number | null
  isOldAndroid: boolean
  supportsLocalStorage: boolean
  supportsSessionStorage: boolean
  isOnline: boolean
  connectionType: string
  isSlowNetwork: boolean
  screenWidth: number
  screenHeight: number
  pixelRatio: number
  userAgent: string
}

export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      isAndroid: false,
      isIOS: false,
      isMobile: false,
      isWebView: false,
      androidVersion: null,
      iosVersion: null,
      isOldAndroid: false,
      supportsLocalStorage: false,
      supportsSessionStorage: false,
      isOnline: true,
      connectionType: 'unknown',
      isSlowNetwork: false,
      screenWidth: 0,
      screenHeight: 0,
      pixelRatio: 1,
      userAgent: ''
    }
  }
  
  return {
    isAndroid: isAndroidDevice(),
    isIOS: isIOSDevice(),
    isMobile: isMobileDevice(),
    isWebView: isInWebView(),
    androidVersion: getAndroidVersion(),
    iosVersion: getIOSVersion(),
    isOldAndroid: isOldAndroid(),
    supportsLocalStorage: supportsLocalStorage(),
    supportsSessionStorage: supportsSessionStorage(),
    isOnline: isOnline(),
    connectionType: getConnectionType(),
    isSlowNetwork: isSlowNetwork(),
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1,
    userAgent: navigator.userAgent
  }
}

/**
 * 在开发环境下输出设备信息
 */
export function logDeviceInfo(): void {
  if (process.env.NODE_ENV === 'development') {
    const info = getDeviceInfo()
    console.group('[DeviceDetect] Device Information')
    console.table(info)
    console.groupEnd()
  }
}

// 自动记录设备信息（仅开发环境）
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.addEventListener('load', () => {
    logDeviceInfo()
  })
  
  // 暴露到 window 对象方便调试
  (window as any).__deviceInfo = getDeviceInfo
}
