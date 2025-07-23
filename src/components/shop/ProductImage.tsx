// src/components/shop/ProductImage.tsx
// 商品图片组件 - 统一处理图片加载错误

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ProductImageProps {
  src?: string
  alt: string
  className?: string
  fallbackIcon?: string
  fallbackClassName?: string
}

export function ProductImage({ 
  src, 
  alt, 
  className = 'w-full h-full object-cover',
  fallbackIcon = '📦',
  fallbackClassName = 'text-6xl'
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  if (!src || hasError) {
    return (
      <div className={cn(
        'w-full h-full flex items-center justify-center opacity-20',
        fallbackClassName
      )}>
        {fallbackIcon}
      </div>
    )
  }

  return (
    <>
      {isLoading && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-pulse bg-gray-700 w-full h-full" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn(className, isLoading && 'hidden')}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
      />
    </>
  )
}
