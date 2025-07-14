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
        
        {/* 黄金标准 */}
        <section id="gold-standard">
          <GoldStandardSection />
        </section>
        
        {/* 经济体系 */}
        <section id="economy">
          <EconomySection />
        </section>
        
        {/* NFT资产 */}
        <section id="nft-assets">
          <NFTAssetsSection />
        </section>
        
        {/* 挖矿系统 */}
        <section id="mining-system">
          <MiningSystemSection />
        </section>
        
        {/* 市场交易 */}
        <section id="marketplace">
          <MarketplaceSection />
        </section>
        
        {/* 生产消费 */}
        <section id="prosumer">
          <ProsumerSection />
        </section>
        
        {/* 排名系统 */}
        <section id="ranking-system">
          <RankingSystemSection />
        </section>
        
        {/* 新手入门 */}
        <section id="onboarding">
          <OnboardingSection />
        </section>
        
        {/* 更多部分可以继续添加 */}
      </main>
    </>
  )
}
