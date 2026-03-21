"use client"

import { useEffect, useState } from "react"
import { BackendShell } from "@/components/backend-shell"
import { ZlCandlestickChart } from "@/components/chart/ZlCandlestickChart"
import { ProbabilitySurface } from "@/components/dashboard/ProbabilitySurface"
import { RegimeAnalysisChart } from "@/components/dashboard/RegimeAnalysisChart"
import { MarketRiskFactors } from "@/components/dashboard/MarketRiskFactors"
import { useZlLivePrice } from "@/lib/hooks/useZlLivePrice"
import type { TargetZone } from "@/lib/contracts/api"

export default function DashboardPage() {
  const { live } = useZlLivePrice()
  const [targetZones, setTargetZones] = useState<TargetZone[]>([])

  useEffect(() => {
    fetch("/api/zl/target-zones")
      .then((r) => r.json())
      .then((res) => { if (res.ok && res.data) setTargetZones(res.data) })
      .catch(() => {})
  }, [])

  return (
    <BackendShell>
      {/* Live Price Status Bar */}
      {live && (
        <div className="flex items-center gap-3 px-4 py-2 border-b border-white/5 bg-black/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-white/50">ZL Live</span>
          <span className="text-sm font-mono text-white font-semibold">
            {live.price.toFixed(2)}
          </span>
          <span className="text-[10px] text-white/30">
            {new Date(live.observedAt).toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* SECTION 1: HERO CHART */}
      <div>
        <ZlCandlestickChart height="80vh" targetZones={targetZones} />
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
      <MarketRiskFactors />
    </BackendShell>
  )
}
