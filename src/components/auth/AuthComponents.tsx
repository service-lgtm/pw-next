'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { PixelLogo } from '@/components/ui/PixelLogo'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

// 共享的输入框组件
interface PixelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: string
}

function PixelInput({ label, error, icon, className, ...props }: PixelInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-300">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
            {icon}
          </span>
        )}
        <input
          className={cn(
            'w-full px-4 py-3 bg-gray-900 border-2 border-gray-700',
            'focus:border-gold-500 focus:outline-none transition-all duration-200',
            'text-white placeholder-gray-500',
            icon && 'pl-12',
            error && 'border-red-500',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

// 倒计时按钮组件
interface CountdownButtonProps {
  onClick: () => Promise<void>
  disabled?: boolean
  email: string
  type: 'register' | 'reset'
}

function CountdownButton({ onClick, disabled, email, type }: CountdownButtonProps) {
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (countdown > 0 || disabled || loading || !email) return
    
    setLoading(true)
    try {
      await onClick()
      setCountdown(60)
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      console.error('发送验证码失败:', error)
      alert(error instanceof Error ? error.message : '发送失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={countdown > 0 || disabled || loading || !email}
      className={cn(
        'absolute right-2 top-1/2 -translate-y-1/2',
        'px-4 py-1 text-sm font-bold',
        'transition-all duration-200',
        countdown > 0 || disabled || loading || !email
          ? 'text-gray-500 cursor-not-allowed'
          : 'text-gold-500 hover:text-gold-400'
      )}
    >
      {loading ? '发送中...' : countdown > 0 ? `${countdown}s` : '发送验证码'}
    </button>
  )
}

// 密码验证
function validatePassword(password: string): string | null {
  if (password.length < 8 || password.length > 32) {
    return '密码长度应为8-32位'
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return '密码必须包含字母和数字'
  }
  return null
}

// 注册组件
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
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // 清除对应的错误
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = '请输入有效的邮箱地址'
    }
    
    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      newErrors.password = passwordError
    }
    
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
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setLoading(true)
      setErrors({}) // 清空之前的错误
      
      try {
        // 准备注册数据，只发送有值的字段
        const registerData: RegisterRequest = {
          email: formData.email,
          password: formData.password,
          password_confirm: formData.password_confirm,
          verification_code: formData.verification_code,
        }
        
        // 只有在邀请码有值时才添加
        if (formData.referral_code && formData.referral_code.trim()) {
          registerData.referral_code = formData.referral_code.trim()
        }
        
        console.log('注册数据:', registerData) // 调试日志
        
        const response = await authAPI.register(registerData)
        console.log('注册成功:', response) // 调试日志
        
        setStep(3)
      } catch (error: any) {
        console.error('注册失败:', error) // 调试日志
        setErrors({ submit: error.message || '注册失败，请重试' })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSendVerifyCode = async () => {
    if (!formData.email) {
      throw new Error('请输入邮箱地址')
    }
    
    if (!formData.email.includes('@')) {
      throw new Error('请输入有效的邮箱地址')
    }
    
    await authAPI.sendEmailCode({
      email: formData.email,
      type: 'register'
    })
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
              {i}
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
              error={errors.email}
            />

            <PixelInput
              label="登录密码"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              placeholder="8-32位字母+数字"
              icon="🔐"
              error={errors.password}
            />

            <PixelInput
              label="确认密码"
              name="password_confirm"
              type={showPassword ? 'text' : 'password'}
              value={formData.password_confirm}
              onChange={handleInputChange}
              placeholder="再次输入密码"
              icon="🔐"
              error={errors.password_confirm}
            />

            <div className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="showPassword" className="text-gray-400 cursor-pointer">
                显示密码
              </label>
            </div>

            <motion.button
              className="w-full pixel-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
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
          >
            <h2 className="text-2xl font-black text-center mb-6">
              验证邮箱
              <span className="block text-sm text-gray-400 font-normal mt-2">
                验证码已发送至 {formData.email}
              </span>
            </h2>

            <div className="relative">
              <PixelInput
                label="邮箱验证码"
                name="verification_code"
                value={formData.verification_code}
                onChange={handleInputChange}
                placeholder="请输入6位验证码"
                icon="✉️"
                error={errors.verification_code}
                maxLength={6}
              />
              <CountdownButton 
                onClick={handleSendVerifyCode} 
                email={formData.email}
                type="register"
              />
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
                  className="w-4 h-4 mt-1"
                />
                <label htmlFor="agreement" className="text-sm text-gray-400">
                  我已阅读并同意
                  <a href="#" className="text-gold-500 hover:underline mx-1">
                    《用户协议》
                  </a>
                  和
                  <a href="#" className="text-gold-500 hover:underline mx-1">
                    《隐私政策》
                  </a>
                </label>
              </div>
              {errors.agreement && (
                <p className="text-xs text-red-500 ml-6">{errors.agreement}</p>
              )}
            </div>

            {errors.submit && (
              <p className="text-sm text-red-500 text-center">{errors.submit}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <motion.button
                className="px-6 py-3 border-2 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(1)}
              >
                上一步
              </motion.button>
              <motion.button
                className="pixel-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={loading}
              >
                {loading ? '注册中...' : '完成注册'}
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
                animate={{ rotate: [0, 360] }}
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
            >
              立即登录
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 登录组件
export function LoginForm() {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleLogin = async () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.email) {
      newErrors.email = '请输入邮箱'
    }
    if (!formData.password) {
      newErrors.password = '请输入密码'
    }
    
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      setLoading(true)
      try {
        await login(formData.email, formData.password)
      } catch (error: any) {
        setErrors({ submit: error.message || '登录失败，请检查邮箱和密码' })
      } finally {
        setLoading(false)
      }
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

        <div className="space-y-4">
          <PixelInput
            label="邮箱地址"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="请输入注册邮箱"
            icon="📧"
            error={errors.email}
          />

          <div>
            <PixelInput
              label="登录密码"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              placeholder="请输入密码"
              icon="🔐"
              error={errors.password}
            />
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="w-4 h-4"
                />
                显示密码
              </label>
              <Link href="/reset-password" className="text-sm text-gold-500 hover:underline">
                忘记密码？
              </Link>
            </div>
          </div>

          {errors.submit && (
            <p className="text-sm text-red-500 text-center">{errors.submit}</p>
          )}

          <motion.button
            className="w-full pixel-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? '登录中...' : '进入平行世界'}
          </motion.button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
              还没有账号？
              <Link href="/register" className="text-gold-500 hover:underline ml-1">
                立即注册
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// 找回密码组件
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
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSendVerifyCode = async () => {
    await authAPI.sendEmailCode({
      email: formData.email,
      type: 'reset'
    })
  }

  const handleRequestReset = async () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.email) {
      newErrors.email = '请输入邮箱地址'
    }
    if (!formData.verification_code) {
      newErrors.verification_code = '请输入验证码'
    }
    
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      setLoading(true)
      try {
        await authAPI.passwordReset({
          email: formData.email,
          verification_code: formData.verification_code
        })
        // 实际应用中，这里应该显示"请检查邮箱"的提示
        // 这里为了演示，直接进入下一步
        setStep(2)
      } catch (error: any) {
        setErrors({ submit: error.message || '请求失败，请重试' })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleResetPassword = async () => {
    const newErrors: Record<string, string> = {}
    
    const passwordError = validatePassword(formData.new_password)
    if (passwordError) {
      newErrors.new_password = passwordError
    }
    
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
        await authAPI.passwordResetConfirm({
          email: formData.email,
          token: formData.token,
          new_password: formData.new_password,
          new_password_confirm: formData.new_password_confirm
        })
        setStep(3)
      } catch (error: any) {
        setErrors({ submit: error.message || '重置失败，请重试' })
      } finally {
        setLoading(false)
      }
    }
  }

  // 从URL参数获取token（如果有）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const email = params.get('email')
    if (token && email) {
      setFormData(prev => ({ ...prev, token, email }))
      setStep(2)
    }
  }, [])

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
                error={errors.email}
              />

              <div className="relative">
                <PixelInput
                  label="验证码"
                  name="verification_code"
                  value={formData.verification_code}
                  onChange={handleInputChange}
                  placeholder="请输入6位验证码"
                  icon="✉️"
                  error={errors.verification_code}
                  maxLength={6}
                />
                <CountdownButton 
                  onClick={handleSendVerifyCode} 
                  email={formData.email}
                  type="reset"
                />
              </div>

              {errors.submit && (
                <p className="text-sm text-red-500 text-center">{errors.submit}</p>
              )}

              <motion.button
                className="w-full pixel-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRequestReset}
                disabled={loading}
              >
                {loading ? '验证中...' : '下一步'}
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
                  error={errors.token}
                />
              )}

              <PixelInput
                label="新密码"
                name="new_password"
                type={showPassword ? 'text' : 'password'}
                value={formData.new_password}
                onChange={handleInputChange}
                placeholder="8-32位字母+数字"
                icon="🔐"
                error={errors.new_password}
              />

              <PixelInput
                label="确认新密码"
                name="new_password_confirm"
                type={showPassword ? 'text' : 'password'}
                value={formData.new_password_confirm}
                onChange={handleInputChange}
                placeholder="再次输入新密码"
                icon="🔐"
                error={errors.new_password_confirm}
              />

              <div className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  id="showNewPassword"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="showNewPassword" className="text-gray-400 cursor-pointer">
                  显示密码
                </label>
              </div>

              <div className="p-4 bg-gray-900 rounded space-y-2 text-xs text-gray-400">
                <p>密码要求：</p>
                <p>✓ 8-32个字符</p>
                <p>✓ 必须包含字母和数字</p>
                <p>✓ 不能是纯数字或纯字母</p>
              </div>

              {errors.submit && (
                <p className="text-sm text-red-500 text-center">{errors.submit}</p>
              )}

              <motion.button
                className="w-full pixel-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleResetPassword}
                disabled={loading}
              >
                {loading ? '重置中...' : '重置密码'}
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
              animate={{ scale: [1, 1.2, 1] }}
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
            >
              立即登录
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 认证页面容器
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
        <Link href="/" className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <PixelLogo />
          </motion.div>
          <span className="text-xl font-black text-gold-500">平行世界</span>
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
