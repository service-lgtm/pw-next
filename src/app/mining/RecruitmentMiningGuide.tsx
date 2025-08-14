// src/app/mining/RecruitmentMiningGuide.tsx
// 招募挖矿说明组件
// 
// 功能说明：
// 1. 显示招募挖矿的详细规则
// 2. 解释带工具和无工具招募的区别
// 3. 说明工具投放和借用机制
// 
// 关联文件：
// - 被 @/app/mining/page.tsx 使用
// - 使用 @/components/shared/PixelCard
// - 使用 @/components/shared/PixelButton

'use client'

import { useState } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { cn } from '@/lib/utils'

interface RecruitmentMiningGuideProps {
  className?: string
  showAsModal?: boolean
}

/**
 * 招募挖矿说明组件
 */
export function RecruitmentMiningGuide({ 
  className,
  showAsModal = false 
}: RecruitmentMiningGuideProps) {
  const [showModal, setShowModal] = useState(false)
  
  const content = (
    <div className="space-y-4">
      {/* 概述 */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded">
        <h4 className="font-bold text-blue-400 mb-2">什么是招募挖矿？</h4>
        <p className="text-sm text-gray-300">
          土地持有者可通过【招募挖矿】招募其它用户来帮助自己挖矿获得收益。
          招募挖矿有【带工具】和【无工具】两种方式。
        </p>
      </div>
      
      {/* 带工具招募 */}
      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded">
        <h4 className="font-bold text-green-400 mb-2">
          <span className="text-lg mr-2">🔨</span>
          带工具招募
        </h4>
        <p className="text-sm text-gray-300 mb-2">
          指帮助土地持有人挖矿的被招募者用自己自带工具来参与挖矿。
        </p>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• 被招募者使用自己的工具</li>
          <li>• 工具耐久度由被招募者承担</li>
          <li>• 收益按比例分配给土地主和矿工</li>
        </ul>
      </div>
      
      {/* 无工具招募 */}
      <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded">
        <h4 className="font-bold text-purple-400 mb-2">
          <span className="text-lg mr-2">🤝</span>
          无工具招募
        </h4>
        <p className="text-sm text-gray-300 mb-2">
          指帮助土地持有人挖矿的被招募者没有工具，土地持有人可提供工具给他们来帮助自己进行挖矿。
        </p>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• 土地主提前存入工具供他人使用</li>
          <li>• 被招募者可借用土地主的工具</li>
          <li>• 工具耐久度由土地主承担</li>
        </ul>
      </div>
      
      {/* 工具管理说明 */}
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded">
        <h4 className="font-bold text-yellow-400 mb-2">
          <span className="text-lg mr-2">📦</span>
          工具管理
        </h4>
        <p className="text-sm text-gray-300 mb-3">
          土地持有者可将自己的可使用工具提前存入需要招募的土地中，
          没有工具的人来帮忙挖矿时，可直接使用土地持有人提供的工具来进行挖矿。
        </p>
        
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-xs text-yellow-400 font-bold">已投放工具数量：</span>
            <span className="text-xs text-gray-400 flex-1">
              土地持有人提前存入该土地供他人使用的工具数量
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs text-yellow-400 font-bold">已借出工具数量：</span>
            <span className="text-xs text-gray-400 flex-1">
              已投放工具中，已被他人借用并进行挖矿的工具数量
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs text-yellow-400 font-bold">已招募工具数量：</span>
            <span className="text-xs text-gray-400 flex-1">
              自带工具参与挖矿的被招募者，在此土地投放工具的数量
            </span>
          </div>
        </div>
      </div>
      
      {/* 重要规则 */}
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded">
        <h4 className="font-bold text-red-400 mb-2">
          <span className="text-lg mr-2">⚠️</span>
          重要规则
        </h4>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>• 自主挖矿和招募挖矿共享土地储量</li>
          <li>• 若储量被开采完毕，所有工具立即停止工作</li>
          <li>• 停止时计算耐久度并返回工具给持有者</li>
          <li>• 返回的工具为【可使用状态】</li>
          <li>• 粮食消耗按实际挖矿时间计算</li>
          <li>• 最少按1小时计算耐久和粮食消耗</li>
        </ul>
      </div>
      
      {/* 收益分配 */}
      <div className="p-4 bg-gray-800 rounded">
        <h4 className="font-bold text-gray-300 mb-2">
          <span className="text-lg mr-2">💰</span>
          收益分配
        </h4>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-gray-400 mb-1">带工具招募</p>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">土地主：</span>
                <span className="text-green-400">30%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">矿工：</span>
                <span className="text-green-400">65%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">税收：</span>
                <span className="text-red-400">5%</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-gray-400 mb-1">无工具招募</p>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">土地主：</span>
                <span className="text-green-400">65%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">矿工：</span>
                <span className="text-green-400">30%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">税收：</span>
                <span className="text-red-400">5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  
  if (showAsModal) {
    return (
      <>
        <PixelButton
          size="sm"
          variant="secondary"
          onClick={() => setShowModal(true)}
          className={className}
        >
          <span className="flex items-center gap-1">
            <span>📖</span>
            <span>招募说明</span>
          </span>
        </PixelButton>
        
        <PixelModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="招募挖矿说明"
          size="large"
        >
          {content}
        </PixelModal>
      </>
    )
  }
  
  return (
    <PixelCard className={cn("p-4", className)}>
      <h3 className="font-bold text-lg mb-4">招募挖矿说明</h3>
      {content}
    </PixelCard>
  )
}

export default RecruitmentMiningGuide
