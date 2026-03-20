"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface LivePrice {
  price: number
  observedAt: string
}

interface DriverAttribution {
  factor: string
  contribution: number
  confidence: number
}

interface RegimeData {
  regime: string
  confidence: number
}

interface TargetZone {
  horizonDays: number
  p30: number
  p50: number
  p70: number
}

function RiskScoreBar({ score, label }: { score: number | null; label: string }) {
  if (score == null) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 rounded-full bg-muted" />
        <span className="text-2xl font-bold text-muted-foreground tabular-nums">—</span>
      </div>
    )
  }

  const color =
    score <= 30 ? "bg-emerald-500" : score <= 60 ? "bg-amber-500" : "bg-red-500"
  const textColor =
    score <= 30 ? "text-emerald-400" : score <= 60 ? "text-amber-400" : "text-red-400"

  return (
    <div>
      <div className="flex items-center gap-4 mb-1">
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${color}`}
            style={{ width: `${Math.min(score, 100)}%` }}
          />
        </div>
        <span className="text-2xl font-bold tabular-nums">{score}</span>
      </div>
      <span className={`text-sm font-medium ${textColor}`}>{label}</span>
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-mono font-medium">{value}</span>
    </div>
  )
}

function SpecialistCard({
  title,
  score,
  statusLabel,
  metrics,
  narrative,
}: {
  title: string
  score: number | null
  statusLabel: string
  metrics: { label: string; value: string }[]
  narrative: string | null
}) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RiskScoreBar score={score} label={statusLabel} />
        <div className="divide-y divide-border/50">
          {metrics.map((m) => (
            <MetricRow key={m.label} label={m.label} value={m.value} />
          ))}
        </div>
        {narrative && (
          <p className="text-sm text-muted-foreground leading-relaxed">{narrative}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardCards() {
  const [livePrice, setLivePrice] = useState<LivePrice | null>(null)
  const [regime, setRegime] = useState<RegimeData | null>(null)
  const [drivers, setDrivers] = useState<DriverAttribution[]>([])
  const [targetZones, setTargetZones] = useState<TargetZone[]>([])

  useEffect(() => {
    Promise.allSettled([
      fetch("/api/zl/live").then((r) => r.json()),
      fetch("/api/dashboard/regime").then((r) => r.json()),
      fetch("/api/dashboard/drivers").then((r) => r.json()),
      fetch("/api/zl/target-zones").then((r) => r.json()),
    ]).then(([live, reg, drv, tz]) => {
      if (live.status === "fulfilled" && live.value.data)
        setLivePrice(live.value.data)
      if (reg.status === "fulfilled" && reg.value.data)
        setRegime(reg.value.data)
      if (drv.status === "fulfilled" && drv.value.data)
        setDrivers(drv.value.data)
      if (tz.status === "fulfilled" && tz.value.data)
        setTargetZones(tz.value.data)
    })
  }, [])

  return (
    <div className="px-4 lg:px-6 space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold">Market Risk Factors</h2>
        <Badge variant="outline" className="text-xs">Key Drivers</Badge>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 gap-4 @xl/main:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="py-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">ZL Price</div>
            <div className="text-2xl font-bold tabular-nums mt-1">
              {livePrice ? livePrice.price.toFixed(2) : "—"}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="py-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Regime</div>
            <div className="text-2xl font-bold mt-1">
              {regime ? regime.regime : "—"}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="py-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Top Driver</div>
            <div className="text-2xl font-bold mt-1">
              {drivers[0] ? drivers[0].factor : "—"}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="py-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              {targetZones[0] ? `${targetZones[0].horizonDays}d Target` : "Target"}
            </div>
            <div className="text-2xl font-bold tabular-nums mt-1">
              {targetZones[0] ? targetZones[0].p50.toFixed(2) : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Specialist Risk Cards — 2-column grid matching V15 */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
        <SpecialistCard
          title="Market Volatility"
          score={null}
          statusLabel="Awaiting data"
          metrics={[
            { label: "VIX Index", value: "—" },
            { label: "Oil Volatility (OVX)", value: "—" },
          ]}
          narrative={null}
        />
        <SpecialistCard
          title="Crush Margins"
          score={null}
          statusLabel="Awaiting data"
          metrics={[
            { label: "Crush Margin", value: "—" },
            { label: "Oil Value Share", value: "—" },
            { label: "5-Day Change", value: "—" },
          ]}
          narrative={null}
        />
        <SpecialistCard
          title="China / Trade Risk"
          score={null}
          statusLabel="Awaiting data"
          metrics={[
            { label: "Yuan Rate (CNY/USD)", value: "—" },
            { label: "China/Soy Headlines", value: "—" },
          ]}
          narrative={null}
        />
        <SpecialistCard
          title="Policy Risk"
          score={null}
          statusLabel="Awaiting data"
          metrics={[
            { label: "Policy Uncertainty", value: "—" },
            { label: "Trade Policy Index", value: "—" },
            { label: "Tariff Headlines", value: "—" },
          ]}
          narrative={null}
        />
        <SpecialistCard
          title="Energy / Oil"
          score={null}
          statusLabel="Awaiting data"
          metrics={[
            { label: "Crude Oil (CL)", value: "—" },
            { label: "5-Day Change", value: "—" },
            { label: "Oil Volatility (OVX)", value: "—" },
            { label: "Energy Headlines", value: "—" },
          ]}
          narrative={null}
        />
        <SpecialistCard
          title="Biofuel / RFS"
          score={null}
          statusLabel="Awaiting data"
          metrics={[
            { label: "RIN Price (D4)", value: "—" },
            { label: "Biodiesel Mandate", value: "—" },
          ]}
          narrative={null}
        />
      </div>
    </div>
  )
}
