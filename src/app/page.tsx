import { Navbar } from '@/components/layout/Navbar'
import { HeroSection } from '@/components/sections/HeroSection'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        {/* Additional sections will be added here */}
      </main>
    </>
  )
}
