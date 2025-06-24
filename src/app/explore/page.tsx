'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, Sparkles, Globe, Lock, Clock, 
  TrendingUp, Users, MapPin, Zap, Star,
  ChevronRight, Info, Calendar
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// 类型定义
interface Region {
  id: string
  name: string
  nameEn: string
  emoji: string
  status: 'open' | 'coming' | 'planned'
  openDate?: string
  description: string
  highlights: string[]
  stats?: {
    cities: number
    lands: number
    avgPrice: number
    activeUsers: number
  }
  order: number
}

// 区域数据
const REGIONS_DATA: Region[] = [
  {
    id: 'china',
    name: '中国',
    nameEn: 'China',
    emoji: '🇨🇳',
    status: 'open',
    description: '平行世界首个开放区域，探索数字地产新机遇',
    highlights: [
      '12个主要城市已开放',
      '58,900个地块总量',
      '实时交易市场',
      '完善的基础设施'
    ],
    stats: {
      cities: 12,
      lands: 58900,
      avgPrice: 25888,
      activeUsers: 3456
    },
    order: 1
  },
  {
    id: 'singapore',
    name: '新加坡',
    nameEn: 'Singapore',
    emoji: '🇸🇬',
    status: 'coming',
    openDate: '2024年2月',
    description: '亚洲金融中心，即将开放',
    highlights: [
      '金融科技中心',
      '国际贸易枢纽',
      '高价值地产',
      '限量供应'
    ],
    order: 2
  },
  {
    id: 'japan',
    name: '日本',
    nameEn: 'Japan',
    emoji: '🇯🇵',
    status: 'coming',
    openDate: '2024年3月',
    description: '科技与文化的完美融合',
    highlights: [
      '东京都市圈',
      '大阪商业区',
      '京都文化遗产',
      '科技创新基地'
    ],
    order: 3
  },
  {
    id: 'usa',
    name: '美国',
    nameEn: 'USA',
    emoji: '🇺🇸',
    status: 'planned',
    openDate: '2024年Q2',
    description: '全球最大经济体',
    highlights: [
      '纽约金融中心',
      '硅谷科技园',
      '洛杉矶娱乐业',
      '多元化投资'
    ],
    order: 4
  },
  {
    id: 'uk',
    name: '英国',
    nameEn: 'United Kingdom',
    emoji: '🇬🇧',
    status: 'planned',
    openDate: '2024年Q3',
    description: '欧洲金融门户',
    highlights: [
      '伦敦金融城',
      '历史文化资产',
      '教育产业',
      '创意产业'
    ],
    order: 5
  },
  {
    id: 'germany',
    name: '德国',
    nameEn: 'Germany',
    emoji: '🇩🇪',
    status: 'planned',
    openDate: '2024年Q3',
    description: '欧洲工业强国',
    highlights: [
      '制造业中心',
      '汽车工业',
      '绿色能源',
      '研发基地'
    ],
    order: 6
  }
]

// 开放的中国区域卡片
function OpenRegionCard({ region }: { region: Region }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 背景光效 */}
      <div className="absolute inset-0 bg-gradient-to-r from-gold-500/20 to-red-500/20 blur-3xl" />
      
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-gold-500/50 overflow-hidden">
        {/* 顶部标签 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 to-red-500" />
        
        {/* 热门标记 */}
        <div className="absolute top-6 right-6 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
          <Zap className="w-4 h-4" />
          现已开放
        </div>

        <div className="p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* 左侧信息 */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                <span className="text-7xl">{region.emoji}</span>
                <div>
                  <h2 className="text-4xl font-bold text-white mb-2">{region.name}</h2>
                  <p className="text-xl text-gray-400">{region.nameEn}</p>
                </div>
              </div>
              
              <p className="text-lg text-gray-300 mb-8 max-w-md">
                {region.description}
              </p>

              {/* 特色列表 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {region.highlights.map((highlight, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-2 text-gray-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Star className="w-4 h-4 text-gold-500" />
                    <span>{highlight}</span>
                  </motion.div>
                ))}
              </div>

              {/* 进入按钮 */}
              <Link href="/explore/china">
                <motion.button
                  className="group relative bg-gradient-to-r from-gold-500 to-yellow-600 text-black px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    进入中国区域
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-gold-400"
                    initial={{ x: '100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </Link>
            </div>

            {/* 右侧统计 */}
            {region.stats && (
              <div className="grid grid-cols-2 gap-4 lg:w-96">
                <motion.div
                  className="bg-gray-800/50 backdrop-blur p-6 rounded-2xl border border-gray-700"
                  whileHover={{ scale: 1.05 }}
                >
                  <MapPin className="w-8 h-8 text-gold-500 mb-3" />
                  <p className="text-3xl font-bold text-white">{region.stats.cities}</p>
                  <p className="text-sm text-gray-400">开放城市</p>
                </motion.div>
                <motion.div
                  className="bg-gray-800/50 backdrop-blur p-6 rounded-2xl border border-gray-700"
                  whileHover={{ scale: 1.05 }}
                >
                  <Globe className="w-8 h-8 text-blue-500 mb-3" />
                  <p className="text-3xl font-bold text-white">{region.stats.lands.toLocaleString()}</p>
                  <p className="text-sm text-gray-400">总地块数</p>
                </motion.div>
                <motion.div
                  className="bg-gray-800/50 backdrop-blur p-6 rounded-2xl border border-gray-700"
                  whileHover={{ scale: 1.05 }}
                >
                  <TrendingUp className="w-8 h-8 text-green-500 mb-3" />
                  <p className="text-3xl font-bold text-white">¥{(region.stats.avgPrice/1000).toFixed(0)}k</p>
                  <p className="text-sm text-gray-400">平均价格</p>
                </motion.div>
                <motion.div
                  className="bg-gray-800/50 backdrop-blur p-6 rounded-2xl border border-gray-700"
                  whileHover={{ scale: 1.05 }}
                >
                  <Users className="w-8 h-8 text-purple-500 mb-3" />
                  <p className="text-3xl font-bold text-white">{region.stats.activeUsers.toLocaleString()}</p>
                  <p className="text-sm text-gray-400">活跃用户</p>
                </motion.div>
              </div>
            )}
          </div>
        </div>

        {/* 底部装饰 */}
        <div className="h-24 bg-gradient-to-t from-black/50 to-transparent flex items-center justify-center">
          <motion.p
            className="text-gray-400 text-sm"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 inline mr-1" />
            实时更新 · 24小时交易 · 全球用户
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}

// 即将开放区域卡片
function ComingRegionCard({ region, index }: { region: Region; index: number }) {
  return (
    <motion.div
      className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur rounded-2xl border border-gray-700 p-6 overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, borderColor: 'rgb(59, 130, 246)' }}
    >
      {/* 状态标签 */}
      <div className="absolute top-4 right-4">
        {region.status === 'coming' ? (
          <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            即将开放
          </div>
        ) : (
          <div className="bg-gray-700/50 text-gray-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            计划中
          </div>
        )}
      </div>

      <div className="flex items-start gap-4">
        <span className="text-5xl opacity-50 group-hover:opacity-100 transition-opacity">
          {region.emoji}
        </span>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1">{region.name}</h3>
          <p className="text-sm text-gray-500 mb-3">{region.description}</p>
          
          {region.openDate && (
            <p className="text-sm font-medium text-blue-400">
              预计开放：{region.openDate}
            </p>
          )}

          {/* 特色预览 */}
          <div className="mt-4 space-y-1">
            {region.highlights.slice(0, 2).map((highlight, i) => (
              <p key={i} className="text-xs text-gray-500 flex items-center gap-1">
                <ChevronRight className="w-3 h-3" />
                {highlight}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* 锁定遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent pointer-events-none" />
      
      {/* 悬浮时显示"敬请期待" */}
      <motion.div
        className="absolute inset-0 bg-gray-900/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        initial={false}
      >
        <div className="text-center">
          <Lock className="w-12 h-12 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-400 font-medium">敬请期待</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

// 开发路线图
function Roadmap() {
  const quarters = [
    { quarter: 'Q1 2024', status: 'active', label: '中国区域上线' },
    { quarter: 'Q2 2024', status: 'upcoming', label: '亚太扩展' },
    { quarter: 'Q3 2024', status: 'planned', label: '欧美开放' },
    { quarter: 'Q4 2024', status: 'planned', label: '全球覆盖' }
  ]

  return (
    <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-8 border border-gray-800">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Globe className="w-6 h-6 text-gold-500" />
        全球扩展计划
      </h3>
      
      <div className="relative">
        {/* 时间线 */}
        <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-800 -translate-y-1/2" />
        
        <div className="relative grid grid-cols-4 gap-4">
          {quarters.map((quarter, index) => (
            <div key={index} className="text-center">
              <motion.div
                className={cn(
                  "w-4 h-4 rounded-full mx-auto mb-3 relative z-10",
                  quarter.status === 'active' ? 'bg-gold-500' :
                  quarter.status === 'upcoming' ? 'bg-blue-500' : 'bg-gray-600'
                )}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {quarter.status === 'active' && (
                  <motion.div
                    className="absolute inset-0 bg-gold-500 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
              <p className="text-sm font-medium text-white">{quarter.quarter}</p>
              <p className="text-xs text-gray-500 mt-1">{quarter.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 主组件
export default function WorldMapPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const openRegion = REGIONS_DATA.find(r => r.status === 'open')
  const upcomingRegions = REGIONS_DATA.filter(r => r.status !== 'open')

  return (
    <div className="min-h-screen bg-[#0A0F1B]">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* 顶部导航 */}
      <div className="relative border-b border-gray-800 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gold-500 to-yellow-500 bg-clip-text text-transparent">
                平行世界
              </h1>
              <p className="text-sm text-gray-400 mt-1">选择您的数字地产投资区域</p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                <Info className="w-4 h-4" />
                <span>全球逐步开放中</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="relative container mx-auto px-4 py-12">
        {/* 标题区 */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            开启您的全球数字地产之旅
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            平行世界正在全球范围内逐步开放，中国区域已率先上线，
            更多精彩区域即将到来
          </p>
        </motion.div>

        {/* 开放区域 */}
        {openRegion && (
          <div className="mb-16">
            <OpenRegionCard region={openRegion} />
          </div>
        )}

        {/* 即将开放区域 */}
        <div className="mb-16">
          <motion.h3
            className="text-2xl font-bold text-white mb-8 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Clock className="w-6 h-6 text-blue-500" />
            即将开放
          </motion.h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingRegions.map((region, index) => (
              <ComingRegionCard key={region.id} region={region} index={index} />
            ))}
          </div>
        </div>

        {/* 路线图 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Roadmap />
        </motion.div>

        {/* 底部CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-gray-400 mb-4">
            准备好开始了吗？
          </p>
          <Link href="/explore/china">
            <motion.button
              className="bg-gradient-to-r from-gold-500 to-yellow-600 text-black px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-gold-500/25 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              立即进入中国区域
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
