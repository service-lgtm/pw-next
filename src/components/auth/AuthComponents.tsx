'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { PixelLogo } from '@/components/ui/PixelLogo'
import Link from 'next/link'

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
  onClick: () => void
  disabled?: boolean
}

function CountdownButton({ onClick, disabled }: CountdownButtonProps) {
  const [countdown, setCountdown] = useState(0)

  const handleClick = () => {
    if (countdown > 0 || disabled) return
    onClick()
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
  }

  return (
    <button
      onClick={handleClick}
      disabled={countdown > 0 || disabled}
      className={cn(
        'absolute right-2 top-1/2 -translate-y-1/2',
        'px-4 py-1 text-sm font-bold',
        'transition-all duration-200',
        countdown > 0 || disabled
          ? 'text-gray-500 cursor-not-allowed'
          : 'text-gold-500 hover:text-gold-400'
      )}
    >
      {countdown > 0 ? `${countdown}s` : '发送验证码'}
    </button>
  )
}

// 注册组件
export function RegisterForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    verifyCode: '',
    inviteCode: '',
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
    
    if (!formData.username || formData.username.length < 6) {
      newErrors.username = '用户名至少6个字符'
    }
    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = '请输入有效的邮箱地址'
    }
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = '密码至少8个字符'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次密码不一致'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.verifyCode || formData.verifyCode.length !== 6) {
      newErrors.verifyCode = '请输入6位验证码'
    }
    if (!formData.agreement) {
      newErrors.agreement = '请同意用户协议'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
      // 这里可以调用注册API
      console.log('注册成功:', formData)
    }
  }

  const handleSendVerifyCode = () => {
    console.log('发送验证码到:', formData.email)
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
              label="用户名"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="6-20个字符"
              icon="👤"
              error={errors.username}
            />

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
              placeholder="8-20位字母+数字"
              icon="🔐"
              error={errors.password}
            />

            <PixelInput
              label="确认密码"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="再次输入密码"
              icon="🔐"
              error={errors.confirmPassword}
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
              <a href="#" className="text-gold-500 hover:underline ml-1">
                立即登录
              </a>
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
                name="verifyCode"
                value={formData.verifyCode}
                onChange={handleInputChange}
                placeholder="请输入6位验证码"
                icon="✉️"
                error={errors.verifyCode}
                maxLength={6}
              />
              <CountdownButton onClick={handleSendVerifyCode} />
            </div>

            <PixelInput
              label="邀请码（选填）"
              name="inviteCode"
              value={formData.inviteCode}
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
              >
                完成注册
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

            <div className="space-y-3">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded">
                <p className="text-sm text-green-500">
                  ✅ 新手礼包已到账：100 TDB + 10 YLD
                </p>
              </div>

              <div className="pixel-card p-6 bg-gradient-to-br from-gold-500/20 to-transparent">
                <h3 className="text-lg font-bold mb-4 text-center">
                  🎁 新手福利
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>TDB积分（黄金通证）</span>
                    <span className="font-bold text-gold-500">100枚</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>YLD积分（陨石积分）</span>
                    <span className="font-bold text-purple-500">10枚</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>新手任务奖励</span>
                    <span className="font-bold text-green-500">最高500 TDB</span>
                  </div>
                </div>
              </div>

              <motion.button
                className="w-full pixel-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                进入平行世界
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 登录组件
export function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleLogin = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.email) {
      newErrors.email = '请输入邮箱'
    }
    if (!formData.password) {
      newErrors.password = '请输入密码'
    }
    
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      console.log('登录:', formData)
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              className="w-4 h-4"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-400 cursor-pointer">
              记住我（30天免登录）
            </label>
          </div>

          <motion.button
            className="w-full pixel-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
          >
            立即登录
          </motion.button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
              还没有账号？
              <Link href="/register" className="text-gold-500 hover:underline ml-1">
                立即注册
              </Link>
            </p>
            <p className="text-xs text-gray-500">
              登录即表示同意
              <a href="#" className="text-gold-500 hover:underline mx-1">
                服务条款
              </a>
            </p>
          </div>
        </div>

        {/* 快速登录 */}
        <div className="pt-6 border-t border-gray-800">
          <p className="text-center text-sm text-gray-500 mb-4">
            游客快速体验
          </p>
          <Link href="/experience">
            <motion.button
              className="w-full py-3 border-2 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              👁️ 游客模式
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

// 找回密码组件
export function ResetPasswordForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    verifyCode: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSendVerifyCode = () => {
    if (!formData.email) {
      setErrors({ email: '请输入邮箱地址' })
      return
    }
    console.log('发送验证码到:', formData.email)
  }

  const handleNext = () => {
    const newErrors: Record<string, string> = {}
    
    if (step === 1) {
      if (!formData.email) {
        newErrors.email = '请输入邮箱地址'
      }
      if (!formData.verifyCode) {
        newErrors.verifyCode = '请输入验证码'
      }
    } else if (step === 2) {
      if (!formData.newPassword || formData.newPassword.length < 8) {
        newErrors.newPassword = '密码至少8个字符'
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次密码不一致'
      }
    }
    
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      if (step === 1) {
        setStep(2)
      } else {
        setStep(3)
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
                  name="verifyCode"
                  value={formData.verifyCode}
                  onChange={handleInputChange}
                  placeholder="请输入6位验证码"
                  icon="✉️"
                  error={errors.verifyCode}
                  maxLength={6}
                />
                <CountdownButton onClick={handleSendVerifyCode} />
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
              <PixelInput
                label="新密码"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="8-20位字母+数字"
                icon="🔐"
                error={errors.newPassword}
              />

              <PixelInput
                label="确认新密码"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="再次输入新密码"
                icon="🔐"
                error={errors.confirmPassword}
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
                <p>✓ 至少8个字符</p>
                <p>✓ 包含字母和数字</p>
                <p>✓ 不要使用简单密码</p>
              </div>

              <motion.button
                className="w-full pixel-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
              >
                重置密码
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

            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded">
              <p className="text-sm text-green-500">
                💡 安全提示：请妥善保管您的密码和助记词
              </p>
            </div>

            <motion.button
              className="w-full pixel-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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
