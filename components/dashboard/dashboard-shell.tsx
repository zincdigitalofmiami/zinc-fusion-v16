import Link from "next/link";

import { Card } from "@/components/ui/card";

const cards = [
  {
    title: "Target Zones",
    body: "P30/P50/P70 levels will render from forecasts.target_zones after pipeline activation.",
  },
  {
    title: "Regime",
    body: "Regime state and confidence flow from analytics.regime_state_1d.",
  },
  {
    title: "Top Drivers",
    body: "Top 4 attribution factors will be sourced from analytics.driver_attribution_1d.",
  },
  {
    title: "Live Price",
    body: "Latest ZL contract value will be served from mkt.latest_price.",
  },
];

export function DashboardShell() {
  return (
    <main className="min-h-screen bg-stone-950 text-stone-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Dashboard</p>
            <h1 className="text-3xl font-semibold">ZL Futures Intelligence</h1>
          </div>
          <nav className="flex gap-4 text-sm text-stone-300">
            <Link href="/strategy" className="hover:text-stone-100">
              Strategy
            </Link>
            <Link href="/legislation" className="hover:text-stone-100">
              Legislation
            </Link>
            <Link href="/sentiment" className="hover:text-stone-100">
              Sentiment
            </Link>
            <Link href="/vegas-intel" className="hover:text-stone-100">
              Vegas Intel
            </Link>
          </nav>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <Card key={card.title} className="border-stone-800 bg-stone-900 p-5">
              <h2 className="text-lg font-semibold text-amber-200">{card.title}</h2>
              <p className="mt-2 text-sm text-stone-300">{card.body}</p>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
