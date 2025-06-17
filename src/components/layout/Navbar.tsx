'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const navItems = [
  { label: '金本位体系', href: '#gold' },
  { label: '核心功能', href: '#features' },
  { label: '经济模型', href: '#economy' },
  { label: '文档', href: '#docs' },
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

  return (
    <motion.nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled 
          ? 'bg-black/90 backdrop-blur-xl border-b border-gray-800' 
          : 'bg-transparent'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Container>
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <PixelLogo />
            <span className="font-bold text-lg md:text-xl text-gold-500">平行世界</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-gray-400 hover:text-white transition-colors duration-200 font-medium"
              >
                {item.label}
              </Link>
            ))}
            <Button size="sm" className="bg-gradient-to-r from-gold-500 to-gold-600 text-black hover:from-gold-600 hover:to-gold-700">
              启动应用
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden relative w-8 h-8 flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="flex flex-col gap-1.5">
              <motion.span
                className="block w-6 h-0.5 bg-white"
                animate={{ 
                  rotate: isMobileMenuOpen ? 45 : 0,
                  y: isMobileMenuOpen ? 8 : 0
                }}
              />
              <motion.span
                className="block w-6 h-0.5 bg-white"
                animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
              />
              <motion.span
                className="block w-6 h-0.5 bg-white"
                animate={{ 
                  rotate: isMobileMenuOpen ? -45 : 0,
                  y: isMobileMenuOpen ? -8 : 0
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
            className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-gray-800"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Container>
              <div className="py-4 space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block text-gray-400 hover:text-white transition-colors duration-200 font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Button size="sm" className="w-full bg-gradient-to-r from-gold-500 to-gold-600 text-black">
                  启动应用
                </Button>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
