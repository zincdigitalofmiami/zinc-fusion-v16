'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'

interface VegasEvent {
  name: string
  venue: string
  startDate: string
  endDate: string
  estimatedAttendees: number
  oilDemandImpact: string
}

interface VegasIntelData {
  activeEvents: number
  highPriorityAccounts: number
  events: VegasEvent[]
  updatedAt: string
}

export default function VegasIntelPage() {
  const [intel, setIntel] = useState<VegasIntelData | null>(null)

  useEffect(() => {
    fetch('/api/vegas/intel')
      .then(r => r.json())
      .then(res => { if (res.data) setIntel(res.data) })
      .catch(() => {})
  }, [])

  return (
    <main className="main-content">
      <div className="page-wrapper">
        <div className="page-header">
          <h1 className="page-title">Vegas Intel</h1>
          <p className="page-subtitle">Sales strategy, event intelligence, and account recommendations for Las Vegas restaurant operations</p>
        </div>

        {/* Overview Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <Card className="card-elevated" style={{ padding: '1.25rem' }}>
            <div style={{ color: 'var(--text-ghost)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Active Events</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {intel ? intel.activeEvents : '—'}
            </div>
          </Card>
          <Card className="card-elevated" style={{ padding: '1.25rem' }}>
            <div style={{ color: 'var(--text-ghost)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>High Priority Accounts</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {intel ? intel.highPriorityAccounts : '—'}
            </div>
          </Card>
        </div>

        {/* Events Calendar */}
        <Card className="card-elevated" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-ghost)', marginBottom: '1rem', padding: '1rem 1rem 0' }}>
            Upcoming Events
          </h2>
          {intel?.events && intel.events.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {intel.events.map((event, i) => (
                <div key={i} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{event.name}</div>
                    <div style={{ color: 'var(--text-ghost)', fontSize: '0.75rem' }}>{event.venue}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {new Date(event.startDate).toLocaleDateString()} – {new Date(event.endDate).toLocaleDateString()}
                    </div>
                    <div style={{ color: 'var(--signal-warning)', fontSize: '0.75rem' }}>
                      Impact: {event.oilDemandImpact}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-ghost)', padding: '2rem', textAlign: 'center' }}>Awaiting event data</p>
          )}
        </Card>

        {/* AI Sales Strategy */}
        <Card className="card-elevated" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-ghost)', marginBottom: '1rem', padding: '1rem 1rem 0' }}>
            AI Sales Strategy
          </h2>
          <p style={{ color: 'var(--text-ghost)', padding: '2rem', textAlign: 'center' }}>
            Awaiting customer and event data from Glide API
          </p>
        </Card>

        {/* Restaurant Accounts */}
        <Card className="card-elevated" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-ghost)', marginBottom: '1rem', padding: '1rem 1rem 0' }}>
            Restaurant Accounts
          </h2>
          <p style={{ color: 'var(--text-ghost)', padding: '2rem', textAlign: 'center' }}>
            Awaiting restaurant data from Glide API
          </p>
        </Card>

        {/* Fryer Tracking */}
        <Card className="card-elevated">
          <h2 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-ghost)', marginBottom: '1rem', padding: '1rem 1rem 0' }}>
            Fryer Equipment Tracking
          </h2>
          <p style={{ color: 'var(--text-ghost)', padding: '2rem', textAlign: 'center' }}>
            Awaiting equipment lifecycle data
          </p>
        </Card>
      </div>
    </main>
  )
}
