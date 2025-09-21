/*
 * @Author: yy
 * @Date: 2025-09-19 21:04:11
 * @LastEditTime: 2025-09-21 23:10:40
 * @LastEditors: yy
 * @Description: 
 */
"use client"
import PixelBottomDrawer from "@/components/shared/PixelBottomDrawer";
import { PixelButton } from "@/components/shared/PixelButton";
import { useState } from "react";
import { motion, AnimatePresence } from 'framer-motion'
import ToolsListView from "./ToolsListView";
import MinesListView from "./MinesListView";
import { UserAvatarButton } from "@/components/BottomMenuBar/BottomMenuBarLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";


/** 领地页 */
const miningCenter = () => {

    // 抽屉显示状态
    const [drawerOpen, setDrawerOpen] = useState(false);

    // 处理合成工具点击事件
    const handleSynthesisToolClick = () => {
        setDrawerOpen(true);
    }

    // 处理开始挖矿点击事件
    const handleStartMiningClick = () => {
        setDrawerOpen(true);
    }

    // 剩余统计展示列表参数
    const statisticsList = [
        {
            title: "粮食剩余",
            value: "412143"
        },
        {
            title: "剩余时长",
            value: "0"
        }
    ]

    // 页面固定头部元素
    const headerNode = (
        <AnimatePresence>
            <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                className={"fixed top-0 left-0 z-[1] w-full bg-[#1A1A1A] p-[15px]"}
            >
                {/* 用户头像 */}
                <UserAvatarButton wapperClassName="float-right" />
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
        <ErrorBoundary>
            <div className="flex flex-col items-center justify-center h-[100%-calc(var(--bottom-menu-height,58px))] pt-[66px] pb-[100px]">

                {/* 顶部标题 */}
                {headerNode}

                {/* 中间内容 */}
                <div className="relative z-[0] w-full px-[15px]">
                    {/* 工具列表 */}
                    <ToolsListView />
                    {/* 剩余统计 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap my-[20px] p-[20px] bg-gradient-to-b from-[#95A540] to-[#A69D11] rounded-[6px]"
                    >
                        {
                            statisticsList.map((item, index) => {
                                return <div className="relative w-1/2 flex flex-col items-center gap-[15px]" key={index}>
                                    <div className="text-[12px] text-[#333333]">
                                        {item.title}
                                    </div>
                                    <div className="text-[18px] text-[#333333] font-bold">
                                        {item.value}
                                    </div>
                                    {/* 分割线样式 */}
                                    {
                                        index !== statisticsList.length - 1 &&
                                        <div className="absolute right-0 top-0 w-[1px] h-[100%] bg-[#66666633]"></div>
                                    }
                                </div>
                            })
                        }

                    </motion.div>
                    {/* 矿场列表 */}
                    <MinesListView />
                </div>

                {/* 底部固定操作 */}
                {footerNode}

                {/* 抽屉组件 */}
                <PixelBottomDrawer isVisible={drawerOpen} onClose={() => setDrawerOpen(false)} >
                    123
                </PixelBottomDrawer>
            </div>
        </ErrorBoundary>
    );
}

export default miningCenter;