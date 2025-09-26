import { ErrorBoundary } from "@/components/ErrorBoundary";
import PixelBottomDrawer from "@/components/shared/PixelBottomDrawer";
import { PixelButton } from "@/components/shared/PixelButton";
import { PixelTipsModal } from "@/components/shared/PixelTipsModal";
import { useSynthesisSystem } from "@/hooks/useSynthesis";
import { cn } from "@/lib/utils";
import { getPixelResourceIcon, PIXEL_RESOURCE_NAMES, PIXEL_RESOURCE_SERVICE_KEYS, PIXEL_RESOURCE_TYPES, ResourceKey } from "@/utils/pixelResourceTool";
import { motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import Image from 'next/image';
import bg1Img from "@/public/bg1.png";
import bg2Img from "@/public/bg2.png";

/** 合成工具列表枚举 */
const getSynthesisToolsEnum: () => {
    icon: PIXEL_RESOURCE_TYPES;
    key: PIXEL_RESOURCE_SERVICE_KEYS.PICKAXE | PIXEL_RESOURCE_SERVICE_KEYS.AXE | PIXEL_RESOURCE_SERVICE_KEYS.HOE;
}[] = () => {
    return [
        {
            // 镐头
            icon: PIXEL_RESOURCE_TYPES.PICKAXE,
            key: PIXEL_RESOURCE_SERVICE_KEYS.PICKAXE,
        },
        {
            // 斧头
            icon: PIXEL_RESOURCE_TYPES.AXE,
            key: PIXEL_RESOURCE_SERVICE_KEYS.AXE,
        },
        {
            // 锄头
            icon: PIXEL_RESOURCE_TYPES.HOE,
            key: PIXEL_RESOURCE_SERVICE_KEYS.HOE,
        },
        // {
        //     // 砖头
        //     icon: PIXEL_RESOURCE_TYPES.BRICK,
        //     // 所需材料
        //     materials: [PIXEL_RESOURCE_TYPES.IRON_ORE, PIXEL_RESOURCE_TYPES.WOOD, PIXEL_RESOURCE_TYPES.METEORITE],
        //     key: PIXEL_RESOURCE_SERVICE_KEYS.BRICK,
        // },
    ]
}

// 合成类型资源key映射
const synthesisTypeResourceKeyMap: Record<string, PIXEL_RESOURCE_TYPES> = {
    [PIXEL_RESOURCE_SERVICE_KEYS.IRON]: PIXEL_RESOURCE_TYPES.IRON_ORE,
    [PIXEL_RESOURCE_SERVICE_KEYS.WOOD]: PIXEL_RESOURCE_TYPES.WOOD,
    [PIXEL_RESOURCE_SERVICE_KEYS.STONE]: PIXEL_RESOURCE_TYPES.STONE,
    [PIXEL_RESOURCE_SERVICE_KEYS.YLD]: PIXEL_RESOURCE_TYPES.METEORITE,
}

interface synthesisDrawerProps {
    synthesisDrawerOpen: boolean;
    setSynthesisDrawerOpen: (open: boolean) => void;
}

/** 合成工具抽屉 */
const synthesisDrawer = (props: synthesisDrawerProps) => {
    const { synthesisDrawerOpen, setSynthesisDrawerOpen } = props;

    // 使用合成系统 Hook
    const {
        recipes,
        userResources,
        loading,
        synthesizing,
        error,
        synthesizeTool,
        synthesizeBricks,
        calculateMaxSynthesizable,
        refetch
    } = useSynthesisSystem({
        enabled: true, // 直接启用，不需要权限检查
        autoRefresh: false
    })

    // 合成成功提示显示状态
    const [showSynthesisSuccessModal, setShowSynthesisSuccessModal] = useState(false);
    // 记录合成功信息
    const synthesisSuccessInfoRef = useRef<{
        // 合成工具
        tool: PIXEL_RESOURCE_TYPES;
        // 合成数量
        count: number;
    }>();
    // 当前选中项工具列表索引
    const [currentToolsIndex, setCurrentToolsIndex] = useState(0);
    // 合成工具数量
    const [synthesisToolCount, setSynthesisToolCount] = useState(1);

    // 合成工具列表
    const synthesisTools = getSynthesisToolsEnum().map(record => ({
        ...record,
    }));
    // 当前选中项工具列表
    const currentTools = synthesisTools[currentToolsIndex];

    // 当前项工具数据信息
    const currentTool = recipes?.[currentTools?.key as keyof typeof recipes] ?? null;

    // 当前选中工具的消耗
    const toolConsumption = useMemo(() => {
        if (!currentTool) return [];
        // 合成信息
        const synthesisInfo = currentTool?.materials ?? {};
        // 生成对应渲染数据
        return [
            ...Object.entries(synthesisInfo).map(([key, value]) => {
                // 获取资源类型
                const resourceType = synthesisTypeResourceKeyMap[key as ResourceKey];
                // 获取当前资源数量
                const currentResourceCount = userResources?.[key as keyof typeof userResources] ?? 0;
                return {
                    // 图标
                    icon: resourceType,
                    // 消耗量
                    count: ((value ?? 0) * synthesisToolCount).toFixed(2),
                    // 可用量
                    available: currentResourceCount.toFixed(2),
                }
            }),
            {
                // 图标
                icon: PIXEL_RESOURCE_TYPES.METEORITE,
                // 消耗量
                count: ((currentTool?.yld_cost ?? 0) * synthesisToolCount).toFixed(4),
                // 可用量
                available: (userResources?.[PIXEL_RESOURCE_SERVICE_KEYS.YLD] ?? 0).toFixed(4),
            }
        ]
    }, [currentTool, synthesisToolCount, recipes])

    // 当前最大可合成数量
    const maxSynthesizable = useMemo(() => {
        return calculateMaxSynthesizable(currentTools?.key)
    }, [calculateMaxSynthesizable, currentTools?.key])

    // 合成按钮是否禁用
    const synthesisButtonDisabled = useMemo(() => {
        // 判断是否足够合成
        return synthesisToolCount <= 0 || synthesisToolCount >= maxSynthesizable || toolConsumption.some(item => +item.count > +item.available)
    }, [synthesisToolCount, maxSynthesizable, toolConsumption]);


    // 处理合成工具数量改变事件
    const handleSynthesisToolCountChange = (value: string) => {
        // 匹配数字
        const reg = /^\d+$/;
        if (!reg.test(value)) {
            setSynthesisToolCount(1);
            return;
        }
        // 转换为数字
        const count = parseInt(value);
        // 判断是否大于0
        if (count <= 0) {
            setSynthesisToolCount(1);
            return;
        }
        setSynthesisToolCount(count);
    }

    // 处理工具合成
    const handleSynthesizeTool = async () => {
        if (synthesisToolCount <= 0) {
            toast.error('请输入有效的合成数量')
            return
        }

        if (synthesisToolCount > maxSynthesizable) {
            toast.error(`资源不足，最多可合成 ${synthesisToolCount} 个`)
            return
        }

        try {
            const result = await synthesizeTool({
                tool_type: currentTools?.key,
                quantity: synthesisToolCount
            })

            if (result) {
                setSynthesisToolCount(1) // 重置数量
                refetch() // 刷新配方和资源数据
                // 记录合成成功信息
                synthesisSuccessInfoRef.current = {
                    tool: currentTools?.icon,
                    count: synthesisToolCount
                }

                // 关闭合成工具抽屉
                setSynthesisDrawerOpen(false)
                // 显示合成成功提示框
                setShowSynthesisSuccessModal(true);

                console.log('[SynthesisSystem] 合成成功:', result)
            }
        } catch (error) {
            console.error('[SynthesisSystem] 合成失败:', error)
        }
    }

    return <ErrorBoundary>
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
                                className={cn("w-[30%] flex flex-col items-center justify-center rounded-[6px] bg-[#31261A] px-[8px] py-[8px] gap-[10px] border-[2px] transition duration-300",
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
                    {PIXEL_RESOURCE_NAMES[currentTools.icon] ?? ''}：{currentTool?.usage ?? currentTool?.description ?? ""}
                </div>
                {/* 合成所需材料 */}
                <div className="text-[#E7E7E7] text-[15px] mb-[10px]">
                    合成材料
                </div>
                {/* 所需材料列表 */}
                <div className="flex flex-col gap-[8px]">
                    {
                        toolConsumption?.map((item, index) => {
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
                                    {getPixelResourceIcon(item.icon, {
                                        iconSize: 34,
                                        haveBackgroundWarper: true,
                                    })}
                                    {/* 工具名称 */}
                                    <div className="text-[#999999] text-[14px]">
                                        {PIXEL_RESOURCE_NAMES[item.icon] ?? ""}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-[10px]">
                                    <div className="text-[#E7E7E7] text-[14px]">
                                        {item?.count}
                                    </div>
                                    <div className={cn(
                                        "text-[#F07C1F] text-[14px] flex items-center",
                                        item?.count > item?.available ? "text-[#FF0000]" : ""
                                    )}>
                                        可用余额：<span className="text-[12px]">{item?.available}</span>
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
                        <input
                            className="w-[80px] text-center bg-[#353535] text-[#E7E7E7] text-[18px]"
                            type="text"
                            inputMode="numeric"
                            value={synthesisToolCount}
                            onChange={e => handleSynthesisToolCountChange(e.target.value)}
                        />
                    </div>
                    <PixelButton
                        variant="secondary"
                        className="w-[80px] h-[30px] p-0 rounded-full text-[#F7921B] text-[12px]"
                        onClick={() => handleSynthesisToolCountChange(`${maxSynthesizable}`)}
                    >
                        最大
                    </PixelButton>
                </div>
            </div>

            <PixelButton
                variant="primary"
                className={cn(
                    "w-[calc(100%-32px)] h-[44px] rounded-full text-[#fff] text-[15px] fixed left-[16px] bottom-[16px]",
                    synthesisButtonDisabled ? 'bg-[#999999] cursor-not' : 'bg-[#F7921B] cursor-pointer'
                )}
                disabled={synthesisButtonDisabled}
                onClick={handleSynthesizeTool}
            >
                立即合成
            </PixelButton>
        </PixelBottomDrawer>
        {/* 合成成功提示 */}
        <PixelTipsModal
            isVisible={showSynthesisSuccessModal}
            onClose={() => setShowSynthesisSuccessModal(false)}
            className="overflow-visible"
        >
            <div className="relative w-[300px] h-[280px]">
                <div className="w-[240px] h-[200px] absolute top-0 left-1/2 -translate-y-1/2 -translate-x-1/2">
                    <Image
                        width={220}
                        height={220}
                        src={bg1Img}
                        alt={'title-bg'}
                        className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-[30px] font-[800] bg-clip-text text-transparent" style={{
                        backgroundImage: 'linear-gradient(to bottom, #FFF3D3, #FF9C00)'
                    }}>合成成功</div>
                </div>
                <div className="pt-[30px] text-[#E6D09A] text-[18px] text-center">
                    恭喜您合成<span className="text-[#F07C1F]">{synthesisSuccessInfoRef.current?.count}</span>把{synthesisSuccessInfoRef.current?.tool ? PIXEL_RESOURCE_NAMES[synthesisSuccessInfoRef.current?.tool] : "工具"}
                </div>
                {synthesisSuccessInfoRef.current?.tool && <div className="relative w-[140px] h-[140px] mx-auto">
                    <Image
                        width={140}
                        height={140}
                        src={bg2Img}
                        alt={'icon-bg'}
                        className="icon-spin absolute top-0 left-0"
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
                        {
                            getPixelResourceIcon(synthesisSuccessInfoRef.current?.tool, {
                                iconSize: 34,
                                haveBackgroundWarper: true,
                            })
                        }
                        <div className="absolute bottom-0 right-[-5px] translate-x-[100%] text-[#F07C1F] text-[13px]">X10</div>
                    </div>
                </div>}
                <PixelButton
                    variant="primary"
                    className={"relative block w-[240px] h-[44px] p-0 rounded-full text-white text-[15px] mx-auto"}
                    onClick={() => setShowSynthesisSuccessModal(false)}
                >
                    我知道啦
                </PixelButton>
            </div>
        </PixelTipsModal>
    </ErrorBoundary>
}

synthesisDrawer.displayName = 'synthesisDrawer';

export default synthesisDrawer