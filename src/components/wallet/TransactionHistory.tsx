/**
 * 文件: src/components/wallet/TransactionHistory.tsx
 * 描述: 交易历史组件 - 显示转账记录
 * 作者: Assistant
 * 创建日期: 2024-01-27
 * 
 * 文件说明：
 * 1. 本文件实现交易历史列表显示
 * 2. 支持按方向、币种、时间筛选
 * 3. 支持分页加载
 * 4. 点击可查看交易详情
 * 
 * 关联文件：
 * - src/lib/api/wallet.ts: 钱包API调用
 * - src/app/wallet/page.tsx: 钱包主页面使用此组件
 * - src/components/wallet/TransactionDetail.tsx: 交易详情弹窗
 * 
 * 更新历史：
 * - 2024-01-27: 初始创建
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { TransactionDetail } from './TransactionDetail'
import { walletApi, formatBalance, type Transaction } from '@/lib/api/wallet'
import toast from 'react-hot-toast'

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  // 筛选条件
  const [direction, setDirection] = useState<'all' | 'sent' | 'received'>('all')
  const [currencyType, setCurrencyType] = useState<'all' | 'TDB' | 'YLD'>('all')

  // 选中的交易
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null)

  // 加载交易历史
  const fetchTransactions = async (pageNum: number = 1) => {
    try {
      setLoading(true)

      const response = await walletApi.getTransferHistory({
        direction,
        currency_type: currencyType,
        page: pageNum,
        page_size: 10
      })

      if (response.success && response.data) {
        if (pageNum === 1) {
          setTransactions(response.data.results)
        } else {
          setTransactions(prev => [...prev, ...response.data.results])
        }
        setTotal(response.data.total)
        setHasMore(response.data.results.length === 10 && pageNum * 10 < response.data.total)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('获取交易历史失败:', error)
      toast.error('获取交易历史失败')
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    fetchTransactions(1)
  }, [direction, currencyType])

  // 加载更多
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchTransactions(page + 1)
    }
  }

  // 获取交易状态样式
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500'
      case 'pending':
        return 'text-yellow-500'
      case 'failed':
        return 'text-red-500'
      case 'cancelled':
        return 'text-gray-500'
      default:
        return 'text-gray-400'
    }
  }

  // 获取交易状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成'
      case 'pending':
        return '处理中'
      case 'failed':
        return '失败'
      case 'cancelled':
        return '已取消'
      default:
        return status
    }
  }

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
    } else if (days === 1) {
      return `昨天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  return (
    <>
      <PixelCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-white">交易历史</h3>
          <span className="text-sm text-gray-400">共 {total} 条记录</span>
        </div>

        {/* 筛选栏 */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setDirection('all')}
              className={`px-3 py-1 text-sm rounded transition-colors ${direction === 'all'
                  ? 'bg-gold-500 text-black font-bold'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
            >
              全部
            </button>
            <button
              onClick={() => setDirection('sent')}
              className={`px-3 py-1 text-sm rounded transition-colors ${direction === 'sent'
                  ? 'bg-gold-500 text-black font-bold'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
            >
              转出
            </button>
            <button
              onClick={() => setDirection('received')}
              className={`px-3 py-1 text-sm rounded transition-colors ${direction === 'received'
                  ? 'bg-gold-500 text-black font-bold'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
            >
              转入
            </button>
          </div>

          {/* <div className="flex gap-2">
            <button
              onClick={() => setCurrencyType('all')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                currencyType === 'all' 
                  ? 'bg-purple-500 text-white font-bold' 
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              全部币种
            </button>
            <button
              onClick={() => setCurrencyType('TDB')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                currencyType === 'TDB' 
                  ? 'bg-purple-500 text-white font-bold' 
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              TDB
            </button>
            <button
              onClick={() => setCurrencyType('YLD')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                currencyType === 'YLD' 
                  ? 'bg-purple-500 text-white font-bold' 
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              YLD
            </button>
          </div> */}
        </div>

        {/* 交易列表 */}
        {loading && page === 1 ? (
          <div className="text-center py-8">
            <div className="animate-spin text-2xl mb-2">⏳</div>
            <p className="text-gray-400 text-sm">加载中...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-gray-400">暂无交易记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, index) => (
              <motion.div
                key={tx.transaction_no}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800/50 rounded p-4 hover:bg-gray-800 transition-colors cursor-pointer"
                onClick={() => setSelectedTransaction(tx.transaction_no)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* 第一行：类型和状态 */}
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">
                        {tx.from_username ? '📤' : '📥'}
                      </span>
                      <span className="font-bold text-white">
                        {tx.from_username ? `转账给 ${tx.to_username}` : `收到来自 ${tx.from_username || '系统'}的转账`}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${getStatusStyle(tx.status)}`}>
                        {getStatusText(tx.status)}
                      </span>
                    </div>

                    {/* 第二行：金额和手续费 */}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-400">
                        金额:
                        <span className={`ml-1 font-bold ${tx.from_username ? 'text-red-400' : 'text-green-400'}`}>
                          {tx.from_username ? '-' : '+'}{formatBalance(tx.amount)} {tx.currency_type}
                        </span>
                      </span>
                      {parseFloat(tx.fee) > 0 && (
                        <span className="text-gray-400">
                          手续费: <span className="text-orange-400">{formatBalance(tx.fee)}</span>
                        </span>
                      )}
                    </div>

                    {/* 第三行：备注和时间 */}
                    <div className="flex items-center justify-between mt-2">
                      {tx.memo && (
                        <span className="text-xs text-gray-500">
                          备注: {tx.memo}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatTime(tx.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* 箭头图标 */}
                  <div className="ml-4 text-gray-400">
                    →
                  </div>
                </div>
              </motion.div>
            ))}

            {/* 加载更多 */}
            {hasMore && (
              <div className="text-center pt-4">
                <PixelButton
                  variant="secondary"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? '加载中...' : '加载更多'}
                </PixelButton>
              </div>
            )}
          </div>
        )}
      </PixelCard>

      {/* 交易详情弹窗 */}
      <TransactionDetail
        transactionNo={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </>
  )
}
