// src/components/explore/LandGrid.tsx
// 土地网格展示组件 - 支持网格和列表视图

'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, MapPin, TrendingUp, Gem } from 'lucide-react'
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
  viewMode?: 'grid' | 'list'
}

export function LandGrid({
  lands,
  loading,
  onLandClick,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  viewMode = 'grid'
}: LandGridProps) {
  if (loading) {
    return (
      <div className={cn(
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          : "space-y-4"
      )}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={cn(
            "bg-gray-800 rounded-xl animate-pulse",
            viewMode === 'grid' ? "h-64" : "h-24"
          )} />
        ))}
      </div>
    )
  }
  
  if (lands.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Gem className="w-10 h-10 text-white" />
        </div>
        <p className="text-xl text-gray-400">暂无符合条件的土地</p>
        <p className="text-sm text-gray-500 mt-2">请尝试调整筛选条件</p>
      </div>
    )
  }
  
  // 列表视图组件
  const LandListItem = ({ land, index }: { land: Land; index: number }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onLandClick(land)}
      className={cn(
        "bg-white/5 backdrop-blur-sm rounded-xl p-4 cursor-pointer transition-all border",
        land.status === 'unowned' 
          ? "border-green-500/30 hover:border-green-500/60 hover:bg-white/10" 
          : "border-gray-700/50 hover:border-gray-600"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
            <span className="text-xl">{land.land_type === 'urban' ? '🏢' : land.land_type === 'farm' ? '🌾' : '⛏️'}</span>
          </div>
          <div>
            <h3 className="font-bold text-white">{land.land_id}</h3>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {land.region_name}
              </span>
              <span>{land.land_type_display}</span>
              <span>({land.coordinate_x}, {land.coordinate_y})</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          {land.status === 'unowned' ? (
            <>
              <p className="text-lg font-bold text-gold-500">
                ¥{Number(land.current_price).toLocaleString()}
              </p>
              <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                可购买
              </span>
            </>
          ) : (
            <p className="text-sm text-gray-400">
              已被 {land.owner_username} 拥有
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
  
  return (
    <div>
      {viewMode === 'grid' ? (
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
      ) : (
        <div className="space-y-3">
          {lands.map((land, index) => (
            <LandListItem key={land.id} land={land} index={index} />
          ))}
        </div>
      )}
      
      {/* 分页 - 优化样式 */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={cn(
              "p-2 rounded-lg transition-all",
              currentPage === 1
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-white/10 hover:bg-white/20 text-white"
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1">
            {/* 智能分页显示 */}
            {(() => {
              const pages = []
              const showEllipsis = totalPages > 7
              
              if (!showEllipsis) {
                // 显示所有页码
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(i)
                }
              } else {
                // 智能省略
                if (currentPage <= 3) {
                  pages.push(1, 2, 3, 4, 5, '...', totalPages)
                } else if (currentPage >= totalPages - 2) {
                  pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
                } else {
                  pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
                }
              }
              
              return pages.map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => onPageChange(page as number)}
                    className={cn(
                      "w-10 h-10 rounded-lg transition-all font-medium",
                      page === currentPage
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    )}
                  >
                    {page}
                  </button>
                )
              ))
            })()}
          </div>
          
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={cn(
              "p-2 rounded-lg transition-all",
              currentPage === totalPages
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-white/10 hover:bg-white/20 text-white"
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
