// src/app/shop/tdb/page.tsx
// TDB商品浏览页面 - 优化版本，支持更多数据加载和无限滚动
// 功能：商品列表展示、搜索筛选、购买入口、提货单管理入口、无限滚动加载
// 优化：增加每页数量、添加无限滚动、优化加载体验

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
 * TDB商城主页面组件 - 优化版本
 * 
 * 优化内容：
 * 1. 增加每页加载数量到50条
 * 2. 添加无限滚动自动加载
 * 3. 优化加载状态显示
 * 4. 添加回到顶部按钮
 * 5. 改进筛选和搜索的防抖处理
 * 6. 添加商品数量统计显示
 * 7. 优化内存使用，限制最大加载数量
 */

// 配置常量
const PAGE_SIZE = 50 // 每页加载数量，从20增加到50
const MAX_PRODUCTS = 500 // 最大加载商品数量，防止内存溢出
const SCROLL_THRESHOLD = 200 // 滚动触发加载的距离阈值（px）
const DEBOUNCE_DELAY = 300 // 搜索防抖延迟（ms）

export default function TDBShopPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState<string[]>(['全部'])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  // Refs
  const loadingRef = useRef(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const observerRef = useRef<IntersectionObserver>()
  const sentinelRef = useRef<HTMLDivElement>(null)
  
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
  const loadProducts = useCallback(async (reset = false, searchQuery = searchTerm, category = selectedCategory) => {
    // 防止重复加载
    if (loadingRef.current && !reset) return
    
    // 检查是否达到最大加载数量
    if (!reset && products.length >= MAX_PRODUCTS) {
      toast.info(`已加载最大数量 ${MAX_PRODUCTS} 件商品`)
      setHasMore(false)
      return
    }
    
    loadingRef.current = true
    
    if (reset) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    
    try {
      const currentPage = reset ? 1 : page
      const params: any = {
        page: currentPage,
        page_size: PAGE_SIZE, // 使用增大的页面大小
      }
      
      if (searchQuery) {
        params.search = searchQuery
      }
      
      if (category && category !== '全部') {
        params.category = category
      }
      
      const response = await api.shop.products.list(params)
      
      // 处理商品数据
      let newProducts = response.results || []
      
      if (reset) {
        setProducts(newProducts)
        setPage(1)
      } else {
        // 限制最大数量
        const remainingSpace = MAX_PRODUCTS - products.length
        if (remainingSpace < newProducts.length) {
          newProducts = newProducts.slice(0, remainingSpace)
        }
        setProducts(prev => [...prev, ...newProducts])
      }
      
      // 更新分页状态
      const hasNextPage = !!response.next
      const underMaxLimit = (reset ? newProducts.length : products.length + newProducts.length) < MAX_PRODUCTS
      setHasMore(hasNextPage && underMaxLimit)
      setTotalCount(response.count)
      
      // 提取所有分类（只在初次加载或重置时）
      if (reset || categories.length === 1) {
        const allCategories = new Set(['全部'])
        // 从当前结果提取分类
        response.results.forEach((product: Product) => {
          if (product.category) {
            allCategories.add(product.category)
          }
        })
        
        // 如果有更多页面，可以考虑异步加载所有分类
        // 这里为了性能，只从当前页提取
        setCategories(Array.from(allCategories))
      }
      
      // 标记初始加载完成
      if (isInitialLoad) {
        setIsInitialLoad(false)
      }
      
    } catch (error) {
      console.error('加载商品失败:', error)
      toast.error('加载商品失败，请刷新重试')
    } finally {
      setLoading(false)
      setLoadingMore(false)
      loadingRef.current = false
    }
  }, [products.length, page, searchTerm, selectedCategory, categories.length, isInitialLoad])

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

  // 搜索防抖处理
  useEffect(() => {
    if (!isAuthenticated || isInitialLoad) return
    
    // 清除之前的定时器
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // 设置新的定时器
    searchTimeoutRef.current = setTimeout(() => {
      loadProducts(true, searchTerm, selectedCategory)
    }, DEBOUNCE_DELAY)
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm])

  // 分类变化立即加载
  useEffect(() => {
    if (!isAuthenticated || isInitialLoad) return
    loadProducts(true, searchTerm, selectedCategory)
  }, [selectedCategory])

  // 设置无限滚动观察器
  useEffect(() => {
    if (!hasMore || loading || !sentinelRef.current) return
    
    const options = {
      root: null,
      rootMargin: `${SCROLL_THRESHOLD}px`,
      threshold: 0
    }
    
    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !loadingRef.current) {
        loadMore()
      }
    }, options)
    
    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current)
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, loading])

  // 监听滚动显示回到顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 处理购买
  const handlePurchase = (product: Product) => {
    router.push(`/shop/tdb/payment?productId=${product.id}`)
  }

  // 加载更多
  const loadMore = () => {
    if (!loadingRef.current && hasMore && products.length < MAX_PRODUCTS) {
      setPage(prev => prev + 1)
      loadProducts(false)
    }
  }

  // 回到顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 清空筛选条件
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    loadProducts(true, '', '')
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
      {/* 页面标题和快速入口 */}
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
          
          {/* 快速入口按钮 */}
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
            
            {/* 视图切换按钮 */}
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

      {/* 搜索和筛选 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4 md:mb-6"
      >
        <div className="flex flex-col gap-3">
          {/* 搜索框和统计信息 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="搜索商品..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-800 border-2 border-gray-700 focus:border-gold-500 rounded outline-none"
              />
            </div>
            
            {/* 统计信息和清除按钮 */}
            <div className="flex items-center gap-3">
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 bg-red-500/20 text-red-500 rounded text-sm font-bold hover:bg-red-500/30 transition-colors"
                >
                  清除筛选
                </button>
              )}
              <div className="text-sm text-gray-400 whitespace-nowrap">
                已加载 <span className="text-gold-500 font-bold">{products.length}</span> / 
                <span className="text-white font-bold"> {totalCount}</span> 件
                {products.length >= MAX_PRODUCTS && (
                  <span className="text-yellow-500 ml-2">(已达上限)</span>
                )}
              </div>
            </div>
          </div>
          
          {/* 分类筛选 */}
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

      {/* 商品列表 */}
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
          <p className="text-gray-400 text-lg mb-2">没有找到相关商品</p>
          {(searchTerm || selectedCategory) && (
            <p className="text-gray-500 text-sm mb-4">
              试试其他关键词或清除筛选条件
            </p>
          )}
          {(searchTerm || selectedCategory) && (
            <PixelButton onClick={clearFilters} variant="secondary">
              清除筛选
            </PixelButton>
          )}
        </motion.div>
      ) : viewMode === 'grid' ? (
        <>
          {/* 网格视图 */}
          <div className={cn(
            "grid gap-3 md:gap-4 lg:gap-6",
            "grid-cols-2",
            "sm:grid-cols-2",
            "md:grid-cols-3",
            "lg:grid-cols-4",
            "xl:grid-cols-5",
            "2xl:grid-cols-6"
          )}>
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isInitialLoad ? Math.min(index * 0.03, 0.3) : 0 }}
                className="h-full"
              >
                <PixelCard className="overflow-hidden hover:border-gold-500 transition-all h-full flex flex-col p-0">
                  {/* 商品图片 */}
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
                    
                    {/* 标签 */}
                    {product.is_hot && (
                      <div className="absolute top-1 left-1">
                        <span className="bg-red-500 text-white text-[10px] sm:text-xs px-1.5 py-0.5 rounded">
                          热卖
                        </span>
                      </div>
                    )}
                    
                    {/* 支付方式图标 */}
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
                  
                  {/* 商品信息 */}
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
                    
                    {/* 价格和TDB */}
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
          {/* 列表视图 */}
          <div className="space-y-3">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isInitialLoad ? Math.min(index * 0.03, 0.3) : 0 }}
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
      
      {/* 加载更多指示器 */}
      {loadingMore && (
        <div className="text-center py-8">
          <div className="animate-spin text-3xl mb-2">⏳</div>
          <p className="text-gray-400 text-sm">加载更多商品中...</p>
        </div>
      )}
      
      {/* 无限滚动哨兵元素 */}
      {hasMore && !loading && (
        <div ref={sentinelRef} className="h-20" />
      )}
      
      {/* 手动加载更多按钮（作为备选方案） */}
      {hasMore && !loadingMore && products.length < MAX_PRODUCTS && (
        <div className="text-center mt-6">
          <PixelButton
            onClick={loadMore}
            disabled={loadingMore}
            variant="secondary"
            className="text-sm"
          >
            加载更多商品
          </PixelButton>
        </div>
      )}
      
      {/* 已加载完全部商品 */}
      {!hasMore && products.length > 0 && (
        <div className="text-center mt-8 py-4">
          <p className="text-gray-400 text-sm">
            {products.length >= MAX_PRODUCTS 
              ? `已达到最大加载数量 (${MAX_PRODUCTS} 件)`
              : '已加载全部商品'}
          </p>
        </div>
      )}

      {/* 底部说明 */}
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
      
      {/* 回到顶部按钮 */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-gold-500 text-black rounded-full flex items-center justify-center shadow-lg hover:bg-gold-400 transition-colors z-50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-xl">↑</span>
        </motion.button>
      )}
    </div>
  )
}
