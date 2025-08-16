// src/app/mining/BetaNotice.tsx
// 内测提示组件 - 向用户展示内测阶段的友好提醒
// 
// 功能说明：
// 1. 首次进入显示内测提示
// 2. 用户可以关闭提示
// 3. 记住用户选择（24小时内不再显示）
// 4. 提供反馈渠道信息
// 
// 使用方式：
// import { BetaNotice } from './BetaNotice'
// <BetaNotice />
// 
// 关联文件：
// - 被 @/app/mining/page.tsx 使用（挖矿主页面）
// - 使用 @/utils/safeStorage（安全存储）
// - 使用 @/components/shared/PixelCard
// 
// 创建时间：2024-01
// 更新历史：
// - 2024-01: 创建内测提示组件

'use client'

import { useState, useEffect } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { safeStorage } from '@/utils/safeStorage'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'mining_beta_notice_dismissed'
const DISMISS_DURATION = 24 * 60 * 60 * 1000 // 24小时

interface BetaNoticeProps {
  className?: string
  compact?: boolean // 紧凑模式（移动端）
}

/**
 * 内测提示组件
 */
export function BetaNotice({ className, compact = false }: BetaNoticeProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 检查是否应该显示提示
  useEffect(() => {
    setMounted(true)
    
    // 检查是否已经关闭过
    const dismissed = safeStorage.getItem(STORAGE_KEY)
    if (dismissed) {
      try {
        const data = JSON.parse(dismissed)
        const now = Date.now()
        
        // 如果还在关闭期限内，不显示
        if (data.timestamp && now - data.timestamp < DISMISS_DURATION) {
          return
        }
      } catch (e) {
        // 解析失败，清除并显示
        safeStorage.removeItem(STORAGE_KEY)
      }
    }
    
    // 延迟显示，避免页面加载时太突兀
    const timer = setTimeout(() => {
      setIsVisible(true)
      setIsAnimating(true)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  // 处理关闭
  const handleDismiss = () => {
    setIsAnimating(false)
    
    // 保存关闭状态
    safeStorage.setItem(STORAGE_KEY, JSON.stringify({
      dismissed: true,
      timestamp: Date.now()
    }))
    
    // 延迟隐藏，让动画完成
    setTimeout(() => {
      setIsVisible(false)
    }, 300)
  }

  // 处理"我知道了"按钮
  const handleUnderstood = () => {
    handleDismiss()
  }

  // 复制联系方式
  const handleCopyContact = (contact: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(contact).then(() => {
        // 可以添加 toast 提示
        console.log('联系方式已复制')
      })
    }
  }

  if (!mounted || !isVisible) {
    return null
  }

  // 紧凑模式（移动端）
  if (compact) {
    return (
      <div
        className={cn(
          "fixed bottom-4 left-4 right-4 z-50 transition-all duration-300",
          isAnimating ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
          className
        )}
      >
        <PixelCard className="bg-gradient-to-r from-yellow-900/95 to-orange-900/95 border-yellow-500/50 shadow-xl">
          <div className="p-3">
            {/* 标题栏 */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🚧</span>
                <h3 className="font-bold text-sm text-yellow-400">内测提示</h3>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* 内容 */}
            <p className="text-xs text-gray-200 mb-3">
              挖矿系统正在内测中，可能存在不稳定情况。如遇问题请及时反馈！
            </p>
            
            {/* 按钮 */}
            <PixelButton
              size="xs"
              onClick={handleUnderstood}
              className="w-full"
            >
              我知道了
            </PixelButton>
          </div>
        </PixelCard>
      </div>
    )
  }

  // 完整模式（桌面端）
  return (
    <div
      className={cn(
        "fixed top-20 right-4 z-50 max-w-md transition-all duration-300",
        isAnimating ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        className
      )}
    >
      <PixelCard className="bg-gradient-to-br from-yellow-900/95 to-orange-900/95 border-yellow-500/50 shadow-2xl">
        <div className="p-4">
          {/* 标题栏 */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-pulse">🚧</span>
              <h3 className="font-bold text-lg text-yellow-400">内测阶段提示</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white transition-colors p-1"
              aria-label="关闭提示"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* 主要内容 */}
          <div className="space-y-3 text-sm">
            <div className="bg-black/30 rounded-lg p-3">
              <p className="text-gray-200 leading-relaxed">
                <span className="text-yellow-400 font-bold">亲爱的矿主：</span>
              </p>
              <p className="text-gray-200 leading-relaxed mt-2">
                欢迎参与挖矿系统内测！当前功能处于 <span className="text-orange-400 font-bold">Beta 测试阶段</span>，
                我们正在持续优化和完善。
              </p>
            </div>
            
            {/* 注意事项 */}
            <div className="space-y-2">
              <p className="text-xs text-gray-400 font-bold">可能遇到的情况：</p>
              <ul className="text-xs text-gray-300 space-y-1">
                <li className="flex items-start gap-1">
                  <span className="text-yellow-400">•</span>
                  <span>功能暂时不稳定或响应缓慢</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-yellow-400">•</span>
                  <span>部分设备兼容性问题</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-yellow-400">•</span>
                  <span>数据显示可能有延迟</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-yellow-400">•</span>
                  <span>界面可能临时调整</span>
                </li>
              </ul>
            </div>
            
            {/* 反馈渠道 */}
            <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
              <p className="text-xs text-blue-400 font-bold mb-2">
                💡 发现问题？请通过以下方式反馈：
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => handleCopyContact('customer@pxsj.net.cn')}
                  className="text-xs text-gray-300 hover:text-white transition-colors flex items-center gap-1 group"
                >
                  <span>📧</span>
                  <span className="group-hover:underline">service@pxsj.net.cn</span>
                  <span className="text-gray-500 text-[10px]">(点击复制)</span>
                </button>
              </div>
            </div>
            
            {/* 承诺 */}
            <div className="bg-green-900/20 rounded-lg p-2 border border-green-500/30">
              <p className="text-xs text-green-400 text-center">
                ✅ 我们承诺在收到反馈后 <span className="font-bold">24小时内</span> 响应并尽快修复！
              </p>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="mt-4 flex gap-2">
            <PixelButton
              size="sm"
              onClick={handleUnderstood}
              className="flex-1"
            >
              <span className="flex items-center justify-center gap-1">
                <span>👍</span>
                <span>我知道了</span>
              </span>
            </PixelButton>
            <PixelButton
              size="sm"
              variant="secondary"
              onClick={() => window.open('https://www.pxsj.net.cn/help', '_blank')}
              className="flex-1"
            >
              <span className="flex items-center justify-center gap-1">
                <span>📖</span>
                <span>查看帮助</span>
              </span>
            </PixelButton>
          </div>
          
          {/* 底部提示 */}
          <p className="text-[10px] text-gray-500 text-center mt-3">
            此提示24小时内不再显示 · 感谢您的理解与支持
          </p>
        </div>
      </PixelCard>
    </div>
  )
}

/**
 * 简化版内测横幅
 * 用于页面顶部的持续提醒
 */
export function BetaBanner({ className }: { className?: string }) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) {
    return null
  }

  return (
    <div className={cn(
      "bg-gradient-to-r from-yellow-900/90 to-orange-900/90 border-b border-yellow-500/30",
      className
    )}>
      <div className="container mx-auto px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-yellow-400 animate-pulse">🚧</span>
            <p className="text-xs sm:text-sm text-yellow-200">
              <span className="font-bold">内测中：</span>
              <span className="hidden sm:inline"> 系统可能不稳定，</span>
              <span>如遇问题请及时反馈</span>
              <span className="hidden md:inline"> - 我们会第一时间处理</span>
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="关闭横幅"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// 导出默认组件
export default BetaNotice
