/*
 * @Author: yy
 * @Date: 2025-09-23 23:01:48
 * @LastEditTime: 2025-09-23 23:42:05
 * @LastEditors: yy
 * @Description: 
 */
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface PixelTipsModalProps {
    isVisible: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
    className?: string
}

export function PixelTipsModal({
    isVisible,
    onClose,
    title,
    children,
    className,
}: PixelTipsModalProps) {

    useEffect(() => {
        // 记录之前overflow
        const prevOverflow = document.body.style.overflow;
        // 显示时禁止滚动
        document.body.style.overflow = isVisible ? 'hidden' : prevOverflow;
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [isVisible]);

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* 背景遮罩 */}
                    <motion.div
                        className="fixed inset-0 bg-black/80 z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* 弹窗容器 */}
                    <motion.div
                        className="w-fit h-fit fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 inset-0 z-50 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* 弹窗内容 */}
                        <motion.div
                            className={cn(
                                "relative w-full",
                                "bg-[#1E1C1B] rounded-[25px]",
                                "shadow-[8px_8px_0_0_rgba(0,0,0,0.5)]",
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
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-black text-gold-500">
                                            {title}
                                        </h3>
                                    </div>
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
