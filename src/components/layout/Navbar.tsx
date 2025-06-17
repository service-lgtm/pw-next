'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Gold Standard', href: '#gold' },
  { label: 'Features', href: '#features' },
  { label: 'Economy', href: '#economy' },
  { label: 'Docs', href: '#docs' },
]

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
          ? 'bg-black/80 backdrop-blur-xl border-b border-gray-800' 
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
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gold-500 rounded flex items-center justify-center font-bold text-black text-lg md:text-xl transition-transform group-hover:scale-110">
              P
            </div>
            <span className="font-bold text-lg md:text-xl">Parallel World</span>
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
            <Button size="sm">Launch App</Button>
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
                <Button size="sm" className="w-full">Launch App</Button>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
