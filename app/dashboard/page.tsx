"use client"

import { BackendShell } from "@/components/backend-shell"
import { ZlCandlestickChart } from "@/components/chart/ZlCandlestickChart"
import { ProbabilitySurface } from "@/components/dashboard/ProbabilitySurface"
import { RegimeAnalysisChart } from "@/components/dashboard/RegimeAnalysisChart"
import { ChrisTop4Drivers } from "@/components/dashboard/ChrisTop4Drivers"

export default function DashboardPage() {
  return (
    <BackendShell>
      {/* SECTION 1: HERO CHART */}
      <div>
        <ZlCandlestickChart height="80vh" />
      </div>

      {/* SECTION 2: L3 Probability Surface */}
      <div className="w-full">
        <ProbabilitySurface />
      </div>

      {/* SECTION 3: Regime Analysis */}
      <div className="w-full">
        <RegimeAnalysisChart height={350} timeRange="1Y" />
      </div>

      {/* SECTION 4: Market Risk Factors */}
      <ChrisTop4Drivers />
    </BackendShell>
  )
}
