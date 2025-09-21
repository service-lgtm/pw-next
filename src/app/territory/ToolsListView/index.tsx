/*
 * @Author: yy
 * @Date: 2025-09-21 19:43:35
 * @LastEditTime: 2025-09-21 19:57:22
 * @LastEditors: yy
 * @Description: 
 */
import { motion } from "framer-motion";
import Link from "next/link";
import { getPixelResourceIcon, PIXEL_RESOURCE_TYPES } from "@/utils/pixelResourceTool";
import { ErrorBoundary } from "@/components/ErrorBoundary";


/** 领地页-工具列表视图 */
const ToolsListView = () => {

    // 工具列表枚举
    const toolsEnum: {
        icon: PIXEL_RESOURCE_TYPES,
        count: number,
        color: [string, string, string]
    }[] = [
            {
                // 镐头
                icon: PIXEL_RESOURCE_TYPES.PICKAXE,
                count: 164345,
                color: ["#F7921B", "#F7921B80", "#f7901b13"],
            },
            {
                // 斧头
                icon: PIXEL_RESOURCE_TYPES.AXE,
                count: 13213,
                color: ["#61D18E", "#61D18E80", "#61d18e10"],
            },
            {
                // 锄头
                icon: PIXEL_RESOURCE_TYPES.HOE,
                count: 1454,
                color: ["#62A6F2", "#62A6F280", "#62a5f213"],
            },
            {
                // 砖头
                icon: PIXEL_RESOURCE_TYPES.BRICK,
                count: 315,
                color: ["#8743E2", "#8743E280", "#8843e20e"],
            },
            {
                // 种子
                icon: PIXEL_RESOURCE_TYPES.SEED,
                count: 145,
                color: ["#CACC1A", "#CACC1A80", "#c9cc1a0e"],
            },
        ]

    return <ErrorBoundary>
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between pt-[25px] pb-[20px]"
        >
            <div className="text-[#CCCCCC] text-[18px]">
                工具列表
            </div>
            <Link href="">工具列表&gt;</Link>
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
                        className="w-[20%] flex flex-col items-center justify-center rounded-[6px] bg-[#1A1A1A] px-[8px] py-[18px] gap-[20px]"
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
                            {item.count}
                        </div>
                    </motion.div>
                })
            }
        </div>
    </ErrorBoundary>
};

ToolsListView.displayName = 'ToolsListView';

export default ToolsListView;