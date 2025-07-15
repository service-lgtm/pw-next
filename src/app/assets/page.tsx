// src/app/assets/page.tsx
// 资产总览页面

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { useMyLands } from '@/hooks/useLands'

interface AssetSummary {
  totalValue: number
  tdbBalance: number
  yldBalance: number
  landCount: number
  landValue: number
}

export default function AssetsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { lands, loading: landsLoading } = useMyLands()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [assetSummary, setAssetSummary] = useState<AssetSummary>({
    totalValue: 0,
    tdbBalance: 0,
    yldBalance: 0,
    landCount: 0,
    landValue: 0,
  })

  // 获取最新的用户资料
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await api.accounts.profile()
        console.log('[Assets] Profile response:', response)
        
        if (response.success && response.data) {
          setProfileData(response.data)
        }
      } catch (error) {
        console.error('[Assets] Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // 计算资产汇总
  useEffect(() => {
    if (!landsLoading && profileData) {
      const tdb = profileData.tdb_balance ? parseFloat(profileData.tdb_balance) : 0
      const yld = profileData.yld_balance ? parseFloat(profileData.yld_balance) : 0
      const landValue = lands.reduce((total, land) => {
        return total + parseFloat(land.current_price || '0')
      }, 0)
      
      setAssetSummary({
        totalValue: tdb + yld + landValue,
        tdbBalance: tdb,
        yldBalance: yld,
        landCount: lands.length,
        landValue: landValue,
      })
    }
  }, [lands, landsLoading, profileData])

  if (loading || landsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载资产数据中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-black text-white">
          资产总览
        </h1>
        <p className="text-gray-400 mt-1">
          查看和管理您的数字资产
        </p>
      </motion.div>

      {/* 总资产卡片 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8"
      >
        <PixelCard className="p-8 bg-gradient-to-br from-gold-500/20 to-yellow-600/20 border-gold-500">
          <div className="text-center">
            <p className="text-lg text-gray-300 mb-2">总资产价值</p>
            <p className="text-5xl font-black text-gold-500">
              {assetSummary.totalValue.toLocaleString()}
              <span className="text-2xl ml-2">USDT</span>
            </p>
            <p className="text-sm text-gray-400 mt-2">
              ≈ {(assetSummary.totalValue * 0.01).toFixed(2)} 克黄金
            </p>
          </div>
        </PixelCard>
      </motion.div>

      {/* 资产分布 */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* TDB 积分 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PixelCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-300">TDB 积分</h3>
              <span className="text-3xl">💎</span>
            </div>
            <p className="text-3xl font-black text-gold-500">
              {assetSummary.tdbBalance.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400 mt-1">稳定交易币</p>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-400">
                占比：{assetSummary.totalValue > 0 ? ((assetSummary.tdbBalance / assetSummary.totalValue) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </PixelCard>
        </motion.div>

        {/* YLD 积分 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <PixelCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-300">YLD 积分</h3>
              <span className="text-3xl">⚡</span>
            </div>
            <p className="text-3xl font-black text-purple-500">
              {assetSummary.yldBalance.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400 mt-1">治理代币</p>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-400">
                占比：{assetSummary.totalValue > 0 ? ((assetSummary.yldBalance / assetSummary.totalValue) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </PixelCard>
        </motion.div>

        {/* 土地资产 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PixelCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-300">土地资产</h3>
              <span className="text-3xl">🏞️</span>
            </div>
            <p className="text-3xl font-black text-green-500">
              {assetSummary.landValue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400 mt-1">{assetSummary.landCount} 块土地</p>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-400">
                占比：{assetSummary.totalValue > 0 ? ((assetSummary.landValue / assetSummary.totalValue) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </PixelCard>
        </motion.div>
      </div>

      {/* 快速操作 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PixelButton
          onClick={() => router.push('/assets/land')}
          className="w-full justify-center"
        >
          <span className="mr-2">🏞️</span>
          查看土地
        </PixelButton>
        
        <PixelButton
          onClick={() => router.push('/explore/lands')}
          variant="secondary"
          className="w-full justify-center"
        >
          <span className="mr-2">🛒</span>
          购买土地
        </PixelButton>
        
        <PixelButton
          disabled
          variant="secondary"
          className="w-full justify-center opacity-50 cursor-not-allowed"
        >
          <span className="mr-2">💱</span>
          交易市场
        </PixelButton>
        
        <PixelButton
          disabled
          variant="secondary"
          className="w-full justify-center opacity-50 cursor-not-allowed"
        >
          <span className="mr-2">📊</span>
          收益报告
        </PixelButton>
      </div>

      {/* 资产明细 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <PixelCard className="p-6">
          <h3 className="text-xl font-black mb-6 flex items-center gap-2">
            <span>📋</span>
            最近土地资产
          </h3>
          
          {lands.length > 0 ? (
            <div className="space-y-3">
              {lands.slice(0, 5).map((land) => (
                <div
                  key={land.id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => router.push(`/assets/land/${land.id}`)}
                >
                  <div>
                    <p className="font-bold">{land.land_id}</p>
                    <p className="text-sm text-gray-400">{land.land_type_display} · {land.region_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gold-500">{parseFloat(land.current_price).toLocaleString()} TDB</p>
                    <p className="text-xs text-gray-400">{land.size_sqm} m²</p>
                  </div>
                </div>
              ))}
              
              {lands.length > 5 && (
                <button
                  onClick={() => router.push('/assets/land')}
                  className="w-full text-center text-sm text-gold-500 hover:text-gold-400 py-2"
                >
                  查看全部 {lands.length} 块土地 →
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>您还没有土地资产</p>
              <button
                onClick={() => router.push('/explore/lands')}
                className="mt-4 text-gold-500 hover:text-gold-400"
              >
                去购买土地 →
              </button>
            </div>
          )}
        </PixelCard>
      </motion.div>
    </div>
  )
}
