// src/components/dashboard/LandFragmentModal.tsx
// 土地碎片领取弹窗组件

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fragmentsApi } from '@/lib/api/fragments'
import type { Batch, FragmentStats } from '@/lib/api/fragments'
import toast from 'react-hot-toast'

interface LandFragmentModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LandFragmentModal({ isOpen, onClose }: LandFragmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [password, setPassword] = useState('666')
  const [batches, setBatches] = useState<Batch[]>([])
  const [stats, setStats] = useState<FragmentStats | null>(null)
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null)

  // 获取批次和统计数据
  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // 并行获取批次列表和用户统计
      const [batchesRes, statsRes] = await Promise.all([
        fragmentsApi.getBatches(),
        fragmentsApi.getMyStats()
      ])

      if (batchesRes.results && batchesRes.results.length > 0) {
        setBatches(batchesRes.results)
        // 默认选择第一个活跃批次
        const activeBatch = batchesRes.results.find(b => b.is_active)
        setCurrentBatch(activeBatch || batchesRes.results[0])
      }

      if (statsRes.success) {
        setStats(statsRes.data)
      }
    } catch (error) {
      console.error('获取数据失败:', error)
      toast.error('加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 领取碎片
  const handleClaim = async () => {
    if (!password) {
      toast.error('请输入领取密码')
      return
    }

    if (password !== '666') {
      toast.error('密码错误，请输入666')
      return
    }

    try {
      setClaiming(true)
      const response = await fragmentsApi.quickClaim(password)
      
      if (response.success) {
        toast.success(`成功领取 ${response.data.size_sqm} 平方米土地碎片！`)
        
        // 重新获取数据
        await fetchData()
        
        // 3秒后自动关闭
        setTimeout(() => {
          onClose()
        }, 3000)
      } else {
        toast.error(response.message || '领取失败')
      }
    } catch (error: any) {
      const message = error?.message || '领取失败，请稍后重试'
      
      // 处理特定错误
      if (message.includes('已领取')) {
        toast.error('您已领取过该批次的碎片，每批次限领1个')
      } else if (message.includes('领完')) {
        toast.error('碎片已领完，请等待下一批次')
      } else if (message.includes('未开放')) {
        toast.error('活动尚未开放，请稍后再试')
      } else {
        toast.error(message)
      }
    } finally {
      setClaiming(false)
    }
  }

  // 计算进度百分比
  const getProgressPercent = () => {
    if (!currentBatch) return 0
    return (currentBatch.claimed_count / currentBatch.total_fragments) * 100
  }

  // 检查是否已领取
  const hasClaimedCurrentBatch = () => {
    if (!currentBatch || !stats) return false
    const batchDetail = stats.batch_details.find(b => b.batch_id === currentBatch.id)
    return batchDetail ? batchDetail.claimed > 0 : false
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50"
            onClick={onClose}
          />

          {/* 弹窗内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-[#0A1628] border-4 border-gray-800 rounded-lg w-full max-w-lg pointer-events-auto overflow-hidden">
              {/* 标题栏 */}
              <div className="bg-gradient-to-r from-gold-500/20 to-yellow-600/20 p-6 border-b-4 border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-gold-500 flex items-center gap-2">
                      <span className="text-3xl">🎁</span>
                      土地碎片领取
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      每个批次限领1个碎片，可合成土地
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin text-4xl mb-4">⏳</div>
                  <p className="text-gray-400">加载中...</p>
                </div>
              ) : (
                <>
                  {/* 批次信息 */}
                  {currentBatch && (
                    <div className="p-6 border-b-2 border-gray-800">
                      <div className="mb-4">
                        <h3 className="font-bold text-white mb-2">{currentBatch.batch_name}</h3>
                        <p className="text-sm text-gray-400">{currentBatch.description}</p>
                      </div>

                      {/* 进度条 */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-400 mb-2">
                          <span>活动进度</span>
                          <span>{currentBatch.claimed_count} / {currentBatch.total_fragments}</span>
                        </div>
                        <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-gold-500 to-yellow-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${getProgressPercent()}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1 text-right">
                          {getProgressPercent().toFixed(1)}% 已领取
                        </p>
                      </div>

                      {/* 状态信息 */}
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-gray-800/50 p-3 rounded">
                          <p className="text-2xl font-bold text-gold-500">
                            {currentBatch.stats.available}
                          </p>
                          <p className="text-xs text-gray-400">剩余可领</p>
                        </div>
                        <div className="bg-gray-800/50 p-3 rounded">
                          <p className="text-2xl font-bold text-purple-500">
                            {currentBatch.max_claims_per_user}
                          </p>
                          <p className="text-xs text-gray-400">每人限领</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 用户统计 */}
                  {stats && (
                    <div className="p-6 border-b-2 border-gray-800">
                      <h4 className="font-bold text-white mb-3">我的碎片</h4>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-xl font-bold text-green-500">{stats.current_fragments}</p>
                          <p className="text-xs text-gray-400">当前持有</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-blue-500">{stats.total_claimed}</p>
                          <p className="text-xs text-gray-400">累计领取</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-purple-500">{stats.lands_combined}</p>
                          <p className="text-xs text-gray-400">已合成土地</p>
                        </div>
                      </div>
                      {stats.current_fragments < 300 && (
                        <p className="text-xs text-gray-400 text-center mt-3">
                          还需 {300 - stats.current_fragments} 个碎片可合成土地
                        </p>
                      )}
                    </div>
                  )}

                  {/* 领取区域 */}
                  <div className="p-6">
                    {hasClaimedCurrentBatch() ? (
                      <div className="text-center py-8">
                        <div className="text-5xl mb-4">✅</div>
                        <p className="text-lg font-bold text-green-500 mb-2">已领取</p>
                        <p className="text-sm text-gray-400">
                          您已领取过该批次的碎片
                        </p>
                      </div>
                    ) : currentBatch?.is_active ? (
                      <>
                        <div className="mb-4">
                          <label className="block text-sm text-gray-400 mb-2">领取密码</label>
                          <input
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="请输入密码"
                            className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:border-gold-500 focus:outline-none transition-colors"
                            disabled={claiming}
                          />
                         
                        </div>

                        <button
                          onClick={handleClaim}
                          disabled={claiming || !password}
                          className={`
                            w-full py-3 px-6 rounded-lg font-bold text-lg transition-all
                            ${claiming || !password
                              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-gold-500 to-yellow-600 text-white hover:scale-105 active:scale-95'
                            }
                          `}
                        >
                          {claiming ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="animate-spin">⏳</span>
                              领取中...
                            </span>
                          ) : (
                            '立即领取'
                          )}
                        </button>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-5xl mb-4">⏰</div>
                        <p className="text-lg font-bold text-gray-400 mb-2">活动未开始</p>
                        <p className="text-sm text-gray-400">
                          请等待活动开放
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
