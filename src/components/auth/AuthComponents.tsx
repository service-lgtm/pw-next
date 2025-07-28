// components/auth/AuthComponents.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { PixelLogo } from '@/components/ui/PixelLogo'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api, getErrorMessage, type RegisterRequest, type LoginRequest, type PasswordResetRequest, type PasswordResetConfirmRequest } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

// 共享的输入框组件
interface PixelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: string
  showPasswordToggle?: boolean
  onShowPasswordChange?: (show: boolean) => void
  hasButton?: boolean // 新增：是否有按钮
  hint?: string // 新增：输入提示
}

function PixelInput({ 
  label, 
  error, 
  icon, 
  className, 
  showPasswordToggle,
  onShowPasswordChange,
  hasButton = false,
  hint,
  ...props 
}: PixelInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const inputType = props.type === 'password' && showPassword ? 'text' : props.type
  
  const handleTogglePassword = () => {
    const newValue = !showPassword
    setShowPassword(newValue)
    onShowPasswordChange?.(newValue)
  }
  
  return (
    <div className="space-y-2">
      <label 
        className="text-sm font-bold text-gray-300" 
        htmlFor={props.id || props.name}
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl pointer-events-none select-none">
            {icon}
          </span>
        )}
        <input
          id={props.id || props.name}
          className={cn(
            'w-full px-4 py-3 bg-gray-900 border-2 border-gray-700',
            'focus:border-gold-500 focus:outline-none transition-all duration-200',
            'text-white placeholder-gray-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            icon && 'pl-12',
            showPasswordToggle && 'pr-12',
            hasButton && 'pr-32', // 为按钮预留空间
            error && 'border-red-500',
            className
          )}
          {...props}
          type={inputType}
        />
        {showPasswordToggle && props.type === 'password' && (
          <button
            type="button"
            onClick={handleTogglePassword}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            aria-label={showPassword ? '隐藏密码' : '显示密码'}
            tabIndex={-1}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        )}
      </div>
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-500"
          role="alert"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

// 倒计时按钮组件 - 修复定位问题
interface CountdownButtonProps {
  onClick: () => Promise<void>
  disabled?: boolean
  email: string
  type: 'register' | 'reset'
}

function CountdownButton({ onClick, disabled, email, type }: CountdownButtonProps) {
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])
  
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  const handleClick = async () => {
    if (countdown > 0 || disabled || loading) return
    
    if (!email || !email.trim()) {
      setError('请先输入邮箱地址')
      setTimeout(() => setError(''), 3000)
      return
    }
    
    if (!validateEmail(email)) {
      setError('请输入有效的邮箱地址')
      setTimeout(() => setError(''), 3000)
      return
    }
    
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      await onClick()
      
      // 发送成功提示
      setSuccess('验证码已发送，请注意查收（垃圾箱也要看哦）')
      setTimeout(() => setSuccess(''), 8000) // 8秒后隐藏成功提示
      
      setCountdown(60)
      
      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      console.error('发送验证码失败:', error)
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)
      setTimeout(() => setError(''), 5000)
    } finally {
      setLoading(false)
    }
  }
  
  const isDisabled = countdown > 0 || disabled || loading || !email || !validateEmail(email)
  
  return (
    <div className="flex flex-col items-end">
      {(error || success) && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className={cn(
            "text-xs mb-1 max-w-[200px] text-right",
            error ? "text-red-500" : "text-green-500"
          )}
        >
          {error || success}
        </motion.div>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        className={cn(
          'px-3 py-2 text-sm font-bold whitespace-nowrap',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-gray-900',
          isDisabled
            ? 'text-gray-500 cursor-not-allowed'
            : 'text-gold-500 hover:text-gold-400 active:scale-95'
        )}
        aria-label="发送验证码"
      >
        {loading ? (
          <span className="flex items-center gap-1">
            <span className="animate-spin">⏳</span>
            发送中...
          </span>
        ) : countdown > 0 ? (
          `${countdown}秒后重试`
        ) : (
          '发送验证码'
        )}
      </button>
    </div>
  )
}

// 带验证码按钮的输入框包装组件
interface VerificationInputProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  icon: string
  error?: string
  maxLength?: number
  autoComplete?: string
  autoFocus?: boolean
  onSendCode: () => Promise<void>
  email: string
  type: 'register' | 'reset'
}

function VerificationInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon,
  error,
  maxLength,
  autoComplete,
  autoFocus,
  onSendCode,
  email,
  type
}: VerificationInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-300" htmlFor={name}>
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl pointer-events-none select-none z-10">
          {icon}
        </span>
        <input
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={cn(
            'w-full px-4 py-3 bg-gray-900 border-2 border-gray-700',
            'focus:border-gold-500 focus:outline-none transition-all duration-200',
            'text-white placeholder-gray-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'pl-12 pr-28', // 为按钮留出空间
            error && 'border-red-500'
          )}
        />
        {/* 使用绝对定位放置按钮 */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <CountdownButton 
            onClick={onSendCode} 
            email={email}
            type={type}
          />
        </div>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-500"
          role="alert"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

// 验证函数
function validatePassword(password: string): string | null {
  if (!password) return '请输入密码'
  if (password.length < 8 || password.length > 32) {
    return '密码长度应为8-32位'
  }
  if (!/[a-zA-Z]/.test(password)) {
    return '密码必须包含字母'
  }
  if (!/[0-9]/.test(password)) {
    return '密码必须包含数字'
  }
  return null
}

function validateEmail(email: string): string | null {
  if (!email) return '请输入邮箱地址'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return '请输入有效的邮箱地址'
  }
  return null
}

// 验证登录账号（支持多种格式）
function validateLoginAccount(account: string): string | null {
  if (!account) return '请输入登录账号'
  if (account.length < 2) return '账号长度至少2个字符'
  return null
}

// 注册组件（保持不变）
export function RegisterForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirm: '',
    verification_code: '',
    referral_code: '',
    agreement: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isReferralCodeLocked, setIsReferralCodeLocked] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const refCode = params.get('ref')
      if (refCode) {
        setFormData(prev => ({ ...prev, referral_code: refCode }))
        setIsReferralCodeLocked(true)
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    setTouched(prev => ({ ...prev, [name]: true }))
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    
    // 实时验证
    if (name === 'email' && touched.email) {
      const error = validateEmail(value)
      if (error) {
        setErrors(prev => ({ ...prev, email: error }))
      }
    } else if (name === 'password' && touched.password) {
      const error = validatePassword(value)
      if (error) {
        setErrors(prev => ({ ...prev, password: error }))
      }
    } else if (name === 'password_confirm' && touched.password_confirm) {
      const error = value !== formData.password ? '两次密码不一致' : null
      if (error) {
        setErrors(prev => ({ ...prev, password_confirm: error }))
      }
    } else if (name === 'verification_code') {
      const error = value && value.length !== 6 ? '请输入6位验证码' : null
      if (error) {
        setErrors(prev => ({ ...prev, verification_code: error }))
      }
    }
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    
    const emailError = validateEmail(formData.email)
    if (emailError) newErrors.email = emailError
    
    const passwordError = validatePassword(formData.password)
    if (passwordError) newErrors.password = passwordError
    
    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = '两次密码不一致'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.verification_code || formData.verification_code.length !== 6) {
      newErrors.verification_code = '请输入6位验证码'
    }
    if (!formData.agreement) {
      newErrors.agreement = '请同意用户协议'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    if (step === 1) {
      setTouched({ email: true, password: true, password_confirm: true })
      
      if (validateStep1()) {
        setStep(2)
      }
    } else if (step === 2) {
      setTouched(prev => ({ ...prev, verification_code: true, agreement: true }))
      
      if (validateStep2()) {
        setLoading(true)
        setErrors({})
        
        try {
          const registerData: RegisterRequest = {
            email: formData.email.trim(),
            password: formData.password,
            password_confirm: formData.password_confirm,
            verification_code: formData.verification_code.trim(),
          }
          
          if (formData.referral_code?.trim()) {
            registerData.referral_code = formData.referral_code.trim()
          }
          
          console.log('[RegisterForm] 开始注册...')
          const response = await api.auth.register(registerData)
          console.log('[RegisterForm] 注册成功:', response)
          
          setStep(3)
        } catch (error) {
          console.error('[RegisterForm] 注册失败:', error)
          const errorMessage = getErrorMessage(error)
          setErrors({ submit: errorMessage })
        } finally {
          setLoading(false)
        }
      }
    }
  }

  const handleSendVerifyCode = async () => {
    await api.auth.sendEmailCode({
      email: formData.email.trim(),
      type: 'register'
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault()
      handleNext()
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 进度指示器 */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-bold',
                'transition-all duration-300',
                step >= i
                  ? 'bg-gold-500 text-black'
                  : 'bg-gray-800 text-gray-500'
              )}
            >
              {step > i ? '✓' : i}
            </div>
            {i < 3 && (
              <div
                className={cn(
                  'w-20 h-1 ml-2',
                  'transition-all duration-300',
                  step > i ? 'bg-gold-500' : 'bg-gray-800'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* 步骤1：基本信息 */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
            onKeyPress={handleKeyPress}
          >
            <h2 className="text-2xl font-black text-center mb-6">
              创建账号
              <span className="block text-sm text-gray-400 font-normal mt-2">
                加入50,000+数字公民
              </span>
            </h2>

            <PixelInput
              label="邮箱地址"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="example@email.com"
              icon="📧"
              error={touched.email ? errors.email : ''}
              autoComplete="email"
              autoFocus
            />

            <PixelInput
              label="登录密码"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="8-32位字母+数字"
              icon="🔐"
              error={touched.password ? errors.password : ''}
              autoComplete="new-password"
              showPasswordToggle
            />

            <PixelInput
              label="确认密码"
              name="password_confirm"
              type="password"
              value={formData.password_confirm}
              onChange={handleInputChange}
              placeholder="再次输入密码"
              icon="🔐"
              error={touched.password_confirm ? errors.password_confirm : ''}
              autoComplete="new-password"
              showPasswordToggle
            />

            <motion.button
              className="w-full pixel-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              disabled={loading}
              type="button"
            >
              下一步
            </motion.button>

            <p className="text-center text-sm text-gray-400">
              已有账号？
              <Link href="/login" className="text-gold-500 hover:underline ml-1">
                立即登录
              </Link>
            </p>
          </motion.div>
        )}

        {/* 步骤2：验证信息 */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
            onKeyPress={handleKeyPress}
          >
            <h2 className="text-2xl font-black text-center mb-6">
              验证邮箱
              <span className="block text-sm text-gray-400 font-normal mt-2">
                 验证码将发送到 {formData.email}
              </span>
            </h2>

            <VerificationInput
              label="邮箱验证码"
              name="verification_code"
              value={formData.verification_code}
              onChange={handleInputChange}
              placeholder="请输入6位验证码"
              icon="✉️"
              error={touched.verification_code ? errors.verification_code : ''}
              maxLength={6}
              autoComplete="one-time-code"
              autoFocus
              onSendCode={handleSendVerifyCode}
              email={formData.email}
              type="register"
            />

            {/* 邮箱提示 */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-sm">
              <p className="text-blue-400 flex items-start gap-2">
                <span className="text-lg">💡</span>
                <span>
                  验证码可能会被误判为垃圾邮件，请同时检查垃圾箱
                </span>
              </p>
            </div>

            <PixelInput
              label="邀请码（选填）"
              name="referral_code"
              value={formData.referral_code}
              onChange={handleInputChange}
              placeholder="填写邀请码获得额外奖励"
              icon="🎁"
            />

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="agreement"
                  name="agreement"
                  checked={formData.agreement}
                  onChange={handleInputChange}
                  className="w-4 h-4 mt-1 cursor-pointer"
                />
                <label htmlFor="agreement" className="text-sm text-gray-400 cursor-pointer select-none">
                  我已阅读并同意
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-gold-500 hover:underline mx-1">
                    《用户协议》
                  </a>
                  和
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-gold-500 hover:underline mx-1">
                    《隐私政策》
                  </a>
                </label>
              </div>
              {touched.agreement && errors.agreement && (
                <p className="text-xs text-red-500 ml-6">{errors.agreement}</p>
              )}
            </div>

            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded"
              >
                <p className="text-sm text-red-500 text-center">{errors.submit}</p>
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <motion.button
                className="px-6 py-3 border-2 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(1)}
                disabled={loading}
                type="button"
              >
                上一步
              </motion.button>
              <motion.button
                className="pixel-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={loading}
                type="button"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    注册中...
                  </span>
                ) : (
                  '完成注册'
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* 步骤3：注册成功 */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center">
              <motion.div
                className="text-6xl mb-4"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 1 }}
              >
                🎉
              </motion.div>
              <h2 className="text-2xl font-black mb-2">
                注册成功！
              </h2>
              <p className="text-gray-400">
                欢迎加入平行世界
              </p>
            </div>

            <motion.button
              className="w-full pixel-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/login')}
              type="button"
            >
              立即登录
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 更新后的登录组件
export function LoginForm() {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    account: '', // 改为 account，支持多种登录方式
    password: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [showLoginHint, setShowLoginHint] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setTouched(prev => ({ ...prev, [name]: true }))
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        delete newErrors.submit
        return newErrors
      })
    }
  }

  const handleLogin = async () => {
    if (loading) return
    
    setTouched({ account: true, password: true })
    
    const newErrors: Record<string, string> = {}
    
    const accountError = validateLoginAccount(formData.account)
    if (accountError) newErrors.account = accountError
    
    if (!formData.password) {
      newErrors.password = '请输入密码'
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      return
    }
    
    setLoading(true)
    setErrors({})
    
    try {
      console.log('[LoginForm] 开始登录...')
      // 传递账号到后端，后端会自动识别是邮箱、用户名还是昵称
      await login(formData.account.trim(), formData.password)
      console.log('[LoginForm] 登录成功')
    } catch (error) {
      console.error('[LoginForm] 登录失败:', error)
      const errorMessage = getErrorMessage(error)
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault()
      handleLogin()
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-3xl font-black mb-2">
            欢迎回来
          </h2>
          <p className="text-gray-400">
            登录您的平行世界账号
          </p>
        </div>

        <form 
          onSubmit={(e) => { 
            e.preventDefault(); 
            handleLogin(); 
          }} 
          className="space-y-4"
        >
          <div>
            <PixelInput
              label="登录账号"
              name="account"
              type="text"
              value={formData.account}
              onChange={handleInputChange}
              placeholder="邮箱 / 用户名 / 昵称"
              icon="👤"
              error={touched.account ? errors.account : ''}
              autoComplete="username"
              autoFocus
              disabled={loading}
              hint="支持邮箱、用户名（可省略@后缀）或昵称登录"
            />
            
            {/* 登录方式提示 */}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowLoginHint(!showLoginHint)}
                className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
              >
                {showLoginHint ? '收起' : '查看'}支持的登录方式 {showLoginHint ? '▲' : '▼'}
              </button>
              
              <AnimatePresence>
                {showLoginHint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 p-3 bg-gray-900/50 rounded text-xs text-gray-400 space-y-1"
                  >
                    <p>📧 <strong>邮箱</strong>：user@example.com</p>
                    <p>👤 <strong>用户名</strong>：john 或 john@example.com</p>
                    <p>✨ <strong>昵称</strong>：我的昵称</p>
                    <p className="text-gold-500 mt-2">💡 提示：用户名登录时可省略@及后面部分</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <PixelInput
              label="登录密码"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="请输入密码"
              icon="🔐"
              error={touched.password ? errors.password : ''}
              autoComplete="current-password"
              showPasswordToggle
              disabled={loading}
            />
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 cursor-pointer"
                  disabled={loading}
                />
                记住我
              </label>
              <Link 
                href="/reset-password" 
                className={cn(
                  "text-sm text-gold-500 hover:underline",
                  loading && "pointer-events-none opacity-50"
                )}
                tabIndex={loading ? -1 : 0}
              >
                忘记密码？
              </Link>
            </div>
          </div>

          {errors.submit && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/10 border border-red-500/20 rounded"
            >
              <p className="text-sm text-red-500 text-center">{errors.submit}</p>
              {errors.submit.includes('用户不存在') && (
                <p className="text-xs text-gray-400 text-center mt-1">
                  请检查账号是否正确，支持邮箱、用户名或昵称登录
                </p>
              )}
            </motion.div>
          )}

          <motion.button
            type="submit"
            className={cn(
              "w-full pixel-btn",
              loading && "opacity-70 cursor-not-allowed"
            )}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                登录中...
              </span>
            ) : (
              '进入平行世界'
            )}
          </motion.button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
              还没有账号？
              <Link 
                href="/register" 
                className={cn(
                  "text-gold-500 hover:underline ml-1",
                  loading && "pointer-events-none opacity-50"
                )}
                tabIndex={loading ? -1 : 0}
              >
                立即注册
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// 找回密码组件（保持不变）
export function ResetPasswordForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    verification_code: '',
    token: '',
    new_password: '',
    new_password_confirm: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setTouched(prev => ({ ...prev, [name]: true }))
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    
    // 实时验证
    if (name === 'email' && touched.email) {
      const error = validateEmail(value)
      if (error) {
        setErrors(prev => ({ ...prev, email: error }))
      }
    } else if (name === 'new_password' && touched.new_password) {
      const error = validatePassword(value)
      if (error) {
        setErrors(prev => ({ ...prev, new_password: error }))
      }
    } else if (name === 'new_password_confirm' && touched.new_password_confirm) {
      const error = value !== formData.new_password ? '两次密码不一致' : null
      if (error) {
        setErrors(prev => ({ ...prev, new_password_confirm: error }))
      }
    }
  }

  const handleSendVerifyCode = async () => {
    await api.auth.sendEmailCode({
      email: formData.email.trim(),
      type: 'reset'
    })
  }

  const handleRequestReset = async () => {
    setTouched({ email: true, verification_code: true })
    
    const newErrors: Record<string, string> = {}
    
    const emailError = validateEmail(formData.email)
    if (emailError) newErrors.email = emailError
    
    if (!formData.verification_code || formData.verification_code.length !== 6) {
      newErrors.verification_code = '请输入6位验证码'
    }
    
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      setLoading(true)
      try {
        await api.auth.passwordReset({
          email: formData.email.trim(),
          verification_code: formData.verification_code.trim()
        })
        setStep(2)
      } catch (error) {
        console.error('[ResetForm] 请求重置失败:', error)
        const errorMessage = getErrorMessage(error)
        setErrors({ submit: errorMessage })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleResetPassword = async () => {
    setTouched({ 
      token: true, 
      new_password: true, 
      new_password_confirm: true 
    })
    
    const newErrors: Record<string, string> = {}
    
    const passwordError = validatePassword(formData.new_password)
    if (passwordError) newErrors.new_password = passwordError
    
    if (formData.new_password !== formData.new_password_confirm) {
      newErrors.new_password_confirm = '两次密码不一致'
    }
    
    if (!formData.token) {
      newErrors.token = '请输入重置链接中的token'
    }
    
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      setLoading(true)
      try {
        await api.auth.passwordResetConfirm({
          email: formData.email.trim(),
          token: formData.token.trim(),
          new_password: formData.new_password,
          new_password_confirm: formData.new_password_confirm
        })
        setStep(3)
      } catch (error) {
        console.error('[ResetForm] 重置密码失败:', error)
        const errorMessage = getErrorMessage(error)
        setErrors({ submit: errorMessage })
      } finally {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')
      const email = params.get('email')
      if (token && email) {
        setFormData(prev => ({ ...prev, token, email }))
        setStep(2)
      }
    }
  }, [])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault()
      if (step === 1) {
        handleRequestReset()
      } else if (step === 2) {
        handleResetPassword()
      }
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {/* 步骤1：验证身份 */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
            onKeyPress={handleKeyPress}
          >
            <div className="text-center">
              <h2 className="text-3xl font-black mb-2">
                找回密码
              </h2>
              <p className="text-gray-400">
                通过邮箱验证您的身份
              </p>
            </div>

            <div className="space-y-4">
              <PixelInput
                label="注册邮箱"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="请输入注册时的邮箱"
                icon="📧"
                error={touched.email ? errors.email : ''}
                autoComplete="email"
                autoFocus
              />

              <VerificationInput
                label="验证码"
                name="verification_code"
                value={formData.verification_code}
                onChange={handleInputChange}
                placeholder="请输入6位验证码"
                icon="✉️"
                error={touched.verification_code ? errors.verification_code : ''}
                maxLength={6}
                autoComplete="one-time-code"
                onSendCode={handleSendVerifyCode}
                email={formData.email}
                type="reset"
              />

              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded"
                >
                  <p className="text-sm text-red-500 text-center">{errors.submit}</p>
                </motion.div>
              )}

              <motion.button
                className="w-full pixel-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRequestReset}
                disabled={loading}
                type="button"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    验证中...
                  </span>
                ) : (
                  '下一步'
                )}
              </motion.button>

              <p className="text-center text-sm text-gray-400">
                想起密码了？
                <Link href="/login" className="text-gold-500 hover:underline ml-1">
                  返回登录
                </Link>
              </p>
            </div>
          </motion.div>
        )}

        {/* 步骤2：设置新密码 */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
            onKeyPress={handleKeyPress}
          >
            <div className="text-center">
              <h2 className="text-3xl font-black mb-2">
                设置新密码
              </h2>
              <p className="text-gray-400">
                请设置一个安全的新密码
              </p>
            </div>

            <div className="space-y-4">
              {!formData.token && (
                <PixelInput
                  label="重置Token"
                  name="token"
                  value={formData.token}
                  onChange={handleInputChange}
                  placeholder="请输入邮件中的重置链接token"
                  icon="🔑"
                  error={touched.token ? errors.token : ''}
                  autoFocus
                />
              )}

              <PixelInput
                label="新密码"
                name="new_password"
                type="password"
                value={formData.new_password}
                onChange={handleInputChange}
                placeholder="8-32位字母+数字"
                icon="🔐"
                error={touched.new_password ? errors.new_password : ''}
                autoComplete="new-password"
                showPasswordToggle
                autoFocus={!!formData.token}
              />

              <PixelInput
                label="确认新密码"
                name="new_password_confirm"
                type="password"
                value={formData.new_password_confirm}
                onChange={handleInputChange}
                placeholder="再次输入新密码"
                icon="🔐"
                error={touched.new_password_confirm ? errors.new_password_confirm : ''}
                autoComplete="new-password"
                showPasswordToggle
              />

              <div className="p-4 bg-gray-900/50 rounded space-y-1 text-xs text-gray-400">
                <p className="font-bold">密码要求：</p>
                <p className={cn(
                  formData.new_password.length >= 8 && formData.new_password.length <= 32 
                    ? 'text-green-500' 
                    : ''
                )}>
                  ✓ 8-32个字符
                </p>
                <p className={cn(
                  /[a-zA-Z]/.test(formData.new_password) && /[0-9]/.test(formData.new_password) 
                    ? 'text-green-500' 
                    : ''
                )}>
                  ✓ 必须包含字母和数字
                </p>
              </div>

              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded"
                >
                  <p className="text-sm text-red-500 text-center">{errors.submit}</p>
                </motion.div>
              )}

              <motion.button
                className="w-full pixel-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleResetPassword}
                disabled={loading}
                type="button"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    重置中...
                  </span>
                ) : (
                  '重置密码'
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* 步骤3：重置成功 */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            <motion.div
              className="text-6xl"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 0.5 }}
            >
              ✅
            </motion.div>

            <div>
              <h2 className="text-3xl font-black mb-2">
                密码重置成功！
              </h2>
              <p className="text-gray-400">
                您的新密码已生效，请使用新密码登录
              </p>
            </div>

            <motion.button
              className="w-full pixel-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/login')}
              type="button"
            >
              立即登录
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 认证页面容器（保持不变）
interface AuthPageProps {
  type: 'login' | 'register' | 'reset'
}

export function AuthPage({ type }: AuthPageProps) {
  return (
    <div className="min-h-screen bg-[#0F0F1E] flex items-center justify-center p-4">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pixel-grid opacity-10" />
      <div className="fixed top-20 left-20 text-8xl opacity-5 animate-pulse">🔐</div>
      <div className="fixed bottom-20 right-20 text-8xl opacity-5 animate-pulse" style={{ animationDelay: '1s' }}>🎯</div>
      
      {/* Logo */}
      <div className="fixed top-8 left-8">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="transition-transform"
          >
            <PixelLogo />
          </motion.div>
          <span className="text-xl font-black text-gold-500 group-hover:text-gold-400 transition-colors">
            平行世界
          </span>
        </Link>
      </div>

      {/* 主内容 */}
      <div className="relative z-10 w-full max-w-md">
        <div className="pixel-card p-8 bg-[#0A1628]/95 backdrop-blur">
          {type === 'login' && <LoginForm />}
          {type === 'register' && <RegisterForm />}
          {type === 'reset' && <ResetPasswordForm />}
        </div>
      </div>
    </div>
  )
}
