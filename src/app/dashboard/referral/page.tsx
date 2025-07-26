// src/app/dashboard/referral/page.tsx
// 推荐码页面

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useAuth } from '@/hooks/useAuth'
import QRCode from 'qrcode'
import toast from 'react-hot-toast'

export default function ReferralPage() {
  const { user } = useAuth()
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [copying, setCopying] = useState(false)
  
  // 获取推荐码和推荐链接
  const referralCode = user?.referral_code || ''
  const referralLink = `https://www.pxsj.net.cn/register?ref=${referralCode}`
  
  // 生成二维码
  useEffect(() => {
    if (referralCode) {
      QRCode.toDataURL(referralLink, {
        width: 256,
        margin: 2,
        color: {
          dark: '#FFD700', // 金色
          light: '#0F0F1E', // 背景色
        }
      }, (err, url) => {
        if (!err) {
          setQrCodeUrl(url)
        }
      })
    }
  }, [referralCode, referralLink])
  
  // 复制推荐码
  const copyReferralCode = async () => {
    setCopying(true)
    try {
      await navigator.clipboard.writeText(referralCode)
      toast.success('推荐码已复制到剪贴板')
    } catch (err) {
      toast.error('复制失败，请手动复制')
    } finally {
      setTimeout(() => setCopying(false), 1000)
    }
  }
  
  // 复制推荐链接
  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      toast.success('推荐链接已复制到剪贴板')
    } catch (err) {
      toast.error('复制失败，请手动复制')
    }
  }
  
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-black text-white">
          我的推荐码
        </h1>
        <p className="text-gray-400 mt-1">
          邀请好友加入平行世界，共同构建数字经济体系
        </p>
      </motion.div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* 左侧 - 推荐码信息 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PixelCard className="p-6 h-full">
            <h2 className="text-xl font-black mb-4 text-gold-500">推荐信息</h2>
            
            {/* 推荐码 */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-2">您的推荐码</p>
              <div className="flex items-center gap-3">
                <div className="bg-gray-800 px-4 py-3 rounded-lg flex-1">
                  <p className="text-2xl font-black text-gold-500 tracking-wider">
                    {referralCode || '加载中...'}
                  </p>
                </div>
                <PixelButton
                  variant="primary"
                  size="sm"
                  onClick={copyReferralCode}
                  disabled={!referralCode || copying}
                >
                  {copying ? '已复制' : '复制'}
                </PixelButton>
              </div>
            </div>
            
            {/* 推荐链接 */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-2">推荐链接</p>
              <div className="bg-gray-800 p-3 rounded-lg break-all">
                <p className="text-sm text-gray-300 mb-2">{referralLink}</p>
                <PixelButton
                  variant="secondary"
                  size="sm"
                  onClick={copyReferralLink}
                  disabled={!referralCode}
                  className="w-full"
                >
                  复制链接
                </PixelButton>
              </div>
            </div>
            
            {/* 推荐统计 */}
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-sm font-bold text-gray-400 mb-3">推荐统计</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-gold-500">
                    {user?.direct_referrals_count || 0}
                  </p>
                  <p className="text-xs text-gray-400">雇佣人数</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-purple-500">
                    {user?.total_referrals_count || 0}
                  </p>
                  <p className="text-xs text-gray-400">公会总人数</p>
                </div>
              </div>
            </div>
          </PixelCard>
        </motion.div>
        
        {/* 右侧 - 二维码 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PixelCard className="p-6 h-full flex flex-col items-center justify-center">
            <h2 className="text-xl font-black mb-4 text-gold-500">推荐二维码</h2>
            
            {qrCodeUrl ? (
              <div className="bg-white p-4 rounded-lg">
                <img
                  src={qrCodeUrl}
                  alt="推荐二维码"
                  className="w-64 h-64"
                />
              </div>
            ) : (
              <div className="w-64 h-64 bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">生成中...</p>
              </div>
            )}
            
            <p className="text-sm text-gray-400 mt-4 text-center">
              扫描二维码直接访问您的推荐链接
            </p>
          </PixelCard>
        </motion.div>
      </div>
      
      {/* 推荐说明 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <PixelCard className="p-6">
          <h3 className="text-lg font-black mb-3 text-gold-500">推荐奖励说明</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p>• 成功推荐新用户注册，您将获得相应的推荐奖励</p>
            <p>• 被推荐人完成激活后，推荐人可获得额外奖励</p>
            <p>• 团队成员的活跃度将影响您的等级提升速度</p>
            <p>• 推荐关系永久绑定，请珍惜您的推荐机会</p>
          </div>
        </PixelCard>
      </motion.div>
    </div>
  )
}
