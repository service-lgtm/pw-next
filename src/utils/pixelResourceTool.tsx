
import Image from 'next/image';

import AxeImg from "@/public/pixelResource/Axe.png";
import BrickImg from "@/public/pixelResource/Brick.png";
import FarmlandImg from "@/public/pixelResource/Farmland.png";
import CityImg from "@/public/pixelResource/City.png";
import ForestImg from "@/public/pixelResource/Forest.png";
import GrainImg from "@/public/pixelResource/Grain.png";
import HoeImg from "@/public/pixelResource/Hoe.png";
import IronOreImg from "@/public/pixelResource/IronOre.png";
import MeteoriteImg from "@/public/pixelResource/Meteorite.png";
import PickaxeImg from "@/public/pixelResource/Pickaxe.png";
import SeedImg from "@/public/pixelResource/Seed.png";
import StoneImg from "@/public/pixelResource/Stone.png";
import WoodImg from "@/public/pixelResource/Wood.png";
import TOBImg from "@/public/pixelResource/TOB.png";
import { motion } from 'framer-motion';
// import { type InventoryData } from '@/hooks/useInventory';

/** 资源key取值类型 */
// export type ResourceKey = keyof InventoryData['materials'] | keyof InventoryData['tools'] | keyof InventoryData['special']
export type ResourceKey = PIXEL_RESOURCE_SERVICE_KEYS;
export enum PIXEL_RESOURCE_SERVICE_KEYS {
    /** 铁矿 */
    IRON = "iron",
    /** 石矿 */
    STONE = "stone",
    /** 木材 */
    WOOD = "wood",
    /** 粮食 */
    FOOD = "food",
    /** 种子 */
    SEED = "seed",
    /** 镐头 */
    PICKAXE = "pickaxe",
    /** 斧头 */
    AXE = "axe",
    /** 锄头 */
    HOE = "hoe",
    /** 砖头 */
    BRICK = "brick",
    /** 矿石 */
    YLD = "yld",
}

/** 资源标识定义 */
export enum PIXEL_RESOURCE_TYPES {
    /** 金币 */
    TOB = "TOB",
    /** 陨石 */
    METEORITE = "Meteorite",
    /** 锄头 */
    HOE = "Hoe",
    /** 斧头 */
    AXE = "Axe",
    /** 镐头 */
    PICKAXE = "Pickaxe",
    /** 砖头 */
    BRICK = "Brick",
    /** 城市 */
    CITY = "City",
    /** 木材 */
    WOOD = "Wood",
    /** 种子 */
    SEED = "Seed",
    /** 粮食 */
    GRAIN = "Grain",
    /** 石矿 */
    STONE = "Stone",
    /** 铁矿 */
    IRON_ORE = "IronOre",
    /** 农田 */
    FARMLAND = "Farmland",
    /** 森林 */
    FOREST = "Forest",
}

/** 资源图片映射 */
export const PIXEL_RESOURCE_IMAGES: Record<PIXEL_RESOURCE_TYPES, string> = {
    [PIXEL_RESOURCE_TYPES.TOB]: TOBImg.src,
    [PIXEL_RESOURCE_TYPES.METEORITE]: MeteoriteImg.src,
    [PIXEL_RESOURCE_TYPES.HOE]: HoeImg.src,
    [PIXEL_RESOURCE_TYPES.AXE]: AxeImg.src,
    [PIXEL_RESOURCE_TYPES.PICKAXE]: PickaxeImg.src,
    [PIXEL_RESOURCE_TYPES.BRICK]: BrickImg.src,
    [PIXEL_RESOURCE_TYPES.CITY]: CityImg.src,
    [PIXEL_RESOURCE_TYPES.WOOD]: WoodImg.src,
    [PIXEL_RESOURCE_TYPES.SEED]: SeedImg.src,
    [PIXEL_RESOURCE_TYPES.GRAIN]: GrainImg.src,
    [PIXEL_RESOURCE_TYPES.STONE]: StoneImg.src,
    [PIXEL_RESOURCE_TYPES.IRON_ORE]: IronOreImg.src,
    [PIXEL_RESOURCE_TYPES.FARMLAND]: FarmlandImg.src,
    [PIXEL_RESOURCE_TYPES.FOREST]: ForestImg.src,
}

/** 资源名称映射 */
export const PIXEL_RESOURCE_NAMES: Record<PIXEL_RESOURCE_TYPES, string> = {
    [PIXEL_RESOURCE_TYPES.TOB]: "TOB",
    [PIXEL_RESOURCE_TYPES.METEORITE]: "陨石",
    [PIXEL_RESOURCE_TYPES.HOE]: "锄头",
    [PIXEL_RESOURCE_TYPES.AXE]: "斧头",
    [PIXEL_RESOURCE_TYPES.PICKAXE]: "镐头",
    [PIXEL_RESOURCE_TYPES.BRICK]: "砖头",
    [PIXEL_RESOURCE_TYPES.CITY]: "城市",
    [PIXEL_RESOURCE_TYPES.WOOD]: "木材",
    [PIXEL_RESOURCE_TYPES.SEED]: "种子",
    [PIXEL_RESOURCE_TYPES.GRAIN]: "粮食",
    [PIXEL_RESOURCE_TYPES.STONE]: "石矿",
    [PIXEL_RESOURCE_TYPES.IRON_ORE]: "铁矿",
    [PIXEL_RESOURCE_TYPES.FARMLAND]: "农田",
    [PIXEL_RESOURCE_TYPES.FOREST]: "森林",
}

/** 获取资源图片路径 */
export const getPixelResourceImage = (resourceType: PIXEL_RESOURCE_TYPES): string => {
    return PIXEL_RESOURCE_IMAGES[resourceType] || '';
}

/** 获取对应资源图标元素 */
export const getPixelResourceIcon = (resourceType: PIXEL_RESOURCE_TYPES, NodeInfo?: {
    iconSize?: number,
    className?: string,
    haveBackgroundWarper?: boolean,
    glowColors?: [string, string, string]
}): React.ReactNode | string => {
    const { iconSize = 30, className, haveBackgroundWarper, glowColors } = NodeInfo || {};
    // 对应资源静态路径
    const src = getPixelResourceImage(resourceType);

    // 资源类型判空
    if (!src || !resourceType) return resourceType;

    if (haveBackgroundWarper) {
        const PENDDING = 4;
        const _ImageW = iconSize - PENDDING;
        const _ImageH = iconSize - PENDDING;

        return <div
            className={`box-glow relative flex rounded-md justify-center items-center z-0`}
            style={{
                width: iconSize,
                height: iconSize,
                backgroundColor: glowColors ? glowColors[2] : "rgba(255,255,255,0.1)",
            }}>
            <motion.div
                className="absolute top-1/4 z-0 w-full h-full rounded-full"
                style={{
                    background: glowColors ? `radial-gradient(
                        circle,
                        ${glowColors[0]} 10%,
                        ${glowColors[1]} 40%,
                        ${glowColors[2]} 80%
                    )` : "unset",
                    filter: "blur(10px)"
                }}
                animate={{
                    opacity: [.2, .4, .6, .8, .6, .4, .2]
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "anticipate",
                }}
            />
            {<Image
                width={_ImageW}
                height={_ImageH}
                src={src}
                className={className}
                style={{
                    position: "relative",
                    zIndex: 1,
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
