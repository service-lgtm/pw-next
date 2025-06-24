'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// 模拟地块详情数据
const getLandDetail = (id: string) => ({
  id,
  number: 1234,
  location: '北京市朝阳区CBD',
  district: 'CBD商业区',
  size: 300,
  price: 28888,
  status: 'available',
  coordinates: '116.461, 39.909',
  elevation: 45,
  features: ['临近地铁', '商业中心', '交通便利'],
  history: [
    { date: '2024-12-01', event: '地块生成', price: 20000 },
    { date: '2024-12-15', event: '首次出售', price: 25000, buyer: '用户001' },
    { date: '2025-01-10', event: '转让', price: 28888, seller: '用户001' }
  ],
  nearbyLands: [
    { id: 'land-1235', status: 'owned', owner: '茅台官方店', type: '商业' },
    { id: 'land-1233', status: 'owned', owner: '东北粮仓', type: '商业' },
    { id: 'land-1236', status: 'available', price: 26888 },
    { id: 'land-1232', status: 'available', price: 29888 }
  ]
})

export default function LandDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  
  const land = getLandDetail(params.id as string)

  const handlePurchase = () => {
    // 检查登录状态
    const isLoggedIn = false // 这里应该从全局状态获取
    
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    
    setShowPurchaseModal(true)
  }

  return (
    <div className="min-h-screen bg-[#0F0F1E] pt-20">
      <Container>
        {/* 返回导航 */}
        <Link href="/explore/lands?province=beijing&district=cbd">
          <motion.button
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-gold-500 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span>←</span>
            <span>返回地块列表</span>
          </motion.button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧主要信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 地块基本信息 */}
            <PixelCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">地块 #{land.number}</h1>
                  <p className="text-gray-400">{land.location}</p>
                </div>
                <span className="px-4 py-2 bg-green-500/20 text-green-500 font-bold">
                  可购买
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold mb-3">基本信息</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">区域类型</span>
                      <span>{land.district}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">面积</span>
                      <span>{land.size}㎡</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">坐标</span>
                      <span className="font-mono text-xs">{land.coordinates}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">海拔</span>
                      <span>{land.elevation}m</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-3">地块特色</h3>
                  <div className="space-y-2">
                    {land.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <span className="text-green-500">✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PixelCard>

            {/* 3D地块预览 */}
            <PixelCard className="p-6">
              <h3 className="text-xl font-bold mb-4">地块3D预览</h3>
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏗️</div>
                  <p className="text-gray-500">3D预览功能开发中...</p>
                </div>
              </div>
            </PixelCard>

            {/* 历史记录 */}
            <PixelCard className="p-6">
              <h3 className="text-xl font-bold mb-4">交易历史</h3>
              <div className="space-y-3">
                {land.history.map((record, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div>
                      <p className="font-bold">{record.event}</p>
                      <p className="text-xs text-gray-400">{record.date}</p>
                    </div>
                    <div className="text-right">
                      {record.price && (
                        <p className="font-bold text-gold-500">¥{record.price.toLocaleString()}</p>
                      )}
                      {record.buyer && <p className="text-xs text-gray-400">买家: {record.buyer}</p>}
                      {record.seller && <p className="text-xs text-gray-400">卖家: {record.seller}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </PixelCard>
          </div>

          {/* 右侧信息 */}
          <div className="space-y-6">
            {/* 价格信息 */}
            <PixelCard className="p-6">
              <h3 className="text-xl font-bold mb-4">购买信息</h3>
              
              <div className="text-center mb-6">
                <p className="text-sm text-gray-400 mb-2">当前价格</p>
                <p className="text-3xl font-black text-gold-500">
                  ¥{land.price.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  单价: ¥{Math.floor(land.price / land.size)}/㎡
                </p>
              </div>

              <PixelButton
                className="w-full"
                size="lg"
                onClick={handlePurchase}
              >
                立即购买
              </PixelButton>

              <div className="mt-4 space-y-2 text-xs text-gray-400">
                <p>• 购买后立即生效</p>
                <p>• 可用于建设或出租</p>
                <p>• 支持随时转让交易</p>
              </div>
            </PixelCard>

            {/* 周边地块 */}
            <PixelCard className="p-6">
              <h3 className="text-lg font-bold mb-4">周边地块</h3>
              <div className="space-y-3">
                {land.nearbyLands.map((nearby) => (
                  <div
                    key={nearby.id}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded"
                  >
                    <div>
                      <p className="font-bold text-sm">#{nearby.id.split('-')[1]}</p>
                      {nearby.owner && (
                        <p className="text-xs text-gray-400">{nearby.owner}</p>
                      )}
                    </div>
                    <div>
                      {nearby.status === 'available' ? (
                        <Link href={`/explore/land/${nearby.id}`}>
                          <button className="text-xs px-3 py-1 bg-green-500/20 text-green-500 hover:bg-green-500/30">
                            ¥{nearby.price?.toLocaleString()}
                          </button>
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-500">已售</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </PixelCard>

            {/* 投资建议 */}
            <PixelCard className="p-6 bg-gradient-to-br from-gold-500/20 to-transparent">
              <h3 className="text-lg font-bold mb-3">投资建议</h3>
              <div className="space-y-2 text-sm">
                <p>🔥 该地块位于核心商业区</p>
                <p>📈 过去30天涨幅 <span className="text-green-500 font-bold">+15.8%</span></p>
                <p>💰 预计月租金收益 <span className="text-gold-500 font-bold">¥2,888</span></p>
              </div>
            </PixelCard>
          </div>
        </div>

        {/* 购买确认弹窗 */}
        {showPurchaseModal && (
          <motion.div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowPurchaseModal(false)}
          >
            <motion.div
              className="pixel-card p-8 max-w-md w-full bg-[#0A1628]"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">确认购买</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">地块编号</span>
                  <span className="font-bold">#{land.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">面积</span>
                  <span>{land.size}㎡</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">总价</span>
                  <span className="text-xl font-bold text-gold-500">
                    ¥{land.price.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <PixelButton
                  className="flex-1"
                  onClick={() => {
                    // 执行购买逻辑
                    console.log('购买地块')
                    setShowPurchaseModal(false)
                  }}
                >
                  确认购买
                </PixelButton>
                <PixelButton
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowPurchaseModal(false)}
                >
                  取消
                </PixelButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </Container>
    </div>
  )
}
