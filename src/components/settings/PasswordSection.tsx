// src/components/settings/PasswordSection.tsx
// 登录密码设置组件 - 最小化版本用于测试

'use client'

import React from 'react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelInput, PasswordStrengthIndicator } from '@/components/ui/PixelInput'
import { api, getAccountErrorMessage, ApiError } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface FormData {
  old_password: string
  new_password: string
  confirm_new_password: string
}

interface FormErrors {
  [key: string]: string
}

export function PasswordSection(): JSX.Element {
  const { logout } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)
  const [formData, setFormData] = useState<FormData>({
    old_password: '',
    new_password: '',
    confirm_new_password: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.old_password) {
      newErrors.old_password = '请输入当前密码'
    }

    if (!formData.new_password) {
      newErrors.new_password = '请输入新密码'
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = '密码长度至少8位'
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.new_password)) {
      newErrors.new_password = '密码必须包含字母和数字'
    }

    if (!formData.confirm_new_password) {
      newErrors.confirm_new_password = '请确认新密码'
    } else if (formData.new_password !== formData.confirm_new_password) {
      newErrors.confirm_new_password = '两次输入的密码不一致'
    }

    if (formData.old_password === formData.new_password) {
      newErrors.new_password = '新密码不能与旧密码相同'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await api.accounts.changePassword(formData)
      if (response.success) {
        toast.success('密码修改成功，请重新登录')
        
        setFormData({
          old_password: '',
          new_password: '',
          confirm_new_password: ''
        })
        
        setTimeout(async () => {
          await logout()
        }, 2000)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMessage = getAccountErrorMessage(error)
        toast.error(errorMessage)
        
        if (error.details && error.details.errors) {
          const fieldErrors: FormErrors = {}
          Object.entries(error.details.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              fieldErrors[field] = messages[0]
            }
          })
          setErrors(fieldErrors)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <PixelCard className="p-6">
      <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
        <span>🔐</span>
        <span>修改登录密码</span>
      </h2>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 bg-yellow-500/10 border-2 border-yellow-500/30 rounded"
      >
        <p className="text-sm text-yellow-500 flex items-start gap-2">
          <span>⚠️</span>
          <span>修改密码后需要重新登录。请确保记住新密码！</span>
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <PixelInput
          type="password"
          label="当前密码"
          value={formData.old_password}
          onChange={(e) => handleInputChange('old_password', e.target.value)}
          placeholder="请输入当前登录密码"
          error={errors.old_password}
          showPasswordToggle
          icon="🔑"
        />

        <div className="space-y-2">
          <PixelInput
            type="password"
            label="新密码"
            value={formData.new_password}
            onChange={(e) => handleInputChange('new_password', e.target.value)}
            placeholder="请输入新密码（8-32位）"
            error={errors.new_password}
            showPasswordToggle
            icon="🆕"
          />
          <PasswordStrengthIndicator password={formData.new_password} />
        </div>

        <PixelInput
          type="password"
          label="确认新密码"
          value={formData.confirm_new_password}
          onChange={(e) => handleInputChange('confirm_new_password', e.target.value)}
          placeholder="请再次输入新密码"
          error={errors.confirm_new_password}
          showPasswordToggle
          icon="✅"
        />

        <div className="p-4 bg-gray-800/50 rounded space-y-1">
          <p className="text-sm font-bold text-gray-300 mb-2">密码要求：</p>
          <p className="text-xs text-gray-400 flex items-center gap-2">
            <span>{formData.new_password.length >= 8 ? '✅' : '❌'}</span>
            <span>长度8-32个字符</span>
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-2">
            <span>{/[a-zA-Z]/.test(formData.new_password) && /[0-9]/.test(formData.new_password) ? '✅' : '❌'}</span>
            <span>必须包含字母和数字</span>
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-2">
            <span>{formData.old_password && formData.new_password && formData.old_password !== formData.new_password ? '✅' : '❌'}</span>
            <span>不能与旧密码相同</span>
          </p>
        </div>

        <div className="flex justify-end gap-4">
          <PixelButton
            type="button"
            variant="secondary"
            onClick={() => {
              setFormData({
                old_password: '',
                new_password: '',
                confirm_new_password: ''
              })
              setErrors({})
            }}
          >
            重置
          </PixelButton>
          <PixelButton
            type="submit"
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? '修改中...' : '确认修改'}
          </PixelButton>
        </div>
      </form>
    </PixelCard>
  )
}
