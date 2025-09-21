/*
 * @Author: yy
 * @Date: 2025-09-21 20:30:38
 * @LastEditTime: 2025-09-21 23:01:13
 * @LastEditors: yy
 * @Description: 
 */
import { PIXEL_RESOURCE_TYPES } from "@/utils/pixelResourceTool";
import { motion } from "framer-motion";
import Link from "next/link";
import MinesCard, { type IMinesInfoType } from "./MinesCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";


/** 领地页-矿场列表 */
const MinesListView = () => {
    // 矿场列表数据
    const minesList: IMinesInfoType[] = [
        {
            minesName: "伐木场",
            minesType: PIXEL_RESOURCE_TYPES.WOOD,
            minesCount: 0,
            minesLimit: 1324.00,
            mineReserves: 1011.25,
            reserveHarvesting: 123.00,
            toolCount: 1000,
            toolCountUsed: 452,
            toolType: PIXEL_RESOURCE_TYPES.AXE,
            isHarvestingDisabled: true,
        },
        {
            minesName: "铁矿场",
            minesType: PIXEL_RESOURCE_TYPES.IRON_ORE,
            minesCount: 14,
            minesLimit: 1324.00,
            mineReserves: 1011.25,
            reserveHarvesting: 123.00,
            toolCount: 1000,
            toolCountUsed: 452,
            toolType: PIXEL_RESOURCE_TYPES.PICKAXE,
            isHarvestingDisabled: false,
        },
        {
            minesName: "农田",
            minesType: PIXEL_RESOURCE_TYPES.FARMLAND,
            minesCount: 14,
            minesLimit: 1324.00,
            mineReserves: 1011.25,
            reserveHarvesting: 123.00,
            toolCount: 1000,
            toolCountUsed: 452,
            toolType: PIXEL_RESOURCE_TYPES.HOE,
            isHarvestingDisabled: true,
        },
        {
            minesName: "陨石矿场",
            minesType: PIXEL_RESOURCE_TYPES.METEORITE,
            minesCount: 14,
            minesLimit: 1324.00,
            mineReserves: 1011.25,
            reserveHarvesting: 123.00,
            toolCount: 1000,
            toolCountUsed: 452,
            toolType: PIXEL_RESOURCE_TYPES.PICKAXE,
            isHarvestingDisabled: false,
        },
        {
            minesName: "石矿场",
            minesType: PIXEL_RESOURCE_TYPES.STONE,
            minesCount: 14,
            minesLimit: 1324.00,
            mineReserves: 1011.25,
            reserveHarvesting: 123.00,
            toolCount: 1000,
            toolCountUsed: 452,
            toolType: PIXEL_RESOURCE_TYPES.PICKAXE,
            isHarvestingDisabled: false,
        },
    ]
    return <ErrorBoundary>
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between pt-[25px] pb-[20px]"
        >
            <div className="text-[#CCCCCC] text-[18px]">
                矿场列表
            </div>
            <Link href="">矿场列表&gt;</Link>
        </motion.div>

        {/* 矿场列表数据 */}
        <div className="flex flex-col gap-[15px]">
            {minesList.map((item, index) => <MinesCard data={item} key={index} />)}
        </div>
    </ErrorBoundary>
};

MinesListView.displayName = 'MinesListView';

export default MinesListView;