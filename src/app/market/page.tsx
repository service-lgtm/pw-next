// src/app/market/page.tsx
// 交易市场页面 - 包含粮食购买功能（使用 TDB 支付）

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { useAuth } from '@/hooks/useAuth'
import { useFoodPurchase } from '@/hooks/useFoodPurchase'
import { useInventory } from '@/hooks/useInventory'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

export default function MarketPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [showBuyModal, setShowBuyModal] = useState(false)
  
  // 获取粮食购买状态
  const { status: foodStatus, loading: foodLoading, buyFood, buying, refreshStatus } = useFoodPurchase()
  
  // 获取库存信息
  const { inventory, refetch: refetchInventory } = useInventory({
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
          购买生产所需的资源
        </p>
      </motion.div>
      
      {/* 粮食购买卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <PixelCard className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            {/* 左侧信息 */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl">🌾</span>
                <div>
                  <h2 className="text-xl font-bold">粮食</h2>
                  <p className="text-sm text-gray-400">挖矿生产必需品，每小时消耗2个/工具</p>
                </div>
              </div>
              
              {foodLoading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-gray-800 rounded animate-pulse w-32"></div>
                  <div className="h-4 bg-gray-800 rounded animate-pulse w-24"></div>
                </div>
              ) : foodStatus ? (
                <div className="space-y-3">
                  {/* 状态信息 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">当前库存</p>
                      <p className="text-lg font-bold text-yellow-400">
                        {foodStatus.current_food.toFixed(0)}
                        <span className="text-xs text-gray-400 ml-1">个</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">单价</p>
                      <p className="text-lg font-bold text-gold-500">
                        {foodStatus.unit_price}
                        <span className="text-xs text-gray-400 ml-1">TDB</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">今日已购</p>
                      <p className="text-lg font-bold">
                        {foodStatus.today_purchased}
                        <span className="text-xs text-gray-400">/{foodStatus.daily_limit}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">剩余额度</p>
                      <p className={cn(
                        "text-lg font-bold",
                        foodStatus.today_remaining > 0 ? "text-green-400" : "text-red-400"
                      )}>
                        {foodStatus.today_remaining}
                        <span className="text-xs text-gray-400 ml-1">个</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* 进度条 */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>今日购买进度</span>
                      <span>{((foodStatus.today_purchased / foodStatus.daily_limit) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all",
                          foodStatus.today_purchased >= foodStatus.daily_limit 
                            ? "bg-red-500" 
                            : foodStatus.today_purchased > foodStatus.daily_limit * 0.5 
                            ? "bg-yellow-500" 
                            : "bg-green-500"
                        )}
                        style={{ 
                          width: `${Math.min(100, (foodStatus.today_purchased / foodStatus.daily_limit) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* TDB余额提示 */}
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                    <span className="text-sm text-gray-400">TDB余额</span>
                    <span className="font-bold text-gold-500">
                      {foodStatus.tdb_balance.toFixed(2)} TDB
                    </span>
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
                <p className="text-3xl font-bold text-gold-500">48</p>
                <p className="text-xs text-gray-400">个/天</p>
                <p className="text-xs text-gray-500 mt-2">单价: 0.01 TDB</p>
              </div>
              
              <PixelButton
                onClick={() => setShowBuyModal(true)}
                disabled={!foodStatus?.can_buy || foodLoading}
                size="sm"
                className="min-w-[120px]"
              >
                {foodLoading ? '加载中...' : 
                 !foodStatus?.can_buy ? '今日额度已用完' : 
                 '立即购买'}
              </PixelButton>
              
              {foodStatus && !foodStatus.can_buy && (
                <p className="text-xs text-gray-400 text-center">
                  重置时间：
                  <br />
                  {new Date(foodStatus.next_reset_time).toLocaleString('zh-CN')}
                </p>
              )}
            </div>
          </div>
        </PixelCard>
      </motion.div>
      
      {/* 其他资源提示 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 grid md:grid-cols-2 gap-4"
      >
        <PixelCard className="p-6 bg-gray-800/50 opacity-50">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🪵</span>
            <div>
              <h3 className="text-lg font-bold">木材交易</h3>
              <p className="text-sm text-gray-400">即将开放</p>
            </div>
          </div>
        </PixelCard>
        
        <PixelCard className="p-6 bg-gray-800/50 opacity-50">
          <div className="flex items-center gap-3">
            <span className="text-4xl">⛏️</span>
            <div>
              <h3 className="text-lg font-bold">铁矿交易</h3>
              <p className="text-sm text-gray-400">即将开放</p>
            </div>
          </div>
        </PixelCard>
        
        <PixelCard className="p-6 bg-gray-800/50 opacity-50">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🪨</span>
            <div>
              <h3 className="text-lg font-bold">石材交易</h3>
              <p className="text-sm text-gray-400">即将开放</p>
            </div>
          </div>
        </PixelCard>
        
        <PixelCard className="p-6 bg-gray-800/50 opacity-50">
          <div className="flex items-center gap-3">
            <span className="text-4xl">💱</span>
            <div>
              <h3 className="text-lg font-bold">货币兑换</h3>
              <p className="text-sm text-gray-400">即将开放</p>
            </div>
          </div>
        </PixelCard>
      </motion.div>
      
      {/* 购买粮食弹窗 */}
      <BuyFoodModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        foodStatus={foodStatus}
        onSuccess={() => {
          refreshStatus()
          refetchInventory()
          setShowBuyModal(false)
        }}
      />
    </div>
  )
}

// 购买粮食弹窗组件
interface BuyFoodModalProps {
  isOpen: boolean
  onClose: () => void
  foodStatus: any
  onSuccess: () => void
}

function BuyFoodModal({ isOpen, onClose, foodStatus, onSuccess }: BuyFoodModalProps) {
  const { buyFood, buying } = useFoodPurchase()
  const [quantity, setQuantity] = useState(10)
  const [showSuccess, setShowSuccess] = useState(false)
  const [purchaseResult, setPurchaseResult] = useState<any>(null)
  
  const totalCost = quantity * (foodStatus?.unit_price || 0.01)
  const quickAmounts = [1, 10, 20, 48]
  
  const handleBuy = async () => {
    const result = await buyFood(quantity)
    if (result) {
      setPurchaseResult({
        quantity,
        totalCost: totalCost.toFixed(2),
        newBalance: (foodStatus.tdb_balance - totalCost).toFixed(2),
        newFood: foodStatus.current_food + quantity
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
  
  return (
    <PixelModal
      isOpen={isOpen}
      onClose={handleClose}
      title={showSuccess ? "购买成功" : "购买粮食"}
      size="small"
    >
      {foodStatus && (
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
                  <span className="text-gray-400">购买数量：</span>
                  <span className="font-bold text-white">{purchaseResult.quantity} 个</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">花费 TDB：</span>
                  <span className="font-bold text-gold-500">{purchaseResult.totalCost} TDB</span>
                </div>
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">当前粮食：</span>
                    <span className="font-bold text-yellow-400">{purchaseResult.newFood} 个</span>
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
                    setQuantity(10)
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
            // 原有的购买界面
            <>
              {/* 价格信息 */}
              <div className="p-4 bg-gray-800/50 rounded">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">单价</p>
                    <p className="font-bold text-gold-500">{foodStatus.unit_price} TDB</p>
                  </div>
                  <div>
                    <p className="text-gray-400">TDB余额</p>
                    <p className="font-bold text-gold-500">
                      {foodStatus.tdb_balance.toFixed(2)} TDB
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">今日已购</p>
                    <p className="font-bold">
                      {foodStatus.today_purchased}/{foodStatus.daily_limit}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">剩余额度</p>
                    <p className="font-bold text-green-400">
                      {foodStatus.today_remaining}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 购买数量 */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  购买数量
                </label>
                <div className="flex gap-2 mb-2">
                  {quickAmounts.map(amount => (
                    <button
                      key={amount}
                      onClick={() => setQuantity(Math.min(amount, foodStatus.today_remaining))}
                      disabled={amount > foodStatus.today_remaining}
                      className={cn(
                        "flex-1 py-2 rounded border transition-all",
                        amount === quantity
                          ? "bg-gold-500/20 border-gold-500 text-white"
                          : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white",
                        amount > foodStatus.today_remaining && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1}
                  max={foodStatus.today_remaining}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0
                    setQuantity(Math.min(Math.max(1, val), foodStatus.today_remaining))
                  }}
                  className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 focus:border-gold-500 rounded outline-none"
                />
              </div>
              
              {/* 费用汇总 */}
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>数量：</span>
                    <span className="font-bold">{quantity} 个</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>单价：</span>
                    <span>{foodStatus.unit_price} TDB</span>
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
              {totalCost > foodStatus.tdb_balance && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
                  <p className="text-sm text-red-400">
                    TDB余额不足，请先购买更多TDB
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
                    !foodStatus.can_buy || 
                    quantity <= 0 || 
                    totalCost > foodStatus.tdb_balance
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
