// src/app/dashboard/referral/page.tsx
// 推荐码页面 - 优化版本

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import QRCode from 'qrcode'
import toast from 'react-hot-toast'

export default function ReferralPage() {
  const { user, checkAuth } = useAuth()
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [copyingCode, setCopyingCode] = useState(false)
  const [copyingLink, setCopyingLink] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  
  // 获取推荐码和推荐链接
  const referralCode = user?.referral_code || ''
  const referralLink = `https://www.pxsj.net.cn/register?ref=${referralCode}`
  
  // 合并用户数据，优先使用最新获取的数据
  const displayUser = profileData ? { ...user, ...profileData } : user
  
  // 获取最新的用户资料
  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        setLoadingProfile(true)
        const response = await api.accounts.profile()
        
        if (response.success && response.data) {
          setProfileData(response.data)
          // 同步更新全局用户状态
          if (checkAuth) {
            checkAuth()
          }
        }
      } catch (error) {
        console.error('获取用户资料失败:', error)
        // 不显示错误提示，使用缓存的数据
      } finally {
        setLoadingProfile(false)
      }
    }
    
    // 只有在有用户信息时才去获取最新数据
    if (user) {
      fetchLatestProfile()
    }
  }, [user, checkAuth])
  
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
  
  // 传统的回退复制方法
  const fallbackCopyTextToClipboard = (text: string): boolean => {
    const textArea = document.createElement("textarea")
    textArea.value = text
    
    // 避免在屏幕上闪现
    textArea.style.position = "fixed"
    textArea.style.top = "0"
    textArea.style.left = "0"
    textArea.style.width = "2em"
    textArea.style.height = "2em"
    textArea.style.padding = "0"
    textArea.style.border = "none"
    textArea.style.outline = "none"
    textArea.style.boxShadow = "none"
    textArea.style.background = "transparent"

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    let successful = false
    try {
      successful = document.execCommand('copy')
    } catch (err) {
      successful = false
    }

    document.body.removeChild(textArea)
    return successful
  }
  
  // 通用复制函数
  const copyToClipboard = async (text: string, successMessage: string): Promise<void> => {
    // 优先使用现代的 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text)
        toast.success(successMessage)
        return
      } catch (err) {
        // 如果 Clipboard API 失败，尝试传统方法
        console.warn('Clipboard API failed, falling back to execCommand', err)
      }
    }
    
    // 使用传统方法作为回退
    const successful = fallbackCopyTextToClipboard(text)
    if (successful) {
      toast.success(successMessage)
    } else {
      toast.error('复制失败，请手动复制')
    }
  }
  
  // 复制推荐码
  const copyReferralCode = async () => {
    if (!referralCode || copyingCode) return
    
    setCopyingCode(true)
    await copyToClipboard(referralCode, '推荐码已复制到剪贴板')
    setTimeout(() => setCopyingCode(false), 1000)
  }
  
  // 复制推荐链接
  const copyReferralLink = async () => {
    if (!referralCode || copyingLink) return
    
    setCopyingLink(true)
    await copyToClipboard(referralLink, '推荐链接已复制到剪贴板')
    setTimeout(() => setCopyingLink(false), 1000)
  }
  
  // 下载二维码
  const downloadQRCode = () => {
    if (!qrCodeUrl) return
    
    const link = document.createElement('a')
    link.download = `referral-qrcode-${referralCode}.png`
    link.href = qrCodeUrl
    link.click()
    toast.success('二维码已下载')
  }
  
  // 手动刷新数据
  const refreshData = async () => {
    try {
      const response = await api.accounts.profile()
      if (response.success && response.data) {
        setProfileData(response.data)
        toast.success('数据已更新')
        if (checkAuth) {
          checkAuth()
        }
      }
    } catch (error) {
      toast.error('刷新失败，请稍后重试')
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-gold-500">推荐信息</h2>
              <button
                onClick={refreshData}
                className="text-sm text-gray-400 hover:text-white transition-colors"
                title="刷新数据"
              >
                🔄
              </button>
            </div>
            
            {/* 推荐码 */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-2">您的推荐码</p>
              <div className="flex items-center gap-3">
                <div className="bg-gray-800 px-4 py-3 rounded-lg flex-1">
                  <p className="text-2xl font-black text-gold-500 tracking-wider select-all">
                    {referralCode || '加载中...'}
                  </p>
                </div>
                <PixelButton
                  variant="primary"
                  size="sm"
                  onClick={copyReferralCode}
                  disabled={!referralCode || copyingCode}
                >
                  {copyingCode ? '已复制' : '复制'}
                </PixelButton>
              </div>
            </div>
            
            {/* 推荐链接 */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-2">推荐链接</p>
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-sm text-gray-300 mb-2 break-all select-all">
                  {referralLink}
                </p>
                <PixelButton
                  variant="secondary"
                  size="sm"
                  onClick={copyReferralLink}
                  disabled={!referralCode || copyingLink}
                  className="w-full"
                >
                  {copyingLink ? '已复制' : '复制链接'}
                </PixelButton>
              </div>
            </div>
            
            {/* 推荐统计 */}
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-sm font-bold text-gray-400 mb-3">推荐统计</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-gold-500">
                    {loadingProfile ? (
                      <span className="text-base">...</span>
                    ) : (
                      displayUser?.direct_referrals_count || 0
                    )}
                  </p>
                  <p className="text-xs text-gray-400">雇佣人数</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-purple-500">
                    {loadingProfile ? (
                      <span className="text-base">...</span>
                    ) : (
                      displayUser?.total_referrals_count || 0
                    )}
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
              <>
                <div className="bg-white p-4 rounded-lg mb-4">
                  <img
                    src={qrCodeUrl}
                    alt="推荐二维码"
                    className="w-64 h-64"
                  />
                </div>
                <PixelButton
                  variant="secondary"
                  size="sm"
                  onClick={downloadQRCode}
                  className="mb-4"
                >
                  下载二维码
                </PixelButton>
              </>
            ) : (
              <div className="w-64 h-64 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <p className="text-gray-400">生成中...</p>
              </div>
            )}
            
            <p className="text-sm text-gray-400 text-center">
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
            <p>• 推荐关系永久绑定，请珍惜您的推荐机会</p>
          </div>
        </PixelCard>
      </motion.div>
      
      {/* 分享提示 - 新增 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-4"
      >
        <PixelCard className="p-4 bg-gray-800/50">
          <p className="text-sm text-gray-400 text-center">
            💡 提示：如果复制功能无法正常使用，您可以长按选中文本进行复制
          </p>
        </PixelCard>
      </motion.div>
    </div>
  )
}
