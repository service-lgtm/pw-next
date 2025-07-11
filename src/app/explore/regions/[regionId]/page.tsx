// src/app/explore/regions/[regionId]/page.tsx
// 区域详情页面 - 显示土地列表

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { useRegion, useRegionStats, useRegions } from '@/hooks/useRegions'
import { useLands } from '@/hooks/useLands'
import { RegionBreadcrumb } from '@/components/explore/RegionBreadcrumb'
import { LandGrid } from '@/components/explore/LandGrid'
import { FilterPanel } from '@/components/explore/FilterPanel'
import { LandDetailModal } from '@/components/explore/LandDetailModal'
import type { FilterState, Land } from '@/types/assets'

// 获取区域类型的中文显示
function getRegionTypeDisplay(type?: string): string {
  const typeMap: Record<string, string> = {
    world: '世界',
    continent: '大洲',
    country: '国家',
    province: '省份',
    city: '城市',
    district: '区/县',
    area: '区域'
  }
  return typeMap[type || ''] || type || '未知'
}

// 获取子区域类型的中文显示
function getChildRegionTypeDisplay(parentType?: string): string {
  const childTypeMap: Record<string, string> = {
    world: '大洲',
    continent: '国家',
    country: '省份',
    province: '城市',
    city: '区/县',
    district: '区域',
    area: '地块'
  }
  return childTypeMap[parentType || ''] || '子区域'
}

export default function RegionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const regionId = Number(params.regionId)
  
  const [filters, setFilters] = useState<FilterState>({
    land_type: 'all',
    status: 'all',
    priceRange: {},
    search: '',
    ordering: '-created_at',
    page: 1,
    page_size: 20,
  })
  
  const [selectedLand, setSelectedLand] = useState<Land | null>(null)
  const [showLandDetail, setShowLandDetail] = useState(false)
  
  // 获取区域信息
  const { region, loading: regionLoading, error: regionError } = useRegion(regionId)
  const { stats, loading: statsLoading } = useRegionStats(regionId)
  
  // 获取子区域
  const { regions: childRegions, loading: childRegionsLoading } = useRegions({ 
    parent_id: regionId,
    is_active: true 
  })
  
  // 判断是否应该显示土地（只有在最底层区域才显示）
  const shouldShowLands = region && (
    region.region_type === 'district' || 
    region.region_type === 'area' ||
    (region.children_count === 0 && region.is_open_for_sale)
  )
  
  // 只有在应该显示土地时才获取土地列表
  const { 
    lands, 
    loading: landsLoading, 
    error: landsError,
    totalCount,
    stats: landStats,
    refetch
  } = useLands(shouldShowLands ? {
    ...filters,
    region_id: regionId,
  } : null)
  
  const loading = regionLoading || childRegionsLoading || (shouldShowLands && landsLoading)
  const error = regionError || (shouldShowLands && landsError)
  
  // 防止无限刷新
  useEffect(() => {
    if (!regionId || isNaN(regionId)) {
      router.push('/explore')
    }
  }, [regionId, router])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1B] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gold-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }
  
  if (error || !region) {
    return (
      <div className="min-h-screen bg-[#0A0F1B] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-400">{error || '区域不存在'}</p>
          <button
            onClick={() => router.push('/explore')}
            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            返回探索页
          </button>
        </div>
      </div>
    )
  }
  
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }
  
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }
  
  const handleLandClick = (land: Land) => {
    setSelectedLand(land)
    setShowLandDetail(true)
  }
  
  return (
    <div className="min-h-screen bg-[#0A0F1B]">
      {/* 顶部导航 */}
      <div className="border-b border-gray-800 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <RegionBreadcrumb regionId={regionId} />
          </div>
        </div>
      </div>
      
      {/* 主内容 */}
      <div className="container mx-auto px-4 py-6">
        {/* 区域信息头部 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">{region?.name}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>类型: {getRegionTypeDisplay(region?.region_type)}</span>
            {region?.is_open_for_sale && (
              <span className="text-green-500">• 已开放销售</span>
            )}
            {stats && (
              <>
                <span>• 总土地: {stats.total_lands}</span>
                <span>• 可购买: {stats.available_lands}</span>
              </>
            )}
          </div>
        </div>
        
        {/* 如果有子区域，显示子区域网格 */}
        {childRegions.length > 0 ? (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              选择{getChildRegionTypeDisplay(region?.region_type)}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {childRegions.map(child => (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Link
                    href={`/explore/regions/${child.id}`}
                    className="block p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all border-2 border-transparent hover:border-gold-500"
                  >
                    <h3 className="font-bold text-lg mb-2">{child.name}</h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-400">代码: {child.code}</p>
                      {child.total_lands > 0 && (
                        <>
                          <p className="text-gray-400">
                            总土地: <span className="text-white font-medium">{child.total_lands}</span>
                          </p>
                          <p className="text-gray-400">
                            可购买: <span className="text-green-500 font-medium">{child.available_lands}</span>
                          </p>
                        </>
                      )}
                      {child.is_open_for_sale ? (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded">
                          已开放
                        </span>
                      ) : (
                        <span className="inline-block mt-2 px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
                          未开放
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        ) : shouldShowLands ? (
          // 如果没有子区域且应该显示土地，显示土地列表
          <div className="grid lg:grid-cols-[320px_1fr] gap-6">
            {/* 筛选面板 */}
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              stats={stats}
              totalLands={totalCount}
            />
            
            {/* 土地网格 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">可购买土地</h2>
              <LandGrid
                lands={lands}
                loading={landsLoading}
                onLandClick={handleLandClick}
                currentPage={filters.page}
                totalPages={Math.ceil(totalCount / filters.page_size)}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        ) : (
          // 既没有子区域也不应该显示土地
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">
              {region?.is_open_for_sale ? '该区域暂无可用数据' : '该区域尚未开放'}
            </p>
          </div>
        )}
      </div>
      
      {/* 土地详情弹窗 */}
      {selectedLand && (
        <LandDetailModal
          landId={selectedLand.id}
          isOpen={showLandDetail}
          onClose={() => setShowLandDetail(false)}
          onPurchaseSuccess={() => {
            setShowLandDetail(false)
            refetch()
          }}
        />
      )}
    </div>
  )
}
