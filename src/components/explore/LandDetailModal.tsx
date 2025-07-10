// src/components/explore/LandDetailModal.tsx
// 土地详情弹窗组件

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, TrendingUp, Clock, User, ShoppingBag, Loader2 } from 'lucide-react'
import { useLandDetail } from '@/hooks/useLands'
import { assetsApi } from '@/lib/api/assets'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface LandDetailModalProps {
  landId: number
  isOpen: boolean
  onClose: () => void
  onPurchaseSuccess?: () => void
}

export function LandDetailModal({
  landId,
  isOpen,
  onClose,
  onPurchaseSuccess,
}: LandDetailModalProps) {
  const { user } = useAuth()
  const { land, loading, error } = useLandDetail(landId)
  const [purchasing, setPurchasing] = useState(false)
  const [paymentPassword, setPaymentPassword] = useState('')
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')
  
  useEffect(() => {
    if (!isOpen) {
      setShowPasswordInput(false)
      setPaymentPassword('')
      setPurchaseError('')
    }
  }, [isOpen])
  
  const handlePurchase = async () => {
    if (!user) {
      // 跳转到登录页
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
        land_id: landId,
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
  
  if (!isOpen) return null
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold">土地详情</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* 内容 */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {loading && (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">加载中...</p>
              </div>
            )}
            
            {error && (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
              </div>
            )}
            
            {land && (
              <div className="space-y-6">
                {/* 基本信息 */}
                <div>
                  <h3 className="font-bold mb-3">基本信息</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">土地ID</p>
                      <p className="font-bold">{land.land_id}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">类型</p>
                      <p className="font-bold">{land.blueprint.land_type_display}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">面积</p>
                      <p className="font-bold">{land.size_sqm}㎡</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">位置</p>
                      <p className="font-bold">{land.region.name}</p>
                    </div>
                  </div>
                </div>
                
                {/* 价格信息 */}
                <div>
                  <h3 className="font-bold mb-3">价格信息</h3>
                  <div className="bg-gradient-to-r from-gold-500/20 to-yellow-500/20 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">当前价格</p>
                    <p className="text-3xl font-bold text-gold-500">
                      ¥{Number(land.current_price).toLocaleString()}
                    </p>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                     <div>
                       <p className="text-xs text-gray-400">初始价格</p>
                       <p className="text-sm font-bold">¥{Number(land.initial_price).toLocaleString()}</p>
                     </div>
                     <div>
                       <p className="text-xs text-gray-400">涨幅</p>
                       <p className="text-sm font-bold text-green-500">
                         +{((Number(land.current_price) / Number(land.initial_price) - 1) * 100).toFixed(2)}%
                       </p>
                     </div>
                     <div>
                       <p className="text-xs text-gray-400">交易次数</p>
                       <p className="text-sm font-bold">{land.transaction_count}次</p>
                     </div>
                   </div>
                 </div>
               </div>
               
               {/* 产出信息 */}
               {land.blueprint.daily_output !== '0.0000' && (
                 <div>
                   <h3 className="font-bold mb-3">产出信息</h3>
                   <div className="bg-gray-800/50 rounded-lg p-4">
                     <div className="flex items-center justify-between mb-3">
                       <span className="text-gray-400">日产出</span>
                       <span className="font-bold">{land.blueprint.daily_output} {land.blueprint.output_resource}</span>
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-gray-400">累计产出</span>
                       <span className="font-bold">{land.accumulated_output}</span>
                     </div>
                   </div>
                 </div>
               )}
               
               {/* 交易历史 */}
               {land.recent_transactions && land.recent_transactions.length > 0 && (
                 <div>
                   <h3 className="font-bold mb-3">最近交易</h3>
                   <div className="space-y-2">
                     {land.recent_transactions.slice(0, 5).map(tx => (
                       <div key={tx.id} className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
                         <div>
                           <p className="text-sm font-medium">{tx.transaction_type_display}</p>
                           <p className="text-xs text-gray-400">
                             {tx.from_username || '系统'} → {tx.to_username}
                           </p>
                         </div>
                         <div className="text-right">
                           <p className="text-sm font-bold text-gold-500">¥{Number(tx.price).toLocaleString()}</p>
                           <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>
           )}
         </div>
         
         {/* 底部操作 */}
         <div className="p-6 border-t border-gray-800">
           {land?.status === 'unowned' ? (
             <div>
               {showPasswordInput ? (
                 <div className="space-y-3">
                   <input
                     type="password"
                     placeholder="请输入支付密码"
                     value={paymentPassword}
                     onChange={(e) => setPaymentPassword(e.target.value)}
                     className="w-full px-4 py-2 bg-gray-800 rounded-lg"
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
                   <ShoppingBag className="w-4 h-4" />
                   立即购买
                 </button>
               )}
             </div>
           ) : (
             <div className="text-center text-gray-400">
               <User className="w-8 h-8 mx-auto mb-2" />
               <p>该土地已被 {land?.owner_username} 拥有</p>
             </div>
           )}
         </div>
       </motion.div>
     </motion.div>
   </AnimatePresence>
 )
}
