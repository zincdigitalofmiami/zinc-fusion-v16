import Link from "next/link";

export default function LegislationPage() {
  return (
    <main className="min-h-screen bg-stone-950 px-6 py-10 text-stone-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Legislation</p>
        <h1 className="text-3xl font-semibold">Policy and Regulatory Feed</h1>
        <p className="text-stone-300">
          Scaffold page for `alt.legislation_1d`, `alt.executive_actions`, and `alt.congress_bills`.
        </p>
        <Link href="/dashboard" className="text-sm text-amber-300 hover:text-amber-200">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
