// src/app/dashboard/settings/page.tsx
// 账户设置页面

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { ProfileSection } from '@/components/settings/ProfileSection'
import { PasswordSection } from '@/components/settings/PasswordSection'
import { PaymentPasswordSection } from '@/components/settings/PaymentPasswordSection'
import { TeamSection } from '@/components/settings/TeamSection'
import { AddressSection } from '@/components/settings/AddressSection'
import { cn } from '@/lib/utils'

type TabType = 'profile' | 'password' | 'payment' | 'team' | 'address'

const tabs: { id: TabType; label: string; icon: string }[] = [
  { id: 'profile', label: '个人资料', icon: '👤' },
  { id: 'password', label: '登录密码', icon: '🔐' },
  { id: 'payment', label: '支付密码', icon: '💳' },
  { id: 'team', label: '团队信息', icon: '👥' },
  { id: 'address', label: '收货地址', icon: '📍' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile')

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-black text-white">
          账户设置
        </h1>
        <p className="text-gray-400 mt-1">
          管理您的账户信息和安全设置
        </p>
      </motion.div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* 左侧导航 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-1"
        >
          <PixelCard className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded transition-all",
                    "hover:bg-gray-800",
                    activeTab === tab.id
                      ? "bg-gold-500/20 text-gold-500 font-bold"
                      : "text-gray-400"
                  )}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </nav>
          </PixelCard>
        </motion.div>

        {/* 右侧内容 */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="md:col-span-3"
        >
          {activeTab === 'profile' && <ProfileSection />}
          {activeTab === 'password' && <PasswordSection />}
          {activeTab === 'payment' && <PaymentPasswordSection />}
          {activeTab === 'team' && <TeamSection />}
          {activeTab === 'address' && <AddressSection />}
        </motion.div>
      </div>
    </div>
  )
}
