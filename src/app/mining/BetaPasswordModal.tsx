// src/app/mining/BetaPasswordModal.tsx
// 内测密码验证模态框组件 - 安卓兼容版
// 
// 功能说明：
// 1. 用于验证用户是否有权限访问内测功能
// 2. 密码验证成功后会保存到安全存储（自动降级处理）
// 3. 提供密码验证状态管理
// 4. 兼容安卓设备的 localStorage 问题
// 
// 使用方式：
// import { BetaPasswordModal, hasBetaAccess } from '@/app/mining/BetaPasswordModal'
// 
// 关联文件：
// - 被 @/app/mining/page.tsx 使用（挖矿中心主页面）
// - 使用 @/components/shared/PixelModal（像素风格模态框）
// - 使用 @/components/shared/PixelButton（像素风格按钮）
// - 使用 @/utils/safeStorage（安全存储工具）
// 
// 更新历史：
// - 2024-01: 修复安卓设备 localStorage 兼容性问题
// - 2024-01: 使用 safeStorage 替代直接的 localStorage 调用

'use client'

import { useState, useEffect } from 'react'
import { PixelModal } from '@/components/shared/PixelModal'
import { PixelButton } from '@/components/shared/PixelButton'
import toast from 'react-hot-toast'
import { safeStorage, safeJSONParse, safeJSONStringify } from '@/utils/safeStorage'

// 内测密码常量
const BETA_PASSWORD = '888888'
const STORAGE_KEY = 'mining_beta_access'
const ACCESS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7天有效期

interface BetaPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  title?: string
}

// 定义存储数据的类型
interface BetaAccessData {
  hasAccess: boolean
  timestamp: number
  expiry: number
}

/**
 * 检查用户是否已有内测权限
 * @returns {boolean} 是否有权限
 */
export function hasBetaAccess(): boolean {
  // 服务端渲染时返回 false
  if (typeof window === 'undefined') return false
  
  try {
    // 使用安全存储获取数据
    const stored = safeStorage.getItem(STORAGE_KEY)
    if (!stored) {
      console.log('[BetaPasswordModal] No stored access data found')
      return false
    }
    
    // 安全解析 JSON
    const data = safeJSONParse<BetaAccessData | null>(stored, null)
    if (!data) {
      console.warn('[BetaPasswordModal] Failed to parse stored data, clearing...')
      safeStorage.removeItem(STORAGE_KEY)
      return false
    }
    
    const now = Date.now()
    
    // 检查是否过期
    if (data.expiry && now > data.expiry) {
      console.log('[BetaPasswordModal] Access expired, clearing...')
      safeStorage.removeItem(STORAGE_KEY)
      return false
    }
    
    // 验证数据完整性
    if (typeof data.hasAccess !== 'boolean') {
      console.warn('[BetaPasswordModal] Invalid data structure, clearing...')
      safeStorage.removeItem(STORAGE_KEY)
      return false
    }
    
    return data.hasAccess === true
  } catch (error) {
    console.error('[BetaPasswordModal] Error checking beta access:', error)
    // 出错时保守处理，返回 false
    return false
  }
}

/**
 * 保存内测权限
 * @param hasAccess - 是否有权限
 */
function saveBetaAccess(hasAccess: boolean): void {
  try {
    const data: BetaAccessData = {
      hasAccess,
      timestamp: Date.now(),
      expiry: Date.now() + ACCESS_DURATION
    }
    
    // 使用安全存储保存数据
    const serialized = safeJSONStringify(data)
    if (serialized) {
      safeStorage.setItem(STORAGE_KEY, serialized)
      console.log('[BetaPasswordModal] Access saved successfully')
    } else {
      console.error('[BetaPasswordModal] Failed to serialize access data')
    }
  } catch (error) {
    console.error('[BetaPasswordModal] Error saving beta access:', error)
    // 即使保存失败，也不影响当前会话的使用
    toast.error('权限保存失败，可能需要重新验证', {
      duration: 4000,
      position: 'top-center'
    })
  }
}

/**
 * 清除内测权限
 */
export function clearBetaAccess(): void {
  try {
    safeStorage.removeItem(STORAGE_KEY)
    console.log('[BetaPasswordModal] Access cleared')
  } catch (error) {
    console.error('[BetaPasswordModal] Error clearing beta access:', error)
  }
}

/**
 * 内测密码验证模态框组件
 */
export function BetaPasswordModal({
  isOpen,
  onClose,
  onSuccess,
  title = '内测功能验证'
}: BetaPasswordModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // 确保组件已挂载（解决 SSR 问题）
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // 重置状态
  useEffect(() => {
    if (!isOpen) {
      setPassword('')
      setError('')
      setIsVerifying(false)
    }
  }, [isOpen])
  
  // 检查锁定状态
  useEffect(() => {
    if (attempts >= 5) {
      setIsLocked(true)
      setError('尝试次数过多，请稍后再试')
      
      // 30秒后解锁
      const timer = setTimeout(() => {
        setIsLocked(false)
        setAttempts(0)
        setError('')
      }, 30000)
      
      return () => clearTimeout(timer)
    }
  }, [attempts])
  
  // 处理密码验证
  const handleVerify = async () => {
    // 防止重复点击
    if (isVerifying) return
    
    if (isLocked) {
      toast.error('请稍后再试')
      return
    }
    
    if (!password.trim()) {
      setError('请输入密码')
      return
    }
    
    setIsVerifying(true)
    setError('')
    
    try {
      // 模拟异步验证过程
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (password === BETA_PASSWORD) {
        // 验证成功
        saveBetaAccess(true)
        toast.success('验证成功！欢迎参与内测', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#10b981',
            color: '#fff',
            fontSize: '14px',
            borderRadius: '8px',
            padding: '12px 20px'
          }
        })
        
        // 延迟一下再调用成功回调，让用户看到成功提示
        setTimeout(() => {
          onSuccess()
        }, 300)
      } else {
        // 验证失败
        setAttempts(prev => prev + 1)
        const remainingAttempts = Math.max(0, 5 - attempts - 1)
        setError(`密码错误，剩余尝试次数：${remainingAttempts}`)
        setPassword('')
        
        if (attempts >= 4) {
          toast.error('尝试次数过多，请30秒后再试', {
            duration: 5000,
            position: 'top-center'
          })
        }
      }
    } catch (error) {
      console.error('[BetaPasswordModal] Verification error:', error)
      setError('验证过程出错，请重试')
    } finally {
      setIsVerifying(false)
    }
  }
  
  // 处理回车键
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isVerifying && !isLocked) {
      e.preventDefault()
      handleVerify()
    }
  }
  
  // 处理表单提交（防止默认行为）
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isVerifying && !isLocked) {
      handleVerify()
    }
  }
  
  // 如果组件还未挂载，不渲染（避免 SSR 问题）
  if (!mounted) {
    return null
  }
  
  return (
    <PixelModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 说明文字 */}
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-yellow-500 text-xl">⚠️</span>
            <div className="flex-1">
              <p className="text-sm text-yellow-400 font-bold mb-1">内测功能</p>
              <p className="text-xs text-gray-400">
                该功能目前处于内测阶段，需要输入内测密码才能访问。
                如果您是内测用户，请输入您收到的密码。
              </p>
            </div>
          </div>
        </div>
        
        {/* 密码输入框 */}
        <div>
          <label htmlFor="beta-password" className="block text-sm font-bold text-gray-300 mb-2">
            内测密码
          </label>
          <input
            id="beta-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="请输入6位数字密码"
            disabled={isVerifying || isLocked}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            maxLength={6}
            autoComplete="off"
            autoFocus
          />
          
          {/* 错误提示 */}
          {error && (
            <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
              <span>❌</span>
              <span>{error}</span>
            </p>
          )}
          
          {/* 提示信息 */}
          {!error && (
            <p className="mt-2 text-xs text-gray-500">
              提示：内测密码为6位数字
            </p>
          )}
        </div>
        
        {/* 按钮区域 */}
        <div className="flex gap-3">
          <PixelButton
            type="submit"
            disabled={isVerifying || isLocked || !password.trim()}
            className="flex-1"
          >
            {isVerifying ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                <span>验证中...</span>
              </span>
            ) : isLocked ? (
              <span>请稍后再试</span>
            ) : (
              <span>验证密码</span>
            )}
          </PixelButton>
          
          <PixelButton
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isVerifying}
          >
            取消
          </PixelButton>
        </div>
        
        {/* 底部说明 */}
        <div className="pt-3 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            如需获取内测资格，请联系管理员
          </p>
        </div>
        
        {/* 调试信息（仅开发环境） */}
        {process.env.NODE_ENV === 'development' && (
          <div className="pt-2 text-xs text-gray-600">
            <p>Debug: Storage available: {safeStorage.getStorageInfo().localStorageAvailable ? 'Yes' : 'No (using memory)'}</p>
          </div>
        )}
      </form>
    </PixelModal>
  )
}

// 导出默认组件
export default BetaPasswordModal
