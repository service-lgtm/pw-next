// src/components/explore/LandDetailModal.tsx
// 土地详情弹窗组件 - 优化交互体验

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, MapPin, TrendingUp, Clock, User, ShoppingBag, Loader2, 
  Building2, Coins, Activity, Calendar, Info, CheckCircle,
  AlertCircle, Lock, Eye, EyeOff, Sparkles, Shield
} from 'lucide-react'
import { useLandDetail } from '@/hooks/useLands'
import { assetsApi } from '@/lib/api/assets'
import { useRequireAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'

interface LandDetailModalProps {
  landId: number
  isOpen: boolean
  onClose: () => void
  onPurchaseSuccess?: () => void
}

// 支付密码输入组件
function PaymentPasswordInput({ 
  value, 
  onChange, 
  error,
  loading,
  onSubmit 
}: {
  value: string
  onChange: (value: string) => void
  error?: string
  loading?: boolean
  onSubmit: () => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  
  // 使用6位数字密码输入
  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (value && !/^\d$/.test(value)) return
    
    const newDigits = [...digits]
    newDigits[index] = value
    setDigits(newDigits)
    
    // 自动跳到下一个输入框
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
    
    // 更新完整密码
    const fullPassword = newDigits.join('')
    onChange(fullPassword)
    
    // 如果输入完成，自动提交
    if (fullPassword.length === 6) {
      setTimeout(onSubmit, 100)
    }
  }
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }
  
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (/^\d+$/.test(pastedData)) {
      const newDigits = pastedData.split('').concat(Array(6).fill('')).slice(0, 6)
      setDigits(newDigits)
      onChange(newDigits.join(''))
      
      // 聚焦到下一个空位或最后一位
      const nextEmptyIndex = newDigits.findIndex(d => !d)
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus()
      } else {
        inputRefs.current[5]?.focus()
      }
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-bold mb-2">请输入支付密码</h3>
        <p className="text-sm text-gray-400">输入6位数字支付密码完成购买</p>
      </div>
      
      {/* 6位数字输入框 */}
      <div className="flex justify-center gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type={showPassword ? "text" : "password"}
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={loading}
            className={cn(
              "w-12 h-12 text-center text-xl font-bold bg-gray-800 rounded-lg",
              "border-2 transition-all",
              error 
                ? "border-red-500 shake" 
                : digit 
                  ? "border-gold-500" 
                  : "border-gray-700 focus:border-purple-500",
              "focus:outline-none focus:ring-2 focus:ring-purple-500/20",
              loading && "opacity-50"
            )}
            autoFocus={index === 0}
          />
        ))}
      </div>
      
      {/* 显示/隐藏密码 */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPassword ? '隐藏密码' : '显示密码'}
        </button>
      </div>
      
      {/* 错误提示 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 px-4 py-2 rounded-lg"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}

export function LandDetailModal({
  landId,
  isOpen,
  onClose,
  onPurchaseSuccess,
}: LandDetailModalProps) {
  const { requireAuth, isAuthenticated } = useRequireAuth()
  const { land, loading, error } = useLandDetail(landId)
  const [purchasing, setPurchasing] = useState(false)
  const [paymentPassword, setPaymentPassword] = useState('')
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  
  useEffect(() => {
    if (!isOpen) {
      // 重置所有状态
      setShowPasswordInput(false)
      setPaymentPassword('')
      setPurchaseError('')
      setPurchaseSuccess(false)
    }
  }, [isOpen])
  
  const handlePurchaseClick = () => {
    // 先检查是否登录
    if (!requireAuth()) {
      return // requireAuth 会自动跳转到登录页
    }
    
    setShowPasswordInput(true)
    setPurchaseError('')
  }
  
  const handlePurchaseSubmit = async () => {
    if (paymentPassword.length !== 6) {
      setPurchaseError('请输入完整的6位支付密码')
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
        setPurchaseSuccess(true)
        
        // 播放成功动画
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF6347']
        })
        
        // 延迟关闭，让用户看到成功提示
        setTimeout(() => {
          onPurchaseSuccess?.()
        }, 2000)
      }
    } catch (err: any) {
      // 清空密码输入
      setPaymentPassword('')
      
      // 处理不同类型的错误
      if (err.message?.includes('密码错误')) {
        setPurchaseError('支付密码错误，请重新输入')
      } else if (err.message?.includes('余额不足')) {
        setPurchaseError('账户余额不足，请先充值')
      } else if (err.message?.includes('已被购买')) {
        setPurchaseError('该土地已被其他用户购买')
      } else {
        setPurchaseError(err.message || '购买失败，请稍后重试')
      }
    } finally {
      setPurchasing(false)
    }
  }
  
  if (!isOpen) return null
  
  const isAvailable = land?.status === 'unowned'
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="relative bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-6 border-b border-gray-700">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 hover:bg-white/10 rounded-lg transition-all"
              disabled={purchasing}
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">土地详情</h2>
                <p className="text-sm text-gray-400">查看土地信息并购买</p>
              </div>
            </div>
          </div>
          
          {/* 内容区域 */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {loading && (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
                <p className="text-gray-400">加载土地信息中...</p>
              </div>
            )}
            
            {error && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-400">{error}</p>
              </div>
            )}
            
            {land && !purchaseSuccess && (
              <div className="space-y-6">
                {/* 基本信息卡片 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-xl p-5 border border-white/10"
                >
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-purple-400" />
                    基本信息
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">土地编号</p>
                      <p className="font-mono font-bold">{land.land_id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">类型</p>
                      <p className="font-bold flex items-center gap-2">
                        <span className="text-lg">
                          {land.blueprint.land_type === 'urban' ? '🏢' : 
                           land.blueprint.land_type === 'farm' ? '🌾' : '⛏️'}
                        </span>
                        {land.blueprint.land_type_display}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">位置</p>
                      <p className="font-bold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-purple-400" />
                        {land.region.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">坐标</p>
                      <p className="font-mono">({land.coordinate_x}, {land.coordinate_y})</p>
                    </div>
                  </div>
                </motion.div>
                
                {/* 价格信息 - 突出显示 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={cn(
                    "relative rounded-xl p-5 border overflow-hidden",
                    isAvailable 
                      ? "bg-gradient-to-br from-gold-500/20 to-yellow-500/20 border-gold-500/30"
                      : "bg-white/5 border-white/10"
                  )}
                >
                  {isAvailable && (
                    <div className="absolute top-2 right-2">
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        可购买
                      </span>
                    </div>
                  )}
                  
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Coins className="w-5 h-5 text-gold-400" />
                    价格信息
                  </h3>
                  
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-400 mb-2">当前价格</p>
                    <p className="text-4xl font-black text-gold-500">
                      ¥{Number(land.current_price).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      约 ¥{Math.round(Number(land.current_price) / land.size_sqm)}/㎡
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center">
                      <p className="text-gray-400">初始价格</p>
                      <p className="font-bold">¥{Number(land.initial_price).toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400">历史涨幅</p>
                      <p className="font-bold text-green-500">
                        +{((Number(land.current_price) / Number(land.initial_price) - 1) * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400">交易次数</p>
                      <p className="font-bold">{land.transaction_count}次</p>
                    </div>
                  </div>
                </motion.div>
                
                {/* 建设潜力 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/5 rounded-xl p-5 border border-white/10"
                >
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-400" />
                    建设潜力
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">最大建设层数</span>
                      <span className="font-bold text-lg">{land.blueprint.max_floors}层</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">每层建设成本</span>
                      <span className="font-bold">¥{Number(land.blueprint.construction_cost_per_floor).toLocaleString()}</span>
                    </div>
                    {land.blueprint.daily_output !== '0.0000' && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">日产出能力</span>
                        <span className="font-bold text-green-400">
                          {land.blueprint.daily_output} {land.blueprint.output_resource}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
            
            {/* 购买成功提示 */}
            {purchaseSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-2">购买成功！</h3>
                <p className="text-gray-400 mb-4">恭喜您成功购买了这块土地</p>
                <p className="text-sm text-gray-500">正在跳转到我的资产...</p>
              </motion.div>
            )}
          </div>
          
          {/* 底部操作区 */}
          <div className="p-6 border-t border-gray-700 bg-gray-900">
            {land && !purchaseSuccess && (
              <>
                {!showPasswordInput ? (
                  // 初始状态 - 显示购买按钮或状态信息
                  <div>
                    {isAvailable ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePurchaseClick}
                        className="w-full py-4 bg-gradient-to-r from-gold-500 to-yellow-600 text-black rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-gold-500/25 transition-all flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        {isAuthenticated ? '立即购买' : '登录后购买'}
                      </motion.button>
                    ) : (
                      <div className="text-center">
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-800 rounded-xl">
                          <Lock className="w-5 h-5 text-gray-400" />
                          <div className="text-left">
                            <p className="font-bold">已被占有</p>
                            <p className="text-sm text-gray-400">
                              所有者: {land?.owner_username}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // 输入密码状态
                  <div className="space-y-4">
                    <PaymentPasswordInput
                      value={paymentPassword}
                      onChange={setPaymentPassword}
                      error={purchaseError}
                      loading={purchasing}
                      onSubmit={handlePurchaseSubmit}
                    />
                    
                    <div className="flex gap-3">
                      <button
                        onClick={handlePurchaseSubmit}
                        disabled={purchasing || paymentPassword.length !== 6}
                        className={cn(
                          "flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                          "bg-gradient-to-r from-gold-500 to-yellow-600 text-black",
                          "hover:shadow-lg hover:shadow-gold-500/25",
                          (purchasing || paymentPassword.length !== 6) && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {purchasing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            处理中...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4" />
                            确认支付
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowPasswordInput(false)
                          setPaymentPassword('')
                          setPurchaseError('')
                        }}
                        disabled={purchasing}
                        className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors font-medium"
                      >
                        取消
                      </button>
                    </div>
                    
                    <p className="text-xs text-center text-gray-500">
                      支付过程采用端到端加密，确保您的资金安全
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
