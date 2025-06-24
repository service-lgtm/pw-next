'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// 中国地图配置
const CHINA_MAP_CONFIG = {
  width: 1600,
  height: 1200,
  provinces: [
    {
      id: 'beijing',
      name: '北京',
      type: 'municipality',
      center: { x: 850, y: 400 },
      color: '#FFD700',
      lands: 5680,
      available: 256,
      avgPrice: 28888,
      hot: true
    },
    {
      id: 'shanghai',
      name: '上海',
      type: 'municipality',
      center: { x: 950, y: 600 },
      color: '#FF6B6B',
      lands: 4560,
      available: 189,
      avgPrice: 32888,
      hot: true
    },
    {
      id: 'guangdong',
      name: '广东',
      type: 'province',
      center: { x: 850, y: 800 },
      color: '#4ECDC4',
      lands: 8900,
      available: 1234,
      avgPrice: 22888,
      hot: true,
      cities: ['广州', '深圳', '东莞', '佛山']
    },
    {
      id: 'sichuan',
      name: '四川',
      type: 'province',
      center: { x: 600, y: 600 },
      color: '#95E1D3',
      lands: 3200,
      available: 890,
      avgPrice: 12888,
      hot: false
    },
    {
      id: 'shaanxi',
      name: '陕西',
      type: 'province',
      center: { x: 700, y: 500 },
      color: '#A8E6CF',
      lands: 2100,
      available: 567,
      avgPrice: 9888,
      hot: false
    }
  ]
}

// 像素化绘制函数
function drawPixelText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number = 12) {
  ctx.font = `${size}px "Press Start 2P", monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // 绘制文字阴影
  ctx.fillStyle = '#000'
  ctx.fillText(text, x + 2, y + 2)
  
  // 绘制文字
  ctx.fillStyle = '#FFF'
  ctx.fillText(text, x, y)
}

function drawPixelCircle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
  const pixelSize = 4
  ctx.fillStyle = color
  
  for (let px = -radius; px <= radius; px += pixelSize) {
    for (let py = -radius; py <= radius; py += pixelSize) {
      if (px * px + py * py <= radius * radius) {
        ctx.fillRect(x + px, y + py, pixelSize, pixelSize)
      }
    }
  }
}

export default function ChinaMapPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null)
  const [mapOffset, setMapOffset] = useState({ x: -200, y: -100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [animationFrame, setAnimationFrame] = useState(0)

  // 主地图绘制
  useEffect(() => {
    const canvas = canvasRef.current
    const minimap = minimapCanvasRef.current
    if (!canvas || !minimap) return

    const ctx = canvas.getContext('2d')
    const minimapCtx = minimap.getContext('2d')
    if (!ctx || !minimapCtx) return

    // 设置画布大小
    canvas.width = 1200
    canvas.height = 800
    minimap.width = 200
    minimap.height = 150

    // 启用像素化
    ctx.imageSmoothingEnabled = false
    minimapCtx.imageSmoothingEnabled = false

    // 清空画布
    ctx.fillStyle = '#0A1628'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    minimapCtx.fillStyle = '#0A1628'
    minimapCtx.fillRect(0, 0, minimap.width, minimap.height)

    // 绘制网格
    ctx.strokeStyle = '#1a2332'
    ctx.lineWidth = 1
    const gridSize = 32
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

    // 绘制省份
    CHINA_MAP_CONFIG.provinces.forEach(province => {
      const x = province.center.x + mapOffset.x
      const y = province.center.y + mapOffset.y
      const radius = province.hot ? 80 : 60
      const isHovered = hoveredProvince === province.id

      // 绘制省份区域
      if (province.hot) {
        // 热门地区发光效果
        ctx.shadowColor = province.color
        ctx.shadowBlur = 20 + Math.sin(animationFrame * 0.05) * 10
      }
      
      drawPixelCircle(ctx, x, y, radius + (isHovered ? 10 : 0), province.color)
      ctx.shadowBlur = 0

      // 绘制边框
      ctx.strokeStyle = isHovered ? '#FFF' : '#000'
      ctx.lineWidth = isHovered ? 3 : 2
      ctx.beginPath()
      ctx.arc(x, y, radius + (isHovered ? 10 : 0), 0, Math.PI * 2)
      ctx.stroke()

      // 绘制省份名称
      drawPixelText(ctx, province.name, x, y - 20, 14)

      // 绘制统计信息
      if (isHovered || province.hot) {
        ctx.fillStyle = '#FFD700'
        ctx.font = '10px "Press Start 2P", monospace'
        ctx.textAlign = 'center'
        ctx.fillText(`${province.available} 块可用`, x, y + 10)
        ctx.fillText(`¥${province.avgPrice}`, x, y + 25)
      }

      // 热门标记
      if (province.hot) {
        ctx.fillStyle = '#FF0000'
        ctx.font = '16px Arial'
        ctx.fillText('🔥', x + radius - 20, y - radius + 20)
      }

      // 绘制小地图
      const minimapScale = 0.125
      const minimapX = province.center.x * minimapScale
      const minimapY = province.center.y * minimapScale
      minimapCtx.fillStyle = province.color
      minimapCtx.fillRect(minimapX - 5, minimapY - 5, 10, 10)
    })

    // 绘制小地图视口
    minimapCtx.strokeStyle = '#FFD700'
    minimapCtx.lineWidth = 2
    minimapCtx.strokeRect(
      -mapOffset.x * 0.125,
      -mapOffset.y * 0.125,
      canvas.width * 0.125,
      canvas.height * 0.125
    )

  }, [mapOffset, hoveredProvince, animationFrame])

  // 动画循环
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationFrame(prev => prev + 1)
    }, 50)
    return () => clearInterval(timer)
  }, [])

  // 鼠标事件处理
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isDragging) {
      setMapOffset({
        x: x - dragStart.x,
        y: y - dragStart.y
      })
      return
    }

    // 检测悬停的省份
    let foundProvince = null
    CHINA_MAP_CONFIG.provinces.forEach(province => {
      const px = province.center.x + mapOffset.x
      const py = province.center.y + mapOffset.y
      const radius = province.hot ? 80 : 60
      
      const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2)
      if (distance < radius) {
        foundProvince = province.id
      }
    })
    
    setHoveredProvince(foundProvince)
  }

  const handleClick = () => {
    if (hoveredProvince) {
      setSelectedProvince(hoveredProvince)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F1E]">
      {/* 顶部信息栏 */}
      <div className="fixed top-20 left-0 right-0 z-20 bg-[#0A1628]/95 backdrop-blur border-b-4 border-gray-800">
        <Container>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href="/explore" className="text-gray-400 hover:text-gold-500">
                ← 返回世界地图
              </Link>
              <h1 className="text-2xl font-black text-gold-500 pixel-font">
                中国区域
              </h1>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-sm">
                <span className="text-gray-400">总地块:</span>
                <span className="text-gold-500 font-bold ml-2">50,000+</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">可用:</span>
                <span className="text-green-500 font-bold ml-2">12,580</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">均价:</span>
                <span className="text-gold-500 font-bold ml-2">¥15,888</span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* 主地图区域 */}
      <div className="pt-32 relative">
        <div className="flex">
          {/* 左侧地图 */}
          <div className="flex-1 relative">
            <canvas
              ref={canvasRef}
              className="cursor-move"
              style={{ 
                imageRendering: 'pixelated',
                cursor: isDragging ? 'grabbing' : hoveredProvince ? 'pointer' : 'grab'
              }}
              onMouseMove={handleMouseMove}
              onMouseDown={(e) => {
                setIsDragging(true)
                setDragStart({
                  x: e.clientX - e.currentTarget.getBoundingClientRect().left - mapOffset.x,
                  y: e.clientY - e.currentTarget.getBoundingClientRect().top - mapOffset.y
                })
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => {
                setHoveredProvince(null)
                setIsDragging(false)
              }}
              onClick={handleClick}
            />

            {/* 小地图 */}
            <div className="absolute top-4 right-4 bg-[#0A1628] border-2 border-gray-700 p-2">
              <canvas
                ref={minimapCanvasRef}
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>

          {/* 右侧信息面板 */}
          <div className="w-96 bg-[#0A1628] border-l-4 border-gray-800 p-6 overflow-y-auto" style={{ height: '800px' }}>
            <h2 className="text-xl font-black text-gold-500 mb-6">省份列表</h2>
            
            {/* 热门省份 */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 text-red-500">
                🔥 热门地区
              </h3>
              {CHINA_MAP_CONFIG.provinces
                .filter(p => p.hot)
                .map(province => (
                  <Link
                    key={province.id}
                    href={`/explore/china/${province.id}`}
                    className={cn(
                      "block p-4 mb-3 border-2 transition-all",
                      "hover:border-gold-500 hover:translate-x-1",
                      selectedProvince === province.id ? "border-gold-500 bg-gold-500/10" : "border-gray-700"
                    )}
                    style={{ 
                      boxShadow: '4px 4px 0 rgba(0,0,0,0.5)',
                      imageRendering: 'pixelated'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-lg" style={{ color: province.color }}>
                        {province.name}
                      </h4>
                      <span className="text-xs px-2 py-1 bg-red-500/20 text-red-500">
                        热门
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">地块:</span>
                        <span className="text-white ml-1">{province.lands}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">可用:</span>
                        <span className="text-green-500 ml-1">{province.available}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-400">均价:</span>
                        <span className="text-gold-500 font-bold ml-1">¥{province.avgPrice}</span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>

            {/* 其他省份 */}
            <div>
              <h3 className="text-lg font-bold mb-4">其他地区</h3>
              {CHINA_MAP_CONFIG.provinces
                .filter(p => !p.hot)
                .map(province => (
                  <Link
                    key={province.id}
                    href={`/explore/china/${province.id}`}
                    className={cn(
                      "block p-4 mb-3 border-2 transition-all",
                      "hover:border-gold-500 hover:translate-x-1",
                      selectedProvince === province.id ? "border-gold-500 bg-gold-500/10" : "border-gray-700"
                    )}
                    style={{ 
                      boxShadow: '4px 4px 0 rgba(0,0,0,0.5)',
                      imageRendering: 'pixelated'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold" style={{ color: province.color }}>
                        {province.name}
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">地块:</span>
                        <span className="text-white ml-1">{province.lands}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">可用:</span>
                        <span className="text-green-500 ml-1">{province.available}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-400">均价:</span>
                        <span className="text-gold-500 font-bold ml-1">¥{province.avgPrice}</span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* 底部操作提示 */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0A1628]/95 border-t-4 border-gray-800 py-4">
        <Container>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6 text-gray-400">
              <span>🖱️ 拖动查看地图</span>
              <span>👆 点击选择省份</span>
              <span>🔍 选择省份查看详细地块</span>
            </div>
            {hoveredProvince && (
              <div className="text-gold-500 font-bold">
                悬停: {CHINA_MAP_CONFIG.provinces.find(p => p.id === hoveredProvince)?.name}
              </div>
            )}
          </div>
        </Container>
      </div>
    </div>
  )
}
