import Image from 'next/image';

import AxeImg from "@/public/resources/Axe.png";
import BrickImg from "@/public/resources/Brick.png"
import GoldCoinImg from "@/public/resources/GoldCoin.png";
import GrainImg from "@/public/resources/Grain.png";
import HoeImg from "@/public/resources/Hoe.png";
import IronOreImg from "@/public/resources/IronOre.png";
import MeteoriteImg from "@/public/resources/Meteorite.png";
import PickaxeImg from "@/public/resources/Pickaxe.png";
import SeedImg from "@/public/resources/Seed.png";
import StoneImg from "@/public/resources/Stone.png";
import WoodImg from "@/public/resources/Wood.png";

/** 资源标识定义 */
export enum RESOURCE_TYPES {
    /** 金币 */
    GOLD_COIN = "gold_coin",
    /** 斧头 */
    AXE = "axe",
    /** 镐头 */
    PICKAXE = "pickaxe",
    /** 锄头 */
    HOE = "hoe",
    /** 粮食 */
    GRAIN = "grain",
    /** 铁矿 */
    IRON_ORE = "iron_ore",
    /** 陨石 */
    METEORITE = "meteorite",
    /** 种子 */
    SEED = "seed",
    /** 砖头 */
    BRICK = "brick",
    /** 石头 */
    STONE = "stone",
    /** 木材 */
    WOOD = "wood"
}

/** 资源图片映射 */
export const RESOURCE_IMAGES: Record<RESOURCE_TYPES, string> = {
    [RESOURCE_TYPES.AXE]: AxeImg.src,
    [RESOURCE_TYPES.BRICK]: BrickImg.src,
    [RESOURCE_TYPES.GOLD_COIN]: GoldCoinImg.src,
    [RESOURCE_TYPES.GRAIN]: GrainImg.src,
    [RESOURCE_TYPES.HOE]: HoeImg.src,
    [RESOURCE_TYPES.IRON_ORE]: IronOreImg.src,
    [RESOURCE_TYPES.METEORITE]: MeteoriteImg.src,
    [RESOURCE_TYPES.PICKAXE]: PickaxeImg.src,
    [RESOURCE_TYPES.SEED]: SeedImg.src,
    [RESOURCE_TYPES.STONE]: StoneImg.src,
    [RESOURCE_TYPES.WOOD]: WoodImg.src,
}

/** 资源名称映射 */
export const RESOURCE_NAMES: Record<RESOURCE_TYPES, string> = {
    [RESOURCE_TYPES.AXE]: "斧头",
    [RESOURCE_TYPES.BRICK]: "砖头",
    [RESOURCE_TYPES.GOLD_COIN]: "金币",
    [RESOURCE_TYPES.GRAIN]: "粮食",
    [RESOURCE_TYPES.HOE]: "锄头",
    [RESOURCE_TYPES.IRON_ORE]: "铁矿",
    [RESOURCE_TYPES.METEORITE]: "陨石",
    [RESOURCE_TYPES.PICKAXE]: "镐头",
    [RESOURCE_TYPES.SEED]: "种子",
    [RESOURCE_TYPES.STONE]: "石头",
    [RESOURCE_TYPES.WOOD]: "木材"
}

/** 获取资源图片路径 */
export const getResourceImage = (resourceType: RESOURCE_TYPES): string => {
    return RESOURCE_IMAGES[resourceType] || '';
}

/** 获取对应资源图标元素 */
export const getResourceIcon = (resourceType: RESOURCE_TYPES, NodeInfo?: {
    iconSize?: number,
    className?: string,
    haveBackgroundWarper?: boolean,
}): React.ReactNode | string => {
    const { iconSize = 30, className, haveBackgroundWarper } = NodeInfo || {};
    // 对应资源静态路径
    const src = getResourceImage(resourceType);

    // 资源类型判空
    if (!src || !resourceType) return resourceType;

    if (haveBackgroundWarper) {
        const PENDDING = 4;
        const _ImageW = iconSize - PENDDING;
        const _ImageH = iconSize - PENDDING;

        return <div className={`flex rounded-md justify-center items-center`} style={{
            width: iconSize,
            height: iconSize,
            backgroundColor: "rgba(255,255,255,0.1)",
        }}>
            {<Image
                width={_ImageW}
                height={_ImageH}
                src={src}
                className={className}
                style={{
                    width: _ImageW,
                    height: _ImageH,
                }}
                alt={resourceType}
                priority
                unoptimized
            />}
        </div>
    }

    return <Image
        width={iconSize}
        height={iconSize}
        src={src}
        className={className}
        style={{
            width: iconSize,
            height: iconSize,
        }}
        alt={resourceType}
        priority
        unoptimized
    />
}
