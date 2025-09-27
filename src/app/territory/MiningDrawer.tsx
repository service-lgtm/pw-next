import PixelBottomDrawer from "@/components/shared/PixelBottomDrawer";
import { PixelButton } from "@/components/shared/PixelButton";
import { useAuth } from "@/hooks/useAuth";
import { InventoryData } from "@/hooks/useInventory";
import { useMyLands } from "@/hooks/useLands";
import { useMiningSessions, useMiningSummary, useMyTools, useResourceStats, useStartSelfMining, useUserLands } from "@/hooks/useProduction";
import { cn } from "@/lib/utils";
import { eventManager } from "@/utils/eventManager";
import { getPixelResourceIcon, PIXEL_RESOURCE_NAMES, PIXEL_RESOURCE_SERVICE_KEYS, PIXEL_RESOURCE_TYPES } from "@/utils/pixelResourceTool";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { INVENTORY_PAGE_REFETCH_EVENT } from "./page";

/** 快速挖矿枚举 */
const getQuickMiningEnum: () => {
    icon: PIXEL_RESOURCE_TYPES;
    toolName: string,
    toolType: PIXEL_RESOURCE_SERVICE_KEYS.PICKAXE | PIXEL_RESOURCE_SERVICE_KEYS.AXE | PIXEL_RESOURCE_SERVICE_KEYS.HOE;
    key: string;
}[] = () => {
    return [
        {
            // 铁矿
            icon: PIXEL_RESOURCE_TYPES.IRON_ORE,
            toolName: PIXEL_RESOURCE_NAMES[PIXEL_RESOURCE_TYPES.PICKAXE],
            // 投入工具种类
            toolType: PIXEL_RESOURCE_SERVICE_KEYS.PICKAXE,
            key: "iron_mine"
        },
        {
            // 森林
            icon: PIXEL_RESOURCE_TYPES.FOREST,
            toolName: PIXEL_RESOURCE_NAMES[PIXEL_RESOURCE_TYPES.AXE],
            // 投入工具种类
            toolType: PIXEL_RESOURCE_SERVICE_KEYS.AXE,
            key: "forest"
        },
        {
            // 农田
            icon: PIXEL_RESOURCE_TYPES.FARMLAND,
            toolName: PIXEL_RESOURCE_NAMES[PIXEL_RESOURCE_TYPES.HOE],
            // 投入工具种类
            toolType: PIXEL_RESOURCE_SERVICE_KEYS.HOE,
            key: "farm"
        },
        {
            // 石矿
            icon: PIXEL_RESOURCE_TYPES.STONE,
            toolName: PIXEL_RESOURCE_NAMES[PIXEL_RESOURCE_TYPES.PICKAXE],
            // 投入工具种类
            toolType: PIXEL_RESOURCE_SERVICE_KEYS.PICKAXE,
            key: "stone_mine"
        },
        {
            // 陨石
            icon: PIXEL_RESOURCE_TYPES.METEORITE,
            toolName: PIXEL_RESOURCE_NAMES[PIXEL_RESOURCE_TYPES.PICKAXE],
            // 投入工具种类
            toolType: PIXEL_RESOURCE_SERVICE_KEYS.PICKAXE,
            key: "yld_mine"
        },
    ]
}

interface miningDrawerProps {
    inventory: InventoryData | null
    miningDrawerOpen: boolean;
    setMiningDrawerOpen: (open: boolean) => void;
}

/** 开始挖矿抽屉 */
const miningDrawer = (props: miningDrawerProps) => {
    const { inventory, miningDrawerOpen, setMiningDrawerOpen } = props;

    // 认证状态
    const { isAuthenticated, user, isLoading: authLoading } = useAuth()
    // 数据获取
    const shouldFetchData = !authLoading && isAuthenticated
    const {
        startMining,
        loading: startMiningLoading
    } = useStartSelfMining()

    // const { lands, stats, loading, error, refetch } = useMyLands()
    const {
        lands: userLands,
        refetch: refetchUserLands,
    } = useUserLands({
        enabled: shouldFetchData
    })
    const {
        tools,
        loading: toolsLoading,
        stats: toolStats,
        refetch: refetchTools
    } = useMyTools({
        enabled: shouldFetchData,
    })
    // 筛选可用土地（新增）
    const availableLands = useMemo(() => {
        if (!userLands) return []
        return userLands.filter(land =>
            !land.is_producing &&
            land.blueprint?.land_type &&
            ['yld_mine', 'iron_mine', 'stone_mine', 'forest', 'farm'].includes(land.blueprint.land_type)
        )
    }, [userLands])

    // 快速挖矿列表
    const quickMining = getQuickMiningEnum().map((record, index) => {
        // 当前类型土地
        const current_lands = availableLands?.filter(land => land?.blueprint?.land_type === record.key)
        // 当前类型土地数量
        const count = current_lands.length ?? 0
        // 当前类型土地展示的工具统计信息
        const toolInfo = inventory?.tools?.[record?.toolType];
        // 剩余粮食
        const remainingFood = (inventory?.materials?.food?.amount ?? 0).toFixed(2);
        // 所需粮食
        // TODO: 确认是否可选投入工具数量
        const requiredFood = ((toolInfo?.idle ?? 0) * 2).toFixed(2);
        return {
            ...record,
            count: count,
            // 对应土地
            currentLands: current_lands,
            // 已投入工具数量
            toolCount: toolInfo?.working ?? 0,
            // 可用工具数量
            availableToolCount: toolInfo?.idle ?? 0,
            // 所需粮食
            requiredFood: requiredFood,
            // 剩余粮食
            remainingFood: remainingFood,
            // 是否可用工具不足
            isToolNotEnough: !!toolInfo?.idle && (toolInfo?.idle ?? 0) <= 0,
            // 是否粮食不足
            isFoodNotEnough: !remainingFood || !toolInfo?.idle || +remainingFood <= +requiredFood
        }
    })
    // 当前选中项快速挖矿列表索引
    const [currentQuickMiningIndex, setCurrentQuickMiningIndex] = useState<number>();
    // 当前选中项快速挖矿列表
    const currentQuickMining = currentQuickMiningIndex !== void 0 ? quickMining[currentQuickMiningIndex] : void 0;

    // 筛选可用工具（只选择对应类型的工具）
    const getavailableToolsByType = () => {
        if (!tools) return []

        return tools.filter(tool =>
            tool.tool_type === currentQuickMining?.toolType &&  // 只选择对应类型的工具
            tool.status === 'normal' &&
            !tool.is_in_use &&
            tool.current_durability > 0
        ).sort((a, b) => (b.current_durability || 0) - (a.current_durability || 0))
    }

    // 处理开始挖矿
    const handleStartMining = async () => {
        // 按钮禁用
        if (isStartMiningButtonDisabled) return;
        // 没有选中项
        if (!currentQuickMining) return

        const availableTools = getavailableToolsByType()
        // TODO：确定ID、 数量自定义
        const toolIds = availableTools.slice(0, 1)
            .map(tool => tool.id)

        // 如果没有可用工具，则不执行挖矿操作
        if (toolIds.length === 0) return

        // 开始挖矿
        await startMining({
            land_id: currentQuickMining?.currentLands?.[0]?.id,
            tool_ids: toolIds
        });
        // 关闭抽屉
        setMiningDrawerOpen(false);

        // 刷新工具数据
        refetchTools();
        // 刷新土地数据
        refetchUserLands();
        // 通知主页面刷新事件
        eventManager.emit(INVENTORY_PAGE_REFETCH_EVENT.inventory)
    }

    // 开始挖矿按钮是否禁用
    const isStartMiningButtonDisabled = !currentQuickMining || !!currentQuickMining?.isToolNotEnough || !!currentQuickMining?.isFoodNotEnough;
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
                        {currentQuickMining.toolName ?? ""}：{currentQuickMining.toolCount}
                    </div>
                </div>
                <div className="bg-[#292929] rounded-[5px] px-[15px] py-[10px] flex items-center justify-between">
                    <div className="text-[#999999] text-[12px]">
                        可用工具
                    </div>
                    <div className={cn(
                        "text-[#CCCCCC] text-[14px]",
                        currentQuickMining.isToolNotEnough ? "text-[#FF0000]" : "text-[#CCCCCC]"
                    )}>
                        {currentQuickMining.toolName ?? ""}：{currentQuickMining.availableToolCount}
                    </div>
                </div>
                <div className="bg-[#292929] rounded-[5px] px-[15px] py-[10px] flex items-center justify-between">
                    <div className="text-[#999999] text-[12px]">
                        所需粮食
                    </div>
                    <div className="text-[#CCCCCC] text-[14px]">
                        {currentQuickMining.requiredFood}/小时
                    </div>
                </div>
                <div className="bg-[#292929] rounded-[5px] px-[15px] py-[10px] flex items-center justify-between">
                    <div className="text-[#999999] text-[12px]">
                        粮食余额
                    </div>
                    <div className={cn(
                        "text-[#CCCCCC] text-[14px]",
                        currentQuickMining.isFoodNotEnough ? "text-[#FF0000]" : "text-[#CCCCCC]"
                    )}>
                        {currentQuickMining.remainingFood}
                    </div>
                </div>
            </div>}
        </div>
        <PixelButton
            variant="primary"
            className={cn(
                "w-[calc(100%-32px)] h-[44px] rounded-full text-[#fff] text-[15px] fixed left-[16px] bottom-[16px]",
                isStartMiningButtonDisabled ? 'bg-[#999999] cursor-not' : 'bg-[#F7921B] cursor-pointer'
            )}
            disabled={isStartMiningButtonDisabled}
            onClick={() => {
                handleStartMining()
            }}
        >
            开始挖矿
        </PixelButton>
    </PixelBottomDrawer>
}

miningDrawer.displayName = "miningDrawer";

export default miningDrawer;