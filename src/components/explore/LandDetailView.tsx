// src/app/land/[landId]/page.tsx
// 调试版本 - 用于定位崩溃原因
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useLandDetail } from '@/hooks/useLands'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { useEffect } from 'react'

// 临时简化的详情组件
function SimpleLandDetail({ land }: { land: any }) {
  console.log('[SimpleLandDetail] Rendering with land:', land)
  
  if (!land) {
    return <div className="text-white">No land data</div>
  }
  
  return (
    <div className="bg-gray-800 rounded-lg p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">调试模式</h2>
      
      <div className="space-y-2">
        <div>
          <strong>ID:</strong> {land.id}
        </div>
        <div>
          <strong>Land ID:</strong> {land.land_id}
        </div>
        <div>
          <strong>Status:</strong> {land.status}
        </div>
        <div>
          <strong>Owner:</strong> {land.owner || 'null'}
        </div>
        <div>
          <strong>Owned At:</strong> {land.owned_at || 'null'}
        </div>
        <div>
          <strong>Land Type:</strong> {land.blueprint?.land_type || 'unknown'}
        </div>
        <div>
          <strong>Region:</strong> {land.region?.name || 'unknown'}
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gray-900 rounded">
        <h3 className="font-bold mb-2">Blueprint Data:</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(land.blueprint, null, 2)}
        </pre>
      </div>
      
      <div className="mt-6 p-4 bg-gray-900 rounded">
        <h3 className="font-bold mb-2">Full Data:</h3>
        <pre className="text-xs overflow-auto max-h-96">
          {JSON.stringify(land, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export default function LandDetailPage() {
  const params = useParams()
  const router = useRouter()
  const landId = Number(params.landId)
  
  const { land, loading, error } = useLandDetail(landId)
  
  // 调试日志
  useEffect(() => {
    console.log('[LandDetailPage] Component mounted/updated')
    console.log('[LandDetailPage] landId:', landId)
    console.log('[LandDetailPage] land:', land)
    console.log('[LandDetailPage] loading:', loading)
    console.log('[LandDetailPage] error:', error)
  }, [landId, land, loading, error])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1B] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gold-500 animate-spin mx-auto mb-4" />
          <p className="text-white">加载中...</p>
        </div>
      </div>
    )
  }
  
  if (error || !land) {
    return (
      <div className="min-h-screen bg-[#0A0F1B] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-white mb-4">{error || '土地不存在'}</p>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            返回
          </button>
        </div>
      </div>
    )
  }
  
  // 尝试渐进式渲染来定位问题
  const renderStep = 3 // 修改这个值来测试不同阶段
  
  return (
    <div className="min-h-screen bg-[#0A0F1B]">
      {/* 步骤1：只渲染导航栏 */}
      {renderStep >= 1 && (
        <div className="border-b border-gray-800 bg-black/50 backdrop-blur-xl">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 h-16">
              <button 
                onClick={() => router.back()} 
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-xl font-bold text-white">
                土地详情 - {land?.land_id || 'Loading'}
              </h1>
            </div>
          </div>
        </div>
      )}
      
      {/* 步骤2：渲染简化的内容 */}
      {renderStep >= 2 && (
        <div className="container mx-auto px-4 py-6">
          <SimpleLandDetail land={land} />
        </div>
      )}
      
      {/* 步骤3：尝试渲染原始组件（先注释掉） */}
      {renderStep >= 3 && (
        <div className="container mx-auto px-4 py-6">
          <div className="bg-yellow-900 text-yellow-200 p-4 rounded-lg mb-4">
            <p className="font-bold">⚠️ 调试模式</p>
            <p>如果看到这条消息，说明前面的步骤都正常。</p>
            <p>接下来会尝试加载 LandDetailView 组件...</p>
          </div>
          
          {/* 暂时注释掉，避免崩溃 */}
          {/* <LandDetailView 
            land={land} 
            onPurchaseSuccess={() => router.push('/assets')}
          /> */}
        </div>
      )}
    </div>
  )
}
