'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { cn } from '@/lib/utils'

interface Mine {
  id: string
  name: string
  type: 'iron' | 'stone' | 'forest' | 'meteor'
  status: 'idle' | 'mining' | 'hired'
  dailyOutput: number
  energy: number
}

export default function MiningPage() {
  const [mines, setMines] = useState<Mine[]>([
    { id: '1', name: '铁矿山 #12345', type: 'iron', status: 'idle', dailyOutput: 100, energy: 85 },
    { id: '2', name: '石矿山 #23456', type: 'stone', status: 'mining', dailyOutput: 120, energy: 70 },
    { id: '3', name: '森林 #34567', type: 'forest', status: 'hired', dailyOutput: 80, energy: 90 },
  ])
  
  const [selectedMine, setSelectedMine] = useState<Mine | null>(null)
  const [showMiningModal, setShowMiningModal] = useState(false)
  const [currentEnergy, setCurrentEnergy] = useState(80)

  const mineIcons = {
    iron: '⚒️',
    stone: '🪨',
    forest: '🌲',
    meteor: '💫'
  }

  const statusColors = {
    idle: 'text-gray-400',
    mining: 'text-green-500',
    hired: 'text-blue-500'
  }

  const statusText = {
    idle: '闲置中',
    mining: '开采中',
    hired: '已招聘'
  }

  const startMining = (mine: Mine) => {
    if (currentEnergy < 20) {
      alert('能量不足！')
      return
    }
    setSelectedMine(mine)
    setShowMiningModal(true)
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-black">
          <span className="text-gold-500">挖矿中心</span>
        </h1>
        
        {/* 能量显示 */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">能量值</span>
          <div className="w-32 h-6 bg-gray-800 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-gold-500"
              initial={{ width: 0 }}
              animate={{ width: `${currentEnergy}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
              {currentEnergy}%
            </span>
          </div>
        </div>
      </div>

      {/* 快速统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PixelCard className="p-4">
          <div className="text-center">
            <div className="text-3xl mb-2">⛏️</div>
            <div className="text-xl font-black text-gold-500">3</div>
            <div className="text-xs text-gray-500">我的矿山</div>
          </div>
        </PixelCard>
        <PixelCard className="p-4">
          <div className="text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-xl font-black text-green-500">300</div>
            <div className="text-xs text-gray-500">日产量</div>
          </div>
        </PixelCard>
        <PixelCard className="p-4">
          <div className="text-center">
            <div className="text-3xl mb-2">🔨</div>
            <div className="text-xl font-black text-blue-500">5</div>
            <div className="text-xs text-gray-500">可用工具</div>
          </div>
        </PixelCard>
        <PixelCard className="p-4">
          <div className="text-center">
            <div className="text-3xl mb-2">👷</div>
            <div className="text-xl font-black text-purple-500">2</div>
            <div className="text-xs text-gray-500">雇佣工人</div>
          </div>
        </PixelCard>
      </div>

      {/* 矿山列表 */}
      <PixelCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black">我的矿山</h2>
          <PixelButton size="sm">
            发布招聘 →
          </PixelButton>
        </div>

        <div className="space-y-4">
          {mines.map((mine) => (
            <motion.div
              key={mine.id}
              className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
              whileHover={{ x: 4 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{mineIcons[mine.type]}</span>
                  <div>
                    <h3 className="font-bold">{mine.name}</h3>
                    <p className="text-sm text-gray-400">
                      日产量: <span className="text-gold-500">{mine.dailyOutput}</span> | 
                      储量: <span className="text-green-500">{mine.energy}%</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={cn("text-sm font-bold", statusColors[mine.status])}>
                    {statusText[mine.status]}
                  </span>
                  {mine.status === 'idle' && (
                    <PixelButton
                      size="sm"
                      onClick={() => startMining(mine)}
                    >
                      去开采
                    </PixelButton>
                  )}
                  {mine.status === 'mining' && (
                    <PixelButton size="sm" variant="secondary">
                      查看
                    </PixelButton>
                  )}
                  {mine.status === 'hired' && (
                    <PixelButton size="sm" variant="secondary">
                      管理
                    </PixelButton>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </PixelCard>

      {/* 招聘市场 */}
      <PixelCard>
        <h2 className="text-xl font-black mb-6">招聘市场</h2>
        <div className="text-center py-8 text-gray-500">
          <div className="text-6xl mb-4">👷</div>
          <p>暂无招聘信息</p>
          <PixelButton className="mt-4">
            去打工赚钱 →
          </PixelButton>
        </div>
      </PixelCard>

      {/* 开采确认弹窗 */}
      <PixelModal
        isOpen={showMiningModal}
        onClose={() => setShowMiningModal(false)}
        title="开始开采"
      >
        {selectedMine && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{mineIcons[selectedMine.type]}</div>
              <h3 className="font-bold">{selectedMine.name}</h3>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">预计产量</span>
                <span className="font-bold">{selectedMine.dailyOutput} 矿石</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">能量消耗</span>
                <span className="font-bold text-red-500">-20%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">预计时间</span>
                <span className="font-bold">5小时</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">税收</span>
                <span className="font-bold">5%</span>
              </div>
              <div className="h-px bg-gray-700 my-2" />
              <div className="flex justify-between text-lg">
                <span className="text-gray-400">预计净收益</span>
                <span className="font-bold text-gold-500">
                  {Math.floor(selectedMine.dailyOutput * 0.95)} 矿石
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <PixelButton
                className="flex-1"
                onClick={() => {
                  // 开始挖矿逻辑
                  setCurrentEnergy(prev => prev - 20)
                  setMines(prev => prev.map(m => 
                    m.id === selectedMine.id ? { ...m, status: 'mining' } : m
                  ))
                  setShowMiningModal(false)
                }}
              >
                确认开采
              </PixelButton>
              <PixelButton
                variant="secondary"
                className="flex-1"
                onClick={() => setShowMiningModal(false)}
              >
                取消
              </PixelButton>
            </div>
          </div>
        )}
      </PixelModal>
    </div>
  )
}
