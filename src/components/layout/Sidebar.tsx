// src/components/layout/Sidebar.tsx
// 侧边栏组件

'use client'

import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  FaHome, 
  FaShoppingCart, 
  FaClipboardList, 
  FaWallet,
  FaUsers,
  FaCog,
  FaGift,
  FaChartLine
} from 'react-icons/fa'

interface SidebarItem {
  label: string
  href?: string
  icon: React.ReactNode
  items?: { label: string; href: string }[]
}

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const sidebarItems: SidebarItem[] = [
    {
      label: '仪表盘',
      href: '/dashboard',
      icon: <FaHome className="text-lg" />
    },
    {
      label: '商城',
      icon: <FaShoppingCart className="text-lg" />,
      items: [
        { label: 'TDB商城', href: '/shop/tdb' },
        { label: '我的订单', href: '/shop/orders' }
      ]
    },
    {
      label: '资产管理',
      icon: <FaWallet className="text-lg" />,
      items: [
        { label: '资产总览', href: '/assets' },
        { label: '土地资产', href: '/assets/lands' },
        { label: '交易记录', href: '/assets/transactions' }
      ]
    },
    {
      label: '团队管理',
      icon: <FaUsers className="text-lg" />,
      items: [
        { label: '团队总览', href: '/team' },
        { label: '推广链接', href: '/team/invite' },
        { label: '业绩统计', href: '/team/performance' }
      ]
    },
    {
      label: '数据分析',
      href: '/analytics',
      icon: <FaChartLine className="text-lg" />
    },
    {
      label: '账户设置',
      href: '/settings',
      icon: <FaCog className="text-lg" />
    }
  ]

  return (
    <aside className="w-64 bg-[#0A1628] border-r border-gray-800 min-h-screen p-4">
      {/* Logo */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-yellow-600 rounded-lg flex items-center justify-center font-black text-black text-xl">
            P
          </div>
          <div>
            <h1 className="font-black text-xl text-white">平行世界</h1>
            <p className="text-xs text-gray-400">Parallel World</p>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {sidebarItems.map((item) => (
          <div key={item.label}>
            {item.items ? (
              // 有子菜单的项目
              <div>
                <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <div className="ml-6 space-y-1">
                  {item.items.map((subItem) => (
                    <button
                      key={subItem.href}
                      onClick={() => router.push(subItem.href)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm rounded-md transition-all",
                        pathname === subItem.href
                          ? "text-gold-500 bg-gold-500/10 font-medium"
                          : "text-gray-300 hover:text-white hover:bg-gray-800"
                      )}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // 没有子菜单的项目
              <button
                onClick={() => router.push(item.href!)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all",
                  pathname === item.href
                    ? "text-gold-500 bg-gold-500/10"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            )}
          </div>
        ))}
      </nav>

      {/* 快捷操作 */}
      <div className="mt-8 p-4 bg-gradient-to-br from-gold-500/10 to-yellow-600/10 rounded-lg border border-gold-500/20">
        <h3 className="font-bold text-sm mb-2 text-gold-500">快捷操作</h3>
        <p className="text-xs text-gray-400 mb-3">购买商品获得TDB积分</p>
        <button
          onClick={() => router.push('/shop/tdb')}
          className="w-full px-3 py-2 bg-gold-500 hover:bg-gold-600 text-black font-bold text-sm rounded transition-all"
        >
          进入TDB商城
        </button>
      </div>

      {/* 用户信息 */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-400">当前等级</p>
          <p className="font-bold text-gold-500">黄金会员</p>
          <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-gold-500 to-yellow-500 h-2 rounded-full" style={{ width: '65%' }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">距离下一级还需 3,500 积分</p>
        </div>
      </div>
    </aside>
  )
}
