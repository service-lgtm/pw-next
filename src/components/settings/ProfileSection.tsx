// src/components/settings/ProfileSection.tsx
// 个人资料设置组件 - 移除了账号描述、能量值、账户状态

'use client'

import { useState, useEffect } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

export function ProfileSection() {
  const { user, checkAuth } = useAuth()
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    phone: '',
  })

  // 获取用户资料
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await api.accounts.profile()
      
      if (response.success && response.data) {
        setProfileData(response.data)
        setFormData({
          nickname: response.data.nickname || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
        })
      }
    } catch (error) {
      console.error('获取个人资料失败:', error)
      toast.error('获取个人资料失败')
    } finally {
      setLoading(false)
    }
  }

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      // 调用更新个人资料的 API
      const response = await api.accounts.updateProfile(formData)
      
      if (response.success) {
        toast.success('个人资料更新成功')
        // 刷新用户信息
        await checkAuth()
        await fetchProfile()
      } else {
        toast.error(response.message || '更新失败')
      }
    } catch (error: any) {
      console.error('更新个人资料失败:', error)
      toast.error(error.message || '更新失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <PixelCard className="p-6">
      <h2 className="text-xl font-black mb-6 text-gold-500">个人资料</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 用户名 - 只读 */}
        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2">
            用户名
          </label>
          <input
            type="text"
            value={profileData?.username || user?.username || ''}
            disabled
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">用户名不可修改</p>
        </div>

        {/* 昵称 */}
        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2">
            昵称
          </label>
          <input
            type="text"
            name="nickname"
            value={formData.nickname}
            onChange={handleInputChange}
            placeholder="请输入昵称"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
          />
        </div>

        {/* 邮箱 */}
        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2">
            邮箱
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="请输入邮箱地址"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
          />
        </div>

        {/* 手机号 */}
        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2">
            手机号
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="请输入手机号"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
          />
        </div>

        {/* 账户等级 - 只读 */}
        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2">
            账户等级
          </label>
          <div className="px-4 py-2 bg-gray-800 border border-gray-700 rounded">
            <span 
              className="font-bold"
              style={{ color: profileData?.level_color || '#FFD700' }}
            >
              {profileData?.level_name || `等级 ${profileData?.level || 1}`}
            </span>
          </div>
        </div>

        {/* 推荐码 - 只读 */}
        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2">
            我的推荐码
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={profileData?.referral_code || user?.referral_code || ''}
              disabled
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gold-500 font-bold cursor-not-allowed"
            />
            <PixelButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                const code = profileData?.referral_code || user?.referral_code || ''
                if (code) {
                  navigator.clipboard.writeText(code)
                  toast.success('推荐码已复制')
                }
              }}
            >
              复制
            </PixelButton>
          </div>
        </div>

        {/* 注册时间 - 只读 */}
        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2">
            注册时间
          </label>
          <input
            type="text"
            value={profileData?.created_at ? new Date(profileData.created_at).toLocaleString('zh-CN') : ''}
            disabled
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-400 cursor-not-allowed"
          />
        </div>

        {/* 提交按钮 */}
        <div className="pt-4">
          <PixelButton
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? '保存中...' : '保存修改'}
          </PixelButton>
        </div>
      </form>
    </PixelCard>
  )
}
