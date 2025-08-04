'use client'

import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/utils'

const comparisonData = [
  {
    title: '传统虚拟资产',
    icon: '📊',
    description: '暴涨暴跌如过山车，今天富翁明天负翁。毫无实际价值支撑，纯靠炒作和信仰。',
    features: [
      '日波动率 ±50%',
      '空气币遍地',
      '庄家操纵严重',
      '监管风险极高',
      '归零风险常在',
    ],
  },
  {
    title: '平行世界',
    icon: '🏆',
    description: '100%瑞士银行黄金储备，银行保函安全透明。每一个黄金通证背后都是真金白银，稳如泰山。',
    features: [
      '100% 黄金储备',
      '1TDB = 0.01克黄金',
      '24小时实时审计/银行保函双向证明',
      '中国区网络游戏虚拟货币发行/交易双许可合规运营',
      '国际区数字资产/黄金/期货/第三方支付牌照全系保障',
      '5000年价值传承',
    ],
    featured: true,
  },
  {
    title: '法币稳定币',
    icon: '💵',
    description: '表面稳定实则贬值，通胀侵蚀购买力。中心化控制，随时可能归"零"。',
    features: [
      '年贬值 2-8%',
      '中心化控制',
      '政策风险',
      '冻卡风险',
      '通胀侵蚀',
    ],
  },
]

const goldAdvantages = [
  {
    icon: '🛡️',
    title: '避险属性',
    description: '经济动荡时的避风港，战争通胀都不怕',
  },
  {
    icon: '💰',
    title: '保值增值',
    description: '跑赢通胀，长期看涨，代代传承',
  },
  {
    icon: '🌍',
    title: '全球认可',
    description: '世界通用硬通货，到哪都是真金白银',
  },
  {
    icon: '⚖️',
    title: '公平定价',
    description: '国际金价透明公开，没有暗箱操作',
  },
]

export function GoldStandardSection() {
  return (
    <section id="gold" className="py-16 lg:py-24 bg-[#0A1628] relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 pixel-grid opacity-10" />
      <div className="absolute top-0 left-0 w-48 lg:w-96 h-48 lg:h-96 bg-gold-500/10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-0 right-0 w-48 lg:w-96 h-48 lg:h-96 bg-gold-500/5 rounded-full filter blur-3xl" />
      
      <Container>
        {/* Header */}
        <motion.div
          className="text-center max-w-4xl mx-auto mb-12 lg:mb-16 px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-3 text-gold-500 text-xs lg:text-sm font-bold uppercase tracking-wider mb-4 lg:mb-6">
            <span className="w-6 lg:w-8 h-1 bg-gold-500" />
            <span className="pixel-font">GOLD STANDARD</span>
            <span className="w-6 lg:w-8 h-1 bg-gold-500" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-black leading-tight mb-4 lg:mb-6">
            <span className="block mb-2">为什么我们敢说</span>
            <span className="text-gold-500 pixel-text-shadow">真金不怕火炼？</span>
          </h2>
          <p className="text-base lg:text-xl text-gray-300 leading-relaxed">
            当别人还在画饼充饥时，我们已经把
            <span className="text-gold-500 font-bold">真金白银</span>
            装进了每一个黄金通证。
            <br />
            <span className="text-sm lg:text-base text-gray-400 mt-2 block">
              5000年来，黄金从未让任何一个文明失望过。
            </span>
          </p>
        </motion.div>

        {/* 黄金优势展示 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mb-16 lg:mb-20 px-4 lg:px-0">
          {goldAdvantages.map((item, index) => (
            <motion.div
              key={item.title}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-3xl lg:text-5xl mb-3 lg:mb-4 gold-glow inline-block">{item.icon}</div>
              <h4 className="text-base lg:text-lg font-bold text-gold-500 mb-2">{item.title}</h4>
              <p className="text-xs lg:text-sm text-gray-400">{item.description}</p>
            </motion.div>
          ))}
        </div>

        {/* 对比卡片 */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16 lg:mb-20 px-4 lg:px-0">
          {comparisonData.map((item, index) => (
            <motion.div
              key={item.title}
              className={cn(
                'relative p-6 lg:p-8 transition-all duration-300',
                item.featured
                  ? 'pixel-card bg-gradient-to-b from-gold-500/20 to-gold-500/5 border-gold-500 md:scale-105 shadow-[0_0_50px_rgba(255,215,0,0.2)]'
                  : 'pixel-card bg-gray-900/50 border-gray-700 hover:border-gray-600'
              )}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {item.featured && (
                <div className="absolute -top-3 lg:-top-4 left-1/2 -translate-x-1/2 bg-gold-500 text-black px-4 lg:px-6 py-1 lg:py-2 text-xs font-black uppercase tracking-wider pixel-font whitespace-nowrap">
                  金本位标准
                </div>
              )}
              
              <div className="text-3xl lg:text-4xl mb-3 lg:mb-4">{item.icon}</div>
              <h3 className="text-lg lg:text-xl font-black mb-3">{item.title}</h3>
              <p className="text-gray-400 text-xs lg:text-sm mb-4 lg:mb-6 leading-relaxed">{item.description}</p>
              
              <ul className="space-y-2 lg:space-y-3">
                {item.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 lg:gap-3 text-xs lg:text-sm">
                    <span className={cn(
                      'text-sm lg:text-base font-bold mt-0.5',
                      item.featured ? 'text-gold-500' : 'text-gray-500'
                    )}>
                      {item.featured ? '✓' : '✗'}
                    </span>
                    <span className={item.featured ? 'text-white font-semibold' : 'text-gray-400'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* 信任背书 */}
        <motion.div
          className="text-center max-w-4xl mx-auto px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="pixel-card inline-block p-6 lg:p-8 mb-6 lg:mb-8">
            <h3 className="text-xl lg:text-2xl font-black mb-3 lg:mb-4 text-gold-500">
              为什么选择黄金？
            </h3>
            <p className="text-sm lg:text-base text-gray-300 leading-relaxed mb-4 lg:mb-6">
              从古埃及法老到现代央行，从丝绸之路到华尔街，
              <br />
              黄金是唯一经历过所有朝代更迭、经济危机、战争动乱后，
              <br />
              <span className="text-gold-500 font-bold">依然保值的资产。</span>
            </p>
            <div className="flex flex-wrap justify-center gap-3 lg:gap-4 text-xs lg:text-sm">
              <span className="px-3 lg:px-4 py-2 bg-gold-500/10 text-gold-500 font-bold">
                🏛️ 央行储备首选
              </span>
              <span className="px-3 lg:px-4 py-2 bg-gold-500/10 text-gold-500 font-bold">
                💎 永不贬值
              </span>
              <span className="px-3 lg:px-4 py-2 bg-gold-500/10 text-gold-500 font-bold">
                🌏 全球通用
              </span>
            </div>
          </div>

          <motion.p
            className="text-2xl lg:text-3xl font-black text-gold-500 pixel-text-shadow pixel-font"
          >
            真金不怕火炼 · 实力不惧考验
          </motion.p>
        </motion.div>
      </Container>
    </section>
  )
}
