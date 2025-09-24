/*
 * @Author: yy
 * @Date: 2025-09-21 19:43:35
 * @LastEditTime: 2025-09-24 21:24:36
 * @LastEditors: yy
 * @Description: 
 */
import { motion } from "framer-motion";
import Link from "next/link";
import { getPixelResourceIcon } from "@/utils/pixelResourceTool";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { pathMap } from "@/utils/pathMap";
import { getToolsEnum } from "../page";
import { InventoryData } from "@/hooks/useInventory";


/** 领地页-工具列表视图 */
const ToolsViewWapper = (props: {
    inventory: InventoryData | null
}) => {
    const { inventory } = props;
    // 合并数据
    const datas = {
        ...inventory?.tools,
        ...inventory?.materials,
        ...inventory?.special,
    };

    // 工具列表枚举
    const toolsEnum: (ReturnType<typeof getToolsEnum>[number] & {
        count: number
    })[] = getToolsEnum().map(i => {
        const data = datas[i.key];
        return {
            ...i,
            count: data?._resourceAmount || 0,
        }
    })

    return <ErrorBoundary>
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between pt-[25px] pb-[20px]"
        >
            <div className="text-[#CCCCCC] text-[18px]">
                工具列表
            </div>
            <Link href={pathMap.TERRITORY_TOOLSLISTVIEW}>工具列表&gt;</Link>
        </motion.div>
        {/* 工具卡片视图 */}
        <div className="flex gap-[8px]">
            {
                toolsEnum.map((item, index) => {
                    return <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.05, 0.3) }}
                        whileHover={{ y: -2 }}
                        className="w-[25%] flex flex-col items-center justify-center rounded-[6px] bg-[#1A1A1A] px-[8px] py-[18px] gap-[20px]"
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
                            {item?.count}
                        </div>
                    </motion.div>
                })
            }
        </div>
    </ErrorBoundary>
};

ToolsViewWapper.displayName = 'ToolsViewWapper';

export default ToolsViewWapper;