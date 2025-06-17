'use client'

import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/utils'

const comparisonData = [
  {
    title: 'Traditional Crypto',
    icon: '📊',
    description: 'Extreme volatility, speculation-driven, no intrinsic value. Your wealth can disappear overnight.',
    features: [
      'Daily volatility ±50%',
      'No real value backing',
      'Market manipulation',
      'High regulatory risk',
    ],
  },
  {
    title: 'Parallel World',
    icon: '🏆',
    description: '100% gold-backed, audited reserves, stable value. Digital convenience with physical security.',
    features: [
      '100% gold reserves',
      'Stable & predictable',
      'Real-time auditing',
      'Global recognition',
      'Millennial trust',
    ],
    featured: true,
  },
  {
    title: 'Fiat Stablecoins',
    icon: '💵',
    description: 'Subject to inflation, centralized control, regulatory risks. Losing 2-8% value annually.',
    features: [
      'Inflation erosion',
      'Centralized control',
      'Policy risks',
      'Freeze risks',
    ],
  },
]

const goldStats = [
  { value: '100%', label: 'Backed by Gold' },
  { value: '24/7', label: 'Audit Reports' },
  { value: '0%', label: 'Inflation Risk' },
  { value: 'AAA', label: 'Security Rating' },
]

export function GoldStandardSection() {
  return (
    <section id="gold" className="py-24 lg:py-32 bg-gray-900">
      <Container>
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 text-gold-500 text-sm font-semibold uppercase tracking-wider mb-6">
            <span className="w-6 h-px bg-gold-500" />
            Why Gold Standard
            <span className="w-6 h-px bg-gold-500" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
            The most trusted store of value<br />
            <span className="text-gold-500">for 5,000 years</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400">
            While crypto volatility destroys wealth, gold maintains its purchasing power across millennia. We bring this stability to the digital age.
          </p>
        </motion.div>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {comparisonData.map((item, index) => (
            <motion.div
              key={item.title}
              className={cn(
                'relative p-8 rounded-lg border transition-all duration-300',
                item.featured
                  ? 'bg-gradient-to-b from-gold-500/10 to-transparent border-gold-500/50 scale-105'
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
              )}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {item.featured && (
                <div className="absolute -top-3 left-8 bg-black px-3 py-1 text-xs font-bold text-gold-500 uppercase tracking-wider">
                  Gold Standard
                </div>
              )}
              
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-gray-400 text-sm mb-6">{item.description}</p>
              
              <ul className="space-y-2">
                {item.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <span className={cn(
                      'text-xs',
                      item.featured ? 'text-gold-500' : 'text-gray-500'
                    )}>
                      ✓
                    </span>
                    <span className={item.featured ? 'text-white' : 'text-gray-400'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Gold Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-700 rounded-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {goldStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-black p-8 text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.05 }}
            >
              <div className="text-3xl md:text-4xl font-mono font-bold text-gold-500 mb-2">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}
