// src/app/mining/layout.tsx
// 挖矿页面布局文件 - 提供页面级别的配置和错误处理
// 
// 功能说明：
// 1. 加载必要的 polyfills
// 2. 设置页面元数据
// 3. 提供错误恢复机制
// 4. 初始化设备检测
// 
// 关联文件：
// - @/utils/polyfills: Polyfills 配置
// - @/utils/deviceDetect: 设备检测工具
// - ./page.tsx: 挖矿主页面
// 
// 创建时间：2024-01
// 更新历史：
// - 2024-01: 创建此文件处理页面级别的初始化

'use client'

import { useEffect } from 'react'
import { Metadata } from 'next'

// 导入 polyfills（必须在最前面）
import '@/utils/polyfills'

// 导入设备检测
import { getDeviceInfo, logDeviceInfo } from '@/utils/deviceDetect'

// 页面元数据
export const metadata: Metadata = {
  title: '挖矿中心 - 像素世界',
  description: 'YLD矿山管理和挖矿生产系统',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

interface MiningLayoutProps {
  children: React.ReactNode
}

export default function MiningLayout({ children }: MiningLayoutProps) {
  useEffect(() => {
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
    }
    
    // 监听网络状态变化
    const handleOnline = () => {
      console.log('[MiningLayout] Network status: online')
    }
    
    const handleOffline = () => {
      console.log('[MiningLayout] Network status: offline')
      // 可以显示离线提示
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // 防止某些安卓设备的双击缩放
    let lastTouchEnd = 0
    const handleTouchEnd = (event: TouchEvent) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    }
    
    document.addEventListener('touchend', handleTouchEnd, false)
    
    // 清理函数
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])
  
  return (
    <>
      {/* 添加全局样式修复 */}
      <style jsx global>{`
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
        }
        
        /* 禁用某些元素的高亮 */
        .in-webview * {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }
        
        /* 修复滚动性能 */
        .in-webview {
          -webkit-overflow-scrolling: touch;
        }
        
        /* 防止文字选择 */
        .in-webview button,
        .in-webview [role="button"] {
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
      `}</style>
      
      {children}
    </>
  )
}
