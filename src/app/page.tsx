import { Navbar } from '@/components/layout/Navbar'
import { HeroSection } from '@/components/sections/HeroSection'
import { GoldStandardSection } from '@/components/sections/GoldStandardSection'
import { PixelBackground } from '@/components/effects/PixelBackground'

export default function Home() {
  return (
    <>
      <PixelBackground />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <GoldStandardSection />
        {/* 更多部分可以继续添加 */}
      </main>
    </>
  )
}
