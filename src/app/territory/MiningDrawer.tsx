import PixelBottomDrawer from "@/components/shared/PixelBottomDrawer";
import { PixelButton } from "@/components/shared/PixelButton";
import { cn } from "@/lib/utils";
import { getPixelResourceIcon, PIXEL_RESOURCE_NAMES, PIXEL_RESOURCE_TYPES } from "@/utils/pixelResourceTool";
import { motion } from "framer-motion";
import { useState } from "react";

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

interface miningDrawerProps {
    miningDrawerOpen: boolean;
    setMiningDrawerOpen: (open: boolean) => void;
}

/** 开始挖矿抽屉 */
const miningDrawer = (props: miningDrawerProps) => {
    const { miningDrawerOpen, setMiningDrawerOpen } = props;

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
    // 当前选中项快速挖矿列表索引
    const [currentQuickMiningIndex, setCurrentQuickMiningIndex] = useState<number>();
    // 当前选中项快速挖矿列表
    const currentQuickMining = currentQuickMiningIndex !== void 0 ? quickMining[currentQuickMiningIndex] : void 0;
    return <PixelBottomDrawer
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
}

miningDrawer.displayName = "miningDrawer";

export default miningDrawer;