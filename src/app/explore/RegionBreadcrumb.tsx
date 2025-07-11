// src/app/explore/RegionBreadcrumb.tsx
// 区域面包屑导航组件

'use client'

import { useState, useEffect, Fragment } from 'react'  // 添加 Fragment
import Link from 'next/link'
import { ChevronRight, Globe } from 'lucide-react'
import { assetsApi } from '@/lib/api/assets'
import type { Region } from '@/types/assets'

interface RegionBreadcrumbProps {
  regionId: number
}

export function RegionBreadcrumb({ regionId }: RegionBreadcrumbProps) {
  const [path, setPath] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const buildPath = async () => {
      try {
        setLoading(true)
        const pathList: Region[] = []
        let currentId = regionId
        
        while (currentId) {
          const region = await assetsApi.regions.get(currentId)
          pathList.unshift(region)
          currentId = region.parent || 0
        }
        
        setPath(pathList)
      } catch (error) {
        console.error('Failed to build region path:', error)
      } finally {
        setLoading(false)
      }
    }
    
    buildPath()
  }, [regionId])
  
  if (loading) {
    return <div className="h-8 bg-gray-800 rounded animate-pulse" />
  }
  
  return (
    <nav className="flex items-center gap-2 text-sm">
      <Link href="/explore" className="flex items-center gap-1 text-gray-400 hover:text-white">
        <Globe className="w-4 h-4" />
        <span>世界</span>
      </Link>
      
      {path.map((region, index) => (
        <Fragment key={region.id}>  {/* 使用 Fragment 而不是 React.Fragment */}
          <ChevronRight className="w-4 h-4 text-gray-600" />
          {index === path.length - 1 ? (
            <span className="text-white font-medium">{region.name}</span>
          ) : (
            <Link
              href={`/explore/regions/${region.id}`}
              className="text-gray-400 hover:text-white"
            >
              {region.name}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
