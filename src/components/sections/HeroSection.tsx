'use client'

import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { ArrowDownIcon, Shield, Satellite, Coins } from 'lucide-react'

const stats = [
  { label: '总锁仓价值', value: 120000000, prefix: '¥', change: 12.5 },
  { label: '黄金储备', value: 1250, suffix: 'kg', change: 25 },
  { label: '活跃用户', value: 50000, suffix: '+', change: 8.3 },
]

const features = [
  {
    icon: '⛓️',
    title: '分配规则刻在链上',
    description: '智能合约自动执行，公平透明不可篡改'
  },
  {
    icon: '🛰️',
    title: '北斗定位映射现实',
    description: '每一寸数字土地对应真实地理坐标'
  },
  {
    icon: '🔥',
    title: '金木水火土五维算法',
    description: '付出多少就得钞票多少，区块链记账绝不作假'
  },
  {
    icon: '🪪',
    title: '持证"印钞"不玩虚的',
    description: '特批虚拟币资产双牌照（发行+交易）'
  }
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-20">
      {/* 像素网格背景 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(247, 147, 26, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(247, 147, 26, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <Container>
        <div className="relative z-10">
          {/* 顶部徽章 */}
          <motion.div
            className="flex flex-wrap gap-4 justify-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/30 rounded-full text-sm font-semibold text-gold-500">
              <Shield className="w-4 h-4" />
              通证经济001号示范单位
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-sm font-semibold text-green-500">
              <Coins className="w-4 h-4" />
              特批双牌照资质
            </span>
          </motion.div>

          {/* 主标题 */}
          <motion.div
            className="text-center max-w-5xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
              <span className="block text-white">重新定义</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
                数字资产所有权
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              全球首个基于北斗定位的区块链资产平台
              <br />
              <span className="text-gold-500 font-semibold">金木水火土五维算法，付出多少得钞票多少</span>
            </p>
          </motion.div>

          {/* 核心特性网格 */}
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="p-6 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg hover:border-gold-500/50 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA按钮 */}
          <motion.div
            className="flex flex-wrap gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button size="lg" className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black">
              🚀 立即体验
            </Button>
            <Button size="lg" variant="secondary">
              📖 了解更多
            </Button>
          </motion.div>

          {/* 实时数据 */}
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center p-6 bg-gray-900/30 backdrop-blur-sm rounded-lg border border-gray-800"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-mono font-bold text-gold-500 mb-2">
                  {stat.prefix}
                  {stat.value.toLocaleString()}
                  {stat.suffix}
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</div>
                <div className="text-sm text-green-500 font-mono mt-1">
                  {formatPercent(stat.change)}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Container>

      {/* 滚动指示器 */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-wider">向下滚动探索更多</span>
          <ArrowDownIcon className="w-5 h-5" />
        </div>
      </motion.div>
    </section>
  )
}
