// src/components/common/PaymentPasswordModal.tsx
// 支付密码弹窗组件

'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaymentPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (password: string) => Promise<void>
  title?: string
  amount?: number
  loading?: boolean
}

export function PaymentPasswordModal({
  isOpen,
  onClose,
  onConfirm,
  title = '请输入支付密码',
  amount,
  loading = false
}: PaymentPasswordModalProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  
  // 重置状态
  useEffect(() => {
    if (!isOpen) {
      setPassword('')
      setDigits(['', '', '', '', '', ''])
      setError('')
      setShowPassword(false)
      setSubmitting(false)
    } else {
      // 打开时聚焦第一个输入框
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    }
  }, [isOpen])
  
  // 处理单个数字输入
  const handleDigitChange = (index: number, value: string) => {
    // 只允许数字
    if (value && !/^\d$/.test(value)) return
    
    const newDigits = [...digits]
    newDigits[index] = value
    setDigits(newDigits)
    setError('')
    
    // 更新完整密码
    const fullPassword = newDigits.join('')
    setPassword(fullPassword)
    
    // 自动跳到下一个输入框
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }
  
  // 处理键盘事件
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      
      if (digits[index]) {
        // 清除当前位
        handleDigitChange(index, '')
      } else if (index > 0) {
        // 跳到上一位并清除
        handleDigitChange(index - 1, '')
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'Enter' && password.length === 6) {
      handleSubmit()
    }
  }
  
  // 处理粘贴
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    
    if (pastedData) {
      const newDigits = pastedData.split('').concat(Array(6).fill('')).slice(0, 6)
      setDigits(newDigits)
      setPassword(newDigits.join(''))
      
      // 聚焦到下一个空位或最后一位
      const nextEmptyIndex = newDigits.findIndex(d => !d)
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus()
      } else {
        inputRefs.current[5]?.focus()
      }
    }
  }
  
  // 提交处理
  const handleSubmit = async () => {
    if (password.length !== 6) {
      setError('请输入6位数字密码')
      return
    }
    
    try {
      setSubmitting(true)
      setError('')
      await onConfirm(password)
    } catch (err: any) {
      setError(err.message || '支付失败')
      // 清空密码
      setPassword('')
      setDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setSubmitting(false)
    }
  }
  
  if (!isOpen) return null
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
                {amount && (
                  <p className="text-sm text-gray-400">
                    支付金额: <span className="text-gold-500 font-bold">¥{amount.toLocaleString()}</span>
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              disabled={submitting || loading}
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          {/* 密码输入区 */}
          <div className="space-y-4">
            <p className="text-center text-sm text-gray-400">请输入6位数字支付密码</p>
            
            {/* 6位密码输入框 */}
            <div className="flex justify-center gap-2">
              {digits.map((digit, index) => (
                <div key={index} className="relative">
                  <input
                    ref={el => inputRefs.current[index] = el}
                    type={showPassword ? "text" : "password"}
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={submitting || loading}
                    className={cn(
                      "w-12 h-12 text-center text-xl font-bold bg-gray-800/50 rounded-lg",
                      "border-2 transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-purple-500/20",
                      error 
                        ? "border-red-500 animate-shake" 
                        : digit 
                          ? "border-gold-500 bg-gold-500/10" 
                          : "border-gray-700 focus:border-purple-500",
                      (submitting || loading) && "opacity-50 cursor-not-allowed"
                    )}
                    autoComplete="off"
                  />
                  {/* 输入提示点 */}
                  {!showPassword && digit && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* 显示/隐藏密码切换 */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                disabled={submitting || loading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPassword ? '隐藏密码' : '显示密码'}
              </button>
            </div>
            
            {/* 错误提示 */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={submitting || loading}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || loading || password.length !== 6}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold transition-all",
                "bg-gradient-to-r from-gold-500 to-yellow-600 text-black",
                "hover:shadow-lg hover:shadow-gold-500/25",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
              )}
            >
              {(submitting || loading) ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>处理中...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>确认支付</span>
                </>
              )}
            </button>
          </div>
          
          <p className="text-xs text-center text-gray-500 mt-4">
            支付过程采用端到端加密，确保您的资金安全
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// 添加动画样式
const styles = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}
`

// 添加样式到页面
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}
