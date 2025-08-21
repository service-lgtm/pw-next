/**
 * 文件: /src/components/common/BetaPasswordModal.tsx
 * 描述: 内测密码确认弹窗组件 - 修复价格显示精度
 * 
 * 修改历史：
 * - 2025-01-27: 移除密码显示，用户需要自己知道内测密码
 * - 2025-01-27: 修复价格显示精度问题，确保与主组件一致
 * - 保留密码验证逻辑
 * - 优化UI提示文案
 * 
 * 功能：
 * - 内测阶段的访问控制
 * - 密码验证（密码：myland888，但不对外显示）
 * - 购买前的身份确认
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Lock, AlertCircle, CheckCircle, 
  Info, Shield, Sparkles, Eye, EyeOff,
  KeyRound, Coins
} from 'lucide-react'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'

interface BetaPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  landPrice?: number  // 折后价（实际支付价格）
  originalPrice?: number  // 原价（用于显示对比）
  landId?: string
}

// 内测密码（硬编码在前端，但不显示）
const BETA_PASSWORD = 'myland888'

// 统一的价格格式化函数
const formatPrice = (price: number | undefined): string => {
  if (!price) return '0'
  // 直接使用传入的整数值，无需再次 floor
  return price.toLocaleString('zh-CN')
}

export function BetaPasswordModal({
  isOpen,
  onClose,
  onConfirm,
  landPrice,
  originalPrice,
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
  
  if (!isOpen) return null
  
  // 计算折扣百分比
  const discountPercentage = originalPrice && landPrice 
    ? Math.round((1 - landPrice / originalPrice) * 100)
    : 0
  
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
                <p className="text-sm text-gray-400">请输入内测密码以继续</p>
              </div>
            </div>
          </div>
          
          {/* 主体内容 */}
          <div className="p-6 space-y-6">
            {/* 提示信息 - 不显示密码 */}
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
                    仅限受邀用户参与，请输入您收到的内测密码
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <KeyRound className="w-3 h-3" />
                    <span>如未收到密码，请联系管理员</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* 土地价格信息 */}
            {landPrice !== undefined && (
              <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                {/* 如果有原价，显示对比 */}
                {originalPrice !== undefined && originalPrice > landPrice && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">原始价格</span>
                      <span className="text-base text-gray-500 line-through">
                        {formatPrice(originalPrice)} TDB
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        优惠价格
                        {discountPercentage > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                            -{discountPercentage}%
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-gold-500" />
                        <span className="text-lg font-bold text-gold-500">
                          {formatPrice(landPrice)} TDB
                        </span>
                      </div>
                    </div>
                  </>
                )}
                {/* 如果没有原价，只显示当前价格 */}
                {(!originalPrice || originalPrice === landPrice) && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">土地价格</span>
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-gold-500" />
                      <span className="text-lg font-bold text-gold-500">
                        {formatPrice(landPrice)} TDB
                      </span>
                    </div>
                  </div>
                )}
                {landId && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                    <span className="text-sm text-gray-400">土地编号</span>
                    <span className="text-sm font-mono">{landId}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* 密码输入框 */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                内测密码
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
                  placeholder="请输入内测密码"
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
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500">
                内测期间仅限受邀用户参与
              </p>
              <p className="text-xs text-gray-600">
                忘记密码？请联系客服或您的邀请人
              </p>
            </div>
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
