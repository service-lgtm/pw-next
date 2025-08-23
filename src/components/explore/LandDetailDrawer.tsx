// src/components/explore/LandDetailDrawer.tsx
// 土地详情展示组件 - 3折特惠版（修复石矿山兼容性）
// 修改说明：
// 1. 修复BetaConfirmModal组件返回undefined的问题
// 2. 确保所有条件渲染都返回null而不是undefined
// 3. 完善石矿山(stone_mine)类型的处理
// 4. 修复React Error #130问题
// 关联文件：LandDetailModal.tsx, LandDetailView.tsx, RegionDetailPage.tsx
// 最后修改：2024-12-20 - 修复石矿山点击报错问题

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, MapPin, Coins, Gift, Star, 
  Mountain, Pickaxe, Building2, Hash, Calendar,
  Loader2, Zap, Shield, Wheat, AlertCircle
} from 'lucide-react'
import { assetsApi } from '@/lib/api/assets'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface LandDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  land?: any
  landId?: number
  onPurchaseSuccess?: () => void
}

// 特色地块赠送配置
const landTypeGifts: Record<string, { tools: string; food: string }> = {
  farm: { tools: '专属工具×1', food: '基础粮食包' },
  iron_mine: { tools: '专属工具×1', food: '基础粮食包' },
  stone_mine: { tools: '专属工具×1', food: '基础粮食包' },
  forest: { tools: '专属工具×1', food: '基础粮食包' },
  yld_mine: { tools: '专属工具×1', food: '基础粮食包' },
}

// 内测确认弹窗组件 - 提前定义，避免undefined
function BetaConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  landPrice, 
  originalPrice,
  landId,
  hasGift,
  giftInfo
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  landPrice: number
  originalPrice: number
  landId: string
  hasGift: boolean
  giftInfo: any
}) {
  // 确保始终返回有效的JSX或null
  if (!isOpen) return null
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-xl font-bold mb-2">购买确认</h3>
          <p className="text-gray-400 mb-4">
            确认购买此土地，将消耗您的TDB通证
          </p>
          
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-300 mb-2">土地编号：{landId}</p>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-gray-500 line-through text-sm">
                原价 {Math.round(originalPrice).toLocaleString()} TDB
              </span>
              <span className="text-gold-500 font-bold text-lg">
                3折价 {Math.round(landPrice).toLocaleString()} TDB
              </span>
            </div>
            {hasGift && giftInfo && (
              <div className="border-t border-gray-700 pt-2 mt-2">
                <p className="text-xs text-green-400">
                  <Gift className="w-3 h-3 inline mr-1" />
                  赠送：{giftInfo.tools} + {giftInfo.food}
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-6">
            <p className="text-xs text-blue-400">
              <Shield className="w-3 h-3 inline mr-1" />
              区块链确权，永久拥有您的数字资产
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              确认购买
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// 信息卡片组件
function InfoCard({ title, icon, children }: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-300">
        {icon}
        {title}
      </h4>
      <div className="space-y-2 text-sm">
        {children}
      </div>
    </div>
  )
}

// 信息行组件
function InfoRow({ label, value, mono = false, small = false }: {
  label: string
  value: any
  mono?: boolean
  small?: boolean
}) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className={cn(
        mono && "font-mono",
        small && "text-xs"
      )}>{value}</span>
    </div>
  )
}

// 时间信息组件
function TimeInfo({ label, value }: {
  label: string
  value: string | null
}) {
  return (
    <div>
      <p className="text-gray-400 mb-1 text-sm">{label}</p>
      <p className="text-sm">{value ? new Date(value).toLocaleString('zh-CN') : '-'}</p>
    </div>
  )
}

// 购买区域组件
function PurchaseSection({ 
  originalPrice, 
  discountedPrice, 
  savedAmount, 
  purchaseError, 
  purchasing, 
  onPurchase, 
  formatPrice,
  isMobile,
  hasGift
}: {
  originalPrice: number
  discountedPrice: number
  savedAmount: number
  purchaseError: string
  purchasing: boolean
  onPurchase: () => void
  formatPrice: (price: number) => string
  isMobile: boolean
  hasGift: boolean
}) {
  return (
    <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/30">
      {/* 优惠标签 */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white text-center py-2 rounded-lg mb-4">
        <div className="flex items-center justify-center gap-2">
          <Gift className="w-4 h-4" />
          <span className="font-bold">限时优惠 -70%</span>
          {hasGift && <span className="text-xs">+专属道具</span>}
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
          <p className="text-xs text-gold-400 font-bold mb-1">狂欢价</p>
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
        onClick={onPurchase}
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
            立即抢购 - 锁定元宇宙领地
          </>
        )}
      </button>
      
      {/* 活动截止时间 */}
      <p className="text-center text-xs text-orange-400 mt-3">
        活动截止：9月15日 23:59
      </p>
    </div>
  )
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
  const [showBetaConfirm, setShowBetaConfirm] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // 确保组件已挂载（避免SSR问题）
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // 获取土地详情
  useEffect(() => {
    if (!isOpen) {
      // 关闭时重置状态
      setLand(null)
      setLoading(false)
      setPurchaseError('')
      return
    }
    
    if (landId && typeof landId === 'number') {
      fetchLandDetails(landId)
    } else if (propLand && propLand.id && typeof propLand.id === 'number') {
      fetchLandDetails(propLand.id)
    } else if (propLand) {
      setLand(propLand)
      setLoading(false)
    }
  }, [isOpen, landId, propLand])
  
  const fetchLandDetails = async (id: number) => {
    setLoading(true)
    try {
      console.log('[LandDetailDrawer] Fetching land details for ID:', id)
      const landDetail = await assetsApi.lands.get(id)
      console.log('[LandDetailDrawer] Land details fetched:', landDetail)
      setLand(landDetail)
    } catch (err: any) {
      console.error('[LandDetailDrawer] Failed to fetch land details:', err)
      if (propLand) {
        setLand(propLand)
      }
    } finally {
      setLoading(false)
    }
  }
  
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    if (isNaN(numPrice)) return '0'
    return Math.floor(numPrice).toLocaleString('zh-CN')
  }
  
  const handlePurchase = () => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    setShowBetaConfirm(true)
  }
  
  const handleBetaConfirm = async () => {
    setShowBetaConfirm(false)
    if (!land) return
    
    try {
      setPurchasing(true)
      setPurchaseError('')
      
      const response = await assetsApi.lands.buy({
        land_id: land?.id,
      })
      
      if (response.success) {
        // 显示成功提示
        const successMessage = document.createElement('div')
        successMessage.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg'
        successMessage.innerHTML = `
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>购买成功！</span>
          </div>
        `
        document.body.appendChild(successMessage)
        
        // 3秒后移除提示
        setTimeout(() => {
          successMessage.remove()
        }, 3000)
        
        // 调用成功回调
        if (onPurchaseSuccess) {
          onPurchaseSuccess()
        }
        
        // 延迟关闭抽屉，让用户看到成功提示
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        setPurchaseError(response.message || '购买失败')
      }
    } catch (err: any) {
      console.error('购买失败:', err)
      setPurchaseError(err.response?.data?.message || err.message || '购买失败')
    } finally {
      setPurchasing(false)
    }
  }
  
  // 确保返回有效的JSX或null
  if (!mounted || !isOpen) return null
  
  // 安全地计算价格
  const originalPrice = parseFloat(land?.current_price || '0')
  const discountedPrice = originalPrice * 0.3  // 3折价格
  const savedAmount = originalPrice - discountedPrice
  const giftInfo = land?.blueprint?.land_type ? landTypeGifts[land.blueprint.land_type] : null
  
  // 检测是否为移动端（只在客户端执行）
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  
  // 渲染内容函数
  const renderContent = () => {
    // 确保返回有效的JSX
    return (
      <>
        {/* 标题栏 */}
        <div className={cn(
          "sticky top-0 bg-gray-900 border-b border-gray-800 z-10",
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
        <div 
          className="overflow-y-auto p-4 md:p-6"
          style={{ 
            maxHeight: isMobile ? 'calc(90vh - 80px)' : 'calc(85vh - 80px)',
            overscrollBehavior: 'contain'
          }}
        >
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
                    <span className="font-bold text-lg">平行世界土地狂欢 · 限时3折</span>
                    <Star className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-white/90">区块链确权，成为元宇宙地主</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Shield className="w-4 h-4 text-white/80" />
                    <span className="text-xs text-white/80">永久拥有 · 实时确权</span>
                  </div>
                </div>
              )}
              
              {/* 赠品提示 */}
              {land?.status === 'unowned' && giftInfo && (
                <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl p-4 border border-green-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-5 h-5 text-green-400" />
                    <span className="font-bold text-green-400">购买即送专属道具</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-black/30 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <Pickaxe className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-white">{giftInfo.tools}</span>
                      </div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <Wheat className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-white">{giftInfo.food}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">助您快速开启生产建设，解锁领地专属收益</p>
                </div>
              )}
              
              {/* 信息卡片网格 */}
              <div className={cn(
                "grid gap-4",
                isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"
              )}>
                {/* 基本信息 */}
                <InfoCard title="基本信息" icon={<Hash className="w-4 h-4 text-purple-400" />}>
                  <InfoRow label="ID" value={land?.id || '-'} mono />
                  <InfoRow label="面积" value={`${land?.blueprint?.size_sqm || 0}㎡`} />
                  <InfoRow label="坐标" value={`(${land?.coordinate_x || 0}, ${land?.coordinate_y || 0})`} />
                  <InfoRow label="交易次数" value={land?.transaction_count || 0} />
                </InfoCard>
                
                {/* 位置信息 */}
                <InfoCard title="位置信息" icon={<MapPin className="w-4 h-4 text-purple-400" />}>
                  <InfoRow label="区域" value={land?.region?.name || '-'} />
                  <InfoRow label="上级" value={land?.region?.parent_name || '-'} />
                  <InfoRow label="代码" value={land?.region?.code || '-'} mono small />
                  <InfoRow label="等级" value={`Lv.${land?.region?.level || 0}`} />
                </InfoCard>
                
                {/* 特殊属性 - 处理所有矿山类型 */}
                {['stone_mine', 'iron_mine', 'yld_mine'].includes(land?.blueprint?.land_type) ? (
                  <InfoCard title="矿山属性" icon={<Pickaxe className="w-4 h-4 text-purple-400" />}>
                    <InfoRow label="类型" value={land?.blueprint?.name || '-'} />
                    <InfoRow label="产出" value={
                      land?.blueprint?.output_resource === 'stone' ? '石头' :
                      land?.blueprint?.output_resource === 'iron' ? '铁矿' :
                      land?.blueprint?.output_resource === 'yld' ? 'YLD' :
                      land?.blueprint?.output_resource || '矿石'
                    } />
                    <InfoRow label="工具" value={
                      land?.blueprint?.tool_requirement === 'pickaxe' ? '镐' :
                      land?.blueprint?.tool_requirement || '镐'
                    } />
                    <InfoRow label="能耗" value={`${land?.blueprint?.energy_consumption_rate || 0}/天`} />
                  </InfoCard>
                ) : ['farm', 'forest'].includes(land?.blueprint?.land_type) ? (
                  <InfoCard title="资源属性" icon={<Wheat className="w-4 h-4 text-purple-400" />}>
                    <InfoRow label="类型" value={land?.blueprint?.name || '-'} />
                    <InfoRow label="产出" value={land?.blueprint?.output_resource || '资源'} />
                    <InfoRow label="面积" value={`${land?.blueprint?.size_sqm || 0}㎡`} />
                    <InfoRow label="能耗" value={`${land?.blueprint?.energy_consumption_rate || 0}/天`} />
                  </InfoCard>
                ) : (
                  <InfoCard title="建筑信息" icon={<Building2 className="w-4 h-4 text-purple-400" />}>
                    <InfoRow label="楼层" value={`${land?.blueprint?.max_floors || 0}层`} />
                    <InfoRow label="建设费" value={`${formatPrice(land?.blueprint?.construction_cost_per_floor || 0)} TDB`} />
                    <InfoRow label="能耗" value={`${land?.blueprint?.energy_consumption_rate || 0}/天`} />
                    <InfoRow label="等级" value={`Lv.${land?.construction_level || 0}`} />
                  </InfoCard>
                )}
              </div>
              
              {/* 购买区域 */}
              {land?.status === 'unowned' && (
                <PurchaseSection
                  originalPrice={originalPrice}
                  discountedPrice={discountedPrice}
                  savedAmount={savedAmount}
                  purchaseError={purchaseError}
                  purchasing={purchasing}
                  onPurchase={handlePurchase}
                  formatPrice={formatPrice}
                  isMobile={isMobile}
                  hasGift={!!giftInfo}
                />
              )}
              
              {/* 时间信息 */}
              <InfoCard title="时间记录" icon={<Calendar className="w-4 h-4 text-purple-400" />}>
                <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                  <TimeInfo label="创建时间" value={land?.created_at} />
                  <TimeInfo label="更新时间" value={land?.updated_at} />
                  {land?.last_transaction_at && <TimeInfo label="最后交易" value={land.last_transaction_at} />}
                  {land?.owned_at && <TimeInfo label="购买时间" value={land.owned_at} />}
                </div>
              </InfoCard>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              暂无数据
            </div>
          )}
        </div>
      </>
    )
  }
  
  // 主渲染
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
            
            {/* PC端：使用flex居中 */}
            {!isMobile && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-gray-900 shadow-2xl rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden"
                >
                  {renderContent()}
                </motion.div>
              </div>
            )}
            
            {/* 移动端：底部抽屉 */}
            {isMobile && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 shadow-2xl rounded-t-3xl max-h-[90vh] overflow-hidden"
              >
                {renderContent()}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
      
      {/* 内测确认弹窗 - 使用AnimatePresence包裹 */}
      <AnimatePresence>
        {showBetaConfirm && (
          <BetaConfirmModal
            isOpen={showBetaConfirm}
            onClose={() => setShowBetaConfirm(false)}
            onConfirm={handleBetaConfirm}
            landPrice={discountedPrice}
            originalPrice={originalPrice}
            landId={land?.land_id || ''}
            hasGift={!!giftInfo}
            giftInfo={giftInfo}
          />
        )}
      </AnimatePresence>
    </>
  )
}
