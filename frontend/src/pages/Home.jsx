import { useEffect, useState } from 'react'
import { HeroSection } from '@/components/home/HeroSection'
import { StatsBar } from '@/components/home/StatsBar'
import { MapPreview } from '@/components/home/MapPreview'
import { RecentReports } from '@/components/home/RecentReports'
import { HowItWorks } from '@/components/home/HowItWorks'
import { CtaBand } from '@/components/home/CtaBand'
import { getPlatformStats } from '@/services/api'
import { platformStats as fallbackStats } from '@/data/mockData'

/** Landing / Home page (Master PRD §3.1). Assembles independent sections. */
export default function Home() {
  const [stats, setStats] = useState(fallbackStats)

  useEffect(() => {
    let alive = true
    getPlatformStats().then((data) => alive && setStats(data))
    return () => {
      alive = false
    }
  }, [])

  return (
    <>
      <HeroSection stats={stats} />
      <StatsBar stats={stats} />
      <MapPreview />
      <RecentReports />
      <HowItWorks />
      <CtaBand />
    </>
  )
}
