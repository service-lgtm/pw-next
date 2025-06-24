'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { PixelCard } from '@/components/shared/PixelCard'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// 世界地图配置
const WORLD_MAP_CONFIG = {
  width: 1920,
  height: 1080,
  tileSize: 32,
  regions: {
    china: {
      name: '中国',
      status: 'open',
      bounds: { x: 1200, y: 400, width: 400, height: 300 },
      capital: { x: 1350, y: 480 },
      color: '#FFD700',
      glow: '#FFA500',
      cities: [
        { id: 'beijing', name: '北京', x: 1350, y: 480, tier: 'capital' },
        { id: 'shanghai', name: '上海', x: 1380, y: 520, tier: 'mega' },
        { id: 'guangzhou', name: '广州', x: 1340, y: 580, tier: 'mega' },
        { id: 'shenzhen', name: '深圳', x: 1350, y: 590, tier: 'mega' },
        { id: 'chengdu', name: '成都', x: 1280, y: 520, tier: 'major' },
        { id: 'xian', name: '西安', x: 1320, y: 500, tier: 'major' },
      ]
    },
    northamerica: {
      name: '北美洲',
      status: 'coming',
      bounds: { x: 300, y: 350, width: 500, height: 400 },
      capital: { x: 450, y: 500 },
      color: '#87CEEB',
      releaseDate: '2025 Q2'
    },
    europe: {
      name: '欧洲',
      status: 'coming',
      bounds: { x: 900, y: 300, width: 300, height: 250 },
      capital: { x: 1000, y: 400 },
      color: '#98FB98',
      releaseDate: '2025 Q3'
    },
    southamerica: {
      name: '南美洲',
      status: 'locked',
      bounds: { x: 400, y: 700, width: 300, height: 400 },
      capital: { x: 500, y: 850 },
      color: '#DDA0DD'
    },
    africa: {
      name: '非洲',
      status: 'locked',
      bounds: { x: 900, y: 550, width: 350, height: 450 },
      capital: { x: 1050, y: 750 },
      color: '#F0E68C'
    },
    oceania: {
      name: '大洋洲',
      status: 'locked',
      bounds: { x: 1400, y: 800, width: 300, height: 200 },
      capital: { x: 1500, y: 900 },
      color: '#FFB6C1'
    }
  }
}

// 城市等级配置
const CITY_TIERS = {
  capital: { size: 20, color: '#FFD700', icon: '👑', glow: true },
  mega: { size: 16, color: '#FF6B6B', icon: '🏙️', glow: true },
  major: { size: 12, color: '#4ECDC4', icon: '🌆', glow: false },
  normal: { size: 8, color: '#95E1D3', icon: '🏘️', glow: false }
}

// 地形瓦片类型
const TERRAIN_TYPES = {
  ocean: { color: '#1a3a52', pattern: 'waves' },
  land: { color: '#2d5016', pattern: 'grass' },
  mountain: { color: '#8B7355', pattern: 'rocks' },
  desert: { color: '#C19A6B', pattern: 'sand' },
  snow: { color: '#FFFAFA', pattern: 'snow' }
}

export default function ExplorePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  const [hoveredCity, setHoveredCity] = useState<string | null>(null)
  const [mapScale, setMapScale] = useState(0.6)
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showCityLabels, setShowCityLabels] = useState(true)
  const [animationFrame, setAnimationFrame] = useState(0)

  // 绘制像素化的世界地图
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置画布大小
    canvas.width = window.innerWidth
    canvas.height = 600

    // 启用像素化渲染
    ctx.imageSmoothingEnabled = false

    const drawPixelRect = (x: number, y: number, width: number, height: number, color: string) => {
      ctx.fillStyle = color
      const pixelSize = 4
      for (let px = 0; px < width; px += pixelSize) {
        for (let py = 0; py < height; py += pixelSize) {
          ctx.fillRect(
            Math.floor(x + px), 
            Math.floor(y + py), 
            pixelSize, 
            pixelSize
          )
        }
      }
    }

    const drawRegion = (regionId: string, region: any) => {
      const { bounds, color, status } = region
      const x = (bounds.x * mapScale) + mapOffset.x
      const y = (bounds.y * mapScale) + mapOffset.y
      const width = bounds.width * mapScale
      const height = bounds.height * mapScale

      // 绘制区域主体
      if (status === 'open') {
        // 绘制发光效果
        ctx.shadowColor = region.glow || color
        ctx.shadowBlur = 20
        drawPixelRect(x, y, width, height, color)
        ctx.shadowBlur = 0
      } else {
        // 未开放区域用暗色
        drawPixelRect(x, y, width, height, status === 'coming' ? '#444' : '#222')
      }

      // 绘制边框
      ctx.strokeStyle = hoveredRegion === regionId ? '#FFF' : '#000'
      ctx.lineWidth = hoveredRegion === regionId ? 3 : 1
      ctx.strokeRect(x, y, width, height)

      // 绘制首都标记
      if (region.capital) {
        const capX = (region.capital.x * mapScale) + mapOffset.x
        const capY = (region.capital.y * mapScale) + mapOffset.y
        
        ctx.fillStyle = '#FFF'
        ctx.beginPath()
        ctx.arc(capX, capY, 5, 0, Math.PI * 2)
        ctx.fill()
        
        if (status === 'open') {
          // 动画效果
          ctx.strokeStyle = color
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(capX, capY, 10 + (Math.sin(animationFrame * 0.1) * 3), 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      // 绘制区域名称
      ctx.fillStyle = status === 'open' ? '#FFF' : '#666'
      ctx.font = 'bold 16px "Press Start 2P", monospace'
      ctx.textAlign = 'center'
      const textX = x + width / 2
      const textY = y + height / 2
      ctx.fillText(region.name, textX, textY)

      // 绘制状态标签
      if (status !== 'open') {
        ctx.font = '10px "Press Start 2P", monospace'
        ctx.fillStyle = status === 'coming' ? '#FFD700' : '#666'
        const statusText = status === 'coming' ? 'COMING SOON' : 'LOCKED'
        ctx.fillText(statusText, textX, textY + 20)
        if (region.releaseDate) {
          ctx.fillText(region.releaseDate, textX, textY + 35)
        }
      }
    }

    const drawCity = (city: any, region: any) => {
      if (region.status !== 'open') return
      
      const tier = CITY_TIERS[city.tier as keyof typeof CITY_TIERS]
      const x = (city.x * mapScale) + mapOffset.x
      const y = (city.y * mapScale) + mapOffset.y

      // 绘制城市图标
      ctx.fillStyle = tier.color
      ctx.fillRect(x - tier.size / 2, y - tier.size / 2, tier.size, tier.size)

      // 绘制城市光晕
      if (tier.glow) {
        ctx.strokeStyle = tier.color
        ctx.lineWidth = 1
        const glowSize = tier.size + 10 + (Math.sin(animationFrame * 0.05) * 5)
        ctx.strokeRect(x - glowSize / 2, y - glowSize / 2, glowSize, glowSize)
      }

      // 绘制城市名称
      if (showCityLabels || hoveredCity === city.id) {
        ctx.fillStyle = '#FFF'
        ctx.font = '10px "Press Start 2P", monospace'
        ctx.textAlign = 'center'
        ctx.fillText(city.name, x, y - tier.size)
      }

      // 高亮效果
      if (hoveredCity === city.id) {
        ctx.strokeStyle = '#FFD700'
        ctx.lineWidth = 3
        ctx.strokeRect(x - tier.size / 2 - 5, y - tier.size / 2 - 5, tier.size + 10, tier.size + 10)
      }
    }

    // 清空画布
    ctx.fillStyle = '#0A1628'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制网格背景
    ctx.strokeStyle = '#1a2332'
    ctx.lineWidth = 1
    const gridSize = 32 * mapScale
    for (let x = mapOffset.x % gridSize; x < canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = mapOffset.y % gridSize; y < canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // 绘制所有区域
    Object.entries(WORLD_MAP_CONFIG.regions).forEach(([id, region]) => {
      drawRegion(id, region)
    })

    // 绘制中国的城市
    const china = WORLD_MAP_CONFIG.regions.china
    if (china.cities) {
      china.cities.forEach(city => {
        drawCity(city, china)
      })
    }

  }, [mapScale, mapOffset, hoveredRegion, hoveredCity, showCityLabels, animationFrame])

  // 动画循环
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationFrame(prev => prev + 1)
    }, 50)
    return () => clearInterval(timer)
  }, [])

  // 处理鼠标事件
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 拖拽地图
    if (isDragging) {
      setMapOffset({
        x: x - dragStart.x,
        y: y - dragStart.y
      })
      return
    }

    // 检测悬停的区域
    let foundRegion = null
    let foundCity = null

    Object.entries(WORLD_MAP_CONFIG.regions).forEach(([id, region]) => {
      const bounds = region.bounds
      const rx = (bounds.x * mapScale) + mapOffset.x
      const ry = (bounds.y * mapScale) + mapOffset.y
      const rw = bounds.width * mapScale
      const rh = bounds.height * mapScale

      if (x >= rx && x <= rx + rw && y >= ry && y <= ry + rh) {
        foundRegion = id
      }

      // 检测城市
      if (region.status === 'open' && region.cities) {
        region.cities.forEach(city => {
          const cx = (city.x * mapScale) + mapOffset.x
          const cy = (city.y * mapScale) + mapOffset.y
          const tier = CITY_TIERS[city.tier as keyof typeof CITY_TIERS]
          
          if (Math.abs(x - cx) < tier.size && Math.abs(y - cy) < tier.size) {
            foundCity = city.id
          }
        })
      }
    })

    setHoveredRegion(foundRegion)
    setHoveredCity(foundCity)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - e.currentTarget.getBoundingClientRect().left - mapOffset.x,
      y: e.clientY - e.currentTarget.getBoundingClientRect().top - mapOffset.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredRegion && WORLD_MAP_CONFIG.regions[hoveredRegion].status === 'open') {
      setSelectedRegion(hoveredRegion)
    }
  }

  const handleZoom = (delta: number) => {
    setMapScale(prev => Math.max(0.3, Math.min(1.5, prev + delta)))
  }

  return (
    <div className="min-h-screen bg-[#0F0F1E]">
      {/* 顶部控制栏 */}
      <div className="fixed top-20 left-0 right-0 z-20 bg-[#0A1628]/95 backdrop-blur border-b-4 border-gray-800">
        <Container>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-black text-gold-500 pixel-font">
                WORLD MAP
              </h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleZoom(0.1)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold transition-colors"
                >
                  放大 +
                </button>
                <button
                  onClick={() => handleZoom(-0.1)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold transition-colors"
                >
                  缩小 -
                </button>
                <button
                  onClick={() => {
                    setMapScale(0.6)
                    setMapOffset({ x: 0, y: 0 })
                  }}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold transition-colors"
                >
                  重置
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showCityLabels}
                  onChange={(e) => setShowCityLabels(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-gray-400">显示城市名称</span>
              </label>
              
              {hoveredRegion && (
                <div className="text-sm text-gray-400">
                  悬停: <span className="text-gold-500 font-bold">
                    {WORLD_MAP_CONFIG.regions[hoveredRegion].name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* 地图画布 */}
      <div className="pt-32 relative">
        <canvas
          ref={canvasRef}
          className="w-full cursor-move"
          style={{ 
            imageRendering: 'pixelated',
            cursor: isDragging ? 'grabbing' : hoveredRegion ? 'pointer' : 'grab'
          }}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setHoveredRegion(null)
            setHoveredCity(null)
            setIsDragging(false)
          }}
          onClick={handleClick}
        />

        {/* 地图图例 */}
        <div className="absolute bottom-4 left-4 bg-[#0A1628]/95 p-4 rounded-lg">
          <h3 className="text-sm font-bold mb-3 text-gold-500">图例</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#FFD700]" />
              <span>已开放区域</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#444]" />
              <span>即将开放</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#222]" />
              <span>未开放</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#FFD700]" />
              <span>首都/省会</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#FF6B6B]" />
              <span>特大城市</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#4ECDC4]" />
              <span>主要城市</span>
            </div>
          </div>
        </div>

        {/* 操作提示 */}
        <div className="absolute bottom-4 right-4 bg-[#0A1628]/95 p-4 rounded-lg text-xs text-gray-400">
          <p>🖱️ 拖拽移动地图</p>
          <p>🔍 滚轮缩放</p>
          <p>👆 点击进入区域</p>
        </div>
      </div>

      {/* 选中区域的详细信息 */}
      <AnimatePresence>
        {selectedRegion && (
          <motion.div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedRegion(null)}
          >
            <motion.div
              className="max-w-4xl w-full bg-[#0A1628] border-4 border-gold-500 p-8"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                imageRendering: 'pixelated',
                boxShadow: '0 0 0 4px #000, 0 0 0 8px #FFD700'
              }}
            >
              {(() => {
                const region = WORLD_MAP_CONFIG.regions[selectedRegion]
                if (selectedRegion === 'china') {
                  return (
                    <>
                      <h2 className="text-3xl font-black text-gold-500 mb-6 pixel-font text-center">
                        {region.name}
                      </h2>
                      
                      <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <div>
                          <h3 className="text-xl font-bold mb-4 text-gold-500">区域统计</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-400">开放城市</span>
                              <span className="font-bold">{region.cities?.length || 0} 个</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">总地块数</span>
                              <span className="font-bold">50,000+</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">已售地块</span>
                              <span className="font-bold text-gold-500">37,420</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">平均地价</span>
                              <span className="font-bold">¥15,888</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold mb-4 text-gold-500">热门城市</h3>
                          <div className="space-y-2">
                            {region.cities?.slice(0, 4).map(city => {
                              const tier = CITY_TIERS[city.tier as keyof typeof CITY_TIERS]
                              return (
                                <Link
                                  key={city.id}
                                  href={`/explore/china/${city.id}`}
                                  className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">{tier.icon}</span>
                                    <span className="font-bold">{city.name}</span>
                                  </div>
                                  <span className="text-sm text-gold-500">进入 →</span>
                                </Link>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <Link href="/explore/china">
                          <motion.button
                            className="pixel-btn text-lg px-8 py-4"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            进入中国区域
                          </motion.button>
                        </Link>
                      </div>
                    </>
                  )
                }
                
                return (
                  <div className="text-center">
                    <h2 className="text-3xl font-black text-gray-500 mb-4 pixel-font">
                      {region.name}
                    </h2>
                    <p className="text-gray-400 mb-4">该区域暂未开放</p>
                    {region.releaseDate && (
                      <p className="text-gold-500 font-bold">预计开放时间: {region.releaseDate}</p>
                    )}
                  </div>
                )
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
