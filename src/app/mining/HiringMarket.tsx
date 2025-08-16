// src/app/mining/HiringMarket.tsx
// 招聘市场组件 - 独立模块
// 
// 功能说明：
// 1. 显示招聘市场相关内容
// 2. 未来将包含招募矿工功能
// 3. 包含招募挖矿说明（可选显示）
// 
// 关联文件：
// - 被 @/app/mining/page.tsx 使用
// - 使用 @/components/shared/PixelCard
// - 使用 ./RecruitmentMiningGuide（可选）
// 
// 创建时间：2024-12
// 更新历史：
// - 2024-12: 从主页面拆分出独立组件

'use client'

import { useState } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
// import { RecruitmentMiningGuide } from './RecruitmentMiningGuide'

interface HiringMarketProps {
  className?: string
  showGuide?: boolean // 是否显示招募说明
}

/**
 * 招聘市场组件
 */
export function HiringMarket({ className, showGuide = false }: HiringMarketProps) {
  const [showRecruitmentGuide, setShowRecruitmentGuide] = useState(false)

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* 招募挖矿说明 - 根据配置显示 */}
        {showGuide && showRecruitmentGuide && (
          <div className="mb-4">
            {/* <RecruitmentMiningGuide /> */}
            <PixelCard className="p-4">
              <h3 className="font-bold text-lg mb-2">招募挖矿说明</h3>
              <p className="text-sm text-gray-400">
                招募挖矿功能正在开发中...
              </p>
            </PixelCard>
          </div>
        )}
        
        {/* 主要内容 */}
        <PixelCard className="text-center py-8 sm:py-12">
          <span className="text-4xl sm:text-6xl block mb-3 sm:mb-4">👷</span>
          <p className="text-sm sm:text-base text-gray-400 mb-2">招募挖矿功能即将开放</p>
          <p className="text-xs sm:text-sm text-gray-500 mb-4">
            届时您可以招募矿工或成为矿工赚取收益
          </p>
          
          {/* 显示/隐藏说明按钮 */}
          {showGuide && (
            <PixelButton
              size="sm"
              variant="secondary"
              onClick={() => setShowRecruitmentGuide(!showRecruitmentGuide)}
            >
              {showRecruitmentGuide ? '隐藏说明' : '查看说明'}
            </PixelButton>
          )}
        </PixelCard>
        
        {/* 未来功能预览 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PixelCard className="p-4 bg-blue-900/20">
            <h4 className="font-bold mb-2 text-blue-400">🔨 成为矿主</h4>
            <p className="text-xs text-gray-400">
              发布招募信息，雇佣矿工帮助您挖矿
            </p>
          </PixelCard>
          
          <PixelCard className="p-4 bg-green-900/20">
            <h4 className="font-bold mb-2 text-green-400">⛏️ 成为矿工</h4>
            <p className="text-xs text-gray-400">
              带工具或无工具打工，赚取挖矿收益
            </p>
          </PixelCard>
        </div>
      </div>
    </div>
  )
}

export default HiringMarket
