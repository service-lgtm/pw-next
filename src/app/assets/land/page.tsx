/**
 * 文件: /src/app/assets/land/page.tsx
 * 描述: 土地资产页面
 * 
 * 修改历史：
 * - 2025-01-27: 修复路由链接
 *   - 将 /explore/lands 改为 /explore
 *   - 确保所有跳转链接正确
 * 
 * 功能：
 * - 显示用户拥有的所有土地
 * - 支持搜索、筛选和排序
 * - 显示土地统计信息
 * - 提供快速操作入口
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useMyLands } from '@/hooks/useLands'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

type SortOption = 'created_at' | 'current_price' | 'size_sqm' | 'land_type'
type FilterOption = 'all' | 'urban' | 'farm' | 'forest' | 'mine'

export default function LandAssetsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { lands, loading, error, refetch } = useMyLands()
  const [sortBy, setSortBy] = useState<SortOption>('created_at')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // 检查认证状态
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录')
      router.push('/login?redirect=/assets/land')
    }
  }, [authLoading, isAuthenticated, router])

  // 如果正在检查认证状态
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

  // 如果未认证，返回空
  if (!isAuthenticated) {
    return null
  }

  // 过滤和排序土地
  const processedLands = lands
    .filter(land => {
      // 按类型过滤
      if (filterBy !== 'all' && land.land_type !== filterBy) {
        return false
      }
      // 按搜索词过滤
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        return (
          land.land_id.toLowerCase().includes(search) ||
          land.region_name.toLowerCase().includes(search) ||
          land.land_type_display.toLowerCase().includes(search)
        )
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'current_price':
          return parseFloat(b.current_price) - parseFloat(a.current_price)
        case 'size_sqm':
          return b.size_sqm - a.size_sqm
        case 'land_type':
          return a.land_type.localeCompare(b.land_type)
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  // 计算统计数据
  const stats = {
    totalLands: lands.length,
    totalValue: lands.reduce((sum, land) => sum + parseFloat(land.current_price), 0),
    totalArea: lands.reduce((sum, land) => sum + land.size_sqm, 0),
    typeCount: lands.reduce((acc, land) => {
      acc[land.land_type] = (acc[land.land_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载土地数据中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-500 mb-4">{error}</p>
          <PixelButton onClick={() => refetch()}>
            重试
          </PixelButton>
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
          我的土地资产
        </h1>
        <p className="text-gray-400 mt-1">
          管理您的数字土地资产
        </p>
      </motion.div>

      {/* 统计卡片 */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <PixelCard className="p-4 text-center">
            <p className="text-3xl font-black text-gold-500">{stats.totalLands}</p>
            <p className="text-sm text-gray-400 mt-1">土地数量</p>
          </PixelCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <PixelCard className="p-4 text-center">
            <p className="text-3xl font-black text-green-500">
              {stats.totalValue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400 mt-1">总价值 (TDB)</p>
          </PixelCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <PixelCard className="p-4 text-center">
            <p className="text-3xl font-black text-blue-500">
              {stats.totalArea.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400 mt-1">总面积 (m²)</p>
          </PixelCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
        >
          <PixelCard className="p-4 text-center">
            <p className="text-3xl font-black text-purple-500">
              {(stats.totalValue / stats.totalLands || 0).toFixed(0)}
            </p>
            <p className="text-sm text-gray-400 mt-1">均价 (TDB)</p>
          </PixelCard>
        </motion.div>
      </div>

      {/* 筛选和排序 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <PixelCard className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="搜索土地ID、区域或类型..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white border-2 border-gray-700 focus:border-gold-500 rounded outline-none"
              />
            </div>

            {/* 类型筛选 */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="px-4 py-2 bg-gray-800 text-white border-2 border-gray-700 focus:border-gold-500 rounded outline-none"
            >
              <option value="all">全部类型</option>
              <option value="urban">城市用地</option>
              <option value="farm">农业用地</option>
              <option value="forest">森林</option>
              <option value="mine">矿山</option>
            </select>

            {/* 排序 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 bg-gray-800 text-white border-2 border-gray-700 focus:border-gold-500 rounded outline-none"
            >
              <option value="created_at">获得时间</option>
              <option value="current_price">价格</option>
              <option value="size_sqm">面积</option>
              <option value="land_type">类型</option>
            </select>
          </div>
        </PixelCard>
      </motion.div>

      {/* 土地列表 */}
      {processedLands.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processedLands.map((land, index) => (
            <motion.div
              key={land.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.3) }}
            >
              <PixelCard 
                className="p-4 hover:border-gold-500 transition-all cursor-pointer"
                onClick={() => router.push(`/assets/land/${land.id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{land.land_id}</h3>
                    <p className="text-sm text-gray-400">{land.region_name}</p>
                  </div>
                  <span className={cn(
                    "px-2 py-1 text-xs font-bold rounded",
                    land.land_type === 'urban' && "bg-blue-500/20 text-blue-400",
                    land.land_type === 'farm' && "bg-green-500/20 text-green-400",
                    land.land_type === 'forest' && "bg-emerald-500/20 text-emerald-400",
                    land.land_type === 'mine' && "bg-orange-500/20 text-orange-400"
                  )}>
                    {land.land_type_display}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-400">面积</p>
                    <p className="font-bold">{land.size_sqm.toLocaleString()} m²</p>
                  </div>
                  <div>
                    <p className="text-gray-400">价值</p>
                    <p className="font-bold text-gold-500">
                      {parseFloat(land.current_price).toLocaleString()} TDB
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">坐标</p>
                    <p className="font-mono text-xs">({land.coordinate_x}, {land.coordinate_y})</p>
                  </div>
                  <div>
                    <p className="text-gray-400">状态</p>
                    <p className="font-bold text-green-500">已拥有</p>
                  </div>
                </div>

                {land.is_special && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <span className="text-xs text-yellow-500 font-bold">⭐ 特殊地块</span>
                  </div>
                )}
              </PixelCard>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <PixelCard className="p-12 text-center">
            <div className="text-6xl mb-4">🏞️</div>
            <h3 className="text-xl font-bold mb-2">
              {searchTerm || filterBy !== 'all' ? '没有找到匹配的土地' : '您还没有土地资产'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || filterBy !== 'all' 
                ? '尝试调整搜索条件' 
                : '前往探索世界，购买您的第一块土地'}
            </p>
            {!searchTerm && filterBy === 'all' && (
              <PixelButton onClick={() => router.push('/explore')}>
                去购买土地
              </PixelButton>
            )}
          </PixelCard>
        </motion.div>
      )}

      {/* 快速操作 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 flex justify-center gap-4"
      >
        <PixelButton
          onClick={() => router.push('/explore')}
          variant="secondary"
        >
          购买更多土地
        </PixelButton>
        <PixelButton
          onClick={() => router.push('/assets')}
          variant="secondary"
        >
          返回资产总览
        </PixelButton>
      </motion.div>
    </div>
  )
}
