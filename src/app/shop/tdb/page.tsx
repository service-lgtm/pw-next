// src/app/shop/tdb/page.tsx
// TDB商品浏览页面 - 完整生产版本
// 功能：商品列表展示、搜索筛选、购买入口、提货单管理入口

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
 * TDB商城主页面组件
 * 
 * 主要功能：
 * 1. 商品列表展示 - 支持分页加载
 * 2. 商品搜索和分类筛选
 * 3. 快速入口 - 我的提货单、提货申请、兑换记录
 * 4. 购买跳转 - 跳转到支付页面
 * 
 * API接口：
 * - GET /api/v1/shop/products/ - 获取商品列表
 * 
 * 相关页面：
 * - /shop/tickets - 我的提货单列表
 * - /shop/pickup - 提货申请列表
 * - /shop/exchange - 兑换记录列表
 * - /shop/tdb/payment - 支付页面
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
  
  // 用户提货单统计（可选，需要额外API）
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
        page_size: 12,
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

  // 加载用户提货单统计（可选功能）
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
    // 跳转到支付页面
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* 页面标题和快速入口 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        {/* 顶部导航栏 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white self-start"
          >
            ← 返回
          </button>
          
          {/* 快速入口按钮组 - 桌面端 */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => router.push('/shop/tickets')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors group"
            >
              <span className="text-lg">📦</span>
              <span className="text-sm font-bold">我的提货单</span>
              {userStats.pendingCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {userStats.pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => router.push('/shop/pickup')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span className="text-lg">🚚</span>
              <span className="text-sm font-bold">提货申请</span>
            </button>
            <button
              onClick={() => router.push('/shop/exchange')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span className="text-lg">💱</span>
              <span className="text-sm font-bold">兑换记录</span>
            </button>
          </div>
        </div>

        {/* 页面标题 */}
        <h1 className="text-2xl md:text-3xl font-black text-white">
          TDB 积分商城
        </h1>
        <p className="text-gray-400 mt-2">
          购买实物商品，获得对应TDB积分
        </p>
      </motion.div>

      {/* 移动端快速入口卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="md:hidden mb-6"
      >
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => router.push('/shop/tickets')}
            className="relative bg-gray-800 hover:bg-gray-700 rounded-lg p-3 transition-colors"
          >
            <div className="text-2xl mb-1">📦</div>
            <div className="text-xs font-bold">我的提货单</div>
            {userStats.pendingCount > 0 && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {userStats.pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => router.push('/shop/pickup')}
            className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 transition-colors"
          >
            <div className="text-2xl mb-1">🚚</div>
            <div className="text-xs font-bold">提货申请</div>
          </button>
          <button
            onClick={() => router.push('/shop/exchange')}
            className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 transition-colors"
          >
            <div className="text-2xl mb-1">💱</div>
            <div className="text-xs font-bold">兑换记录</div>
          </button>
        </div>
      </motion.div>

      {/* 搜索和筛选 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜索商品..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 focus:border-gold-500 rounded outline-none"
            />
          </div>
          
          {/* 分类筛选 */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === '全部' ? '' : category)}
                className={cn(
                  "px-4 py-2 rounded font-bold transition-all",
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
          <p className="text-gray-400 text-lg">没有找到相关商品</p>
        </motion.div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => {
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.3) }}
                >
                  <PixelCard className="overflow-hidden hover:border-gold-500 transition-all h-full flex flex-col">
                    {/* 商品图片 */}
                    <div className="aspect-square bg-gray-800 relative overflow-hidden group">
                      {product.primary_image || product.images?.[0] ? (
                        <img
                          src={product.primary_image || product.images?.[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const img = e.currentTarget
                            img.style.display = 'none'
                            const fallback = document.createElement('div')
                            fallback.className = 'w-full h-full flex items-center justify-center text-6xl opacity-20'
                            fallback.textContent = '📦'
                            if (img.parentElement && !img.parentElement.querySelector('div')) {
                              img.parentElement.appendChild(fallback)
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">
                          📦
                        </div>
                      )}
                      
                      {/* 标签 */}
                      <div className="absolute top-2 left-2 flex gap-2">
                        {product.is_hot && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                            热卖
                          </span>
                        )}
                      </div>
                      
                      {/* 支付方式 */}
                      {product.payment_methods && product.payment_methods.length > 0 && (
                        <div className="absolute bottom-2 right-2 flex gap-1">
                          {product.payment_methods.includes('alipay') && (
                            <span className="bg-blue-500/80 text-white text-xs px-2 py-1 rounded">支付宝</span>
                          )}
                          {product.payment_methods.includes('wechat') && (
                            <span className="bg-green-500/80 text-white text-xs px-2 py-1 rounded">微信</span>
                          )}
                          {product.payment_methods.includes('bank') && (
                            <span className="bg-gray-600/80 text-white text-xs px-2 py-1 rounded">银行</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* 商品信息 */}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2">{product.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">分类：{product.category}</span>
                        </div>
                      </div>
                      
                      {/* 价格和TDB */}
                      <div className="border-t border-gray-700 pt-3 mt-3">
                        <div className="flex items-end justify-between mb-3">
                          <div>
                            <p className="text-xs text-gray-400">购买价格</p>
                            <p className="text-2xl font-bold text-white">
                              ¥{parseFloat(product.price).toFixed(2)}
                            </p>
                            {product.market_value && (
                              <p className="text-xs text-gray-500 mt-1">
                                价值：¥{parseFloat(product.market_value).toFixed(2)}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">获得TDB</p>
                            <p className="text-xl font-bold text-gold-500">
                              {parseFloat(product.tdb_amount).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <PixelButton
                          className="w-full"
                          onClick={() => handlePurchase(product)}
                        >
                          立即购买
                        </PixelButton>
                      </div>
                    </div>
                  </PixelCard>
                </motion.div>
              )
            })}
          </div>
          
          {/* 加载更多 */}
          {hasMore && (
            <div className="text-center mt-8">
              <PixelButton
                onClick={loadMore}
                disabled={loading}
                variant="secondary"
              >
                {loading ? '加载中...' : '加载更多'}
              </PixelButton>
            </div>
          )}
          
          {/* 显示总数 */}
          <p className="text-center text-gray-400 text-sm mt-4">
            共 {totalCount} 件商品，已加载 {products.length} 件
          </p>
        </>
      )}

      {/* 底部说明 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12"
      >
        <PixelCard className="p-6 bg-gold-500/10 border-gold-500/30">
          <h3 className="text-lg font-bold mb-3 text-gold-500">购买说明</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-gold-500 mt-1">•</span>
              <span>所有商品均为实物商品</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-500 mt-1">•</span>
              <span>支付成功并审核通过后，对应的TDB通证会立即到账</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-500 mt-1">•</span>
              <span>如需退换货，请在收货后7天内联系客服</span>
            </li>
          </ul>
        </PixelCard>
      </motion.div>
    </div>
  )
}
