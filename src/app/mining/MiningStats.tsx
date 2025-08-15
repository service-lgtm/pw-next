// src/app/mining/MiningStats.tsx
// 矿山统计信息组件
// 
// 功能说明：
// 1. 显示 YLD 矿山统计数据
// 2. 显示资源统计信息（使用新的 ResourceStatsView 接口）
// 3. 提供快捷操作入口
// 
// 关联文件：
// - 被 @/app/mining/page.tsx 使用
// - 使用 @/components/shared/PixelCard
// - 使用 @/components/shared/PixelButton
// - 从 @/hooks/useProduction 获取资源数据
// - 调用后端 /production/resources/stats/ 接口
//
// 更新历史：
// - 2024-01: 添加 resourceStats 参数支持新的资源统计接口

'use client'

import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'

interface MiningStatsProps {
  yldStats: any
  resources: any
  resourceStats?: any  // 新增：资源统计数据（来自 /production/resources/stats/）
  grainStatus: any
  hasMiningAccess: boolean
  sessions?: any[]  // 添加挖矿会话数据
  onRefresh: () => void
  onOpenMining: () => void
}

/**
 * 格式化 YLD 数量
 */
function formatYLD(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0.00'
  return num.toFixed(4)
}

/**
 * 格式化资源数量
 */
function formatResource(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0.00'
  return num.toFixed(2)
}

/**
 * 矿山统计组件
 */
export function MiningStats({
  yldStats,
  resources,
  resourceStats,  // 新增参数
  grainStatus,
  hasMiningAccess,
  sessions,
  onRefresh,
  onOpenMining
}: MiningStatsProps) {
  // 调试：打印资源数据
  console.log('[MiningStats] resourceStats:', resourceStats)
  console.log('[MiningStats] resources:', resources)
  
  // 计算挖矿会话的累计产出
  const sessionsTotalOutput = sessions?.reduce((sum, session) => {
    const output = parseFloat(session.total_output || session.accumulated_output || '0')
    return sum + output
  }, 0) || 0
  
  // 计算总累计产出（YLD矿山 + 挖矿会话）
  const totalAccumulatedOutput = (parseFloat(yldStats?.total_accumulated_output || '0') + sessionsTotalOutput)
  
  return (
    <div className="space-y-6">
      {/* YLD 矿山统计 */}
      <PixelCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">矿山统计</h3>
          <PixelButton size="xs" onClick={onRefresh}>
            刷新
          </PixelButton>
        </div>
        
        {yldStats ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-gray-800 rounded">
                <p className="text-xs text-gray-400">总矿山</p>
                <p className="text-xl font-bold text-gold-500">{yldStats.total_mines}</p>
              </div>
              <div className="text-center p-3 bg-gray-800 rounded">
                <p className="text-xs text-gray-400">YLD 总量</p>
                <p className="text-xl font-bold text-purple-500">
                  {formatYLD(yldStats.total_yld_capacity)}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-800 rounded">
                <p className="text-xs text-gray-400">累计产出</p>
                <p className="text-xl font-bold text-green-500">
                  {formatYLD(totalAccumulatedOutput)}
                </p>
                {hasMiningAccess && sessionsTotalOutput > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    挖矿: {formatYLD(sessionsTotalOutput)}
                  </p>
                )}
              </div>
              <div className="text-center p-3 bg-gray-800 rounded">
                <p className="text-xs text-gray-400">生产中</p>
                <p className="text-xl font-bold text-blue-500">
                  {yldStats.producing_count + (hasMiningAccess && sessions ? sessions.length : 0)}
                </p>
                {hasMiningAccess && sessions && sessions.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    会话: {sessions.length}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">暂无统计数据</p>
          </div>
        )}
      </PixelCard>

      {/* 资源统计 - 仅在有挖矿权限时显示 */}
      {hasMiningAccess && (resources || resourceStats) && (
        <PixelCard>
          <h3 className="font-bold mb-4">资源库存</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-800 rounded">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">木头</span>
                <span className="text-2xl">🪵</span>
              </div>
              <p className="text-lg font-bold text-green-400 mt-1">
                {formatResource(
                  resourceStats?.resources?.wood?.available || 
                  resourceStats?.resources?.wood?.amount || 
                  resources?.wood || 0
                )}
              </p>
            </div>
            
            <div className="p-3 bg-gray-800 rounded">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">铁矿</span>
                <span className="text-2xl">⛏️</span>
              </div>
              <p className="text-lg font-bold text-gray-400 mt-1">
                {formatResource(
                  resourceStats?.resources?.iron?.available || 
                  resourceStats?.resources?.iron?.amount || 
                  resources?.iron || 0
                )}
              </p>
            </div>
            
            <div className="p-3 bg-gray-800 rounded">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">石头</span>
                <span className="text-2xl">🪨</span>
              </div>
              <p className="text-lg font-bold text-blue-400 mt-1">
                {formatResource(
                  resourceStats?.resources?.stone?.available || 
                  resourceStats?.resources?.stone?.amount || 
                  resources?.stone || 0
                )}
              </p>
            </div>
            
            <div className="p-3 bg-gray-800 rounded">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">粮食</span>
                <span className="text-2xl">🌾</span>
              </div>
              <p className="text-lg font-bold text-yellow-400 mt-1">
                {formatResource(
                  resourceStats?.resources?.food?.available || 
                  resourceStats?.resources?.food?.amount || 
                  resourceStats?.resources?.grain?.available || 
                  resourceStats?.resources?.grain?.amount || 
                  resources?.grain || 
                  resources?.food || 0
                )}
              </p>
              {grainStatus && grainStatus.warning && (
                <p className="text-xs text-red-400 mt-1">
                  剩{grainStatus.hours_remaining.toFixed(1)}h
                </p>
              )}
            </div>
          </div>
          
          {/* 显示总价值（如果有） */}
          {resourceStats?.total_value && (
            <div className="mt-3 p-2 bg-purple-900/20 rounded">
              <div className="flex justify-between items-center">
                <span className="text-xs text-purple-400">资源总价值</span>
                <span className="text-sm font-bold text-purple-400">
                  {resourceStats.total_value.toFixed(2)} YLD
                </span>
              </div>
            </div>
          )}
          
          {/* 显示钱包余额（如果有） */}
          {resourceStats?.wallet && (
            <div className="mt-3 space-y-2">
              {resourceStats.wallet.yld_balance > 0 && (
                <div className="p-2 bg-purple-900/20 rounded flex justify-between items-center">
                  <span className="text-xs text-purple-400">YLD 钱包</span>
                  <span className="text-sm font-bold text-purple-400">
                    {formatYLD(resourceStats.wallet.yld_balance)}
                  </span>
                </div>
              )}
              {resourceStats.wallet.tdb_balance > 0 && (
                <div className="p-2 bg-gold-900/20 rounded flex justify-between items-center">
                  <span className="text-xs text-gold-400">TDB 余额</span>
                  <span className="text-sm font-bold text-gold-400">
                    {formatResource(resourceStats.wallet.tdb_balance)}
                  </span>
                </div>
              )}
            </div>
          )}
        </PixelCard>
      )}

      {/* 挖矿功能入口 */}
      <PixelCard className="p-4 bg-green-900/20">
        <h3 className="font-bold mb-2 text-green-400">挖矿生产</h3>
        <div className="space-y-2 text-xs text-gray-400 mb-3">
          <p>• 使用工具在土地上挖矿</p>
          <p>• 消耗粮食获得资源产出</p>
          <p>• 合成工具提高效率</p>
        </div>
        <PixelButton 
          size="sm" 
          className="w-full"
          onClick={onOpenMining}
        >
          {hasMiningAccess ? '进入挖矿' : '开启挖矿'}
        </PixelButton>
      </PixelCard>

      {/* 操作说明 */}
      <PixelCard className="p-4 bg-blue-900/20">
        <h3 className="font-bold mb-2 text-blue-400">操作说明</h3>
        <div className="space-y-2 text-xs text-gray-400">
          <p>• YLD 矿山可产出 YLD 通证</p>
          <p>• 点击矿山卡片查看详情</p>
          <p>• 挖矿功能需要内测密码</p>
          <p>• 生产功能即将全面开放</p>
        </div>
      </PixelCard>
    </div>
  )
}

export default MiningStats
