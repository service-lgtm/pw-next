// src/app/assets/page.tsx
// 资产总览页面 - 基于原型图精确重构

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { api, ApiError, TokenManager } from '@/lib/api'
import { useMyLands } from '@/hooks/useLands'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface AssetSummary {
  totalValue: number
  tdbBalance: number
  yldBalance: number
  landCount: number
  landValue: number
}

export default function AssetsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { lands, loading: landsLoading } = useMyLands()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  
  // 资产分类标签
  const [activeTab, setActiveTab] = useState<'all' | 'land' | 'material' | 'tool' | 'voucher'>('all')
  
  // 弹窗状态
  const [showExchangeModal, setShowExchangeModal] = useState(false)
  const [exchangeAmount, setExchangeAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'bank'>('bank')
  
  const [assetSummary, setAssetSummary] = useState<AssetSummary>({
    totalValue: 0,
    tdbBalance: 0,
    yldBalance: 0,
    landCount: 0,
    landValue: 0,
  })

  // 检查认证状态
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录')
      router.push('/login?redirect=/assets')
    }
  }, [authLoading, isAuthenticated, router])

  // 获取最新的用户资料
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || !TokenManager.getAccessToken()) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await api.accounts.profile()
        
        if (response.success && response.data) {
          setProfileData(response.data)
        }
      } catch (error) {
        console.error('[Assets] Error fetching profile:', error)
        
        if (error instanceof ApiError && error.status === 401) {
          toast.error('登录已过期，请重新登录')
          router.push('/login?redirect=/assets')
        } else {
          toast.error('加载用户资料失败')
        }
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchProfile()
    }
  }, [isAuthenticated, router])

  // 计算资产汇总
  useEffect(() => {
    if (!landsLoading && profileData) {
      const tdb = profileData.tdb_balance ? parseFloat(profileData.tdb_balance) : 0
      const yld = profileData.yld_balance ? parseFloat(profileData.yld_balance) : 0
      const landValue = lands.reduce((total, land) => {
        return total + parseFloat(land.current_price || '0')
      }, 0)
      
      setAssetSummary({
        totalValue: tdb + landValue,
        tdbBalance: tdb,
        yldBalance: yld,
        landCount: lands.length,
        landValue: landValue,
      })
    }
  }, [lands, landsLoading, profileData])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">验证登录状态...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

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
          平行世界
        </h1>
      </motion.div>

      {/* 资产总价值卡片 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-6"
      >
        <PixelCard className="p-6">
          <div>
            <p className="text-sm text-gray-400 mb-2">资产总价值</p>
            <p className="text-3xl font-black text-red-500">
              {assetSummary.totalValue.toLocaleString()}
              <span className="text-lg ml-2">TDB</span>
            </p>
            <p className="text-sm text-gray-400 mt-1">
              ≈{(assetSummary.totalValue * 0.01).toFixed(2)} 克黄金
            </p>
          </div>
        </PixelCard>
      </motion.div>

      {/* 双币种展示 */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* 黄金通证TDB */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PixelCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-400">黄金通证TDB</p>
              <button className="text-xs px-2 py-1 bg-gray-800 rounded">
                三
              </button>
            </div>
            <p className="text-2xl font-black text-red-500 mb-2">
              {assetSummary.tdbBalance.toLocaleString()} TDB
            </p>
            <p className="text-xs text-gray-400 mb-3">
              ≈{(assetSummary.tdbBalance * 0.01).toFixed(2)} 克黄金
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => window.open('https://www.pxsj.net.cn/shop/tdb', '_blank')}
                className="flex-1 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-sm rounded"
              >
                购买TDB
              </button>
              <button 
                onClick={() => setShowExchangeModal(true)}
                className="flex-1 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-sm rounded"
              >
                兑换
              </button>
            </div>
          </PixelCard>
        </motion.div>

        {/* 陨石通证YLD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <PixelCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-400">陨石通证YLD</p>
            </div>
            <p className="text-2xl font-black text-red-500 mb-2">
              {assetSummary.yldBalance.toLocaleString()} YLD
            </p>
            <p className="text-xs text-gray-400 mb-3">
              ≈{(assetSummary.yldBalance * 0.01).toFixed(2)} TDB
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => toast('YLD功能待开放', { icon: '🚧' })}
                className="flex-1 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-sm rounded opacity-50 cursor-not-allowed"
                disabled
              >
                待开放
              </button>
            </div>
          </PixelCard>
        </motion.div>
      </div>

      {/* 资产分类标签 */}
      <div className="mb-6">
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              "px-6 py-3 font-bold transition-all",
              activeTab === 'all'
                ? "bg-green-500 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            )}
          >
            全部
          </button>
          <button
            onClick={() => setActiveTab('land')}
            className={cn(
              "px-6 py-3 font-bold transition-all border-l border-gray-700",
              activeTab === 'land'
                ? "bg-green-500 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            )}
          >
            土地
          </button>
          <button
            onClick={() => setActiveTab('material')}
            className={cn(
              "px-6 py-3 font-bold transition-all border-l border-gray-700",
              activeTab === 'material'
                ? "bg-green-500 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            )}
          >
            材料
          </button>
          <button
            onClick={() => setActiveTab('tool')}
            className={cn(
              "px-6 py-3 font-bold transition-all border-l border-gray-700",
              activeTab === 'tool'
                ? "bg-green-500 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            )}
          >
            工具
          </button>
          <button
            onClick={() => setActiveTab('voucher')}
            className={cn(
              "px-6 py-3 font-bold transition-all border-l border-gray-700",
              activeTab === 'voucher'
                ? "bg-green-500 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            )}
          >
            提货单
          </button>
        </div>
      </div>

      {/* 资产内容区 */}
      <div className="space-y-6">
        {/* 土地资产 */}
        {(activeTab === 'all' || activeTab === 'land') && lands.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>🏞️</span>
              土地资产
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {lands.slice(0, 3).map((land) => (
                <PixelCard 
                  key={land.id}
                  className="p-4 hover:border-gold-500 transition-all cursor-pointer"
                  onClick={() => router.push(`/assets/land/${land.id}`)}
                >
                  <h4 className="font-bold mb-1">土地名称 {land.land_type_display}</h4>
                  <p className="text-sm text-gray-400 mb-2">#{land.land_id.slice(-10)}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">面积：</span>
                      <span>{land.size_sqm}m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">储量：</span>
                      <span>{parseFloat(land.current_price).toFixed(2)}</span>
                    </div>
                  </div>
                </PixelCard>
              ))}
            </div>
            {lands.length > 3 && (
              <button
                onClick={() => router.push('/assets/land')}
                className="mt-4 text-sm text-gold-500 hover:text-gold-400"
              >
                查看全部 {lands.length} 块土地 →
              </button>
            )}
          </motion.div>
        )}

        {/* 材料资产 */}
        {(activeTab === 'all' || activeTab === 'material') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>⛏️</span>
              材料资产
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {/* 铁矿 */}
              <PixelCard className="p-4 opacity-75">
                <h4 className="font-bold mb-2">铁矿</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">数量</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">价值</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                </div>
              </PixelCard>

              {/* 石材 */}
              <PixelCard className="p-4 opacity-75">
                <h4 className="font-bold mb-2">石材</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">数量</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">价值</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                </div>
              </PixelCard>

              {/* 木材 */}
              <PixelCard className="p-4 opacity-75">
                <h4 className="font-bold mb-2">木材</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">数量</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">价值</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                </div>
              </PixelCard>

              {/* 种子 */}
              <PixelCard className="p-4 opacity-75">
                <h4 className="font-bold mb-2">种子</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">数量</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">价值</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                </div>
              </PixelCard>

              {/* 粮食 */}
              <PixelCard className="p-4 opacity-75">
                <h4 className="font-bold mb-2">粮食</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">数量</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">价值</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                </div>
              </PixelCard>
            </div>
          </motion.div>
        )}

        {/* 工具资产 */}
        {(activeTab === 'all' || activeTab === 'tool') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>🔧</span>
              NFT工具
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              {/* 镐头 */}
              <PixelCard className="p-4 opacity-75">
                <h4 className="font-bold mb-2">镐头</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">数量</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">价值</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                </div>
              </PixelCard>

              {/* 锄头 */}
              <PixelCard className="p-4 opacity-75">
                <h4 className="font-bold mb-2">锄头</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">数量</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">价值</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                </div>
              </PixelCard>

              {/* 斧头 */}
              <PixelCard className="p-4 opacity-75">
                <h4 className="font-bold mb-2">斧头</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">数量</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">价值</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                </div>
              </PixelCard>

              {/* 砖头？ */}
              <PixelCard className="p-4 opacity-75">
                <h4 className="font-bold mb-2">砖头？</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">数量</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">价值</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                </div>
              </PixelCard>
            </div>
          </motion.div>
        )}

        {/* 提货单资产 */}
        {(activeTab === 'all' || activeTab === 'voucher') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>📦</span>
              商品提货单
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {/* 酒水提货单 */}
              <PixelCard className="p-4 opacity-75">
                <h4 className="font-bold mb-1">酒水提货单</h4>
                <p className="text-sm text-gray-400 mb-2">#1234...5678</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">面值</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">本月分红</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">累计分红</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                </div>
              </PixelCard>

              {/* 珠宝提货单 */}
              <PixelCard className="p-4 opacity-75">
                <h4 className="font-bold mb-1">珠宝提货单</h4>
                <p className="text-sm text-gray-400 mb-2">#1234...5678</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">面值</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">本月分红</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">累计分红</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                </div>
              </PixelCard>

              {/* XX提货单 */}
              <PixelCard className="p-4 opacity-75">
                <h4 className="font-bold mb-1">XX提货单</h4>
                <p className="text-sm text-gray-400 mb-2">#1234...5678</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">面值</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">本月分红</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">累计分红</span>
                    <span className="text-yellow-500">待开放</span>
                  </div>
                </div>
              </PixelCard>
            </div>
          </motion.div>
        )}

        {/* 空状态 */}
        {activeTab === 'material' && (
          <div className="text-center py-12 text-gray-400">
            <p>材料功能待开放</p>
          </div>
        )}
        
        {activeTab === 'tool' && (
          <div className="text-center py-12 text-gray-400">
            <p>工具功能待开放</p>
          </div>
        )}
        
        {activeTab === 'voucher' && (
          <div className="text-center py-12 text-gray-400">
            <p>提货单功能待开放</p>
          </div>
        )}
      </div>

      {/* 兑换弹窗 - 只能出金 */}
      <AnimatePresence>
        {showExchangeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowExchangeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">选择收款方式</h3>
                <button
                  onClick={() => setShowExchangeModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                {/* 收款方式选择 */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setPaymentMethod('alipay')}
                    className={cn(
                      "flex-1 py-3 px-4 rounded border-2 transition-all",
                      paymentMethod === 'alipay'
                        ? "bg-green-500/20 border-green-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-400"
                    )}
                  >
                    支付宝
                  </button>
                  <button
                    onClick={() => setPaymentMethod('bank')}
                    className={cn(
                      "flex-1 py-3 px-4 rounded border-2 transition-all",
                      paymentMethod === 'bank'
                        ? "bg-green-500/20 border-green-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-400"
                    )}
                  >
                    银行卡
                  </button>
                </div>
                
                {/* 收款人信息 */}
                <div>
                  <p className="text-sm text-gray-400 mb-3">收款人</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">户名</label>
                      <input
                        type="text"
                        placeholder="请输入"
                        className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 focus:border-gold-500 rounded outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">账户</label>
                      <input
                        type="text"
                        placeholder="请输入"
                        className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 focus:border-gold-500 rounded outline-none"
                      />
                    </div>
                    {paymentMethod === 'bank' && (
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">银行</label>
                        <input
                          type="text"
                          placeholder="请输入"
                          className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 focus:border-gold-500 rounded outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 兑换金额 */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">兑换金额</span>
                    <span className="text-gray-400">可用余额：{assetSummary.tdbBalance.toLocaleString()} TDB</span>
                  </div>
                  <div className="flex">
                    <input
                      type="number"
                      value={exchangeAmount}
                      onChange={(e) => setExchangeAmount(e.target.value)}
                      placeholder="最小兑换数量 100.00"
                      className="flex-1 px-4 py-2 bg-gray-800 text-white border border-gray-700 focus:border-gold-500 rounded-l outline-none"
                    />
                    <span className="px-4 py-2 bg-gray-700 text-white rounded-r border border-gray-700 border-l-0">
                      TDB
                    </span>
                  </div>
                </div>
                
                {/* 兑换信息 */}
                {exchangeAmount && parseFloat(exchangeAmount) >= 100 && (
                  <div className="p-3 bg-gray-800/50 rounded space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">兑换税率：</span>
                      <span>5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">预估到账：</span>
                      <span className="font-bold text-lg">{(parseFloat(exchangeAmount) * 6.5 * 0.95).toFixed(2)}元</span>
                    </div>
                  </div>
                )}
                
                {/* 提交按钮 */}
                <button
                  disabled
                  className="w-full py-3 bg-gray-600 text-gray-400 rounded cursor-not-allowed font-bold"
                >
                  提交（待开放）
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
