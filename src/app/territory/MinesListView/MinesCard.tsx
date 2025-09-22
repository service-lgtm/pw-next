
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PixelButton } from "@/components/shared/PixelButton";
import { cn } from "@/lib/utils";
import { getPixelResourceIcon, PIXEL_RESOURCE_TYPES } from "@/utils/pixelResourceTool";
import { motion } from "framer-motion";
import Image from 'next/image';

/** 土地卡片数据类型 */
export interface IMinesCard {
    /** 编号 */
    id: number;
    /** 土地类型 */
    icon: PIXEL_RESOURCE_TYPES;
    /** 土地名称 */
    name: string;
    /** 土地状态 0：'生产中'； 1： '闲置中' */
    status: 0 | 1;
    /** 地址信息 */
    address: string;
    /** 坐标 */
    coordinate: [number, number];
    /** 土地储量上限 */
    capacity: number;
    /** 当前储量 */
    current: number;
    /** 已投入工具数量 */
    tools: number;
    /** 已产出资源数量 */
    output: number;
}

/** 土地卡片类型 */
interface MinesCardProps {
    /** 数据源 */
    data: IMinesCard;
    key: number;
}
/** 领地页-我的土地页-土地卡片 */
const MinesCard: React.FC<MinesCardProps> = (props) => {
    const { data, key } = props;

    // 是否为生产中状态
    const isProducing = data.status === 0;

    // 土地状态文字
    const statusText = isProducing ? "生产中" : "闲置中";
    return <ErrorBoundary>
        <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(key * 0.05, 0.3) }}
            whileHover={{ y: -2 }}
            className="relative flex flex-col w-full p-[15px] bg-[#1A1A1A] rounded-[6px]"
        >
            <div className="flex gap-[10px]">
                {
                    getPixelResourceIcon(data.icon, {
                        iconSize: 34,
                        haveBackgroundWarper: true,
                    })
                }
                <div className="flex flex-col gap-[8px]">
                    <div className="text-[#FFFFFF] text-[14px] font-bold">{data.name}</div>
                    <div className="flex items-center text-[#999999] text-[12px]">
                        {/* 地址 */}
                        {!!data?.address && <div className="flex items-center gap-[8px] border-r-[1px] border-[#999999] pr-[6px]">
                            <Image
                                width={10}
                                height={12}
                                alt="address"
                                src="https://lanhu-oss-proxy.lanhuapp.com/ps23b3ue2r8ma0amvafyozxt9z83a73z3hcedb09587-1ecb-4a0e-9a86-6d0a4474324d"
                            />
                            {data?.address ?? ""}
                        </div>}
                        {/* 坐标 */}
                        <div className="text-[#999999] text-[12px] pl-[6px]">
                            {[data?.coordinate[0] ?? "", data?.coordinate[1] ?? ""].filter(Boolean).join('，')}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex gap-[6px] mt-[15px] mb-[20px]">
                <div className="w-[50%] flex flex-col gap-[12px] p-[15px] bg-[#212121] rounded-[6px]">
                    <div className="text-[#999999] text-[12px]">
                        土地储量
                    </div>
                    {data.icon === PIXEL_RESOURCE_TYPES.FARMLAND
                        ? <div className="text-[#CCCCCC] text-[12px]">∞</div>
                        : <div className="text-[#CCCCCC] text-[12px]">
                            <span className="text-[#E7E7E7] text-[15px]">{data?.current ?? 0}</span>/{data?.capacity ?? 0}
                        </div>}
                </div>
                <div className="w-[50%] flex flex-col gap-[12px] p-[15px] bg-[#212121] rounded-[6px]">
                    <div className="text-[#999999] text-[12px]">
                        已投用工具
                    </div>
                    <div className="text-[#CCCCCC] text-[12px]">
                        {data?.tools ?? 0}
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between gap-[6px]">
                <div className="text-[#999999] text-[12px]">
                    可领取：{data?.output ?? 0}
                </div>
                <PixelButton
                    variant="secondary"
                    className={cn("w-[100px] rounded-full p-[10px] text-[12px]",
                        isProducing ? "bg-[#31261A] text-[#F07C1F]" : "bg-[#31261A] text-[#999999] border-[#31261A] pointer-events-none"
                    )}
                >
                    停止挖矿
                </PixelButton>
            </div>
            {/* 卡片状态 */}
            <div className={cn(`absolute top-0 right-0 py-[5px] px-[8px] text-[12px] rounded-tr-[8px] rounded-bl-[8px]`,
                isProducing ? "text-[#379F5F] bg-[#283E31]" : "text-[#8844E2] bg-[#3A2652]"
            )}>{statusText}</div>
        </motion.div>
    </ErrorBoundary>;
};

MinesCard.displayName = 'MinesCard';

export default MinesCard;