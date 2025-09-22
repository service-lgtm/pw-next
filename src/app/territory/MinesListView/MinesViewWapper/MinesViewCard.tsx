import { PixelButton } from "@/components/shared/PixelButton";
import { cn } from "@/lib/utils";
import { getPixelResourceIcon, PIXEL_RESOURCE_TYPES } from "@/utils/pixelResourceTool";
import { motion } from "framer-motion";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/** 矿场类型 */
type MinesType = PIXEL_RESOURCE_TYPES.WOOD | PIXEL_RESOURCE_TYPES.IRON_ORE | PIXEL_RESOURCE_TYPES.FARMLAND | PIXEL_RESOURCE_TYPES.METEORITE | PIXEL_RESOURCE_TYPES.STONE;
/** 工具类型 */
type ToolType = PIXEL_RESOURCE_TYPES.AXE | PIXEL_RESOURCE_TYPES.PICKAXE | PIXEL_RESOURCE_TYPES.HOE;

/** 矿场数据类型 */
export interface IMinesInfoType {
    /** 矿场名称 */
    minesName: string;
    /** 矿场类型 */
    minesType: MinesType;
    /** 矿场数量 */
    minesCount: number;
    /** 矿场储量上限 */
    minesLimit: number;
    /** 矿场储量 */
    mineReserves: number;
    /** 可领取量 */
    reserveHarvesting: number;
    /** 可投入工具总数 */
    toolCount: number;
    /** 已投入工具数量 */
    toolCountUsed: number;
    /** 工具类型 */
    toolType: ToolType;
    /** 领取禁用状态 */
    // 矿场内土地不为0时，显示领取。
    // 当该矿场未有挖矿会话，或该矿场开始挖矿时长不足1小时时，领取按钮不可点击；
    // 当该矿场挖矿会话超过1小时后，切换为可点击状态，点击后将【可领取】数量添加至对应类型材料余额，同时【可领取】数量归零，并重新开始计算
    isHarvestingDisabled: boolean;
}

/** 矿场列表卡片参数类型 */
interface MinesCardProps {
    /** 数据源 */
    data: IMinesInfoType,
    key: number,
}

/** 矿场列表视图卡片 */
const MinesCard: React.FC<MinesCardProps> = (props) => {
    const { data, key } = props;

    // 处理购买土地事件
    const handleBuyLand = () => {
        console.log('购买土地');
    }
    // 处理领取事件
    const handleHarvest = (disabled: boolean) => {
        if (!disabled) {
            console.log('领取');
        }
    }

    // 是否显示购买土地按钮
    const isShowBuyLandBtn = !data || data?.minesCount <= 0;

    return <ErrorBoundary>
        <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(key * 0.05, 0.3) }}
            whileHover={{ y: -2 }}
            className="flex justify-between w-full p-[15px] bg-[#1A1A1A] rounded-[6px] gap-[10px]"
        >
            {/* 左侧矿场信息 */}
            <div className="flex flex-col">
                {/* 矿场名称 */}
                <div className="flex items-center gap-[10px]">
                    {
                        getPixelResourceIcon(data?.minesType, {
                            iconSize: 34,
                            haveBackgroundWarper: true,
                        })
                    }
                    <div className="text-[#E7E7E7] text-[16px]">
                        {data?.minesName}({data?.minesCount})
                    </div>
                </div>
                {/* 矿场储量 */}
                <div className="text-[#999999] text-[14px] mt-[10px] mb-[8px]">
                    储量：{data?.mineReserves}/{data?.minesLimit}
                </div>
                {/* 领取数量 */}
                <div className="text-[#999999] text-[14px]">
                    可领取：<span className="text-[#E7E7E7]">{data?.reserveHarvesting}</span>
                </div>
            </div>
            {/* 右侧工具信息 */}
            <div className="flex flex-col items-end justify-between">
                {/* 工具数量 */}
                <div className="flex items-center gap-[5px] text-[#999999] text-[12px]">
                    {
                        getPixelResourceIcon(data?.toolType, {
                            iconSize: 12,
                        })
                    }
                    {data?.toolCountUsed}/{data?.toolCount}
                </div>
                {/* 操作按钮 */}
                {
                    isShowBuyLandBtn
                        ? <PixelButton
                            variant="primary"
                            className="w-[80px] h-[32px] p-[6px] rounded-full text-white text-[12px]"
                            onClick={handleBuyLand}
                        >
                            购买土地
                        </PixelButton>
                        : <PixelButton
                            variant="secondary"
                            className={
                                cn(
                                    "w-[80px] h-[32px] p-[6px] rounded-full text-white text-[12px] border-[1px]",
                                    data?.isHarvestingDisabled ? "text-[#999999] border-[#31261A] bg-[#31261A] pointer-events-none" : ""
                                )
                            }
                            onClick={() => handleHarvest(data?.isHarvestingDisabled)}
                        >
                            领取
                        </PixelButton>
                }
            </div>
        </motion.div>
    </ErrorBoundary>
}

MinesCard.displayName = 'MinesCard';

export default MinesCard;