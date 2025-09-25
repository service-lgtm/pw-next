/*
 * @Author: yy
 * @Date: 2025-09-21 20:30:38
 * @LastEditTime: 2025-09-25 23:04:04
 * @LastEditors: yy
 * @Description: 
 */
import { PIXEL_RESOURCE_TYPES, ResourceKey } from "@/utils/pixelResourceTool";
import { motion } from "framer-motion";
import Link from "next/link";
import MinesCard, { type IMinesInfoType } from "./MinesViewCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { pathMap } from "@/utils/pathMap";
import { useMyYLDMines } from "@/hooks/useYLDMines";
import { InventoryData } from "@/hooks/useInventory";
import { useAuth } from "@/hooks/useAuth";
import { useMiningSessions, useMiningSummary } from "@/hooks/useProduction";
import { useMemo } from "react";
import { PIXEL_RESOURCE_SERVICE_KEYS } from "@/utils/pixelResourceTool";


/**
 * 格式化数字
 */
function formatNumber(value: number, decimals: number = 2): string {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toFixed(decimals)
}

/**
 * 获取下次结算信息
 */
function getNextSettlementInfo(): { time: string; minutes: number } {
    const now = new Date()
    const nextHour = new Date(now)
    nextHour.setHours(now.getHours() + 1, 0, 0, 0)

    const minutes = Math.floor((nextHour.getTime() - now.getTime()) / (1000 * 60))
    const time = nextHour.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    })

    return { time, minutes }
}


/** 领地页-矿场列表视图 */
const MinesListView = (props: {
    inventory: InventoryData | null
}) => {
    const { inventory } = props;
    // 认证状态
    const { isAuthenticated, isLoading: authLoading } = useAuth()

    // 数据获取
    const shouldFetchData = !authLoading && isAuthenticated

    // 下次结算信息
    const nextSettlement = getNextSettlementInfo();

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

    const {
        sessions,
        loading: sessionsLoading,
        refetch: refetchSessions
    } = useMiningSessions({
        status: 'active',
        enabled: shouldFetchData
    })
    const {
        summary: miningSummary,
        refetch: refetchMiningSummary
    } = useMiningSummary({
        enabled: shouldFetchData,
        autoRefresh: true,
        refreshInterval: 30000
    })

    // 合并会话数据
    const displaySessions = useMemo(() => {
        if (miningSummary?.active_sessions?.sessions?.length > 0) {
            return miningSummary.active_sessions.sessions
        }
        return sessions || []
    }, [miningSummary, sessions])

    // 陨石会话
    const meteoriteSession = useMemo(() => {
        return displaySessions.filter((sessionItem: any) => sessionItem.resource_type === PIXEL_RESOURCE_SERVICE_KEYS.YLD) ?? [];
    }, [displaySessions]);
    // 石矿会话
    const stoneSession = useMemo(() => {
        return displaySessions.filter((sessionItem: any) => sessionItem.resource_type === PIXEL_RESOURCE_SERVICE_KEYS.STONE) ?? [];
    }, [displaySessions]);
    // 粮食会话
    // const foodSession = useMemo(() => {
    //     return displaySessions.filter((sessionItem:any) => sessionItem.resource_type === PIXEL_RESOURCE_SERVICE_KEYS.FOOD) ?? [];
    // },[displaySessions])
    // 木材会话
    const woodSession = useMemo(() => {
        return displaySessions.filter((sessionItem: any) => sessionItem.resource_type === PIXEL_RESOURCE_SERVICE_KEYS.WOOD) ?? [];
    }, [displaySessions])

    // 陨石会话总待领取数
    const meteoriteSessionTotalYld = useMemo(() => {
        return meteoriteSession.reduce((acc: number, sessionItem: any) => {
            const current = sessionItem.pending_output || sessionItem.pending_rewards || 0;
            return acc + current;
        }, 0)
    }, [meteoriteSession])
    // 石矿会话总待领取数
    const stoneSessionTotalYld = useMemo(() => {
        return stoneSession.reduce((acc: number, sessionItem: any) => {
            const current = sessionItem.pending_output || sessionItem.pending_rewards || 0;
            return acc + current;
        }, 0)
    }, [stoneSession])
    // 木材会话总待领取数
    const woodSessionTotalYld = useMemo(() => {
        return woodSession.reduce((acc: number, sessionItem: any) => {
            const current = sessionItem.pending_output || sessionItem.pending_rewards || 0;
            return acc + current;
        }, 0)
    }, [woodSession])

    // 森林矿场统计
    const forestMine = (yldPreStats as any)?.by_type?.forest ?? {};
    // 农田矿场统计
    const farmlandMine = (yldPreStats as any)?.by_type?.farm ?? {};
    // 石矿矿场统计
    const stoneMine = (yldPreStats as any)?.by_type?.stone_mine ?? {};
    // 陨石矿场统计
    const meteoriteMine = (yldPreStats as any)?.by_type?.yld_converted ?? {};

    // 森林总初始储量
    const forestMineTotalReserves = (yldPreStats as any)?.by_type?.forest?.reserves?.initial?.toFixed(2) || 0;
    // 森林总剩余储量
    const forestMineTotalReservesLeft = (yldPreStats as any)?.by_type?.forest?.total_reserves?.toFixed(2) || 0;
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

    // 斧头统计信息
    const axeInfo = inventory?.tools?.axe;
    // 锄头统计信息
    const hoeInfo = inventory?.tools?.hoe;
    // 镐头统计信息
    const pickaxeInfo = inventory?.tools?.pickaxe;

    // 矿场列表数据
    const minesList: IMinesInfoType[] = [
        {
            minesName: "伐木场",
            minesType: PIXEL_RESOURCE_TYPES.WOOD,
            minesCount: forestMine?.count || 0,
            minesLimit: forestMineTotalReserves,
            mineReserves: forestMineTotalReservesLeft,
            reserveHarvesting: formatNumber(woodSessionTotalYld, 2),
            toolCount: axeInfo?.count ?? 0,
            toolCountUsed: axeInfo?.working ?? 0,
            toolType: PIXEL_RESOURCE_TYPES.AXE,
            isHarvestingDisabled: true,
        },
        {
            minesName: "铁矿场",
            minesType: PIXEL_RESOURCE_TYPES.IRON_ORE,
            minesCount: 0,
            minesLimit: '0',
            mineReserves: '0',
            reserveHarvesting: '0',
            toolCount: pickaxeInfo?.count ?? 0,
            toolCountUsed: pickaxeInfo?.working ?? 0,
            toolType: PIXEL_RESOURCE_TYPES.PICKAXE,
            isHarvestingDisabled: false,
        },
        {
            minesName: "农田",
            minesType: PIXEL_RESOURCE_TYPES.FARMLAND,
            minesCount: farmlandMine?.count || 0,
            minesLimit: farmlandMineTotalReserves,
            mineReserves: farmlandMineTotalReservesLeft,
            reserveHarvesting: '0',
            toolCount: hoeInfo?.count ?? 0,
            toolCountUsed: hoeInfo?.working ?? 0,
            toolType: PIXEL_RESOURCE_TYPES.HOE,
            isHarvestingDisabled: true,
        },
        {
            minesName: "陨石矿场",
            minesType: PIXEL_RESOURCE_TYPES.METEORITE,
            minesCount: stoneMine?.count || 0,
            minesLimit: meteoriteMineTotalReserves,
            mineReserves: meteoriteMineTotalReservesLeft,
            reserveHarvesting: formatNumber(meteoriteSessionTotalYld, 2),
            toolCount: pickaxeInfo?.count ?? 0,
            toolCountUsed: pickaxeInfo?.working ?? 0,
            toolType: PIXEL_RESOURCE_TYPES.PICKAXE,
            isHarvestingDisabled: true,
        },
        {
            minesName: "石矿场",
            minesType: PIXEL_RESOURCE_TYPES.STONE,
            minesCount: meteoriteMine?.count || 0,
            minesLimit: stoneMineTotalReserves,
            mineReserves: stoneMineTotalReservesLeft,
            reserveHarvesting: formatNumber(stoneSessionTotalYld, 2),
            toolCount: pickaxeInfo?.count ?? 0,
            toolCountUsed: pickaxeInfo?.working ?? 0,
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