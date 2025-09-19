/*
 * @Author: yy
 * @Date: 2025-09-19 21:04:11
 * @LastEditTime: 2025-09-19 23:40:50
 * @LastEditors: yy
 * @Description: 
 */
"use client"
import PixelBottomDrawer from "@/components/shared/PixelBottomDrawer";
import { PixelButton } from "@/components/shared/PixelButton";
import { useState } from "react";
import { motion, AnimatePresence } from 'framer-motion'
import Link from "next/link";
import { getPixelResourceIcon, PIXEL_RESOURCE_TYPES } from "@/utils/pixelResourceTool";



/** 挖矿中心 */
const miningCenter = () => {

    // 抽屉显示状态
    const [drawerOpen, setDrawerOpen] = useState(false);

    // 工具列表枚举
    const toolsEnum: {
        icon: PIXEL_RESOURCE_TYPES,
        count: number,
        color: [string, string, string]
    }[] = [
            {
                // 镐头
                icon: PIXEL_RESOURCE_TYPES.PICKAXE,
                count: 164345,
                color: ["#F7921B", "#F7921B80", "#F7921B33"],
            },
            {
                // 斧头
                icon: PIXEL_RESOURCE_TYPES.AXE,
                count: 13213,
                color: ["#61D18E", "#61D18E80", "#61D18E33"],
            },
            {
                // 锄头
                icon: PIXEL_RESOURCE_TYPES.HOE,
                count: 1454,
                color: ["#62A6F2", "#62A6F280", "#62A6F233"],
            },
            {
                // 砖头
                icon: PIXEL_RESOURCE_TYPES.BRICK,
                count: 315,
                color: ["#8743E2", "#8743E280", "#8743E233"],
            },
            {
                // 种子
                icon: PIXEL_RESOURCE_TYPES.SEED,
                count: 145,
                color: ["#CACC1A", "#CACC1A80", "#CACC1A33"],
            },
        ]
    // 处理合成工具点击事件
    const handleSynthesisToolClick = () => {
        setDrawerOpen(true);
    }

    // 处理开始挖矿点击事件
    const handleStartMiningClick = () => {
        setDrawerOpen(true);
    }

    // 页面固定头部元素
    const headerNode = (
        <AnimatePresence>
            <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                className={"fixed top-0 left-0 w-full bg-[#1A1A1A] p-[15px]"}
            >
                {/* 用户头像 */}
                <div className="w-[36px] h-[36px] rounded-full bg-[#F7921B] float-right"></div>
            </motion.aside>
        </AnimatePresence>
    )
    // 页面固定底部元素
    const footerNode = (
        <AnimatePresence>
            <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                className={"fixed bottom-[var(--bottom-menu-height,58px)] left-0 w-full bg-[#1E1E1E] p-[15px] flex gap-[15px]"}
            >
                <PixelButton
                    variant="primary"
                    className="w-1/2 rounded-[44px] text-white"
                    onClick={handleSynthesisToolClick}
                >
                    合成工具
                </PixelButton>
                <PixelButton
                    variant="primary"
                    className="w-1/2 rounded-[44px] text-white"
                    onClick={handleStartMiningClick}
                >
                    开始挖矿
                </PixelButton>
            </motion.aside>
        </AnimatePresence>
    )
    return (
        <div className="flex flex-col items-center justify-center h-[100%-calc(var(--bottom-menu-height,58px))] pt-[66px]">

            {/* 顶部标题 */}
            {headerNode}

            {/* 中间内容 */}
            <div className="w-full px-[15px]">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between pt-[25px] pb-[20px]"
                >
                    <div className="text-[#CCCCCC] text-[18px]">
                        我的工具
                    </div>
                    <Link href="">我的工具&gt;</Link>
                </motion.div>
                {/* 工具卡片视图 */}
                <div className="flex flex-wrap gap-[8px]">
                    {
                        toolsEnum.map((item, index) => {
                            return <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(index * 0.05, 0.3) }}
                                whileHover={{ y: -2 }}
                                className="w-[20%] flex flex-col items-center justify-center rounded-[6px] bg-[#1A1A1A] px-[8px] py-[18px] gap-[20px]"
                            >
                                {/* 工具图标 */}
                                {getPixelResourceIcon(item.icon, {
                                    iconSize: 34,
                                    haveBackgroundWarper: true,
                                    glowColors: item.color,
                                })}
                                {/* 工具数量 */}
                                <div className="text-[15px] font-bold" style={{
                                    color: item.color[0],
                                }}>
                                    {item.count}
                                </div>
                            </motion.div>
                        })
                    }
                </div>
            </div>

            {/* 底部固定操作 */}
            {footerNode}

            {/* 抽屉组件 */}
            <PixelBottomDrawer isVisible={drawerOpen} onClose={() => setDrawerOpen(false)} >
                123
            </PixelBottomDrawer>
        </div>
    );
}

export default miningCenter;