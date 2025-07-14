'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/utils'

const navItems = [
  { label: '黄金标准', href: '#gold-standard' },
  { label: '经济体系', href: '#economy' },
  { label: 'NFT资产', href: '#nft-assets' },
  { label: '挖矿系统', href: '#mining-system' },
  { label: '市场交易', href: '#marketplace' },
  { label: '生产消费', href: '#prosumer' },
  { label: '排名系统', href: '#ranking-system' },
  { label: '新手入门', href: '#onboarding' },
]

// 像素风格Logo组件
function PixelLogo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      {/* 像素化的P字母 */}
      <rect x="4" y="4" width="4" height="32" fill="#FFD700"/>
      <rect x="8" y="4" width="4" height="4" fill="#FFD700"/>
      <rect x="12" y="4" width="4" height="4" fill="#FFD700"/>
      <rect x="16" y="4" width="4" height="4" fill="#FFD700"/>
      <rect x="16" y="8" width="4" height="4" fill="#FFD700"/>
      <rect x="16" y="12" width="4" height="4" fill="#FFD700"/>
      <rect x="16" y="16" width="4" height="4" fill="#FFD700"/>
      <rect x="12" y="16" width="4" height="4" fill="#FFD700"/>
      <rect x="8" y="16" width="4" height="4" fill="#FFD700"/>
      
      {/* 像素化的W字母 */}
      <rect x="24" y="4" width="4" height="32" fill="#DAA520"/>
      <rect x="28" y="28" width="4" height="4" fill="#DAA520"/>
      <rect x="32" y="24" width="4" height="4" fill="#DAA520"/>
      <rect x="36" y="4" width="4" height="20" fill="#DAA520"/>
      <rect x="32" y="28" width="4" height="4" fill="#DAA520"/>
      <rect x="28" y="32" width="4" height="4" fill="#DAA520"/>
    </svg>
  )
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 平滑滚动到目标元素
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    
    // 如果是锚点链接
    if (href.startsWith('#')) {
      const targetId = href.substring(1)
      const targetElement = document.getElementById(targetId)
      
      if (targetElement) {
        const navHeight = 80 // 导航栏高度
        const targetPosition = targetElement.offsetTop - navHeight
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        })
      }
    }
    
    // 关闭移动端菜单
    setIsMobileMenuOpen(false)
  }

  return (
    <motion.nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled 
          ? 'bg-[#0F0F1E]/98 backdrop-blur-md border-b-4 border-gold-500 shadow-[0_4px_0_0_#DAA520]' 
          : 'bg-transparent'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Container>
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <PixelLogo />
            </motion.div>
            <span className="text-2xl font-black text-gold-500 pixel-text-shadow-sm">
              平行世界
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <a
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="text-gray-300 hover:text-gold-500 transition-all duration-200 font-bold text-sm tracking-wider relative group cursor-pointer"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-1 bg-gold-500 transition-all duration-300 group-hover:w-full" />
                </a>
              </motion.div>
            ))}
            <Link href="/login">
              <motion.button
                className="pixel-btn text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                立即体验
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden relative w-10 h-10 flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="flex flex-col gap-1">
              <motion.span
                className="block w-6 h-1 bg-gold-500"
                animate={{ 
                  rotate: isMobileMenuOpen ? 45 : 0,
                  y: isMobileMenuOpen ? 5 : 0
                }}
              />
              <motion.span
                className="block w-6 h-1 bg-gold-500"
                animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
              />
              <motion.span
                className="block w-6 h-1 bg-gold-500"
                animate={{ 
                  rotate: isMobileMenuOpen ? -45 : 0,
                  y: isMobileMenuOpen ? -5 : 0
                }}
              />
            </div>
          </button>
        </div>
      </Container>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden absolute top-full left-0 right-0 bg-[#0F0F1E]/98 backdrop-blur-xl border-b-4 border-gold-500"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Container>
              <div className="py-6 space-y-4">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block text-gray-300 hover:text-gold-500 font-bold py-2 cursor-pointer"
                    onClick={(e) => handleNavClick(e, item.href)}
                  >
                    {item.label}
                  </a>
                ))}
                <Link href="/login">
                  <button className="pixel-btn w-full text-sm">
                    立即体验
                  </button>
                </Link>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
