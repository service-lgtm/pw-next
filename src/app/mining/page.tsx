// src/app/mining/page.tsx
// 挖矿中心页面 - 包含陨石矿山功能

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
  isSpecial?: boolean
  yldOutput?: number // YLD产出量
  miningTime?: number // 开采时间（小时）
  roi?: number // 投资回报率
}

export default function MiningPage() {
  const [mines, setMines] = useState<Mine[]>([
    // 陨石矿山 - 特殊矿区
    { 
      id: 'meteor-1', 
      name: '陨石矿山 #YLD-007', 
      type: 'meteor', 
      status: 'idle', 
      dailyOutput: 0, // 陨石矿山不产出普通资源
      energy: 95,
      isSpecial: true,
      yldOutput: 10,
      miningTime: 5,
      roi: 15
    },
    // 普通矿山
    { id: '1', name: '铁矿山 #12345', type: 'iron', status: 'idle', dailyOutput: 100, energy: 85 },
    { id: '2', name: '石矿山 #23456', type: 'stone', status: 'mining', dailyOutput: 120, energy: 70 },
    { id: '3', name: '森林 #34567', type: 'forest', status: 'hired', dailyOutput: 80, energy: 90 },
  ])
  
  const [selectedMine, setSelectedMine] = useState<Mine | null>(null)
  const [showMiningModal, setShowMiningModal] = useState(false)
  const [currentEnergy, setCurrentEnergy] = useState(80)
  const [hasHoe, setHasHoe] = useState(true) // 是否拥有锄头
  const [hoesDurability, setHoesDurability] = useState(149) // 锄头耐久度

  const mineIcons = {
    iron: '⚒️',
    stone: '🪨',
    forest: '🌲',
    meteor: '💎'
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
    // 陨石矿山特殊检查
    if (mine.type === 'meteor') {
      if (!hasHoe) {
        alert('需要锄头才能开采陨石矿山！')
        return
      }
      if (currentEnergy < 20) {
        alert('能量不足！')
        return
      }
    } else if (currentEnergy < 20) {
      alert('能量不足！')
      return
    }
    
    setSelectedMine(mine)
    setShowMiningModal(true)
  }

  // 分离特殊矿区和普通矿区
  const meteorMines = mines.filter(m => m.isSpecial)
  const normalMines = mines.filter(m => !m.isSpecial)

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
            <div className="text-xl font-black text-gold-500">4</div>
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
            <div className="text-xl font-black text-blue-500">{hasHoe ? 1 : 0}</div>
            <div className="text-xs text-gray-500">可用锄头</div>
          </div>
        </PixelCard>
        <PixelCard className="p-4">
          <div className="text-center">
            <div className="text-3xl mb-2">💎</div>
            <div className="text-xl font-black text-purple-500">10</div>
            <div className="text-xs text-gray-500">YLD/次</div>
          </div>
        </PixelCard>
      </div>

      {/* 特殊矿区 - 陨石矿山 */}
      {meteorMines.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PixelCard className="relative overflow-hidden">
            {/* 动态星空背景 */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-600 animate-pulse" />
              <div className="absolute top-0 left-0 w-full h-full">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`
                    }}
                  />
                ))}
              </div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black flex items-center gap-2">
                  <span className="text-2xl">💫</span>
                  <span className="text-purple-400">特殊矿区</span>
                  <span className="text-sm text-gray-400">(YLD 产出)</span>
                </h2>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded">
                  特殊资产
                </span>
              </div>

              <div className="space-y-4">
                {meteorMines.map((mine) => (
                  <motion.div
                    key={mine.id}
                    className="p-4 bg-purple-900/20 rounded-lg hover:bg-purple-900/30 transition-colors border border-purple-500/30"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-5xl">{mineIcons[mine.type]}</span>
                        <div>
                          <h3 className="font-bold text-lg">{mine.name}</h3>
                          <p className="text-sm text-purple-400">
                            产出: <span className="text-purple-300 font-bold">{mine.yldOutput} YLD</span> | 
                            时间: <span className="text-purple-300">{mine.miningTime}小时</span> | 
                            ROI: <span className="text-gold-500 font-bold">{mine.roi}% /月</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            储量: <span className="text-purple-400">{mine.energy}%</span> | 
                            需要: <span className="text-blue-400">锄头 × 1</span>
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
                            className="bg-purple-500 hover:bg-purple-600"
                          >
                            {hasHoe ? '去开采' : '需要锄头'}
                          </PixelButton>
                        )}
                        {mine.status === 'mining' && (
                          <div className="text-right">
                            <p className="text-xs text-purple-400">剩余时间</p>
                            <p className="text-sm font-bold text-purple-300">04:59:32</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {mine.status === 'mining' && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: '80%' }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <div className="flex justify-between mt-2">
                          <PixelButton size="xs" variant="secondary">
                            加速 (道具)
                          </PixelButton>
                          <PixelButton size="xs" variant="secondary" className="text-red-400">
                            停止开采
                          </PixelButton>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </PixelCard>
        </motion.div>
      )}

      {/* 普通矿区 */}
      <PixelCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black flex items-center gap-2">
            <span>⛏️</span>
            普通矿区
            <span className="text-sm text-gray-400">(基础资源)</span>
          </h2>
          <PixelButton size="sm">
            发布招聘 →
          </PixelButton>
        </div>

        <div className="space-y-4">
          {normalMines.map((mine) => (
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
        title={selectedMine?.type === 'meteor' ? '💎 开始开采陨石矿' : '开始开采'}
      >
        {selectedMine && (
          <div className="space-y-4">
            {selectedMine.type === 'meteor' && (
              <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <p className="text-purple-400 font-bold">
                  你正在开采珍稀的治理通证 YLD
                </p>
              </div>
            )}

            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{mineIcons[selectedMine.type]}</div>
              <h3 className="font-bold">{selectedMine.name}</h3>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">预计产出</span>
                <span className="font-bold">
                  {selectedMine.type === 'meteor' 
                    ? `${selectedMine.yldOutput} YLD` 
                    : `${selectedMine.dailyOutput} 矿石`
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">预计时间</span>
                <span className="font-bold">
                  {selectedMine.type === 'meteor' 
                    ? `${selectedMine.miningTime} 小时` 
                    : '5小时'
                  }
                </span>
              </div>
              {selectedMine.type === 'meteor' && (
                <div className="flex justify-between">
                  <span className="text-gray-400">工具损耗</span>
                  <span className="font-bold text-orange-500">锄头 -1 耐久</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">能量消耗</span>
                <span className="font-bold text-red-500">-20%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">开采税收</span>
                <span className="font-bold">
                  {selectedMine.type === 'meteor' ? '5% (YLD)' : '5%'}
                </span>
              </div>
              <div className="h-px bg-gray-700 my-2" />
              <div className="flex justify-between text-lg">
                <span className="text-gray-400">预计净收益</span>
                <span className="font-bold text-gold-500">
                  {selectedMine.type === 'meteor' 
                    ? `${(selectedMine.yldOutput! * 0.95).toFixed(1)} YLD` 
                    : `${Math.floor(selectedMine.dailyOutput * 0.95)} 矿石`
                  }
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <PixelButton
                className="flex-1"
                onClick={() => {
                  // 开始挖矿逻辑
                  setCurrentEnergy(prev => prev - 20)
                  if (selectedMine.type === 'meteor') {
                    setHoesDurability(prev => prev - 1)
                  }
                  setMines(prev => prev.map(m => 
                    m.id === selectedMine.id ? { ...m, status: 'mining' } : m
                  ))
                  setShowMiningModal(false)
                }}
              >
                {selectedMine.type === 'meteor' 
                  ? '确认开采 (消耗锄头)' 
                  : '确认开采'
                }
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
