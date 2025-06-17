import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { motion, HTMLMotionProps } from 'framer-motion'

type ButtonMotionProps = HTMLMotionProps<'button'>

export interface ButtonProps extends Omit<ButtonMotionProps, 'ref'> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  pixelStyle?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', pixelStyle = true, children, ...props }, ref) => {
    if (pixelStyle) {
      const pixelVariants = {
        primary: 'bg-gold-500 text-[#0A1628] hover:bg-gold-400',
        secondary: 'bg-transparent text-gold-500 border-4 border-gold-500 hover:bg-gold-500 hover:text-[#0A1628]',
        ghost: 'bg-transparent text-white hover:text-gold-500',
      }

      const pixelSizes = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base',
      }

      return (
        <motion.button
          ref={ref}
          className={cn(
            'relative font-bold uppercase tracking-wider transition-all duration-100',
            'shadow-[0_4px_0_0_#DAA520,0_8px_0_0_rgba(0,0,0,0.3)]',
            'hover:translate-y-[-2px] hover:shadow-[0_6px_0_0_#DAA520,0_10px_0_0_rgba(0,0,0,0.3)]',
            'active:translate-y-0 active:shadow-[0_4px_0_0_#DAA520,0_8px_0_0_rgba(0,0,0,0.3)]',
            pixelVariants[variant],
            pixelSizes[size],
            className
          )}
          whileTap={{ scale: 0.98 }}
          {...props}
        >
          {children}
        </motion.button>
      )
    }

    // 原始样式（非像素风格）
    const variants = {
      primary: 'bg-white text-black hover:bg-gray-200',
      secondary: 'bg-transparent text-white border border-gray-700 hover:bg-gray-900',
      ghost: 'bg-transparent text-white hover:bg-gray-900',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded font-semibold transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
          'disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
