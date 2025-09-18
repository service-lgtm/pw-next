/*
 * @Author: yy
 * @Date: 2025-09-18 21:37:44
 * @LastEditTime: 2025-09-18 23:01:47
 * @LastEditors: yy
 * @Description: 
 */
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

interface BottomDrawerProps {
    isVisible: boolean;
    onClose: () => void;
    children: ReactNode;
    className?: string;
    height?: string;
}

const BottomDrawer = ({
    isVisible,
    onClose,
    children,
    className = "",
    height = "70vh"
}: BottomDrawerProps) => {
    // 移动端标识
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        document.body.style.overflow = isVisible ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isVisible]);
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // 兼容两端弹出效果
    const DrawerBoxProps = isMobile ? {
        initial: { y: "100%" },
        animate: {
            y: ["100%", "0%", `calc(0% - ${height} / 8)`, "0%"],
            transition: {
                duration: 0.6,
                times: [0, 0.4, 0.6, 0.8],
                ease: ["easeOut", "easeOut", "easeInOut"]
            }
        },
        exit: {
            y: "100%",
            transition: {
                duration: 0.3,
                ease: "easeInOut"
            }
        }
    } : {
        initial: { y: 280 },
        animate: { y: 0 },
        exit: { y: "100%" }
    }
    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* 背景遮罩 */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={onClose}
                    />

                    {/* 抽屉回弹遮挡背景 */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: "0%" }}
                        exit={{ y: "100%" }}
                        transition={{
                            duration: 0.3,
                            ease: "easeOut"
                        }}
                        className="fixed bottom-0 left-0 right-0 z-40 bg-[#1E1C1B]"
                        style={{ height: `calc(${height} / 2)` }}
                    />

                    {/* 抽屉内容 */}
                    <motion.div
                        {...DrawerBoxProps}
                        className={`fixed bottom-0 left-0 right-0 z-50 bg-[#1E1C1B] rounded-t-2xl ${className}`}
                        style={{ height }}
                    >
                        {/* 内容区域 */}
                        <div className="px-4 pt-10 pb-4" style={{ height }}>
                            {/* 关闭按钮 */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                            {/* 内容超出滚动 */}
                            <div className="h-full overflow-y-auto">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default BottomDrawer;
