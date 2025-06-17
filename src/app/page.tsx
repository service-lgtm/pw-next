import { Navbar } from '@/components/layout/Navbar'
import { HeroSection } from '@/components/sections/HeroSection'
import { GoldStandardSection } from '@/components/sections/GoldStandardSection'
import { EconomySection } from '@/components/sections/EconomySection'
import { NFTAssetsSection } from '@/components/sections/NFTAssetsSection'
import { MiningSystemSection } from '@/components/sections/MiningSystemSection'
import { MarketplaceSection } from '@/components/sections/MarketplaceSection'
import { ProsumerSection } from '@/components/sections/ProsumerSection'
import { RankingSystemSection } from '@/components/sections/RankingSystemSection'
import { OnboardingSection } from '@/components/sections/OnboardingSection'
import { PixelBackground } from '@/components/effects/PixelBackground'

export default function Home() {
  return (
    <>
      <PixelBackground />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <GoldStandardSection />
        <EconomySection />
        <NFTAssetsSection />
        <MiningSystemSection />
        <MarketplaceSection />
        <ProsumerSection />
        <RankingSystemSection />
        <OnboardingSection />
        {/* 更多部分可以继续添加 */}
      </main>
    </>
  )
}
