// src/app/explore/page.tsx
// 世界地图入口页面

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRegions } from '@/hooks/useRegions'
import { Globe, MapPin, TrendingUp, Users, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ExplorePage() {
  const { regions, loading, error } = useRegions({
    regionType: 'continent',
    isActive: true,
    isOpenForSale: true,
  })
  
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
  
  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0F1B] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    )
  }
  
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
            探索世界各地的数字土地，把握投资机会
          </p>
        </motion.div>
        
        {/* 区域网格 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regions.map((region, index) => (
            <RegionCard key={region.id} region={region} index={index} />
          ))}
        </div>
        
        {/* 空状态 */}
        {regions.length === 0 && (
          <div className="text-center py-20">
            <Globe className="w-24 h-24 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400">暂无开放区域</p>
          </div>
        )}
      </div>
    </div>
  )
}

function RegionCard({ region, index }: { region: any; index: number }) {
  const isOpen = region.is_open_for_sale
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={isOpen ? `/explore/regions/${region.id}` : '#'}>
        <div className={cn(
          "relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border overflow-hidden group cursor-pointer transition-all",
          isOpen ? "border-gold-500/50 hover:border-gold-500" : "border-gray-700 opacity-75"
        )}>
          {/* 顶部标签 */}
          <div className={cn(
            "absolute top-0 left-0 right-0 h-1",
            isOpen ? "bg-gradient-to-r from-gold-500 to-yellow-500" : "bg-gray-700"
          )} />
          
          <div className="p-6">
            {/* 区域信息 */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{region.name}</h3>
                <p className="text-sm text-gray-400">{region.code}</p>
              </div>
              {isOpen ? (
                <div className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-xs font-bold">
                  已开放
                </div>
              ) : (
                <div className="bg-gray-700/50 text-gray-400 px-3 py-1 rounded-full text-xs font-bold">
                  未开放
                </div>
              )}
            </div>
            
            {/* 统计数据 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <MapPin className="w-4 h-4 text-gray-400 mb-1" />
                <p className="text-lg font-bold">{region.total_lands || 0}</p>
                <p className="text-xs text-gray-400">总地块</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <TrendingUp className="w-4 h-4 text-gray-400 mb-1" />
                <p className="text-lg font-bold text-green-500">
                  {region.available_lands || 0}
                </p>
                <p className="text-xs text-gray-400">可购买</p>
              </div>
            </div>
            
            {/* 进入按钮 */}
            <div className={cn(
              "text-center py-2 rounded-lg font-medium transition-all",
              isOpen 
                ? "bg-gradient-to-r from-gold-500 to-yellow-600 text-black group-hover:shadow-lg group-hover:shadow-gold-500/25"
                : "bg-gray-700 text-gray-400"
            )}>
              {isOpen ? '进入区域' : '即将开放'}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
