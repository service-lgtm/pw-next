'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, TrendingUp, Clock, User, ShoppingBag, Loader2, Building2, Coins } from 'lucide-react'
import { assetsApi } from '@/lib/api/assets'
import { useAuth } from '@/hooks/useAuth'
import { BetaPasswordModal } from '@/components/common/BetaPasswordModal'
import type { LandDetail } from '@/types/assets'
import { cn } from '@/lib/utils'

interface LandDetailModalProps {
  isOpen: boolean
  onClose: () => void
  land: LandDetail | null
  onPurchaseSuccess?: () => void
}

export function LandDetailModal({ isOpen, onClose, land, onPurchaseSuccess }: LandDetailModalProps) {
  const { user } = useAuth()
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')
  const [showBetaPassword, setShowBetaPassword] = useState(false)
  
  if (!land) return null
  
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return numPrice.toLocaleString('zh-CN', { maximumFractionDigits: 0 })
  }
  
  const handlePurchase = async () => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    setShowBetaPassword(true)
  }
  
  const handleBetaPasswordConfirm = async () => {
    setShowBetaPassword(false)
    
    try {
      setPurchasing(true)
      setPurchaseError('')
      
      const response = await assetsApi.lands.buy({
        land_id: land.id,
      })
      
      if (response.success) {
        onPurchaseSuccess?.()
        onClose()
      }
    } catch (err: any) {
      setPurchaseError(err.message || '购买失败')
    } finally {
      setPurchasing(false)
    }
  }
  
  return (
    <React.Fragment>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl shadow-2xl"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="relative h-48 bg-gradient-to-br from-gold-500/20 to-yellow-500/20 rounded-t-2xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Building2 className="w-16 h-16 text-gold-500 mx-auto mb-3" />
                    <h2 className="text-3xl font-bold">{land.land_id}</h2>
                    <p className="text-gray-300 mt-2">{land.blueprint.land_type_display}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {land.status === 'unowned' && (
                  <div className="bg-gradient-to-r from-gold-500/10 to-yellow-500/10 rounded-xl p-6 border border-gold-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">当前价格</p>
                        <div className="flex items-center gap-2">
                          <Coins className="w-6 h-6 text-gold-500" />
                          <p className="text-3xl font-bold text-gold-500">
                            {formatPrice(land.current_price)}
                          </p>
                          <span className="text-lg text-gold-400">TDB</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400 mb-1">单价</p>
                        <p className="text-xl font-bold">
                          {Math.round(Number(land.current_price) / land.size_sqm)} TDB/㎡
                        </p>
                      </div>
                    </div>
                    
                    {purchaseError && (
                      <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <p className="text-sm text-red-400">{purchaseError}</p>
                      </div>
                    )}
                    
                    <button
                      onClick={handlePurchase}
                      disabled={purchasing}
                      className={cn(
                        "w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2",
                        "bg-gradient-to-r from-gold-500 to-yellow-600 text-black",
                        "hover:shadow-lg hover:shadow-gold-500/25",
                        purchasing && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {purchasing ? (
                        <React.Fragment>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          处理中...
                        </React.Fragment>
                      ) : (
                        <React.Fragment>
                          <ShoppingBag className="w-5 h-5" />
                          立即购买
                        </React.Fragment>
                      )}
                    </button>
                  </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <h3 className="font-bold mb-3 text-gray-300">基本信息</h3>
                    <div className="space-y-2">
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
                      <div className="flex justify-between">
                        <span className="text-gray-400">状态</span>
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-bold",
                          land.status === 'unowned' ? "bg-green-500/20 text-green-500" : "bg-gray-700 text-gray-400"
                        )}>
                          {land.status_display}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <h3 className="font-bold mb-3 text-gray-300">建设信息</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">最大楼层</span>
                        <span className="font-medium">{land.blueprint.max_floors}层</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">建设成本</span>
                        <span className="font-medium">{formatPrice(land.blueprint.construction_cost_per_floor)} TDB/层</span>
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
                
                {land.blueprint.daily_output !== '0.0000' && (
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <h3 className="font-bold mb-3 text-gray-300">产出信息</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">日产出</p>
                        <p className="text-lg font-bold text-green-500">
                          {land.blueprint.daily_output}
                        </p>
                        <p className="text-xs text-gray-400">{land.blueprint.output_resource}</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">累计产出</p>
                        <p className="text-lg font-bold">{land.accumulated_output}</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">生产状态</p>
                        <p className="text-lg font-bold">
                          {land.is_producing ? (
                            <span className="text-green-500">生产中</span>
                          ) : (
                            <span className="text-gray-500">未生产</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h3 className="font-bold mb-3 text-gray-300">价格历史</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">初始价格</p>
                      <p className="font-bold">{formatPrice(land.initial_price)} TDB</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">历史涨幅</p>
                      <p className="font-bold text-green-500">
                        +{((Number(land.current_price) / Number(land.initial_price) - 1) * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">交易次数</p>
                      <p className="font-bold">{land.transaction_count}次</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">总交易额</p>
                      <p className="font-bold">{formatPrice(land.total_transaction_volume)} TDB</p>
                    </div>
                  </div>
                </div>
                
                {land.recent_transactions && land.recent_transactions.length > 0 && (
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <h3 className="font-bold mb-3 text-gray-300">最近交易</h3>
                    <div className="space-y-2">
                      {land.recent_transactions.slice(0, 3).map(tx => (
                        <div key={tx.id} className="bg-gray-700/50 rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{tx.transaction_type_display}</p>
                            <p className="text-xs text-gray-400">
                              {tx.from_username || '系统'} → {tx.to_username}
                            </p>
                            <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Coins className="w-4 h-4 text-gold-500" />
                              <p className="font-bold text-gold-500">
                                {formatPrice(tx.price)}
                              </p>
                              <span className="text-xs text-gold-400">TDB</span>
                            </div>
                            <p className="text-xs text-gray-400">手续费: {formatPrice(tx.fee)} TDB</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {land.owner_username && (
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <h3 className="font-bold mb-3 text-gray-300">所有者信息</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{land.owner_username}</p>
                          <p className="text-xs text-gray-400">
                            购买于 {land.owned_at ? new Date(land.owned_at).toLocaleDateString() : '未知'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <BetaPasswordModal
        isOpen={showBetaPassword}
        onClose={() => setShowBetaPassword(false)}
        onConfirm={handleBetaPasswordConfirm}
        landPrice={Number(land.current_price)}
        landId={land.land_id}
      />
    </React.Fragment>
  )
}
