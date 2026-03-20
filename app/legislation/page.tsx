'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface LegislationItem {
  source: string
  title: string
  publishedAt: string
  tags: string[]
}

export default function LegislationPage() {
  const [items, setItems] = useState<LegislationItem[]>([])
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetch('/api/legislation/feed')
      .then(r => r.json())
      .then(res => { if (res.data) setItems(res.data) })
      .catch(() => {})
  }, [])

  const sources = ['all', ...new Set(items.map(i => i.source))]
  const filtered = filter === 'all' ? items : items.filter(i => i.source === filter)

  return (
    <main className="main-content">
      <div className="page-wrapper">
        <div className="page-header">
          <h1 className="page-title">Legislation</h1>
          <p className="page-subtitle">Federal regulations, executive actions, and congressional activity affecting soy oil and biofuel markets</p>
        </div>

        {/* Source Filter */}
        {sources.length > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {sources.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`range-btn ${filter === s ? 'active' : ''}`}
              >
                {s === 'all' ? 'All Sources' : s}
              </button>
            ))}
          </div>
        )}

        {/* Feed */}
        {filtered.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map((item, i) => (
              <Card key={i} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.5rem' }}>
                      {item.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {item.tags.map(tag => (
                        <Badge key={tag} variant="secondary" style={{ fontSize: '0.625rem' }}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ color: 'var(--text-ghost)', fontSize: '0.75rem' }}>{item.source}</div>
                    <div style={{ color: 'var(--text-ghost)', fontSize: '0.75rem' }}>
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="card-elevated" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-ghost)' }}>Awaiting legislation data</p>
          </Card>
        )}
      </div>
    </main>
  )
}
