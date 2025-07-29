// src/components/settings/TeamSection.tsx
// 团队信息组件 - 修改后版本

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

export function TeamSection() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)

  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      // 获取用户最新的个人资料数据
      const response = await api.accounts.profile()
      if (response.success && response.data) {
        setProfileData(response.data)
      }
    } catch (error) {
      console.error('加载团队数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 使用最新的资料数据或用户数据
  const displayData = profileData || user

  if (loading) {
    return (
      <PixelCard className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载团队数据中...</p>
        </div>
      </PixelCard>
    )
  }

  return (
    <PixelCard className="p-6">
      <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
        <span>👥</span>
        公会信息
      </h2>

      {/* 推荐信息 */}
      <div className="mb-8 p-4 bg-gray-800/50 rounded">
        <h3 className="text-lg font-bold text-gray-300 mb-4">我的推荐信息</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400">我的推荐码</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="font-mono text-lg font-bold text-gold-500">
                {displayData?.referral_code || '未设置'}
              </p>
              <button
                onClick={() => {
                  if (displayData?.referral_code) {
                    navigator.clipboard.writeText(displayData.referral_code)
                    toast.success('推荐码已复制到剪贴板')
                  }
                }}
                className="text-sm text-gold-500 hover:text-gold-400"
              >
                📋 复制
              </button>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-400">我的推荐人</p>
            <p className="font-bold mt-1">
              {displayData?.referrer_nickname || '无'}
            </p>
          </div>
        </div>
      </div>

      {/* 团队统计 - 修改后的显示 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 雇佣人数 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-lg border-2 border-purple-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-2">雇佣人数</p>
              <p className="text-3xl font-black text-purple-500">
                {displayData?.direct_referrals_count || 0}
                <span className="text-sm ml-2 text-gray-400">人</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">直接推荐的用户</p>
            </div>
            <span className="text-5xl opacity-30">👤</span>
          </div>
        </motion.div>

        {/* 公会总人数 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 rounded-lg border-2 border-green-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-2">公会总人数</p>
              <p className="text-3xl font-black text-green-500">
                {displayData?.total_referrals_count || 0}
                <span className="text-sm ml-2 text-gray-400">人</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">包含所有层级成员</p>
            </div>
            <span className="text-5xl opacity-30">👥</span>
          </div>
        </motion.div>
      </div>

      {/* 个人贡献统计 */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-800/50 rounded">
          <p className="text-2xl font-black text-blue-500">
            {displayData?.direct_referrals_count || 0}
          </p>
          <p className="text-sm text-gray-400 mt-1">雇佣人数</p>
        </div>
        <div className="text-center p-4 bg-gray-800/50 rounded">
          <p className="text-2xl font-black text-orange-500">
            {displayData?.total_referrals_count || 0}
          </p>
          <p className="text-sm text-gray-400 mt-1">公会总数</p>
        </div>
        <div className="text-center p-4 bg-gray-800/50 rounded">
          <p className="text-2xl font-black text-gold-500">
            {displayData?.level || 1}
          </p>
          <p className="text-sm text-gray-400 mt-1">当前等级</p>
        </div>
      </div>

      {/* 推荐链接 */}
      <div className="mt-8 p-4 bg-gold-500/10 border-2 border-gold-500/30 rounded">
        <h3 className="text-sm font-bold text-gold-500 mb-2">推荐链接</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={`https://www.pxsj.net.cn/register?ref=${displayData?.referral_code || ''}`}
            readOnly
            className="flex-1 px-3 py-2 bg-gray-800 text-sm text-gray-300 rounded border-2 border-gray-700"
          />
          <button
            onClick={() => {
              const url = `https://www.pxsj.net.cn/register?ref=${displayData?.referral_code || ''}`
              navigator.clipboard.writeText(url)
              toast.success('推荐链接已复制')
            }}
            className="px-4 py-2 bg-gold-500 text-black font-bold rounded hover:bg-gold-400 transition-colors"
          >
            复制
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          分享此链接，新用户注册后将自动成为您的推荐用户
        </p>
      </div>

      {/* 刷新按钮 */}
      <div className="mt-6 text-center">
        <button
          onClick={loadProfileData}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors inline-flex items-center gap-2"
        >
          <span>🔄</span>
          刷新数据
        </button>
      </div>

      {/* 提示信息 */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded">
        <p className="text-sm text-blue-400 flex items-start gap-2">
          <span>💡</span>
          <span>
            雇佣人数是指您直接推荐的用户数量。
            公会总人数包含您的所有下级成员，包括直接推荐和间接推荐的用户。
            发展更多成员可以获得更多奖励和权益。
          </span>
        </p>
      </div>
    </PixelCard>
  )
}
