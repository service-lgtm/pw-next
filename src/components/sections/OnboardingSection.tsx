'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { useState } from 'react'
import { cn } from '@/lib/utils'

// 常见问题 - 删除了"多久能赚回本金"
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
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)

  return (
    <section className="py-16 lg:py-24 bg-[#0F0F1E] relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 text-6xl lg:text-8xl opacity-5 animate-pulse">🎯</div>
        <div className="absolute bottom-10 left-10 text-6xl lg:text-8xl opacity-5 animate-pulse" style={{ animationDelay: '1s' }}>🎁</div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[150px] lg:text-[200px] opacity-5 animate-pulse" style={{ animationDelay: '2s' }}>🚀</div>
      </div>

      <Container className="relative z-10">
        {/* 标题 - 修改了主标题 */}
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
            <span className="block mb-2">快速开始</span>
            <span className="text-gold-500 pixel-text-shadow">简单几步 轻松上手</span>
          </h2>
          
          <p className="text-base lg:text-xl text-gray-400">
            零基础也能玩转平行世界
            <br />
            <span className="text-sm lg:text-base mt-2 block">加入我们，开启数字财富之旅</span>
          </p>
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
                <span>极速注册</span>
              </div>
              <div className="flex items-center gap-2 text-xs lg:text-sm">
                <span className="text-green-500">✓</span>
                <span>新手礼包</span>
              </div>
              <div className="flex items-center gap-2 text-xs lg:text-sm">
                <span className="text-green-500">✓</span>
                <span>专属客服指导</span>
              </div>
            </div>
            
            <motion.a
              href="https://www.pxsj.net.cn/login"
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-btn text-base lg:text-lg px-8 lg:px-10 py-4 lg:py-5 w-full md:w-auto inline-block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">🚀</span>
              立即注册领礼包
            </motion.a>
            
            <p className="text-xs text-gray-500 mt-4">
              已有账号？
              <a 
                href="https://www.pxsj.net.cn/login" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-500 hover:underline ml-1"
              >
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
