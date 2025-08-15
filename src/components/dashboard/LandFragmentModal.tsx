// src/components/dashboard/LandFragmentModal.tsx
// 土地碎片领取弹窗组件 - 优化版

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
  const [password, setPassword] = useState('')
  const [batches, setBatches] = useState<Batch[]>([])
  const [stats, setStats] = useState<FragmentStats | null>(null)
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [claimedFragment, setClaimedFragment] = useState<any>(null)

  // 获取批次和统计数据
  useEffect(() => {
    if (isOpen) {
      fetchData()
      // 重置状态
      setShowSuccess(false)
      setPassword('')
    }
  }, [isOpen])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // 并行获取批次列表和用户统计
      const [batchesRes, statsRes] = await Promise.all([
        fragmentsApi.getBatches().catch(() => ({ results: [] })),
        fragmentsApi.getMyStats().catch(() => null)
      ])

      if (batchesRes.results && batchesRes.results.length > 0) {
        setBatches(batchesRes.results)
        // 默认选择第一个活跃批次
        const activeBatch = batchesRes.results.find(b => b.is_active)
        setCurrentBatch(activeBatch || batchesRes.results[0])
      }

      if (statsRes?.success) {
        setStats(statsRes.data)
      }
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 领取碎片
  const handleClaim = async () => {
    if (!password) {
      toast.error('请输入领取密码', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#1f2937',
          color: '#fff',
          borderRadius: '8px',
          border: '1px solid #ef4444',
        }
      })
      return
    }

    try {
      setClaiming(true)
      
      // 调用API
      const response = await fragmentsApi.quickClaim(password)
      console.log('API响应:', response) // 调试用
      
      // 检查响应
      if (!response) {
        throw new Error('服务器无响应')
      }
      
      // 处理成功
      if (response.success === true && response.data) {
        // 保存领取信息
        setClaimedFragment(response.data)
        setShowSuccess(true)
        
        // 成功提示
        toast.success(`🎉 成功领取 ${response.data.size_sqm} 平方米土地碎片！`, {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#10b981',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 20px',
            fontSize: '14px'
          }
        })
        
        // 重新获取数据
        setTimeout(() => {
          fetchData()
        }, 1000)
        
        // 5秒后自动关闭
        setTimeout(() => {
          setShowSuccess(false)
          onClose()
        }, 5000)
        
        return
      }
      
      // 处理失败
      if (response.success === false) {
        const message = response.message || '领取失败'
        
        // 根据不同错误显示不同提示
        if (message.includes('已领取') || message === "您已领取过该批次的碎片，每批次限领1个") {
          toast.error('您已领取过该批次的碎片，每批次限领1个', {
            duration: 5000,
            position: 'top-center',
            icon: '⚠️',
            style: {
              background: '#dc2626',
              color: '#fff',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '14px'
            }
          })
          // 刷新数据
          fetchData()
        } else if (message.includes('密码错误') || message.includes('领取密码错误')) {
          toast.error('领取密码错误，请输入正确的密码', {
            duration: 4000,
            position: 'top-center',
            icon: '❌',
            style: {
              background: '#dc2626',
              color: '#fff',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '14px'
            }
          })
        } else if (message.includes('领完')) {
          toast.error('碎片已领完，请等待下一批次', {
            duration: 4000,
            position: 'top-center',
            icon: '😔',
            style: {
              background: '#f59e0b',
              color: '#fff',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '14px'
            }
          })
        } else if (message.includes('未开放')) {
          toast.error('活动尚未开放，请稍后再试', {
            duration: 4000,
            position: 'top-center',
            icon: '⏰',
            style: {
              background: '#6b7280',
              color: '#fff',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '14px'
            }
          })
        } else if (message.includes('今日领取已达上限')) {
          toast.error('今日全平台领取已达上限，请明天再来', {
            duration: 4000,
            position: 'top-center',
            icon: '📅',
            style: {
              background: '#f59e0b',
              color: '#fff',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '14px'
            }
          })
        } else {
          // 其他错误
          toast.error(message, {
            duration: 4000,
            position: 'top-center',
            style: {
              background: '#dc2626',
              color: '#fff',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '14px'
            }
          })
        }
        
        return
      }
      
      // 未知响应格式
      throw new Error('服务器响应格式错误')
      
    } catch (error: any) {
      console.error('领取失败:', error)
      
      // 网络或其他错误
      const errorMessage = error?.message || '网络错误，请稍后重试'
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
        icon: '❌',
        style: {
          background: '#dc2626',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 20px',
          fontSize: '14px'
        }
      })
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
            className="fixed inset-0 bg-black/70 z-[9999]"
            onClick={onClose}
          />

          {/* 弹窗内容 - 优化移动端显示 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-[#0A1628] border-4 border-gray-800 rounded-lg w-full max-w-lg pointer-events-auto overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* 标题栏 */}
              <div className="bg-gradient-to-r from-gold-500/20 to-yellow-600/20 p-4 md:p-6 border-b-4 border-gray-800 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-gold-500 flex items-center gap-2">
                      <span className="text-2xl md:text-3xl">🎁</span>
                      土地碎片领取
                    </h2>
                    <p className="text-xs md:text-sm text-gray-400 mt-1">
                      集齐碎片可合成土地
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors text-2xl p-2"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="p-8 md:p-12 text-center">
                  <div className="animate-spin text-4xl mb-4">⏳</div>
                  <p className="text-gray-400">加载中...</p>
                </div>
              ) : (
                <>
                  {/* 重要提示 */}
                  <div className="bg-orange-500/10 border-l-4 border-orange-500 p-3 md:p-4 m-4 md:m-6 mb-0">
                    <div className="flex items-start gap-2 md:gap-3">
                      <span className="text-xl md:text-2xl">📢</span>
                      <div>
                        <p className="text-xs md:text-sm font-bold text-orange-400">活动规则</p>
                        <p className="text-xs text-gray-300 mt-1">
                          每批次每人限领<span className="font-bold text-orange-400"> 1 个</span>碎片，集齐碎片可合成土地
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 批次信息 */}
                  {currentBatch && (
                    <div className="p-4 md:p-6 border-b-2 border-gray-800">
                      <div className="mb-4">
                        <h3 className="font-bold text-white text-sm md:text-base mb-2">{currentBatch.batch_name}</h3>
                        <p className="text-xs md:text-sm text-gray-400">{currentBatch.description}</p>
                      </div>

                      {/* 状态信息 */}
                      <div className="grid grid-cols-2 gap-3 md:gap-4 text-center">
                        <div className="bg-gray-800/50 p-2 md:p-3 rounded">
                          <p className="text-lg md:text-2xl font-bold text-gold-500">
                            {currentBatch.stats?.available || currentBatch.total_fragments}
                          </p>
                          <p className="text-xs text-gray-400">剩余可领</p>
                        </div>
                        <div className="bg-gray-800/50 p-2 md:p-3 rounded border-2 border-red-500/30">
                          <p className="text-lg md:text-2xl font-bold text-red-400">
                            1
                          </p>
                          <p className="text-xs text-gray-400">每人限领</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 用户统计 */}
                  {stats && (
                    <div className="p-4 md:p-6 border-b-2 border-gray-800">
                      <h4 className="font-bold text-white text-sm md:text-base mb-3">我的碎片</h4>
                      <div className="grid grid-cols-3 gap-2 md:gap-3 text-center">
                        <div>
                          <p className="text-lg md:text-xl font-bold text-green-500">{stats.current_fragments}</p>
                          <p className="text-xs text-gray-400">当前持有</p>
                        </div>
                        <div>
                          <p className="text-lg md:text-xl font-bold text-blue-500">{stats.total_claimed}</p>
                          <p className="text-xs text-gray-400">累计领取</p>
                        </div>
                        <div>
                          <p className="text-lg md:text-xl font-bold text-purple-500">{stats.lands_combined}</p>
                          <p className="text-xs text-gray-400">已合成土地</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 text-center mt-3">
                        积攒碎片可用于合成土地
                      </p>
                    </div>
                  )}

                  {/* 领取区域 */}
                  <div className="p-4 md:p-6">
                    {/* 成功恭喜界面 */}
                    {showSuccess && claimedFragment ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6 md:py-8"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1, rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className="text-5xl md:text-6xl mb-4"
                        >
                          🎉
                        </motion.div>
                        <h3 className="text-xl md:text-2xl font-black text-gold-500 mb-3">
                          恭喜您！
                        </h3>
                        <p className="text-base md:text-lg text-white mb-2">
                          成功领取 <span className="text-gold-500 font-bold">{claimedFragment.size_sqm}</span> 平方米土地碎片
                        </p>
                        <p className="text-xs md:text-sm text-gray-400 mb-4">
                          来自：{claimedFragment.batch_name}
                        </p>
                        <div className="bg-gold-500/10 border border-gold-500/30 rounded-lg p-3 md:p-4">
                          <p className="text-xs md:text-sm text-gold-400">
                            碎片编号：{claimedFragment.fragment_id}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 mt-4">
                          窗口将在5秒后自动关闭
                        </p>
                      </motion.div>
                    ) : hasClaimedCurrentBatch() ? (
                      <div className="text-center py-6 md:py-8">
                        <div className="text-4xl md:text-5xl mb-4">✅</div>
                        <p className="text-base md:text-lg font-bold text-green-500 mb-2">已领取</p>
                        <p className="text-xs md:text-sm text-gray-400 mb-2">
                          您已领取过该批次的碎片
                        </p>
                        <p className="text-xs text-red-400 font-bold">
                          每批次每人限领1个，请等待下一批次
                        </p>
                      </div>
                    ) : currentBatch?.is_active ? (
                      <>
                        <div className="text-center mb-4">
                          <div className="inline-flex items-center gap-2 bg-gold-500/10 px-3 md:px-4 py-2 rounded-full">
                            <span className="text-xl md:text-2xl">🎁</span>
                            <span className="text-xs md:text-sm font-bold text-gold-400">
                              限时福利，每人限领1个
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-xs md:text-sm text-gray-400 mb-2">领取密码</label>
                          <input
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="请输入领取密码"
                            className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white text-sm md:text-base focus:border-gold-500 focus:outline-none transition-colors"
                            disabled={claiming}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !claiming && password) {
                                handleClaim()
                              }
                            }}
                          />
                        </div>

                        <button
                          onClick={handleClaim}
                          disabled={claiming || !password}
                          className={`
                            w-full py-3 md:py-4 px-4 md:px-6 rounded-lg font-bold text-base md:text-lg transition-all
                            ${claiming || !password
                              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-gold-500 to-yellow-600 text-white hover:scale-105 active:scale-95 shadow-lg'
                            }
                          `}
                        >
                          {claiming ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="animate-spin">⏳</span>
                              领取中...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <span className="text-xl md:text-2xl">🎁</span>
                              立即领取土地碎片
                            </span>
                          )}
                        </button>

                        <p className="text-xs text-center text-gray-400 mt-3 md:mt-4">
                          ⚠️ 每批次每人只能领取1个碎片，请确认后领取
                        </p>
                      </>
                    ) : (
                      <div className="text-center py-6 md:py-8">
                        <div className="text-4xl md:text-5xl mb-4">⏰</div>
                        <p className="text-base md:text-lg font-bold text-gray-400 mb-2">活动未开始</p>
                        <p className="text-xs md:text-sm text-gray-400">
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
