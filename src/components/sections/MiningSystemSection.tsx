'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

// 挖矿工具数据
const miningTools = [
  {
    id: 'pickaxe',
    name: '精铁镐头',
    icon: '⛏️',
    material: '70%铁矿 + 30%木头+0.008YLD',
    efficiency: 100,
    suitable: ['铁矿山', '石矿山'],
    price: '敬请期待',
    color: '#708090',
  },
  {
    id: 'axe',
    name: '伐木斧头',
    icon: '🪓',
    material: '60%铁矿 + 40%木头+0.008YLD',
    efficiency: 90,
    suitable: ['森林'],
    price: '敬请期待',
    color: '#8B4513',
  },
  {
    id: 'hoe',
    name: '精工锄头',
    icon: '🔨',
    material: '50%铁矿 + 50%木头+0.008YLD',
    efficiency: 85,
    suitable: ['陨石矿'],
    price: '敬请期待',
    color: '#9370DB',
  },
]

// 挖矿流程步骤
const miningSteps = [
  {
    step: 1,
    title: '准备阶段',
    icon: '🎒',
    description: '拥有矿山或接受招聘',
    details: ['购买/租赁矿山', '准备挖矿工具', '补充能量值'],
  },
  {
    step: 2,
    title: '开始挖矿',
    icon: '⛏️',
    description: '使用工具开采资源',
    details: ['选择矿山类型', '装备对应工具', '点击开始挖矿'],
  },
  {
    step: 3,
    title: '等待收获',
    icon: '⏰',
    description: '5小时自动完成',
    details: ['倒计时5小时', '可使用加速道具', '自动收获入库'],
  },
  {
    step: 4,
    title: '获得收益',
    icon: '💰',
    description: '扣税后自动到账',
    details: ['扣除5%税收', '资源进入仓库', '可出售或使用'],
  },
]

// 挖矿模式
const miningModes = [
  {
    mode: 'self',
    title: '自己挖矿',
    icon: '👤',
    pros: ['100%收益归自己', '自由安排时间', '积累挖矿经验'],
    cons: ['需要购买矿山', '消耗个人精力', '初期投入较大'],
    profit: '100%',
  },
  {
    mode: 'hire',
    title: '雇人挖矿',
    icon: '👥',
    pros: ['躺赚被动收入', '规模化生产', '节省时间精力'],
    cons: ['需分享收益', '依赖工人效率', '管理成本'],
    profit: '90-95%',
  },
  {
    mode: 'work',
    title: '打工挖矿',
    icon: '💼',
    pros: ['零成本起步', '稳定收入来源', '学习挖矿技巧'],
    cons: ['收益比例较低', '受雇主限制', '缺乏自主权'],
    profit: '5-10%',
  },
]

export function MiningSystemSection() {
  const [activeStep, setActiveStep] = useState(0)
  const [selectedTool, setSelectedTool] = useState(0)
  const [selectedMode, setSelectedMode] = useState('self')

  return (
    <section className="py-16 lg:py-24 bg-[#0A1628] relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 text-6xl lg:text-8xl opacity-5 animate-float">⛏️</div>
        <div className="absolute bottom-20 right-10 text-6xl lg:text-8xl opacity-5 animate-float" style={{ animationDelay: '1s' }}>💎</div>
        <div className="absolute top-40 right-20 text-5xl lg:text-6xl opacity-5 animate-float" style={{ animationDelay: '2s' }}>🪨</div>
      </div>

      <Container className="relative z-10">
        {/* 标题 */}
        <motion.div
          className="text-center max-w-4xl mx-auto mb-12 lg:mb-16 px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-3 text-gold-500 text-xs lg:text-sm font-bold uppercase tracking-wider mb-4 lg:mb-6">
            <span className="w-6 lg:w-8 h-1 bg-gold-500" />
            <span className="pixel-font">MINING SYSTEM</span>
            <span className="w-6 lg:w-8 h-1 bg-gold-500" />
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-black leading-tight mb-4 lg:mb-6">
            <span className="block mb-2">挖矿致富</span>
            <span className="text-gold-500 pixel-text-shadow">付出劳动 收获财富</span>
          </h2>
          
          <p className="text-base lg:text-xl text-gray-400">
            真实模拟挖矿过程，每一份收获都来自辛勤劳动
            <br />
            <span className="text-gold-500 font-bold">5小时一轮，日入过千不是梦</span>
          </p>
        </motion.div>

        {/* 挖矿流程可视化 */}
        <motion.div
          className="mb-16 lg:mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl lg:text-2xl font-black text-center mb-8 lg:mb-12">挖矿流程</h3>
          
          <div className="relative">
            {/* 进度线 - 仅桌面显示 */}
            <div className="absolute top-24 left-0 right-0 h-1 bg-gray-800 hidden lg:block">
              <motion.div
                className="h-full bg-gold-500"
                initial={{ width: '0%' }}
                animate={{ width: `${(activeStep + 1) * 25}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 px-4 lg:px-0">
              {miningSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  className={cn(
                    'pixel-card p-5 lg:p-6 cursor-pointer transition-all duration-300 relative',
                    activeStep >= index ? 'border-gold-500' : 'border-gray-700'
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActiveStep(index)}
                  whileHover={{ y: -4 }}
                >
                  <div className={cn(
                    'w-10 lg:w-12 h-10 lg:h-12 rounded-full flex items-center justify-center text-xl lg:text-2xl mb-3 lg:mb-4 mx-auto',
                    activeStep >= index ? 'bg-gold-500 text-black' : 'bg-gray-800'
                  )}>
                    {step.icon}
                  </div>
                  
                  <h4 className="text-base lg:text-lg font-black mb-2 text-center">
                    第{step.step}步：{step.title}
                  </h4>
                  <p className="text-xs lg:text-sm text-gray-400 mb-3 lg:mb-4 text-center">
                    {step.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {step.details.map((detail) => (
                      <li key={detail} className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="text-gold-500">•</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 工具展示 */}
        <motion.div
          className="mb-16 lg:mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl lg:text-2xl font-black text-center mb-8 lg:mb-12">
            <span className="text-gold-500">挖矿工具</span>
            <span className="text-xs lg:text-sm block mt-2 text-gray-400 font-normal">
              工欲善其事，必先利其器
            </span>
          </h3>

          <div className="grid lg:grid-cols-3 gap-4 lg:gap-6 px-4 lg:px-0">
            {miningTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                className={cn(
                  'pixel-card p-5 lg:p-6 cursor-pointer transition-all duration-300',
                  selectedTool === index ? 'border-gold-500 scale-105' : 'border-gray-700'
                )}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedTool(index)}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl lg:text-5xl">{tool.icon}</span>
                  <span className="text-xs lg:text-sm px-2 lg:px-3 py-1 bg-gold-500/20 text-gold-500 font-bold">
                    {tool.price}
                  </span>
                </div>
                
                <h4 className="text-lg lg:text-xl font-black mb-2" style={{ color: tool.color }}>
                  {tool.name}
                </h4>
                
                <div className="space-y-3 text-xs lg:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">配方</span>
                    <span className="text-gray-300">{tool.material}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">效率</span>
                    <div className="flex items-center gap-1">
                      <div className="w-16 lg:w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gold-500"
                          style={{ width: `${tool.efficiency}%` }}
                        />
                      </div>
                      <span className="text-xs text-gold-500">{tool.efficiency}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="text-xs text-gray-400 mb-2">适用矿山</div>
                  <div className="flex flex-wrap gap-2">
                    {tool.suitable.map(mine => (
                      <span key={mine} className="text-xs px-2 py-1 bg-gray-800 text-gray-300">
                        {mine}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 挖矿模式对比 */}
        <motion.div
          className="mb-16 lg:mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl lg:text-2xl font-black text-center mb-8 lg:mb-12">
            <span className="text-gold-500">挖矿模式</span>
            <span className="text-xs lg:text-sm block mt-2 text-gray-400 font-normal">
              选择适合你的赚钱方式
            </span>
          </h3>

          <div className="grid lg:grid-cols-3 gap-4 lg:gap-6 px-4 lg:px-0">
            {miningModes.map((mode) => (
              <motion.div
                key={mode.mode}
                className={cn(
                  'pixel-card p-5 lg:p-6 cursor-pointer transition-all duration-300',
                  selectedMode === mode.mode ? 'border-gold-500' : 'border-gray-700'
                )}
                onClick={() => setSelectedMode(mode.mode)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center mb-6">
                  <div className="text-4xl lg:text-5xl mb-2">{mode.icon}</div>
                  <h4 className="text-lg lg:text-xl font-black">{mode.title}</h4>
                  <div className="text-xl lg:text-2xl font-black text-gold-500 mt-2">
                    收益：{mode.profit}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-xs lg:text-sm font-bold text-green-500 mb-2">优势</h5>
                    <ul className="space-y-1">
                      {mode.pros.map(pro => (
                        <li key={pro} className="text-xs text-gray-300 flex items-start gap-1">
                          <span className="text-green-500 mt-0.5">✓</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-xs lg:text-sm font-bold text-red-500 mb-2">劣势</h5>
                    <ul className="space-y-1">
                      {mode.cons.map(con => (
                        <li key={con} className="text-xs text-gray-300 flex items-start gap-1">
                          <span className="text-red-500 mt-0.5">✗</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="pixel-card inline-block p-6 lg:p-8 max-w-full lg:max-w-auto">
            <h3 className="text-xl lg:text-2xl font-black mb-4">
              <span className="text-gold-500">开始你的挖矿之旅</span>
            </h3>
            <p className="text-sm lg:text-base text-gray-400 mb-6">
              每天只需5小时，月入过万不是梦
              <br />
              真实劳动，真实收益
            </p>
            
            <div className="flex flex-wrap gap-3 lg:gap-4 justify-center mb-6">
              <div className="flex items-center gap-2 text-xs lg:text-sm">
                <span className="text-green-500">✓</span>
                <span>新手免费工具</span>
              </div>
              <div className="flex items-center gap-2 text-xs lg:text-sm">
                <span className="text-green-500">✓</span>
                <span>保底收益</span>
              </div>
              <div className="flex items-center gap-2 text-xs lg:text-sm">
                <span className="text-green-500">✓</span>
                <span>平台分红</span>
              </div>
            </div>
            
            <motion.a
              href="https://www.pxsj.net.cn/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-btn text-base lg:text-lg px-8 lg:px-10 py-4 lg:py-5 inline-block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">⛏️</span>
              立即开始挖矿
            </motion.a>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
