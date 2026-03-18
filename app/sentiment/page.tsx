import Link from "next/link";

export default function SentimentPage() {
  return (
    <main className="min-h-screen bg-stone-950 px-6 py-10 text-stone-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Sentiment</p>
        <h1 className="text-3xl font-semibold">News and Positioning</h1>
        <p className="text-stone-300">
          Scaffold page for sentiment feed and CoT context from `alt.news_events` and `mkt.cftc_1w`.
        </p>
        <Link href="/dashboard" className="text-sm text-amber-300 hover:text-amber-200">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
