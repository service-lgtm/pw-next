// app/explore/china/[province]/components/PlotGrid.tsx
'use client'

import React, { useState, useRef, useCallback, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapIcon, Grid3X3, Eye, Zap, Activity, Plus, Minus,
  Flame, Star, Lock, Crown, Diamond, Layers, Navigation
} from 'lucide-react'
import { cn, calculateDistance, formatCurrency } from '../utils'
import { useTouchGestures, useDebounce } from '../hooks'
import type { Plot, CityConfig } from '../types'
import { PLOT_TYPES, ANIMATION_CONFIG, HEATMAP_CONFIG } from '../constants'

interface PlotGridProps {
  plots: Plot[]
  selectedPlot: Plot | null
  onPlotClick: (plot: Plot) => void
  showHeatmap: boolean
  heatmapType: 'price' | 'traffic' | 'yield'
  isMobile: boolean
  highlightedType?: string
  cityConfig: CityConfig
}

export function PlotGrid({
  plots,
  selectedPlot,
  onPlotClick,
  showHeatmap,
  heatmapType,
  isMobile,
  highlightedType,
  cityConfig
}: PlotGridProps) {
  const [hoveredPlot, setHoveredPlot] = useState<Plot | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'satellite'>('grid')
  const [showLabels, setShowLabels] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef({ x: 0, y: 0 })
  
  // 缩放级别防抖
  const debouncedZoom = useDebounce(zoomLevel, 100)
  
  // 触摸手势支持
  const swipeHandlers = useTouchGestures(
    () => setZoomLevel(prev => Math.max(0.5, prev - 0.2)),
    () => setZoomLevel(prev => Math.min(2, prev + 0.2))
  )
  
  // 计算网格大小
  const gridScale = isMobile ? 0.6 * debouncedZoom : debouncedZoom
  const cellSize = isMobile ? 60 : 100
  
  // 拖拽处理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return // 只响应左键
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y
    }
  }, [panOffset])
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    })
  }, [isDragging])
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])
  
  // 触摸处理（移动端）
  const handleTouchStart = useCallback((plot: Plot) => {
    if (isMobile && plot.status !== 'protected') {
      onPlotClick(plot)
    }
  }, [isMobile, onPlotClick])
  
  // 热力图颜色计算
  const getHeatmapColor = useCallback((plot: Plot) => {
    if (!showHeatmap) return 'transparent'
    
    let value = 0
    let maxValue = 1
    
    switch (heatmapType) {
      case 'price':
        value = plot.price
        maxValue = Math.max(...plots.map(p => p.price))
        break
      case 'traffic':
        value = plot.trafficFlow || 0
        maxValue = 5
        break
      case 'yield':
        value = plot.monthlyYield
        maxValue = Math.max(...plots.map(p => p.monthlyYield))
        break
    }
    
    const intensity = value / maxValue
    const config = HEATMAP_CONFIG[heatmapType]
    
    if (intensity < 0.33) {
      return config.colors.low + (0.3 + intensity * 0.4) + ')'
    } else if (intensity < 0.66) {
      return config.colors.medium + (0.3 + intensity * 0.4) + ')'
    } else {
      return config.colors.high + (0.3 + intensity * 0.4) + ')'
    }
  }, [showHeatmap, heatmapType, plots])
  
  // 重置视图
  const resetView = useCallback(() => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }, [])
  
  return (
    <div className="relative bg-gray-900/50 rounded-2xl overflow-hidden">
      {/* 控制栏 */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20 pointer-events-none">
        {/* 左侧控制 */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'satellite' : 'grid')}
            className="bg-black/80 backdrop-blur p-2 rounded-lg hover:bg-black/90 transition-colors"
            title="切换视图"
          >
            {viewMode === 'grid' ? <MapIcon className="w-5 h-5" /> : <Grid3X3 className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setShowLabels(!showLabels)}
            className="bg-black/80 backdrop-blur p-2 rounded-lg hover:bg-black/90 transition-colors"
            title="显示/隐藏标签"
          >
            <Eye className={cn("w-5 h-5", !showLabels && "opacity-50")} />
          </button>
          <button
            onClick={resetView}
            className="bg-black/80 backdrop-blur p-2 rounded-lg hover:bg-black/90 transition-colors"
            title="重置视图"
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>
        
        {/* 图例 */}
        <MapLegend isMobile={isMobile} />
      </div>
      
      {/* 缩放控制 */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
        <button
          onClick={() => setZoomLevel(Math.min(zoomLevel + 0.2, 2))}
          className="bg-black/80 backdrop-blur p-2 rounded-lg hover:bg-black/90 transition-colors"
          disabled={zoomLevel >= 2}
        >
          <Plus className="w-5 h-5" />
        </button>
        <div className="bg-black/80 backdrop-blur px-2 py-1 rounded text-xs text-center">
          {Math.round(zoomLevel * 100)}%
        </div>
        <button
          onClick={() => setZoomLevel(Math.max(zoomLevel - 0.2, 0.5))}
          className="bg-black/80 backdrop-blur p-2 rounded-lg hover:bg-black/90 transition-colors"
          disabled={zoomLevel <= 0.5}
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>
      
      {/* 地图容器 */}
      <div 
        className="p-4 md:p-6 overflow-hidden cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        {...swipeHandlers}
      >
        <div 
          ref={gridRef}
          className="relative mx-auto transition-transform duration-300"
          style={{ 
            width: cityConfig.gridSize.width * cellSize,
            transform: `scale(${gridScale}) translate(${panOffset.x / gridScale}px, ${panOffset.y / gridScale}px)`,
            transformOrigin: 'center',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          {/* 背景层 - 区域划分 */}
          <CityBackground 
            config={cityConfig} 
            cellSize={cellSize} 
            showLabels={showLabels}
            viewMode={viewMode}
          />
          
          {/* 地铁线路层 */}
          <SubwayLayer 
            stations={cityConfig.subwayStations} 
            cellSize={cellSize} 
            showLabels={showLabels}
            isMobile={isMobile}
          />
          
          {/* 地块网格 */}
          <div 
            className="relative grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${cityConfig.gridSize.width}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${cityConfig.gridSize.height}, ${cellSize}px)`
            }}
          >
            {plots.map(plot => {
              // 明确类型转换，避免隐式类型推断
              const shouldHighlight: boolean = !!(
                highlightedType && 
                (highlightedType === 'all' || plot.type === highlightedType)
              )
              const shouldDim: boolean = !!(
                highlightedType && 
                highlightedType !== 'all' && 
                plot.type !== highlightedType
              )
              
              return (
                <PlotItem
                  key={plot.id}
                  plot={plot}
                  isSelected={selectedPlot?.id === plot.id}
                  isHovered={!isMobile && hoveredPlot?.id === plot.id}
                  isHighlighted={shouldHighlight}
                  isDimmed={shouldDim}
                  onClick={() => {
                    if (!isDragging && plot.status !== 'protected') {
                      onPlotClick(plot)
                    }
                  }}
                  onMouseEnter={() => {
                    if (!isMobile && !isDragging) {
                      setHoveredPlot(plot)
                    }
                  }}
                  onMouseLeave={() => {
                    if (!isMobile) {
                      setHoveredPlot(null)
                    }
                  }}
                  onTouchStart={() => handleTouchStart(plot)}
                  heatmapColor={getHeatmapColor(plot)}
                  cellSize={cellSize}
                  isMobile={isMobile}
                  showLabels={showLabels}
                />
              )
            })}
          </div>
          
          {/* 地标标签层 */}
          {showLabels && (
            <LandmarkLabels 
              landmarks={cityConfig.landmarks} 
              cellSize={cellSize}
              isMobile={isMobile}
            />
          )}
        </div>
      </div>
      
      {/* 悬浮提示 */}
      {!isMobile && (
        <AnimatePresence>
          {hoveredPlot && !isDragging && (
            <PlotTooltip plot={hoveredPlot} cellSize={cellSize} />
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

// 地块项组件
const PlotItem = memo(function PlotItem({
  plot,
  isSelected,
  isHovered,
  isHighlighted,
  isDimmed,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onTouchStart,
  heatmapColor,
  cellSize,
  isMobile,
  showLabels
}: {
  plot: Plot
  isSelected: boolean
  isHovered: boolean
  isHighlighted?: boolean
  isDimmed?: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  onTouchStart: () => void
  heatmapColor: string
  cellSize: number
  isMobile: boolean
  showLabels: boolean
}) {
  const typeConfig = PLOT_TYPES[plot.type]
  const Icon = typeConfig.icon
  
  const gridStyle = {
    gridColumn: `${plot.coordinates.x + 1} / span ${plot.size.width}`,
    gridRow: `${plot.coordinates.y + 1} / span ${plot.size.height}`,
    width: plot.size.width * cellSize - 4,
    height: plot.size.height * cellSize - 4
  }
  
  const isFamousBrand = plot.building && 
    (plot.building.type === 'mall' || (plot.building.popularity && plot.building.popularity > 85))
  
  return (
    <motion.div
      className={cn(
        "relative rounded-lg overflow-hidden",
        "transition-all duration-200",
        plot.status === 'protected' ? 'cursor-not-allowed' : 'cursor-pointer',
        isSelected ? 'z-30' : isHovered ? 'z-20' : 'z-10',
        isDimmed && 'opacity-30',
        isHighlighted && 'ring-2 ring-gold-500 ring-opacity-50'
      )}
      style={gridStyle}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: isDimmed ? 0.3 : 1, 
        scale: isSelected ? 1.05 : 1,
        boxShadow: isSelected ? '0 0 30px rgba(255, 215, 0, 0.5)' : 
                   isHighlighted ? '0 0 20px rgba(255, 215, 0, 0.3)' : 'none'
      }}
      transition={{ 
        delay: plot.coordinates.y * 0.01 + plot.coordinates.x * 0.01,
        ...ANIMATION_CONFIG.fast
      }}
    >
      {/* 热力图背景 */}
      {heatmapColor && (
        <div className="absolute inset-0" style={{ backgroundColor: heatmapColor }} />
      )}
      
      {/* 地块背景 */}
      <div 
        className={cn(
          "absolute inset-0 border-2",
          plot.type === 'landmark' ? 'bg-gradient-to-br from-yellow-600/30 to-orange-600/30' :
          plot.type === 'protected' ? 'bg-gray-800/50' :
          `bg-gradient-to-br ${typeConfig.bgGradient}`,
          plot.status === 'available' ? 'border-green-500' :
          plot.status === 'protected' ? 'border-gray-600' :
          plot.type === 'landmark' ? 'border-gold-500' :
          isFamousBrand ? 'border-purple-500' :
          'border-gray-700'
        )}
      />
      
      {/* 编号标签 */}
      {showLabels && !isMobile && plot.type !== 'landmark' && (
        <div className="absolute top-1 left-1 bg-black/50 px-1 rounded text-xs text-gray-400">
          #{plot.id.split('-').pop()}
        </div>
      )}
      
      {/* 主要内容 */}
      <PlotContent 
        plot={plot}
        Icon={Icon}
        isMobile={isMobile}
        showLabels={showLabels}
        isFamousBrand={isFamousBrand}
      />
      
      {/* 动画效果 */}
      <PlotEffects plot={plot} />
    </motion.div>
  )
})

// 地块内容组件
function PlotContent({
  plot,
  Icon,
  isMobile,
  showLabels,
  isFamousBrand
}: {
  plot: Plot
  Icon: any
  isMobile: boolean
  showLabels: boolean
  isFamousBrand?: boolean
}) {
  return (
    <div className="relative w-full h-full p-1 md:p-2 flex flex-col">
      {/* 顶部标签栏 */}
      <div className="flex justify-between items-start mb-1">
        <div className="flex gap-1">
          {plot.features?.includes('地铁沿线') && !isMobile && (
            <span className="text-xs bg-blue-500 text-white px-1 py-0.5 rounded">M</span>
          )}
          {isFamousBrand && (
            <span className="text-xs bg-purple-500 text-white px-1 py-0.5 rounded animate-pulse">
              品牌
            </span>
          )}
          {plot.status === 'building' && (
            <span className="text-xs bg-orange-500 text-white px-1 py-0.5 rounded animate-pulse">
              建设中
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {plot.building?.popularity && plot.building.popularity > 80 && (
            <Flame className="w-3 h-3 md:w-4 md:h-4 text-red-500 animate-pulse" />
          )}
          {plot.status === 'available' && (
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </div>
      </div>
      
      {/* 中心内容 */}
      <div className="flex-1 flex items-center justify-center">
        {plot.building ? (
          <BuildingDisplay 
            building={plot.building} 
            isMobile={isMobile}
            showLabels={showLabels}
          />
        ) : plot.status === 'available' ? (
          <div className="text-center">
            <Icon className="w-5 h-5 md:w-8 md:h-8 text-white/20 mb-1" />
            {!isMobile && showLabels && (
              <div className="text-xs text-green-400 font-medium">可开店</div>
            )}
          </div>
        ) : (
          <Icon className="w-5 h-5 md:w-8 md:h-8 text-white/20" />
        )}
      </div>
      
      {/* 底部信息 */}
      {plot.status !== 'protected' && !isMobile && showLabels && (
        <div className="text-center">
          {plot.status === 'available' ? (
            <div>
              <div className="text-xs font-bold text-green-400">
                {formatCurrency(plot.price)}
              </div>
              <div className="text-xs text-gray-500">
                +{formatCurrency(plot.monthlyYield)}/月
              </div>
            </div>
          ) : plot.building && (
            <div className="text-xs text-gray-400">
              {plot.ownerName || '已售出'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// 建筑展示组件
function BuildingDisplay({
  building,
  isMobile,
  showLabels
}: {
  building: Plot['building']
  isMobile: boolean
  showLabels: boolean
}) {
  if (!building) return null
  
  return (
    <div className="text-center relative">
      {/* 楼层效果 */}
      {building.floors && building.floors > 1 && !isMobile && (
        <div className="absolute inset-0 -z-10">
          {[...Array(Math.min(building.floors, 3))].map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 bg-gray-700/20 rounded"
              style={{
                transform: `translateY(${-(i + 1) * 2}px) translateX(${(i + 1) * 2}px)`,
                zIndex: -i
              }}
            />
          ))}
        </div>
      )}
      
      {/* 建筑图标 */}
      <div className={cn(
        "text-2xl md:text-3xl mb-1",
        building.popularity && building.popularity > 85 && "animate-pulse"
      )}>
        {building.icon}
      </div>
      
      {/* 建筑名称 */}
      {!isMobile && showLabels && (
        <div className="text-xs font-medium text-white/90 px-1">
          {building.name}
        </div>
      )}
      
      {/* 等级星星 */}
      {building.level > 1 && !isMobile && (
        <div className="flex justify-center gap-0.5 mt-0.5">
          {[...Array(Math.min(building.level, 5))].map((_, i) => (
            <Star 
              key={i} 
              className="w-2 h-2 fill-yellow-500 text-yellow-500" 
            />
          ))}
        </div>
      )}
      
      {/* 楼层数 */}
      {building.floors && building.floors > 3 && !isMobile && (
        <div className="absolute -top-1 -right-1 bg-black/70 text-xs px-1 rounded">
          {building.floors}F
        </div>
      )}
    </div>
  )
}

// 地块效果组件
function PlotEffects({ plot }: { plot: Plot }) {
  return (
    <>
      {/* 人流动画 */}
      {plot.building && plot.trafficFlow && plot.trafficFlow > 2 && (
        <TrafficAnimation 
          level={plot.trafficFlow} 
          isCommercial={plot.type === 'commercial'} 
        />
      )}
      
      {/* 营业状态光效 */}
      {plot.building && plot.status === 'owned' && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse" />
      )}
      
      {/* 特殊地块光晕 */}
      {plot.type === 'special' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-2 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
        </div>
      )}
    </>
  )
}

// 人流动画组件
function TrafficAnimation({ 
  level, 
  isCommercial 
}: { 
  level: number
  isCommercial: boolean 
}) {
  const particleCount = isCommercial ? level * 2 : level - 2
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(Math.max(particleCount, 0))].map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            "absolute w-1 h-1 rounded-full",
            isCommercial ? "bg-yellow-400" : "bg-blue-400"
          )}
          initial={{ 
            x: Math.random() < 0.5 ? -10 : 110, 
            y: Math.random() * 100 
          }}
          animate={{
            x: Math.random() < 0.5 ? 110 : -10,
            y: Math.random() * 100
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "linear"
          }}
        />
      ))}
    </div>
  )
}

// 地块悬浮提示
const PlotTooltip = memo(function PlotTooltip({ 
  plot, 
  cellSize 
}: { 
  plot: Plot
  cellSize: number 
}) {
  const typeConfig = PLOT_TYPES[plot.type]
  
  return (
    <motion.div
      className="absolute z-50 pointer-events-none"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={ANIMATION_CONFIG.fast}
      style={{
        left: (plot.coordinates.x + plot.size.width / 2) * cellSize,
        top: (plot.coordinates.y + plot.size.height) * cellSize + 10
      }}
    >
      <div className="bg-black/90 backdrop-blur rounded-lg p-3 text-sm min-w-[240px] max-w-[300px]">
        {/* 标题区 */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="font-bold text-white">{plot.name}</div>
            <div className="text-xs text-gray-400">{typeConfig.name}</div>
          </div>
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            `bg-gradient-to-br ${typeConfig.bgGradient}`
          )}>
            <typeConfig.icon className="w-5 h-5 text-white/70" />
          </div>
        </div>
        
        {/* 商店信息 */}
        {plot.building && (
          <div className="border-t border-gray-700 pt-2 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{plot.building.icon}</span>
              <div className="flex-1">
                <div className="text-xs font-medium text-white">{plot.building.name}</div>
                <div className="text-xs text-gray-500">
                  Lv.{plot.building.level} {plot.building.floors && `· ${plot.building.floors}层`}
                </div>
              </div>
            </div>
            {plot.building.popularity && (
              <div className="flex items-center gap-1 text-xs">
                <span className="text-gray-400">人气值:</span>
                <div className="flex-1 bg-gray-700 rounded-full h-2 relative overflow-hidden">
                  <div 
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full transition-all",
                      plot.building.popularity > 80 ? "bg-red-500" : 
                      plot.building.popularity > 60 ? "bg-yellow-500" : "bg-green-500"
                    )}
                    style={{ width: `${plot.building.popularity}%` }}
                  />
                </div>
                <span className="text-white font-medium">{plot.building.popularity}</span>
              </div>
            )}
            {plot.building.dailyRevenue && (
              <div className="text-xs text-gray-400 mt-1">
                日收入: <span className="text-green-400">{formatCurrency(plot.building.dailyRevenue)}</span>
              </div>
            )}
          </div>
        )}
        
        {/* 财务信息 */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-800/50 p-2 rounded">
            <div className="text-gray-400">价格</div>
            <div className={cn(
              "font-bold",
              plot.status === 'available' ? "text-green-400" : "text-gray-500"
            )}>
              {plot.status === 'available' ? formatCurrency(plot.price) : '已售出'}
            </div>
          </div>
          <div className="bg-gray-800/50 p-2 rounded">
            <div className="text-gray-400">月收益</div>
            <div className="font-bold text-yellow-400">
              {formatCurrency(plot.monthlyYield)}
            </div>
          </div>
        </div>
        
        {/* 特性标签 */}
        {plot.features && plot.features.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {plot.features.map((feature, i) => (
              <span key={i} className="text-xs bg-gray-700 px-1.5 py-0.5 rounded">
                {feature}
              </span>
            ))}
          </div>
        )}
        
        {/* 操作提示 */}
        {plot.status === 'available' && (
          <div className="mt-2 text-xs text-center text-gray-400 border-t border-gray-700 pt-2">
            点击查看详情
          </div>
        )}
      </div>
    </motion.div>
  )
})

// 城市背景组件
function CityBackground({
  config,
  cellSize,
  showLabels,
  viewMode
}: {
  config: CityConfig
  cellSize: number
  showLabels: boolean
  viewMode: 'grid' | 'satellite'
}) {
  if (viewMode === 'satellite') {
    // 卫星视图模式
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 opacity-50" />
    )
  }
  
  return (
    <svg 
      className="absolute inset-0 pointer-events-none"
      viewBox={`0 0 ${config.gridSize.width * cellSize} ${config.gridSize.height * cellSize}`}
      style={{ width: config.gridSize.width * cellSize, height: config.gridSize.height * cellSize }}
    >
      {/* 区域划分 */}
      <rect x={0} y={0} width={cellSize * 10} height={cellSize * 15} fill="#1a1a2e" opacity="0.2" />
      <rect x={cellSize * 10} y={0} width={cellSize * 10} height={cellSize * 15} fill="#16213e" opacity="0.2" />
      
      {/* 主要道路 */}
      <line 
        x1={0} 
        y1={cellSize * 7.5} 
        x2={cellSize * 20} 
        y2={cellSize * 7.5} 
        stroke="#666" 
        strokeWidth="30" 
        opacity="0.5" 
      />
      
      {/* 环路 */}
      <rect 
        x={cellSize * 3} 
        y={cellSize * 3} 
        width={cellSize * 14} 
        height={cellSize * 9} 
        fill="none" 
        stroke="#555" 
        strokeWidth="20" 
        rx="100" 
        opacity="0.3"
      />
      
      {/* 水体 */}
      {config.waterBodies?.map(water => (
        <rect
          key={water.name}
          x={water.x * cellSize}
          y={water.y * cellSize}
          width={water.width * cellSize}
          height={water.height * cellSize}
          fill="#4FC3F7"
          opacity="0.3"
          rx="20"
        />
      ))}
      
      {/* 商圈范围 */}
      {config.businessDistricts?.map(district => (
        <circle
          key={district.name}
          cx={district.center.x * cellSize}
          cy={district.center.y * cellSize}
          r={district.radius * cellSize}
          fill={
            district.type === 'CBD' ? '#FFD700' :
            district.type === 'tech' ? '#00BCD4' :
            district.type === 'shopping' ? '#FF5722' :
            '#9C27B0'
          }
          opacity="0.1"
          strokeWidth="2"
          stroke={
            district.type === 'CBD' ? '#FFD700' :
            district.type === 'tech' ? '#00BCD4' :
            district.type === 'shopping' ? '#FF5722' :
            '#9C27B0'
          }
          strokeOpacity="0.3"
          strokeDasharray="5,5"
        />
      ))}
    </svg>
  )
}

// 地铁层组件
function SubwayLayer({
  stations,
  cellSize,
  showLabels,
  isMobile
}: {
  stations: CityConfig['subwayStations']
  cellSize: number
  showLabels: boolean
  isMobile: boolean
}) {
  // 地铁线路颜色
  const lineColors: Record<string, string> = {
    '1号线': '#DC2626',
    '2号线': '#3B82F6',
    '4号线': '#10B981',
    '6号线': '#F59E0B',
    '8号线': '#8B5CF6',
    '10号线': '#06B6D4',
    '15号线': '#EC4899'
  }
  
  return (
    <>
      {/* 地铁线路 */}
      <svg 
        className="absolute inset-0 pointer-events-none"
        viewBox={`0 0 ${20 * cellSize} ${15 * cellSize}`}
        style={{ width: 20 * cellSize, height: 15 * cellSize }}
      >
        {/* 简化的线路连接 */}
        <path
          d={`M ${3 * cellSize} ${8 * cellSize} L ${17 * cellSize} ${8 * cellSize}`}
          stroke={lineColors['1号线']}
          strokeWidth="4"
          fill="none"
          opacity="0.8"
        />
        <path
          d={`M ${5 * cellSize} ${2 * cellSize} L ${5 * cellSize} ${13 * cellSize}`}
          stroke={lineColors['4号线']}
          strokeWidth="4"
          fill="none"
          opacity="0.8"
        />
      </svg>
      
      {/* 地铁站点 */}
      {stations.map(station => (
        <motion.div
          key={station.name}
          className="absolute flex flex-col items-center justify-center pointer-events-none"
          style={{
            left: station.x * cellSize + cellSize / 2,
            top: station.y * cellSize + cellSize / 2,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30" />
            <div className="relative bg-blue-600 text-white rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-xs font-bold shadow-lg">
              M
            </div>
          </div>
          {showLabels && !isMobile && (
            <div className="mt-1 bg-black/70 px-2 py-0.5 rounded text-xs text-white whitespace-nowrap">
              {station.name}
            </div>
          )}
        </motion.div>
      ))}
    </>
  )
}

// 地标标签组件
function LandmarkLabels({
  landmarks,
  cellSize,
  isMobile
}: {
  landmarks: CityConfig['landmarks']
  cellSize: number
  isMobile: boolean
}) {
  if (isMobile) return null
  
  return (
    <>
      {landmarks.map(landmark => (
        <div
          key={landmark.id}
          className="absolute pointer-events-none"
          style={{
            left: landmark.coordinates.x * cellSize,
            top: (landmark.coordinates.y - 0.5) * cellSize,
            width: landmark.size.width * cellSize,
          }}
        >
          <div className="bg-gold-500/90 text-black px-2 py-1 rounded text-xs font-bold text-center shadow-lg">
            {landmark.name}
          </div>
        </div>
      ))}
    </>
  )
}

// 地图图例组件
function MapLegend({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="bg-black/80 backdrop-blur p-2 md:p-3 rounded-lg pointer-events-auto">
      <h4 className="text-xs font-bold text-white mb-1 md:mb-2">图例</h4>
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-1 md:gap-2">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded" />
          <span className="text-xs">可购买</span>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-gray-500 rounded" />
          <span className="text-xs">已售出</span>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-purple-500 rounded" />
          <span className="text-xs">品牌店</span>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-gold-500 rounded" />
          <span className="text-xs">地标</span>
        </div>
        {!isMobile && (
          <>
            <div className="flex items-center gap-1 md:gap-2">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-gray-600 rounded" />
              <span className="text-xs">保护区</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-blue-500 rounded-full" />
              <span className="text-xs">地铁站</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
