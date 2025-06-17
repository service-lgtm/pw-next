'use client'

import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { ArrowDownIcon } from 'lucide-react'

const stats = [
  { label: 'Total Value Locked', value: 120000000, prefix: '$', change: 12.5 },
  { label: 'Gold Reserves', value: 1250, suffix: 'kg', change: 25 },
  { label: 'Active Users', value: 50000, suffix: '+', change: 8.3 },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-20">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 text-gold-500 text-sm font-semibold uppercase tracking-wider mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="w-6 h-px bg-gold-500" />
              Gold Standard Protocol
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.9] mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Digital Assets
              <br />
              <span className="text-gold-500">Real Value</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-gray-400 mb-8 max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Every token backed by physical gold reserves. Build, trade, and own digital assets with the stability of precious metals.
            </motion.p>

            {/* Gold Price Badge */}
            <motion.div
              className="inline-flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-lg mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="w-10 h-10 bg-gold-500 rounded flex items-center justify-center text-black font-bold text-xl">
                金
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Shanghai Gold Exchange</div>
                <div className="text-xl font-mono font-bold">¥458.32 / gram</div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Button size="lg">Get Started</Button>
              <Button size="lg" variant="secondary">Read Whitepaper</Button>
            </motion.div>
          </motion.div>

          {/* Visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="relative w-full max-w-lg mx-auto">
              <GoldVaultSVG />
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          className="grid md:grid-cols-3 gap-8 mt-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center md:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
            >
              <div className="text-3xl md:text-4xl font-mono font-bold mb-2">
                {stat.prefix}
                {stat.value.toLocaleString()}
                {stat.suffix}
              </div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</div>
              <div className="text-sm text-green-500 font-mono mt-1">
                {formatPercent(stat.change)}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
          <ArrowDownIcon className="w-5 h-5" />
        </div>
      </motion.div>
    </section>
  )
}

function GoldVaultSVG() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 500 500" className="w-full h-auto">
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" className="text-gold-500" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="100%" className="text-gold-500" stopColor="currentColor" stopOpacity="0.2" />
        </linearGradient>
        
        <pattern id="grid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
          <rect width="50" height="50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
        </pattern>
      </defs>
      
      {/* Background grid */}
      <rect width="500" height="500" fill="url(#grid)"/>
      
      {/* Central vault */}
      <rect x="150" y="150" width="200" height="200" fill="none" stroke="#F7931A" strokeWidth="2"/>
      <rect x="170" y="170" width="160" height="160" fill="url(#goldGradient)" opacity="0.1"/>
      
      {/* Orbit rings */}
      <circle cx="250" cy="250" r="220" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
      <circle cx="250" cy="250" r="150" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
      <circle cx="250" cy="250" r="100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      
      {/* Animated data points */}
      <motion.circle
        cx="250"
        cy="30"
        r="4"
        fill="#F7931A"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.circle
        cx="470"
        cy="250"
        r="4"
        fill="#F7931A"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 3, delay: 0.5, repeat: Infinity }}
      />
      <motion.circle
        cx="250"
        cy="470"
        r="4"
        fill="#F7931A"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 3, delay: 1, repeat: Infinity }}
      />
      <motion.circle
        cx="30"
        cy="250"
        r="4"
        fill="#F7931A"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 3, delay: 1.5, repeat: Infinity }}
      />
      
      {/* Center symbol */}
      <text x="250" y="265" textAnchor="middle" fill="#F7931A" fontSize="48" fontWeight="900" fontFamily="sans-serif">
        金
      </text>
    </svg>
  )
}
