"use client"

import { BackendShell } from "@/components/backend-shell"
import { ZlCandlestickChart } from "@/components/chart/ZlCandlestickChart"
import { ChrisTop4Drivers } from "@/components/dashboard/ChrisTop4Drivers"

export default function DashboardPage() {
  return (
    <BackendShell>
      {/* SECTION 1: HERO CHART */}
      <div>
        <ZlCandlestickChart height="80vh" />
      </div>

      {/* SECTION 2: Market Risk Factors */}
      <ChrisTop4Drivers />
    </BackendShell>
  )
}
