// src/app/mining/SynthesisSystem.tsx
// 合成系统组件 - v2.0.0 更新版
// 
// 功能说明：
// 1. 工具合成功能（镐头、斧头、锄头）
// 2. 砖头合成功能
// 3. 显示合成配方和价格信息
// 4. 实时显示用户资源
// 5. 支持批量合成
// 
// 关联文件：
// - 被 @/app/mining/page.tsx 使用
// - 使用 ./ToolManagement 组件
// - 使用 @/hooks/useSynthesis (新的独立 Hooks)
// - 使用 @/lib/api/synthesisApi (新的独立 API)
// - 使用 @/components/shared 系列组件
// 
// 创建时间：2024-12
// 更新历史：
// - 2024-12-26: 更新至 v2.0.0
//   * 使用独立的合成系统 API 和 Hooks
//   * 适配新的 API 响应格式
//   * 增加砖头合成功能
//   * 改进错误处理和用户体验

'use client'

import { useState, useEffect } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { BetaPasswordModal, hasBetaAccess } from './BetaPasswordModal'
import { useSynthesisSystem, TOOL_TYPE_MAP, TOOL_USAGE_MAP } from '@/hooks/useSynthesis'
import toast from 'react-hot-toast'

interface SynthesisSystemProps {
  className?: string
  isMobile?: boolean
}

/**
 * 合成系统组件
 * 提供工具和砖头的合成功能
 */
export function SynthesisSystem({ className, isMobile = false }: SynthesisSystemProps) {
  const [hasMiningAccess, setHasMiningAccess] = useState(false)
  const [showBetaModal, setShowBetaModal] = useState(false)
  const [selectedTool, setSelectedTool] = useState<'pickaxe' | 'axe' | 'hoe'>('pickaxe')
  const [toolQuantity, setToolQuantity] = useState(1)
  const [brickBatches, setBrickBatches] = useState(1)
  
  // 检查内测权限
  useEffect(() => {
    const access = hasBetaAccess()
    setHasMiningAccess(access)
  }, [])
  
  // 使用合成系统 Hook
  const {
    recipes,
    userResources,
    materialPrices,
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
  
  // 处理工具合成
  const handleSynthesizeTool = async () => {
    if (toolQuantity <= 0) {
      toast.error('请输入有效的合成数量')
      return
    }
    
    const maxAvailable = calculateMaxSynthesizable(selectedTool)
    if (toolQuantity > maxAvailable) {
      toast.error(`资源不足，最多可合成 ${maxAvailable} 个`)
      return
    }
    
    await synthesizeTool({
      tool_type: selectedTool,
      quantity: toolQuantity
    })
  }
  
  // 处理砖头合成
  const handleSynthesizeBricks = async () => {
    if (brickBatches <= 0) {
      toast.error('请输入有效的批次数量')
      return
    }
    
    const brickRecipe = recipes.brick
    if (!brickRecipe) {
      toast.error('砖头配方不可用')
      return
    }
    
    const maxBatches = calculateMaxSynthesizable('brick')
    if (brickBatches > maxBatches) {
      toast.error(`资源不足，最多可合成 ${maxBatches} 批`)
      return
    }
    
    await synthesizeBricks(brickBatches)
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
            使用资源合成各种工具和材料，提升生产效率
          </p>
        </PixelCard>
        
        {/* 资源显示 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <PixelCard className="p-3 text-center">
            <p className="text-xs text-gray-400">木材</p>
            <p className="text-lg font-bold text-green-400">
              {userResources?.wood?.toFixed(2) || '0.00'}
            </p>
          </PixelCard>
          <PixelCard className="p-3 text-center">
            <p className="text-xs text-gray-400">铁矿</p>
            <p className="text-lg font-bold text-gray-400">
              {userResources?.iron?.toFixed(2) || '0.00'}
            </p>
          </PixelCard>
          <PixelCard className="p-3 text-center">
            <p className="text-xs text-gray-400">石材</p>
            <p className="text-lg font-bold text-blue-400">
              {userResources?.stone?.toFixed(2) || '0.00'}
            </p>
          </PixelCard>
          <PixelCard className="p-3 text-center">
            <p className="text-xs text-gray-400">YLD</p>
            <p className="text-lg font-bold text-purple-400">
              {userResources?.yld?.toFixed(4) || '0.0000'}
            </p>
          </PixelCard>
          <PixelCard className="p-3 text-center">
            <p className="text-xs text-gray-400">砖头</p>
            <p className="text-lg font-bold text-orange-400">
              {userResources?.brick?.toFixed(0) || '0'}
            </p>
          </PixelCard>
        </div>
        
        {/* 工具合成 */}
        <PixelCard className="p-4">
          <h4 className="font-bold text-md mb-3 text-yellow-400">⚒️ 工具合成</h4>
          
          {/* 工具选择 */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {(['pickaxe', 'axe', 'hoe'] as const).map((tool) => {
              const recipe = recipes[tool]
              const maxCount = calculateMaxSynthesizable(tool)
              
              return (
                <PixelCard
                  key={tool}
                  className={`p-3 cursor-pointer transition-all ${
                    selectedTool === tool 
                      ? 'bg-purple-900/40 border-purple-400' 
                      : 'bg-gray-900/20 hover:bg-gray-900/40'
                  }`}
                  onClick={() => setSelectedTool(tool)}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">
                      {tool === 'pickaxe' ? '⛏️' : tool === 'axe' ? '🪓' : '🔨'}
                    </div>
                    <p className="font-bold text-sm">{TOOL_TYPE_MAP[tool]}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      可合成: {maxCount}
                    </p>
                  </div>
                </PixelCard>
              )
            })}
          </div>
          
          {/* 选中工具的配方信息 */}
          {selectedTool && recipes[selectedTool] && (
            <div className="mb-4 p-3 bg-gray-900/30 rounded">
              <p className="text-sm font-bold mb-2">{TOOL_TYPE_MAP[selectedTool]}配方：</p>
              <div className="text-xs text-gray-400 space-y-1">
                {recipes[selectedTool].materials.iron && (
                  <p>• 铁矿: {recipes[selectedTool].materials.iron}</p>
                )}
                {recipes[selectedTool].materials.wood && (
                  <p>• 木材: {recipes[selectedTool].materials.wood}</p>
                )}
                {recipes[selectedTool].materials.stone && (
                  <p>• 石材: {recipes[selectedTool].materials.stone}</p>
                )}
                <p>• YLD: {recipes[selectedTool].yld_cost}</p>
                <p className="text-yellow-400 mt-2">
                  用途: {TOOL_USAGE_MAP[selectedTool]}
                </p>
                <p className="text-blue-400">
                  耐久度: {recipes[selectedTool].durability}
                </p>
              </div>
            </div>
          )}
          
          {/* 数量输入和合成按钮 */}
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max={calculateMaxSynthesizable(selectedTool)}
              value={toolQuantity}
              onChange={(e) => setToolQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-700 rounded text-white"
              placeholder="数量"
            />
            <PixelButton
              onClick={handleSynthesizeTool}
              disabled={synthesizing || calculateMaxSynthesizable(selectedTool) === 0}
              variant={calculateMaxSynthesizable(selectedTool) > 0 ? 'primary' : 'secondary'}
            >
              {synthesizing ? '合成中...' : '合成工具'}
            </PixelButton>
          </div>
        </PixelCard>
        
        {/* 砖头合成 */}
        <PixelCard className="p-4">
          <h4 className="font-bold text-md mb-3 text-orange-400">🧱 砖头合成</h4>
          
          {recipes.brick && (
            <>
              <div className="mb-4 p-3 bg-gray-900/30 rounded">
                <p className="text-sm font-bold mb-2">砖头配方（每批）：</p>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• 石材: {recipes.brick.materials.stone}</p>
                  <p>• 木材: {recipes.brick.materials.wood}</p>
                  <p>• YLD: {recipes.brick.yld_cost}</p>
                  <p className="text-green-400 mt-2">
                    每批产出: {recipes.brick.output_per_batch} 个砖头
                  </p>
                  <p className="text-yellow-400">
                    最多可合成: {calculateMaxSynthesizable('brick')} 批
                  </p>
                </div>
              </div>
              
              {/* 批次输入和合成按钮 */}
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max={calculateMaxSynthesizable('brick')}
                  value={brickBatches}
                  onChange={(e) => setBrickBatches(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-700 rounded text-white"
                  placeholder="批次数量"
                />
                <PixelButton
                  onClick={handleSynthesizeBricks}
                  disabled={synthesizing || calculateMaxSynthesizable('brick') === 0}
                  variant={calculateMaxSynthesizable('brick') > 0 ? 'primary' : 'secondary'}
                >
                  {synthesizing ? '合成中...' : `合成砖头 (${brickBatches * (recipes.brick?.output_per_batch || 100)}个)`}
                </PixelButton>
              </div>
            </>
          )}
        </PixelCard>
        
        {/* 刷新按钮 */}
        <div className="text-center">
          <PixelButton
            onClick={refetch}
            disabled={loading}
            variant="secondary"
            size="sm"
          >
            {loading ? '加载中...' : '刷新数据'}
          </PixelButton>
        </div>
        
        {/* 错误提示 */}
        {error && (
          <PixelCard className="p-3 bg-red-900/20 border-red-500">
            <p className="text-sm text-red-400">{error}</p>
          </PixelCard>
        )}
      </div>
    </div>
  )
}

export default SynthesisSystem
