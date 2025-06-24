'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PixelCardProps {
  children?: ReactNode
  className?: string
  variant?: 'default' | 'gold' | 'success' | 'danger'
  noPadding?: boolean
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

const variants = {
  default: 'border-gray-700 bg-[#0A1628]/50',
  gold: 'border-gold-500 bg-gold-500/10',
  success: 'border-green-500 bg-green-500/10',
  danger: 'border-red-500 bg-red-500/10'
}

export function PixelCard({ 
  children, 
  className, 
  variant = 'default',
  noPadding = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: PixelCardProps) {
  return (
    <motion.div
      className={cn(
        'relative border-4',
        'shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]',
        'hover:shadow-[6px_6px_0_0_rgba(0,0,0,0.3)]',
        'transition-all duration-200',
        variants[variant],
        !noPadding && 'p-6',
        className
      )}
      whileHover={{ y: -2 }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* 像素角装饰 */}
      <div className="absolute -top-1 -left-1 w-2 h-2 bg-gold-500" />
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-gold-500" />
      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gold-500" />
      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-gold-500" />
      
      {children}
    </motion.div>
  )
}
