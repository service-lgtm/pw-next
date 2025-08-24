// src/app/land/[landId]/page.tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useLandDetail } from '@/hooks/useLands'
import { LandDetailView } from '@/components/explore/LandDetailView' // 导入统一组件
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'

export default function LandDetailPage() {
  const params = useParams()
  const router = useRouter()
  const landId = Number(params.landId)

  const { land, loading, error } = useLandDetail(landId)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1B] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
      </div>
    )
  }

  if (error || !land) {
    return (
      <div className="min-h-screen bg-[#0A0F1B] flex items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p>{error || '土地不存在'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0F1B]">
      <div className="border-b border-gray-800 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 h-16">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">土地详情 - {land.land_id}</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* 在这里使用统一的组件 */}
        <LandDetailView 
          land={land} 
          onPurchaseSuccess={() => router.push('/assets')}
        />
      </div>
    </div>
  )
}
