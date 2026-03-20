'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'

interface StrategyPosture {
  posture: 'ACCUMULATE' | 'WAIT' | 'DEFER'
  rationale: string
  updatedAt: string
}

export default function StrategyPage() {
  const [posture, setPosture] = useState<StrategyPosture | null>(null)

  useEffect(() => {
    fetch('/api/strategy/posture')
      .then(r => r.json())
      .then(res => { if (res.data) setPosture(res.data) })
      .catch(() => {})
  }, [])

  const postureColor = posture?.posture === 'ACCUMULATE'
    ? 'var(--signal-positive)'
    : posture?.posture === 'DEFER'
      ? 'var(--signal-negative)'
      : 'var(--signal-warning)'

  return (
    <main className="main-content">
      <div className="page-wrapper">
        <div className="page-header">
          <h1 className="page-title">Strategy</h1>
          <p className="page-subtitle">Procurement posture and contract recommendations</p>
        </div>

        {/* Market Posture */}
        <Card className="card-elevated" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-ghost)', marginBottom: '1rem' }}>
            Market Posture
          </h2>
          {posture ? (
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: postureColor, marginBottom: '0.75rem' }}>
                {posture.posture}
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {posture.rationale}
              </p>
              <p style={{ color: 'var(--text-ghost)', fontSize: '0.75rem', marginTop: '1rem' }}>
                Updated {new Date(posture.updatedAt).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p style={{ color: 'var(--text-ghost)' }}>Awaiting strategy data</p>
          )}
        </Card>

        {/* Contract Impact Calculator */}
        <Card className="card-elevated" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-ghost)', marginBottom: '1rem' }}>
            Contract Impact Calculator
          </h2>
          <p style={{ color: 'var(--text-ghost)' }}>Awaiting forecast and pricing data</p>
        </Card>

        {/* Factor Waterfall */}
        <Card className="card-elevated" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-ghost)', marginBottom: '1rem' }}>
            Factor Waterfall
          </h2>
          <p style={{ color: 'var(--text-ghost)' }}>Awaiting driver attribution data</p>
        </Card>

        {/* Risk Metrics */}
        <Card className="card-elevated">
          <h2 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-ghost)', marginBottom: '1rem' }}>
            Risk Metrics
          </h2>
          <p style={{ color: 'var(--text-ghost)' }}>Awaiting risk calculation data</p>
        </Card>
      </div>
    </main>
  )
}
