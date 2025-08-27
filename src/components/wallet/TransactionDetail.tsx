/**
 * 文件: src/components/wallet/TransactionDetail.tsx
 * 描述: 交易详情弹窗组件
 * 作者: Assistant
 * 创建日期: 2024-01-27
 * 
 * 文件说明：
 * 1. 显示交易的详细信息
 * 2. 显示审计日志
 * 3. 可复制交易号
 * 
 * 关联文件：
 * - src/lib/api/wallet.ts: 钱包API调用
 * - src/components/wallet/TransactionHistory.tsx: 交易历史组件调用此弹窗
 * 
 * 更新历史：
 * - 2024-01-27: 初始创建
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { walletApi, formatBalance } from '@/lib/api/wallet'
import toast from 'react-hot-toast'

interface TransactionDetailProps {
  transactionNo: string | null
  onClose: () => void
}

export function TransactionDetail({ transactionNo, onClose }: TransactionDetailProps) {
  const [loading, setLoading] = useState(false)
  const [transaction, setTransaction] = useState<any>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  
  // 加载交易详情
  useEffect(() => {
    if (transactionNo) {
      fetchDetail()
    } else {
      setTransaction(null)
      setAuditLogs([])
    }
  }, [transactionNo])
  
  const fetchDetail = async () => {
    if (!transactionNo) return
    
    try {
      setLoading(true)
      const response = await walletApi.getTransactionDetail(transactionNo)
      
      if (response.success && response.data) {
        setTransaction(response.data.transaction)
        setAuditLogs(response.data.audit_logs || [])
      }
    } catch (error) {
      console.error('获取交易详情失败:', error)
      toast.error('获取交易详情失败')
      onClose()
    } finally {
      setLoading(false)
    }
  }
  
  // 复制交易号
  const copyTransactionNo = () => {
    if (transaction?.transaction_no) {
      navigator.clipboard.writeText(transaction.transaction_no)
      toast.success('交易号已复制')
    }
  }
  
  // 格式化时间
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('zh-CN')
  }
  
  if (!transactionNo) return null
  
  return (
    <AnimatePresence>
      {transactionNo && (
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ pointerEvents: 'none' }}
          >
            <div 
              className="bg-[#0A1628] border-4 border-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
              style={{ pointerEvents: 'auto' }}
            >
              {/* 标题栏 */}
              <div className="bg-gradient-to-r from-purple-500/20 to-blue-600/20 p-4 border-b-4 border-gray-800 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-white">
                    交易详情
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              {/* 内容区域 */}
              <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin text-3xl mb-2">⏳</div>
                    <p className="text-gray-400">加载中...</p>
                  </div>
                ) : transaction ? (
                  <div className="space-y-6">
                    {/* 基本信息 */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 mb-3">基本信息</h3>
                      <div className="bg-gray-800/50 rounded p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">交易号:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-mono text-sm">{transaction.transaction_no}</span>
                            <button
                              onClick={copyTransactionNo}
                              className="text-xs text-gold-500 hover:text-gold-400"
                            >
                              复制
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">交易类型:</span>
                          <span className="text-white">{transaction.transaction_type}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">币种:</span>
                          <span className="text-white font-bold">{transaction.currency_type}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">状态:</span>
                          <span className={`font-bold ${
                            transaction.status === 'completed' ? 'text-green-500' :
                            transaction.status === 'pending' ? 'text-yellow-500' :
                            transaction.status === 'failed' ? 'text-red-500' :
                            'text-gray-500'
                          }`}>
                            {transaction.status === 'completed' ? '已完成' :
                             transaction.status === 'pending' ? '处理中' :
                             transaction.status === 'failed' ? '失败' :
                             transaction.status === 'cancelled' ? '已取消' :
                             transaction.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 交易双方 */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 mb-3">交易双方</h3>
                      <div className="bg-gray-800/50 rounded p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">发送方:</span>
                          <span className="text-white font-bold">
                            {transaction.from_username || '系统'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">接收方:</span>
                          <span className="text-white font-bold">
                            {transaction.to_username || '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 金额信息 */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 mb-3">金额信息</h3>
                      <div className="bg-gray-800/50 rounded p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">交易金额:</span>
                          <span className="text-green-500 font-bold text-lg">
                            {formatBalance(transaction.amount)} {transaction.currency_type}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">手续费:</span>
                          <span className="text-orange-400">
                            {formatBalance(transaction.fee)} {transaction.currency_type}
                          </span>
                        </div>
                        
                        <div className="border-t border-gray-700 pt-2 flex justify-between">
                          <span className="text-gray-400 text-sm">实际到账:</span>
                          <span className="text-white font-bold">
                            {formatBalance(transaction.actual_amount)} {transaction.currency_type}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 时间信息 */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 mb-3">时间信息</h3>
                      <div className="bg-gray-800/50 rounded p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">创建时间:</span>
                          <span className="text-white text-sm">{formatDateTime(transaction.created_at)}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">完成时间:</span>
                          <span className="text-white text-sm">
                            {transaction.completed_at ? formatDateTime(transaction.completed_at) : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 备注 */}
                    {transaction.memo && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-400 mb-3">备注信息</h3>
                        <div className="bg-gray-800/50 rounded p-4">
                          <p className="text-white text-sm">{transaction.memo}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* 审计日志 */}
                    {auditLogs.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-400 mb-3">审计日志</h3>
                        <div className="bg-gray-800/50 rounded p-4 space-y-2">
                          {auditLogs.map((log, index) => (
                            <div key={index} className="border-b border-gray-700 last:border-0 pb-2 last:pb-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-bold ${
                                  log.level === 'SUCCESS' ? 'text-green-500' :
                                  log.level === 'ERROR' ? 'text-red-500' :
                                  log.level === 'WARNING' ? 'text-yellow-500' :
                                  'text-gray-400'
                                }`}>
                                  {log.level}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDateTime(log.time)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-300">{log.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">无法获取交易详情</p>
                  </div>
                )}
              </div>
              
              {/* 底部按钮 */}
              <div className="p-4 border-t-4 border-gray-800 flex-shrink-0">
                <PixelButton
                  variant="secondary"
                  onClick={onClose}
                  className="w-full"
                >
                  关闭
                </PixelButton>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
