// src/app/market/page.tsx
// 交易市场页面 - 支持多种资源购买（使用 TDB 支付）
//
// 文件说明：
// 1. 本页面提供资源购买功能，支持5种资源类型
// 2. 使用新的统一资源购买API
// 3. 保持向后兼容，粮食购买功能正常工作
// 4. 提供友好的用户界面和购买体验
//
// 版本历史：
// - 2025-01-28: 更新支持多资源购买
//   - 添加5种资源的购买卡片
//   - 使用新的 useResourcePurchase Hook
//   - 优化UI布局和交互体验
// - 2025-01-27: 初始版本（仅支持粮食购买）
//
// 关联文件：
// - src/hooks/useResourcePurchase.ts: 资源购买Hook
// - src/lib/api/resources.ts: 资源购买API
// - src/components/shared/: UI组件

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { useAuth } from '@/hooks/useAuth'
import { useResourcePurchase } from '@/hooks/useResourcePurchase'
import { useInventory } from '@/hooks/useInventory'
import { RESOURCE_INFO, ResourceType } from '@/lib/api/resources'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

export default function MarketPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [selectedResource, setSelectedResource] = useState<ResourceType | null>(null)
  const [showBuyModal, setShowBuyModal] = useState(false)
  
  // 获取所有资源购买状态
  const { 
    status, 
    resourceStatus, 
    wallet,
    loading, 
    buying, 
    buyResource, 
    refreshStatus,
    canBuy,
    getMaxCanBuy,
    getTotalCost
  } = useResourcePurchase({
    autoRefresh: true,
    refreshInterval: 30000, // 30秒自动刷新
    onSuccess: () => {
      refetchInventory()
    }
  })
  
  // 获取库存信息
  const { refetch: refetchInventory } = useInventory({
    category: 'materials',
    includePrices: true
  })
  
  // 检查认证状态
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录')
      router.push('/login?redirect=/market')
    }
  }, [authLoading, isAuthenticated, router])
  
  // 打开购买弹窗
  const handleOpenBuyModal = (resourceType: ResourceType) => {
    if (!canBuy(resourceType)) {
      const info = RESOURCE_INFO[resourceType]
      toast.error(`当前无法购买${info.name}`)
      return
    }
    setSelectedResource(resourceType)
    setShowBuyModal(true)
  }
  
  // 关闭购买弹窗
  const handleCloseBuyModal = () => {
    setShowBuyModal(false)
    setSelectedResource(null)
  }
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">验证登录状态...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return null
  }
  
  // 资源类型列表（按价格排序）
  const resourceTypes: ResourceType[] = ['food', 'wood', 'stone', 'iron', 'yld']
  
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-black text-white">
          交易市场
        </h1>
        <p className="text-gray-400 mt-1">
          购买生产所需的资源，使用 TDB 支付
        </p>
        
        {/* TDB余额显示 */}
        {wallet && (
          <div className="mt-4 inline-flex items-center gap-4 px-4 py-2 bg-gray-800/50 rounded">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">TDB余额：</span>
              <span className="font-bold text-gold-500">
                {wallet.tdb_balance.toFixed(2)} TDB
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">YLD余额：</span>
              <span className="font-bold text-purple-400">
                {wallet.yld_balance.toFixed(2)} YLD
              </span>
            </div>
          </div>
        )}
      </motion.div>
      
      {/* 资源购买卡片网格 */}
      <div className="grid gap-4 md:gap-6">
        {resourceTypes.map((resourceType, index) => {
          const info = RESOURCE_INFO[resourceType]
          const status = resourceStatus?.[resourceType]
          
          return (
            <motion.div
              key={resourceType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <ResourceCard
                resourceType={resourceType}
                info={info}
                status={status}
                loading={loading}
                onBuy={() => handleOpenBuyModal(resourceType)}
              />
            </motion.div>
          )
        })}
      </div>
      
      {/* 其他功能提示（即将开放） */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 grid md:grid-cols-2 gap-4"
      >
        <PixelCard className="p-6 bg-gray-800/30 opacity-60">
          <div className="flex items-center gap-3">
            <span className="text-4xl">💱</span>
            <div>
              <h3 className="text-lg font-bold">货币兑换</h3>
              <p className="text-sm text-gray-400">TDB与YLD互换 - 即将开放</p>
            </div>
          </div>
        </PixelCard>
        
        <PixelCard className="p-6 bg-gray-800/30 opacity-60">
          <div className="flex items-center gap-3">
            <span className="text-4xl">📦</span>
            <div>
              <h3 className="text-lg font-bold">批量交易</h3>
              <p className="text-sm text-gray-400">大宗资源交易 - 即将开放</p>
            </div>
          </div>
        </PixelCard>
      </motion.div>
      
      {/* 购买资源弹窗 */}
      {selectedResource && (
        <BuyResourceModal
          isOpen={showBuyModal}
          onClose={handleCloseBuyModal}
          resourceType={selectedResource}
          resourceInfo={RESOURCE_INFO[selectedResource]}
          resourceStatus={resourceStatus?.[selectedResource] || null}
          wallet={wallet}
          onBuy={buyResource}
          buying={buying}
          onSuccess={() => {
            refreshStatus()
            handleCloseBuyModal()
          }}
        />
      )}
    </div>
  )
}

// ==================== 资源卡片组件 ====================

interface ResourceCardProps {
  resourceType: ResourceType
  info: typeof RESOURCE_INFO[ResourceType]
  status?: any
  loading: boolean
  onBuy: () => void
}

function ResourceCard({ 
  resourceType, 
  info, 
  status, 
  loading, 
  onBuy 
}: ResourceCardProps) {
  const isSpecial = resourceType === 'food' || resourceType === 'yld'
  
  return (
    <PixelCard className={cn(
      "p-6",
      isSpecial && "border-gold-500/30 bg-gradient-to-br from-gray-900 to-gray-800"
    )}>
      <div className="flex flex-col md:flex-row justify-between gap-6">
        {/* 左侧信息 */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">{info.icon}</span>
            <div>
              <h2 className="text-xl font-bold">{info.name}</h2>
              <p className="text-sm text-gray-400">{info.description}</p>
            </div>
          </div>
          
          {loading ? (
            <div className="space-y-2">
              <div className="h-4 bg-gray-800 rounded animate-pulse w-32"></div>
              <div className="h-4 bg-gray-800 rounded animate-pulse w-24"></div>
            </div>
          ) : status ? (
            <div className="space-y-3">
              {/* 状态信息 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400">当前库存</p>
                  <p className="text-lg font-bold text-yellow-400">
                    {status.current_amount.toFixed(0)}
                    <span className="text-xs text-gray-400 ml-1">个</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">单价</p>
                  <p className="text-lg font-bold text-gold-500">
                    {status.unit_price}
                    <span className="text-xs text-gray-400 ml-1">TDB</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">今日已购</p>
                  <p className="text-lg font-bold">
                    {status.today_purchased}
                    <span className="text-xs text-gray-400">/{status.daily_limit}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">剩余额度</p>
                  <p className={cn(
                    "text-lg font-bold",
                    status.today_remaining > 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {status.today_remaining}
                    <span className="text-xs text-gray-400 ml-1">个</span>
                  </p>
                </div>
              </div>
              
              {/* 进度条 */}
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>今日购买进度</span>
                  <span>{((status.today_purchased / status.daily_limit) * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all",
                      status.today_purchased >= status.daily_limit 
                        ? "bg-red-500" 
                        : status.today_purchased > status.daily_limit * 0.5 
                        ? "bg-yellow-500" 
                        : "bg-green-500"
                    )}
                    style={{ 
                      width: `${Math.min(100, (status.today_purchased / status.daily_limit) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">加载失败</p>
          )}
        </div>
        
        {/* 右侧操作 */}
        <div className="flex flex-col justify-between items-center md:items-end gap-4">
          <div className="text-center md:text-right">
            <p className="text-xs text-gray-400 mb-1">每日限购</p>
            <p className="text-3xl font-bold text-gold-500">{info.dailyLimit}</p>
            <p className="text-xs text-gray-400">个/天</p>
            <p className="text-xs text-gray-500 mt-2">
              单价: {info.unitPrice} TDB | 单次最多: {info.singleLimit}个
            </p>
          </div>
          
          <PixelButton
            onClick={onBuy}
            disabled={!status?.can_buy || loading}
            variant={isSpecial ? "primary" : "secondary"}
            size="sm"
            className="min-w-[120px]"
          >
            {loading ? '加载中...' : 
             !status?.can_buy ? '今日额度已用完' : 
             '立即购买'}
          </PixelButton>
        </div>
      </div>
    </PixelCard>
  )
}

// ==================== 购买弹窗组件 ====================

interface BuyResourceModalProps {
  isOpen: boolean
  onClose: () => void
  resourceType: ResourceType
  resourceInfo: typeof RESOURCE_INFO[ResourceType]
  resourceStatus: any
  wallet: any
  onBuy: (type: ResourceType, quantity: number) => Promise<any>
  buying: boolean
  onSuccess: () => void
}

function BuyResourceModal({ 
  isOpen, 
  onClose, 
  resourceType,
  resourceInfo,
  resourceStatus, 
  wallet,
  onBuy,
  buying,
  onSuccess 
}: BuyResourceModalProps) {
  const [quantity, setQuantity] = useState(10)
  const [showSuccess, setShowSuccess] = useState(false)
  const [purchaseResult, setPurchaseResult] = useState<any>(null)
  
  // 根据资源类型设置默认数量和快捷按钮
  const getQuickAmounts = () => {
    switch (resourceType) {
      case 'food':
        return [1, 10, 20, 48]
      case 'wood':
        return [10, 50, 100, 200]
      case 'stone':
        return [10, 50, 100, 100]
      case 'iron':
        return [5, 10, 15, 20]
      case 'yld':
        return [1, 3, 5, 10]
      default:
        return [1, 5, 10, 20]
    }
  }
  
  const quickAmounts = getQuickAmounts()
  const totalCost = quantity * (resourceStatus?.unit_price || 0)
  
  const handleBuy = async () => {
    const result = await onBuy(resourceType, quantity)
    if (result && result.transaction_id) {
      setPurchaseResult({
        quantity: result.quantity,
        totalCost: result.total_cost.toFixed(2),
        newBalance: result.balance_after.toFixed(2),
        newResource: result.resource_after,
        transactionId: result.transaction_id
      })
      setShowSuccess(true)
      onSuccess()
      
      // 3秒后自动关闭
      setTimeout(() => {
        handleClose()
      }, 3000)
    }
  }
  
  const handleClose = () => {
    setShowSuccess(false)
    setPurchaseResult(null)
    setQuantity(10)
    onClose()
  }
  
  // 设置初始数量
  useEffect(() => {
    if (isOpen && resourceStatus) {
      const defaultQty = Math.min(10, resourceStatus.max_can_buy || 10)
      setQuantity(defaultQty)
    }
  }, [isOpen, resourceStatus])
  
  return (
    <PixelModal
      isOpen={isOpen}
      onClose={handleClose}
      title={showSuccess ? "购买成功" : `购买${resourceInfo.name}`}
      size="small"
    >
      {resourceStatus && wallet && (
        <div className="space-y-4">
          {showSuccess && purchaseResult ? (
            // 成功提示界面
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="text-6xl mb-4"
              >
                ✅
              </motion.div>
              
              <h3 className="text-xl font-bold text-green-400 mb-4">
                购买成功！
              </h3>
              
              <div className="space-y-3 bg-gray-800/50 rounded-lg p-4 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-400">交易编号：</span>
                  <span className="font-bold text-xs text-white break-all">
                    {purchaseResult.transactionId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">购买资源：</span>
                  <span className="font-bold text-white">
                    {resourceInfo.icon} {resourceInfo.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">购买数量：</span>
                  <span className="font-bold text-white">{purchaseResult.quantity} 个</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">花费 TDB：</span>
                  <span className="font-bold text-gold-500">{purchaseResult.totalCost} TDB</span>
                </div>
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">当前{resourceInfo.name}：</span>
                    <span className="font-bold text-yellow-400">
                      {purchaseResult.newResource} 个
                    </span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-gray-400">剩余 TDB：</span>
                    <span className="font-bold text-gold-500">{purchaseResult.newBalance} TDB</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <PixelButton
                  onClick={() => {
                    setShowSuccess(false)
                    setPurchaseResult(null)
                    setQuantity(Math.min(10, resourceStatus.max_can_buy || 10))
                  }}
                  variant="primary"
                  className="w-full"
                >
                  继续购买
                </PixelButton>
                <PixelButton
                  onClick={handleClose}
                  variant="secondary"
                  className="w-full"
                >
                  关闭
                </PixelButton>
              </div>
              
              <p className="text-xs text-gray-400 mt-4">
                窗口将在3秒后自动关闭
              </p>
            </motion.div>
          ) : (
            // 购买界面
            <>
              {/* 价格信息 */}
              <div className="p-4 bg-gray-800/50 rounded">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">单价</p>
                    <p className="font-bold text-gold-500">{resourceStatus.unit_price} TDB</p>
                  </div>
                  <div>
                    <p className="text-gray-400">TDB余额</p>
                    <p className="font-bold text-gold-500">
                      {wallet.tdb_balance.toFixed(2)} TDB
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">今日已购</p>
                    <p className="font-bold">
                      {resourceStatus.today_purchased}/{resourceStatus.daily_limit}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">剩余额度</p>
                    <p className="font-bold text-green-400">
                      {resourceStatus.today_remaining}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 购买数量 */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  购买数量（单次最多{resourceStatus.single_limit}个）
                </label>
                <div className="flex gap-2 mb-2">
                  {quickAmounts.map(amount => (
                    <button
                      key={amount}
                      onClick={() => setQuantity(Math.min(
                        amount, 
                        resourceStatus.today_remaining,
                        resourceStatus.single_limit
                      ))}
                      disabled={amount > resourceStatus.today_remaining}
                      className={cn(
                        "flex-1 py-2 rounded border transition-all",
                        amount === quantity
                          ? "bg-gold-500/20 border-gold-500 text-white"
                          : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white",
                        amount > resourceStatus.today_remaining && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1}
                  max={Math.min(resourceStatus.today_remaining, resourceStatus.single_limit)}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0
                    setQuantity(Math.min(
                      Math.max(1, val), 
                      resourceStatus.today_remaining,
                      resourceStatus.single_limit
                    ))
                  }}
                  className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 focus:border-gold-500 rounded outline-none"
                />
              </div>
              
              {/* 费用汇总 */}
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>资源：</span>
                    <span className="font-bold">
                      {resourceInfo.icon} {resourceInfo.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>数量：</span>
                    <span className="font-bold">{quantity} 个</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>单价：</span>
                    <span>{resourceStatus.unit_price} TDB</span>
                  </div>
                  <div className="border-t border-gray-700 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span>总计：</span>
                      <span className="font-bold text-gold-500 text-lg">
                        {totalCost.toFixed(2)} TDB
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 余额不足提示 */}
              {totalCost > wallet.tdb_balance && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
                  <p className="text-sm text-red-400">
                    TDB余额不足，还需要 {(totalCost - wallet.tdb_balance).toFixed(2)} TDB
                  </p>
                </div>
              )}
              
              {/* 操作按钮 */}
              <div className="flex gap-3">
                <PixelButton
                  variant="secondary"
                  onClick={handleClose}
                  className="flex-1"
                >
                  取消
                </PixelButton>
                <PixelButton
                  onClick={handleBuy}
                  disabled={
                    buying || 
                    !resourceStatus.can_buy || 
                    quantity <= 0 || 
                    quantity > resourceStatus.single_limit ||
                    totalCost > wallet.tdb_balance
                  }
                  className="flex-1"
                >
                  {buying ? '购买中...' : `确认购买`}
                </PixelButton>
              </div>
            </>
          )}
        </div>
      )}
    </PixelModal>
  )
}
