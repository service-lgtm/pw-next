// src/app/explore/regions/[regionId]/page.tsx
// 区域详情页面 - 显示土地列表

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { useRegion, useRegionStats, useRegions } from '@/hooks/useRegions'
import { useLands } from '@/hooks/useLands'
import { RegionBreadcrumb } from '@/components/explore/RegionBreadcrumb'
import { LandGrid } from '@/components/explore/LandGrid'
import { FilterPanel } from '@/components/explore/FilterPanel'
import { LandDetailModal } from '@/components/explore/LandDetailModal'
import type { FilterState, Land } from '@/types/assets'

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
  
  // 获取子区域 - 修复参数名
  const { regions: childRegions } = useRegions({ 
    parent_id: regionId,  // 使用 parent_id 而不是 parentId
    is_active: true 
  })
  
  // 获取土地列表
  const { 
    lands, 
    loading: landsLoading, 
    error: landsError,
    totalCount,
    stats: landStats,
    refetch
  } = useLands({
    ...filters,
    region_id: regionId,
  })
  
  const loading = regionLoading || landsLoading
  const error = regionError || landsError
  
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
            {/* 子区域选择 */}
            {childRegions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-3">选择子区域</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {childRegions.map(child => (
                    <button
                      key={child.id}
                      onClick={() => router.push(`/explore/regions/${child.id}`)}
                      className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left"
                    >
                      <p className="font-medium">{child.name}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {child.available_lands} 块可用
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* 土地列表 */}
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
