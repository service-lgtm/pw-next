// src/app/shop/tdb/page.tsx
// TDB商品浏览页面

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

// 商品类型
interface Product {
  id: string
  name: string
  description: string
  price: number
  tdbAmount: number // 对应的TDB数量
  image: string
  stock: number
  category: string
  isHot?: boolean
  discount?: number
}

// 模拟的商品数据（实际应从后端获取）
const mockProducts: Product[] = [
  {
    id: 'gold-coin-100',
    name: '黄金纪念币 - 平行世界开服限定版',
    description: '限量发行的平行世界开服纪念币，采用999纯金打造，重1克，附带收藏证书',
    price: 500,
    tdbAmount: 100,
    image: '/images/products/gold-coin-100.jpg',
    stock: 100,
    category: '纪念币',
    isHot: true,
  },
  {
    id: 'silver-coin-500',
    name: '银质纪念币套装（5枚）',
    description: '平行世界五大区域主题银币套装，每枚重10克，配精美收藏盒',
    price: 800,
    tdbAmount: 500,
    image: '/images/products/silver-coin-set.jpg',
    stock: 50,
    category: '纪念币',
  },
  {
    id: 'crystal-trophy-1000',
    name: '水晶奖杯 - 数字先锋',
    description: '高级水晶材质，激光内雕平行世界logo，高度30cm，底座可定制刻字',
    price: 1500,
    tdbAmount: 1000,
    image: '/images/products/crystal-trophy.jpg',
    stock: 30,
    category: '奖杯',
    isHot: true,
  },
  {
    id: 'art-painting-5000',
    name: '限量版数字艺术画作',
    description: '知名数字艺术家创作的平行世界主题画作，限量100幅，附艺术家签名证书',
    price: 5000,
    tdbAmount: 5000,
    image: '/images/products/art-painting.jpg',
    stock: 20,
    category: '艺术品',
    discount: 10,
  },
  {
    id: 'luxury-watch-10000',
    name: '瑞士机械手表 - 平行世界定制款',
    description: '瑞士原装机芯，表盘镶嵌平行世界元素，全球限量500只',
    price: 12000,
    tdbAmount: 10000,
    image: '/images/products/luxury-watch.jpg',
    stock: 10,
    category: '手表',
  },
  {
    id: 'gold-bar-50000',
    name: '投资金条 50克',
    description: '999.9纯金，国际认证，附平行世界专属防伪标识',
    price: 25000,
    tdbAmount: 50000,
    image: '/images/products/gold-bar.jpg',
    stock: 5,
    category: '黄金',
    discount: 5,
  },
]

// 商品分类
const categories = ['全部', '纪念币', '奖杯', '艺术品', '手表', '黄金']

export default function TDBShopPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [searchTerm, setSearchTerm] = useState('')

  // 检查认证状态
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录')
      router.push('/login?redirect=/shop/tdb')
    }
  }, [authLoading, isAuthenticated, router])

  // 加载商品列表
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        // TODO: 从后端加载商品列表
        // const response = await api.shop.getProducts()
        // setProducts(response.data)
        
        // 模拟加载延迟
        await new Promise(resolve => setTimeout(resolve, 500))
        setProducts(mockProducts)
      } catch (error) {
        toast.error('加载商品失败')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      loadProducts()
    }
  }, [isAuthenticated])

  // 过滤商品
  const filteredProducts = products.filter(product => {
    const matchCategory = selectedCategory === '全部' || product.category === selectedCategory
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       product.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchCategory && matchSearch
  })

  // 处理购买
  const handlePurchase = (product: Product) => {
    if (product.stock === 0) {
      toast.error('商品已售罄')
      return
    }
    
    // 跳转到支付页面
    router.push(`/shop/tdb/payment?productId=${product.id}`)
  }

  if (authLoading || loading) {
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
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white"
          >
            ← 返回
          </button>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white">
          TDB 积分商城
        </h1>
        <p className="text-gray-400 mt-2">
          购买实物商品，获得对应TDB积分
        </p>
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
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 rounded font-bold transition-all",
                  selectedCategory === category
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
      {filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <p className="text-gray-400 text-lg">没有找到相关商品</p>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <PixelCard className="overflow-hidden hover:border-gold-500 transition-all h-full flex flex-col">
                {/* 商品图片 */}
                <div className="aspect-square bg-gray-800 relative overflow-hidden group">
                  {/* 模拟图片占位 */}
                  <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">
                    📦
                  </div>
                  
                  {/* 标签 */}
                  <div className="absolute top-2 left-2 flex gap-2">
                    {product.isHot && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                        热卖
                      </span>
                    )}
                    {product.discount && (
                      <span className="bg-gold-500 text-black text-xs px-2 py-1 rounded">
                        {product.discount}% OFF
                      </span>
                    )}
                  </div>
                  
                  {/* 库存状态 */}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <p className="text-white font-bold text-lg">已售罄</p>
                    </div>
                  )}
                </div>
                
                {/* 商品信息 */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{product.description}</p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">分类：{product.category}</span>
                      <span className="text-xs text-gray-500">库存：{product.stock}</span>
                    </div>
                  </div>
                  
                  {/* 价格和TDB */}
                  <div className="border-t border-gray-700 pt-3 mt-3">
                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-400">商品价格</p>
                        <p className="text-2xl font-bold text-white">
                          ¥{product.discount 
                            ? (product.price * (100 - product.discount) / 100).toFixed(0)
                            : product.price
                          }
                          {product.discount && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              ¥{product.price}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">获得TDB</p>
                        <p className="text-xl font-bold text-gold-500">
                          {product.tdbAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <PixelButton
                      className="w-full"
                      onClick={() => handlePurchase(product)}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? '已售罄' : '立即购买'}
                    </PixelButton>
                  </div>
                </div>
              </PixelCard>
            </motion.div>
          ))}
        </div>
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
              <span>所有商品均为实物商品，购买后需要填写收货地址</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-500 mt-1">•</span>
              <span>支付成功并确认收货地址后，对应的TDB积分会立即到账</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-500 mt-1">•</span>
              <span>商品将在3-7个工作日内发货，可在订单中心查看物流信息</span>
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
