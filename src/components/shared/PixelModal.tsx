// src/components/shared/PixelModal.tsx
// 优化后的 PixelModal 组件 - 解决居中问题

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface PixelModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  size?: 'small' | 'medium' | 'large'
}

export function PixelModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className,
  size = 'medium' 
}: PixelModalProps) {
  
  // 防止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // ESC 键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
      return () => window.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])

  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-3xl'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            className="fixed inset-0 bg-black/80 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* 弹窗容器 - 使用 flex 确保居中 */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* 弹窗内容 */}
            <motion.div
              className={cn(
                "relative w-full",
                sizeClasses[size],
                "bg-[#0A1628] border-4 border-gold-500",
                "shadow-[8px_8px_0_0_rgba(0,0,0,0.5)]",
                "p-6",
                "max-h-[90vh] overflow-y-auto", // 添加最大高度和滚动
                className
              )}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 标题栏 */}
              {title && (
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-gold-500">{title}</h3>
                  <button
                    onClick={onClose}
                    className="text-2xl text-gray-400 hover:text-white transition-colors p-1"
                    aria-label="关闭弹窗"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {/* 内容 */}
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
