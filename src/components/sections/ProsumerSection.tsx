'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
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
    features: ['消费返利', '推荐收益', '被动收入'],
    color: 'green',
  },
  {
    stage: '超级消费商',
    icon: '👑',
    description: '构建消费帝国，躺赚管道收益',
    features: ['团队裂变', '持续收益', '财富自由'],
    color: 'gold',
  },
]

// 收益计算器数据
const incomeCalculator = {
  personal: { consumption: 5000, cashback: 10, referral: 18 },
  team: [
    { level: 1, people: 10, avgConsumption: 3000, rate: 10 },
    { level: 2, people: 50, avgConsumption: 2000, rate: 5 },
    { level: 3, people: 200, avgConsumption: 1000, rate: 3 },
  ],
}

// 成功案例
const successStories = [
  {
    name: '王姐',
    avatar: '👩',
    title: '全职妈妈变身消费商领袖',
    story: '从月消费5000到月收入50000+',
    achievement: '6个月发展300+消费商团队',
    quote: '我只是把好东西分享给了需要的人',
  },
  {
    name: '李总',
    avatar: '👨‍💼',
    title: '企业家的第二事业',
    story: '副业收入超越主业',
    achievement: '打造千人消费商社群',
    quote: '这是最轻松的创业方式',
  },
  {
    name: '小张',
    avatar: '👦',
    title: '95后的财富密码',
    story: '大学毕业即财富自由',
    achievement: '月入六位数，全款买房',
    quote: '选择比努力更重要',
  },
]

export function ProsumerSection() {
  const [activeStage, setActiveStage] = useState(2)
  const [calculatorActive, setCalculatorActive] = useState(false)

  // 计算预估收益
  const calculateIncome = () => {
    const personal = incomeCalculator.personal.consumption * 
                    (incomeCalculator.personal.cashback / 100) +
                    incomeCalculator.personal.consumption * 
                    (incomeCalculator.personal.referral / 100)
    
    const team = incomeCalculator.team.reduce((sum, level) => {
      return sum + (level.people * level.avgConsumption * level.rate / 100)
    }, 0)
    
    return {
      personal: Math.floor(personal),
      team: Math.floor(team),
      total: Math.floor(personal + team),
    }
  }

  const income = calculateIncome()

  return (
    <section className="py-24 lg:py-32 bg-[#0F0F1E] relative overflow-hidden">
      {/* 背景效果 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/10 rounded-full filter blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-500/10 rounded-full filter blur-3xl animate-pulse-slow" />
      </div>

      <Container className="relative z-10">
        {/* 标题区域 */}
        <motion.div
          className="text-center max-w-4xl mx-auto mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-3 text-gold-500 text-sm font-bold uppercase tracking-wider mb-6">
            <span className="w-8 h-1 bg-gold-500" />
            <span className="pixel-font">PROSUMER MODEL</span>
            <span className="w-8 h-1 bg-gold-500" />
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
            <span className="block mb-2">从消费者到</span>
            <span className="text-gold-500 pixel-text-shadow">消费商</span>
            <span className="block text-2xl md:text-3xl mt-4 text-gray-300">
              消费创富的财富革命
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
            不改变消费习惯，只改变消费观念
            <br />
            <span className="text-gold-500 font-bold">花原来该花的钱，赚原来赚不到的钱</span>
          </p>
        </motion.div>

        {/* 进化路径 */}
        <div className="mb-20">
          <motion.h3
            className="text-2xl md:text-3xl font-black text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            消费商进化之路
          </motion.h3>

          <div className="relative">
            {/* 连接线 */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-gray-700 via-gold-500 to-gold-500 -translate-y-1/2 hidden md:block" />
            
            <div className="grid md:grid-cols-4 gap-8 relative">
              {evolutionPath.map((stage, index) => (
                <motion.div
                  key={stage.stage}
                  className={cn(
                    'pixel-card p-6 cursor-pointer transition-all duration-300 relative',
                    activeStage === index ? 'border-gold-500 scale-105' : 'border-gray-700',
                    index === 3 && 'md:scale-110'
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActiveStage(index)}
                  whileHover={{ y: -8 }}
                >
                  {index === 3 && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold-500 text-black px-4 py-1 text-xs font-black pixel-font">
                      最高阶
                    </div>
                  )}
                  
                  <div className="text-5xl mb-4 text-center">{stage.icon}</div>
                  <h4 className={cn(
                    'text-lg font-black mb-2 text-center',
                    stage.color === 'gold' ? 'text-gold-500' : 
                    stage.color === 'green' ? 'text-green-500' :
                    stage.color === 'blue' ? 'text-blue-500' : 'text-gray-500'
                  )}>
                    {stage.stage}
                  </h4>
                  <p className="text-sm text-gray-400 mb-4 text-center">
                    {stage.description}
                  </p>
                  <ul className="space-y-2">
                    {stage.features.map((feature) => (
                      <li key={feature} className="text-xs text-gray-500 flex items-center gap-2">
                        <span className={cn(
                          'text-base',
                          index <= activeStage ? 'text-gold-500' : 'text-gray-600'
                        )}>
                          •
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {/* 进度指示器 */}
                  {index < 3 && (
                    <motion.div
                      className="absolute -right-4 top-1/2 -translate-y-1/2 text-2xl hidden md:block"
                      animate={{ x: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      →
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* 核心价值 */}
        <motion.div
          className="grid md:grid-cols-3 gap-8 mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="pixel-card p-8 text-center">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-black text-gold-500 mb-4">消费即投资</h3>
            <p className="text-gray-400">
              每一笔消费都是投资<br />
              购买NFT资产增值<br />
              消费积分可提现
            </p>
          </div>
          
          <div className="pixel-card p-8 text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h3 className="text-xl font-black text-gold-500 mb-4">分享即收益</h3>
            <p className="text-gray-400">
              推荐好友获得奖励<br />
              团队消费持续分红<br />
              管道收入睡后收益
            </p>
          </div>
          
          <div className="pixel-card p-8 text-center">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-xl font-black text-gold-500 mb-4">成长即财富</h3>
            <p className="text-gray-400">
              等级越高收益越多<br />
              团队裂变指数增长<br />
              实现真正财富自由
            </p>
          </div>
        </motion.div>

        {/* 收益计算器 */}
        <motion.div
          className="pixel-card p-8 mb-20 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl md:text-3xl font-black text-center mb-8">
            <span className="text-gold-500">收益计算器</span>
            <span className="text-lg block mt-2 text-gray-400 font-normal">
              看看你能赚多少
            </span>
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 输入区域 */}
            <div className="space-y-6">
              <div>
                <h4 className="font-bold mb-4 text-gold-500">个人消费</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">月消费金额</span>
                    <span className="font-bold">¥{incomeCalculator.personal.consumption}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">消费返利</span>
                    <span className="text-green-500 font-bold">{incomeCalculator.personal.cashback}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">推荐奖励</span>
                    <span className="text-green-500 font-bold">{incomeCalculator.personal.referral}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-4 text-gold-500">团队发展</h4>
                <div className="space-y-3">
                  {incomeCalculator.team.map((level, index) => (
                    <div key={index} className="text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-400">{index + 1}级团队</span>
                        <span className="font-bold">{level.people}人</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>人均消费¥{level.avgConsumption}</span>
                        <span className="text-green-500">{level.rate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 收益展示 */}
            <div className="bg-gradient-to-br from-gold-500/20 to-transparent p-6 rounded-lg">
              <h4 className="font-bold mb-6 text-center text-gold-500">预估月收益</h4>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">个人收益</div>
                  <div className="text-2xl font-black text-white">¥{income.personal}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">团队收益</div>
                  <div className="text-2xl font-black text-white">¥{income.team}</div>
                </div>
                
                <div className="h-px bg-gold-500/30" />
                
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-2">总收益</div>
                  <motion.div
                    className="text-4xl font-black text-gold-500 pixel-text-shadow"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ¥{income.total}
                  </motion.div>
                  <div className="text-xs text-gray-500 mt-2">
                    年收益约 ¥{income.total * 12}
                  </div>
                </div>
              </div>

              <motion.button
                className="w-full mt-6 pixel-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCalculatorActive(true)}
              >
                立即开始赚钱
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* 成功案例 */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl md:text-3xl font-black text-center mb-12">
            <span className="text-gold-500">他们已经成功了</span>
            <span className="text-lg block mt-2 text-gray-400 font-normal">
              下一个会是你吗？
            </span>
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <motion.div
                key={story.name}
                className="pixel-card p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{story.avatar}</div>
                  <div>
                    <h4 className="font-bold text-gold-500">{story.name}</h4>
                    <p className="text-xs text-gray-500">{story.title}</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-300 mb-3">{story.story}</p>
                <p className="text-xs text-green-500 mb-4">✓ {story.achievement}</p>
                
                <blockquote className="text-sm text-gray-400 italic border-l-4 border-gold-500 pl-4">
                  "{story.quote}"
                </blockquote>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA区域 */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="pixel-card inline-block p-8 max-w-2xl">
            <h3 className="text-2xl font-black mb-4">
              <span className="text-gold-500">开启你的消费商之路</span>
            </h3>
            <p className="text-gray-400 mb-6">
              不需要囤货，不需要送货，不需要售后<br />
              只需要分享，就能赚钱
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center mb-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span>零门槛起步</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span>持续被动收入</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span>时间自由</span>
              </div>
            </div>
            
            <motion.button
              className="pixel-btn text-lg px-10 py-5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">🚀</span>
              马上成为消费商
            </motion.button>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
