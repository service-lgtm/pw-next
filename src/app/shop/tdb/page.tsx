// src/app/shop/tdb/page.tsx
// TDB商品浏览页面 - 响应式网格布局优化版
// 功能：商品列表展示、搜索筛选、购买入口、提货单管理入口
// 优化：移动端2列、平板3列、桌面4-6列的响应式布局

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import type { Product } from '@/lib/api'

/**
 * TDB商城主页面组件 - 响应式优化版
 * 
 * 布局策略：
 * - 移动端 (< 640px): 2列网格
 * - 小平板 (640px - 768px): 2-3列网格  
 * - 平板 (768px - 1024px): 3列网格
 * - 桌面 (1024px - 1280px): 4列网格
 * - 大屏幕 (>= 1280px): 4-6列网格
 * 
 * 优化内容：
 * - 紧凑的卡片设计
 * - 优化的字体大小
 * - 简化的按钮布局
 * - 更好的空间利用
 */

export default function TDBShopPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState<string[]>(['全部'])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid') // 新增视图模式
  
  // 用户提货单统计
  const [userStats, setUserStats] = useState({
    pendingCount: 0,
    activeCount: 0,
    totalTdb: 0
  })

  // 检查认证状态
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录')
      router.push('/login?redirect=/shop/tdb')
    }
  }, [authLoading, isAuthenticated, router])

  // 加载商品列表
  const loadProducts = async (reset = false) => {
    if (loading && !reset) return
    
    setLoading(true)
    try {
      const params: any = {
        page: reset ? 1 : page,
        page_size: 20, // 增加每页数量
      }
      
      if (searchTerm) {
        params.search = searchTerm
      }
      
      if (selectedCategory && selectedCategory !== '全部') {
        params.category = selectedCategory
      }
      
      const response = await api.shop.products.list(params)
      
      if (reset) {
        setProducts(response.results)
        setPage(1)
      } else {
        setProducts(prev => [...prev, ...response.results])
      }
      
      setHasMore(!!response.next)
      setTotalCount(response.count)
      
      // 提取分类
      const allCategories = new Set(['全部'])
      response.results.forEach(product => {
        if (product.category) {
          allCategories.add(product.category)
        }
      })
      setCategories(Array.from(allCategories))
      
    } catch (error) {
      console.error('加载商品失败:', error)
      toast.error('加载商品失败')
    } finally {
      setLoading(false)
    }
  }

  // 加载用户提货单统计
  const loadUserStats = async () => {
    try {
      // 如果有统计接口，可以调用
      // const stats = await api.shop.tickets.stats()
      // setUserStats(stats)
    } catch (error) {
      console.error('加载统计失败:', error)
    }
  }

  // 初始加载
  useEffect(() => {
    if (isAuthenticated) {
      loadProducts(true)
      loadUserStats()
    }
  }, [isAuthenticated])

  // 搜索和筛选变化时重新加载
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        loadProducts(true)
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [searchTerm, selectedCategory])

  // 处理购买
  const handlePurchase = (product: Product) => {
    router.push(`/shop/tdb/payment?productId=${product.id}`)
  }

  // 加载更多
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
      loadProducts(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="p-3 md:p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 页面标题和快速入口 - 优化移动端布局 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 md:mb-6"
      >
        {/* 顶部导航栏 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white self-start text-sm"
          >
            ← 返回
          </button>
          
          {/* 快速入口按钮 - 移动端也显示 */}
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/shop/tickets')}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
              <span className="text-base">📦</span>
              <span className="hidden sm:inline font-bold">我的提货单</span>
              <span className="sm:hidden font-bold">提货单</span>
              {userStats.pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {userStats.pendingCount}
                </span>
              )}
            </button>
            
            {/* 视图切换按钮 - 新增 */}
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
              <span className="text-base">{viewMode === 'grid' ? '📱' : '⚏'}</span>
              <span className="hidden sm:inline font-bold">
                {viewMode === 'grid' ? '列表' : '网格'}
              </span>
            </button>
          </div>
        </div>

        {/* 页面标题 */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
          TDB 通证商城
        </h1>
        <p className="text-gray-400 mt-1 text-sm sm:text-base">
          购买实物商品，获得对应TDB通证
        </p>
      </motion.div>

      {/* 搜索和筛选 - 优化移动端布局 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4 md:mb-6"
      >
        <div className="flex flex-col gap-3">
          {/* 搜索框 */}
          <div className="w-full">
            <input
              type="text"
              placeholder="搜索商品..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-800 border-2 border-gray-700 focus:border-gold-500 rounded outline-none"
            />
          </div>
          
          {/* 分类筛选 - 横向滚动 */}
          <div className="overflow-x-auto pb-2 -mx-3 px-3">
            <div className="flex gap-2 min-w-max">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category === '全部' ? '' : category)}
                  className={cn(
                    "px-3 py-1.5 rounded text-sm font-bold transition-all whitespace-nowrap",
                    (category === '全部' && !selectedCategory) || selectedCategory === category
                      ? "bg-gold-500 text-black"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 商品列表 - 响应式网格布局 */}
      {loading && products.length === 0 ? (
        <div className="text-center py-20">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载商品中...</p>
        </div>
      ) : products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <p className="text-gray-400 text-lg">没有找到相关商品</p>
        </motion.div>
      ) : viewMode === 'grid' ? (
        <>
          {/* 网格视图 - 响应式多列布局 */}
          <div className={cn(
            "grid gap-3 md:gap-4 lg:gap-6",
            // 响应式列数配置
            "grid-cols-2", // 默认移动端2列
            "sm:grid-cols-2", // 小屏幕2列
            "md:grid-cols-3", // 平板3列
            "lg:grid-cols-4", // 桌面4列
            "xl:grid-cols-5", // 大屏幕5列
            "2xl:grid-cols-6" // 超大屏幕6列
          )}>
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.3) }}
                className="h-full"
              >
                <PixelCard className="overflow-hidden hover:border-gold-500 transition-all h-full flex flex-col p-0">
                  {/* 商品图片 - 优化比例 */}
                  <div className="aspect-square bg-gray-800 relative overflow-hidden group">
                    {product.primary_image || product.images?.[0] ? (
                      <img
                        src={product.primary_image || product.images?.[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const img = e.currentTarget
                          img.style.display = 'none'
                          const fallback = document.createElement('div')
                          fallback.className = 'w-full h-full flex items-center justify-center text-4xl sm:text-5xl opacity-20'
                          fallback.textContent = '📦'
                          if (img.parentElement && !img.parentElement.querySelector('div')) {
                            img.parentElement.appendChild(fallback)
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl sm:text-5xl opacity-20">
                        📦
                      </div>
                    )}
                    
                    {/* 标签 - 优化大小 */}
                    {product.is_hot && (
                      <div className="absolute top-1 left-1">
                        <span className="bg-red-500 text-white text-[10px] sm:text-xs px-1.5 py-0.5 rounded">
                          热卖
                        </span>
                      </div>
                    )}
                    
                    {/* 支付方式图标 - 简化显示 */}
                    {product.payment_methods && product.payment_methods.length > 0 && (
                      <div className="absolute bottom-1 right-1 flex gap-0.5">
                        {product.payment_methods.includes('alipay') && (
                          <span className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500/80 text-white text-[10px] sm:text-xs rounded flex items-center justify-center">
                            支
                          </span>
                        )}
                        {product.payment_methods.includes('wechat') && (
                          <span className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500/80 text-white text-[10px] sm:text-xs rounded flex items-center justify-center">
                            微
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* 商品信息 - 紧凑布局 */}
                  <div className="p-2 sm:p-3 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className="font-bold text-sm sm:text-base mb-1 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                        {product.name}
                      </h3>
                      {product.category && (
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-2">
                          {product.category}
                        </p>
                      )}
                    </div>
                    
                    {/* 价格和TDB - 优化显示 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-white">
                            ¥{parseFloat(product.price).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs sm:text-sm font-bold text-gold-500">
                            {parseFloat(product.tdb_amount).toLocaleString()}
                            <span className="text-[10px] sm:text-xs ml-0.5">TDB</span>
                          </p>
                        </div>
                      </div>
                      
                      <PixelButton
                        className="w-full text-xs sm:text-sm py-1.5 sm:py-2"
                        onClick={() => handlePurchase(product)}
                      >
                        立即购买
                      </PixelButton>
                    </div>
                  </div>
                </PixelCard>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* 列表视图 - 适合详细信息展示 */}
          <div className="space-y-3">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.3) }}
              >
                <PixelCard className="p-3 sm:p-4 hover:border-gold-500 transition-all">
                  <div className="flex gap-3 sm:gap-4">
                    {/* 商品图片 */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                      {product.primary_image || product.images?.[0] ? (
                        <img
                          src={product.primary_image || product.images?.[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            const img = e.currentTarget
                            img.style.display = 'none'
                            const fallback = document.createElement('div')
                            fallback.className = 'w-full h-full flex items-center justify-center text-3xl opacity-20'
                            fallback.textContent = '📦'
                            if (img.parentElement && !img.parentElement.querySelector('div')) {
                              img.parentElement.appendChild(fallback)
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">
                          📦
                        </div>
                      )}
                    </div>
                    
                    {/* 商品信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-sm sm:text-base mb-1">{product.name}</h3>
                          {product.description && (
                            <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 mb-1">
                              {product.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">{product.category}</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm sm:text-base font-bold text-white">
                              ¥{parseFloat(product.price).toFixed(2)}
                            </p>
                            <p className="text-xs sm:text-sm font-bold text-gold-500">
                              {parseFloat(product.tdb_amount).toLocaleString()} TDB
                            </p>
                          </div>
                          
                          <PixelButton
                            size="sm"
                            onClick={() => handlePurchase(product)}
                            className="text-xs sm:text-sm"
                          >
                            购买
                          </PixelButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </PixelCard>
              </motion.div>
            ))}
          </div>
        </>
      )}
      
      {/* 加载更多 */}
      {hasMore && (
        <div className="text-center mt-6">
          <PixelButton
            onClick={loadMore}
            disabled={loading}
            variant="secondary"
            className="text-sm"
          >
            {loading ? '加载中...' : '加载更多'}
          </PixelButton>
        </div>
      )}
      
      {/* 显示总数 */}
      <p className="text-center text-gray-400 text-xs sm:text-sm mt-4">
        共 {totalCount} 件商品，已加载 {products.length} 件
      </p>

      {/* 底部说明 - 优化移动端显示 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 sm:mt-12"
      >
        <PixelCard className="p-3 sm:p-4 md:p-6 bg-gold-500/10 border-gold-500/30">
          <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-gold-500">
            购买说明
          </h3>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-gold-500 mt-0.5">•</span>
              <span>所有商品均为实物商品</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-500 mt-0.5">•</span>
              <span>支付成功并审核通过后，对应的TDB通证会立即到账</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-500 mt-0.5">•</span>
              <span>如需退换货，请在收货后7天内联系客服</span>
            </li>
          </ul>
        </PixelCard>
      </motion.div>
    </div>
  )
}
