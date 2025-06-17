import { Navbar } from '@/components/layout/Navbar'
import { HeroSection } from '@/components/sections/HeroSection'
import { GoldStandardSection } from '@/components/sections/GoldStandardSection'
import { NFTAssetsSection } from '@/components/sections/NFTAssetsSection'
import { MiningSystemSection } from '@/components/sections/MiningSystemSection'
import { ProsumerSection } from '@/components/sections/ProsumerSection'
import { PixelBackground } from '@/components/effects/PixelBackground'

export default function Home() {
  return (
    <>
      <PixelBackground />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <GoldStandardSection />
        <NFTAssetsSection />
        <MiningSystemSection />
        <ProsumerSection />
        {/* 更多部分可以继续添加 */}
      </main>
    </>
  )
}
