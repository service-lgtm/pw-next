/*
 * @Author: yy
 * @Date: 2025-09-19 21:04:11
 * @LastEditTime: 2025-09-27 11:45:23
 * @LastEditors: yy
 * @Description: 
 */
"use client"
import { PixelButton } from "@/components/shared/PixelButton";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion'
import ToolsViewWapper from "./ToolsListView/ToolsViewWapper";
import MinesViewWapper from "./MinesListView/MinesViewWapper";
import { FixedHeader, UserAvatarButton } from "@/components/BottomMenuBar/BottomMenuBarLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useInventory } from "@/hooks/useInventory";
import SynthesisDrawer from "./SynthesisDrawer";
import MiningDrawer from "./MiningDrawer";
import { eventManager } from "@/utils/eventManager";

export const INVENTORY_PAGE_REFETCH_EVENT = {
    inventory: 'inventory'
}
/** 领地页 */
const miningCenter = () => {
    const { inventory, refetch: refetchInventory } = useInventory({ category: 'all' })

    // 合成工具抽屉显示状态
    const [synthesisDrawerOpen, setSynthesisDrawerOpen] = useState(false);
    // 挖矿抽屉显示状态
    const [miningDrawerOpen, setMiningDrawerOpen] = useState(false);

    // 处理合成工具点击事件
    const handleSynthesisToolClick = () => {
        setSynthesisDrawerOpen(true);
    }

    // 处理开始挖矿点击事件
    const handleStartMiningClick = () => {
        setMiningDrawerOpen(true);
    }


    useEffect(() => {
        // 监听刷新数据事件
        eventManager.on(INVENTORY_PAGE_REFETCH_EVENT.inventory, refetchInventory);
        return () => {
            eventManager.off(INVENTORY_PAGE_REFETCH_EVENT.inventory, refetchInventory);
        }
    }, [refetchInventory]);

    // 粮食总数
    const totalFood = inventory?.materials?.food?._resourceAmount ?? 0;
    // 已投入工具数量
    const totalToolCount = inventory?.stats?.tools?.in_use ?? 0;

    // 剩余统计展示列表参数
    const statisticsList = [
        {
            title: "粮食剩余",
            value: totalFood
        },
        {
            title: "剩余时长",
            // 剩余时常=粮食总数/（已投用工具数量*2），结果向下取整
            value: totalFood && totalToolCount ? Math.floor(totalFood / (totalToolCount * 2)) : 0
        }
    ]

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
                <FixedHeader>
                    {/* 用户头像 */}
                    <UserAvatarButton wapperClassName="float-right" />
                </FixedHeader>

                {/* 中间内容 */}
                <div className="relative w-full px-[15px]">
                    {/* 工具列表视图 */}
                    <ToolsViewWapper inventory={inventory} />
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
                    {/* 矿场列表视图 */}
                    <MinesViewWapper inventory={inventory} />
                </div>

                {/* 底部固定操作 */}
                {footerNode}

                {/* 合成工具抽屉 */}
                {synthesisDrawerOpen && <SynthesisDrawer
                    synthesisDrawerOpen={synthesisDrawerOpen}
                    setSynthesisDrawerOpen={setSynthesisDrawerOpen}
                />}

                {/* 开始挖矿弹窗 */}
                {miningDrawerOpen && <MiningDrawer
                    inventory={inventory}
                    miningDrawerOpen={miningDrawerOpen}
                    setMiningDrawerOpen={setMiningDrawerOpen}
                />}
            </div>
        </ErrorBoundary>
    );
}

export default miningCenter;