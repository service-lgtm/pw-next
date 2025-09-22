/*
 * @Author: yy
 * @Date: 2025-09-22 20:43:12
 * @LastEditTime: 2025-09-22 22:25:25
 * @LastEditors: yy
 * @Description: 
 */
"use client"
import { FixedHeader, SHOW_MENU_BAR_EVENT } from '@/components/BottomMenuBar/BottomMenuBarLayout';
import { eventManager } from '@/utils/eventManager';
import { getPixelResourceIcon, PIXEL_RESOURCE_NAMES, PIXEL_RESOURCE_TYPES } from '@/utils/pixelResourceTool';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { pathMap } from '@/utils/pathMap';
import { formatTimestampToString } from '@/utils/common';
import { cn } from '@/lib/utils';
import ToolsCard, { type IToolsCard } from './ToolsCard';

/** 工具列表枚举 */
export const getToolsEnum: () => {
    icon: PIXEL_RESOURCE_TYPES;
    color: [string, string, string];
}[] = () => {
    return [
        {
            // 镐头
            icon: PIXEL_RESOURCE_TYPES.PICKAXE,
            color: ["#F7921B", "#F7921B80", "#f7901b13"],
        },
        {
            // 斧头
            icon: PIXEL_RESOURCE_TYPES.AXE,
            color: ["#61D18E", "#61D18E80", "#61d18e10"],
        },
        {
            // 锄头
            icon: PIXEL_RESOURCE_TYPES.HOE,
            color: ["#62A6F2", "#62A6F280", "#62a5f213"],
        },
        {
            // 砖头
            icon: PIXEL_RESOURCE_TYPES.BRICK,
            color: ["#8743E2", "#8743E280", "#8843e20e"],
        },
        {
            // 种子
            icon: PIXEL_RESOURCE_TYPES.SEED,
            color: ["#CACC1A", "#CACC1A80", "#c9cc1a0e"],
        },
    ]
}

/** 领地页-我的工具页 */
const ToolsListView = () => {

    // 列表刷新状态
    const [refreshing, setRefreshing] = useState(false);
    // 当前选中项工具列表
    const [currentToolsIndex, setCurrentToolsIndex] = useState(0);

    // 工具列表
    const toolsEnum: {
        icon: PIXEL_RESOURCE_TYPES;
        count: number;
        color: [string, string, string];
        list: IToolsCard[];
    }[] = getToolsEnum().map(record => {
        return {
            ...record,
            count: 999,
            list: Array(8).fill(null).map((_, index) => ({
                id: index,
                icon: record.icon,
                name: PIXEL_RESOURCE_NAMES[record.icon] ?? '',
                durability: 100,
                durabilityCurrent: 100,
                getTimestamp: formatTimestampToString(Date.now()),
                getChannel: !index ? "合成获得" : index % 2 === 0 ? "空头获得" : "购买获得"
            }))
        }
    });

    // 当前展示项工具
    const currentTools = toolsEnum[currentToolsIndex];

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

                    <div className='text-[#E7E7E7] text-[16px]'>我的工具(33)</div>

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

            {/* 工具卡片视图 */}
            <div className="w-full my-[20px] flex gap-[8px]">
                {
                    toolsEnum.map((item, index) => {
                        return <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(index * 0.05, 0.3) }}
                            whileHover={{ y: -2 }}
                            className={cn("w-[20%] flex flex-col items-center justify-center rounded-[6px] bg-[#1A1A1A] px-[8px] py-[18px] gap-[20px] border-[2px] transition duration-300",
                                currentToolsIndex === index && `bg-[#2D2D2D]`
                            )}
                            style={{
                                borderColor: currentToolsIndex === index ? item.color[0] : "transparent",
                            }}
                            onClick={() => setCurrentToolsIndex(index)}
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

            {/* 工具列表视图 */}
            <div className='w-full flex flex-col items-center justify-center gap-[15px]'>
                {
                    currentTools?.list?.map((item, index) => {
                        return <ToolsCard key={index} data={item} />
                    })
                }
            </div>
        </div>
    </ErrorBoundary>
};

export default ToolsListView