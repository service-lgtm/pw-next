/*
 * @Author: yy
 * @Date: 2025-09-19 20:55:05
 * @LastEditTime: 2025-09-19 22:10:31
 * @LastEditors: yy
 * @Description: 
 */

import { motion, AnimatePresence } from 'framer-motion'

interface BottomMenuBarLayoutProps {
    children: React.ReactNode;
}

/** 底部菜单栏布局 */
const BottomMenuBarLayout: React.FC<BottomMenuBarLayoutProps> = (props) => {
    const { children } = props;

    // 路由菜单
    const menuList = [
        {
            name: "首页",
            icon: "",
            path: "",
        },
        {
            name: "市场",
            icon: "",
            path: "",
        },
        {
            name: "领地",
            icon: "",
            path: "",
        },
        {
            name: "资产",
            icon: "",
            path: "",
        },
        {
            name: "我的",
            icon: "",
            path: "",
        },
    ]

    return <div className="h-[100dvh]">

        {/* 视图内容 */}
        <div className="h-[calc(100%-var(--bottom-menu-height,58px))] overflow-y-auto">
            {children}
        </div>
        {/* 底部菜单导航 */}
        <AnimatePresence>
            <motion.aside
                initial={{ y: 280 }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className={"w-full h-[var(--bottom-menu-height,58px)] bg-[#1A1A1A] fixed bottom-0 left-0 flex items-center justify-around"}
            >
                {
                    menuList.map((item, index) => {
                        return <div key={index} className="flex flex-col items-center gap-[2px]">
                            <div className="w-[26px] h-[26px] rounded-[10px] bg-[#31261A]"></div>
                            <div className="text-[#E7E7E7] text-[12px]">{item.name}</div>
                        </div>
                    })
                }
            </motion.aside>
        </AnimatePresence>
    </div>
}

export default BottomMenuBarLayout;