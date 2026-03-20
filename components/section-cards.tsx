"use client"

import { useEffect, useState } from "react"

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface LivePrice {
  price: number
  observedAt: string
}

interface RegimeData {
  regime: string
  confidence: number
}

export function SectionCards() {
  const [livePrice, setLivePrice] = useState<LivePrice | null>(null)
  const [regime, setRegime] = useState<RegimeData | null>(null)
  const [drivers, setDrivers] = useState<{ factor: string; contribution: number }[]>([])
  const [targetZones, setTargetZones] = useState<{ horizonDays: number; p50: number }[]>([])

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

  const topDriver = drivers[0]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* ZL Live Price */}
      <Card>
        <CardHeader>
          <CardDescription>ZL Soybean Oil</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {livePrice ? livePrice.price.toFixed(2) : "—"}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            {livePrice
              ? `Updated ${new Date(livePrice.observedAt).toLocaleDateString()}`
              : "Awaiting price data"}
          </div>
        </CardFooter>
      </Card>

      {/* Regime */}
      <Card>
        <CardHeader>
          <CardDescription>Market Regime</CardDescription>
          <CardTitle className="text-2xl font-semibold @[250px]/card:text-3xl">
            {regime ? regime.regime : "—"}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            {regime
              ? `${(regime.confidence * 100).toFixed(0)}% confidence`
              : "Awaiting regime data"}
          </div>
        </CardFooter>
      </Card>

      {/* Top Driver */}
      <Card>
        <CardHeader>
          <CardDescription>Top Driver</CardDescription>
          <CardTitle className="text-2xl font-semibold @[250px]/card:text-3xl">
            {topDriver ? topDriver.factor : "—"}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            {topDriver ? (
              <Badge variant={topDriver.contribution > 0 ? "default" : "destructive"}>
                {topDriver.contribution > 0 ? "+" : ""}
                {topDriver.contribution.toFixed(1)}%
              </Badge>
            ) : (
              "Awaiting driver data"
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Target Zone (nearest horizon) */}
      <Card>
        <CardHeader>
          <CardDescription>
            {targetZones[0] ? `${targetZones[0].horizonDays}d Target` : "Target Zone"}
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {targetZones[0] ? targetZones[0].p50.toFixed(2) : "—"}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            {targetZones[0] ? "P50 median forecast" : "Awaiting forecast data"}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
