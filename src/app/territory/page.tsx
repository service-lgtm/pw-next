/*
 * @Author: yy
 * @Date: 2025-09-19 21:04:11
 * @LastEditTime: 2025-09-24 22:37:08
 * @LastEditors: yy
 * @Description: 
 */
"use client"
import PixelBottomDrawer from "@/components/shared/PixelBottomDrawer";
import { PixelButton } from "@/components/shared/PixelButton";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion'
import ToolsViewWapper from "./ToolsListView/ToolsViewWapper";
import MinesViewWapper from "./MinesListView/MinesViewWapper";
import { FixedHeader, UserAvatarButton } from "@/components/BottomMenuBar/BottomMenuBarLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getPixelResourceIcon, PIXEL_RESOURCE_NAMES, PIXEL_RESOURCE_TYPES } from "@/utils/pixelResourceTool";
import { cn } from "@/lib/utils";
import { useInventory } from "@/hooks/useInventory";
import { useMyYLDMines } from "@/hooks/useYLDMines";
import { useAuth } from "@/hooks/useAuth";

/** 合成工具列表枚举 */
const getSynthesisToolsEnum: () => {
    icon: PIXEL_RESOURCE_TYPES;
    description: string;
    materials: PIXEL_RESOURCE_TYPES[]
}[] = () => {
    return [
        {
            // 镐头
            icon: PIXEL_RESOURCE_TYPES.PICKAXE,
            // 描述
            description: "用于开采铁矿和石矿",
            // 所需材料
            materials: [PIXEL_RESOURCE_TYPES.IRON_ORE, PIXEL_RESOURCE_TYPES.WOOD, PIXEL_RESOURCE_TYPES.METEORITE],
        },
        {
            // 斧头
            icon: PIXEL_RESOURCE_TYPES.AXE,
            // 描述
            description: "用于采集木材",
            // 所需材料
            materials: [PIXEL_RESOURCE_TYPES.IRON_ORE, PIXEL_RESOURCE_TYPES.WOOD, PIXEL_RESOURCE_TYPES.METEORITE],
        },
        {
            // 锄头
            icon: PIXEL_RESOURCE_TYPES.HOE,
            // 描述
            description: "用于农业生产",
            // 所需材料
            materials: [PIXEL_RESOURCE_TYPES.IRON_ORE, PIXEL_RESOURCE_TYPES.WOOD, PIXEL_RESOURCE_TYPES.METEORITE],
        },
        {
            // 砖头
            icon: PIXEL_RESOURCE_TYPES.BRICK,
            // 描述
            description: "用于建筑",
            // 所需材料
            materials: [PIXEL_RESOURCE_TYPES.IRON_ORE, PIXEL_RESOURCE_TYPES.WOOD, PIXEL_RESOURCE_TYPES.METEORITE],
        },
    ]
}
/** 快速挖矿枚举 */
const getQuickMiningEnum: () => {
    icon: PIXEL_RESOURCE_TYPES;
    toolType: PIXEL_RESOURCE_TYPES;
}[] = () => {
    return [
        {
            // 铁矿
            icon: PIXEL_RESOURCE_TYPES.IRON_ORE,
            // 投入工具种类
            toolType: PIXEL_RESOURCE_TYPES.PICKAXE,
        },
        {
            // 森林
            icon: PIXEL_RESOURCE_TYPES.FOREST,
            // 投入工具种类
            toolType: PIXEL_RESOURCE_TYPES.AXE,
        },
        {
            // 农田
            icon: PIXEL_RESOURCE_TYPES.FARMLAND,
            // 投入工具种类
            toolType: PIXEL_RESOURCE_TYPES.HOE,
        },
        {
            // 石矿
            icon: PIXEL_RESOURCE_TYPES.STONE,
            // 投入工具种类
            toolType: PIXEL_RESOURCE_TYPES.PICKAXE,
        },
        {
            // 陨石
            icon: PIXEL_RESOURCE_TYPES.METEORITE,
            // 投入工具种类
            toolType: PIXEL_RESOURCE_TYPES.PICKAXE,
        },
    ]
}

/** 领地页 */
const miningCenter = () => {


    const { inventory, refetch: refetchInventory } = useInventory({ category: 'all' })

    // 合成工具抽屉显示状态
    const [synthesisDrawerOpen, setSynthesisDrawerOpen] = useState(false);
    // 挖矿抽屉显示状态
    const [miningDrawerOpen, setMiningDrawerOpen] = useState(false);
    // 当前选中项工具列表索引
    const [currentToolsIndex, setCurrentToolsIndex] = useState(0);
    // 当前选中项快速挖矿列表索引
    const [currentQuickMiningIndex, setCurrentQuickMiningIndex] = useState<number>();

    // 合成工具数量
    const [synthesisToolCount, setSynthesisToolCount] = useState(0);

    // 合成工具列表
    const synthesisTools = getSynthesisToolsEnum().map(record => ({
        ...record,
    }));
    // 快速挖矿列表
    const quickMining = getQuickMiningEnum().map((record, index) => ({
        ...record,
        count: index * 10,
        // 已投入工具数量
        toolCount: 100,
        // 可用工具数量
        availableToolCount: 100,
        // 所需粮食
        requiredFood: "100/小时",
        // 剩余粮食
        remainingFood: 1000,
    }))
    // 处理合成工具点击事件
    const handleSynthesisToolClick = () => {
        setSynthesisDrawerOpen(true);
    }

    // 处理开始挖矿点击事件
    const handleStartMiningClick = () => {
        setMiningDrawerOpen(true);
    }

    // 处理合成工具数量改变事件
    const handleSynthesisToolCountChange = (value: string) => {
        // 匹配数字
        const reg = /^\d+$/;
        if (!reg.test(value)) {
            return;
        }
        // 转换为数字
        const count = parseInt(value);
        // 判断是否大于0
        if (count < 0) {
            return;
        }
        setSynthesisToolCount(count);
    }

    useEffect(() => {
        // 一小时后刷新一次
        const timer = setTimeout(() => {
            refetchInventory();
        }, 1000 * 60 * 60);
        return () => {
            clearTimeout(timer);
        }
    }, []);

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
            value: Math.floor(totalFood / (totalToolCount * 2))
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

    // 当前选中项工具列表
    const currentTools = synthesisTools[currentToolsIndex];
    // 当前选中项快速挖矿列表
    const currentQuickMining = currentQuickMiningIndex !== void 0 ? quickMining[currentQuickMiningIndex] : void 0;
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
                <PixelBottomDrawer
                    title="合成工具"
                    isVisible={synthesisDrawerOpen}
                    onClose={() => setSynthesisDrawerOpen(false)}
                >
                    <div className="w-full pb-[60px]">
                        {/* 待合成工具卡片视图 */}
                        <div className="w-full mt-[20px] mb-[10px] flex gap-[8px]">
                            {
                                synthesisTools.map((item, index) => {
                                    return <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: Math.min(index * 0.1, 0.8) }}
                                        whileHover={{ y: -2 }}
                                        className={cn("w-[25%] flex flex-col items-center justify-center rounded-[6px] bg-[#31261A] px-[8px] py-[8px] gap-[10px] border-[2px] transition duration-300",
                                            currentToolsIndex === index ? "border-[#F07C1F]" : "border-transparent"
                                        )}
                                        onClick={() => setCurrentToolsIndex(index)}
                                    >
                                        {/* 工具图标 */}
                                        {getPixelResourceIcon(item.icon, {
                                            iconSize: 34,
                                            haveBackgroundWarper: true,
                                        })}
                                        {/* 工具名称 */}
                                        <div className="text-[12px] font-[#E7E7E7]">
                                            {PIXEL_RESOURCE_NAMES[item.icon] ?? ""}
                                        </div>
                                    </motion.div>
                                })
                            }
                        </div>
                        {/* 对应工具描述 */}
                        <div className="w-full py-[10px] text-[12px] text-[#E7E7E7]">
                            {PIXEL_RESOURCE_NAMES[currentTools.icon] ?? ''}：{currentTools?.description ?? ""}
                        </div>
                        {/* 合成所需材料 */}
                        <div className="text-[#E7E7E7] text-[15px] mb-[10px]">
                            合成材料
                        </div>
                        {/* 所需材料列表 */}
                        <div className="flex flex-col gap-[8px]">
                            {
                                currentTools.materials?.map((item, index) => {
                                    return <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: Math.min(index * 0.1, 0.8) }}
                                        whileHover={{ y: -2 }}
                                        className="bg-[#353535] px-[15px] py-[12px] rounded-[5px] flex items-center justify-between gap-[10px]"
                                    >
                                        <div className="flex items-center gap-[10px]">
                                            {/* 工具图标 */}
                                            {getPixelResourceIcon(item, {
                                                iconSize: 34,
                                                haveBackgroundWarper: true,
                                            })}
                                            {/* 工具名称 */}
                                            <div className="text-[#999999] text-[14px]">
                                                {PIXEL_RESOURCE_NAMES[item] ?? ""}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-[10px]">
                                            <div className="text-[#E7E7E7] text-[14px]">
                                                10000
                                            </div>
                                            <div className="text-[#F07C1F] text-[14px] flex items-center">
                                                可用余额：<span className="text-[12px]">10000</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                })
                            }
                        </div>
                        <div className="flex items-center justify-between border-t-[2px] border-[#666666] w-full mt-[20px] py-[22px]">
                            <div className="text-[#E7E7E7] text-[15px]">
                                合成数量
                            </div>
                            <div className="h-[40px] bg-[#353535] rounded-full p-[6px] px-[30px] relative">
                                <div className="w-[20px] h-[20px] bg-[#D29348] rounded-full absolute left-[6px] top-1/2 translate-y-[-50%] flex items-center justify-center" onClick={() => handleSynthesisToolCountChange(`${synthesisToolCount - 1}`)}>-</div>
                                <div className="w-[20px] h-[20px] bg-[#D29348] rounded-full absolute right-[6px] top-1/2 translate-y-[-50%] flex items-center justify-center" onClick={() => handleSynthesisToolCountChange(`${synthesisToolCount + 1}`)}>+</div>
                                <input className="w-[80px] text-center bg-[#353535] text-[#E7E7E7] text-[18px]" type="text" inputMode="numeric" value={synthesisToolCount} onChange={e => handleSynthesisToolCountChange(e.target.value)} />
                            </div>
                            <PixelButton
                                variant="secondary"
                                className="w-[80px] h-[30px] p-0 rounded-full text-[#F7921B] text-[12px]"
                            >
                                最大
                            </PixelButton>
                        </div>
                    </div>

                    <PixelButton
                        variant="primary"
                        className="w-[calc(100%-32px)] h-[44px] rounded-full text-[#fff] text-[15px] fixed left-[16px] bottom-[16px]"
                    >
                        立即合成
                    </PixelButton>
                </PixelBottomDrawer>
                {/* 开始挖矿弹窗 */}
                <PixelBottomDrawer
                    title="快速挖矿"
                    isVisible={miningDrawerOpen}
                    onClose={() => setMiningDrawerOpen(false)}
                >
                    <div className="w-full pb-[60px]">
                        {/* 快速挖矿卡片视图 */}
                        <div className="w-full mt-[20px] mb-[10px] flex flex-wrap gap-[8px]">
                            {
                                quickMining.map((item, index) => {
                                    return <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: Math.min(index * 0.1, 0.8) }}
                                        whileHover={{ y: -2 }}
                                        className={cn("w-[30%] flex flex-col items-center justify-center rounded-[6px] px-[8px] py-[8px] gap-[10px] border-[2px] transition duration-300",
                                            !!item.count ? "bg-[#31261A]" : "bg-[#353535]",
                                            currentQuickMiningIndex === index ? "border-[#F07C1F]" : "border-transparent"
                                        )}
                                        onClick={() => {
                                            if (!!item.count) setCurrentQuickMiningIndex(index)
                                        }}
                                    >
                                        <div className="flex items-center gap-[8px]">
                                            {/* 工具图标 */}
                                            {getPixelResourceIcon(item.icon, {
                                                iconSize: 34,
                                                haveBackgroundWarper: true,
                                            })}
                                            {/* 工具名称 */}
                                            <div className="text-[12px] font-[#E7E7E7]">
                                                {PIXEL_RESOURCE_NAMES[item.icon] ?? ""}
                                            </div>
                                        </div>
                                        <div className="text-[#999999] text-[12px]">
                                            可用：<span className="text-[#E7E7E7]">{item.count ?? 0}</span>
                                        </div>
                                    </motion.div>
                                })
                            }
                        </div>
                        {/* 对应信息 */}
                        {currentQuickMining && <div className="flex flex-col gap-[8px]">
                            <div className="bg-[#292929] rounded-[5px] px-[15px] py-[10px] flex items-center justify-between">
                                <div className="text-[#999999] text-[12px]">
                                    已投入工具
                                </div>
                                <div className="text-[#CCCCCC] text-[14px]">
                                    {PIXEL_RESOURCE_NAMES[currentQuickMining.toolType] ?? ""}：{currentQuickMining.toolCount}
                                </div>
                            </div>
                            <div className="bg-[#292929] rounded-[5px] px-[15px] py-[10px] flex items-center justify-between">
                                <div className="text-[#999999] text-[12px]">
                                    可用工具
                                </div>
                                <div className="text-[#CCCCCC] text-[14px]">
                                    {PIXEL_RESOURCE_NAMES[currentQuickMining.toolType] ?? ""}：{currentQuickMining.availableToolCount}
                                </div>
                            </div>
                            <div className="bg-[#292929] rounded-[5px] px-[15px] py-[10px] flex items-center justify-between">
                                <div className="text-[#999999] text-[12px]">
                                    所需粮食
                                </div>
                                <div className="text-[#CCCCCC] text-[14px]">
                                    {currentQuickMining.requiredFood}
                                </div>
                            </div>
                            <div className="bg-[#292929] rounded-[5px] px-[15px] py-[10px] flex items-center justify-between">
                                <div className="text-[#999999] text-[12px]">
                                    粮食余额
                                </div>
                                <div className="text-[#CCCCCC] text-[14px]">
                                    {currentQuickMining.remainingFood}
                                </div>
                            </div>
                        </div>}
                    </div>
                    <PixelButton
                        variant="primary"
                        className="w-[calc(100%-32px)] h-[44px] rounded-full text-[#fff] text-[15px] fixed left-[16px] bottom-[16px]"
                    >
                        开始挖矿
                    </PixelButton>
                </PixelBottomDrawer>
            </div>
        </ErrorBoundary>
    );
}

export default miningCenter;