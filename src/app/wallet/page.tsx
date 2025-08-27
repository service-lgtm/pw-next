/**
 * 文件: src/app/wallet/page.tsx
 * 描述: 钱包主页面 - 显示余额、转账入口、交易历史
 * 作者: Assistant
 * 创建日期: 2024-01-27
 * 
 * 文件说明：
 * 1. 本文件是钱包功能的主页面
 * 2. 显示TDB和YLD余额
 * 3. 提供转账入口
 * 4. 显示交易历史
 * 5. 使用DashboardLayout布局
 * 
 * 关联文件：
 * - src/lib/api/wallet.ts: 钱包API调用
 * - src/components/wallet/TransferModal.tsx: 转账弹窗
 * - src/components/wallet/TransactionHistory.tsx: 交易历史组件
 * - src/components/dashboard/DashboardLayout.tsx: 仪表盘布局
 * 
 * 更新历史：
 * - 2024-01-27: 初始创建
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { TransferModal } from '@/components/wallet/TransferModal'
import { TransactionHistory } from '@/components/wallet/TransactionHistory'
import { walletApi, formatBalance, type Wallet } from '@/lib/api/wallet'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

export default function WalletPage() {
  const { user } = useAuth()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // 获取钱包信息
  const fetchWallet = async () => {
    try {
      setLoading(true)
      const response = await walletApi.getMyWallet()
      
      if (response.success && response.data) {
        setWallet(response.data)
      } else {
        toast.error('获取钱包信息失败')
      }
    } catch (error) {
      console.error('获取钱包失败:', error)
      toast.error('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 初始化加载
  useEffect(() => {
    fetchWallet()
  }, [])

  // 转账成功后的回调
  const handleTransferSuccess = () => {
    setShowTransferModal(false)
    fetchWallet() // 刷新钱包余额
    setRefreshKey(prev => prev + 1) // 刷新交易历史
    toast.success('转账成功！')
  }

  // 格式化显示余额
  const tdbBalance = wallet ? parseFloat(wallet.tdb_balance) : 0
  const tdbAvailable = wallet ? parseFloat(wallet.tdb_available) : 0
  const tdbFrozen = wallet ? parseFloat(wallet.tdb_frozen) : 0
  const yldBalance = wallet ? parseFloat(wallet.yld_balance) : 0
  const yldAvailable = wallet ? parseFloat(wallet.yld_available) : 0
  const yldFrozen = wallet ? parseFloat(wallet.yld_frozen) : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载钱包信息...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-black text-white">
          我的钱包
        </h1>
        <p className="text-gray-400 mt-1">
          管理您的数字资产，安全便捷的转账服务
        </p>
      </motion.div>

      {/* 余额卡片 */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* TDB 余额卡片 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <PixelCard className="p-6 bg-gradient-to-br from-gold-500/10 to-yellow-600/10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-400 mb-1">黄金通证 (TDB)</h3>
                <p className="text-xs text-gray-500">≈ 0.01克黄金/枚</p>
              </div>
              <span className="text-3xl">💎</span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400">总余额</p>
                <p className="text-3xl font-black text-gold-500">
                  {formatBalance(tdbBalance)}
                  <span className="text-sm ml-2">TDB</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-700">
                <div>
                  <p className="text-xs text-gray-400">可用余额</p>
                  <p className="text-lg font-bold text-green-500">
                    {formatBalance(tdbAvailable)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">冻结金额</p>
                  <p className="text-lg font-bold text-gray-500">
                    {formatBalance(tdbFrozen)}
                  </p>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="mt-4 flex gap-3">
              <PixelButton
                variant="primary"
                size="sm"
                onClick={() => setShowTransferModal(true)}
                className="flex-1"
              >
                <span className="mr-1">💸</span>
                转账
              </PixelButton>
              <PixelButton
                variant="secondary"
                size="sm"
                disabled
                className="flex-1 opacity-50 cursor-not-allowed"
              >
                <span className="mr-1">💰</span>
                充值
              </PixelButton>
            </div>
          </PixelCard>
        </motion.div>

        {/* YLD 余额卡片 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <PixelCard className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-600/10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-400 mb-1">治理通证 (YLD)</h3>
                <p className="text-xs text-gray-500">限量21亿枚</p>
              </div>
              <span className="text-3xl">⚡</span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400">总余额</p>
                <p className="text-3xl font-black text-purple-500">
                  {formatBalance(yldBalance)}
                  <span className="text-sm ml-2">YLD</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-700">
                <div>
                  <p className="text-xs text-gray-400">可用余额</p>
                  <p className="text-lg font-bold text-green-500">
                    {formatBalance(yldAvailable)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">冻结金额</p>
                  <p className="text-lg font-bold text-gray-500">
                    {formatBalance(yldFrozen)}
                  </p>
                </div>
              </div>
            </div>

            {/* YLD暂不支持转账 */}
            <div className="mt-4 p-3 bg-gray-800/50 rounded text-center">
              <p className="text-xs text-gray-400">YLD转账功能即将开放</p>
            </div>
          </PixelCard>
        </motion.div>
      </div>

      {/* 统计信息 */}
      {wallet && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <PixelCard className="p-4">
            <h3 className="text-sm font-bold text-gray-400 mb-3">资金流水统计</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-400">TDB总收入</p>
                <p className="text-lg font-bold text-green-500">
                  {formatBalance(wallet.total_tdb_in)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">TDB总支出</p>
                <p className="text-lg font-bold text-red-500">
                  {formatBalance(wallet.total_tdb_out)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">YLD总收入</p>
                <p className="text-lg font-bold text-green-500">
                  {formatBalance(wallet.total_yld_in)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">YLD总支出</p>
                <p className="text-lg font-bold text-red-500">
                  {formatBalance(wallet.total_yld_out)}
                </p>
              </div>
            </div>
          </PixelCard>
        </motion.div>
      )}

      {/* 交易历史 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <TransactionHistory key={refreshKey} />
      </motion.div>

      {/* 转账弹窗 */}
      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onSuccess={handleTransferSuccess}
        availableBalance={tdbAvailable.toString()}
      />

      {/* 安全提示 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <PixelCard className="p-4 bg-orange-500/10 border-orange-500/30">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-bold text-orange-400 mb-1">安全提示</h4>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• 转账前请仔细核对接收方用户名</li>
                <li>• 转账将收取0.8%的手续费</li>
                <li>• 请妥善保管您的支付密码</li>
                <li>• 转账一旦完成无法撤销</li>
              </ul>
            </div>
          </div>
        </PixelCard>
      </motion.div>
    </div>
  )
}
