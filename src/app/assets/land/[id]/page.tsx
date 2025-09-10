// src/app/assets/land/[id]/page.tsx
// 土地详情页面 - 修复版

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useAuth } from '@/hooks/useAuth'
import { useLandDetail } from '@/hooks/useLands'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface PageProps {
  params: {
    id: string
  }
}

export default function LandDetailPage({ params }: PageProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const landId = parseInt(params.id)
  const { land, loading, error } = useLandDetail(landId)
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'actions'>('info')

  // 检查认证状态
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录')
      router.push(`/login?redirect=/assets/land/${landId}`)
    }
  }, [authLoading, isAuthenticated, router, landId])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (error || !land) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-500 mb-4">{error || '土地不存在'}</p>
          <PixelButton onClick={() => router.push('/assets/land')}>
            返回土地列表
          </PixelButton>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* 返回按钮 */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <button
          onClick={() => router.push('/assets/land')}
          className="text-gray-400 hover:text-white flex items-center gap-2"
        >
          <span>←</span>
          返回土地列表
        </button>
      </motion.div>

      {/* 土地基本信息 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <PixelCard className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-white mb-2">{land.land_id}</h1>
              <p className="text-gray-400">{land.region?.name || '未知区域'} · {land.blueprint?.land_type_display || land.land_type_display}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">当前价值</p>
              <p className="text-3xl font-black text-gold-500">
                {land.current_price ? parseFloat(land.current_price).toLocaleString() : 0} TDB
              </p>
            </div>
          </div>
        </PixelCard>
      </motion.div>

      {/* 标签页 */}
      <div className="mb-6">
        <div className="flex gap-2 border-b-2 border-gray-800">
          {(['info', 'history'
            // 'actions'
          ] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 font-bold transition-all",
                activeTab === tab
                  ? "text-gold-500 border-b-2 border-gold-500 -mb-0.5"
                  : "text-gray-400 hover:text-white"
              )}
            >
              {tab === 'info' && '基本信息'}
              {tab === 'history' && '交易历史'}
              {/* {tab === 'actions' && '操作'} */}
            </button>
          ))}
        </div>
      </div>

      {/* 标签内容 */}
      <AnimatePresence mode="wait">
        {activeTab === 'info' && (
          <motion.div
            key="info"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* 土地属性 */}
            <PixelCard className="p-6">
              <h3 className="text-lg font-bold mb-4">土地属性</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">类型</span>
                  <span className="font-bold">{land.blueprint?.land_type_display || land.land_type_display || '未知'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">面积</span>
                  <span className="font-bold">{land.size_sqm ? land.size_sqm.toLocaleString() : 0} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">坐标</span>
                  <span className="font-mono">({land.coordinate_x || 0}, {land.coordinate_y || 0})</span>
                </div>
                {/* <div className="flex justify-between">
                  <span className="text-gray-400">初始价格</span>
                  <span>{land.initial_price ? parseFloat(land.initial_price).toLocaleString() : 0} TDB</span>
                </div> */}
                <div className="flex justify-between">
                  <span className="text-gray-400">购买时间</span>
                  <span>{land.owned_at || land.created_at ? new Date(land.owned_at || land.created_at).toLocaleDateString() : '未知'}</span>
                </div>
                {land.is_special && (
                  <div className="pt-3 border-t border-gray-700">
                    <span className="text-yellow-500 font-bold">⭐ 特殊地块</span>
                  </div>
                )}
              </div>
            </PixelCard>

            {/* 生产信息 */}
            <PixelCard className="p-6">
              <h3 className="text-lg font-bold mb-4">生产信息</h3>
              <div className="space-y-3">
                {/* <div className="flex justify-between">
                  <span className="text-gray-400">日产出</span>
                  <span className="font-bold">{land.blueprint?.daily_output || 0} {land.blueprint?.output_resource || ''}</span>
                </div> */}
                {/* <div className="flex justify-between">
                  <span className="text-gray-400">建筑等级</span>
                  <span>{land.construction_level || 0}/{land.blueprint?.max_floors || 0}</span>
                </div> */}
                <div className="flex justify-between">
                  <span className="text-gray-400">生产状态</span>
                  <span className={land.is_producing ? "text-green-500" : "text-gray-500"}>
                    {land.is_producing ? "生产中" : "未生产"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">累计产出</span>
                  <span>{land.accumulated_output || 0}</span>
                </div>
                {/* <div className="flex justify-between">
                  <span className="text-gray-400">能耗率</span>
                  <span>{land.blueprint?.energy_consumption_rate || 0}%</span>
                </div> */}
              </div>
            </PixelCard>

            {/* 蓝图信息 */}
            {/* <PixelCard className="p-6">
              <h3 className="text-lg font-bold mb-4">蓝图信息</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-300">{land.blueprint?.description || '暂无描述'}</p>
                {land.blueprint?.features && land.blueprint.features.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-gray-400 mb-2">特性：</p>
                    <ul className="list-disc list-inside text-sm text-gray-300">
                      {land.blueprint.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </PixelCard> */}

            {/* 区域信息 */}
            <PixelCard className="p-6">
              <h3 className="text-lg font-bold mb-4">所属区域</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">区域</span>
                  <span className="font-bold">{land.region?.name || '未知'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">区域代码</span>
                  <span className="font-mono">{land.region?.code || '-'}</span>
                </div>
                {/* <div className="flex justify-between">
                  <span className="text-gray-400">区域类型</span>
                  <span>{land.region?.region_type || '-'}</span>
                </div> */}
                {land.region?.parent_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">上级区域</span>
                    <span>{land.region.parent_name}</span>
                  </div>
                )}
              </div>
            </PixelCard>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <PixelCard className="p-6">
              <h3 className="text-lg font-bold mb-4">交易历史</h3>
              {land.recent_transactions && land.recent_transactions.length > 0 ? (
                <div className="space-y-3">
                  {land.recent_transactions.map((tx) => (
                    <div key={tx.id} className="p-3 bg-gray-800/50 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{tx.transaction_type_display}</p>
                          <p className="text-sm text-gray-400">
                            {tx.from_username || '系统'} → {tx.to_username || '未知'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gold-500">
                            {tx.price ? parseFloat(tx.price).toLocaleString() : 0} TDB
                          </p>
                          <p className="text-xs text-gray-400">
                            {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '未知'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">暂无交易记录</p>
              )}
            </PixelCard>
          </motion.div>
        )}

        {activeTab === 'actions' && (
          <motion.div
            key="actions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* 生产管理 */}
            <PixelCard className="p-6">
              <h3 className="text-lg font-bold mb-4">生产管理</h3>
              <div className="space-y-4">
                <PixelButton
                  disabled
                  className="w-full opacity-50 cursor-not-allowed"
                >
                  {land.is_producing ? '停止生产' : '开始生产'}
                  <span className="ml-2 text-xs">(即将开放)</span>
                </PixelButton>
                <PixelButton
                  disabled
                  variant="secondary"
                  className="w-full opacity-50 cursor-not-allowed"
                >
                  收取产出
                  <span className="ml-2 text-xs">(即将开放)</span>
                </PixelButton>
              </div>
            </PixelCard>

            {/* 建筑管理 */}
            <PixelCard className="p-6">
              <h3 className="text-lg font-bold mb-4">建筑管理</h3>
              <div className="space-y-4">
                <PixelButton
                  disabled
                  className="w-full opacity-50 cursor-not-allowed"
                >
                  升级建筑
                  <span className="ml-2 text-xs">(即将开放)</span>
                </PixelButton>
                <p className="text-sm text-gray-400">
                  升级费用：{land.blueprint?.construction_cost_per_floor || 0} TDB/层
                </p>
              </div>
            </PixelCard>

            {/* 交易管理 */}
            <PixelCard className="p-6">
              <h3 className="text-lg font-bold mb-4">交易管理</h3>
              <div className="space-y-4">
                <PixelButton
                  disabled
                  variant="secondary"
                  className="w-full opacity-50 cursor-not-allowed"
                >
                  转让土地
                  <span className="ml-2 text-xs">(即将开放)</span>
                </PixelButton>
                <PixelButton
                  disabled
                  variant="secondary"
                  className="w-full opacity-50 cursor-not-allowed"
                >
                  出租土地
                  <span className="ml-2 text-xs">(即将开放)</span>
                </PixelButton>
              </div>
            </PixelCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
