'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SentimentOverview {
  headlineCount: number
  sentimentScore: number
  cotBias: string
  updatedAt: string
}

interface NewsItem {
  title: string
  source: string
  publishedAt: string
  sentimentLabel: string
  tags: string[]
}

export default function SentimentPage() {
  const [overview, setOverview] = useState<SentimentOverview | null>(null)
  const [news, setNews] = useState<NewsItem[]>([])

  useEffect(() => {
    fetch('/api/sentiment/overview')
      .then(r => r.json())
      .then(res => {
        if (res.data) {
          setOverview(res.data.overview ?? res.data)
          setNews(res.data.news ?? [])
        }
      })
      .catch(() => {})
  }, [])

  const sentimentColor = (label: string) => {
    if (label === 'bullish') return 'var(--signal-positive)'
    if (label === 'bearish') return 'var(--signal-negative)'
    return 'var(--signal-neutral)'
  }

  return (
    <main className="main-content">
      <div className="page-wrapper">
        <div className="page-header">
          <h1 className="page-title">Sentiment</h1>
          <p className="page-subtitle">Market narrative, news sentiment, and CFTC positioning</p>
        </div>

        {/* Row 1: Overview Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <Card className="card-elevated" style={{ padding: '1.25rem' }}>
            <div style={{ color: 'var(--text-ghost)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Headlines</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {overview ? overview.headlineCount : '—'}
            </div>
          </Card>
          <Card className="card-elevated" style={{ padding: '1.25rem' }}>
            <div style={{ color: 'var(--text-ghost)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sentiment Score</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: overview ? sentimentColor(overview.sentimentScore > 0 ? 'bullish' : overview.sentimentScore < 0 ? 'bearish' : 'neutral') : 'var(--text-ghost)', marginTop: '0.25rem' }}>
              {overview ? overview.sentimentScore.toFixed(2) : '—'}
            </div>
          </Card>
          <Card className="card-elevated" style={{ padding: '1.25rem' }}>
            <div style={{ color: 'var(--text-ghost)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>CoT Bias</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {overview ? overview.cotBias : '—'}
            </div>
          </Card>
        </div>

        {/* Row 2: News Feed */}
        <Card className="card-elevated" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-ghost)', marginBottom: '1rem', padding: '1rem 1rem 0' }}>
            News Feed
          </h2>
          {news.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {news.map((item, i) => (
                <div key={i} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.875rem' }}>{item.title}</div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--text-ghost)', fontSize: '0.75rem' }}>{item.source}</span>
                      {item.tags.map(tag => (
                        <Badge key={tag} variant="secondary" style={{ fontSize: '0.575rem' }}>{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div style={{ color: sentimentColor(item.sentimentLabel), fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    {item.sentimentLabel}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-ghost)', padding: '2rem', textAlign: 'center' }}>Awaiting news data</p>
          )}
        </Card>

        {/* Row 3: CoT Positioning */}
        <Card className="card-elevated">
          <h2 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-ghost)', marginBottom: '1rem', padding: '1rem 1rem 0' }}>
            CFTC Commitments of Traders
          </h2>
          <p style={{ color: 'var(--text-ghost)', padding: '2rem', textAlign: 'center' }}>Awaiting CFTC positioning data</p>
        </Card>
      </div>
    </main>
  )
}
