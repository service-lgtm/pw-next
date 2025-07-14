//src/components/shared/PixelButton.tsx
'use client'

import { cn } from '@/lib/utils'
import { motion, HTMLMotionProps } from 'framer-motion'

interface PixelButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary: 'bg-gold-500 text-black hover:bg-gold-400',
  secondary: 'bg-transparent text-gold-500 border-2 border-gold-500 hover:bg-gold-500 hover:text-black',
  danger: 'bg-red-500 text-white hover:bg-red-400'
}

const sizes = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg'
}

export function PixelButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: PixelButtonProps) {
  return (
    <motion.button
      className={cn(
        'font-bold transition-all duration-200',
        'shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]',
        'hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]',
        'active:shadow-[0px_0px_0_0_rgba(0,0,0,0.3)]',
        'active:translate-x-[2px] active:translate-y-[2px]',
        variants[variant],
        sizes[size],
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}
