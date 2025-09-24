/*
 * @Author: yy
 * @Date: 2025-09-21 20:30:38
 * @LastEditTime: 2025-09-24 23:57:31
 * @LastEditors: yy
 * @Description: 
 */
import { PIXEL_RESOURCE_TYPES } from "@/utils/pixelResourceTool";
import { motion } from "framer-motion";
import Link from "next/link";
import MinesCard, { type IMinesInfoType } from "./MinesViewCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { pathMap } from "@/utils/pathMap";
import { useMyYLDMines } from "@/hooks/useYLDMines";
import { InventoryData } from "@/hooks/useInventory";
import { useAuth } from "@/hooks/useAuth";


/** 领地页-矿场列表视图 */
const MinesListView = (props: {
    inventory: InventoryData | null
}) => {
    const { inventory } = props;
    // 认证状态
    const { isAuthenticated, isLoading: authLoading } = useAuth()

    // 数据获取
    const shouldFetchData = !authLoading && isAuthenticated

    const {
        mines: yldMines,
        loading: yldMinesLoading,
        error: yldMinesError,
        stats: yldStats,
        pre_stats: yldPreStats,
        totalCount: yldTotalCount,
        refetch: refetchYLDMines
    } = useMyYLDMines(shouldFetchData ? {
        page: 1,
        page_size: 100,
        ordering: '-created_at'
    } : null)

    // 农田矿场统计
    const farmlandMine = (yldPreStats as any)?.by_type?.farm ?? {};
    // 石矿矿场统计
    const stoneMine = (yldPreStats as any)?.by_type?.stone_mine ?? {};
    // 陨石矿场统计
    const meteoriteMine = (yldPreStats as any)?.by_type?.yld_converted ?? {};

    // 农场总初始储量
    const farmlandMineTotalReserves = "∞";
    // (yldPreStats as any)?.by_type?.farm?.reserves?.initial?.toFixed(2);
    // 农场总剩余储量
    const farmlandMineTotalReservesLeft = "∞";
    // (yldPreStats as any)?.by_type?.farm?.total_reserves?.toFixed(2);

    // 石矿总初始储量
    const stoneMineTotalReserves = (yldPreStats as any)?.by_type?.stone_mine?.reserves?.initial?.toFixed(2) || 0;
    // 石矿总剩余储量
    const stoneMineTotalReservesLeft = (yldPreStats as any)?.by_type?.stone_mine?.total_reserves?.toFixed(2) || 0;
    // 陨石矿总初始储量
    const meteoriteMineTotalReserves = (yldPreStats as any)?.by_type?.yld_converted?.reserves?.initial?.toFixed(2) || 0;
    // 陨石矿总剩余储量
    const meteoriteMineTotalReservesLeft = (yldPreStats as any)?.by_type?.yld_converted?.total_reserves?.toFixed(2) || 0;

    // console.log(inventory, ">>>>inventory", yldPreStats)
    // 矿场列表数据
    const minesList: IMinesInfoType[] = [
        {
            minesName: "伐木场",
            minesType: PIXEL_RESOURCE_TYPES.WOOD,
            minesCount: 0,
            minesLimit: '0',
            mineReserves: '0',
            reserveHarvesting: 0,
            toolCount: 0,
            toolCountUsed: 0,
            toolType: PIXEL_RESOURCE_TYPES.AXE,
            isHarvestingDisabled: true,
        },
        {
            minesName: "铁矿场",
            minesType: PIXEL_RESOURCE_TYPES.IRON_ORE,
            minesCount: 0,
            minesLimit: '0',
            mineReserves: '0',
            reserveHarvesting: 0,
            toolCount: 0,
            toolCountUsed: 0,
            toolType: PIXEL_RESOURCE_TYPES.PICKAXE,
            isHarvestingDisabled: false,
        },
        {
            minesName: "农田",
            minesType: PIXEL_RESOURCE_TYPES.FARMLAND,
            minesCount: farmlandMine?.count || 0,
            minesLimit: farmlandMineTotalReserves,
            mineReserves: farmlandMineTotalReservesLeft,
            reserveHarvesting: 0,
            toolCount: 0,
            toolCountUsed: 0,
            toolType: PIXEL_RESOURCE_TYPES.HOE,
            isHarvestingDisabled: true,
        },
        {
            minesName: "陨石矿场",
            minesType: PIXEL_RESOURCE_TYPES.METEORITE,
            minesCount: stoneMine?.count || 0,
            minesLimit: meteoriteMineTotalReserves,
            mineReserves: meteoriteMineTotalReservesLeft,
            reserveHarvesting: 0,
            toolCount: 0,
            toolCountUsed: 0,
            toolType: PIXEL_RESOURCE_TYPES.PICKAXE,
            isHarvestingDisabled: true,
        },
        {
            minesName: "石矿场",
            minesType: PIXEL_RESOURCE_TYPES.STONE,
            minesCount: meteoriteMine?.count || 0,
            minesLimit: stoneMineTotalReserves,
            mineReserves: stoneMineTotalReservesLeft,
            reserveHarvesting: 0,
            toolCount: 0,
            toolCountUsed: 0,
            toolType: PIXEL_RESOURCE_TYPES.PICKAXE,
            isHarvestingDisabled: true,
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
            <Link href={pathMap.TERRITORY_MINESLISTVIEW}>矿场列表&gt;</Link>
        </motion.div>
        {/* 矿场列表数据 */}
        <div className="flex flex-col gap-[15px]">
            {minesList.map((item, index) => <MinesCard data={item} key={index} />)}
        </div>
    </ErrorBoundary>
};

MinesListView.displayName = 'MinesListView';

export default MinesListView;