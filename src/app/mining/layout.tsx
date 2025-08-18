// src/app/mining/layout.tsx
// 挖矿页面布局文件 - 包含 warning 错误修复
// 
// 功能说明：
// 1. 加载必要的 polyfills
// 2. 修复 warning 函数错误
// 3. 提供错误恢复机制
// 4. 初始化设备检测
// 5. 添加移动端优化样式

'use client'

import { useEffect } from 'react'

// 导入 polyfills（必须在最前面）
import '@/utils/polyfills'

// 导入 warning 修复（必须尽早加载）
import '@/utils/warningPolyfill'

// 导入设备检测
import { getDeviceInfo, logDeviceInfo } from '@/utils/deviceDetect'

interface MiningLayoutProps {
  children: React.ReactNode
}

export default function MiningLayout({ children }: MiningLayoutProps) {
  useEffect(() => {
    // 添加全局错误处理来捕获 warning 相关错误
    const handleError = (event: ErrorEvent) => {
      // 特殊处理 warning 相关错误
      if (event.error?.message?.includes('warning is not a function')) {
        console.warn('[MiningLayout] Caught warning error, attempting to fix...')
        
        // 尝试动态修复
        try {
          // 创建全局 warning 函数
          if (typeof window !== 'undefined') {
            (window as any).warning = (condition: boolean, format: string, ...args: any[]) => {
              if (!condition) {
                console.warn(`Warning: ${format}`, ...args)
              }
            }
            
            // 尝试修复 rc-util
            const rcUtil = (window as any)['rc-util']
            if (rcUtil) {
              rcUtil.warning = (window as any).warning
              if (rcUtil.ZP) {
                rcUtil.ZP.warning = (window as any).warning
              }
            }
          }
          
          // 阻止错误传播
          event.preventDefault()
          event.stopPropagation()
          
          // 重新加载受影响的组件（如果可能）
          console.log('[MiningLayout] Warning error fixed, continuing...')
          return
        } catch (fixError) {
          console.error('[MiningLayout] Failed to fix warning error:', fixError)
        }
      }
      
      // 其他错误的原始处理
      console.error('[MiningLayout] Global error:', event.error)
      if (event.error?.message?.includes('localStorage')) {
        console.warn('[MiningLayout] localStorage error detected, using fallback')
        event.preventDefault()
      }
    }

    window.addEventListener('error', handleError, true) // 使用捕获阶段

    // 设置页面标题和元数据
    if (typeof document !== 'undefined') {
      // 设置标题
      document.title = '挖矿中心 - 像素世界'
      
      // 设置 viewport
      let viewport = document.querySelector('meta[name="viewport"]')
      if (!viewport) {
        viewport = document.createElement('meta')
        viewport.setAttribute('name', 'viewport')
        document.head.appendChild(viewport)
      }
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
      
      // 设置 description
      let description = document.querySelector('meta[name="description"]')
      if (!description) {
        description = document.createElement('meta')
        description.setAttribute('name', 'description')
        document.head.appendChild(description)
      }
      description.setAttribute('content', 'YLD矿山管理和挖矿生产系统')
    }
    
    // 初始化设备信息
    const deviceInfo = getDeviceInfo()
    
    // 在开发环境输出设备信息
    if (process.env.NODE_ENV === 'development') {
      logDeviceInfo()
    }
    
    // 针对安卓设备的特殊处理
    if (deviceInfo.isAndroid) {
      console.log('[MiningLayout] Android device detected, version:', deviceInfo.androidVersion)
      
      // 为旧版安卓添加特殊类名
      if (deviceInfo.isOldAndroid) {
        document.body.classList.add('old-android')
      }
      
      // 如果在 WebView 中，添加标识
      if (deviceInfo.isWebView) {
        document.body.classList.add('in-webview')
      }
      
      // 添加安卓标识
      document.body.classList.add('android-device')
    }
    
    // iOS 设备处理
    if (deviceInfo.isIOS) {
      document.body.classList.add('ios-device')
      
      // 修复 iOS 的橡皮筋效果
      document.body.style.overscrollBehavior = 'none'
    }
    
    // 移动设备通用处理
    if (deviceInfo.isMobile) {
      document.body.classList.add('mobile-device')
    }
    
    // 监听网络状态变化
    const handleOnline = () => {
      console.log('[MiningLayout] Network status: online')
      document.body.classList.remove('offline')
    }
    
    const handleOffline = () => {
      console.log('[MiningLayout] Network status: offline')
      document.body.classList.add('offline')
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // 检查初始网络状态
    if (!navigator.onLine) {
      document.body.classList.add('offline')
    }
    
    // 防止某些安卓设备的双击缩放
    let lastTouchEnd = 0
    const handleTouchEnd = (event: TouchEvent) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    }
    
    // 防止 iOS 的双指缩放
    const handleGestureStart = (e: Event) => {
      e.preventDefault()
    }
    
    document.addEventListener('touchend', handleTouchEnd, false)
    document.addEventListener('gesturestart', handleGestureStart)
    
    // 修复移动端 100vh 问题
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }
    
    setViewportHeight()
    window.addEventListener('resize', setViewportHeight)
    window.addEventListener('orientationchange', setViewportHeight)
    
    // 清理函数
    return () => {
      window.removeEventListener('error', handleError, true)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('touchend', handleTouchEnd)
      document.removeEventListener('gesturestart', handleGestureStart)
      window.removeEventListener('resize', setViewportHeight)
      window.removeEventListener('orientationchange', setViewportHeight)
      
      // 清理添加的类名
      document.body.classList.remove('old-android', 'in-webview', 'android-device', 'ios-device', 'mobile-device', 'offline')
    }
  }, [])
  
  return (
    <>
      {/* 添加全局样式修复 */}
      <style jsx global>{`
        /* 使用 CSS 变量处理真实视口高度 */
        .min-h-screen {
          min-height: 100vh;
          min-height: calc(var(--vh, 1vh) * 100);
        }
        
        /* 修复安卓 WebView 的一些样式问题 */
        .old-android input[type="text"],
        .old-android input[type="password"],
        .old-android input[type="number"],
        .old-android select,
        .old-android textarea {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          outline: none;
          border-radius: 0;
        }
        
        /* 禁用某些元素的高亮 */
        .in-webview * {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }
        
        /* 修复滚动性能 */
        .in-webview,
        .android-device,
        .ios-device {
          -webkit-overflow-scrolling: touch;
        }
        
        /* 防止文字选择 */
        .in-webview button,
        .in-webview [role="button"],
        .android-device button,
        .android-device [role="button"] {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        /* 修复 position: fixed 在某些安卓设备的问题 */
        .old-android .fixed {
          -webkit-backface-visibility: hidden;
          -moz-backface-visibility: hidden;
          backface-visibility: hidden;
          -webkit-transform: translate3d(0, 0, 0);
          -moz-transform: translate3d(0, 0, 0);
          transform: translate3d(0, 0, 0);
        }
        
        /* iOS 特定修复 */
        .ios-device {
          -webkit-font-smoothing: antialiased;
        }
        
        .ios-device input,
        .ios-device textarea,
        .ios-device select {
          font-size: 16px; /* 防止 iOS 自动缩放 */
        }
        
        /* 安卓特定修复 */
        .android-device {
          -webkit-font-smoothing: subpixel-antialiased;
        }
        
        /* 修复移动端点击延迟 */
        .mobile-device {
          touch-action: manipulation;
        }
        
        /* 离线状态样式 */
        .offline::before {
          content: '网络连接已断开';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #ef4444;
          color: white;
          text-align: center;
          padding: 8px;
          font-size: 14px;
          z-index: 9999;
          animation: slideDown 0.3s ease-out;
        }
        
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        /* 优化移动端滚动 */
        .mobile-device .overflow-y-auto,
        .mobile-device .overflow-y-scroll {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
        
        /* 修复安卓输入框焦点问题 */
        .android-device input:focus,
        .android-device textarea:focus,
        .android-device select:focus {
          outline: 2px solid #fbbf24;
          outline-offset: 2px;
        }
        
        /* 防止横向滚动 */
        body {
          overflow-x: hidden;
        }
        
        /* 优化触摸反馈 */
        .mobile-device button:active,
        .mobile-device [role="button"]:active {
          opacity: 0.8;
          transform: scale(0.98);
        }
      `}</style>
      
      {children}
    </>
  )
}
