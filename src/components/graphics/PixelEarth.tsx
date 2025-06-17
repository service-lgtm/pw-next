'use client'

import { motion } from 'framer-motion'

export function PixelEarth() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 600 600" 
        style={{ maxWidth: '600px', margin: '0 auto' }}
        className="drop-shadow-[0_0_50px_rgba(255,215,0,0.3)]"
      >
        <defs>
          <radialGradient id="earthGrad">
            <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
            <stop offset="70%" style={{ stopColor: '#1E40AF', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#0A1628', stopOpacity: 1 }} />
          </radialGradient>
          
          <filter id="pixelate">
            <feFlood x="4" y="4" width="4" height="4" />
            <feComposite width="8" height="8" />
            <feTile result="a" />
            <feComposite in="SourceGraphic" in2="a" operator="in" />
            <feMorphology operator="dilate" radius="4" />
          </filter>
        </defs>
        
        {/* 地球主体 */}
        <motion.circle 
          cx="300" 
          cy="300" 
          r="200" 
          fill="url(#earthGrad)" 
          stroke="#FFD700" 
          strokeWidth="4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />
        
        {/* 北斗卫星轨道 */}
        <motion.ellipse 
          cx="300" 
          cy="300" 
          rx="280" 
          ry="80" 
          fill="none" 
          stroke="#FFD700" 
          strokeWidth="2" 
          opacity="0.3" 
          transform="rotate(-20 300 300)"
          strokeDasharray="5,10"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        >
          <animate attributeName="stroke-dashoffset" values="0;15" dur="2s" repeatCount="indefinite" />
        </motion.ellipse>
        
        <motion.ellipse 
          cx="300" 
          cy="300" 
          rx="320" 
          ry="100" 
          fill="none" 
          stroke="#00D4AA" 
          strokeWidth="1" 
          opacity="0.2" 
          transform="rotate(30 300 300)"
          strokeDasharray="10,5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.7 }}
        >
          <animate attributeName="stroke-dashoffset" values="0;-15" dur="3s" repeatCount="indefinite" />
        </motion.ellipse>
        
        {/* 像素化大陆 - 中国高亮 */}
        <g opacity="0.9">
          <motion.rect 
            x="360" y="240" width="80" height="60" fill="#FFD700"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0.8] }}
            transition={{ duration: 2, delay: 1, times: [0, 0.5, 0.8, 1], repeat: Infinity, repeatDelay: 3 }}
          />
          <motion.rect x="380" y="220" width="40" height="20" fill="#FFD700" />
          <motion.rect x="400" y="300" width="40" height="20" fill="#FFD700" />
          
          {/* 其他大陆 */}
          <rect x="180" y="240" width="60" height="40" fill="#00D4AA" />
          <rect x="200" y="220" width="40" height="20" fill="#00D4AA" />
          <rect x="160" y="260" width="40" height="20" fill="#00D4AA" />
          
          <rect x="280" y="240" width="40" height="30" fill="#00D4AA" />
          <rect x="300" y="220" width="30" height="20" fill="#00D4AA" />
          
          <rect x="280" y="300" width="40" height="80" fill="#00D4AA" />
          <rect x="260" y="320" width="20" height="40" fill="#00D4AA" />
          
          <rect x="200" y="340" width="30" height="60" fill="#00D4AA" />
          <rect x="180" y="360" width="20" height="40" fill="#00D4AA" />
        </g>
        
        {/* 北斗卫星 */}
        <g>
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "300px 300px" }}
          >
            <circle cx="500" cy="200" r="8" fill="#FFD700">
              <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="500" cy="200" r="15" fill="none" stroke="#FFD700" strokeWidth="1" opacity="0.5">
              <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
            </circle>
          </motion.g>
          
          <motion.g
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "300px 300px" }}
          >
            <circle cx="100" cy="400" r="8" fill="#FFD700">
              <animate attributeName="r" values="8;10;8" dur="2.5s" repeatCount="indefinite" />
            </circle>
          </motion.g>
          
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "300px 300px" }}
          >
            <circle cx="450" cy="450" r="8" fill="#FFD700">
              <animate attributeName="r" values="8;10;8" dur="3s" repeatCount="indefinite" />
            </circle>
          </motion.g>
        </g>
        
        {/* 定位信号 */}
        <g opacity="0.6">
          <motion.line 
            x1="400" y1="260" x2="500" y2="200" 
            stroke="#FFD700" 
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
          <motion.line 
            x1="400" y1="260" x2="100" y2="400" 
            stroke="#FFD700" 
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.5, delay: 0.5, repeat: Infinity, repeatDelay: 1 }}
          />
          <motion.line 
            x1="400" y1="260" x2="450" y2="450" 
            stroke="#FFD700" 
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3, delay: 1, repeat: Infinity, repeatDelay: 1 }}
          />
        </g>
        
        {/* 中心标记 */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          <circle cx="400" cy="260" r="5" fill="#FFD700" />
          <circle cx="400" cy="260" r="10" fill="none" stroke="#FFD700" strokeWidth="2" opacity="0.5">
            <animate attributeName="r" values="10;20;10" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
          </circle>
        </motion.g>
        
        {/* 文字标注 */}
        <motion.text 
          x="300" 
          y="550" 
          textAnchor="middle" 
          fill="#FFD700" 
          fontSize="16" 
          fontWeight="bold" 
          className="pixel-font"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
        >
          BEIDOU POSITIONING SYSTEM
        </motion.text>
      </svg>
      
      {/* 浮动数据卡片 */}
      <motion.div
        className="absolute top-10 left-0 pixel-card px-4 py-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 2.5 }}
      >
        <div className="text-xs text-gray-400 mb-1">实时交易量</div>
        <div className="text-xl font-bold text-gold-500 pixel-font">¥2.4M</div>
      </motion.div>
      
      <motion.div
        className="absolute top-1/2 right-0 pixel-card px-4 py-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 2.7 }}
      >
        <div className="text-xs text-gray-400 mb-1">在线用户</div>
        <div className="text-xl font-bold text-gold-500 pixel-font">12,845</div>
      </motion.div>
      
      <motion.div
        className="absolute bottom-10 left-10 pixel-card px-4 py-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 2.9 }}
      >
        <div className="text-xs text-gray-400 mb-1">土地价值</div>
        <div className="text-xl font-bold text-green-400 pixel-font">+15.3%</div>
      </motion.div>
    </div>
  )
}
