"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PostureData {
  posture: "ACCUMULATE" | "WAIT" | "DEFER"
  rationale: string
}

const POSTURE_CONFIG = {
  ACCUMULATE: { label: "Normal Buying - Buy On Schedule", color: "text-emerald-400", badge: "ZL NEUTRAL" },
  WAIT: { label: "Hold - Monitor Market", color: "text-amber-400", badge: "ZL CAUTIOUS" },
  DEFER: { label: "Defer Purchases - Prices Elevated", color: "text-red-400", badge: "ZL BEARISH" },
}

export function StrategyPostureBar() {
  const [posture, setPosture] = useState<PostureData | null>(null)

  useEffect(() => {
    fetch("/api/strategy/posture")
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setPosture(res.data)
      })
      .catch(() => {})
  }, [])

  if (!posture) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex items-center justify-between py-4">
          <span className="text-muted-foreground text-sm">Awaiting strategy posture data</span>
        </CardContent>
      </Card>
    )
  }

  const config = POSTURE_CONFIG[posture.posture]

  return (
    <Card className="border-border/50">
      <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 rounded-full bg-current" style={{ color: config.color.includes("emerald") ? "#34d399" : config.color.includes("amber") ? "#fbbf24" : "#f87171" }} />
          <span className={`text-lg font-semibold tracking-tight ${config.color}`}>
            {config.label}
          </span>
        </div>
        <Badge variant="outline" className="w-fit">{config.badge}</Badge>
      </CardContent>
      {posture.rationale && (
        <CardContent className="pt-0 pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{posture.rationale}</p>
        </CardContent>
      )}
    </Card>
  )
}
