'use client'

import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { PixelEarth } from '@/components/graphics/PixelEarth'

const features = [
  {
    icon: '⛓️',
    title: '分配规则刻在链上',
    description: '智能合约自动执行，公平透明永不篡改'
  },
  {
    icon: '🛰️',
    title: '北斗定位映射现实',
    description: '每一寸数字土地精准对应真实地理坐标'
  },
  {
    icon: '🔥',
    title: '金木水火土五维算法',
    description: '付出多少就得钞票💰多少，区块链记账绝不作假'
  },
  {
    icon: '💎',
    title: '金本位价值支撑',
    description: '每一枚代币都有真金白银支撑，稳定可靠'
  }
]

const stats = [
  { label: '总锁仓价值', value: '¥120M', change: '+12.5%' },
  { label: '数字公民', value: '50K+', change: '+8.3%' },
  { label: '黄金储备', value: '1,250kg', change: '+25kg' },
  { label: '系统稳定性', value: '99.9%', change: '24/7' },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden">
      <Container>
        <div className="relative z-10">
          {/* 认证徽章 */}
          <motion.div
            className="flex flex-wrap gap-4 justify-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="pixel-card inline-flex items-center gap-3 px-6 py-3">
              <span className="text-2xl">🪪</span>
              <span className="font-bold text-gold-500">特批虚拟币资产双牌照</span>
            </div>
            <div className="pixel-card inline-flex items-center gap-3 px-6 py-3">
              <span className="text-2xl">🏆</span>
              <span className="font-bold text-gold-500">通证经济001号示范单位</span>
            </div>
          </motion.div>

          {/* 主标题 */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="block text-white pixel-text-shadow">
                持证"印钞"不玩虚的
              </span>
              <span className="block text-gold-500 pixel-font text-3xl md:text-5xl mt-4 pixel-text-shadow">
                数字资产 实在价值
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto font-bold">
              全球首个基于北斗定位的区块链资产平台
              <br />
              <span className="text-gold-500 pixel-font text-base md:text-lg block mt-2">
                付出多少就得钞票💰多少，区块链记账绝不作假
              </span>
            </p>
          </motion.div>

          {/* 3D像素地球 */}
          <motion.div
            className="relative h-[400px] md:h-[500px] mb-16"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <PixelEarth />
          </motion.div>

          {/* 核心特性 */}
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="pixel-card hover:translate-y-[-8px] transition-transform duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                whileHover={{ 
                  boxShadow: '8px 8px 0 0 rgba(255, 215, 0, 0.3), 16px 16px 0 0 rgba(0, 0, 0, 0.2)'
                }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-black mb-2 text-gold-500">{feature.title}</h3>
                <p className="text-sm text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA按钮 */}
          <motion.div
            className="flex flex-wrap gap-6 justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <motion.button
              className="pixel-btn text-lg px-10 py-5 flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>🚀</span>
              <span>立即体验</span>
            </motion.button>
            <motion.button
              className="relative px-10 py-5 font-bold text-lg text-gold-500 transition-all duration-100"
              style={{
                border: '4px solid #FFD700',
                boxShadow: '0 4px 0 0 #DAA520, 0 8px 0 0 rgba(0, 0, 0, 0.3)'
              }}
              whileHover={{ 
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 0 0 #DAA520, 0 10px 0 0 rgba(0, 0, 0, 0.3)'
              }}
              whileTap={{ 
                transform: 'translateY(0)',
                boxShadow: '0 4px 0 0 #DAA520, 0 8px 0 0 rgba(0, 0, 0, 0.3)'
              }}
            >
              <span>📖</span>
              <span className="ml-2">了解更多</span>
            </motion.button>
          </motion.div>

          {/* 实时数据 */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center p-6 pixel-border"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.1 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl md:text-3xl font-black text-gold-500 pixel-font mb-2">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  {stat.label}
                </div>
                <div className="text-xs text-green-400 font-bold mt-1 pixel-font">
                  {stat.change}
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
          <span className="text-xs uppercase tracking-wider pixel-font">SCROLL</span>
          <div className="w-6 h-8 border-2 border-gray-500 rounded-sm flex justify-center">
            <motion.div
              className="w-1 h-2 bg-gray-500 rounded-sm mt-1"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  )
}
