'use client'

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'

// 等级数据 - 根据要求更新
const rankingLevels = [
  {
    id: 1,
    name: '小星星',
    icon: '⭐',
    color: '#C0C0C0',
    level: '初级',
    requirements: {
      personal: '500',
      team: '0',
    },
    benefits: {
      referralBonus: '10%',
      teamBonus: '0%',
      miningSlots: '10个',
      specialPrivileges: ['新手保护期', '专属客服'],
    },
    badge: '🌟',
  },
  {
    id: 2,
    name: '大星星',
    icon: '⭐⭐',
    color: '#FFD700',
    level: '进阶',
    requirements: {
      personal: '自动升级',
      team: '5,000',
    },
    benefits: {
      referralBonus: '18%',
      teamBonus: '0%',
      miningSlots: '20个',
      specialPrivileges: ['优先客服', '专属活动'],
    },
    badge: '✨',
  },
  {
    id: 3,
    name: '木星',
    icon: '🪐',
    color: '#8B4513',
    level: '高级',
    requirements: {
      personal: '保持活跃',
      team: '150,000',
    },
    benefits: {
      referralBonus: '18%',
      teamBonus: '3%',
      miningSlots: '40个',
      specialPrivileges: ['团队分红', 'VIP通道', '内部消息'],
    },
    badge: '🌍',
  },
  {
    id: 4,
    name: '火星',
    icon: '🔴',
    color: '#DC143C',
    level: '精英',
    requirements: {
      personal: '保持活跃',
      team: '500,000',
    },
    benefits: {
      referralBonus: '18%',
      teamBonus: '7%',
      miningSlots: '80个',
      specialPrivileges: ['更高团队分红', '决策参与权', '线下聚会'],
    },
    badge: '🚀',
  },
  {
    id: 5,
    name: '土星',
    icon: '💫',
    color: '#DAA520',
    level: '大师',
    requirements: {
      personal: '保持活跃',
      team: '3,000,000',
    },
    benefits: {
      referralBonus: '18%',
      teamBonus: '10%',
      miningSlots: '160个',
      specialPrivileges: ['顶级团队分红', '战略合作', '专属投资机会'],
    },
    badge: '👑',
  },
  {
    id: 6,
    name: '金星',
    icon: '💛',
    color: '#FFD700',
    level: '宗师',
    requirements: {
      personal: '保持活跃',
      team: '10,000,000',
    },
    benefits: {
      referralBonus: '18%',
      teamBonus: '12%',
      miningSlots: '320个',
      specialPrivileges: ['平台4%分红', '董事会席位', '全球峰会'],
    },
    badge: '💎',
  },
  {
    id: 7,
    name: '水星',
    icon: '💙',
    color: '#4169E1',
    level: '传奇',
    requirements: {
      personal: '保持活跃',
      team: '30,000,000',
    },
    benefits: {
      referralBonus: '18%',
      teamBonus: '14%',
      miningSlots: '无限制',
      specialPrivileges: ['平台6%分红', '最高决策权', '永久荣誉', '专属服务器'],
    },
    badge: '🌌',
  },
]

export function RankingSystemSection() {
  const [selectedLevel, setSelectedLevel] = useState(3) // 默认选中木星
  const [showUpgradePath, setShowUpgradePath] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])

  return (
    <section ref={sectionRef} className="py-16 lg:py-24 bg-[#0A1628] relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 text-[100px] lg:text-[200px] opacity-5"
          style={{ y }}
        >
          👑
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-20 text-[100px] lg:text-[200px] opacity-5"
          style={{ y: useTransform(y, value => -value) }}
        >
          🌟
        </motion.div>
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
            <span className="pixel-font">RANKING SYSTEM</span>
            <span className="w-6 lg:w-8 h-1 bg-gold-500" />
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-black leading-tight mb-4 lg:mb-6">
            <span className="block mb-2">七星连珠</span>
            <span className="text-gold-500 pixel-text-shadow">等级越高 收益越高</span>
          </h2>
          
          <p className="text-base lg:text-xl text-gray-400">
            从小星星到水星，每一步都是财富的飞跃
            <br />
            <span className="text-gold-500 font-bold">团队越大，分红越多，实现真正的躺赚</span>
          </p>
        </motion.div>

        {/* 等级展示 - 移动端优化 */}
        <motion.div
          className="mb-16 lg:mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="relative">
            {/* 等级进度条 - 仅在大屏幕显示 */}
            <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-800 -translate-y-1/2 hidden xl:block">
              <motion.div
                className="h-full bg-gradient-to-r from-gray-500 via-gold-500 to-blue-500"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, delay: 0.5 }}
              />
            </div>

            {/* 等级卡片 - 响应式网格 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 lg:gap-4">
              {rankingLevels.map((level, index) => (
                <motion.div
                  key={level.id}
                  className={cn(
                    'pixel-card p-3 lg:p-4 cursor-pointer transition-all duration-300 relative',
                    selectedLevel === index ? 'border-gold-500 scale-105 lg:scale-110 z-10' : 'border-gray-700'
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedLevel(index)}
                  whileHover={{ y: -4 }}
                  style={{ borderColor: selectedLevel === index ? level.color : undefined }}
                >
                  <div className="text-center">
                    <motion.div
                      className="text-2xl lg:text-4xl mb-1 lg:mb-2"
                      animate={selectedLevel === index ? { 
                        rotate: [0, -10, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      {level.icon}
                    </motion.div>
                    <h4 className="font-bold text-xs lg:text-sm" style={{ color: level.color }}>
                      {level.name}
                    </h4>
                    <p className="text-xs text-gray-500 hidden lg:block">{level.level}</p>
                  </div>

                  {/* 等级标记 */}
                  <div className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 text-base lg:text-2xl">
                    {level.badge}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 等级详情 - 移动端优化布局 */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 mb-16 lg:mb-20">
          {/* 左侧：升级条件 */}
          <motion.div
            className="pixel-card p-6 lg:p-8"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg lg:text-xl font-black mb-4 lg:mb-6">
              <span style={{ color: rankingLevels[selectedLevel].color }}>
                {rankingLevels[selectedLevel].name}
              </span>
            </h3>

            <div className="space-y-4 lg:space-y-6">
              <div>
                <h4 className="text-xs lg:text-sm text-gray-500 mb-2">个人消费</h4>
                <div className="flex items-center justify-between p-3 lg:p-4 bg-gray-900 rounded">
                  <span className="font-bold text-sm lg:text-base">要求</span>
                  <span className="text-gold-500 font-black text-lg lg:text-xl">
                    {rankingLevels[selectedLevel].requirements.personal}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs lg:text-sm text-gray-500 mb-2">雇佣关系</h4>
                <div className="flex items-center justify-between p-3 lg:p-4 bg-gray-900 rounded">
                  <span className="font-bold text-sm lg:text-base">要求</span>
                  <span className="text-gold-500 font-black text-lg lg:text-xl">
                    {rankingLevels[selectedLevel].requirements.team}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 右侧：等级权益 */}
          <motion.div
            className="pixel-card p-6 lg:p-8"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg lg:text-xl font-black mb-4 lg:mb-6">
              <span style={{ color: rankingLevels[selectedLevel].color }}>
                {rankingLevels[selectedLevel].name}
              </span>
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <div className="p-3 lg:p-4 bg-gradient-to-br from-gold-500/20 to-transparent rounded">
                  <p className="text-xl lg:text-2xl font-black text-gold-500">
                    {rankingLevels[selectedLevel].benefits.referralBonus}
                  </p>
                </div>
                <div className="p-3 lg:p-4 bg-gradient-to-br from-green-500/20 to-transparent rounded">
                  <p className="text-xl lg:text-2xl font-black text-green-500">
                    {rankingLevels[selectedLevel].benefits.teamBonus}
                  </p>
                </div>
              </div>

              <div className="p-3 lg:p-4 bg-gray-900 rounded">
                <h4 className="text-xs lg:text-sm text-gray-500 mb-2">挖矿窗口</h4>
                <p className="text-lg lg:text-xl font-black">
                  {rankingLevels[selectedLevel].benefits.miningSlots}
                </p>
              </div>

              <div>
                <h4 className="text-xs lg:text-sm text-gray-500 mb-3">特殊权益</h4>
                <div className="space-y-2">
                  {rankingLevels[selectedLevel].benefits.specialPrivileges.map((privilege) => (
                    <div key={privilege} className="flex items-center gap-2">
                      <span className="text-gold-500">✓</span>
                      <span className="text-xs lg:text-sm">{privilege}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 权益对比表 - 移动端优化 */}
        <motion.div
          className="mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl lg:text-2xl font-black text-center mb-8 lg:mb-12">
            <span className="text-gold-500">权益对比</span>
            <span className="text-xs lg:text-sm block mt-2 text-gray-400 font-normal">
              等级越高，权益越丰厚
            </span>
          </h3>

          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full pixel-card min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-gray-700">
                  <th className="text-left p-2 lg:p-4 text-xs lg:text-base">等级</th>
                  {rankingLevels.map((level) => (
                    <th key={level.id} className="text-center p-2 lg:p-4">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg lg:text-2xl">{level.icon}</span>
                        <span className="text-xs font-bold" style={{ color: level.color }}>
                          {level.name}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800">
                  <td className="p-2 lg:p-4 font-bold text-xs lg:text-base">推荐奖励</td>
                  {rankingLevels.map((level) => (
                    <td key={level.id} className="text-center p-2 lg:p-4">
                      <span className={cn(
                        'font-bold text-xs lg:text-base',
                        level.benefits.referralBonus === '18%' ? 'text-gold-500' : 'text-gray-400'
                      )}>
                        {level.benefits.referralBonus}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="p-2 lg:p-4 font-bold text-xs lg:text-base">团队奖励</td>
                  {rankingLevels.map((level) => (
                    <td key={level.id} className="text-center p-2 lg:p-4">
                      <span className={cn(
                        'font-bold text-xs lg:text-base',
                        level.benefits.teamBonus !== '0%' ? 'text-green-500' : 'text-gray-600'
                      )}>
                        {level.benefits.teamBonus}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="p-2 lg:p-4 font-bold text-xs lg:text-base">挖矿窗口</td>
                  {rankingLevels.map((level) => (
                    <td key={level.id} className="text-center p-2 lg:p-4">
                      <span className="font-bold text-xs lg:text-base">
                        {level.benefits.miningSlots}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-2 lg:p-4 font-bold text-xs lg:text-base">平台分红</td>
                  {rankingLevels.map((level) => (
                    <td key={level.id} className="text-center p-2 lg:p-4">
                      {level.id === 6 ? (
                        <span className="text-gold-500 font-bold text-xs lg:text-base">4%</span>
                      ) : level.id === 7 ? (
                        <span className="text-gold-500 font-bold text-xs lg:text-base">6%</span>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
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
            <h3 className="text-xl lg:text-2xl font-black mb-3 lg:mb-4">
              <span className="text-gold-500">开启你的晋级之路</span>
            </h3>
            <p className="text-sm lg:text-base text-gray-400 mb-4 lg:mb-6">
              从小星星开始，一步步成长为传奇
              <br />
              每个等级都是财富的新台阶
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-4 lg:mb-6 text-center">
              <div>
                <div className="text-2xl lg:text-3xl font-black text-gold-500">18%</div>
                <p className="text-xs text-gray-500">最高推荐奖励</p>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-black text-green-500">14%</div>
                <p className="text-xs text-gray-500">最高团队奖励</p>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-black text-blue-500">6%</div>
                <p className="text-xs text-gray-500">平台分红</p>
              </div>
            </div>
            
            <motion.button
              className="pixel-btn text-base lg:text-lg px-6 lg:px-10 py-3 lg:py-5 w-full md:w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">🚀</span>
              立即开始升级
            </motion.button>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
