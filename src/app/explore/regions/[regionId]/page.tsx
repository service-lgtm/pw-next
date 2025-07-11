// src/app/explore/regions/[regionId]/page.tsx
// 区域详情页面 - 完整版本

'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowLeft, Loader2, AlertCircle, MapPin, Globe, 
  Building2, Trees, Gem, Filter, Grid3x3, List,
  TrendingUp, Activity, Eye, ShoppingBag, ChevronDown,
  LayoutDashboard, Crown, Star
} from 'lucide-react'
import { useRegion, useRegionStats, useRegions } from '@/hooks/useRegions'
import { useLands, useMyLandsInRegion } from '@/hooks/useLands'
import { RegionBreadcrumb } from '@/components/explore/RegionBreadcrumb'
import { LandGrid } from '@/components/explore/LandGrid'
import { FilterPanel } from '@/components/explore/FilterPanel'
import { LandDetailModal } from '@/components/explore/LandDetailModal'
import { MyLandsSection } from '@/components/explore/MyLandsSection'
import type { FilterState, Land } from '@/types/assets'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

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

// 区域类型图标
const regionTypeIcons: Record<string, any> = {
  world: Globe,
  continent: Globe,
  country: MapPin,
  province: MapPin,
  city: Building2,
  district: Building2,
  area: Trees
}

export default function RegionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const regionId = Number(params.regionId)
  const { isAuthenticated } = useAuth()
  
  // 移动端检测
  const [isMobile, setIsMobile] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
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
  
  // 使用 useMemo 来稳定判断条件
  const shouldShowLands = useMemo(() => {
    if (!region) return false
    return (
      region.region_type === 'district' || 
      region.region_type === 'area' ||
      (region.children_count === 0 && region.is_open_for_sale)
    )
  }, [region])
  
  // 使用 useMemo 来稳定查询参数
  const landQueryParams = useMemo(() => {
    if (!shouldShowLands) return null
    return {
      ...filters,
      region_id: regionId,
    }
  }, [shouldShowLands, filters, regionId])
  
  // 获取可购买的土地列表
  const { 
    lands, 
    loading: landsLoading, 
    error: landsError,
    totalCount,
    stats: landStats,
    refetch
  } = useLands(landQueryParams)
  
  // 获取用户在该区域的土地
  const {
    lands: myLands,
    loading: myLandsLoading,
    refetch: refetchMyLands
  } = useMyLandsInRegion(shouldShowLands && isAuthenticated ? regionId : null)
  
  const loading = regionLoading || childRegionsLoading || (shouldShowLands && landsLoading)
  const error = regionError || (shouldShowLands && landsError)
  
  // 移动端检测
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // 路由验证
  useEffect(() => {
    if (!regionId || isNaN(regionId)) {
      router.push('/explore')
    }
  }, [regionId, router])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Gem className="w-12 h-12 text-gold-500 mx-auto mb-4" />
          </motion.div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }
  
  if (error || !region) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">出错了</h2>
          <p className="text-gray-400 mb-6">{error || '区域不存在'}</p>
          <button
            onClick={() => router.push('/explore')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            返回探索页
          </button>
        </motion.div>
      </div>
    )
  }
  
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }
  
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  const handleLandClick = (land: Land) => {
    setSelectedLand(land)
    setShowLandDetail(true)
  }
  
  const RegionIcon = regionTypeIcons[region.region_type] || MapPin
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900">
      {/* 动态背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      {/* 顶部导航 - 添加Dashboard按钮 */}
      <div className="relative border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/10 rounded-lg transition-all hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <RegionBreadcrumb regionId={regionId} />
            </div>
            
            {/* Dashboard 按钮 */}
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                  "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
                  "hover:shadow-lg hover:shadow-purple-500/25",
                  "font-medium text-sm md:text-base"
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden md:inline">控制台</span>
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* 主内容 - 保持原有结构 */}
      <div className="relative container mx-auto px-4 py-6 md:py-10">
        {/* 区域信息头部 */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-10"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <RegionIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-black text-white mb-2">{region?.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="px-3 py-1 bg-white/10 rounded-full">
                      {getRegionTypeDisplay(region?.region_type)}
                    </span>
                    {region?.is_open_for_sale && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        已开放销售
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* 统计信息卡片 */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 md:mt-0">
                  <div className="bg-black/20 rounded-xl p-3 text-center">
                    <p className="text-2xl md:text-3xl font-bold text-white">{stats.total_lands}</p>
                    <p className="text-xs text-gray-400">总土地</p>
                  </div>
                  <div className="bg-black/20 rounded-xl p-3 text-center">
                    <p className="text-2xl md:text-3xl font-bold text-green-400">{stats.available_lands}</p>
                    <p className="text-xs text-gray-400">可购买</p>
                  </div>
                  <div className="bg-black/20 rounded-xl p-3 text-center">
                    <p className="text-2xl md:text-3xl font-bold text-gold-500">
                      {stats.average_price ? `¥${Math.round(stats.average_price / 10000)}万` : '-'}
                    </p>
                    <p className="text-xs text-gray-400">均价</p>
                  </div>
                  <div className="bg-black/20 rounded-xl p-3 text-center">
                    <p className="text-2xl md:text-3xl font-bold text-purple-400">
                      {Math.round((stats.owned_lands / stats.total_lands) * 100)}%
                    </p>
                    <p className="text-xs text-gray-400">持有率</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* 如果有子区域，显示子区域网格 */}
        {childRegions.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">
                选择{getChildRegionTypeDisplay(region?.region_type)}
              </h2>
              <div className="text-sm text-gray-400">
                共 {childRegions.length} 个区域
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {childRegions.map((child, index) => (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Link
                    href={`/explore/regions/${child.id}`}
                    className={cn(
                      "block h-full p-5 bg-white/5 backdrop-blur-sm hover:bg-white/10",
                      "rounded-xl transition-all border-2",
                      child.is_open_for_sale 
                        ? "border-purple-500/30 hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/20" 
                        : "border-gray-700/50 hover:border-gray-600"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-lg">{child.name}</h3>
                      {child.is_open_for_sale ? (
                        <Eye className="w-5 h-5 text-purple-400" />
                      ) : (
                        <div className="w-5 h-5" />
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-400">
                        <span>代码</span>
                        <span className="text-white font-mono">{child.code}</span>
                      </div>
                      
                      {child.total_lands > 0 && (
                        <>
                          <div className="flex justify-between text-gray-400">
                            <span>总土地</span>
                            <span className="text-white font-medium">{child.total_lands}</span>
                          </div>
                          <div className="flex justify-between text-gray-400">
                            <span>可购买</span>
                            <span className="text-green-400 font-medium">{child.available_lands}</span>
                          </div>
                          
                          {/* 进度条 */}
                          <div className="mt-3">
                            <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ 
                                  width: `${((child.total_lands - child.available_lands) / child.total_lands) * 100}%`
                                }}
                                transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              已售 {Math.round(((child.total_lands - child.available_lands) / child.total_lands) * 100)}%
                            </p>
                          </div>
                        </>
                      )}
                      
                      <div className="pt-3">
                        {child.is_open_for_sale ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                            <Activity className="w-3 h-3" />
                            已开放
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-full">
                            即将开放
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : shouldShowLands ? (
          // 如果没有子区域且应该显示土地，显示土地列表
          <div>
            {/* 我的土地展示区域 */}
            {isAuthenticated && myLands.length > 0 && (
              <MyLandsSection
                lands={myLands}
                loading={myLandsLoading}
                onLandClick={handleLandClick}
                regionName={region.name}
              />
            )}
            
            {/* 工具栏 */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">可购买土地</h2>
                <p className="text-sm text-gray-400 mt-1">
                  共 {totalCount} 块土地可供选购
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* 移动端筛选按钮 */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "md:hidden px-4 py-2 rounded-lg flex items-center gap-2 transition-all",
                    showFilters 
                      ? "bg-purple-600 text-white" 
                      : "bg-white/10 hover:bg-white/20"
                  )}
                >
                  <Filter className="w-4 h-4" />
                  筛选
                  {showFilters && <ChevronDown className="w-4 h-4 rotate-180" />}
                </button>
                
                {/* 视图切换 */}
                <div className="flex items-center bg-white/10 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-2 rounded transition-all",
                      viewMode === 'grid' 
                        ? "bg-purple-600 text-white" 
                        : "text-gray-400 hover:text-white"
                    )}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-2 rounded transition-all",
                      viewMode === 'list' 
                        ? "bg-purple-600 text-white" 
                        : "text-gray-400 hover:text-white"
                    )}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid lg:grid-cols-[320px_1fr] gap-6">
              {/* 筛选面板 - 响应式 */}
              <AnimatePresence>
                {(showFilters || !isMobile) && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={cn(
                      "lg:relative",
                      isMobile && "fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-xl p-4 overflow-y-auto"
                    )}
                  >
                    {isMobile && (
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold">筛选条件</h3>
                        <button
                          onClick={() => setShowFilters(false)}
                          className="p-2 hover:bg-white/10 rounded-lg"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    <FilterPanel
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      stats={stats}
                      totalLands={totalCount}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* 土地网格 */}
              <div className={cn(isMobile && showFilters && "hidden")}>
                <LandGrid
                  lands={lands}
                  loading={landsLoading}
                  onLandClick={handleLandClick}
                  currentPage={filters.page}
                  totalPages={Math.ceil(totalCount / filters.page_size)}
                  onPageChange={handlePageChange}
                  viewMode={viewMode}
                />
              </div>
            </div>
          </div>
        ) : (
          // 既没有子区域也不应该显示土地
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <MapPin className="w-12 h-12 text-white" />
              </div>
              <p className="text-xl text-gray-300 mb-2">
                {region?.is_open_for_sale ? '该区域暂无可用数据' : '该区域尚未开放'}
              </p>
              <p className="text-sm text-gray-500">
                {region?.is_open_for_sale 
                  ? '请稍后再来查看或选择其他区域' 
                  : '敬请期待后续开放'
                }
              </p>
            </div>
          </motion.div>
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
            refetchMyLands()
          }}
        />
      )}
    </div>
  )
}
