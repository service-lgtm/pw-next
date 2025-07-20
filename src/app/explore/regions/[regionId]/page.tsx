// src/app/explore/regions/[regionId]/page.tsx
// 区域详情页面 - 修复循环请求问题 - 完整版本

'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { RegionBreadcrumb } from '@/components/explore/RegionBreadcrumb'
import { RegionHero } from '@/components/explore/RegionHero'
import { RegionStats } from '@/components/explore/RegionStats'
import { LandCard } from '@/components/explore/LandCard'
import { Container } from '@/components/ui/Container'
import { Navbar } from '@/components/layout/Navbar'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useRegion, useRegions, useRegionStats } from '@/hooks/useRegions'
import { useLands, useMyLandsInRegion } from '@/hooks/useLands'
import { useAuth } from '@/hooks/useAuth'
import type { Region } from '@/types/assets'
// 如果你安装了 @heroicons/react，请取消下面的注释
// import { MapPinIcon, GlobeAsiaAustraliaIcon, BuildingOfficeIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

// 如果没有安装 heroicons，使用这些简单的 SVG 图标组件
const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
)

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
)

const GlobeAsiaAustraliaIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
)

const BuildingOfficeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
)

// 区域类型映射
const regionTypeMap: Record<string, { 
  name: string; 
  icon: React.ReactNode;
  childType?: string;
  showLands?: boolean;
}> = {
  world: { 
    name: '世界', 
    icon: <span className="text-2xl">🌍</span>,
    childType: 'continent'
  },
  continent: { 
    name: '大洲', 
    icon: <span className="text-2xl">🗺️</span>,
    childType: 'country'
  },
  country: { 
    name: '国家', 
    icon: <span className="text-2xl">🏛️</span>,
    childType: 'province'
  },
  province: { 
    name: '省份', 
    icon: <span className="text-2xl">🏙️</span>,
    childType: 'city',
    showLands: true
  },
  city: { 
    name: '城市', 
    icon: <span className="text-2xl">🌆</span>,
    childType: 'district',
    showLands: true
  },
  district: { 
    name: '区县', 
    icon: <span className="text-2xl">🏘️</span>,
    childType: 'area',
    showLands: true
  },
  area: { 
    name: '区域', 
    icon: <span className="text-2xl">📍</span>,
    showLands: true
  }
}

export default function RegionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const regionId = Number(params.regionId)
  const { user, isAuthenticated } = useAuth()
  
  // 获取区域信息
  const { region, loading: regionLoading, error: regionError } = useRegion(regionId)
  
  // 获取区域统计信息
  const { stats: regionStats } = useRegionStats(regionId)
  
  // 使用 useMemo 稳定子区域查询参数
  const subRegionOptions = useMemo(() => {
    if (!region?.id) return null
    return {
      parent_id: region.id,
      isActive: true
    }
  }, [region?.id])
  
  // 获取子区域 - 只在有参数时才调用
  const { regions: subRegions = [], loading: subRegionsLoading } = useRegions(subRegionOptions)
  
  // 使用 useMemo 稳定土地查询参数
  const landFilters = useMemo(() => {
    const typeConfig = region ? regionTypeMap[region.region_type] : null
    if (!region || !typeConfig?.showLands) return null
    
    return {
      region_id: region.id,
      page: 1,
      page_size: 20,
      ordering: '-created_at'
    }
  }, [region?.id, region?.region_type])
  
  // 获取可购买的土地
  const { 
    lands: availableLands = [], 
    loading: landsLoading,
    totalCount: totalLands = 0
  } = useLands(landFilters)
  
  // 获取用户在该区域的土地
  const { 
    lands: myLands = [], 
    loading: myLandsLoading 
  } = useMyLandsInRegion(region?.id || null, region?.name)
  
  // Tab 状态
  const [activeTab, setActiveTab] = useState<'subregions' | 'lands' | 'mylands'>('subregions')
  
  // 根据区域类型和数据自动选择 tab
  useEffect(() => {
    if (!region) return
    
    const typeConfig = regionTypeMap[region.region_type]
    
    // 如果有子区域，默认显示子区域
    if (subRegions.length > 0) {
      setActiveTab('subregions')
    } 
    // 如果该类型应该显示土地且有土地，显示土地
    else if (typeConfig?.showLands && totalLands > 0) {
      setActiveTab('lands')
    }
    // 如果用户有土地，显示我的土地
    else if (myLands.length > 0) {
      setActiveTab('mylands')
    }
  }, [region, subRegions.length, totalLands, myLands.length])
  
  // 加载状态
  if (regionLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F1E] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载区域信息...</p>
        </div>
      </div>
    )
  }
  
  // 错误状态
  if (regionError || !region) {
    return (
      <div className="min-h-screen bg-[#0F0F1E] flex items-center justify-center">
        <PixelCard className="p-8 max-w-md text-center">
          <span className="text-4xl mb-4 block">❌</span>
          <h2 className="text-xl font-bold text-white mb-2">加载失败</h2>
          <p className="text-gray-400 mb-4">{regionError || '区域不存在'}</p>
          <PixelButton onClick={() => router.push('/explore/regions')}>
            返回区域列表
          </PixelButton>
        </PixelCard>
      </div>
    )
  }
  
  const regionType = regionTypeMap[region.region_type] || { 
    name: region.region_type, 
    icon: <MapPinIcon className="w-6 h-6" />
  }
  
  // 判断是否应该显示各个 tab
  const showSubRegions = subRegions.length > 0
  const showLands = regionType.showLands && totalLands > 0
  const showMyLands = myLands.length > 0
  
  return (
    <div className="min-h-screen bg-[#0F0F1E] relative">
      <Navbar />
      
      <Container className="pt-24 pb-16">
        {/* 面包屑导航 */}
        <RegionBreadcrumb region={region} />
        
        {/* 区域信息展示 */}
        <RegionHero region={region} regionType={regionType} />
        
        {/* 统计信息展示 */}
        {regionStats && <RegionStats stats={regionStats} />}
        
        {/* Tab 导航 */}
        {(showSubRegions || showLands || showMyLands) && (
          <div className="mb-8 border-b-4 border-gray-800">
            <div className="flex gap-2">
              {showSubRegions && (
                <button
                  onClick={() => setActiveTab('subregions')}
                  className={`px-6 py-3 font-bold text-sm transition-all relative ${
                    activeTab === 'subregions'
                      ? 'text-gold-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {regionType.childType ? regionTypeMap[regionType.childType].name : '子区域'}
                  <span className="ml-2 text-xs">({subRegions.length})</span>
                  {activeTab === 'subregions' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gold-500"
                    />
                  )}
                </button>
              )}
              
              {showLands && (
                <button
                  onClick={() => setActiveTab('lands')}
                  className={`px-6 py-3 font-bold text-sm transition-all relative ${
                    activeTab === 'lands'
                      ? 'text-gold-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  可购买土地
                  <span className="ml-2 text-xs">({totalLands})</span>
                  {activeTab === 'lands' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gold-500"
                    />
                  )}
                </button>
              )}
              
              {showMyLands && (
                <button
                  onClick={() => setActiveTab('mylands')}
                  className={`px-6 py-3 font-bold text-sm transition-all relative ${
                    activeTab === 'mylands'
                      ? 'text-gold-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  我的土地
                  <span className="ml-2 text-xs">({myLands.length})</span>
                  {activeTab === 'mylands' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gold-500"
                    />
                  )}
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Tab 内容区域 */}
        <AnimatePresence mode="wait">
          {/* 子区域列表 */}
          {activeTab === 'subregions' && showSubRegions && (
            <motion.div
              key="subregions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {subRegionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin text-2xl">⏳</div>
                  <p className="text-gray-400 mt-2">加载子区域...</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subRegions.map((subRegion) => (
                    <Link
                      key={subRegion.id}
                      href={`/explore/regions/${subRegion.id}`}
                    >
                      <PixelCard className="p-6 hover:border-gold-500 transition-all cursor-pointer group">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {regionTypeMap[subRegion.region_type]?.icon}
                            <div>
                              <h3 className="font-bold text-white group-hover:text-gold-500 transition-colors">
                                {subRegion.name}
                              </h3>
                              <p className="text-xs text-gray-500">{subRegion.code}</p>
                            </div>
                          </div>
                          <ChevronRightIcon className="w-5 h-5 text-gray-600 group-hover:text-gold-500 transition-colors" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">土地总数</p>
                            <p className="font-bold text-white">{subRegion.total_lands.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">可购买</p>
                            <p className="font-bold text-green-500">{subRegion.available_lands.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        {subRegion.children_count > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-800">
                            <p className="text-xs text-gray-500">
                              包含 {subRegion.children_count} 个{regionTypeMap[subRegion.region_type]?.childType ? regionTypeMap[regionTypeMap[subRegion.region_type].childType!].name : '子区域'}
                            </p>
                          </div>
                        )}
                      </PixelCard>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}
          
          {/* 可购买土地列表 */}
          {activeTab === 'lands' && showLands && (
            <motion.div
              key="lands"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {!isAuthenticated ? (
                <PixelCard className="p-8 text-center">
                  <span className="text-4xl mb-4 block">🔒</span>
                  <h3 className="text-xl font-bold text-white mb-2">需要登录</h3>
                  <p className="text-gray-400 mb-4">登录后才能查看和购买土地</p>
                  <Link href="/login">
                    <PixelButton>立即登录</PixelButton>
                  </Link>
                </PixelCard>
              ) : landsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin text-2xl">⏳</div>
                  <p className="text-gray-400 mt-2">加载土地信息...</p>
                </div>
              ) : availableLands.length === 0 ? (
                <PixelCard className="p-8 text-center">
                  <span className="text-4xl mb-4 block">🏞️</span>
                  <h3 className="text-xl font-bold text-white mb-2">暂无可购买土地</h3>
                  <p className="text-gray-400">该区域暂时没有可购买的土地</p>
                </PixelCard>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {availableLands.map((land) => (
                    <LandCard key={land.id} land={land} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
          
          {/* 我的土地列表 */}
          {activeTab === 'mylands' && showMyLands && (
            <motion.div
              key="mylands"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {myLandsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin text-2xl">⏳</div>
                  <p className="text-gray-400 mt-2">加载我的土地...</p>
                </div>
              ) : myLands.length === 0 ? (
                <PixelCard className="p-8 text-center">
                  <span className="text-4xl mb-4 block">🏞️</span>
                  <h3 className="text-xl font-bold text-white mb-2">暂无土地</h3>
                  <p className="text-gray-400">您在该区域还没有土地</p>
                </PixelCard>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {myLands.map((land) => (
                    <LandCard key={land.id} land={land} isOwned />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 空状态 - 当没有任何数据时显示 */}
        {!showSubRegions && !showLands && !showMyLands && (
          <PixelCard className="p-8 text-center">
            <span className="text-4xl mb-4 block">📍</span>
            <h3 className="text-xl font-bold text-white mb-2">暂无数据</h3>
            <p className="text-gray-400">该区域暂无子区域或可购买的土地</p>
          </PixelCard>
        )}
      </Container>
    </div>
  )
}
