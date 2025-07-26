'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { useState } from 'react'
import { cn } from '@/lib/utils'

// 注册流程数据
const registrationSteps = [
  {
    step: 1,
    title: '访问平台',
    icon: '🌐',
    time: '30秒',
    description: '扫码或输入网址',
    details: [
      '扫描推荐人二维码',
      '或访问官方网站',
      '游客模式先体验',
    ],
    tips: '推荐人邀请码自动填写，更多福利',
  },
  {
    step: 2,
    title: '快速注册',
    icon: '✍️',
    time: '2分钟',
    description: '填写基本信息',
    details: [
      '设置用户名密码',
      '邮箱验证',
      '填写邀请码(选填)',
    ],
    tips: '牢记12个助记词，这是找回账号唯一凭证',
  },
  {
    step: 3,
    title: '领取礼包',
    icon: '🎁',
    time: '即时',
    description: '新手大礼包到账',
    details: [
      '100 TDB通证',
      '10 YLD通证',
      '新手专属任务',
    ],
    tips: '完成新手任务，额外赚取500积分',
  },
]

// 新手礼包内容
const starterPack = {
  instant: [
    { icon: '🪙', name: 'TDB通证', amount: '100', value: '¥100', desc: '相当于1克黄金' },
    { icon: '💎', name: 'YLD通证', amount: '10', value: '¥50', desc: '用于支付手续费' },
  ],
  tasks: [
    { icon: '🏃', name: '首次登录', reward: '50 TDB', status: 'completed' },
    { icon: '🛒', name: '首次购买', reward: '100 TDB', status: 'pending' },
    { icon: '⛏️', name: '首次挖矿', reward: '200 TDB', status: 'pending' },
    { icon: '👥', name: '邀请好友', reward: '150 TDB', status: 'pending' },
  ],
}

// 快速赚钱攻略
const earningStrategies = [
  {
    level: '新手级',
    icon: '🌱',
    title: '零成本起步',
    daily: '50-100',
    strategies: [
      { action: '每日签到', income: '10 TDB/天', time: '1分钟' },
      { action: '浏览商城', income: '5 TDB/次', time: '5分钟' },
      { action: '分享推广', income: '20 TDB/人', time: '10分钟' },
    ],
  },
  {
    level: '进阶级',
    icon: '🚀',
    title: '小投入大回报',
    daily: '300-500',
    strategies: [
      { action: '租地挖矿', income: '100 TDB/天', time: '5小时' },
      { action: '工具制作', income: '200 TDB/件', time: '即时' },
      { action: '商品转售', income: '10-20%利润', time: '1-3天' },
    ],
  },
  {
    level: '专业级',
    icon: '👑',
    title: '规模化经营',
    daily: '1000+',
    strategies: [
      { action: '土地购买', income: '8-15%/月', time: '长期' },
      { action: '开店经营', income: '视销量而定', time: '持续' },
      { action: 'VIP发展', income: '10-18%提成', time: '被动' },
    ],
  },
]

// 常见问题
const faqData = [
  {
    category: '入门必读',
    icon: '📚',
    questions: [
      {
        q: '平行世界的字符是什么？',
        a: '平行世界的字符是一个基于区块链的数字资产平台，您可以通过购买虚拟土地、挖矿、开店等方式赚取收益。每个资产都有真实价值支撑。',
      },
      {
        q: '需要投入多少钱？',
        a: '0元即可开始！新手礼包提供100 TDB启动资金，您可以通过完成任务、推荐好友等方式赚取更多积分。',
      },
      {
        q: '多久能赚回本金？',
        a: '根据不同玩法，回本周期3-12个月不等。挖矿类3-6个月，商城类6-12个月，具体取决于您的经营策略。',
      },
    ],
  },
  {
    category: '积分相关',
    icon: '💰',
    questions: [
      {
        q: 'TDB和YLD有什么区别？',
        a: 'TDB是主要交易货币，1TDB=0.01克黄金，价值稳定；YLD是燃料积分，用于支付手续费，限量发行有升值空间。',
      },
      {
        q: '积分如何提现？',
        a: '进入钱包-选择提现-输入金额和地址-支付5%手续费-等待1-24小时到账。最低提现100 TDB。',
      },
      {
        q: '提现安全吗？',
        a: '绝对安全！平台采用多重签名技术，所有提现记录上链存证，并有专业安全团队24小时监控。',
      },
    ],
  },
  {
    category: '玩法技巧',
    icon: '🎮',
    questions: [
      {
        q: '新手推荐什么玩法？',
        a: '建议先用新手积分体验挖矿，熟悉后可以尝试买卖工具赚差价。有一定资金后再考虑购买土地或开店。',
      },
      {
        q: '哪种矿山收益最高？',
        a: '陨石矿收益最高(10-15%)但需要特殊工具；铁矿山性价比最好(12%)；新手建议从铁矿山开始。',
      },
      {
        q: '如何快速升级？',
        a: '个人消费+团队业绩是升级关键。多推荐活跃用户，帮助团队成员成长，您的等级和收益都会快速提升。',
      },
    ],
  },
]

export function OnboardingSection() {
  const [activeStep, setActiveStep] = useState(0)
  const [selectedStrategy, setSelectedStrategy] = useState(0)
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [showGiftAnimation, setShowGiftAnimation] = useState(false)

  // 计算礼包总价值
  const totalGiftValue = starterPack.instant.reduce((sum, item) => 
    sum + parseInt(item.value.replace('¥', '')), 0
  ) + starterPack.tasks.reduce((sum, task) => 
    sum + parseInt(task.reward.split(' ')[0]), 0
  )

  return (
    <section className="py-16 lg:py-24 bg-[#0F0F1E] relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 text-6xl lg:text-8xl opacity-5 animate-pulse">🎯</div>
        <div className="absolute bottom-10 left-10 text-6xl lg:text-8xl opacity-5 animate-pulse" style={{ animationDelay: '1s' }}>🎁</div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[150px] lg:text-[200px] opacity-5 animate-pulse" style={{ animationDelay: '2s' }}>🚀</div>
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
            <span className="pixel-font">QUICK START</span>
            <span className="w-6 lg:w-8 h-1 bg-gold-500" />
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-black leading-tight mb-4 lg:mb-6">
            <span className="block mb-2">3分钟快速上手</span>
            <span className="text-gold-500 pixel-text-shadow">小白变大神 就这么简单</span>
          </h2>
          
          <p className="text-base lg:text-xl text-gray-400">
            零基础也能玩转平行世界，新手礼包价值超过
            <span className="text-gold-500 font-bold text-xl lg:text-2xl mx-2">¥650</span>
            <br />
            <span className="text-sm lg:text-base mt-2 block">跟着教程走，日入过百不是梦</span>
          </p>
        </motion.div>

        {/* 注册流程 */}
        <motion.div
          className="mb-16 lg:mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl lg:text-2xl font-black text-center mb-8 lg:mb-12">
            <span className="text-gold-500">极速注册流程</span>
            <span className="text-xs lg:text-sm block mt-2 text-gray-400 font-normal">
              比装个APP还简单
            </span>
          </h3>

          <div className="relative">
            {/* 进度条 */}
            <div className="absolute top-24 left-0 right-0 h-2 bg-gray-800 rounded-full hidden lg:block">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-gold-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${((activeStep + 1) / 3) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 px-4 lg:px-0">
              {registrationSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  className={cn(
                    'pixel-card p-5 lg:p-6 cursor-pointer transition-all duration-300 relative',
                    activeStep === index ? 'border-gold-500 scale-105' : 'border-gray-700'
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActiveStep(index)}
                  whileHover={{ y: -4 }}
                >
                  <div className="text-center mb-4">
                    <motion.div
                      className="text-5xl lg:text-6xl mb-3 inline-block"
                      animate={activeStep === index ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      {step.icon}
                    </motion.div>
                    <h4 className="text-lg lg:text-xl font-black mb-1">
                      第{step.step}步
                    </h4>
                    <p className="text-gold-500 font-bold">{step.title}</p>
                    <span className="text-xs text-gray-500">{step.time}</span>
                  </div>
                  
                  <p className="text-xs lg:text-sm text-gray-400 mb-4 text-center">
                    {step.description}
                  </p>
                  
                  <ul className="space-y-2 mb-4">
                    {step.details.map((detail) => (
                      <li key={detail} className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        {detail}
                      </li>
                    ))}
                  </ul>

                  <div className="p-3 bg-gold-500/10 rounded text-xs text-gold-500">
                    💡 {step.tips}
                  </div>

                  {step.step === 3 && (
                    <motion.button
                      className="w-full mt-4 pixel-btn text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowGiftAnimation(true)
                        setTimeout(() => setShowGiftAnimation(false), 3000)
                      }}
                    >
                      查看礼包
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 新手礼包展示 */}
        <motion.div
          className="mb-16 lg:mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl lg:text-2xl font-black text-center mb-8 lg:mb-12">
            <span className="text-gold-500">新手专属礼包</span>
            <span className="text-xs lg:text-sm block mt-2 text-gray-400 font-normal">
              注册即送，错过不再有
            </span>
          </h3>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto px-4 lg:px-0">
            {/* 即时奖励 */}
            <motion.div
              className="pixel-card p-6 lg:p-8"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg lg:text-xl font-black mb-6 text-center">
                <span className="text-gold-500">即时到账</span>
              </h4>

              <div className="space-y-4">
                {starterPack.instant.map((item, index) => (
                  <motion.div
                    key={item.name}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gold-500/10 to-transparent rounded"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: showGiftAnimation ? 1 : 0.8, x: 0 }}
                    transition={{ delay: showGiftAnimation ? index * 0.3 : 0 }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl lg:text-4xl">{item.icon}</span>
                      <div>
                        <h5 className="font-bold">{item.name}</h5>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl lg:text-2xl font-black text-gold-500">{item.amount}</div>
                      <div className="text-xs text-gray-500">价值 {item.value}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <AnimatePresence>
                {showGiftAnimation && (
                  <motion.div
                    className="text-center mt-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <div className="text-5xl lg:text-6xl mb-2">🎉</div>
                    <p className="text-gold-500 font-bold">礼包已到账！</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 任务奖励 */}
            <motion.div
              className="pixel-card p-6 lg:p-8"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg lg:text-xl font-black mb-6 text-center">
                <span className="text-gold-500">新手任务</span>
              </h4>

              <div className="space-y-3">
                {starterPack.tasks.map((task, index) => (
                  <motion.div
                    key={task.name}
                    className={cn(
                      'flex items-center justify-between p-3 rounded transition-all',
                      task.status === 'completed' 
                        ? 'bg-green-500/10 border border-green-500/30' 
                        : 'bg-gray-800 border border-gray-700'
                    )}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl lg:text-2xl">{task.icon}</span>
                      <div>
                        <h5 className="font-bold text-sm">{task.name}</h5>
                        <p className="text-xs text-gray-500">奖励: {task.reward}</p>
                      </div>
                    </div>
                    <div>
                      {task.status === 'completed' ? (
                        <span className="text-green-500 text-sm font-bold">已完成</span>
                      ) : (
                        <motion.button
                          className="text-xs px-3 py-1 bg-gold-500/20 text-gold-500 font-bold rounded hover:bg-gold-500/30 transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          去完成
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gold-500/10 rounded text-center">
                <p className="text-sm text-gold-500 font-bold">
                  完成所有任务额外获得 <span className="text-lg lg:text-xl">500 TDB</span>
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* 快速赚钱攻略 */}
        <motion.div
          className="mb-16 lg:mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl lg:text-2xl font-black text-center mb-8 lg:mb-12">
            <span className="text-gold-500">赚钱攻略</span>
            <span className="text-xs lg:text-sm block mt-2 text-gray-400 font-normal">
              从0到月入过万的进阶之路
            </span>
          </h3>

          <div className="grid lg:grid-cols-3 gap-6 px-4 lg:px-0">
            {earningStrategies.map((strategy, index) => (
              <motion.div
                key={strategy.level}
                className={cn(
                  'pixel-card p-5 lg:p-6 cursor-pointer transition-all duration-300',
                  selectedStrategy === index ? 'border-gold-500 scale-105' : 'border-gray-700'
                )}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedStrategy(index)}
                whileHover={{ y: -4 }}
              >
                <div className="text-center mb-4">
                  <div className="text-4xl lg:text-5xl mb-2">{strategy.icon}</div>
                  <h4 className="text-lg lg:text-xl font-black mb-1">{strategy.level}</h4>
                  <p className="text-gold-500 font-bold">{strategy.title}</p>
                  <div className="text-xl lg:text-2xl font-black text-green-500 mt-2">
                    ¥{strategy.daily}/天
                  </div>
                </div>

                <div className="space-y-3">
                  {strategy.strategies.map((item) => (
                    <div key={item.action} className="text-xs lg:text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold">{item.action}</span>
                        <span className="text-green-500 text-xs">{item.income}</span>
                      </div>
                      <div className="text-xs text-gray-500">用时: {item.time}</div>
                    </div>
                  ))}
                </div>

                {index === 0 && (
                  <div className="mt-4 text-center">
                    <span className="text-xs px-3 py-1 bg-green-500/20 text-green-500 font-bold rounded">
                      推荐新手
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 常见问题 */}
        <motion.div
          className="mb-16 lg:mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl lg:text-2xl font-black text-center mb-8 lg:mb-12">
            <span className="text-gold-500">常见问题</span>
            <span className="text-xs lg:text-sm block mt-2 text-gray-400 font-normal">
              90%的问题都在这里
            </span>
          </h3>

          <div className="max-w-4xl mx-auto space-y-6 px-4 lg:px-0">
            {faqData.map((category) => (
              <motion.div
                key={category.category}
                className="pixel-card p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl lg:text-3xl">{category.icon}</span>
                  <h4 className="text-lg lg:text-xl font-black">{category.category}</h4>
                </div>

                <div className="space-y-4">
                  {category.questions.map((item, index) => (
                    <motion.div
                      key={index}
                      className="border border-gray-800 rounded-lg overflow-hidden"
                    >
                      <button
                        className="w-full text-left p-4 hover:bg-gray-900 transition-all duration-200"
                        onClick={() => setExpandedFaq(
                          expandedFaq === `${category.category}-${index}` 
                            ? null 
                            : `${category.category}-${index}`
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold pr-4 text-sm lg:text-base">{item.q}</h5>
                          <motion.span
                            animate={{ rotate: expandedFaq === `${category.category}-${index}` ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-gold-500"
                          >
                            ▼
                          </motion.span>
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {expandedFaq === `${category.category}-${index}` && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-gray-800"
                          >
                            <p className="p-4 text-xs lg:text-sm text-gray-400">
                              {item.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
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
          <div className="pixel-card inline-block p-6 lg:p-8 max-w-full lg:max-w-2xl">
            <h3 className="text-xl lg:text-2xl font-black mb-4">
              <span className="text-gold-500">准备好了吗？</span>
            </h3>
            <p className="text-sm lg:text-base text-gray-400 mb-6">
              加入50,000+先行者，开启你的财富之旅
              <br />
              现在注册还能获得限时双倍礼包
            </p>
            
            <div className="flex flex-wrap gap-3 lg:gap-4 justify-center mb-6">
              <div className="flex items-center gap-2 text-xs lg:text-sm">
                <span className="text-green-500">✓</span>
                <span>3分钟快速注册</span>
              </div>
              <div className="flex items-center gap-2 text-xs lg:text-sm">
                <span className="text-green-500">✓</span>
                <span>新手礼包¥650</span>
              </div>
              <div className="flex items-center gap-2 text-xs lg:text-sm">
                <span className="text-green-500">✓</span>
                <span>专属客服指导</span>
              </div>
            </div>
            
            <motion.button
              className="pixel-btn text-base lg:text-lg px-8 lg:px-10 py-4 lg:py-5 w-full md:w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">🚀</span>
              立即注册领礼包
            </motion.button>
            
            <p className="text-xs text-gray-500 mt-4">
              已有账号？
              <a href="#" className="text-gold-500 hover:underline ml-1">
                直接登录
              </a>
            </p>
          </div>
        </motion.div>

        {/* 备案信息 */}
        <motion.div
          className="mt-12 pt-8 border-t border-gray-800 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-xs text-gray-500">
            <a 
              href="https://beian.miit.gov.cn/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-400 transition-colors"
            >
              琼ICP备2025058711号
            </a>
          </p>
        </motion.div>
      </Container>
    </section>
  )
}
