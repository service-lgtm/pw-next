/*
 * @Author: yy
 * @Date: 2025-09-22 20:32:21
 * @LastEditTime: 2025-09-26 00:07:46
 * @LastEditors: yy
 * @Description: 
 */
"use client"

import { FixedHeader, SHOW_MENU_BAR_EVENT } from "@/components/BottomMenuBar/BottomMenuBarLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { eventManager } from "@/utils/eventManager";
import { getPixelResourceIcon, PIXEL_RESOURCE_NAMES, PIXEL_RESOURCE_SERVICE_KEYS, PIXEL_RESOURCE_TYPES, ResourceKey } from "@/utils/pixelResourceTool";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from 'next/image';
import { pathMap } from "@/utils/pathMap";
import { motion } from "framer-motion";
import MineCard from "./MinesCard";
import { cn } from "@/lib/utils";
import { useMyLands } from "@/hooks/useLands";
import { type Land } from "@/types/assets";

/** 土地列表枚举 */
export const getMinesEnum: () => {
    icon: PIXEL_RESOURCE_TYPES;
    color: [string, string, string];
    key: string;
}[] = () => {
    return [
        {
            // 铁矿
            icon: PIXEL_RESOURCE_TYPES.IRON_ORE,
            color: ["#CF1B9E", "#CF1B9E80", "#cf1b9f11"],
            key: ""
        },
        {
            // 农田
            icon: PIXEL_RESOURCE_TYPES.FARMLAND,
            color: ["#F7921B", "#F7921B80", "#f7901b0e"],
            key: "farm"
        },
        {
            // 森林
            icon: PIXEL_RESOURCE_TYPES.FOREST,
            color: ["#61D18E", "#61D18E80", "#61D18E80"],
            key: "forest"
        },
        {
            // 陨石
            icon: PIXEL_RESOURCE_TYPES.METEORITE,
            color: ["#62A6F2", "#62A6F280", "#62a5f210"],
            key: "yld_mine",
        },
        {
            // 石矿
            icon: PIXEL_RESOURCE_TYPES.STONE,
            color: ["#8743E2", "#8743E280", "#8843e213"],
            key: "stone_mine"
        },
        {
            // 城市
            icon: PIXEL_RESOURCE_TYPES.CITY,
            color: ["#EEF01F", "#EEF01F80", "#ecf01f15"],
            key: ""
        },
    ]
}

/** 领地页-我的土地页 */
const MinesListView = () => {
    const { lands, stats, loading, error, refetch } = useMyLands()
    console.log(lands, "<>", stats, ">>>>>>>")
    // 列表刷新状态
    const [refreshing, setRefreshing] = useState(false);
    // 当前选中项土地列表
    const [currentMinesIndex, setCurrentMinesIndex] = useState(0);
    // 土地卡片列表
    const minesList: {
        icon: PIXEL_RESOURCE_TYPES;
        color: [string, string, string];
        list: Land[];
    }[] = getMinesEnum().map(record => {
        const currentLands = lands.filter(land => land.land_type === record.key) ?? [];
        return {
            ...record,
            list: currentLands
        }
    });

    const _by_typeInfo = stats?.by_type ?? {};
    // 剩余总储量
    const totalReserves =
        (
            // (_by_typeInfo?.farm?.reserves?.remaining ?? 0) +
            (_by_typeInfo?.forest?.reserves?.remaining ?? 0) +
            (_by_typeInfo?.stone_mine?.reserves?.remaining ?? 0) +
            (_by_typeInfo?.yld_converted?.reserves?.remaining ?? 0)).toFixed(2);

    // 剩余统计展示列表参数
    const statisticsList = [
        {
            title: "总数量",
            value: stats?.total_count ?? 0,
        },
        {
            title: "剩余储量",
            value: totalReserves ?? 0,
        },
        {
            title: "生产中",
            value: stats?.production?.producing_count ?? 0
        },
        {
            title: "已投入工具",
            // TODO
            value: 0
        },
    ]

    // 当前项土地信息
    const currentMines = minesList[currentMinesIndex] ?? [];

    // 处理刷新事件
    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 3000);
    }

    useEffect(() => {
        eventManager.emit(SHOW_MENU_BAR_EVENT.HIDE);
        return () => {
            eventManager.emit(SHOW_MENU_BAR_EVENT.SHOW);
        }
    }, []);
    return <ErrorBoundary>
        <div className="px-[15px] pt-[54px] pb-[40px] flex flex-col items-center justify-center">
            {/* 顶部标题 */}
            <FixedHeader>
                <div className='flex items-center justify-between'>
                    {/* 返回 */}
                    <Link href={pathMap.TERRITORY}>
                        <Image
                            width={10}
                            height={18}
                            alt="back"
                            src="https://lanhu-oss-proxy.lanhuapp.com/ps225cl61j7iwaj1vv4tto74qzd49mpw39839202a9-48bf-4acc-b415-3d5078677c1e"
                        />
                    </Link>

                    <div className='text-[#E7E7E7] text-[16px]'>我的土地(33)</div>

                    {/* 刷新 */}
                    <Image
                        width={20}
                        height={20}
                        alt="refresh"
                        src="https://lanhu-oss-proxy.lanhuapp.com/psl5mgjvdntppy8mjhyz4bpg2qx1lhyb1916cb8dd3-de17-4f0e-a130-87d9c4b3aa85"
                        className={refreshing ? "icon-spin" : ""}
                        onClick={handleRefresh}
                    />
                </div>
            </FixedHeader>

            {/* 土地卡片视图 */}
            <div className="w-full mt-[15px] flex gap-[8px] flex-wrap justify-between">
                {
                    minesList.map((item, index) => {
                        return <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(index * 0.05, 0.3) }}
                            whileHover={{ y: -2 }}
                            className={cn("w-[30%] flex items-center justify-center rounded-[10px] bg-[#1A1A1A] px-[15px] py-[16px] gap-[14px] border-[2px] transition duration-300",
                                currentMinesIndex === index && `bg-[#2D2D2D]`
                            )}
                            style={{
                                borderColor: currentMinesIndex === index ? item.color[0] : "transparent",
                            }}
                            onClick={() => setCurrentMinesIndex(index)}
                        >
                            {/* 工具图标 */}
                            {getPixelResourceIcon(item.icon, {
                                iconSize: 34,
                                haveBackgroundWarper: true,
                                glowColors: item.color,
                            })}
                            {/* 土地名称 */}
                            <div className="text-[12px] text-[#E7E7E7]" style={{
                                color: item.color[0],
                            }}>
                                {PIXEL_RESOURCE_NAMES[item.icon] ?? ""}
                            </div>
                        </motion.div>
                    })
                }
            </div>
            {/* 剩余统计 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full flex flex-wrap my-[20px] p-[15px] bg-gradient-to-b from-[#95A540] to-[#A69D11] rounded-[6px]"
            >
                {
                    statisticsList.map((item, index) => {
                        return <div className="relative w-1/4 flex flex-col items-center gap-[12px]" key={index}>
                            <div className="text-[12px] text-[#333333]">
                                {item.title}
                            </div>
                            <div className="text-[18px] text-[#333333] font-bold">
                                {item.value}
                            </div>
                            {/* 分割线样式 */}
                            {
                                index !== statisticsList.length - 1 &&
                                <div className="absolute right-0 top-0 w-[1px] h-[100%] bg-[#66666633]"></div>
                            }
                        </div>
                    })
                }

            </motion.div>

            {/* 土地列表 */}
            <div className='w-full flex flex-col items-center justify-center gap-[15px]'>
                {
                    currentMines?.list?.map((item, index) => {
                        return <MineCard key={index} data={item} icon={currentMines.icon} />
                    })
                }
            </div>
        </div>
    </ErrorBoundary>
};

export default MinesListView