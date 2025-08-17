// src/components/common/BetaPasswordModal.tsx
// 内测密码确认弹窗组件 - 移动端优化

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Lock, AlertCircle, CheckCircle, 
  Info, Shield, Sparkles, Eye, EyeOff 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'

interface BetaPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  landPrice?: number
  landId?: string
}

// 内测密码（硬编码在前端）
const BETA_PASSWORD = 'myland888'

export function BetaPasswordModal({
  isOpen,
  onClose,
  onConfirm,
  landPrice,
  landId
}: BetaPasswordModalProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [success, setSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // 重置状态
  useEffect(() => {
    if (isOpen) {
      setPassword('')
      setError('')
      setSuccess(false)
      setShowPassword(false)
      // 延迟聚焦，确保动画完成
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isOpen])
  
  // 处理密码验证
  const handleSubmit = () => {
    if (!password.trim()) {
      setError('请输入内测密码')
      return
    }
    
    setIsValidating(true)
    setError('')
    
    // 模拟验证延迟，增加真实感
    setTimeout(() => {
      if (password === BETA_PASSWORD) {
        setSuccess(true)
        
        // 播放成功动画
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#FFD700', '#FFA500', '#FF6347']
        })
        
        // 延迟关闭并触发购买
        setTimeout(() => {
          onConfirm()
        }, 800)
      } else {
        setError('内测密码错误，请重新输入')
        setPassword('')
        inputRef.current?.focus()
      }
      setIsValidating(false)
    }, 500)
  }
  
  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isValidating) {
      handleSubmit()
    }
  }
  
  // 复制密码提示
  const copyPasswordHint = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(BETA_PASSWORD)
      // 可以添加一个小提示
    }
  }
  
  if (!isOpen) return null
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className={cn(
            "bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl",
            "w-full max-w-md border border-gray-700 shadow-2xl",
            "max-h-[90vh] overflow-y-auto"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 - 渐变背景 */}
          <div className="relative bg-gradient-to-r from-purple-600/30 to-pink-600/30 p-6 border-b border-gray-700">
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 hover:bg-white/10 rounded-lg transition-all"
              disabled={isValidating || success}
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
            
            {/* 标题和图标 */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <Sparkles className="w-4 h-4 text-gold-500 absolute -top-1 -right-1" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  内测验证
                  <span className="px-2 py-0.5 bg-gold-500/20 text-gold-400 text-xs rounded-full">
                    BETA
                  </span>
                </h3>
                <p className="text-sm text-gray-400">请输入内测密码以继续购买</p>
              </div>
            </div>
          </div>
          
          {/* 主体内容 */}
          <div className="p-6 space-y-6">
            {/* 提示信息 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/20"
            >
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-300">
                    当前处于 <span className="text-gold-400 font-bold">内测阶段</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    内测密码：
                    <button
                      onClick={copyPasswordHint}
                      className="ml-2 px-3 py-1 bg-gray-700/50 hover:bg-gray-700 rounded-lg font-mono font-bold text-gold-400 transition-all"
                    >
                      {BETA_PASSWORD}
                    </button>
                    <span className="ml-2 text-xs text-gray-500">点击复制</span>
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* 土地信息（如果有） */}
            {landPrice && (
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">土地价格</span>
                  <span className="text-lg font-bold text-gold-500">
                    {landPrice.toLocaleString()} TDB
                  </span>
                </div>
                {landId && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-400">土地编号</span>
                    <span className="text-sm font-mono">{landId}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* 密码输入框 */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                请输入内测密码
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  ref={inputRef}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="输入内测密码"
                  disabled={isValidating || success}
                  className={cn(
                    "w-full pl-10 pr-12 py-3 bg-gray-800/50 rounded-xl",
                    "border-2 transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-purple-500/20",
                    "placeholder-gray-500",
                    error 
                      ? "border-red-500 animate-shake" 
                      : success
                        ? "border-green-500"
                        : "border-gray-700 focus:border-purple-500",
                    (isValidating || success) && "opacity-50 cursor-not-allowed"
                  )}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded transition-all"
                  disabled={isValidating || success}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* 错误提示 */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* 成功提示 */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-green-400 text-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>验证成功！正在处理购买...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isValidating || success}
                className={cn(
                  "flex-1 py-3 rounded-xl font-medium transition-all",
                  "bg-gray-700 hover:bg-gray-600",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={isValidating || success || !password}
                className={cn(
                  "flex-1 py-3 rounded-xl font-bold transition-all",
                  "bg-gradient-to-r from-purple-600 to-pink-600",
                  "hover:shadow-lg hover:shadow-purple-500/25",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center justify-center gap-2"
                )}
              >
                {isValidating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>验证中...</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>验证成功</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>确认验证</span>
                  </>
                )}
              </button>
            </div>
            
            {/* 底部说明 */}
            <p className="text-xs text-center text-gray-500 pt-2">
              内测期间仅限受邀用户参与
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// 添加动画样式
if (typeof document !== 'undefined' && !document.getElementById('beta-modal-styles')) {
  const styleSheet = document.createElement('style')
  styleSheet.id = 'beta-modal-styles'
  styleSheet.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
      20%, 40%, 60%, 80% { transform: translateX(2px); }
    }
    
    .animate-shake {
      animation: shake 0.5s ease-in-out;
    }
  `
  document.head.appendChild(styleSheet)
}
