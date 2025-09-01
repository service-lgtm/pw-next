// src/app/mining/SynthesisSystem.tsx
// 合成系统组件 - v2.3.0 修复版
// 
// 功能说明：
// 1. 工具合成功能（镐头、斧头、锄头）
// 2. 砖头合成功能
// 3. 显示合成配方和价格信息
// 4. 实时显示用户资源
// 5. 支持批量合成和快捷操作
// 6. 合成历史记录查看
// 7. 合成统计和成就展示
// 8. 响应式设计，完美适配移动端
// 9. 修复：合成数量限制问题
// 
// 关联文件：
// - 被 @/app/mining/page.tsx 使用
// - 使用 @/hooks/useSynthesis (独立 Hooks)
// - 使用 @/lib/api/synthesisApi (独立 API)
// - 使用 @/components/shared 系列组件

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { BetaPasswordModal, hasBetaAccess } from './BetaPasswordModal'
import { 
  useSynthesisSystem, 
  useSynthesisHistory,
  useSynthesisStats,
  TOOL_TYPE_MAP, 
  TOOL_USAGE_MAP,
  QUALITY_CONFIG
} from '@/hooks/useSynthesis'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface SynthesisSystemProps {
  className?: string
  isMobile?: boolean
}

// 工具图标映射
const TOOL_ICONS = {
  pickaxe: '⛏️',
  axe: '🪓',
  hoe: '🌾'
} as const

// 资源图标和颜色映射
const RESOURCE_CONFIG = {
  wood: { icon: '🪵', color: 'text-green-400', name: '木材' },
  iron: { icon: '⚙️', color: 'text-gray-400', name: '铁矿' },
  stone: { icon: '🪨', color: 'text-blue-400', name: '石材' },
  yld: { icon: '💎', color: 'text-purple-400', name: 'YLD' },
  brick: { icon: '🧱', color: 'text-orange-400', name: '砖头' }
} as const

// 批量合成限制配置
const BATCH_LIMITS = {
  tool: 50,      // 工具最大批量合成数量（提高到50）
  brick: 100     // 砖头最大批量合成数量
} as const

// 资源显示组件
function ResourceDisplay(props: { 
  type: keyof typeof RESOURCE_CONFIG
  amount: number
  required?: number
  showRequired?: boolean
}) {
  const { type, amount, required, showRequired = false } = props
  const config = RESOURCE_CONFIG[type]
  const isInsufficient = showRequired && required && amount < required
  
  return (
    <div className="flex items-center justify-between p-2 bg-gray-900/30 rounded">
      <div className="flex items-center gap-2">
        <span className="text-lg">{config.icon}</span>
        <span className="text-xs text-gray-400">{config.name}</span>
      </div>
      <div className="text-right">
        <div className={`font-bold ${isInsufficient ? 'text-red-400' : config.color}`}>
          {type === 'yld' ? amount.toFixed(4) : amount.toFixed(2)}
        </div>
        {showRequired && required !== undefined && (
          <div className="text-xs text-gray-500">
            需要: {type === 'yld' ? required.toFixed(4) : required.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  )
}

// 快捷数量选择组件（修复版）
function QuickAmountSelector(props: { 
  value: number
  onChange: (value: number) => void
  max: number
  presets?: number[]
  batchLimit?: number  // 添加批量限制参数
}) {
  const { value, onChange, max, presets = [1, 5, 10, 25], batchLimit = BATCH_LIMITS.tool } = props
  
  // 实际最大值为资源允许的最大值和批量限制的较小值
  const effectiveMax = Math.min(max, batchLimit)
  
  // 动态生成预设值，确保不超过有效最大值
  const effectivePresets = presets.filter(p => p <= effectiveMax)
  
  // 如果所有预设值都太大，至少显示一些有用的选项
  if (effectivePresets.length === 0 && effectiveMax > 0) {
    if (effectiveMax >= 5) {
      effectivePresets.push(1, 5)
    } else {
      for (let i = 1; i <= effectiveMax && i <= 3; i++) {
        effectivePresets.push(i)
      }
    }
  }
  
  return (
    <div className="space-y-2">
      {/* 显示限制信息 */}
      {max > batchLimit && (
        <div className="text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded">
          ⚠️ 单次最多合成 {batchLimit} 个（资源充足可合成 {max} 个）
        </div>
      )}
      
      <div className="flex gap-1">
        {effectivePresets.map(preset => (
          <button
            key={preset}
            onClick={() => onChange(preset)}
            className={`flex-1 px-2 py-1 text-xs rounded transition-all ${
              value === preset 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {preset}
          </button>
        ))}
        {effectiveMax > Math.max(...effectivePresets) && (
          <button
            onClick={() => onChange(effectiveMax)}
            className={`flex-1 px-2 py-1 text-xs rounded transition-all ${
              value === effectiveMax 
                ? 'bg-purple-600 text-white' 
                : 'bg-blue-700 text-blue-300 hover:bg-blue-600'
            }`}
          >
            最大({effectiveMax})
          </button>
        )}
      </div>
      
      <input
        type="number"
        min="1"
        max={effectiveMax}
        value={value}
        onChange={(e) => {
          const val = parseInt(e.target.value) || 1
          onChange(Math.min(Math.max(1, val), effectiveMax))
        }}
        className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded text-white text-sm"
        placeholder={`自定义数量 (1-${effectiveMax})`}
      />
      
      {/* 显示当前选择的数量信息 */}
      <div className="text-xs text-gray-400 text-center">
        将合成 <span className="text-purple-400 font-bold">{value}</span> 个
        {max < value && (
          <span className="text-red-400"> (资源不足)</span>
        )}
      </div>
    </div>
  )
}

// 合成系统主组件
export function SynthesisSystem({ className = '', isMobile = false }: SynthesisSystemProps) {
  const [hasMiningAccess, setHasMiningAccess] = useState(false)
  const [showBetaModal, setShowBetaModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'synthesis' | 'history' | 'stats'>('synthesis')
  const [synthTab, setSynthTab] = useState<'tools' | 'bricks'>('tools')
  const [selectedTool, setSelectedTool] = useState<'pickaxe' | 'axe' | 'hoe'>('pickaxe')
  const [toolQuantity, setToolQuantity] = useState(1)
  const [brickBatches, setBrickBatches] = useState(1)
  const [historyFilter, setHistoryFilter] = useState<'all' | 'tool' | 'brick'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  
  // 检查内测权限
  useEffect(() => {
    const access = hasBetaAccess()
    setHasMiningAccess(access)
  }, [])
  
  // 使用合成系统 Hook
  const {
    recipes,
    userResources,
    loading,
    synthesizing,
    error,
    synthesizeTool,
    synthesizeBricks,
    calculateMaxSynthesizable,
    refetch
  } = useSynthesisSystem({
    enabled: hasMiningAccess,
    autoRefresh: false
  })
  
  // 使用历史记录 Hook
  const {
    history,
    pagination,
    statistics,
    loading: historyLoading,
    refetch: refetchHistory
  } = useSynthesisHistory({
    type: historyFilter,
    page: currentPage,
    pageSize: 10,
    enabled: hasMiningAccess && activeTab === 'history'
  })
  
  // 使用统计 Hook
  const {
    stats,
    loading: statsLoading,
    refetch: refetchStats
  } = useSynthesisStats({
    enabled: hasMiningAccess && activeTab === 'stats',
    autoRefresh: true,
    refreshInterval: 300000
  })
  
  // 计算当前选中工具的消耗
  const toolConsumption = useMemo(() => {
    const recipe = recipes[selectedTool]
    if (!recipe) return null
    
    return {
      iron: (recipe.materials.iron || 0) * toolQuantity,
      wood: (recipe.materials.wood || 0) * toolQuantity,
      stone: (recipe.materials.stone || 0) * toolQuantity,
      yld: (recipe.yld_cost || 0) * toolQuantity
    }
  }, [selectedTool, toolQuantity, recipes])
  
  // 计算砖头合成的消耗
  const brickConsumption = useMemo(() => {
    const recipe = recipes.brick
    if (!recipe) return null
    
    return {
      stone: (recipe.materials.stone || 0) * brickBatches,
      wood: (recipe.materials.wood || 0) * brickBatches,
      yld: (recipe.yld_cost || 0) * brickBatches,
      output: (recipe.output_per_batch || 100) * brickBatches
    }
  }, [brickBatches, recipes])
  
  // 处理工具合成（修复版）
  const handleSynthesizeTool = async () => {
    if (toolQuantity <= 0) {
      toast.error('请输入有效的合成数量')
      return
    }
    
    // 检查是否超过批量限制
    if (toolQuantity > BATCH_LIMITS.tool) {
      toast.error(`单次最多合成 ${BATCH_LIMITS.tool} 个工具`)
      return
    }
    
    const maxAvailable = calculateMaxSynthesizable(selectedTool)
    if (toolQuantity > maxAvailable) {
      toast.error(`资源不足，最多可合成 ${maxAvailable} 个`)
      return
    }
    
    try {
      const result = await synthesizeTool({
        tool_type: selectedTool,
        quantity: toolQuantity
      })
      
      if (result) {
        setToolQuantity(1) // 重置数量
        refetch() // 刷新配方和资源数据
        
        // 如果在历史记录页面，也刷新历史
        if (activeTab === 'history') {
          refetchHistory()
        }
        
        // 成功提示
        toast.success(`成功合成 ${toolQuantity} 个${TOOL_TYPE_MAP[selectedTool]}！`)
        console.log('[SynthesisSystem] 合成成功:', result)
      }
    } catch (error: any) {
      console.error('[SynthesisSystem] 合成失败:', error)
      
      // 处理特定的错误消息
      if (error?.message?.includes('1-10')) {
        toast.error('服务器限制：单次最多合成10个工具')
        // 自动调整数量到10
        if (toolQuantity > 10) {
          setToolQuantity(10)
        }
      }
    }
  }
  
  // 处理砖头合成
  const handleSynthesizeBricks = async () => {
    if (brickBatches <= 0) {
      toast.error('请输入有效的批次数量')
      return
    }
    
    // 检查是否超过批量限制
    if (brickBatches > BATCH_LIMITS.brick) {
      toast.error(`单次最多合成 ${BATCH_LIMITS.brick} 批砖头`)
      return
    }
    
    const maxBatches = calculateMaxSynthesizable('brick')
    if (brickBatches > maxBatches) {
      toast.error(`资源不足，最多可合成 ${maxBatches} 批`)
      return
    }
    
    const result = await synthesizeBricks(brickBatches)
    
    if (result) {
      setBrickBatches(1)
      if (activeTab === 'history') {
        refetchHistory()
      }
    }
  }
  
  // 如果没有权限
  if (!hasMiningAccess) {
    return (
      <div className={className}>
        <PixelCard className="text-center py-8 sm:py-12">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔒</div>
          <h3 className="text-lg sm:text-xl font-bold mb-2">合成系统</h3>
          <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4">
            需要内测权限才能使用
          </p>
          <PixelButton 
            size={isMobile ? "sm" : "md"} 
            onClick={() => setShowBetaModal(true)}
          >
            输入内测密码
          </PixelButton>
        </PixelCard>
        
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
  
  // 加载状态
  if (loading && !recipes.pickaxe) {
    return (
      <div className={className}>
        <PixelCard className="text-center py-8">
          <div className="text-2xl mb-2">⏳</div>
          <p className="text-gray-400">加载合成配方中...</p>
        </PixelCard>
      </div>
    )
  }
  
  // 渲染主界面
  return (
    <div className={className}>
      <div className="space-y-4">
        {/* 头部信息 */}
        <PixelCard className="p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1 text-purple-400">🔨 合成工坊</h3>
              <p className="text-xs sm:text-sm text-gray-400">
                使用资源合成工具和材料
              </p>
            </div>
            <PixelButton
              onClick={refetch}
              disabled={loading}
              variant="secondary"
              size="sm"
            >
              {loading ? '刷新中...' : '🔄 刷新'}
            </PixelButton>
          </div>
        </PixelCard>
        
        {/* 资源概览 */}
        <PixelCard className="p-3">
          <h4 className="text-sm font-bold mb-3 text-gray-300">📦 我的资源</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(RESOURCE_CONFIG).filter(([key]) => key !== 'brick').map(([key, config]) => (
              <div key={key} className="bg-gray-900/30 rounded p-2">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-sm">{config.icon}</span>
                  <span className="text-xs text-gray-500">{config.name}</span>
                </div>
                <p className={`font-bold text-sm ${config.color}`}>
                  {key === 'yld' 
                    ? (userResources[key as keyof typeof userResources] || 0).toFixed(4)
                    : Math.floor(userResources[key as keyof typeof userResources] || 0)
                  }
                </p>
              </div>
            ))}
          </div>
        </PixelCard>
        
        {/* 主标签页切换 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('synthesis')}
            className={`flex-1 py-2 px-4 rounded transition-all font-bold text-sm ${
              activeTab === 'synthesis'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🔨 合成工坊
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded transition-all font-bold text-sm ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            📜 历史记录
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-2 px-4 rounded transition-all font-bold text-sm ${
              activeTab === 'stats'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            📊 统计数据
          </button>
        </div>
        
        {/* 内容区域 */}
        {activeTab === 'synthesis' && (
          <>
            {/* 子标签页切换 */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSynthTab('tools')}
                className={`flex-1 py-2 px-4 rounded transition-all font-bold text-sm ${
                  synthTab === 'tools'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                ⚒️ 工具合成
              </button>
              {/* 暂时隐藏砖头合成
              <button
                onClick={() => setSynthTab('bricks')}
                className={`flex-1 py-2 px-4 rounded transition-all font-bold text-sm ${
                  synthTab === 'bricks'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🧱 砖头合成
              </button>
              */}
            </div>
            
            {/* 工具合成内容 */}
            {synthTab === 'tools' && (
              <PixelCard className="p-4">
                {/* 工具选择 */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {(['pickaxe', 'axe', 'hoe'] as const).map((tool) => {
                    const recipe = recipes[tool]
                    const maxCount = calculateMaxSynthesizable(tool)
                    const effectiveMax = Math.min(maxCount, BATCH_LIMITS.tool)
                    const isSelected = selectedTool === tool
                    
                    return (
                      <button
                        key={tool}
                        onClick={() => {
                          setSelectedTool(tool)
                          setToolQuantity(1)
                        }}
                        className={`p-3 rounded transition-all border-2 ${
                          isSelected
                            ? 'bg-purple-900/40 border-purple-400 transform scale-105'
                            : 'bg-gray-900/30 border-gray-700 hover:bg-gray-900/50 hover:border-gray-600'
                        }`}
                      >
                        <div className="text-2xl mb-1">{TOOL_ICONS[tool]}</div>
                        <p className="font-bold text-sm">{TOOL_TYPE_MAP[tool]}</p>
                        <p className={`text-xs mt-1 ${maxCount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          可合成: {effectiveMax}
                        </p>
                        {maxCount > BATCH_LIMITS.tool && (
                          <p className="text-xs text-yellow-400">
                            (限{BATCH_LIMITS.tool})
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
                
                {/* 配方详情和合成操作 */}
                {selectedTool && recipes[selectedTool] && (
                  <div className="space-y-4">
                    {/* 配方信息 */}
                    <div className="p-3 bg-gray-900/30 rounded">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-bold text-sm flex items-center gap-2">
                          {TOOL_ICONS[selectedTool]} {TOOL_TYPE_MAP[selectedTool]}
                        </h5>
                        <span className="text-xs text-yellow-400">
                          耐久: {recipes[selectedTool].durability}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">
                        {TOOL_USAGE_MAP[selectedTool]}
                      </p>
                      
                      {/* 材料需求 */}
                      <div className="space-y-2">
                        {toolConsumption && (
                          <>
                            {toolConsumption.iron > 0 && (
                              <ResourceDisplay
                                type="iron"
                                amount={userResources.iron || 0}
                                required={toolConsumption.iron}
                                showRequired
                              />
                            )}
                            {toolConsumption.wood > 0 && (
                              <ResourceDisplay
                                type="wood"
                                amount={userResources.wood || 0}
                                required={toolConsumption.wood}
                                showRequired
                              />
                            )}
                            {toolConsumption.stone > 0 && (
                              <ResourceDisplay
                                type="stone"
                                amount={userResources.stone || 0}
                                required={toolConsumption.stone}
                                showRequired
                              />
                            )}
                            {toolConsumption.yld > 0 && (
                              <ResourceDisplay
                                type="yld"
                                amount={userResources.yld || 0}
                                required={toolConsumption.yld}
                                showRequired
                              />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* 数量选择 */}
                    <div>
                      <label className="text-sm font-bold text-gray-300 mb-2 block">
                        合成数量 (最多: {Math.min(calculateMaxSynthesizable(selectedTool), BATCH_LIMITS.tool)} 个)
                      </label>
                      <QuickAmountSelector
                        value={toolQuantity}
                        onChange={setToolQuantity}
                        max={calculateMaxSynthesizable(selectedTool)}
                        batchLimit={BATCH_LIMITS.tool}
                        presets={[1, 5, 10, 25]}
                      />
                    </div>
                    
                    {/* 合成按钮 */}
                    <PixelButton
                      onClick={handleSynthesizeTool}
                      disabled={synthesizing || calculateMaxSynthesizable(selectedTool) === 0 || toolQuantity === 0}
                      variant={calculateMaxSynthesizable(selectedTool) > 0 ? 'primary' : 'secondary'}
                      className="w-full"
                    >
                      {synthesizing 
                        ? '合成中...' 
                        : `合成 ${toolQuantity} 个${TOOL_TYPE_MAP[selectedTool]}`
                      }
                    </PixelButton>
                    
                    {/* 提示信息 */}
                    {calculateMaxSynthesizable(selectedTool) > BATCH_LIMITS.tool && (
                      <div className="text-xs text-gray-400 bg-gray-900/30 p-2 rounded">
                        💡 提示：虽然资源充足可合成 {calculateMaxSynthesizable(selectedTool)} 个，
                        但系统限制单次最多合成 {BATCH_LIMITS.tool} 个。您可以分多次合成。
                      </div>
                    )}
                  </div>
                )}
              </PixelCard>
            )}
            
            {/* 砖头合成内容 - 暂时隐藏
            {synthTab === 'bricks' && (
              <PixelCard className="p-4">
                {recipes.brick ? (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <div className="text-5xl mb-2">🧱</div>
                      <h4 className="font-bold text-lg mb-1">砖头合成</h4>
                      <p className="text-sm text-gray-400">
                        建筑材料，用于建造和升级建筑
                      </p>
                    </div>
                    
                    <div className="p-3 bg-gray-900/30 rounded">
                      <h5 className="font-bold text-sm mb-3">每批次配方</h5>
                      <div className="space-y-2">
                        {brickConsumption && (
                          <>
                            <ResourceDisplay
                              type="stone"
                              amount={userResources.stone || 0}
                              required={brickConsumption.stone}
                              showRequired
                            />
                            <ResourceDisplay
                              type="wood"
                              amount={userResources.wood || 0}
                              required={brickConsumption.wood}
                              showRequired
                            />
                            <ResourceDisplay
                              type="yld"
                              amount={userResources.yld || 0}
                              required={brickConsumption.yld}
                              showRequired
                            />
                          </>
                        )}
                      </div>
                      <div className="mt-3 p-2 bg-green-900/30 rounded">
                        <p className="text-sm text-green-400 font-bold text-center">
                          产出: {brickConsumption?.output || 0} 个砖头
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-bold text-gray-300 mb-2 block">
                        合成批次
                      </label>
                      <QuickAmountSelector
                        value={brickBatches}
                        onChange={setBrickBatches}
                        max={calculateMaxSynthesizable('brick')}
                        batchLimit={BATCH_LIMITS.brick}
                        presets={[1, 5, 10, 25]}
                      />
                      <p className="text-xs text-gray-400 mt-2 text-center">
                        将产出 {brickConsumption?.output || 0} 个砖头
                      </p>
                    </div>
                    
                    <PixelButton
                      onClick={handleSynthesizeBricks}
                      disabled={synthesizing || calculateMaxSynthesizable('brick') === 0 || brickBatches === 0}
                      variant={calculateMaxSynthesizable('brick') > 0 ? 'primary' : 'secondary'}
                      className="w-full"
                    >
                      {synthesizing 
                        ? '合成中...' 
                        : `合成 ${brickConsumption?.output || 0} 个砖头`
                      }
                    </PixelButton>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">砖头配方加载中...</p>
                  </div>
                )}
              </PixelCard>
            )}
            */}
          </>
        )}
        
        {/* 历史记录标签页内容 */}
        {activeTab === 'history' && (
          <PixelCard className="p-4">
            <div className="mb-4">
              <div className="flex gap-2 mb-4">
                {(['all', 'tool'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setHistoryFilter(filter as 'all' | 'tool' | 'brick')
                      setCurrentPage(1)
                    }}
                    className={`px-3 py-1 text-xs rounded transition-all ${
                      historyFilter === filter
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {filter === 'all' ? '全部' : '工具'}
                  </button>
                ))}
                {/* 暂时隐藏砖头筛选
                <button
                  onClick={() => {
                    setHistoryFilter('brick')
                    setCurrentPage(1)
                  }}
                  className={`px-3 py-1 text-xs rounded transition-all ${
                    historyFilter === 'brick'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  砖头
                </button>
                */}
              </div>
              
              {/* 统计信息 */}
              {statistics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  <div className="bg-gray-900/30 rounded p-2">
                    <p className="text-xs text-gray-400">总合成</p>
                    <p className="text-lg font-bold">{statistics.total_synthesis}</p>
                  </div>
                  <div className="bg-gray-900/30 rounded p-2">
                    <p className="text-xs text-gray-400">工具</p>
                    <p className="text-lg font-bold text-purple-400">{statistics.tools_crafted}</p>
                  </div>
                  {/* 暂时隐藏砖头统计
                  <div className="bg-gray-900/30 rounded p-2">
                    <p className="text-xs text-gray-400">砖头</p>
                    <p className="text-lg font-bold text-orange-400">{statistics.bricks_crafted}</p>
                  </div>
                  */}
                  <div className="bg-gray-900/30 rounded p-2">
                    <p className="text-xs text-gray-400">幸运值</p>
                    <p className="text-lg font-bold text-yellow-400">{statistics.luck_score?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              )}
              
              {/* 历史记录列表 */}
              {historyLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">加载中...</p>
                </div>
              ) : history && history.length > 0 ? (
                <div className="space-y-2">
                  {history.map((item) => (
                    <div key={item.id} className="bg-gray-900/30 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {item.type === 'brick' ? '🧱' : 
                             item.tool_type === 'pickaxe' ? '⛏️' :
                             item.tool_type === 'axe' ? '🪓' : '🌾'}
                          </span>
                          <span className="font-bold">{item.tool_display || '砖头'}</span>
                          {item.quality && QUALITY_CONFIG[item.quality as keyof typeof QUALITY_CONFIG] && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              QUALITY_CONFIG[item.quality as keyof typeof QUALITY_CONFIG].bgColor
                            } ${QUALITY_CONFIG[item.quality as keyof typeof QUALITY_CONFIG].color}`}>
                              {QUALITY_CONFIG[item.quality as keyof typeof QUALITY_CONFIG].name}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleString('zh-CN', { 
                            month: '2-digit', 
                            day: '2-digit', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        消耗: 
                        {item.materials_consumed.iron && ` 铁${item.materials_consumed.iron}`}
                        {item.materials_consumed.wood && ` 木${item.materials_consumed.wood}`}
                        {item.materials_consumed.stone && ` 石${item.materials_consumed.stone}`}
                        {item.materials_consumed.yld && ` YLD${item.materials_consumed.yld}`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">暂无合成记录</p>
                </div>
              )}
              
              {/* 分页 */}
              {pagination && pagination.total_pages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm bg-gray-700 rounded disabled:opacity-50"
                  >
                    上一页
                  </button>
                  <span className="px-3 py-1 text-sm">
                    {currentPage} / {pagination.total_pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(pagination.total_pages, currentPage + 1))}
                    disabled={currentPage === pagination.total_pages}
                    className="px-3 py-1 text-sm bg-gray-700 rounded disabled:opacity-50"
                  >
                    下一页
                  </button>
                </div>
              )}
            </div>
          </PixelCard>
        )}
        
        {/* 统计数据标签页内容 */}
        {activeTab === 'stats' && (
          <PixelCard className="p-4">
            {statsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-400">加载统计数据...</p>
              </div>
            ) : stats ? (
              <div className="space-y-4">
                {/* 总体统计 */}
                <div>
                  <h4 className="font-bold text-sm mb-3 text-yellow-400">📊 合成统计</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-gray-900/30 rounded p-2">
                      <p className="text-xs text-gray-400">历史总计</p>
                      <p className="text-lg font-bold">{stats.synthesis.total_all_time}</p>
                    </div>
                    <div className="bg-gray-900/30 rounded p-2">
                      <p className="text-xs text-gray-400">本周</p>
                      <p className="text-lg font-bold text-green-400">{stats.synthesis.total_this_week}</p>
                    </div>
                    <div className="bg-gray-900/30 rounded p-2">
                      <p className="text-xs text-gray-400">本月</p>
                      <p className="text-lg font-bold text-blue-400">{stats.synthesis.total_this_month}</p>
                    </div>
                    <div className="bg-gray-900/30 rounded p-2">
                      <p className="text-xs text-gray-400">日均</p>
                      <p className="text-lg font-bold text-purple-400">{stats.synthesis.average_per_day.toFixed(1)}</p>
                    </div>
                  </div>
                </div>
                
                {/* 工具统计 */}
                {stats.tools && stats.tools.by_type && (
                  <div>
                    <h4 className="font-bold text-sm mb-3 text-purple-400">⚒️ 工具分布</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {stats.tools.by_type.map((item) => (
                        <div key={item.tool_type} className="bg-gray-900/30 rounded p-2 text-center">
                          <span className="text-lg">
                            {item.tool_type === 'pickaxe' ? '⛏️' :
                             item.tool_type === 'axe' ? '🪓' : '🌾'}
                          </span>
                          <p className="text-xs text-gray-400 mt-1">{TOOL_TYPE_MAP[item.tool_type as keyof typeof TOOL_TYPE_MAP] || item.tool_type}</p>
                          <p className="font-bold">{item.count}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 品质分布 */}
                {stats.tools && stats.tools.by_quality && (
                  <div>
                    <h4 className="font-bold text-sm mb-3 text-blue-400">💎 品质分布</h4>
                    <div className="space-y-2">
                      {stats.tools.by_quality.map((item) => {
                        const config = QUALITY_CONFIG[item.quality as keyof typeof QUALITY_CONFIG]
                        if (!config) return null
                        const percentage = stats.tools.total > 0 
                          ? (item.count / stats.tools.total * 100).toFixed(1)
                          : '0'
                        
                        return (
                          <div key={item.quality} className="flex items-center gap-2">
                            <span className={`text-xs w-12 ${config.color}`}>{config.name}</span>
                            <div className="flex-1 bg-gray-800 rounded-full h-4 relative overflow-hidden">
                              <div 
                                className={`h-full ${config.bgColor} transition-all`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs w-16 text-right">{item.count} ({percentage}%)</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                {/* 幸运合成 */}
                {stats.lucky_synthesis && (
                  <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded p-3">
                    <h4 className="font-bold text-sm mb-2 text-yellow-400">🍀 最幸运的合成</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">
                          {QUALITY_CONFIG[stats.lucky_synthesis.quality as keyof typeof QUALITY_CONFIG]?.name || stats.lucky_synthesis.quality} 
                          {' '}
                          {TOOL_TYPE_MAP[stats.lucky_synthesis.tool_type as keyof typeof TOOL_TYPE_MAP] || stats.lucky_synthesis.tool_type}
                        </p>
                        <p className="text-xs text-gray-400">
                          概率: {stats.lucky_synthesis.probability}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(stats.lucky_synthesis.date).toLocaleDateString('zh-CN', { 
                          month: '2-digit', 
                          day: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* 成就系统 */}
                {stats.achievements && stats.achievements.length > 0 && (
                  <div>
                    <h4 className="font-bold text-sm mb-3 text-green-400">🏆 成就</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {stats.achievements.slice(0, 6).map((achievement, index) => (
                        <div 
                          key={index} 
                          className={`p-2 rounded border ${
                            achievement.unlocked 
                              ? 'bg-green-900/20 border-green-600' 
                              : 'bg-gray-900/20 border-gray-700 opacity-50'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-lg">{achievement.unlocked ? '✅' : '🔒'}</span>
                            <div className="flex-1">
                              <p className="text-xs font-bold">{achievement.name}</p>
                              <p className="text-xs text-gray-400">{achievement.description}</p>
                              {achievement.progress && (
                                <p className="text-xs text-green-400 mt-1">进度: {achievement.progress}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">暂无统计数据</p>
              </div>
            )}
          </PixelCard>
        )}
        
        {/* 错误提示 */}
        {error && (
          <PixelCard className="p-3 bg-red-900/20 border border-red-500/50">
            <p className="text-sm text-red-400 flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </p>
          </PixelCard>
        )}
      </div>
    </div>
  )
}

export default SynthesisSystem
