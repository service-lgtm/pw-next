// src/app/explore/lands/[landId]/page.tsx
// 土地详情页面

'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { useLandDetail } from '@/hooks/useLands'
import { LandDetailView } from '@/components/explore/LandDetailView'

export default function LandDetailPage() {
  const params = useParams()
  const router = useRouter()
  const landId = Number(params.landId)
  
  const { land, loading, error } = useLandDetail(landId)
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1B] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gold-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }
  
  if (error || !land) {
    return (
      <div className="min-h-screen bg-[#0A0F1B] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-400">{error || '土地不存在'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            返回
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#0A0F1B]">
      {/* 顶部导航 */}
      <div className="border-b border-gray-800 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">土地详情 - {land.land_id}</h1>
          </div>
        </div>
      </div>
      
      {/* 主内容 */}
      <div className="container mx-auto px-4 py-6">
        <LandDetailView 
          land={land} 
          onPurchaseSuccess={() => router.push('/assets')}
        />
      </div>
    </div>
  )
}
