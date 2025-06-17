'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { useState } from 'react'
import { cn } from '@/lib/utils'

// NFT土地类型数据
const landTypes = [
  {
    id: 'city',
    name: '城市地块',
    size: '300平方米/块',
    icon: '🏙️',
    color: '#FFD700',
    features: ['建造房屋', '开设商店', '收取租金'],
    price: '10,000',
    monthlyReturn: '8-12%',
    description: '黄金地段，寸土寸金',
    hotSpots: ['北京CBD', '上海陆家嘴', '深圳前海'],
  },
  {
    id: 'farm',
    name: '农业用地',
    size: '1000平方米/块',
    icon: '🌾',
    color: '#00D4AA',
    features: ['种植作物', '生产粮食', '稳定收益'],
    price: '5,000',
    monthlyReturn: '5-8%',
    description: '民以食为天，粮食硬通货',
    hotSpots: ['东北平原', '华北平原', '长江流域'],
  },
  {
    id: 'mine',
    name: '矿山土地',
    size: '5000平方米起',
    icon: '⛰️',
    color: '#8B4513',
    features: ['开采矿产', '生产资源', '高额回报'],
    price: '20,000',
    monthlyReturn: '10-15%',
    description: '资源为王，挖矿致富',
    hotSpots: ['铁矿山', '陨石矿', '森林资源'],
  },
]

// 矿产资源类型
const resourceTypes = [
  { name: '铁矿', icon: '⚒️', color: '#708090', yield: '100/天' },
  { name: '木材', icon: '🪵', color: '#8B4513', yield: '80/天' },
  { name: '石矿', icon: '🪨', color: '#696969', yield: '120/天' },
  { name: 'YLD积分', icon: '💎', color: '#9370DB', yield: '10/天' },
]

// 热门地块数据
const hotLands = [
  {
    id: 1,
    location: '北京·朝阳区',
    type: 'city',
    price: 15000,
    owner: '王富贵',
    appreciation: '+23.5%',
    status: 'rented',
  },
  {
    id: 2,
    location: '东北·黑土地',
    type: 'farm',
    price: 8000,
    owner: '张大户',
    appreciation: '+15.2%',
    status: 'farming',
  },
  {
    id: 3,
    location: '山西·铁矿山',
    type: 'mine',
    price: 35000,
    owner: '矿业大亨',
    appreciation: '+45.8%',
    status: 'mining',
  },
]

// 2D像素地图组件
function PixelMap({ activeType }: { activeType: string }) {
  const mapData = [
    ['city', 'city', 'farm', 'farm', 'mine'],
    ['city', 'city', 'farm', 'farm', 'mine'],
    ['farm', 'farm', 'farm', 'mine', 'mine'],
    ['farm', 'farm', 'mine', 'mine', 'mine'],
    ['mine', 'mine', 'mine', 'forest', 'forest'],
  ]

  return (
    <svg viewBox="0 0 500 500" className="w-full h-full">
      {/* 网格背景 */}
      <defs>
        <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#333" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="500" height="500" fill="url(#grid)" />

      {/* 地块 */}
      {mapData.map((row, y) => 
        row.map((type, x) => {
          const isActive = type === activeType
          const colors = {
            city: '#FFD700',
            farm: '#00D4AA',
            mine: '#8B4513',
            forest: '#228B22',
          }
          
          return (
            <motion.rect
              key={`${x}-${y}`}
              x={x * 100}
              y={y * 100}
              width="100"
              height="100"
              fill={colors[type as keyof typeof colors]}
              fillOpacity={isActive ? 0.8 : 0.3}
              stroke={isActive ? '#FFF' : '#666'}
              strokeWidth={isActive ? 3 : 1}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: (x + y) * 0.05 }}
              whileHover={{ fillOpacity: 1 }}
              className="cursor-pointer"
            />
          )
        })
      )}

      {/* 地标 */}
      <text x="150" y="150" textAnchor="middle" fill="#000" fontSize="12" fontWeight="bold">
        CBD
      </text>
      <text x="350" y="250" textAnchor="middle" fill="#000" fontSize="12" fontWeight="bold">
        农场
      </text>
      <text x="350" y="450" textAnchor="middle" fill="#FFF" fontSize="12" fontWeight="bold">
        矿山
      </text>
    </svg>
  )
}

export function NFTAssetsSection() {
  const [activeType, setActiveType] = useState('city')
  const [selectedResource, setSelectedResource] = useState(0)

  const activeLand = landTypes.find(land => land.id === activeType)!

  return (
    <section className="py-24 lg:py-32 bg-[#0F0F1E] relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 pixel-grid opacity-10" />
      
      <Container>
        {/* 标题 */}
        <motion.div
          className="text-center max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-3 text-gold-500 text-sm font-bold uppercase tracking-wider mb-6">
            <span className="w-8 h-1 bg-gold-500" />
            <span className="pixel-font">NFT ASSETS</span>
            <span className="w-8 h-1 bg-gold-500" />
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
            <span className="block mb-2">买地当地主</span>
            <span className="text-gold-500 pixel-text-shadow">数字地产 永久产权</span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-400">
            每一寸土地都映射真实坐标，每一份收益都来自实际生产
            <br />
            <span className="text-gold-500 font-bold">北斗定位认证，区块链确权，永不可篡改</span>
          </p>
        </motion.div>

        {/* 土地类型选择 */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {landTypes.map((land, index) => (
            <motion.div
              key={land.id}
              className={cn(
                'pixel-card p-6 cursor-pointer transition-all duration-300',
                activeType === land.id ? 'border-gold-500 scale-105' : 'border-gray-700'
              )}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setActiveType(land.id)}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{land.icon}</span>
                <span className="text-xs px-3 py-1 bg-gold-500/20 text-gold-500 font-bold">
                  {land.monthlyReturn}月收益
                </span>
              </div>
              
              <h3 className="text-xl font-black mb-2" style={{ color: land.color }}>
                {land.name}
              </h3>
              <p className="text-sm text-gray-400 mb-1">{land.size}</p>
              <p className="text-xs text-gray-500 mb-4">{land.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">起售价</span>
                <span className="text-lg font-bold text-gold-500">¥{land.price}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 主展示区 */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* 左侧：地图 */}
          <motion.div
            className="pixel-card p-8"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-black mb-6 text-center">
              平行世界地图预览
            </h3>
            <div className="aspect-square">
              <PixelMap activeType={activeType} />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gold-500" />
                <span>城市地块</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#00D4AA]" />
                <span>农业用地</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#8B4513]" />
                <span>矿山资源</span>
              </div>
            </div>
          </motion.div>

          {/* 右侧：详情 */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {/* 土地特性 */}
            <div className="pixel-card p-6">
              <h4 className="text-lg font-black mb-4 flex items-center gap-2">
                <span>{activeLand.icon}</span>
                <span style={{ color: activeLand.color }}>{activeLand.name}特性</span>
              </h4>
              <div className="space-y-3">
                {activeLand.features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="text-gold-500 text-lg">✓</span>
                    <span className="text-gray-300">{feature}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gold-500/10 rounded">
                <div className="text-sm text-gray-400 mb-2">热门地段</div>
                <div className="flex flex-wrap gap-2">
                  {activeLand.hotSpots.map(spot => (
                    <span key={spot} className="text-xs px-3 py-1 bg-gold-500/20 text-gold-500 font-bold">
                      {spot}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 产出资源 */}
            {activeType === 'mine' && (
              <div className="pixel-card p-6">
                <h4 className="text-lg font-black mb-4">矿产资源产出</h4>
                <div className="grid grid-cols-2 gap-4">
                  {resourceTypes.map((resource, index) => (
                    <motion.div
                      key={resource.name}
                      className={cn(
                        'p-4 border-2 cursor-pointer transition-all',
                        selectedResource === index ? 'border-gold-500' : 'border-gray-700'
                      )}
                      onClick={() => setSelectedResource(index)}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{resource.icon}</span>
                        <div>
                          <div className="font-bold" style={{ color: resource.color }}>
                            {resource.name}
                          </div>
                          <div className="text-xs text-gray-500">{resource.yield}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* 收益计算 */}
            <div className="pixel-card p-6 bg-gradient-to-br from-gold-500/20 to-transparent">
              <h4 className="text-lg font-black mb-4">预估收益</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">日收益</span>
                  <span className="font-bold text-gold-500">¥300-500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">月收益</span>
                  <span className="font-bold text-gold-500">¥9,000-15,000</span>
                </div>
                <div className="h-px bg-gold-500/30 my-3" />
                <div className="flex justify-between">
                  <span className="text-gray-400">投资回报率</span>
                  <span className="text-2xl font-black text-gold-500">
                    {activeLand.monthlyReturn}
                  </span>
                </div>
              </div>
              
              <motion.button
                className="w-full mt-6 pixel-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                立即购买{activeLand.name}
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* 热门地块 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-black text-center mb-8">
            <span className="text-gold-500">热门地块</span>
            <span className="text-sm block mt-2 text-gray-400 font-normal">
              看看大家都在买什么
            </span>
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {hotLands.map((land, index) => {
              const landType = landTypes.find(t => t.id === land.type)!
              return (
                <motion.div
                  key={land.id}
                  className="pixel-card p-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{landType.icon}</span>
                    <span className={cn(
                      'text-xs px-2 py-1 font-bold',
                      land.status === 'rented' && 'bg-green-500/20 text-green-500',
                      land.status === 'farming' && 'bg-blue-500/20 text-blue-500',
                      land.status === 'mining' && 'bg-orange-500/20 text-orange-500'
                    )}>
                      {land.status === 'rented' && '已出租'}
                      {land.status === 'farming' && '种植中'}
                      {land.status === 'mining' && '开采中'}
                    </span>
                  </div>
                  
                  <h4 className="font-bold mb-1">{land.location}</h4>
                  <p className="text-xs text-gray-500 mb-3">地主：{land.owner}</p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400">当前价值</div>
                      <div className="text-lg font-bold text-gold-500">¥{land.price.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">涨幅</div>
                      <div className="text-lg font-bold text-green-500">{land.appreciation}</div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="pixel-card inline-block p-8">
            <h3 className="text-2xl font-black mb-4">
              <span className="text-gold-500">开始你的地主生涯</span>
            </h3>
            <p className="text-gray-400 mb-6">
              限量发行，先到先得
              <br />
              每块土地都是独一无二的NFT资产
            </p>
            <motion.button
              className="pixel-btn text-lg px-10 py-5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">🏰</span>
              查看所有地块
            </motion.button>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
