'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { PixelCard } from '@/components/shared/PixelCard'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// 世界区域数据
const worldRegions = [
  {
    id: 'china',
    name: '中国',
    status: 'open',
    description: '已开放',
    totalLands: 50000,
    availableLands: 12580,
    avgPrice: 15888,
    hotCities: ['北京', '上海', '深圳', '广州'],
    coordinates: { x: 70, y: 40 }
  },
  {
    id: 'northamerica',
    name: '北美',
    status: 'coming',
    description: '即将开放',
    expectedDate: '2025 Q2',
    coordinates: { x: 20, y: 35 }
  },
  {
    id: 'europe',
    name: '欧洲',
    status: 'coming',
    description: '敬请期待',
    expectedDate: '2025 Q3',
    coordinates: { x: 45, y: 30 }
  },
  {
    id: 'asia',
    name: '亚洲其他',
    status: 'planning',
    description: '规划中',
    coordinates: { x: 75, y: 45 }
  }
]

// 中国省份数据
const chinaProvinces = [
  {
    id: 'beijing',
    name: '北京',
    type: 'municipality',
    status: 'hot',
    totalLands: 5680,
    availableLands: 256,
    avgPrice: 28888,
    coordinates: { x: 60, y: 25 }
  },
  {
    id: 'shanghai',
    name: '上海',
    type: 'municipality',
    status: 'hot',
    totalLands: 4560,
    availableLands: 189,
    avgPrice: 32888,
    coordinates: { x: 70, y: 40 }
  },
  {
    id: 'guangdong',
    name: '广东',
    type: 'province',
    status: 'hot',
    cities: ['深圳', '广州', '东莞', '佛山'],
    totalLands: 8900,
    availableLands: 1234,
    avgPrice: 22888,
    coordinates: { x: 65, y: 60 }
  },
  {
    id: 'sichuan',
    name: '四川',
    type: 'province',
    status: 'normal',
    cities: ['成都', '绵阳'],
    totalLands: 3200,
    availableLands: 890,
    avgPrice: 12888,
    coordinates: { x: 45, y: 45 }
  }
]

// 城市区域类型
const districtTypes = [
  { id: 'cbd', name: 'CBD商业区', icon: '🏢', color: '#FFD700', priceMultiplier: 2 },
  { id: 'industrial', name: '工业区', icon: '🏭', color: '#708090', priceMultiplier: 0.8 },
  { id: 'residential', name: '住宅区', icon: '🏘️', color: '#87CEEB', priceMultiplier: 1.2 },
  { id: 'suburban', name: '郊区', icon: '🌾', color: '#90EE90', priceMultiplier: 0.5 }
]

export default function ExplorePage() {
  const [view, setView] = useState<'world' | 'china' | 'province' | 'city'>('world')
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  // 处理区域点击
  const handleRegionClick = (regionId: string) => {
    if (regionId === 'china') {
      setView('china')
      setSelectedRegion('china')
    }
  }

  // 处理省份点击
  const handleProvinceClick = (provinceId: string) => {
    setSelectedProvince(provinceId)
    setView('province')
  }

  // 处理返回
  const handleBack = () => {
    if (view === 'city') {
      setView('province')
      setSelectedCity(null)
    } else if (view === 'province') {
      setView('china')
      setSelectedProvince(null)
    } else if (view === 'china') {
      setView('world')
      setSelectedRegion(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F1E] pt-20">
      <Container>
        {/* 面包屑导航 */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <button
            onClick={() => setView('world')}
            className="hover:text-gold-500 transition-colors"
          >
            世界地图
          </button>
          {view !== 'world' && (
            <>
              <span>/</span>
              <button
                onClick={() => setView('china')}
                className={cn(
                  "hover:text-gold-500 transition-colors",
                  view === 'china' && "text-gold-500"
                )}
              >
                中国
              </button>
            </>
          )}
          {selectedProvince && (
            <>
              <span>/</span>
              <button
                onClick={() => setView('province')}
                className={cn(
                  "hover:text-gold-500 transition-colors",
                  view === 'province' && "text-gold-500"
                )}
              >
                {chinaProvinces.find(p => p.id === selectedProvince)?.name}
              </button>
            </>
          )}
        </div>

        {/* 标题区域 */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-black mb-4">
            <span className="text-gold-500">探索平行世界</span>
          </h1>
          <p className="text-gray-400">
            {view === 'world' && '选择要探索的区域'}
            {view === 'china' && '选择要查看的省份或城市'}
            {view === 'province' && '查看城市详情和可用地块'}
            {view === 'city' && '浏览不同区域的地块信息'}
          </p>
        </motion.div>

        {/* 返回按钮 */}
        {view !== 'world' && (
          <motion.button
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-gold-500 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleBack}
          >
            <span>←</span>
            <span>返回上级</span>
          </motion.button>
        )}

        <AnimatePresence mode="wait">
          {/* 世界地图视图 */}
          {view === 'world' && (
            <motion.div
              key="world"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="pixel-card p-8">
                <div className="relative aspect-[16/9] bg-gray-900 rounded-lg overflow-hidden">
                  {/* 简化的世界地图 */}
                  <svg viewBox="0 0 100 60" className="w-full h-full">
                    {worldRegions.map((region) => (
                      <g key={region.id}>
                        <motion.circle
                          cx={region.coordinates.x}
                          cy={region.coordinates.y}
                          r="8"
                          fill={region.status === 'open' ? '#FFD700' : '#666'}
                          className={cn(
                            "cursor-pointer transition-all",
                            region.status !== 'open' && "cursor-not-allowed"
                          )}
                          whileHover={region.status === 'open' ? { scale: 1.2 } : {}}
                          onClick={() => region.status === 'open' && handleRegionClick(region.id)}
                          onMouseEnter={() => setHoveredItem(region.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                        />
                        <text
                          x={region.coordinates.x}
                          y={region.coordinates.y - 12}
                          textAnchor="middle"
                          fontSize="6"
                          fill="white"
                          className="pointer-events-none"
                        >
                          {region.name}
                        </text>
                        {region.status === 'open' && (
                          <motion.circle
                            cx={region.coordinates.x}
                            cy={region.coordinates.y}
                            r="12"
                            fill="none"
                            stroke="#FFD700"
                            strokeWidth="1"
                            opacity="0.5"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.5, 0.2, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                          />
                        )}
                      </g>
                    ))}
                  </svg>

                  {/* 悬浮信息 */}
                  <AnimatePresence>
                    {hoveredItem && (
                      <motion.div
                        className="absolute top-4 right-4 bg-black/90 p-4 rounded"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        {(() => {
                          const region = worldRegions.find(r => r.id === hoveredItem)
                          if (!region) return null
                          return (
                            <div>
                              <h3 className="font-bold text-gold-500 mb-2">{region.name}</h3>
                              <p className="text-sm text-gray-400">{region.description}</p>
                              {region.status === 'open' && (
                                <>
                                  <div className="text-xs mt-2">
                                    <p>总地块: {region.totalLands?.toLocaleString()}</p>
                                    <p>可用: {region.availableLands?.toLocaleString()}</p>
                                  </div>
                                </>
                              )}
                              {region.status === 'coming' && (
                                <p className="text-xs text-gold-500 mt-2">
                                  预计: {region.expectedDate}
                                </p>
                              )}
                            </div>
                          )
                        })()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* 区域状态说明 */}
              <div className="grid md:grid-cols-4 gap-4 mt-8">
                {worldRegions.map((region, index) => (
                  <motion.div
                    key={region.id}
                    className={cn(
                      "pixel-card p-4 text-center",
                      region.status === 'open' 
                        ? "border-gold-500 cursor-pointer hover:scale-105" 
                        : "border-gray-700 opacity-60"
                    )}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => region.status === 'open' && handleRegionClick(region.id)}
                  >
                    <h3 className="font-bold text-lg mb-2">{region.name}</h3>
                    <p className={cn(
                      "text-sm",
                      region.status === 'open' ? "text-green-500" : "text-gray-500"
                    )}>
                      {region.description}
                    </p>
                    {region.status === 'open' && region.totalLands && (
                      <div className="mt-3 text-xs text-gray-400">
                        <p>{region.totalLands.toLocaleString()} 块土地</p>
                        <p className="text-gold-500">
                          {region.availableLands?.toLocaleString()} 块可用
                        </p>
                      </div>
                    )}
                    {region.expectedDate && (
                      <p className="mt-2 text-xs text-gray-500">
                        {region.expectedDate}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 中国地图视图 */}
          {view === 'china' && (
            <motion.div
              key="china"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid lg:grid-cols-3 gap-6">
                {/* 左侧地图 */}
                <div className="lg:col-span-2">
                  <PixelCard className="p-6">
                    <h3 className="text-xl font-bold mb-4">中国区域地图</h3>
                    <div className="relative aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden">
                      <svg viewBox="0 0 100 80" className="w-full h-full">
                        {chinaProvinces.map((province) => (
                          <g key={province.id}>
                            <motion.circle
                              cx={province.coordinates.x}
                              cy={province.coordinates.y}
                              r="5"
                              fill={province.status === 'hot' ? '#FFD700' : '#00D4AA'}
                              className="cursor-pointer"
                              whileHover={{ scale: 1.5 }}
                              onClick={() => handleProvinceClick(province.id)}
                            />
                            <text
                              x={province.coordinates.x}
                              y={province.coordinates.y - 8}
                              textAnchor="middle"
                              fontSize="6"
                              fill="white"
                              className="pointer-events-none"
                            >
                              {province.name}
                            </text>
                            {province.status === 'hot' && (
                              <motion.text
                                x={province.coordinates.x + 8}
                                y={province.coordinates.y - 8}
                                fontSize="6"
                                fill="#FFD700"
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                🔥
                              </motion.text>
                            )}
                          </g>
                        ))}
                      </svg>
                    </div>

                    <div className="mt-4 flex items-center gap-6 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gold-500 rounded-full" />
                        <span>热门地区</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#00D4AA] rounded-full" />
                        <span>普通地区</span>
                      </div>
                    </div>
                  </PixelCard>
                </div>

                {/* 右侧列表 */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">热门城市</h3>
                  {chinaProvinces
                    .filter(p => p.status === 'hot')
                    .map((province) => (
                      <PixelCard
                        key={province.id}
                        className="p-4 cursor-pointer hover:border-gold-500 transition-all"
                        onClick={() => handleProvinceClick(province.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-gold-500">{province.name}</h4>
                            <p className="text-xs text-gray-400 mt-1">
                              {province.totalLands.toLocaleString()} 块土地
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">
                              ¥{province.avgPrice.toLocaleString()}
                            </p>
                            <p className="text-xs text-green-500">
                              {province.availableLands} 块可用
                            </p>
                          </div>
                        </div>
                      </PixelCard>
                    ))}
                </div>
              </div>

              {/* 统计数据 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <PixelCard className="p-4 text-center">
                  <div className="text-2xl font-bold text-gold-500">50,000</div>
                  <div className="text-sm text-gray-400">总地块数</div>
                </PixelCard>
                <PixelCard className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">12,580</div>
                  <div className="text-sm text-gray-400">可用地块</div>
                </PixelCard>
                <PixelCard className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-500">¥15,888</div>
                  <div className="text-sm text-gray-400">平均价格</div>
                </PixelCard>
                <PixelCard className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-500">28</div>
                  <div className="text-sm text-gray-400">开放城市</div>
                </PixelCard>
              </div>
            </motion.div>
          )}

          {/* 省份/城市详情视图 */}
          {view === 'province' && selectedProvince && (
            <motion.div
              key="province"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {(() => {
                const province = chinaProvinces.find(p => p.id === selectedProvince)
                if (!province) return null

                return (
                  <div>
                    {/* 省份概览 */}
                    <PixelCard className="p-6 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">{province.name}</h2>
                        {province.status === 'hot' && (
                          <span className="px-3 py-1 bg-gold-500/20 text-gold-500 font-bold">
                            🔥 热门地区
                          </span>
                        )}
                      </div>

                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">总地块</p>
                          <p className="text-xl font-bold">{province.totalLands.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">可用地块</p>
                          <p className="text-xl font-bold text-green-500">{province.availableLands}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">平均价格</p>
                          <p className="text-xl font-bold text-gold-500">¥{province.avgPrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">已售占比</p>
                          <p className="text-xl font-bold">
                            {((1 - province.availableLands / province.totalLands) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </PixelCard>

                    {/* 城市/区域网格 */}
                    <h3 className="text-xl font-bold mb-4">选择区域类型</h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      {districtTypes.map((district) => (
                        <Link
                          key={district.id}
                          href={`/explore/lands?province=${selectedProvince}&district=${district.id}`}
                        >
                          <PixelCard className="p-6 text-center hover:border-gold-500 transition-all cursor-pointer">
                            <div className="text-4xl mb-2">{district.icon}</div>
                            <h4 className="font-bold mb-2">{district.name}</h4>
                            <p className="text-sm text-gray-400">
                              均价: ¥{Math.floor(province.avgPrice * district.priceMultiplier).toLocaleString()}
                            </p>
                            <p className="text-xs text-green-500 mt-1">
                              {Math.floor(Math.random() * 100 + 50)} 块可用
                            </p>
                          </PixelCard>
                        </Link>
                      ))}
                    </div>

                    {/* 热门地块推荐 */}
                    <div className="mt-8">
                      <h3 className="text-xl font-bold mb-4">热门地块推荐</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                          <PixelCard key={i} className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-bold">地块 #{1000 + i}</span>
                              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-500">
                                可购买
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mb-2">
                              CBD商业区 · 300㎡
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-gold-500">
                                ¥{(25000 + i * 5000).toLocaleString()}
                              </span>
                              <Link href={`/explore/land/${1000 + i}`}>
                                <button className="text-xs px-3 py-1 bg-gold-500 text-black font-bold hover:bg-gold-400">
                                  查看详情
                                </button>
                              </Link>
                            </div>
                          </PixelCard>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 底部提示 */}
        <motion.div
          className="mt-12 text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>提示：点击地图上的标记可以查看详细信息</p>
          {view === 'world' && <p>目前仅中国区域开放，其他区域敬请期待</p>}
        </motion.div>
      </Container>
    </div>
  )
}
