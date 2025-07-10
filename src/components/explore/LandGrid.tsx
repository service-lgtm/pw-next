// src/components/explore/LandGrid.tsx
// 土地网格展示组件

'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { LandCard } from './LandCard'
import type { Land } from '@/types/assets'
import { cn } from '@/lib/utils'

interface LandGridProps {
  lands: Land[]
  loading?: boolean
  onLandClick: (land: Land) => void
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}

export function LandGrid({
  lands,
  loading,
  onLandClick,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: LandGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }
  
  if (lands.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-400">暂无土地数据</p>
      </div>
    )
  }
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {lands.map((land, index) => (
          <motion.div
            key={land.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <LandCard land={land} onClick={() => onLandClick(land)} />
          </motion.div>
        ))}
      </div>
      
      {/* 分页 */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn(
              "p-2 rounded-lg transition-colors",
              currentPage === 1
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-gray-800 hover:bg-gray-700 text-white"
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={cn(
                    "w-10 h-10 rounded-lg transition-colors",
                    page === currentPage
                      ? "bg-gold-500 text-black font-bold"
                      : "bg-gray-800 hover:bg-gray-700 text-white"
                  )}
                >
                  {page}
                </button>
              )
            })}
            
            {totalPages > 5 && (
              <>
                <span className="px-2 text-gray-500">...</span>
                <button
                  onClick={() => onPageChange(totalPages)}
                  className={cn(
                    "w-10 h-10 rounded-lg transition-colors",
                    totalPages === currentPage
                      ? "bg-gold-500 text-black font-bold"
                      : "bg-gray-800 hover:bg-gray-700 text-white"
                  )}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={cn(
              "p-2 rounded-lg transition-colors",
              currentPage === totalPages
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-gray-800 hover:bg-gray-700 text-white"
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
