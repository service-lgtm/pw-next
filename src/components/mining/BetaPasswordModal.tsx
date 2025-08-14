// src/components/mining/BetaPasswordModal.tsx
// 内测密码验证组件
//
// 文件说明：
// 1. 用于验证内测访问权限
// 2. 密码：888888
// 3. 验证成功后存储到 localStorage，避免重复输入
//
// 关联文件：
// - src/app/mining/page.tsx: 挖矿页面使用此组件

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PixelModal } from '@/components/shared/PixelModal'
import { PixelButton } from '@/components/shared/PixelButton'
import { cn } from '@/lib/utils'

interface BetaPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const BETA_PASSWORD = '888888'
const STORAGE_KEY = 'mining_beta_access'
const EXPIRY_HOURS = 24 // 24小时后过期

export function BetaPasswordModal({ isOpen, onClose, onSuccess }: BetaPasswordModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  
  // 检查是否已验证过
  useEffect(() => {
    const checkAccess = () => {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const { timestamp, verified } = JSON.parse(stored)
        const now = Date.now()
        const hoursPassed = (now - timestamp) / (1000 * 60 * 60)
        
        if (verified && hoursPassed < EXPIRY_HOURS) {
          onSuccess()
          return true
        } else {
          // 过期了，清除存储
          localStorage.removeItem(STORAGE_KEY)
        }
      }
      return false
    }
    
    if (isOpen) {
      const hasAccess = checkAccess()
      if (hasAccess) {
        onClose()
      }
    }
  }, [isOpen, onSuccess, onClose])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password.trim()) {
      setError('请输入密码')
      return
    }
    
    if (password === BETA_PASSWORD) {
      // 验证成功
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        verified: true,
        timestamp: Date.now()
      }))
      
      setPassword('')
      setError('')
      setAttempts(0)
      onSuccess()
      onClose()
    } else {
      // 验证失败
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      
      if (newAttempts >= 5) {
        setError('尝试次数过多，请稍后再试')
        // 禁用输入30秒
        setTimeout(() => {
          setAttempts(0)
          setError('')
        }, 30000)
      } else {
        setError(`密码错误，还有 ${5 - newAttempts} 次机会`)
      }
      
      setPassword('')
    }
  }
  
  return (
    <PixelModal
      isOpen={isOpen}
      onClose={onClose}
      title="内测验证"
      size="small"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 图标和说明 */}
        <div className="text-center">
          <motion.div
            className="text-6xl mb-4"
            animate={{ 
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            🔐
          </motion.div>
          <p className="text-gray-400 text-sm">
            挖矿生产系统目前处于内测阶段
          </p>
          <p className="text-gray-400 text-sm">
            请输入内测密码以继续
          </p>
        </div>
        
        {/* 密码输入框 */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-300">
            内测密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入6位密码"
            disabled={attempts >= 5}
            className={cn(
              "w-full px-4 py-3 bg-gray-900 border-2",
              "focus:outline-none transition-all duration-200",
              "text-white placeholder-gray-500 text-center",
              "font-mono text-lg tracking-widest",
              error ? "border-red-500" : "border-gray-700 focus:border-gold-500",
              attempts >= 5 && "opacity-50 cursor-not-allowed"
            )}
            maxLength={6}
            autoFocus
          />
          
          {/* 错误提示 */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-xs text-red-500 text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        
        {/* 提示信息 */}
        <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded">
          <p className="text-xs text-blue-400">
            💡 提示：内测密码仅供内部人员使用
          </p>
        </div>
        
        {/* 按钮 */}
        <div className="flex gap-3">
          <PixelButton
            type="submit"
            className="flex-1"
            disabled={attempts >= 5}
          >
            {attempts >= 5 ? '请稍后再试' : '验证'}
          </PixelButton>
          <PixelButton
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            取消
          </PixelButton>
        </div>
      </form>
    </PixelModal>
  )
}

// 清除验证状态的工具函数
export function clearBetaAccess() {
  localStorage.removeItem(STORAGE_KEY)
}

// 检查是否有验证权限的工具函数
export function hasBetaAccess(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    const { timestamp, verified } = JSON.parse(stored)
    const now = Date.now()
    const hoursPassed = (now - timestamp) / (1000 * 60 * 60)
    
    return verified && hoursPassed < EXPIRY_HOURS
  }
  return false
}
