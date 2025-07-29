// src/components/settings/ProfileSection.tsx
// 个人资料设置组件 - 完整版本

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelInput } from '@/components/ui/PixelInput'
import { api, getErrorMessage, ApiError } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

export function ProfileSection() {
  const { user, checkAuth } = useAuth()
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [profile, setProfile] = useState({
    nickname: '',
    description: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 加载用户资料
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await api.accounts.profile()
      if (response.success && response.data) {
        setProfileData(response.data)
        setProfile({
          nickname: response.data.nickname || '',
          description: response.data.description || ''
        })
      }
    } catch (error) {
      console.error('加载个人资料失败:', error)
    }
  }

  // 使用最新的资料数据或用户数据
  const displayData = profileData || user

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      const response = await api.accounts.updateProfile(profile)
      if (response.success) {
        toast.success('个人资料更新成功')
        // 刷新认证状态以更新用户信息
        await checkAuth()
        // 重新加载最新数据
        await loadProfile()
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMessage = getErrorMessage(error)
        toast.error(errorMessage)
        
        // 处理字段级错误
        if (error.details?.errors) {
          setErrors(error.details.errors)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <PixelCard className="p-6">
      <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
        <span>👤</span>
        个人资料
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息展示 */}
        <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-800/50 rounded">
          <div>
            <p className="text-sm text-gray-400">用户名</p>
            <p className="font-bold">{displayData?.username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">邮箱</p>
            <p className="font-bold">{displayData?.masked_email || displayData?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">手机号</p>
            <p className="font-bold">{displayData?.masked_phone || '未绑定'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">会员等级</p>
            <p className="font-bold">
              <span style={{ color: displayData?.level_color }}>
                {displayData?.level_name || `等级 ${displayData?.level || 1}`}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">推荐码</p>
            <p className="font-bold text-gold-500">{displayData?.referral_code}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">推荐人</p>
            <p className="font-bold">{displayData?.referrer_nickname || '无'}</p>
          </div>
        </div>

        {/* 可编辑字段 */}
        <PixelInput
          label="昵称"
          value={profile.nickname}
          onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
          placeholder="请输入昵称（2-20个字符）"
          error={errors.nickname?.[0]}
          icon="✏️"
        />

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-300">
            账号描述
          </label>
          <textarea
            value={profile.description}
            onChange={(e) => setProfile({ ...profile, description: e.target.value })}
            placeholder="介绍一下自己（最多500字）"
            className={cn(
              "w-full px-4 py-3 bg-[#0A1628] text-white",
              "border-4 border-gray-700 focus:border-gold-500",
              "outline-none transition-all duration-200",
              "placeholder:text-gray-500",
              "min-h-[100px] resize-none",
              errors.description && "border-red-500"
            )}
            maxLength={500}
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{errors.description?.[0]}</span>
            <span>{profile.description.length}/500</span>
          </div>
        </div>

        <div className="flex justify-end">
          <PixelButton
            type="submit"
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? '保存中...' : '保存修改'}
          </PixelButton>
        </div>
      </form>

      {/* 统计信息 */}
      <div className="mt-8 pt-6 border-t-4 border-gray-800">
        <h3 className="text-lg font-bold text-gray-300 mb-4">账户统计</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-black text-gold-500">
              {profileData?.direct_referrals_count || user?.direct_referrals_count || 0}
            </p>
            <p className="text-sm text-gray-400">雇佣人数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-purple-500">
              {profileData?.total_referrals_count || user?.total_referrals_count || 0}
            </p>
            <p className="text-sm text-gray-400">公会总人数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-green-500">
              {profileData?.energy || user?.energy || 100}%
            </p>
            <p className="text-sm text-gray-400">能量值</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-blue-500">
              {(profileData?.is_activated ?? user?.is_activated) ? '已激活' : '未激活'}
            </p>
            <p className="text-sm text-gray-400">账户状态</p>
          </div>
        </div>
      </div>
    </PixelCard>
  )
}
