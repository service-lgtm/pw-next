// src/components/ui/PixelInput.tsx
// 像素风格输入框组件

'use client'

import { forwardRef, InputHTMLAttributes, useState } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export interface PixelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: string
  showPasswordToggle?: boolean
}

export const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(
  ({ className, label, error, icon, type = 'text', showPasswordToggle, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputType = showPasswordToggle && type === 'password' 
      ? (showPassword ? 'text' : 'password') 
      : type

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-bold text-gray-300">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">
              {icon}
            </span>
          )}
          
          <input
            type={inputType}
            className={cn(
              "w-full px-4 py-3 bg-[#0A1628] text-white",
              "border-4 border-gray-700 focus:border-gold-500",
              "outline-none transition-all duration-200",
              "placeholder:text-gray-500",
              icon && "pl-12",
              showPasswordToggle && "pr-12",
              error && "border-red-500",
              className
            )}
            ref={ref}
            {...props}
          />
          
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          )}
        </div>
        
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-500 flex items-center gap-1"
          >
            <span>⚠️</span>
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)

PixelInput.displayName = 'PixelInput'

// 验证码输入框组件
interface PixelCodeInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  error?: string
  label?: string
}

export function PixelCodeInput({ 
  value, 
  onChange, 
  length = 6, 
  error,
  label = '验证码'
}: PixelCodeInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').slice(0, length)
    onChange(newValue)
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-bold text-gray-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={`请输入${length}位验证码`}
          className={cn(
            "w-full px-4 py-3 bg-[#0A1628] text-white text-center tracking-widest",
            "border-4 border-gray-700 focus:border-gold-500",
            "outline-none transition-all duration-200",
            "placeholder:text-gray-500 placeholder:tracking-normal",
            "font-mono text-xl",
            error && "border-red-500"
          )}
          maxLength={length}
        />
        
        {/* 显示输入进度 */}
        <div className="absolute top-1/2 right-4 -translate-y-1/2 text-sm text-gray-400">
          {value.length}/{length}
        </div>
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 flex items-center gap-1"
        >
          <span>⚠️</span>
          {error}
        </motion.p>
      )}
    </div>
  )
}

// 密码强度指示器
interface PasswordStrength {
  score: number
  label: string
  color: string
}

export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0
  
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  
  if (score <= 2) return { score, label: '弱', color: 'bg-red-500' }
  if (score <= 4) return { score, label: '中', color: 'bg-yellow-500' }
  return { score, label: '强', color: 'bg-green-500' }
}

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null
  
  const strength = getPasswordStrength(password)
  
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={cn(
              "flex-1 h-1 bg-gray-700 transition-all duration-300",
              strength.score >= level * 2 && strength.color
            )}
          />
        ))}
      </div>
      <p className="text-xs text-gray-400">
        密码强度：<span className={cn(
          "font-bold",
          strength.score <= 2 && "text-red-500",
          strength.score > 2 && strength.score <= 4 && "text-yellow-500",
          strength.score > 4 && "text-green-500"
        )}>{strength.label}</span>
      </p>
    </div>
  )
}
