'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { PixelCard } from '@/components/shared/PixelCard'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// 模拟地块数据
const generateLands = (district: string, count: number) => {
  const basePrice = {
    cbd: 30000,
    industrial: 15000,
    residential: 20000,
    suburban: 10000
  }[district] || 20000

  return Array.from({ length: count }, (_, i) => ({
    id: `land-${district}-${i + 1}`,
    number: i + 1001,
    size: district === 'suburban' ? 1000 : 300,
    price: basePrice + Math.floor(Math.random() * 10000),
    status: Math.random() > 0.7 ? 'owned' : 'available',
    owner: Math.random() > 0.7 ? `用户${Math.floor(Math.random() * 1000)}` : null,
    appreciation: Math.floor(Math.random() * 30) + 5,
    buildingType: district === 'cbd' ? '商业楼' : district === 'residential' ? '住宅' : null,
    coordinates: `${Math.floor(Math.random() * 100)},${Math.floor(Math.random() * 100)}`
  }))
}

// 将主要内容提取为独立组件
function LandsContent() {
  const searchParams = useSearchParams()
  const province = searchParams.get('province')
  const district = searchParams.get('district') || 'cbd'
  
  const [lands, setLands] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'available' | 'owned'>('all')
  const [sortBy, setSortBy] = useState<'price' | 'number' | 'appreciation'>('number')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    // 模拟加载地块数据
    setLands(generateLands(district, 48))
  }, [district])

  const filteredLands = lands
    .filter(land => {
      if (filter === 'available') return land.status === 'available'
      if (filter === 'owned') return land.status === 'owned'
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price
      if (sortBy === 'appreciation') return b.appreciation - a.appreciation
      return a.number - b.number
    })

  const districtInfo = {
    cbd: { name: 'CBD商业区', icon: '🏢', color: '#FFD700' },
    industrial: { name: '工业区', icon: '🏭', color: '#708090' },
    residential: { name: '住宅区', icon: '🏘️', color: '#87CEEB' },
    suburban: { name: '郊区', icon: '🌾', color: '#90EE90' }
  }[district] || { name: '未知区域', icon: '❓', color: '#666' }

  return (
    <div className="min-h-screen bg-[#0F0F1E] pt-20">
      <Container>
        {/* 面包屑导航 */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/explore" className="hover:text-gold-500">世界地图</Link>
          <span>/</span>
          <Link href="/explore" className="hover:text-gold-500">中国</Link>
          <span>/</span>
          <Link href={`/explore?view=province&province=${province}`} className="hover:text-gold-500">
            {province === 'beijing' ? '北京' : '未知省份'}
          </Link>
          <span>/</span>
          <span className="text-gold-500">{districtInfo.name}</span>
        </div>

        {/* 区域信息头部 */}
        <PixelCard className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{districtInfo.icon}</span>
              <div>
                <h1 className="text-2xl font-bold">{districtInfo.name}</h1>
                <p className="text-gray-400">
                  共 {lands.length} 块地块，{lands.filter(l => l.status === 'available').length} 块可购买
                </p>
              </div>
            </div>
            
            {/* 视图切换 */}
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === 'grid' ? 'text-gold-500' : 'text-gray-400'
                  )}
                >
                  <span className="text-xl">⊞</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === 'list' ? 'text-gold-500' : 'text-gray-400'
                  )}
                >
                  <span className="text-xl">☰</span>
                </button>
              </div>
            </div>
          </div>
        </PixelCard>

        {/* 筛选和排序 */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                "px-4 py-2 font-bold transition-all",
                filter === 'all' 
                  ? 'bg-gold-500 text-black' 
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              )}
            >
              全部 ({lands.length})
            </button>
            <button
              onClick={() => setFilter('available')}
              className={cn(
                "px-4 py-2 font-bold transition-all",
                filter === 'available' 
                  ? 'bg-green-500 text-black' 
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              )}
            >
              可购买 ({lands.filter(l => l.status === 'available').length})
            </button>
            <button
              onClick={() => setFilter('owned')}
              className={cn(
                "px-4 py-2 font-bold transition-all",
                filter === 'owned' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              )}
            >
              已售出 ({lands.filter(l => l.status === 'owned').length})
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-gray-800 text-white border border-gray-700 focus:border-gold-500 focus:outline-none"
          >
            <option value="number">按编号排序</option>
            <option value="price">按价格排序</option>
            <option value="appreciation">按涨幅排序</option>
          </select>
        </div>

        {/* 地块展示 */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredLands.map((land, index) => (
              <motion.div
                key={land.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
              >
                <PixelCard
                  className={cn(
                    "p-4 text-center cursor-pointer transition-all",
                    land.status === 'available' 
                      ? 'hover:border-green-500' 
                      : 'opacity-75 hover:border-blue-500'
                  )}
                >
                  <div className="text-sm font-bold mb-2">#{land.number}</div>
                  <div className="text-xs text-gray-400 mb-2">{land.size}㎡</div>
                  
                  {land.status === 'available' ? (
                    <>
                      <div className="text-lg font-bold text-gold-500 mb-2">
                        ¥{(land.price / 1000).toFixed(1)}k
                      </div>
                      <Link href={`/explore/land/${land.id}`}>
                        <button className="w-full text-xs py-1 bg-green-500 text-black font-bold hover:bg-green-400">
                          购买
                        </button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="text-xs text-blue-500 mb-1">{land.owner}</div>
                      <div className="text-xs text-green-500">+{land.appreciation}%</div>
                      <button className="w-full text-xs py-1 bg-gray-700 text-gray-400 mt-2">
                        已售
                      </button>
                    </>
                  )}
                </PixelCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <PixelCard noPadding>
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-left p-4">编号</th>
                  <th className="text-left p-4">状态</th>
                  <th className="text-left p-4">面积</th>
                  <th className="text-left p-4">价格</th>
                  <th className="text-left p-4">涨幅</th>
                  <th className="text-left p-4">所有者</th>
                  <th className="text-center p-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredLands.map((land, index) => (
                  <motion.tr
                    key={land.id}
                    className="border-t border-gray-700 hover:bg-gray-800/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <td className="p-4 font-bold">#{land.number}</td>
                    <td className="p-4">
                      <span className={cn(
                        "text-sm px-2 py-1 rounded",
                        land.status === 'available' 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-blue-500/20 text-blue-500'
                      )}>
                        {land.status === 'available' ? '可购买' : '已售出'}
                      </span>
                    </td>
                    <td className="p-4">{land.size}㎡</td>
                    <td className="p-4 text-gold-500 font-bold">
                      ¥{land.price.toLocaleString()}
                    </td>
                    <td className="p-4 text-green-500">+{land.appreciation}%</td>
                    <td className="p-4 text-gray-400">
                      {land.owner || '-'}
                    </td>
                    <td className="p-4 text-center">
                      <Link href={`/explore/land/${land.id}`}>
                        <button className={cn(
                          "text-sm px-3 py-1 font-bold",
                          land.status === 'available'
                            ? 'bg-green-500 text-black hover:bg-green-400'
                            : 'bg-gray-700 text-gray-400'
                        )}>
                          {land.status === 'available' ? '查看' : '详情'}
                        </button>
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </PixelCard>
        )}

        {/* 地图预览 */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <PixelCard className="p-6">
            <h3 className="text-xl font-bold mb-4">区域地图预览</h3>
            <div className="aspect-[16/9] bg-gray-900 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">地图功能开发中...</p>
            </div>
          </PixelCard>
        </motion.div>
      </Container>
    </div>
  )
}

// 主页面组件，包裹在 Suspense 中
export default function LandsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F0F1E] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    }>
      <LandsContent />
    </Suspense>
  )
}
