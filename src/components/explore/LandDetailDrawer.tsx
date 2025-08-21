/**
 * 文件: /src/components/explore/LandDetailDrawer.tsx
 * 描述: 土地详情展示组件 - 响应式设计，PC居中，移动端底部抽屉
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, MapPin, Coins, Gift, Star, 
  Mountain, Pickaxe, Building2, Hash, Calendar,
  Loader2, Zap
} from 'lucide-react'
import { assetsApi } from '@/lib/api/assets'
import { useAuth } from '@/hooks/useAuth'
import { BetaPasswordModal } from '@/components/common/BetaPasswordModal'
import { cn } from '@/lib/utils'

interface LandDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  land?: any
  landId?: number
  onPurchaseSuccess?: () => void
}

export function LandDetailDrawer({ 
  isOpen, 
  onClose, 
  land: propLand, 
  landId,
  onPurchaseSuccess 
}: LandDetailDrawerProps) {
  const { user } = useAuth()
  const [land, setLand] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')
  const [showBetaPassword, setShowBetaPassword] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // 检测设备类型
  useEffect(() => {
    const checkDevice = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768)
      }
    }
    checkDevice()
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkDevice)
      return () => window.removeEventListener('resize', checkDevice)
    }
  }, [])
  
  // 获取土地详情
  useEffect(() => {
    if (!isOpen) return
    
    if (landId) {
      fetchLandDetails(landId)
    } else if (propLand && propLand.id) {
      fetchLandDetails(propLand.id)
    } else if (propLand) {
      setLand(propLand)
      setLoading(false)
    }
  }, [isOpen, landId])
  
  const fetchLandDetails = async (id: number) => {
    setLoading(true)
    try {
      const landDetail = await assetsApi.lands.get(id)
      setLand(landDetail)
    } catch (err: any) {
      console.error('获取土地详情失败:', err)
      if (propLand) {
        setLand(propLand)
      }
    } finally {
      setLoading(false)
    }
  }
  
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return numPrice.toLocaleString('zh-CN', { maximumFractionDigits: 0 })
  }
  
  const handlePurchase = () => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    setShowBetaPassword(true)
  }
  
  const handleBetaPasswordConfirm = async () => {
    setShowBetaPassword(false)
    if (!land) return
    
    try {
      setPurchasing(true)
      setPurchaseError('')
      
      const response = await assetsApi.lands.buy({
        land_id: land?.id,
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
  
  if (!isOpen) return null
  
  const originalPrice = parseFloat(land?.current_price || 0)
  const discountedPrice = originalPrice * 0.4
  const savedAmount = originalPrice - discountedPrice
  
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            {/* 内容容器 */}
            <motion.div
              initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95 }}
              animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1 }}
              exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                "fixed z-50 bg-gray-900 shadow-2xl overflow-hidden",
                isMobile ? 
                  "bottom-0 left-0 right-0 rounded-t-3xl max-h-[90vh] w-full" : 
                  "rounded-2xl max-h-[85vh]"
              )}
              style={!isMobile ? {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: '1024px',
              } : undefined}
            >
              {/* 标题栏 */}
              <div className={cn(
                "sticky top-0 bg-gray-900 border-b border-gray-800",
                isMobile ? "rounded-t-3xl" : "rounded-t-2xl"
              )}>
                {/* 移动端拖动条 */}
                {isMobile && (
                  <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mt-3" />
                )}
                
                <div className="flex items-center justify-between p-4">
                  <h3 className="text-lg font-bold">
                    {loading ? '加载中...' : (land?.land_id || '土地详情')}
                  </h3>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* 内容区域 */}
              <div className="overflow-y-auto overscroll-contain p-4 md:p-6"
                   style={{ maxHeight: isMobile ? 'calc(90vh - 80px)' : 'calc(85vh - 80px)' }}>
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                  </div>
                ) : land ? (
                  <div className="space-y-6">
                    {/* 创世优惠横幅 */}
                    {land?.status === 'unowned' && (
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-white mb-2">
                          <Star className="w-5 h-5" />
                          <span className="font-bold text-lg">创世纪元 · 限时4折</span>
                          <Star className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-white/90">首批数字地产，独享创世优惠</p>
                      </div>
                    )}
                    
                    {/* 主要信息网格 */}
                    <div className={cn(
                      "grid gap-4",
                      isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"
                    )}>
                      {/* 基本信息 */}
                      <div className="bg-gray-800/50 rounded-xl p-4">
                        <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-300">
                          <Hash className="w-4 h-4 text-purple-400" />
                          基本信息
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">ID</span>
                            <span className="font-mono">{land?.id || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">面积</span>
                            <span>{land?.blueprint?.size_sqm || 0}㎡</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">坐标</span>
                            <span>({land?.coordinate_x || 0}, {land?.coordinate_y || 0})</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">交易次数</span>
                            <span>{land?.transaction_count || 0}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* 位置信息 */}
                      <div className="bg-gray-800/50 rounded-xl p-4">
                        <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-300">
                          <MapPin className="w-4 h-4 text-purple-400" />
                          位置信息
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">区域</span>
                            <span>{land?.region?.name || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">上级</span>
                            <span>{land?.region?.parent_name || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">代码</span>
                            <span className="font-mono text-xs">{land?.region?.code || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">等级</span>
                            <span>Lv.{land?.region?.level || 0}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* 特殊属性 */}
                      {land?.blueprint?.land_type === 'stone_mine' ? (
                        <div className="bg-gray-800/50 rounded-xl p-4">
                          <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-300">
                            <Pickaxe className="w-4 h-4 text-purple-400" />
                            矿山属性
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">类型</span>
                              <span>{land?.blueprint?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">产出</span>
                              <span>{land?.blueprint?.output_resource || '石材'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">工具</span>
                              <span>{land?.blueprint?.tool_requirement || '镐'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">能耗</span>
                              <span>{land?.blueprint?.energy_consumption_rate || 0}/天</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-800/50 rounded-xl p-4">
                          <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-300">
                            <Building2 className="w-4 h-4 text-purple-400" />
                            建筑信息
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">楼层</span>
                              <span>{land?.blueprint?.max_floors || 0}层</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">建设费</span>
                              <span>{formatPrice(land?.blueprint?.construction_cost_per_floor || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">能耗</span>
                              <span>{land?.blueprint?.energy_consumption_rate || 0}/天</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">等级</span>
                              <span>Lv.{land?.construction_level || 0}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* 价格和购买区域 */}
                    {land?.status === 'unowned' && (
                      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/30">
                        {/* 优惠标签 */}
                        <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white text-center py-2 rounded-lg mb-4">
                          <div className="flex items-center justify-center gap-2">
                            <Gift className="w-4 h-4" />
                            <span className="font-bold">限时优惠 -60%</span>
                            <Gift className="w-4 h-4" />
                          </div>
                        </div>
                        
                        {/* 价格信息 */}
                        <div className={cn(
                          "grid gap-4 mb-4",
                          isMobile ? "grid-cols-1" : "grid-cols-3"
                        )}>
                          <div className="text-center">
                            <p className="text-xs text-gray-400 mb-1">原价</p>
                            <p className="text-xl text-gray-500 line-through">
                              {formatPrice(originalPrice)} TDB
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gold-400 font-bold mb-1">现价</p>
                            <div className="flex items-center justify-center gap-2">
                              <Coins className="w-5 h-5 text-gold-500" />
                              <p className="text-2xl font-bold text-gold-500">
                                {formatPrice(discountedPrice)} TDB
                              </p>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-green-400 mb-1">节省</p>
                            <p className="text-xl font-bold text-green-400">
                              {formatPrice(savedAmount)} TDB
                            </p>
                          </div>
                        </div>
                        
                        {purchaseError && (
                          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                            <p className="text-sm text-red-400 text-center">{purchaseError}</p>
                          </div>
                        )}
                        
                        {/* 购买按钮 */}
                        <button
                          onClick={handlePurchase}
                          disabled={purchasing}
                          className={cn(
                            "w-full py-3 rounded-xl font-bold transition-all",
                            "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
                            "hover:shadow-lg hover:shadow-purple-500/30",
                            "flex items-center justify-center gap-2",
                            purchasing && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {purchasing ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              处理中...
                            </>
                          ) : (
                            <>
                              <Zap className="w-5 h-5" />
                              立即抢购 - 成为创世先锋
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    
                    {/* 时间信息 */}
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        时间记录
                      </h4>
                      <div className={cn(
                        "grid gap-4 text-sm",
                        isMobile ? "grid-cols-1" : "grid-cols-2"
                      )}>
                        <div>
                          <p className="text-gray-400 mb-1">创建时间</p>
                          <p>{land?.created_at ? new Date(land.created_at).toLocaleString('zh-CN') : '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">更新时间</p>
                          <p>{land?.updated_at ? new Date(land.updated_at).toLocaleString('zh-CN') : '-'}</p>
                        </div>
                        {land?.last_transaction_at && (
                          <div>
                            <p className="text-gray-400 mb-1">最后交易</p>
                            <p>{new Date(land.last_transaction_at).toLocaleString('zh-CN')}</p>
                          </div>
                        )}
                        {land?.owned_at && (
                          <div>
                            <p className="text-gray-400 mb-1">购买时间</p>
                            <p>{new Date(land.owned_at).toLocaleString('zh-CN')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-400">
                    暂无数据
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* 内测密码验证弹窗 */}
      <BetaPasswordModal
        isOpen={showBetaPassword}
        onClose={() => setShowBetaPassword(false)}
        onConfirm={handleBetaPasswordConfirm}
        landPrice={discountedPrice || 0}
        landId={land?.land_id || ''}
      />
    </>
  )
}
