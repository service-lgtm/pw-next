'use client'

import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { useState } from 'react'
import { cn } from '@/lib/utils'

// 消费商进化路径
const evolutionPath = [
  {
    stage: '传统消费者',
    icon: '🛒',
    description: '花钱买东西，钱花了就没了',
    features: ['单向消费', '价值流失', '零收益'],
    color: 'gray',
  },
  {
    stage: '觉醒消费者',
    icon: '💡',
    description: '发现平行世界，开始了解消费创富',
    features: ['认知升级', '机会发现', '准备转型'],
    color: 'blue',
  },
  {
    stage: '初级消费商',
    icon: '🌱',
    description: '边消费边赚钱，自用省钱分享赚钱',
    features: ['推荐收益', '被动收入'],
    color: 'green',
  },
  {
    stage: '超级消费商',
    icon: '👑',
    description: '构建消费帝国，躺赚管道收益',
    features: ['自动雇佣', '持续收益', '财富自由'],
    color: 'gold',
  },
]

export function ProsumerSection() {
  const [activeStage, setActiveStage] = useState(2)

  return (
    <section className="py-16 lg:py-24 bg-[#0F0F1E] relative overflow-hidden">
      {/* 背景效果 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-gold-500/10 rounded-full filter blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-[200px] lg:w-[400px] h-[200px] lg:h-[400px] bg-green-500/10 rounded-full filter blur-3xl animate-pulse-slow" />
      </div>

      <Container className="relative z-10">
        {/* 标题区域 */}
        <motion.div
          className="text-center max-w-4xl mx-auto mb-12 lg:mb-20 px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-3 text-gold-500 text-xs lg:text-sm font-bold uppercase tracking-wider mb-4 lg:mb-6">
            <span className="w-6 lg:w-8 h-1 bg-gold-500" />
            <span className="pixel-font">PROSUMER MODEL</span>
            <span className="w-6 lg:w-8 h-1 bg-gold-500" />
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-black leading-tight mb-4 lg:mb-6">
            <span className="block mb-2">从消费者到</span>
            <span className="text-gold-500 pixel-text-shadow">消费商</span>
            <span className="block text-lg md:text-2xl lg:text-3xl mt-2 lg:mt-4 text-gray-300">
              消费创富的财富革命
            </span>
          </h2>
          
          <p className="text-base lg:text-xl text-gray-400 leading-relaxed">
            不改变消费习惯，只改变消费观念
            <br />
            <span className="text-gold-500 font-bold">花原来该花的钱，赚原来赚不到的钱</span>
          </p>
        </motion.div>

        {/* 进化路径 */}
        <div className="mb-16 lg:mb-20">
          <motion.h3
            className="text-xl md:text-2xl lg:text-3xl font-black text-center mb-8 lg:mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            消费商进化之路
          </motion.h3>

          <div className="relative">
            {/* 连接线 - 仅在大屏幕显示 */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-gray-700 via-gold-500 to-gold-500 -translate-y-1/2 hidden lg:block" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative">
              {evolutionPath.map((stage, index) => (
                <motion.div
                  key={stage.stage}
                  className={cn(
                    'pixel-card p-4 lg:p-6 cursor-pointer transition-all duration-300 relative',
                    activeStage === index ? 'border-gold-500 scale-105' : 'border-gray-700',
                    index === 3 && 'md:col-span-2 lg:col-span-1 lg:scale-110'
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActiveStage(index)}
                  whileHover={{ y: -8 }}
                >
                  {index === 3 && (
                    <div className="absolute -top-3 lg:-top-4 left-1/2 -translate-x-1/2 bg-gold-500 text-black px-3 lg:px-4 py-1 text-xs font-black pixel-font whitespace-nowrap">
                      最高阶
                    </div>
                  )}
                  
                  <div className="text-3xl lg:text-5xl mb-2 lg:mb-4 text-center">{stage.icon}</div>
                  <h4 className={cn(
                    'text-base lg:text-lg font-black mb-2 text-center',
                    stage.color === 'gold' ? 'text-gold-500' : 
                    stage.color === 'green' ? 'text-green-500' :
                    stage.color === 'blue' ? 'text-blue-500' : 'text-gray-500'
                  )}>
                    {stage.stage}
                  </h4>
                  <p className="text-xs lg:text-sm text-gray-400 mb-3 lg:mb-4 text-center">
                    {stage.description}
                  </p>
                  <ul className="space-y-1 lg:space-y-2">
                    {stage.features.map((feature) => (
                      <li key={feature} className="text-xs text-gray-500 flex items-center gap-2">
                        <span className={cn(
                          'text-sm lg:text-base',
                          index <= activeStage ? 'text-gold-500' : 'text-gray-600'
                        )}>
                          •
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {/* 进度指示器 - 移动端优化 */}
                  {index < 3 && (
                    <motion.div
                      className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xl lg:hidden"
                      animate={{ y: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ↓
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* 核心价值 */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16 lg:mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="pixel-card p-6 lg:p-8 text-center">
            <div className="text-4xl lg:text-6xl mb-3 lg:mb-4">💰</div>
            <h3 className="text-lg lg:text-xl font-black text-gold-500 mb-3 lg:mb-4">消费即投资</h3>
            <p className="text-sm lg:text-base text-gray-400">
              每一笔消费都是投资<br />
              购买NFT资产增值<br />
              提货单分红可提现
            </p>
          </div>
          
          <div className="pixel-card p-6 lg:p-8 text-center">
            <div className="text-4xl lg:text-6xl mb-3 lg:mb-4">🔗</div>
            <h3 className="text-lg lg:text-xl font-black text-gold-500 mb-3 lg:mb-4">分享即收益</h3>
            <p className="text-sm lg:text-base text-gray-400">
              推荐好友为你打工<br />
              自动雇佣持续获利<br />
              管道收入睡后收益
            </p>
          </div>
          
          <div className="pixel-card p-6 lg:p-8 text-center">
            <div className="text-4xl lg:text-6xl mb-3 lg:mb-4">📈</div>
            <h3 className="text-lg lg:text-xl font-black text-gold-500 mb-3 lg:mb-4">成长即财富</h3>
            <p className="text-sm lg:text-base text-gray-400">
              等级越高收益越多<br />
              雇佣员工裂变指数增长<br />
              实现真正财富自由
            </p>
          </div>
        </motion.div>

        
      </Container>
    </section>
  )
}
