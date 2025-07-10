// src/components/explore/LandDetailView.tsx
// 土地详情视图组件（用于独立页面）

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, TrendingUp, Clock, User, ShoppingBag, Loader2, Building2 } from 'lucide-react'
import { assetsApi } from '@/lib/api/assets'
import { useAuth } from '@/hooks/useAuth'
import type { LandDetail } from '@/types/assets'
import { cn } from '@/lib/utils'

interface LandDetailViewProps {
  land: LandDetail
  onPurchaseSuccess?: () => void
}

export function LandDetailView({ land, onPurchaseSuccess }: LandDetailViewProps) {
  const { user } = useAuth()
  const [purchasing, setPurchasing] = useState(false)
  const [paymentPassword, setPaymentPassword] = useState('')
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')
  
  const handlePurchase = async () => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    
    if (!showPasswordInput) {
      setShowPasswordInput(true)
      return
    }
    
    if (!paymentPassword) {
      setPurchaseError('请输入支付密码')
      return
    }
    
    try {
      setPurchasing(true)
      setPurchaseError('')
      
      const response = await assetsApi.lands.buy({
        land_id: land.id,
        payment_password: paymentPassword,
      })
      
      if (response.success) {
        onPurchaseSuccess?.()
      }
    } catch (err: any) {
      setPurchaseError(err.message || '购买失败')
    } finally {
      setPurchasing(false)
    }
  }
  
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* 左侧 - 主要信息 */}
      <div className="lg:col-span-2 space-y-6">
        {/* 基本信息卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-xl p-6"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-gold-500" />
            {land.land_id}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-3">基本信息</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">类型</span>
                  <span className="font-medium">{land.blueprint.land_type_display}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">面积</span>
                  <span className="font-medium">{land.size_sqm}㎡</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">坐标</span>
                  <span className="font-medium">({land.coordinate_x}, {land.coordinate_y})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">区域</span>
                  <span className="font-medium">{land.region.name}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-3">建设信息</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">最大楼层</span>
                  <span className="font-medium">{land.blueprint.max_floors}层</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">建设成本</span>
                  <span className="font-medium">¥{Number(land.blueprint.construction_cost_per_floor)}/层</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">能源消耗</span>
                  <span className="font-medium">{land.blueprint.energy_consumption_rate}/天</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">当前等级</span>
                  <span className="font-medium">Lv.{land.construction_level}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* 产出信息 */}
        {land.blueprint.daily_output !== '0.0000' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 rounded-xl p-6"
          >
            <h3 className="font-bold mb-4">产出信息</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">日产出</p>
                <p className="text-xl font-bold text-green-500">
                  {land.blueprint.daily_output} {land.blueprint.output_resource}
                </p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">累计产出</p>
                <p className="text-xl font-bold">{land.accumulated_output}</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">生产状态</p>
                <p className="text-xl font-bold">
                  {land.is_producing ? (
                    <span className="text-green-500">生产中</span>
                  ) : (
                    <span className="text-gray-500">未生产</span>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* 交易历史 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 rounded-xl p-6"
        >
          <h3 className="font-bold mb-4">交易历史</h3>
          {land.recent_transactions && land.recent_transactions.length > 0 ? (
            <div className="space-y-3">
              {land.recent_transactions.map(tx => (
                <div key={tx.id} className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{tx.transaction_type_display}</p>
                    <p className="text-sm text-gray-400">
                      {tx.from_username || '系统'} → {tx.to_username}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gold-500">
                      ¥{Number(tx.price).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">手续费: ¥{Number(tx.fee).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">暂无交易记录</p>
          )}
        </motion.div>
      </div>
      
      {/* 右侧 - 购买信息 */}
      <div className="space-y-6">
        {/* 价格卡片 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-gold-500/20 to-yellow-500/20 rounded-xl p-6 border border-gold-500/30"
        >
          <h3 className="font-bold mb-4">价格信息</h3>
          
          <div className="text-center mb-6">
            <p className="text-sm text-gray-400 mb-2">当前价格</p>
            <p className="text-4xl font-bold text-gold-500">
              ¥{Number(land.current_price).toLocaleString()}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              单价: ¥{Math.round(Number(land.current_price) / land.size_sqm)}/㎡
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">初始价格</span>
              <span>¥{Number(land.initial_price).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">历史涨幅</span>
              <span className="text-green-500 font-bold">
                +{((Number(land.current_price) / Number(land.initial_price) - 1) * 100).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">交易次数</span>
              <span>{land.transaction_count}次</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">总交易额</span>
              <span>¥{Number(land.total_transaction_volume).toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
        
        {/* 状态信息 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 rounded-xl p-6"
        >
          <h3 className="font-bold mb-4">状态信息</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">所有权</span>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold",
                land.status === 'unowned' ? "bg-green-500/20 text-green-500" : "bg-gray-700 text-gray-400"
              )}>
                {land.status_display}
              </span>
            </div>
            
            {land.owner_username && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">所有者</span>
                <span className="font-medium">{land.owner_username}</span>
              </div>
            )}
            
            {land.owned_at && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">购买时间</span>
                <span className="text-sm">{new Date(land.owned_at).toLocaleDateString()}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">可建设</span>
              <span className={land.can_build ? "text-green-500" : "text-gray-500"}>
                {land.can_build ? '是' : '否'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">可生产</span>
              <span className={land.can_produce ? "text-green-500" : "text-gray-500"}>
                {land.can_produce ? '是' : '否'}
              </span>
            </div>
          </div>
        </motion.div>
        
        {/* 购买按钮 */}
        {land.status === 'unowned' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {showPasswordInput ? (
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="请输入支付密码"
                  value={paymentPassword}
                  onChange={(e) => setPaymentPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 rounded-lg"
                  disabled={purchasing}
                />
                {purchaseError && (
                  <p className="text-sm text-red-500">{purchaseError}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className={cn(
                      "flex-1 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2",
                      "bg-gradient-to-r from-gold-500 to-yellow-600 text-black",
                      "hover:shadow-lg hover:shadow-gold-500/25",
                      purchasing && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {purchasing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        处理中...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        确认购买
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordInput(false)
                      setPaymentPassword('')
                      setPurchaseError('')
                    }}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handlePurchase}
                className="w-full py-3 bg-gradient-to-r from-gold-500 to-yellow-600 text-black rounded-lg font-bold hover:shadow-lg hover:shadow-gold-500/25 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                立即购买
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
