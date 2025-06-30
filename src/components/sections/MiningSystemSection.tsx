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
    durability: 200,
    suitable: ['铁矿山', '石矿山'],
    output: '120矿石/次',
    price: '500 TDB',
    color: '#708090',
  },
  {
    id: 'axe',
    name: '伐木斧头',
    icon: '🪓',
    material: '60%铁矿 + 40%木头+0.008YLD',
    efficiency: 90,
    durability: 180,
    suitable: ['森林'],
    output: '100木材/次',
    price: '400 TDB',
    color: '#8B4513',
  },
  {
    id: 'hoe',
    name: '精工锄头',
    icon: '🔨',
    material: '50%铁矿 + 50%木头+0.008YLD',
    efficiency: 85,
    durability: 150,
    suitable: ['陨石矿'],
    output: '10 YLD/次',
    price: '800 TDB',
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

// 能量系统
const energySystem = {
  max: 100,
  consumption: {
    mining: 20,
    farming: 15,
    building: 25,
  },
  recovery: {
    food: { amount: 10, icon: '🍖', name: '粮食' },
    rest: { amount: 5, icon: '😴', name: '休息/小时' },
    potion: { amount: 50, icon: '🧪', name: '能量药水' },
  },
}

// 收益对比数据
const profitComparison = [
  { type: '铁矿山', daily: 1200, monthly: 36000, roi: '12%' },
  { type: '陨石矿', daily: 100, monthly: 3000, roi: '15%' },
  { type: '森林', daily: 800, monthly: 24000, roi: '10%' },
  { type: '石矿山', daily: 1000, monthly: 30000, roi: '11%' },
]

export function MiningSystemSection() {
  const [activeStep, setActiveStep] = useState(0)
  const [selectedTool, setSelectedTool] = useState(0)
  const [selectedMode, setSelectedMode] = useState('self')
  const [currentEnergy, setCurrentEnergy] = useState(80)
  const [isMining, setIsMining] = useState(false)
  const [miningProgress, setMiningProgress] = useState(0)

  // 模拟挖矿进度
  useEffect(() => {
    if (isMining && miningProgress < 100) {
      const timer = setTimeout(() => {
        setMiningProgress(prev => Math.min(prev + 20, 100))
      }, 1000)
      return () => clearTimeout(timer)
    } else if (miningProgress >= 100) {
      setIsMining(false)
    }
  }, [isMining, miningProgress])

  const startMining = () => {
    if (currentEnergy >= 20) {
      setIsMining(true)
      setMiningProgress(0)
      setCurrentEnergy(prev => prev - 20)
    }
  }

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
                  <div className="flex justify-between">
                    <span className="text-gray-400">耐久</span>
                    <span className="text-gray-300">{tool.durability}次</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">产出</span>
                    <span className="text-green-500 font-bold">{tool.output}</span>
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

        {/* 能量系统 & 挖矿演示 */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16 lg:mb-20 px-4 lg:px-0">
          {/* 能量系统 */}
          <motion.div
            className="pixel-card p-6 lg:p-8"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg lg:text-xl font-black mb-6">
              <span className="text-gold-500">能量系统</span>
            </h3>
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-xs lg:text-sm text-gray-400">当前能量</span>
                <span className="text-xs lg:text-sm font-bold">{currentEnergy}/100</span>
              </div>
              <div className="w-full h-6 lg:h-8 bg-gray-800 rounded-full overflow-hidden relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-gold-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${currentEnergy}%` }}
                  transition={{ duration: 0.5 }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                  {currentEnergy}%
                </div>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <h4 className="font-bold text-xs lg:text-sm">能量消耗</h4>
              {Object.entries(energySystem.consumption).map(([action, cost]) => (
                <div key={action} className="flex justify-between text-xs lg:text-sm">
                  <span className="text-gray-400 capitalize">{action}</span>
                  <span className="text-red-500">-{cost} 能量</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-xs lg:text-sm">能量恢复</h4>
              {Object.entries(energySystem.recovery).map(([key, item]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl lg:text-2xl">{item.icon}</span>
                    <span className="text-xs lg:text-sm text-gray-400">{item.name}</span>
                  </div>
                  <span className="text-xs lg:text-sm text-green-500">+{item.amount} 能量</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 挖矿演示 */}
          <motion.div
            className="pixel-card p-6 lg:p-8"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg lg:text-xl font-black mb-6">
              <span className="text-gold-500">挖矿演示</span>
            </h3>
            
            <div className="text-center">
              {!isMining ? (
                <motion.div
                  className="text-6xl lg:text-8xl mb-6 inline-block cursor-pointer"
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  onClick={startMining}
                >
                  ⛏️
                </motion.div>
              ) : (
                <motion.div
                  className="text-6xl lg:text-8xl mb-6 inline-block"
                  animate={{ rotate: [-10, 10, -10] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  ⛏️
                </motion.div>
              )}
              
              {isMining && (
                <div className="mb-6">
                  <div className="text-xs lg:text-sm text-gray-400 mb-2">挖矿进度</div>
                  <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gold-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${miningProgress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{miningProgress}%</div>
                </div>
              )}
              
              {miningProgress >= 100 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <div className="text-3xl lg:text-4xl mb-2">🎉</div>
                  <div className="text-base lg:text-lg font-bold text-gold-500">挖矿完成！</div>
                  <div className="text-xs lg:text-sm text-gray-400">获得 120 铁矿石</div>
                </motion.div>
              )}
              
              {!isMining && miningProgress === 0 && (
                <motion.button
                  className="pixel-btn text-sm lg:text-base"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startMining}
                  disabled={currentEnergy < 20}
                >
                  {currentEnergy >= 20 ? '开始挖矿' : '能量不足'}
                </motion.button>
              )}
            </div>
            
            <div className="mt-6 p-4 bg-gray-900 rounded text-xs text-gray-400">
              <p>提示：挖矿需要消耗20点能量，实际游戏中需要5小时完成一轮。</p>
            </div>
          </motion.div>
        </div>

        {/* 收益对比表 */}
        <motion.div
          className="mb-16 lg:mb-20 px-4 lg:px-0"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl lg:text-2xl font-black text-center mb-8 lg:mb-12">
            <span className="text-gold-500">收益对比</span>
            <span className="text-xs lg:text-sm block mt-2 text-gray-400 font-normal">
              不同矿山的收益一目了然
            </span>
          </h3>

          <div className="pixel-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-gold-500/10">
                  <tr>
                    <th className="text-left p-3 lg:p-4 font-bold text-xs lg:text-base">矿山类型</th>
                    <th className="text-center p-3 lg:p-4 font-bold text-xs lg:text-base">日收益</th>
                    <th className="text-center p-3 lg:p-4 font-bold text-xs lg:text-base">月收益</th>
                    <th className="text-center p-3 lg:p-4 font-bold text-xs lg:text-base">投资回报率</th>
                  </tr>
                </thead>
                <tbody>
                  {profitComparison.map((item, index) => (
                    <motion.tr
                      key={item.type}
                      className="border-t border-gray-800"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <td className="p-3 lg:p-4 text-xs lg:text-base">{item.type}</td>
                      <td className="p-3 lg:p-4 text-center font-bold text-xs lg:text-base">¥{item.daily}</td>
                      <td className="p-3 lg:p-4 text-center font-bold text-gold-500 text-xs lg:text-base">¥{item.monthly.toLocaleString()}</td>
                      <td className="p-3 lg:p-4 text-center">
                        <span className="px-2 lg:px-3 py-1 bg-green-500/20 text-green-500 font-bold rounded text-xs lg:text-sm">
                          {item.roi}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                <span>T+1随时提现</span>
              </div>
            </div>
            
            <motion.button
              className="pixel-btn text-base lg:text-lg px-8 lg:px-10 py-4 lg:py-5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">⛏️</span>
              立即开始挖矿
            </motion.button>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
