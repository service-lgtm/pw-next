// src/app/mining/SynthesisSystem.tsx
// 合成系统组件 - 独立模块
// 
// 功能说明：
// 1. 工具合成功能
// 2. 显示合成配方
// 3. 管理合成操作
// 
// 关联文件：
// - 被 @/app/mining/page.tsx 使用
// - 使用 ./ToolManagement 组件
// - 使用 @/hooks/useProduction
// - 使用 @/components/shared 系列组件
// 
// 创建时间：2024-12
// 更新历史：
// - 2024-12: 从主页面拆分出独立组件

'use client'

import { useState, useEffect } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { ToolManagement } from './ToolManagement'
import { BetaPasswordModal, hasBetaAccess } from './BetaPasswordModal'
import { 
  useMyTools, 
  useMyResources, 
  useResourceStats,
  useSynthesizeTool 
} from '@/hooks/useProduction'
import toast from 'react-hot-toast'

interface SynthesisSystemProps {
  className?: string
  isMobile?: boolean
}

/**
 * 合成系统组件
 */
export function SynthesisSystem({ className, isMobile = false }: SynthesisSystemProps) {
  const [hasMiningAccess, setHasMiningAccess] = useState(false)
  const [showBetaModal, setShowBetaModal] = useState(false)
  
  // 检查内测权限
  useEffect(() => {
    const access = hasBetaAccess()
    setHasMiningAccess(access)
  }, [])
  
  // 数据获取
  const { 
    tools, 
    loading: toolsLoading, 
    stats: toolStats, 
    refetch: refetchTools
  } = useMyTools({
    enabled: hasMiningAccess
  })
  
  const { 
    resources, 
    refetch: refetchResources
  } = useMyResources({
    enabled: hasMiningAccess,
    useStats: true
  })
  
  const {
    stats: resourceStats,
    refetch: refetchResourceStats
  } = useResourceStats({
    enabled: hasMiningAccess,
    autoRefresh: false
  })
  
  const { 
    synthesize, 
    loading: synthesizeLoading
  } = useSynthesizeTool()
  
  // 处理合成
  const handleSynthesize = async (toolType: string, quantity: number) => {
    try {
      await synthesize({
        tool_type: toolType as 'pickaxe' | 'axe' | 'hoe',
        quantity: quantity
      })
      // 刷新数据
      refetchTools()
      refetchResources()
      refetchResourceStats()
    } catch (error) {
      console.error('[SynthesisSystem] Synthesize failed:', error)
    }
  }
  
  // 如果没有权限
  if (!hasMiningAccess) {
    return (
      <div className={className}>
        <PixelCard className="text-center py-8 sm:py-12">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔒</div>
          <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4">
            合成系统需要内测权限
          </p>
          <PixelButton 
            size={isMobile ? "sm" : "md"} 
            onClick={() => setShowBetaModal(true)}
          >
            输入内测密码
          </PixelButton>
        </PixelCard>
        
        {/* 内测密码模态框 */}
        <BetaPasswordModal
          isOpen={showBetaModal}
          onClose={() => setShowBetaModal(false)}
          onSuccess={() => {
            setHasMiningAccess(true)
            setShowBetaModal(false)
            toast.success('验证成功！欢迎使用合成系统')
          }}
          title="合成系统内测验证"
        />
      </div>
    )
  }
  
  // 有权限，显示合成系统
  return (
    <div className={className}>
      <div className="space-y-4">
        {/* 系统说明 */}
        <PixelCard className="p-4 bg-purple-900/20">
          <h3 className="font-bold text-lg mb-2 text-purple-400">🔨 合成系统</h3>
          <p className="text-sm text-gray-400">
            使用资源合成各种工具，提升挖矿效率
          </p>
        </PixelCard>
        
        {/* 资源显示 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <PixelCard className="p-3 text-center">
            <p className="text-xs text-gray-400">木头</p>
            <p className="text-lg font-bold text-green-400">
              {resources?.wood || resourceStats?.data?.resources?.wood?.available || 0}
            </p>
          </PixelCard>
          <PixelCard className="p-3 text-center">
            <p className="text-xs text-gray-400">铁矿</p>
            <p className="text-lg font-bold text-gray-400">
              {resources?.iron || resourceStats?.data?.resources?.iron?.available || 0}
            </p>
          </PixelCard>
          <PixelCard className="p-3 text-center">
            <p className="text-xs text-gray-400">石头</p>
            <p className="text-lg font-bold text-blue-400">
              {resources?.stone || resourceStats?.data?.resources?.stone?.available || 0}
            </p>
          </PixelCard>
          <PixelCard className="p-3 text-center">
            <p className="text-xs text-gray-400">YLD</p>
            <p className="text-lg font-bold text-purple-400">
              {resources?.yld || resourceStats?.data?.wallet?.yld_balance || 0}
            </p>
          </PixelCard>
        </div>
        
        {/* 合成界面 */}
        <ToolManagement
          tools={tools}
          loading={toolsLoading}
          toolStats={toolStats}
          resources={resources || resourceStats?.data?.resources}
          onSynthesize={handleSynthesize}
          synthesizeLoading={synthesizeLoading}
          showOnlySynthesis={true}
        />
      </div>
    </div>
  )
}

export default SynthesisSystem
