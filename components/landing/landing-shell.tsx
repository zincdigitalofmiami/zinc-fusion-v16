import Link from "next/link";

export function LandingShell() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-stone-100">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-20 md:py-28">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-300">ZINC Fusion V16</p>
        <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
          Soybean Oil Procurement Intelligence for Cost-Sensitive Buying Decisions
        </h1>
        <p className="max-w-3xl text-base text-stone-300 md:text-lg">
          Target Zones, regime context, and specialist attribution built on a fail-closed data and model pipeline.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/dashboard"
            className="rounded-md bg-amber-300 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-200"
          >
            Open Dashboard
          </Link>
          <Link
            href="/strategy"
            className="rounded-md border border-stone-600 px-5 py-3 text-sm font-semibold text-stone-100 transition hover:border-stone-400"
          >
            View Strategy
          </Link>
        </div>
      </section>
    </main>
  );
}
