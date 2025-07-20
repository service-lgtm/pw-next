// src/app/explore/regions/[regionId]/page.tsx
// 区域详情页面 - 修复循环请求问题

'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { RegionBreadcrumb } from '@/components/explore/RegionBreadcrumb'
import { LandCard } from '@/components/explore/LandCard'
import { Container } from '@/components/ui/Container'
import { Navbar } from '@/components/layout/Navbar'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useRegion, useRegions, useRegionStats } from '@/hooks/useRegions'
import { useLands, useMyLandsInRegion } from '@/hooks/useLands'
import { useAuth } from '@/hooks/useAuth'
import type { Region } from '@/types/assets'

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
    if (!region?.id) return {}
    return {
      parent_id: region.id,
      isActive: true
    }
  }, [region?.id])
  
  // 获取子区域
  const { regions: subRegions = [], loading: subRegionsLoading } = useRegions(
    region?.id ? subRegionOptions : {}
  )
  
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
    icon: <span className="text-2xl">📍</span>
  }
  
  // 判断是否应该显示各个 tab
  const showSubRegions = subRegions.length > 0
  const showLands = regionType.showLands && totalLands > 0
  const showMyLands = myLands.length > 0
  
  return (
    <div className="min-h-screen bg-[#0F0F1E] relative">
      <Navbar />
      
      <Container className="pt-24 pb-16">
        {/* 面包屑 */}
        <RegionBreadcrumb region={region} />
        
        {/* 区域信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <PixelCard className="p-6">
            <div className="flex items-center gap-4 mb-4">
              {regionType.icon}
              <div>
                <h1 className="text-3xl font-bold text-white">{region.name}</h1>
                <p className="text-gray-400">{regionType.name} · {region.code}</p>
              </div>
            </div>
            
            {regionStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{regionStats.data.total_lands}</p>
                  <p className="text-sm text-gray-400">土地总数</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{regionStats.data.available_lands}</p>
                  <p className="text-sm text-gray-400">可购买</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">{regionStats.data.owned_lands}</p>
                  <p className="text-sm text-gray-400">已售出</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gold-500">
                    {Math.floor(regionStats.data.average_price).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">平均价格</p>
                </div>
              </div>
            )}
          </PixelCard>
        </motion.div>
        
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
        
        {/* Tab 内容 */}
        <AnimatePresence mode="wait">
          {/* 子区域列表 */}
          {activeTab === 'subregions' && showSubRegions && (
            <motion.div
              key="subregions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {subRegionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin text-2xl">⏳</div>
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
                          <span className="text-gray-600 group-hover:text-gold-500 transition-colors">→</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">土地总数</p>
                            <p className="font-bold text-white">{subRegion.total_lands}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">可购买</p>
                            <p className="font-bold text-green-500">{subRegion.available_lands}</p>
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
                </div>
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
            >
              {myLandsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin text-2xl">⏳</div>
                </div>
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
        
        {/* 空状态 */}
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
