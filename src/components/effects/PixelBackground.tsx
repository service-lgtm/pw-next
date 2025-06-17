'use client'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export function PixelBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 设置画布尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    // 像素粒子类
    class PixelParticle {
      x: number
      y: number
      size: number
      speedY: number
      opacity: number
      color: string
      
      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth
        this.y = canvasHeight + 10
        this.size = Math.random() * 3 + 2
        this.speedY = Math.random() * 2 + 1
        this.opacity = Math.random() * 0.5 + 0.3
        this.color = Math.random() > 0.5 ? '#FFD700' : '#DAA520'
      }
      
      update(canvasWidth: number, canvasHeight: number) {
        this.y -= this.speedY
        if (this.y < -10) {
          this.y = canvasHeight + 10
          this.x = Math.random() * canvasWidth
        }
      }
      
      draw(context: CanvasRenderingContext2D) {
        context.fillStyle = this.color
        context.globalAlpha = this.opacity
        context.fillRect(this.x, this.y, this.size * 4, this.size * 4)
      }
    }
    
    // 创建粒子
    const particles: PixelParticle[] = []
    for (let i = 0; i < 30; i++) {
      particles.push(new PixelParticle(canvas.width, canvas.height))
    }
    
    // 动画循环
    let animationId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(particle => {
        particle.update(canvas.width, canvas.height)
        particle.draw(ctx)
      })
      
      animationId = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])
  
  return (
    <>
      {/* 像素网格背景 */}
      <div className="fixed inset-0 pixel-grid pointer-events-none z-0" />
      
      {/* 动态像素粒子 */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.6 }}
      />
      
      {/* 渐变叠加 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
        <div className="absolute inset-0 bg-gradient-radial from-gold-500/5 via-transparent to-transparent" />
      </div>
      
      {/* 扫描线效果 */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'linear-gradient(transparent 50%, rgba(255, 215, 0, 0.03) 50%)',
          backgroundSize: '100% 4px',
        }}
        animate={{
          backgroundPositionY: ['0px', '4px'],
        }}
        transition={{
          duration: 0.1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </>
  )
}
