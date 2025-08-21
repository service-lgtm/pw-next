/**
 * 文件: /src/components/explore/LandDetailDrawer.tsx
 * 描述: 土地详情展示组件 - 稳定版本
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
  const [mounted, setMounted] = useState(false)
  
  // 确保组件已挂载（避免SSR问题）
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // 获取土地详情
  useEffect(() => {
    if (!isOpen) return
    
    // 添加数据验证
    if (landId && typeof landId === 'number') {
      fetchLandDetails(landId)
    } else if (propLand && propLand.id && typeof propLand.id === 'number') {
      fetchLandDetails(propLand.id)
    } else if (propLand) {
      console.log('[LandDetailDrawer] Using propLand directly:', propLand)
      setLand(propLand)
      setLoading(false)
    } else {
      console.error('[LandDetailDrawer] No valid land data provided')
      setLoading(false)
    }
  }, [isOpen, landId]) // 移除 propLand?.id 避免依赖数组问题
  
  const fetchLandDetails = async (id: number) => {
    console.log('[LandDetailDrawer] Fetching land details for ID:', id)
    setLoading(true)
    try {
      const landDetail = await assetsApi.lands.get(id)
      console.log('[LandDetailDrawer] Fetched land details:', landDetail)
      setLand(landDetail)
    } catch (err: any) {
      console.error('[LandDetailDrawer] Error fetching land details:', err)
      if (propLand) {
        console.log('[LandDetailDrawer] Using fallback propLand')
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
  
  // 不渲染直到客户端挂载
  if (!mounted || !isOpen) return null
  
  const originalPrice = parseFloat(land?.current_price || 0)
  const discountedPrice = originalPrice * 0.4
  const savedAmount = originalPrice - discountedPrice
  
  // 检测是否为移动端（只在客户端执行）
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  
  // 渲染内容
  const renderContent = () => (
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
                  <span className="font-bold text-lg">创世纪元 · 限时4折</span>
                  <Star className="w-5 h-5" />
                </div>
                <p className="text-sm text-white/90">首批数字地产，独享创世优惠</p>
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
              
              {/* 特殊属性 */}
              {land?.blueprint?.land_type === 'stone_mine' ? (
                <InfoCard title="矿山属性" icon={<Pickaxe className="w-4 h-4 text-purple-400" />}>
                  <InfoRow label="类型" value={land?.blueprint?.name || '-'} />
                  <InfoRow label="产出" value={land?.blueprint?.output_resource || '石材'} />
                  <InfoRow label="工具" value={land?.blueprint?.tool_requirement || '镐'} />
                  <InfoRow label="能耗" value={`${land?.blueprint?.energy_consumption_rate || 0}/天`} />
                </InfoCard>
              ) : (
                <InfoCard title="建筑信息" icon={<Building2 className="w-4 h-4 text-purple-400" />}>
                  <InfoRow label="楼层" value={`${land?.blueprint?.max_floors || 0}层`} />
                  <InfoRow label="建设费" value={formatPrice(land?.blueprint?.construction_cost_per_floor || 0)} />
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
              />
            )}
            
            {/* 时间信息 */}
            <InfoCard title="时间记录" icon={<Calendar className="w-4 h-4 text-purple-400" />}>
              <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                {land?.created_at && <TimeInfo label="创建时间" value={land.created_at} />}
                {land?.updated_at && <TimeInfo label="更新时间" value={land.updated_at} />}
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

// 信息卡片组件
function InfoCard({ title, icon, children }: { 
  title: React.ReactNode
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
  value: React.ReactNode
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
  value: string | null | undefined 
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
  isMobile 
}: { 
  originalPrice: number
  discountedPrice: number
  savedAmount: number
  purchaseError: string
  purchasing: boolean
  onPurchase: () => void
  formatPrice: (price: number) => string
  isMobile: boolean
}) {
  return (
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
            立即抢购 - 成为创世先锋
          </>
        )}
      </button>
    </div>
  )
}
