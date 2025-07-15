// src/components/settings/PaymentPasswordSection.tsx
// 支付密码设置组件

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelInput, PixelCodeInput } from '@/components/ui/PixelInput'
import { api, getErrorMessage, ApiError } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

type ViewType = 'menu' | 'set' | 'change' | 'reset'

export function PaymentPasswordSection() {
  const { user } = useAuth()
  const [view, setView] = useState<ViewType>('menu')
  const [loading, setLoading] = useState(false)
  const [hasPaymentPassword, setHasPaymentPassword] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // 检查是否已设置支付密码（这里假设通过某个字段判断）
  useEffect(() => {
    // TODO: 需要API返回是否已设置支付密码的状态
    // 暂时假设已设置
    setHasPaymentPassword(true)
  }, [user])

  // 倒计时处理
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const renderContent = () => {
    switch (view) {
      case 'menu':
        return <MenuView />
      case 'set':
        return <SetPasswordView />
      case 'change':
        return <ChangePasswordView />
      case 'reset':
        return <ResetPasswordView />
      default:
        return null
    }
  }

  // 菜单视图
  const MenuView = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
        <span>💳</span>
        支付密码管理
      </h2>

      <div className="p-4 bg-gray-800/50 rounded">
        <p className="text-sm text-gray-300 mb-2">
          支付密码状态：
          <span className={hasPaymentPassword ? "text-green-500" : "text-yellow-500"}>
            {hasPaymentPassword ? " 已设置" : " 未设置"}
          </span>
        </p>
        <p className="text-xs text-gray-400">
          支付密码用于保护您的资产安全，进行转账、购买等操作时需要验证
        </p>
      </div>

      <div className="grid gap-3">
        {!hasPaymentPassword && (
          <PixelButton
            onClick={() => setView('set')}
            className="w-full justify-start"
          >
            <span className="mr-2">🔐</span>
            设置支付密码
          </PixelButton>
        )}
        
        {hasPaymentPassword && (
          <>
            <PixelButton
              onClick={() => setView('change')}
              variant="secondary"
              className="w-full justify-start"
            >
              <span className="mr-2">🔄</span>
              修改支付密码
            </PixelButton>
            
            <PixelButton
              onClick={() => setView('reset')}
              variant="secondary"
              className="w-full justify-start"
            >
              <span className="mr-2">🔑</span>
              重置支付密码
            </PixelButton>
          </>
        )}
      </div>
    </div>
  )

  // 设置支付密码视图
  const SetPasswordView = () => {
    const [formData, setFormData] = useState({
      password: '',
      confirm_password: ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validatePassword = (password: string) => {
      if (!/^\d{6}$/.test(password)) {
        return '支付密码必须是6位数字'
      }
      
      // 检查简单密码
      const simplePasswords = ['123456', '111111', '000000', '123123', '666666', '888888']
      if (simplePasswords.includes(password)) {
        return '密码过于简单，请重新设置'
      }
      
      // 检查连续数字
      const isSequential = password.split('').every((digit, index, arr) => {
        if (index === 0) return true
        return parseInt(digit) === parseInt(arr[index - 1]) + 1 ||
               parseInt(digit) === parseInt(arr[index - 1]) - 1
      })
      
      if (isSequential) {
        return '不能使用连续数字作为密码'
      }
      
      return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setErrors({})

      // 验证
      const passwordError = validatePassword(formData.password)
      if (passwordError) {
        setErrors({ password: passwordError })
        return
      }

      if (formData.password !== formData.confirm_password) {
        setErrors({ confirm_password: '两次输入的密码不一致' })
        return
      }

      setLoading(true)

      try {
        const response = await api.accounts.setPaymentPassword(formData)
        if (response.success) {
          toast.success('支付密码设置成功')
          setHasPaymentPassword(true)
          setView('menu')
        }
      } catch (error) {
        if (error instanceof ApiError) {
          const errorMessage = getErrorMessage(error)
          toast.error(errorMessage)
        }
      } finally {
        setLoading(false)
      }
    }

    return (
      <div>
        <button
          onClick={() => setView('menu')}
          className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
        >
          <span>←</span> 返回
        </button>
        
        <h3 className="text-lg font-bold text-white mb-4">设置支付密码</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <PixelCodeInput
            label="支付密码"
            value={formData.password}
            onChange={(value) => setFormData({ ...formData, password: value })}
            length={6}
            error={errors.password}
          />
          
          <PixelCodeInput
            label="确认支付密码"
            value={formData.confirm_password}
            onChange={(value) => setFormData({ ...formData, confirm_password: value })}
            length={6}
            error={errors.confirm_password}
          />
          
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
            <p className="text-xs text-blue-400">
              💡 支付密码安全提示：
              <br />• 请使用6位数字，不要使用生日、手机号等
              <br />• 不要使用连续或重复的数字
              <br />• 请牢记密码，忘记需要通过邮箱重置
            </p>
          </div>
          
          <PixelButton
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? '设置中...' : '确认设置'}
          </PixelButton>
        </form>
      </div>
    )
  }

  // 修改支付密码视图
  const ChangePasswordView = () => {
    const [formData, setFormData] = useState({
      old_password: '',
      new_password: '',
      confirm_new_password: ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setErrors({})

      if (formData.new_password !== formData.confirm_new_password) {
        setErrors({ confirm_new_password: '两次输入的密码不一致' })
        return
      }

      setLoading(true)

      try {
        const response = await api.accounts.changePaymentPassword(formData)
        if (response.success) {
          toast.success('支付密码修改成功')
          setView('menu')
        }
      } catch (error) {
        if (error instanceof ApiError) {
          const errorMessage = getErrorMessage(error)
          toast.error(errorMessage)
        }
      } finally {
        setLoading(false)
      }
    }

    return (
      <div>
        <button
          onClick={() => setView('menu')}
          className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
        >
          <span>←</span> 返回
        </button>
        
        <h3 className="text-lg font-bold text-white mb-4">修改支付密码</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <PixelCodeInput
            label="当前支付密码"
            value={formData.old_password}
            onChange={(value) => setFormData({ ...formData, old_password: value })}
            length={6}
            error={errors.old_password}
          />
          
          <PixelCodeInput
            label="新支付密码"
            value={formData.new_password}
            onChange={(value) => setFormData({ ...formData, new_password: value })}
            length={6}
            error={errors.new_password}
          />
          
          <PixelCodeInput
            label="确认新密码"
            value={formData.confirm_new_password}
            onChange={(value) => setFormData({ ...formData, confirm_new_password: value })}
            length={6}
            error={errors.confirm_new_password}
          />
          
          <PixelButton
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? '修改中...' : '确认修改'}
          </PixelButton>
        </form>
      </div>
    )
  }

  // 重置支付密码视图
  const ResetPasswordView = () => {
    const [step, setStep] = useState<'sendCode' | 'reset'>('sendCode')
    const [formData, setFormData] = useState({
      email_code: '',
      new_password: '',
      confirm_password: ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleSendCode = async () => {
      if (countdown > 0) return

      setLoading(true)
      try {
        const response = await api.accounts.sendPaymentPasswordResetCode()
        if (response.success) {
          toast.success('验证码已发送到您的邮箱')
          setCountdown(60)
          setStep('reset')
        }
      } catch (error) {
        if (error instanceof ApiError) {
          const errorMessage = getErrorMessage(error)
          toast.error(errorMessage)
        }
      } finally {
        setLoading(false)
      }
    }

    const handleReset = async (e: React.FormEvent) => {
      e.preventDefault()
      setErrors({})

      if (formData.new_password !== formData.confirm_password) {
        setErrors({ confirm_password: '两次输入的密码不一致' })
        return
      }

      setLoading(true)

      try {
        const response = await api.accounts.resetPaymentPassword(formData)
        if (response.success) {
          toast.success('支付密码重置成功')
          setView('menu')
        }
      } catch (error) {
        if (error instanceof ApiError) {
          const errorMessage = getErrorMessage(error)
          toast.error(errorMessage)
        }
      } finally {
        setLoading(false)
      }
    }

    return (
      <div>
        <button
          onClick={() => setView('menu')}
          className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
        >
          <span>←</span> 返回
        </button>
        
        <h3 className="text-lg font-bold text-white mb-4">重置支付密码</h3>
        
        {step === 'sendCode' ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              重置支付密码需要通过邮箱验证。验证码将发送到：
            </p>
            <p className="font-bold text-gold-500">{user?.masked_email}</p>
            
            <PixelButton
              onClick={handleSendCode}
              disabled={loading || countdown > 0}
              className="w-full"
            >
              {loading ? '发送中...' : '发送验证码'}
            </PixelButton>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <PixelCodeInput
                label="邮箱验证码"
                value={formData.email_code}
                onChange={(value) => setFormData({ ...formData, email_code: value })}
                length={6}
                error={errors.email_code}
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={countdown > 0}
                className="mt-2 text-sm text-gold-500 hover:text-gold-400"
              >
                {countdown > 0 ? `重新发送(${countdown}s)` : '重新发送验证码'}
              </button>
            </div>
            
            <PixelCodeInput
              label="新支付密码"
              value={formData.new_password}
              onChange={(value) => setFormData({ ...formData, new_password: value })}
              length={6}
              error={errors.new_password}
            />
            
            <PixelCodeInput
              label="确认新密码"
              value={formData.confirm_password}
              onChange={(value) => setFormData({ ...formData, confirm_password: value })}
              length={6}
              error={errors.confirm_password}
            />
            
            <PixelButton
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? '重置中...' : '确认重置'}
            </PixelButton>
          </form>
        )}
      </div>
    )
  }

  return (
    <PixelCard className="p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </PixelCard>
  )
}
