'use client'

import { PixelCard } from '@/components/shared/PixelCard'

export default function LandAssetsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl md:text-3xl font-black">
        <span className="text-gold-500">土地资产</span>
      </h1>
      
      <PixelCard>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏞️</div>
          <p className="text-gray-400">土地资产管理页面开发中...</p>
        </div>
      </PixelCard>
    </div>
  )
}
