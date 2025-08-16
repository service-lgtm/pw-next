// src/app/mining/MiningMarket.tsx
// 矿山市场组件 - 独立模块
// 
// 功能说明：
// 1. 显示矿山市场相关内容
// 2. 未来将包含矿山NFT交易功能
// 
// 关联文件：
// - 被 @/app/mining/page.tsx 使用
// - 使用 @/components/shared/PixelCard
// 
// 创建时间：2024-12
// 更新历史：
// - 2024-12: 从主页面拆分出独立组件

'use client'

import { PixelCard } from '@/components/shared/PixelCard'

interface MiningMarketProps {
  className?: string
}

/**
 * 矿山市场组件
 */
export function MiningMarket({ className }: MiningMarketProps) {
  return (
    <div className={className}>
      <PixelCard className="text-center py-8 sm:py-12">
        <span className="text-4xl sm:text-6xl block mb-3 sm:mb-4">🗺️</span>
        <p className="text-sm sm:text-base text-gray-400 mb-2">矿山市场即将开放</p>
        <p className="text-xs sm:text-sm text-gray-500">
          届时您可以在这里交易矿山 NFT
        </p>
      </PixelCard>
      
      {/* 未来可以添加更多市场相关功能 */}
      {/* <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        市场列表、筛选器、搜索等
      </div> */}
    </div>
  )
}

export default MiningMarket
