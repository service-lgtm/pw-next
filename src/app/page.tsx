import { Navbar } from '@/components/layout/Navbar'
import { HeroSection } from '@/components/sections/HeroSection'
import { GoldStandardSection } from '@/components/sections/GoldStandardSection'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <GoldStandardSection />
        {/* Additional sections will be added here */}
      </main>
    </>
  )
}
