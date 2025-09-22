/*
 * @Author: yy
 * @Date: 2025-09-22 22:04:31
 * @LastEditTime: 2025-09-22 22:19:17
 * @LastEditors: yy
 * @Description: 
 */
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getPixelResourceIcon, PIXEL_RESOURCE_TYPES } from "@/utils/pixelResourceTool";
import { motion } from "framer-motion";

/** 工具卡片数据类型 */
export interface IToolsCard {
    /** 编号 */
    id: number;
    /** 工具类型 */
    icon: PIXEL_RESOURCE_TYPES;
    /** 工具名称 */
    name: string;
    /** 耐久度上限 */
    durability: number;
    /** 耐久度 */
    durabilityCurrent: number;
    /** 获得日期 */
    getTimestamp: string;
    /** 获得的渠道 */
    getChannel: string;
}

/** 工具卡片类型 */
interface ToolsCardProps {
    /** 数据源 */
    data: IToolsCard;
    key: number;
}
/** 领地页-我的工具页-工具卡片 */
const ToolsCard:React.FC<ToolsCardProps> = (props) => {
    const { data,key } = props;

  return <ErrorBoundary>
        <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(key * 0.05, 0.3) }}
            whileHover={{ y: -2 }}
            className="flex justify-between w-full p-[15px] bg-[#1A1A1A] rounded-[6px] gap-[10px]"
        >
            {/* 左侧信息 */}
            <div className="flex flex-col gap-[10px]">
                {/* 工具标识 */}
                <div className="flex items-center gap-[10px]">
                    {
                        getPixelResourceIcon(data.icon,{
                            iconSize: 34,
                            haveBackgroundWarper:true,
                        })
                    }
                    <span className="text-[#E7E7E7] text-[16px]">{data?.name ?? ""}</span>
                </div>
                <div className="text-[#999999] text-[14px]">
                    耐久度：<span className="text-[#F07C1F]">{data?.durabilityCurrent ?? 0}</span>/{data?.durability ?? 0}
                </div>
                <div className="text-[#999999] text-[14px]">
                    {/* 获取日期 */}
                    <span>{data?.getTimestamp ?? ""}</span>
                    {/* 获取渠道 */}
                    <span className="ml-[5px]">{data?.getChannel ?? ""}</span>
                </div>
            </div>
            <div className="text-[#999999] text-[12px]">
                编号{data?.id ?? ""}
            </div>
        </motion.div>
    </ErrorBoundary>;
};

ToolsCard.displayName = 'ToolsCard';

export default ToolsCard;