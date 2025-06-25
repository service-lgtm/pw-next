// app/explore/china/[province]/constants.ts
import { 
  Home, ShoppingBag, Factory, Trees, Diamond, Crown, Lock
} from 'lucide-react'
import type { CityConfig } from './types'

export const PLOT_TYPES = {
  residential: {
    name: '住宅用地',
    color: '#4FC3F7',
    bgGradient: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500',
    icon: Home,
    buildings: ['公寓', '别墅', '民宿'],
    baseYield: 0.04,
    description: '适合建设住宅，稳定收益'
  },
  commercial: {
    name: '商业用地',
    color: '#FFB74D',
    bgGradient: 'from-orange-500/20 to-yellow-500/20',
    borderColor: 'border-orange-500',
    icon: ShoppingBag,
    buildings: ['商店', '餐厅', '娱乐场所'],
    baseYield: 0.06,
    description: '商业价值高，收益可观'
  },
  industrial: {
    name: '工业用地',
    color: '#81C784',
    bgGradient: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500',
    icon: Factory,
    buildings: ['工厂', '仓库', '物流中心'],
    baseYield: 0.05,
    description: '工业生产，批量收益'
  },
  agricultural: {
    name: '农业用地',
    color: '#A1887F',
    bgGradient: 'from-amber-500/20 to-brown-500/20',
    borderColor: 'border-amber-700',
    icon: Trees,
    buildings: ['农场', '果园', '养殖场'],
    baseYield: 0.03,
    description: '绿色产业，长期增值'
  },
  special: {
    name: '特殊地块',
    color: '#BA68C8',
    bgGradient: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500',
    icon: Diamond,
    buildings: ['商业综合体', '写字楼', '酒店'],
    baseYield: 0.08,
    description: '稀有地块，价值极高'
  },
  landmark: {
    name: '地标建筑',
    color: '#FFD700',
    bgGradient: 'from-yellow-500/20 to-orange-500/20',
    borderColor: 'border-gold-500',
    icon: Crown,
    buildings: [],
    baseYield: 0.1,
    description: '城市地标，收藏价值'
  },
  protected: {
    name: '保护区域',
    color: '#9E9E9E',
    bgGradient: 'from-gray-500/20 to-gray-600/20',
    borderColor: 'border-gray-600',
    icon: Lock,
    buildings: [],
    baseYield: 0,
    description: '历史保护，禁止交易'
  }
}

export const SHOP_CONFIGS = {
  commercial: [
    { name: '星巴克', icon: '☕', type: 'shop', category: '咖啡店', popularity: 85, dailyRevenue: 15000, openTime: '7:00-22:00' },
    { name: '肯德基', icon: '🍗', type: 'shop', category: '快餐店', popularity: 90, dailyRevenue: 25000, openTime: '24小时' },
    { name: '麦当劳', icon: '🍔', type: 'shop', category: '快餐店', popularity: 88, dailyRevenue: 23000, openTime: '24小时' },
    { name: '711便利店', icon: '🏪', type: 'shop', category: '便利店', popularity: 75, dailyRevenue: 8000, openTime: '24小时' },
    { name: '全家便利店', icon: '🏬', type: 'shop', category: '便利店', popularity: 73, dailyRevenue: 7500, openTime: '24小时' },
    { name: '永辉超市', icon: '🛒', type: 'shop', category: '超市', popularity: 70, dailyRevenue: 35000, openTime: '8:00-22:00' },
    { name: '海底捞', icon: '🍲', type: 'shop', category: '餐厅', popularity: 95, dailyRevenue: 45000, openTime: '10:00-02:00' },
    { name: '优衣库', icon: '👕', type: 'shop', category: '服装店', popularity: 80, dailyRevenue: 20000, openTime: '10:00-22:00' },
    { name: 'NIKE', icon: '👟', type: 'shop', category: '运动品牌', popularity: 85, dailyRevenue: 30000, openTime: '10:00-22:00' },
    { name: '苹果店', icon: '📱', type: 'shop', category: '电子产品', popularity: 92, dailyRevenue: 80000, openTime: '10:00-22:00' },
    { name: '华为体验店', icon: '📲', type: 'shop', category: '电子产品', popularity: 88, dailyRevenue: 60000, openTime: '10:00-22:00' },
    { name: '小米之家', icon: '🏠', type: 'shop', category: '电子产品', popularity: 82, dailyRevenue: 40000, openTime: '10:00-22:00' },
    { name: '盒马鲜生', icon: '🦑', type: 'shop', category: '新零售', popularity: 85, dailyRevenue: 50000, openTime: '8:00-22:00' },
    { name: '瑞幸咖啡', icon: '☕', type: 'shop', category: '咖啡店', popularity: 80, dailyRevenue: 12000, openTime: '7:00-21:00' },
    { name: 'Zara', icon: '👗', type: 'shop', category: '快时尚', popularity: 83, dailyRevenue: 25000, openTime: '10:00-22:00' }
  ],
  residential: [
    { name: '小区便利店', icon: '🏪', type: 'shop', category: '便利店', popularity: 60, dailyRevenue: 3000, openTime: '7:00-23:00' },
    { name: '社区药店', icon: '💊', type: 'shop', category: '药店', popularity: 65, dailyRevenue: 5000, openTime: '8:00-22:00' },
    { name: '水果店', icon: '🍎', type: 'shop', category: '生鲜店', popularity: 70, dailyRevenue: 4000, openTime: '7:00-21:00' },
    { name: '理发店', icon: '💈', type: 'shop', category: '生活服务', popularity: 55, dailyRevenue: 2000, openTime: '9:00-21:00' },
    { name: '快递驿站', icon: '📦', type: 'shop', category: '物流服务', popularity: 80, dailyRevenue: 1500, openTime: '8:00-20:00' },
    { name: '菜鸟驿站', icon: '🐦', type: 'shop', category: '物流服务', popularity: 82, dailyRevenue: 1800, openTime: '8:00-21:00' },
    { name: '美宜佳', icon: '🏪', type: 'shop', category: '便利店', popularity: 68, dailyRevenue: 3500, openTime: '6:00-24:00' }
  ],
  industrial: [
    { name: '京东物流', icon: '🚚', type: 'factory', category: '物流', popularity: 70, dailyRevenue: 60000, openTime: '24小时' },
    { name: '顺丰速运', icon: '✈️', type: 'factory', category: '物流', popularity: 75, dailyRevenue: 80000, openTime: '24小时' },
    { name: '富士康', icon: '🏭', type: 'factory', category: '制造业', popularity: 65, dailyRevenue: 100000, openTime: '24小时' },
    { name: '比亚迪工厂', icon: '🚗', type: 'factory', category: '汽车制造', popularity: 80, dailyRevenue: 150000, openTime: '24小时' },
    { name: '阿里云数据中心', icon: '☁️', type: 'factory', category: '科技', popularity: 85, dailyRevenue: 200000, openTime: '24小时' }
  ],
  agricultural: [
    { name: '有机农场', icon: '🌾', type: 'farm', category: '农业', popularity: 65, dailyRevenue: 15000, openTime: '5:00-18:00' },
    { name: '果园采摘', icon: '🍑', type: 'farm', category: '观光农业', popularity: 70, dailyRevenue: 12000, openTime: '8:00-17:00' },
    { name: '生态养殖', icon: '🐄', type: 'farm', category: '养殖', popularity: 60, dailyRevenue: 20000, openTime: '6:00-18:00' },
    { name: '花卉基地', icon: '🌺', type: 'farm', category: '花卉', popularity: 75, dailyRevenue: 18000, openTime: '7:00-18:00' }
  ]
}

export const FAMOUS_BRANDS = [
  { name: '国贸商城', icon: '🛍️', type: 'mall', floors: 6, popularity: 95, dailyRevenue: 200000 },
  { name: '太古里', icon: '🏬', type: 'mall', floors: 4, popularity: 92, dailyRevenue: 180000 },
  { name: '王府井百货', icon: '🏢', type: 'mall', floors: 8, popularity: 88, dailyRevenue: 150000 },
  { name: '西单大悦城', icon: '🎪', type: 'mall', floors: 10, popularity: 90, dailyRevenue: 170000 },
  { name: 'SKP', icon: '💎', type: 'mall', floors: 7, popularity: 96, dailyRevenue: 250000 },
  { name: '万达广场', icon: '🏙️', type: 'mall', floors: 5, popularity: 85, dailyRevenue: 140000 }
]

// 城市配置
export const CITY_CONFIGS: Record<string, CityConfig> = {
  beijing: {
    gridSize: { width: 20, height: 15 },
    landmarks: [
      {
        id: 'tiananmen',
        name: '天安门广场',
        coordinates: { x: 9, y: 7 },
        size: { width: 2, height: 2 },
        icon: '🏛️',
        type: 'landmark',
        building: { type: 'landmark', name: '天安门', icon: '🏛️', level: 5, popularity: 100 }
      },
      {
        id: 'forbidden-city',
        name: '故宫',
        coordinates: { x: 9, y: 5 },
        size: { width: 2, height: 2 },
        icon: '🏯',
        type: 'protected',
        building: { type: 'landmark', name: '紫禁城', icon: '🏯', level: 5, popularity: 100 }
      },
      {
        id: 'guomao',
        name: '国贸CBD',
        coordinates: { x: 13, y: 8 },
        size: { width: 3, height: 2 },
        icon: '🏢',
        type: 'special',
        building: { type: 'office', name: '国贸中心', icon: '🏢', level: 5, floors: 80, popularity: 90 }
      },
      {
        id: 'birds-nest',
        name: '鸟巢',
        coordinates: { x: 6, y: 3 },
        size: { width: 2, height: 2 },
        icon: '🏟️',
        type: 'landmark',
        building: { type: 'landmark', name: '国家体育场', icon: '🏟️', level: 5, popularity: 85 }
      }
    ],
    subwayStations: [
      { name: '天安门东', x: 11, y: 7, lines: ['1号线'] },
      { name: '国贸', x: 14, y: 8, lines: ['1号线', '10号线'] },
      { name: '三里屯', x: 12, y: 6, lines: ['10号线'] },
      { name: '中关村', x: 5, y: 4, lines: ['4号线'] },
      { name: '西单', x: 7, y: 7, lines: ['1号线', '4号线'] },
      { name: '朝阳门', x: 12, y: 7, lines: ['2号线', '6号线'] },
      { name: '奥林匹克公园', x: 6, y: 2, lines: ['8号线', '15号线'] }
    ],
    waterBodies: [
      { name: '什刹海', type: 'lake', x: 8, y: 4, width: 2, height: 1 },
      { name: '北海', type: 'lake', x: 9, y: 3, width: 1, height: 1 }
    ],
    businessDistricts: [
      { name: '国贸CBD', center: { x: 14, y: 8 }, radius: 2, type: 'CBD' },
      { name: '中关村', center: { x: 5, y: 4 }, radius: 2, type: 'tech' },
      { name: '王府井', center: { x: 10, y: 7 }, radius: 1.5, type: 'shopping' },
      { name: '三里屯', center: { x: 12, y: 6 }, radius: 1.5, type: 'shopping' }
    ]
  },
  shanghai: {
    gridSize: { width: 20, height: 15 },
    landmarks: [
      {
        id: 'oriental-pearl',
        name: '东方明珠',
        coordinates: { x: 10, y: 8 },
        size: { width: 1, height: 2 },
        icon: '🗼',
        type: 'landmark',
        building: { type: 'landmark', name: '东方明珠塔', icon: '🗼', level: 5, popularity: 95 }
      },
      {
        id: 'bund',
        name: '外滩',
        coordinates: { x: 9, y: 8 },
        size: { width: 1, height: 3 },
        icon: '🌉',
        type: 'protected',
        building: { type: 'landmark', name: '外滩建筑群', icon: '🌉', level: 5, popularity: 100 }
      }
    ],
    subwayStations: [
      { name: '人民广场', x: 9, y: 7, lines: ['1号线', '2号线', '8号线'] },
      { name: '陆家嘴', x: 11, y: 8, lines: ['2号线', '14号线'] },
      { name: '静安寺', x: 7, y: 7, lines: ['2号线', '7号线'] }
    ],
    waterBodies: [
      { name: '黄浦江', type: 'river', x: 10, y: 0, width: 1, height: 15 }
    ]
  }
}

// 动画配置
export const ANIMATION_CONFIG = {
  spring: {
    type: "spring",
    damping: 25,
    stiffness: 300
  },
  smooth: {
    duration: 0.3,
    ease: "easeInOut"
  },
  fast: {
    duration: 0.15,
    ease: "easeOut"
  }
}

// 价格区间配置
export const PRICE_RANGES = [
  { value: 'all', label: '不限价格', min: 0, max: Infinity },
  { value: '0-5', label: '5万以下', min: 0, max: 50000 },
  { value: '5-10', label: '5-10万', min: 50000, max: 100000 },
  { value: '10-20', label: '10-20万', min: 100000, max: 200000 },
  { value: '20-50', label: '20-50万', min: 200000, max: 500000 },
  { value: '50+', label: '50万以上', min: 500000, max: Infinity }
]

// 热力图配置
export const HEATMAP_CONFIG = {
  price: {
    name: '价格分布',
    icon: '💰',
    colors: {
      low: 'rgba(34, 197, 94, ',
      medium: 'rgba(251, 191, 36, ',
      high: 'rgba(239, 68, 68, '
    }
  },
  traffic: {
    name: '人流热度',
    icon: '🔥',
    colors: {
      low: 'rgba(59, 130, 246, ',
      medium: 'rgba(251, 146, 60, ',
      high: 'rgba(239, 68, 68, '
    }
  },
  yield: {
    name: '收益率',
    icon: '📈',
    colors: {
      low: 'rgba(156, 163, 175, ',
      medium: 'rgba(34, 197, 94, ',
      high: 'rgba(168, 85, 247, '
    }
  }
}

// 成就系统配置
export const ACHIEVEMENTS = {
  firstPurchase: {
    id: 'first_purchase',
    name: '初次置业',
    description: '购买第一块地块',
    icon: '🏆',
    points: 100
  },
  landBaron: {
    id: 'land_baron',
    name: '地产大亨',
    description: '拥有10块地块',
    icon: '👑',
    points: 500
  },
  millionaire: {
    id: 'millionaire',
    name: '百万富翁',
    description: '总资产超过100万',
    icon: '💎',
    points: 1000
  },
  shopMaster: {
    id: 'shop_master',
    name: '商业帝国',
    description: '拥有20个商店',
    icon: '🏪',
    points: 800
  }
}

// 新手引导配置
export const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: '欢迎来到平行世界',
    content: '在这个虚拟的世界中，您可以购买地块、建设商店、赚取收益，打造属于您的商业帝国！',
    position: 'center',
    highlight: null
  },
  {
    id: 'plot_types',
    title: '了解地块类型',
    content: '不同颜色代表不同类型的地块：蓝色住宅、橙色商业、绿色工业等，每种都有独特的收益特点。',
    position: 'left',
    highlight: 'plot-grid'
  },
  {
    id: 'plot_status',
    title: '地块状态',
    content: '绿色边框表示可购买，灰色表示已售出，金色是地标建筑。点击地块查看详情。',
    position: 'left',
    highlight: 'available-plot'
  },
  {
    id: 'filters',
    title: '筛选功能',
    content: '使用左侧筛选面板快速找到心仪的地块，支持按类型、价格、位置等多维度筛选。',
    position: 'right',
    highlight: 'filter-panel'
  },
  {
    id: 'heatmap',
    title: '数据可视化',
    content: '开启热力图可以直观看到价格分布、人流热度等数据，帮助您做出明智的投资决策。',
    position: 'right',
    highlight: 'heatmap-toggle'
  }
]

// 交易状态
export const TRANSACTION_STATUS = {
  pending: { label: '待确认', color: 'text-yellow-500' },
  success: { label: '成功', color: 'text-green-500' },
  failed: { label: '失败', color: 'text-red-500' },
  cancelled: { label: '已取消', color: 'text-gray-500' }
}

// 货币配置
export const CURRENCY = {
  TDB: {
    name: 'TDB',
    symbol: '₮',
    color: 'text-gold-500',
    description: '平行世界通用货币'
  },
  YLD: {
    name: 'YLD',
    symbol: '¥',
    color: 'text-green-500',
    description: '收益代币'
  }
}
