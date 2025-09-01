// src/app/mining/ToolManagement.tsx
// 工具管理组件 - 修复分页问题版本
// 
// 功能说明：
// 1. 显示用户的工具列表（修复：显示所有工具，不只是前20个）
// 2. 支持工具合成功能
// 3. 显示工具状态和耐久度
// 4. 添加分页提示和加载更多功能
// 
// 修改历史：
// - 2025-01-30: 修复分页问题，确保显示所有工具
// 
// 关联文件：
// - 被 @/app/mining/page.tsx 使用
// - 使用 @/types/production 中的 Tool 类型
// - 使用 @/components/shared/PixelCard
// - 使用 @/components/shared/PixelButton
// - 使用 @/components/shared/PixelModal

'use client'

import { useState, useEffect, useMemo } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { cn } from '@/lib/utils'
import type { Tool } from '@/types/production'
import toast from 'react-hot-toast'

interface ToolManagementProps {
  tools: Tool[] | null
  loading: boolean
  toolStats: any
  resources: any
  onSynthesize: (toolType: string, quantity: number) => Promise<void>
  synthesizeLoading?: boolean
  showOnlyTools?: boolean      // 只显示工具列表
  showOnlySynthesis?: boolean   // 只显示合成系统
}

// 合成配方定义
const SYNTHESIS_RECIPES = {
  pickaxe: {
    name: '镐头',
    icon: '⛏️',
    materials: {
      iron: 70,
      wood: 30,
      yld: 0.08
    },
    description: '适合开采矿石'
  },
  axe: {
    name: '斧头',
    icon: '🪓',
    materials: {
      iron: 60,
      wood: 40,
      yld: 0.08
    },
    description: '适合砍伐木材'
  },
  hoe: {
    name: '锄头',
    icon: '🔨',
    materials: {
      iron: 50,
      wood: 50,
      yld: 0.08
    },
    description: '适合耕种土地'
  },
  brick: {
    name: '砖头',
    icon: '🧱',
    materials: {
      stone: 80,
      wood: 20,
      yld: 0.08
    },
    description: '建筑材料（暂未开放）',
    disabled: true
  }
}

/**
 * 工具管理组件
 */
export function ToolManagement({
  tools,
  loading,
  toolStats,
  resources,
  onSynthesize,
  synthesizeLoading = false,
  showOnlyTools = false,
  showOnlySynthesis = false
}: ToolManagementProps) {
  const [showSynthesisModal, setShowSynthesisModal] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<keyof typeof SYNTHESIS_RECIPES>('pickaxe')
  const [synthesisQuantity, setSynthesisQuantity] = useState(1)
  const [displayCount, setDisplayCount] = useState(20) // 初始显示20个
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'pickaxe' | 'axe' | 'hoe'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'normal' | 'damaged' | 'in_use'>('all')
  
  // 如果指定了只显示某个部分，就不需要内部的标签切换
  const showInternalTabs = !showOnlyTools && !showOnlySynthesis
  const [activeView, setActiveView] = useState<'list' | 'synthesis'>('list')
  
  // 过滤和搜索工具
  const filteredTools = useMemo(() => {
    if (!tools) return []
    
    let filtered = [...tools]
    
    // 类型过滤
    if (filterType !== 'all') {
      filtered = filtered.filter(tool => tool.tool_type === filterType)
    }
    
    // 状态过滤
    if (filterStatus === 'normal') {
      filtered = filtered.filter(tool => tool.status === 'normal' && !tool.is_in_use)
    } else if (filterStatus === 'damaged') {
      filtered = filtered.filter(tool => tool.status === 'damaged' || tool.current_durability < tool.max_durability)
    } else if (filterStatus === 'in_use') {
      filtered = filtered.filter(tool => tool.is_in_use)
    }
    
    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(tool => 
        tool.tool_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.tool_type_display?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return filtered
  }, [tools, filterType, filterStatus, searchTerm])
  
  // 显示的工具（分页）
  const displayedTools = useMemo(() => {
    return filteredTools.slice(0, displayCount)
  }, [filteredTools, displayCount])
  
  // 是否有更多工具可以显示
  const hasMore = filteredTools.length > displayCount
  
  // 调试信息
  useEffect(() => {
    if (tools) {
      console.log('[ToolManagement] 工具数据:', {
        总工具数: tools.length,
        过滤后: filteredTools.length,
        当前显示: displayedTools.length,
        是否有更多: hasMore,
        是否是分页问题: tools.length === 20 || tools.length === 40
      })
      
      if (tools.length === 20 || tools.length === 40 || tools.length === 60) {
        console.warn('[ToolManagement] 警告：工具数量是20的倍数，可能存在API分页问题！')
      }
    }
  }, [tools, filteredTools, displayedTools, hasMore])
  
  // 处理合成
  const handleSynthesize = async () => {
    try {
      await onSynthesize(selectedRecipe, synthesisQuantity)
      toast.success(`成功合成 ${synthesisQuantity} 个${SYNTHESIS_RECIPES[selectedRecipe].name}！`)
      setShowSynthesisModal(false)
      setSynthesisQuantity(1)
    } catch (err) {
      console.error('合成失败:', err)
    }
  }
  
  // 检查是否有足够的材料
  const hasEnoughMaterials = (recipeKey: keyof typeof SYNTHESIS_RECIPES, quantity: number = 1) => {
    if (!resources) return false
    const recipe = SYNTHESIS_RECIPES[recipeKey]
    
    for (const [material, amount] of Object.entries(recipe.materials)) {
      const required = amount * quantity
      let available = 0
      if (material === 'grain' || material === 'food') {
        available = resources.grain || resources.food || resources?.food || 0
      } else {
        available = resources[material] || 0
      }
      
      if (available < required) return false
    }
    return true
  }
  
  // 加载更多
  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 20, filteredTools.length))
  }
  
  // 工具卡片组件
  const ToolCard = ({ tool }: { tool: Tool }) => {
    const durabilityPercent = ((tool.current_durability || 0) / (tool.max_durability || 1500)) * 100
    
    return (
      <PixelCard className="p-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="font-bold text-sm">{tool.tool_id}</p>
            <p className="text-xs text-gray-400">{tool.tool_type_display}</p>
            
            {/* 耐久度条 */}
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">耐久度:</span>
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      durabilityPercent > 50 ? "bg-green-500" :
                      durabilityPercent > 20 ? "bg-yellow-500" : "bg-red-500"
                    )}
                    style={{ width: `${durabilityPercent}%` }}
                  />
                </div>
                <span className="text-xs">
                  {tool.current_durability || 0}/{tool.max_durability || 1500}
                </span>
              </div>
            </div>
          </div>
          
          {/* 状态标签 */}
          <div className="flex flex-col items-end gap-1">
            <span className={cn(
              "px-2 py-1 rounded text-xs",
              tool.status === 'normal' ? "bg-green-500/20 text-green-400" :
              tool.status === 'damaged' ? "bg-red-500/20 text-red-400" :
              tool.status === 'repairing' ? "bg-yellow-500/20 text-yellow-400" :
              "bg-gray-500/20 text-gray-400"
            )}>
              {tool.status_display || tool.status}
            </span>
            {tool.is_in_use && (
              <span className="text-xs text-blue-400">使用中</span>
            )}
          </div>
        </div>
      </PixelCard>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* 内部视图切换 - 只在不指定显示模式时显示 */}
      {showInternalTabs && (
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('list')}
            className={cn(
              "px-4 py-2 rounded text-sm font-bold transition-all",
              activeView === 'list' 
                ? "bg-gray-700 text-white" 
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            )}
          >
            工具列表
          </button>
          <button
            onClick={() => setActiveView('synthesis')}
            className={cn(
              "px-4 py-2 rounded text-sm font-bold transition-all",
              activeView === 'synthesis' 
                ? "bg-gray-700 text-white" 
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            )}
          >
            合成工具
          </button>
          
          {/* 统计信息 */}
          {toolStats && activeView === 'list' && (
            <div className="ml-auto text-sm text-gray-400 flex items-center">
              总计: {toolStats.total_count || toolStats.total_tools || tools?.length || 0} | 
              正常: {toolStats.by_status?.normal || 0} | 
              损坏: {toolStats.by_status?.damaged || 0}
            </div>
          )}
        </div>
      )}
      
      {/* 只显示工具时的统计信息 */}
      {showOnlyTools && toolStats && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">工具列表</h3>
          <div className="text-sm text-gray-400">
            总计: {tools?.length || 0} | 
            正常: {toolStats.by_status?.normal || 0} | 
            损坏: {toolStats.by_status?.damaged || 0} | 
            维修中: {toolStats.by_status?.repairing || 0}
          </div>
        </div>
      )}
      
      {/* 只显示合成系统时的标题 */}
      {showOnlySynthesis && (
        <h3 className="text-lg font-bold">合成工具</h3>
      )}
      
      {/* 工具列表视图 */}
      {((!showOnlyTools && !showOnlySynthesis && activeView === 'list') || showOnlyTools) && (
        <>
          {/* 搜索和筛选栏 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="搜索工具ID或名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
            >
              <option value="all">所有类型</option>
              <option value="pickaxe">镐头</option>
              <option value="axe">斧头</option>
              <option value="hoe">锄头</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
            >
              <option value="all">所有状态</option>
              <option value="normal">正常</option>
              <option value="damaged">损坏</option>
              <option value="in_use">使用中</option>
            </select>
          </div>
          
          {/* 分页提示 */}
          {tools && tools.length > 0 && (
            <div className="text-sm text-gray-400">
              显示 {displayedTools.length} / {filteredTools.length} 个工具
              {tools.length === 20 && (
                <span className="text-yellow-400 ml-2">
                  （注意：可能有更多工具未加载，请联系管理员）
                </span>
              )}
            </div>
          )}
          
          {/* 工具列表 */}
          {loading ? (
            <PixelCard className="text-center py-8">
              <div className="animate-spin text-4xl">⏳</div>
              <p className="text-gray-400 mt-2">加载中...</p>
            </PixelCard>
          ) : displayedTools.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {displayedTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
              
              {/* 加载更多按钮 */}
              {hasMore && (
                <div className="text-center">
                  <PixelButton
                    onClick={loadMore}
                    variant="secondary"
                    size="sm"
                  >
                    加载更多 ({filteredTools.length - displayCount} 个)
                  </PixelButton>
                </div>
              )}
            </>
          ) : filteredTools.length === 0 && searchTerm ? (
            <PixelCard className="text-center py-8">
              <p className="text-gray-400">没有找到匹配的工具</p>
            </PixelCard>
          ) : (
            <PixelCard className="text-center py-8">
              <p className="text-gray-400">暂无工具</p>
              <p className="text-sm text-gray-500 mt-2">
                切换到"合成工具"标签页制作您的第一个工具
              </p>
            </PixelCard>
          )}
        </>
      )}
      
      {/* 合成工具视图 */}
      {((!showOnlyTools && !showOnlySynthesis && activeView === 'synthesis') || showOnlySynthesis) && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(SYNTHESIS_RECIPES).map(([key, recipe]) => (
              <PixelCard 
                key={key}
                className={cn(
                  "p-4 text-center transition-all",
                  recipe.disabled 
                    ? "opacity-50 cursor-not-allowed" 
                    : "cursor-pointer hover:border-gold-500"
                )}
                onClick={() => {
                  if (recipe.disabled) {
                    toast('该功能即将开放', { icon: '🚧' })
                  } else {
                    setSelectedRecipe(key as keyof typeof SYNTHESIS_RECIPES)
                    setShowSynthesisModal(true)
                  }
                }}
              >
                <div className="text-4xl mb-2">{recipe.icon}</div>
                <p className="font-bold">{recipe.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {recipe.description}
                </p>
                <div className="mt-2 text-xs">
                  {Object.entries(recipe.materials).map(([mat, amount]) => (
                    <p key={mat} className="text-gray-500">
                      {mat === 'iron' ? '铁' : mat === 'wood' ? '木' : mat === 'stone' ? '石' : 'YLD'}: {amount}
                      {mat !== 'yld' && '%'}
                    </p>
                  ))}
                </div>
              </PixelCard>
            ))}
          </div>
        </div>
      )}
      
      {/* 合成模态框 */}
      <PixelModal
        isOpen={showSynthesisModal}
        onClose={() => setShowSynthesisModal(false)}
        title={`合成${SYNTHESIS_RECIPES[selectedRecipe].name}`}
        size="small"
      >
        <div className="space-y-4">
          {/* 合成配方 */}
          <div className="p-3 bg-gray-800 rounded">
            <p className="text-sm font-bold mb-2">所需材料（每个）：</p>
            <div className="text-sm text-gray-400 space-y-1">
              {Object.entries(SYNTHESIS_RECIPES[selectedRecipe].materials).map(([mat, amount]) => {
                const materialName = mat === 'iron' ? '铁矿' : 
                                   mat === 'wood' ? '木头' : 
                                   mat === 'stone' ? '石头' : 'YLD'
                const available = resources?.[mat] || 0
                const required = amount * synthesisQuantity
                const hasEnough = available >= required
                
                return (
                  <div key={mat} className="flex justify-between">
                    <span>{materialName}:</span>
                    <span className={cn(
                      hasEnough ? "text-green-400" : "text-red-400"
                    )}>
                      {required} / {available.toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* 数量选择 */}
          <div>
            <label className="text-sm font-bold text-gray-300">合成数量</label>
            <input
              type="number"
              min="1"
              max="10"
              value={synthesisQuantity}
              onChange={(e) => setSynthesisQuantity(parseInt(e.target.value) || 1)}
              className="w-full mt-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-center"
            />
          </div>
          
          {/* 按钮 */}
          <div className="flex gap-3">
            <PixelButton
              className="flex-1"
              onClick={handleSynthesize}
              disabled={!hasEnoughMaterials(selectedRecipe, synthesisQuantity) || synthesizeLoading}
            >
              {synthesizeLoading ? '合成中...' : '确认合成'}
            </PixelButton>
            <PixelButton
              variant="secondary"
              onClick={() => setShowSynthesisModal(false)}
            >
              取消
            </PixelButton>
          </div>
        </div>
      </PixelModal>
    </div>
  )
}

export default ToolManagement
