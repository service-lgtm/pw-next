'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

// 积分类型数据
const tokenTypes = [
  {
    id: 'tdb',
    name: 'TDB积分',
    subtitle: '黄金通证',
    icon: '🪙',
    color: '#FFD700',
    value: '1 TDB = 0.01克黄金',
    features: [
      { label: '价值锚定', value: '100%黄金储备' },
      { label: '价格稳定', value: '与金价挂钩' },
      { label: '用途广泛', value: '购买/交易/支付' },
      { label: '随时提现', value: '实时到账' },
    ],
    obtainWays: [
      '充值购买',
      '销售收入',
      '任务奖励',
      '推荐返佣',
    ],
  },
  {
    id: 'yld',
    name: 'YLD积分',
    subtitle: '陨石积分',
    icon: '💎',
    color: '#9370DB',
    value: '限量发行，价值浮动',
    features: [
      { label: '稀缺资源', value: '总量有限' },
      { label: '挖矿产出', value: '陨石矿专属' },
      { label: '手续费支付', value: 'Gas费必需' },
      { label: '升值潜力', value: '供需决定' },
    ],
    obtainWays: [
      '陨石矿挖掘',
      '市场购买',
      '活动奖励',
      '等级福利',
    ],
  },
]

// 积分流通环节
const circulationSteps = [
  {
    step: '获取',
    icon: '💰',
    actions: ['充值', '挖矿', '交易', '奖励'],
    color: '#00D4AA',
  },
  {
    step: '使用',
    icon: '🛍️',
    actions: ['购买NFT', '支付手续费', '商城消费', '投资理财'],
    color: '#FFD700',
  },
  {
    step: '流通',
    icon: '🔄',
    actions: ['用户交易', '商家结算', '平台分红', '生态激励'],
    color: '#3B82F6',
  },
  {
    step: '提现',
    icon: '🏦',
    actions: ['链上提币', '法币兑换', '黄金提取', '跨境支付'],
    color: '#10B981',
  },
]

// 提现流程
const withdrawProcess = [
  {
    step: 1,
    title: '发起提现',
    description: '进入钱包选择提现',
    icon: '📱',
    time: '1分钟',
  },
  {
    step: 2,
    title: '身份验证',
    description: '输入支付密码',
    icon: '🔐',
    time: '即时',
  },
  {
    step: 3,
    title: '填写信息',
    description: '钱包地址/银行账户',
    icon: '📝',
    time: '2分钟',
  },
  {
    step: 4,
    title: '审核处理',
    description: '平台安全审核',
    icon: '⏳',
    time: '1-24小时',
  },
  {
    step: 5,
    title: '到账成功',
    description: '资金到达指定账户',
    icon: '✅',
    time: '即时',
  },
]

// 手续费说明
const feeStructure = [
  { type: '积分提现', rate: '5%', min: '100 TDB', desc: '提现到区块链' },
  { type: 'NFT交易', rate: '3%', min: '0.008 YLD', desc: '买卖NFT资产' },
  { type: '商品上架', rate: '3%', min: '10 TDB', desc: '商城商品上架' },
  { type: '跨境支付', rate: '1%', min: '50 TDB', desc: '国际汇款' },
]

// 经济数据
const economyStats = [
  { label: '总市值', value: '¥1.2亿', change: '+12.5%' },
  { label: '日交易量', value: '¥580万', change: '+8.3%' },
  { label: '流通量', value: '8500万', change: '+5.2%' },
  { label: '持币地址', value: '125,000+', change: '+15.7%' },
]

export function EconomySection() {
  const [selectedToken, setSelectedToken] = useState('tdb')
  const [activeStep, setActiveStep] = useState(0)
  const [animatedStats, setAnimatedStats] = useState(economyStats.map(s => ({ ...s, displayValue: 0 })))

  // 数字动画效果
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats(economyStats)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const activeToken = tokenTypes.find(t => t.id === selectedToken)!

  return (
    <section className="py-24 lg:py-32 bg-[#0A1628] relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-gold-500/10 rounded-full filter blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <Container className="relative z-10">
        {/* 标题 */}
        <motion.div
          className="text-center max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-3 text-gold-500 text-sm font-bold uppercase tracking-wider mb-6">
            <span className="w-8 h-1 bg-gold-500" />
            <span className="pixel-font">ECONOMY MODEL</span>
            <span className="w-8 h-1 bg-gold-500" />
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
            <span className="block mb-2">双积分经济体系</span>
            <span className="text-gold-500 pixel-text-shadow">稳定币+燃料币 完美结合</span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-400">
            TDB锚定黄金价值稳定，YLD限量发行升值可期
            <br />
            <span className="text-gold-500 font-bold">真实价值支撑，透明公开运行</span>
          </p>
        </motion.div>

        {/* 经济数据展示 */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {animatedStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="pixel-card p-6 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                {stat.label}
              </div>
              <div className="text-2xl md:text-3xl font-black text-gold-500 mb-1">
                {stat.value}
              </div>
              <div className={cn(
                'text-sm font-bold',
                stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
              )}>
                {stat.change}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 积分类型对比 */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-black text-center mb-12">
            <span className="text-gold-500">双积分体系</span>
            <span className="text-sm block mt-2 text-gray-400 font-normal">
              稳定与增值的完美平衡
            </span>
          </h3>

          <div className="grid lg:grid-cols-2 gap-8">
            {tokenTypes.map((token, index) => (
              <motion.div
                key={token.id}
                className={cn(
                  'pixel-card p-8 cursor-pointer transition-all duration-300',
                  selectedToken === token.id ? 'border-gold-500 scale-105' : 'border-gray-700'
                )}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                onClick={() => setSelectedToken(token.id)}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{token.icon}</span>
                    <div>
                      <h4 className="text-2xl font-black" style={{ color: token.color }}>
                        {token.name}
                      </h4>
                      <p className="text-sm text-gray-500">{token.subtitle}</p>
                    </div>
                  </div>
                  {token.id === 'tdb' && (
                    <span className="px-3 py-1 bg-gold-500/20 text-gold-500 text-xs font-bold">
                      主币
                    </span>
                  )}
                </div>

                <div className="mb-6 p-4 bg-gray-900 rounded-lg text-center">
                  <p className="text-lg font-bold text-white">{token.value}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {token.features.map((feature) => (
                    <div key={feature.label} className="text-sm">
                      <div className="text-gray-500 mb-1">{feature.label}</div>
                      <div className="font-bold">{feature.value}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <h5 className="text-sm font-bold mb-3">获取方式</h5>
                  <div className="flex flex-wrap gap-2">
                    {token.obtainWays.map((way) => (
                      <span key={way} className="text-xs px-3 py-1 bg-gray-800 text-gray-300">
                        {way}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 积分流通图 */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-black text-center mb-12">
            <span className="text-gold-500">积分流通循环</span>
            <span className="text-sm block mt-2 text-gray-400 font-normal">
              健康的经济生态系统
            </span>
          </h3>

          <div className="relative">
            {/* 流通环形图 */}
            <div className="max-w-4xl mx-auto">
              <svg viewBox="0 0 800 400" className="w-full h-auto">
                {/* 连接线 */}
                <motion.path
                  d="M 100 200 Q 250 100 400 200 T 700 200"
                  stroke="#FFD700"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* 流通节点 */}
                {circulationSteps.map((step, index) => {
                  const x = 100 + index * 200
                  const y = 200
                  return (
                    <motion.g
                      key={step.step}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.2 }}
                    >
                      <circle cx={x} cy={y} r="60" fill={step.color} fillOpacity="0.2" />
                      <circle cx={x} cy={y} r="50" fill={step.color} fillOpacity="0.3" />
                      <text x={x} y={y} textAnchor="middle" fontSize="30" dominantBaseline="middle">
                        {step.icon}
                      </text>
                      <text x={x} y={y + 80} textAnchor="middle" fontSize="16" fill="white" fontWeight="bold">
                        {step.step}
                      </text>
                    </motion.g>
                  )
                })}
              </svg>

              {/* 流通说明 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                {circulationSteps.map((step, index) => (
                  <motion.div
                    key={step.step}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="text-3xl mb-2" style={{ color: step.color }}>
                      {step.icon}
                    </div>
                    <h5 className="font-bold mb-2">{step.step}</h5>
                    <div className="space-y-1">
                      {step.actions.map((action) => (
                        <p key={action} className="text-xs text-gray-500">{action}</p>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 提现机制 */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* 提现流程 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-black mb-6">
              <span className="text-gold-500">提现流程</span>
            </h3>

            <div className="space-y-4">
              {withdrawProcess.map((process, index) => (
                <motion.div
                  key={process.step}
                  className={cn(
                    'pixel-card p-4 cursor-pointer transition-all duration-300',
                    activeStep === index ? 'border-gold-500' : 'border-gray-700'
                  )}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActiveStep(index)}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center text-xl',
                      activeStep >= index ? 'bg-gold-500 text-black' : 'bg-gray-800'
                    )}>
                      {process.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold">
                          第{process.step}步：{process.title}
                        </h5>
                        <span className="text-xs text-gray-500">{process.time}</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{process.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gold-500/10 rounded-lg">
              <p className="text-sm text-gold-500">
                💡 提示：实名认证用户享受更高提现额度和更低手续费
              </p>
            </div>
          </motion.div>

          {/* 手续费说明 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-black mb-6">
              <span className="text-gold-500">手续费标准</span>
            </h3>

            <div className="pixel-card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gold-500/10">
                  <tr>
                    <th className="text-left p-4 text-sm font-bold">业务类型</th>
                    <th className="text-center p-4 text-sm font-bold">费率</th>
                    <th className="text-center p-4 text-sm font-bold">最低</th>
                  </tr>
                </thead>
                <tbody>
                  {feeStructure.map((fee, index) => (
                    <motion.tr
                      key={fee.type}
                      className="border-t border-gray-800"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <td className="p-4">
                        <div className="font-bold">{fee.type}</div>
                        <div className="text-xs text-gray-500">{fee.desc}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-3 py-1 bg-gold-500/20 text-gold-500 font-bold rounded">
                          {fee.rate}
                        </span>
                      </td>
                      <td className="p-4 text-center text-sm">{fee.min}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="pixel-card p-4 text-center">
                <div className="text-2xl mb-2">⚡</div>
                <h5 className="font-bold mb-1">快速到账</h5>
                <p className="text-xs text-gray-500">链上提现秒到</p>
              </div>
              <div className="pixel-card p-4 text-center">
                <div className="text-2xl mb-2">🔒</div>
                <h5 className="font-bold mb-1">安全保障</h5>
                <p className="text-xs text-gray-500">多重签名保护</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 经济优势 */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="pixel-card p-8 bg-gradient-to-br from-gold-500/20 to-transparent text-center max-w-4xl mx-auto">
            <h3 className="text-2xl font-black mb-6">
              <span className="text-gold-500">为什么选择平行世界经济体系？</span>
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div>
                <div className="text-4xl mb-3">🛡️</div>
                <h4 className="font-bold mb-2">价值稳定</h4>
                <p className="text-sm text-gray-400">
                  黄金储备支撑<br />永不通胀贬值
                </p>
              </div>
              <div>
                <div className="text-4xl mb-3">🚀</div>
                <h4 className="font-bold mb-2">升值潜力</h4>
                <p className="text-sm text-gray-400">
                  YLD限量发行<br />需求推动上涨
                </p>
              </div>
              <div>
                <div className="text-4xl mb-3">💎</div>
                <h4 className="font-bold mb-2">生态闭环</h4>
                <p className="text-sm text-gray-400">
                  内部循环流通<br />外部自由兑换
                </p>
              </div>
            </div>

            <motion.div
              className="text-3xl font-black text-gold-500 pixel-text-shadow"
              animate={{ 
                textShadow: [
                  '4px 4px 0 #DAA520, 8px 8px 0 rgba(0, 0, 0, 0.3)',
                  '6px 6px 0 #DAA520, 12px 12px 0 rgba(0, 0, 0, 0.3)',
                  '4px 4px 0 #DAA520, 8px 8px 0 rgba(0, 0, 0, 0.3)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              真金白银 · 真实价值
            </motion.div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="pixel-card inline-block p-8">
            <h3 className="text-2xl font-black mb-4">
              <span className="text-gold-500">开始积累你的数字财富</span>
            </h3>
            <p className="text-gray-400 mb-6">
              每一枚积分都有真实价值支撑
              <br />
              早参与，早受益
            </p>
            
            <div className="flex gap-4 justify-center">
              <motion.button
                className="pixel-btn text-lg px-8 py-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-2">💰</span>
                立即充值
              </motion.button>
              <motion.button
                className="px-8 py-4 text-lg font-bold text-gold-500 border-4 border-gold-500 hover:bg-gold-500 hover:text-black transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-2">📊</span>
                查看白皮书
              </motion.button>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
