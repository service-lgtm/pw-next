'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { useState } from 'react'
import { cn } from '@/lib/utils'

// 开店流程数据
const shopOpeningSteps = [
  {
    step: 1,
    title: '准备房产',
    icon: '🏠',
    description: '拥有或租赁NFT房产',
    details: [
      '购买城市地块',
      '建造商业房产',
      '或租赁他人房产',
    ],
    time: '1天',
  },
  {
    step: 2,
    title: '提交资料',
    icon: '📄',
    description: '上传营业资质',
    details: [
      '营业执照/身份证',
      '店铺基本信息',
      '商品类目申请',
    ],
    time: '10分钟',
  },
  {
    step: 3,
    title: '签订合约',
    icon: '📝',
    description: '区块链智能合约',
    details: [
      '永久存证',
      '自动执行',
      '公平透明',
    ],
    time: '即时',
  },
  {
    step: 4,
    title: '开业大吉',
    icon: '🎉',
    description: '上架商品开始营业',
    details: [
      '上传商品',
      '设置价格',
      '接单发货',
    ],
    time: '1-3天审核',
  },
]

// 提货单系统特点
const voucherFeatures = [
  {
    icon: '📜',
    title: '预售凭证',
    description: '先买券后提货，如月饼券',
    benefits: ['提前锁定销售', '资金快速回笼', '减少库存压力'],
  },
  {
    icon: '💰',
    title: '月度分红',
    description: '持有提货单享受分红收益',
    benefits: ['5-10%月收益', '被动收入', '可随时交易'],
  },
  {
    icon: '🔄',
    title: '自由流通',
    description: '提货单可在市场交易',
    benefits: ['随时变现', '价格透明', '升值潜力'],
  },
  {
    icon: '🛡️',
    title: '链上保障',
    description: '智能合约保障权益',
    benefits: ['不可篡改', '自动执行', '100%兑付'],
  },
]

// 商家入驻案例
const merchantCases = [
  {
    name: '张老板',
    avatar: '👨‍💼',
    business: '土特产专卖',
    location: '贵州遵义',
    joinTime: '3个月前',
    achievement: '月销售额突破50万',
    testimony: '平行世界让我的土特产走向全国，提货单系统解决了我的资金周转问题！',
    stats: {
      products: 68,
      vouchers: 12000,
      revenue: '520,000',
    },
  },
  {
    name: '李姐',
    avatar: '👩',
    business: '手工艺品店',
    location: '江苏苏州',
    joinTime: '6个月前',
    achievement: '获得最佳新商家奖',
    testimony: '区块链确权让客户更信任我们，销量比实体店提升了300%！',
    stats: {
      products: 156,
      vouchers: 8500,
      revenue: '380,000',
    },
  },
  {
    name: '王总',
    avatar: '🧑‍💼',
    business: '品牌服装',
    location: '广东深圳',
    joinTime: '1年前',
    achievement: '年销售额破千万',
    testimony: '提货单分红模式太棒了，客户变成了我的合伙人，都在帮我推广！',
    stats: {
      products: 320,
      vouchers: 35000,
      revenue: '1,280,000',
    },
  },
]

// 商城优势
const marketplaceAdvantages = [
  { icon: '🏪', text: '零成本开店', subtext: '无需实体店面' },
  { icon: '🌍', text: '全国市场', subtext: '打破地域限制' },
  { icon: '⚡', text: '即时结算', subtext: '资金快速到账' },
  { icon: '🔐', text: '信任保障', subtext: '区块链存证' },
]

export function MarketplaceSection() {
  const [activeStep, setActiveStep] = useState(0)
  const [showVoucherDemo, setShowVoucherDemo] = useState(false)

  return (
    <section className="py-24 lg:py-32 bg-[#0F0F1E] relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 pixel-grid opacity-10" />
      <div className="absolute top-20 right-20 text-8xl opacity-5 animate-pulse">🛍️</div>
      <div className="absolute bottom-20 left-20 text-8xl opacity-5 animate-pulse" style={{ animationDelay: '1s' }}>💳</div>

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
            <span className="pixel-font">MARKETPLACE</span>
            <span className="w-8 h-1 bg-gold-500" />
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
            <span className="block mb-2">真实商品交易</span>
            <span className="text-gold-500 pixel-text-shadow">虚拟世界 实体经济</span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-400">
            每一件商品都是真实的，每一笔交易都上链存证
            <br />
            <span className="text-gold-500 font-bold">开店即开矿，卖货即挖矿</span>
          </p>
        </motion.div>

        {/* 商城优势展示 */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {marketplaceAdvantages.map((item, index) => (
            <motion.div
              key={item.text}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="text-5xl mb-3">{item.icon}</div>
              <h4 className="font-bold text-gold-500 mb-1">{item.text}</h4>
              <p className="text-xs text-gray-500">{item.subtext}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* 开店流程 */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-black text-center mb-12">
            <span className="text-gold-500">开店流程</span>
            <span className="text-sm block mt-2 text-gray-400 font-normal">
              4步轻松开店，开启财富之门
            </span>
          </h3>

          <div className="relative">
            {/* 进度线 */}
            <div className="absolute top-20 left-0 right-0 h-1 bg-gray-800 hidden lg:block">
              <motion.div
                className="h-full bg-gold-500"
                initial={{ width: '0%' }}
                animate={{ width: `${(activeStep + 1) * 25}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
              {shopOpeningSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  className={cn(
                    'pixel-card p-6 cursor-pointer transition-all duration-300 relative',
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
                    <div className="text-5xl mb-3">{step.icon}</div>
                    <h4 className="text-lg font-black mb-1">
                      第{step.step}步
                    </h4>
                    <p className="text-gold-500 font-bold">{step.title}</p>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-4 text-center">
                    {step.description}
                  </p>
                  
                  <ul className="space-y-2 mb-4">
                    {step.details.map((detail) => (
                      <li key={detail} className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="text-gold-500">•</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="text-center">
                    <span className="text-xs px-3 py-1 bg-gold-500/20 text-gold-500 font-bold rounded">
                      {step.time}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 提货单系统 */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-black text-center mb-12">
            <span className="text-gold-500">革命性提货单系统</span>
            <span className="text-sm block mt-2 text-gray-400 font-normal">
              预售+分红，让商品变成投资品
            </span>
          </h3>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* 左侧：特点展示 */}
            <div className="space-y-6">
              {voucherFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="pixel-card p-6"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{feature.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-lg font-black mb-2">{feature.title}</h4>
                      <p className="text-sm text-gray-400 mb-3">{feature.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {feature.benefits.map((benefit) => (
                          <span key={benefit} className="text-xs px-2 py-1 bg-gold-500/10 text-gold-500">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 右侧：提货单演示 */}
            <motion.div
              className="pixel-card p-8"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h4 className="text-xl font-black mb-6 text-center">提货单样例</h4>
              
              <div className="bg-gradient-to-br from-gold-500/20 to-transparent p-6 rounded-lg mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">🍾</span>
                  <span className="text-xs px-3 py-1 bg-green-500/20 text-green-500 font-bold">
                    生效中
                  </span>
                </div>
                
                <h5 className="text-lg font-bold mb-2">酒水提货单</h5>
                <p className="text-sm text-gray-400 mb-4">编号：#TH20240301001</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">面值</span>
                    <span className="font-bold">¥2,499</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">月分红</span>
                    <span className="text-gold-500 font-bold">8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">已分红</span>
                    <span className="text-green-500 font-bold">¥599.76</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">持有时长</span>
                    <span>3个月</span>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <motion.button
                    className="pixel-btn text-sm py-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowVoucherDemo(!showVoucherDemo)}
                  >
                    提货
                  </motion.button>
                  <motion.button
                    className="px-4 py-2 text-sm font-bold text-gold-500 border-2 border-gold-500 hover:bg-gold-500 hover:text-black transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    转让
                  </motion.button>
                </div>
              </div>
              
              <AnimatePresence>
                {showVoucherDemo && (
                  <motion.div
                    className="text-center p-4 bg-green-500/10 rounded"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <div className="text-2xl mb-2">✅</div>
                    <p className="text-sm text-green-500">提货申请已提交！</p>
                    <p className="text-xs text-gray-400 mt-1">商家将在3个工作日内发货</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>

        {/* 商家入驻案例 */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-black text-center mb-12">
            <span className="text-gold-500">成功商家</span>
            <span className="text-sm block mt-2 text-gray-400 font-normal">
              他们已经在平行世界赚到第一桶金
            </span>
          </h3>

          <div className="grid lg:grid-cols-3 gap-8">
            {merchantCases.map((merchant, index) => (
              <motion.div
                key={merchant.name}
                className="pixel-card p-6"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-5xl">{merchant.avatar}</div>
                  <div>
                    <h4 className="font-bold text-gold-500">{merchant.name}</h4>
                    <p className="text-sm text-gray-400">{merchant.business}</p>
                    <p className="text-xs text-gray-500">{merchant.location}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">入驻时间：{merchant.joinTime}</p>
                  <p className="text-sm text-green-500 font-bold">🏆 {merchant.achievement}</p>
                </div>
                
                <blockquote className="text-sm text-gray-400 italic mb-4">
                  "{merchant.testimony}"
                </blockquote>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-900 p-2 rounded">
                    <div className="text-xs text-gray-500">商品数</div>
                    <div className="text-sm font-bold">{merchant.stats.products}</div>
                  </div>
                  <div className="bg-gray-900 p-2 rounded">
                    <div className="text-xs text-gray-500">提货单</div>
                    <div className="text-sm font-bold">{merchant.stats.vouchers}</div>
                  </div>
                  <div className="bg-gray-900 p-2 rounded">
                    <div className="text-xs text-gray-500">月营收</div>
                    <div className="text-sm font-bold text-gold-500">¥{merchant.stats.revenue}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="pixel-card inline-block p-8 max-w-2xl">
            <h3 className="text-2xl font-black mb-4">
              <span className="text-gold-500">开启你的商业帝国</span>
            </h3>
            <p className="text-gray-400 mb-6">
              平行世界商城，让天下没有难做的生意
              <br />
              真实商品 + 区块链 + 提货单 = 财富新模式
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center mb-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span>0成本开店</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span>提货单分红</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span>区块链保障</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span>全国市场</span>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <motion.button
                className="pixel-btn text-lg px-8 py-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-2">🏪</span>
                我要开店
              </motion.button>
              <motion.button
                className="px-8 py-4 text-lg font-bold text-gold-500 border-4 border-gold-500 hover:bg-gold-500 hover:text-black transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-2">🛍️</span>
                逛逛商城
              </motion.button>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
